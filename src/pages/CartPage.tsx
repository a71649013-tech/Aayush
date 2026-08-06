import React, { useState, Component } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard, Truck, ShoppingCart, MapPin, CheckCircle2, Ticket } from 'lucide-react';
import { CartItem, UserVoucher } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { orderService } from '../services/orderService';
import { EsewaPayment } from '../components/EsewaPayment';
import { gemService } from '../services/gemService';
import { APIProvider, Map as GoogleMapComponent, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

import { NEPAL_CITIES, CITY_COORDINATES } from '../constants';

const GOOGLE_MAPS_KEY = (process.env.GOOGLE_MAPS_PLATFORM_KEY || '').trim();
const isValidGoogleMapsKeyFormat = (key: string) => {
  if (!key || key === 'YOUR_API_KEY' || key.length < 30) return false;
  // Valid Google Maps API keys start with AIzaSy
  return /^AIzaSy[A-Za-z0-9_-]{33,}$/.test(key);
};
const hasGoogleMapsKey = isValidGoogleMapsKeyFormat(GOOGLE_MAPS_KEY);

if (typeof window !== 'undefined') {
  const existingGmAuthFailure = (window as any).gm_authFailure;
  (window as any).gm_authFailure = () => {
    console.warn("Google Maps auth failure detected. Switching to embedded Google Maps.");
    (window as any).__googleMapsAuthFailed = true;
    if (typeof existingGmAuthFailure === 'function') {
      existingGmAuthFailure();
    }
  };
}

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Google Maps JS API error caught by boundary:", error);
    (this as any).props?.onError();
  }

  render() {
    if ((this as any).state?.hasError) {
      return null;
    }
    return (this as any).props?.children;
  }
}

const NEPAL_LANDMARKS_PRESETS = [
  { name: 'Ghantaghar Clock Tower', city: 'Birgunj', area: 'Ghantaghar Chowk', details: 'Ghantaghar Clock Tower Center, Main Rd, Birgunj', lat: 27.0094, lng: 84.8778 },
  { name: 'Adarshnagar Market', city: 'Birgunj', area: 'Adarshnagar', details: 'Adarshnagar Commercial Market Hub, Birgunj', lat: 27.0075, lng: 84.8752 },
  { name: 'Dry Port Custom Gate', city: 'Birgunj', area: 'Custom Chowk', details: 'Birgunj Custom Gate near ICP Border, Birgunj', lat: 27.0033, lng: 84.8691 },
  { name: 'Powerhouse Chowk', city: 'Birgunj', area: 'Powerhouse', details: 'Powerhouse Chowk Expressway, Birgunj', lat: 27.0250, lng: 84.8820 },
  { name: 'Maitighar Mandala', city: 'Kathmandu', area: 'Maitighar', details: 'Mandala Circle, Central Expressway Rd', lat: 27.6915, lng: 85.3201 },
  { name: 'Lakeside Pokhara', city: 'Pokhara', area: 'Lakeside', details: 'Barahi Path Compound, Lakeside Sector 6', lat: 28.2096, lng: 83.9587 },
  { name: 'Patan Durbar Square', city: 'Lalitpur', area: 'Mangal Bazaar', details: 'Historical Durbar Square, Patan Heritage lane', lat: 27.6727, lng: 85.3252 }
];

export default function CartPage({ cart, onRemove, onUpdateQuantity }: { 
  cart: CartItem[], 
  onRemove: (id: string) => void,
  onUpdateQuantity: (id: string, qty: number) => void
}) {
  const { user } = useFirebase();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'esewa'>('cod');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showEsewaFlow, setShowEsewaFlow] = useState(false);
  const [mapApiFailed, setMapApiFailed] = useState(() => Boolean((window as any).__googleMapsAuthFailed));
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);

    const onPositionSuccess = async (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      let fetchedArea = address.area;
      let fetchedDetails = `Live GPS Pin (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
      let detectedCity = address.city;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.amenity || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || address.city;
            if (road) fetchedArea = road;
            if (data.display_name) fetchedDetails = data.display_name.split(',').slice(0, 3).join(', ');
            if (city) detectedCity = city;
          }
        }
      } catch (err) {
        console.warn("Reverse geocoding notice:", err);
      }

      setAddress(prev => ({
        ...prev,
        city: detectedCity,
        latitude: lat,
        longitude: lng,
        hasPinned: true,
        area: fetchedArea || prev.area || `${detectedCity} Location`,
        details: fetchedDetails
      }));

      setIsLocating(false);
    };

    const fallbackToCityCenter = () => {
      setIsLocating(false);
      const cityCoords = CITY_COORDINATES[address.city] || CITY_COORDINATES['Birgunj'];
      setAddress(prev => ({
        ...prev,
        latitude: cityCoords.lat,
        longitude: cityCoords.lng,
        hasPinned: true,
        details: prev.details || `Center of ${prev.city} (${cityCoords.defaultArea})`
      }));
    };

    navigator.geolocation.getCurrentPosition(
      onPositionSuccess,
      fallbackToCityCenter,
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 }
    );
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const checkAuth = () => {
      if ((window as any).__googleMapsAuthFailed) {
        setMapApiFailed(true);
      }
    };
    checkAuth();
    const interval = setInterval(checkAuth, 300);
    return () => clearInterval(interval);
  }, []);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    city: 'Birgunj',
    area: 'Ghantaghar Chowk',
    details: 'Near Ghantaghar Clock Tower, Main Road, Birgunj',
    latitude: 27.0094,
    longitude: 84.8778,
    hasPinned: true
  });

  // Voucher states
  const [appliedVoucher, setAppliedVoucher] = useState<UserVoucher | null>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const baseShipping = subtotal > 15000 ? 0 : 150;

  // Determine dynamic discount totals
  let discountAmount = 0;
  let finalShipping = baseShipping;

  if (appliedVoucher) {
    if (appliedVoucher.type === 'amount') {
      discountAmount = Math.min(subtotal, appliedVoucher.discount);
    } else if (appliedVoucher.type === 'percentage') {
      discountAmount = Math.round(subtotal * (appliedVoucher.discount / 100));
    } else if (appliedVoucher.type === 'shipping') {
      discountAmount = baseShipping;
      finalShipping = 0;
    }
  }

  const total = Math.max(0, subtotal + finalShipping - discountAmount);

  const isAddressValid = address.fullName && address.phone && address.area && address.details;

  const getMyVouchers = (): UserVoucher[] => {
    if (user?.id && user.id !== 'pin-admin') {
      return user.vouchers || [];
    }
    return gemService.getGuestState().vouchers || [];
  };

  const unusedVouchers = getMyVouchers().filter(v => !v.isUsed);

  const handleApplyVoucher = (v: UserVoucher) => {
    setVoucherError(null);
    setVoucherSuccessMsg(null);
    
    if (v.isUsed) {
      setVoucherError('This voucher has already been redeemed.');
      return;
    }
    if (subtotal < v.minSpent) {
      setVoucherError(`Minimum Purchase of ${formatCurrency(v.minSpent)} required to use this voucher.`);
      return;
    }
    if (v.category) {
      const hasCat = cart.some(item => item.category === v.category);
      if (!hasCat) {
        setVoucherError(`This voucher on category "${v.category}" requires at least one matching item in your bag.`);
        return;
      }
    }

    setAppliedVoucher(v);
    setVoucherSuccessMsg(`Voucher "${v.code}" applied successfully!`);
  };

  const handleApplyCodeManual = () => {
    setVoucherError(null);
    setVoucherSuccessMsg(null);
    
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) {
      setVoucherError('Please specify a voucher code.');
      return;
    }
    
    const found = getMyVouchers().find(v => v.code.toUpperCase() === code);
    if (!found) {
      setVoucherError('Voucher code not found in your portfolio.');
      return;
    }

    handleApplyVoucher(found);
  };

  const handleCheckout = async () => {
    if (!isAddressValid) return;
    setCheckoutError(null);

    if (paymentMethod === 'esewa') {
      setShowEsewaFlow(true);
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Build order with voucher deduction
        await orderService.createOrder({
          customerId: user?.id || 'guest',
          customerName: address.fullName,
          items: cart,
          total,
          status: 'pending',
          method: paymentMethod.toUpperCase(),
          address
        });
        
        // Consume applied voucher from user portfolio
        if (appliedVoucher) {
          await gemService.useVoucherOffline(appliedVoucher.code, user?.id);
        }

        setIsProcessing(false);
        setIsCheckingOut(true);
      } catch (err) {
        setIsProcessing(false);
        setCheckoutError('Transaction failed at gateway. Please try again.');
      }
    }, 2500);
  };

  if (isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-daraz-orange border-t-transparent rounded-full mb-8"
        />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Processing Transaction</h2>
        <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-2">Connecting to Secure Payment Gateway...</p>
      </div>
    );
  }

  if (isCheckingOut) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-green-50 rounded-full mb-8 border-4 border-green-100"
        >
          <ShoppingCart size={64} className="text-green-600" />
        </motion.div>
        <h2 className="text-4xl font-black tracking-tighter text-neutral-900 mb-4 uppercase italic">Order Received!</h2>
        
        <div className="bg-white border border-neutral-200 p-6 rounded-sm mb-8 w-full text-left">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Delivery Summary</h3>
           <p className="text-sm font-bold text-neutral-800 uppercase italic mb-1">{address.fullName}</p>
           <p className="text-xs text-neutral-600">{address.phone}</p>
           <p className="text-xs text-neutral-600 mt-2">{address.details}, {address.area}</p>
           <p className="text-xs text-neutral-600">{address.city}, Nepal</p>
        </div>
        
        {paymentMethod === 'cod' && (
          <div className="bg-neutral-100 border border-neutral-200 p-8 rounded-3xl mb-10 w-full">
            <p className="text-neutral-700 italic">Our delivery partner will collect <span className="font-black">{formatCurrency(total)}</span> at your doorstep.</p>
          </div>
        )}

        <Link 
          to="/" 
          onClick={() => window.location.reload()}
          className="bg-neutral-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all shadow-2xl"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 bg-neutral-100 rounded-full mb-8">
          <ShoppingBag size={64} className="text-neutral-300" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-neutral-900 mb-4 uppercase italic">Your bag is empty</h2>
        <p className="text-neutral-500 mb-10 max-w-sm font-light">Explore our curated collection of Himalayan treasures and modern tech essentials.</p>
        <Link 
          to="/" 
          className="bg-neutral-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all shadow-2xl"
        >
          Start Exploring
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase italic">Delivery Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-neutral-100 rounded-3xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                <img src={item.image || null} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-neutral-900 tracking-tighter uppercase leading-none italic">{item.name}</h3>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 bg-neutral-50 px-2 py-0.5 rounded w-fit">
                    {item.category}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-6 sm:mt-0">
                  <div className="flex items-center gap-4 bg-neutral-100 rounded-full px-4 py-2 border border-neutral-200">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-2xl font-black text-neutral-950 tracking-tighter italic">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1 border-l border-neutral-100 pl-0 lg:pl-12">
          <div className="bg-white rounded-sm p-0 md:sticky md:top-28">
            {/* Delivery Address Section */}
            <div className="mb-8 border-b border-neutral-100 pb-8">
              <h2 className="text-xs font-black tracking-widest text-neutral-400 mb-6 uppercase flex items-center gap-2 italic">
                <MapPin size={14} className="text-daraz-orange" /> Shipping Information
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Receiver Name" 
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-daraz-orange rounded-sm font-medium"
                  value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})}
                />
                <input 
                  type="tel" placeholder="Mobile Number (+977)" 
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-daraz-orange rounded-sm font-medium"
                  value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="w-full text-[11px] p-3 bg-neutral-50 border border-neutral-200 outline-none rounded-sm font-bold uppercase"
                    value={address.city} 
                    onChange={e => {
                      const newCity = e.target.value;
                      const cityCoords = CITY_COORDINATES[newCity] || { lat: 27.0094, lng: 84.8778, defaultArea: newCity };
                      setAddress(prev => ({
                        ...prev,
                        city: newCity,
                        area: cityCoords.defaultArea,
                        latitude: cityCoords.lat,
                        longitude: cityCoords.lng,
                        hasPinned: true,
                        details: `Near ${cityCoords.defaultArea}, ${newCity}`
                      }));
                    }}
                  >
                    {NEPAL_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <input 
                    type="text" placeholder="Area (e.g. Balaju)" 
                    className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-daraz-orange rounded-sm font-medium"
                    value={address.area} onChange={e => setAddress({...address, area: e.target.value})}
                  />
                </div>
                <textarea 
                  placeholder="Street, House Number, Landmarks..." 
                  className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-daraz-orange rounded-sm font-medium h-20 resize-none"
                  value={address.details} onChange={e => setAddress({...address, details: e.target.value})}
                />

                {/* INTERACTIVE GEOLOCATION MAP CONTAINER */}
                <div className="mt-4 border border-neutral-150 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-150 flex justify-between items-center bg-neutral-50/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-neutral-800 uppercase tracking-tight flex items-center gap-1">
                        📍 Select on Map
                      </span>
                    </div>
                    {/* Live GPS Locator Button */}
                    <button
                      type="button"
                      disabled={isLocating}
                      onClick={handleLocateMe}
                      className="bg-daraz-orange text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLocating ? (
                        <>
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Locating...
                        </>
                      ) : (
                        <>📡 Locate Me</>
                      )}
                    </button>
                  </div>

                  {/* actual Map rendering */}
                  {hasGoogleMapsKey && !mapApiFailed ? (
                    <div className="h-48 w-full relative rounded-lg overflow-hidden border border-neutral-200">
                      <MapErrorBoundary onError={() => setMapApiFailed(true)}>
                        <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                          <GoogleMapComponent
                            defaultCenter={{ lat: address.latitude, lng: address.longitude }}
                            center={{ lat: address.latitude, lng: address.longitude }}
                            zoom={14}
                            mapId="DEMO_MAP_ID"
                            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                            style={{ width: '100%', height: '100%' }}
                            onClick={(e) => {
                              if (e.detail && e.detail.latLng) {
                                const lat = e.detail.latLng.lat;
                                const lng = e.detail.latLng.lng;
                                setAddress(prev => ({
                                  ...prev,
                                  latitude: lat,
                                  longitude: lng,
                                  hasPinned: true,
                                  details: `${prev.details || 'Marker Placed'} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                                }));
                              }
                            }}
                          >
                            <AdvancedMarker 
                              position={{ lat: address.latitude, lng: address.longitude }}
                              gmpDraggable={true}
                              onDragEnd={(e) => {
                                if (e.latLng) {
                                  const lat = e.latLng.lat();
                                  const lng = e.latLng.lng();
                                  setAddress(prev => ({
                                    ...prev,
                                    latitude: lat,
                                    longitude: lng,
                                    hasPinned: true
                                  }));
                                }
                              }}
                            >
                              <Pin background="#f05625" glyphColor="#fff" borderColor="#ff4646" />
                            </AdvancedMarker>
                          </GoogleMapComponent>
                        </APIProvider>
                      </MapErrorBoundary>
                    </div>
                  ) : (
                    /* Real Interactive Embedded Google Map View */
                    <div className="bg-neutral-100 relative h-52 w-full overflow-hidden text-neutral-800 rounded-lg border border-neutral-200 shadow-inner">
                      {/* Real Google Maps embed iframe */}
                      <iframe
                        title="Kathmandu Delivery Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${address.latitude},${address.longitude}&z=15&output=embed`}
                        className="absolute inset-0 w-full h-full"
                      />

                      {/* Floating Key Setup Banner */}
                      <div className="absolute top-2 left-2 right-2 bg-neutral-900/90 backdrop-blur-xs text-white p-2 rounded-md shadow-md border border-neutral-700/80 flex items-center justify-between gap-2 z-20">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-sm">🗺️</span>
                          <div>
                            <p className="font-bold text-white leading-tight">Real Google Maps (Embed View)</p>
                            <p className="text-[9px] text-neutral-300">For JS Marker Dragging, add <code className="text-amber-400 bg-neutral-800 px-1 py-0.2 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> in Secrets.</p>
                          </div>
                        </div>
                      </div>

                      {/* Map Pins overlay indicator */}
                      <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2 py-1 rounded border border-neutral-300 text-[10px] font-bold text-neutral-800 shadow-sm flex items-center gap-1.5">
                        <span className="text-daraz-orange">📍</span> GPS: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  <div className="bg-neutral-950 p-2 text-left border-t border-neutral-800/60 font-mono text-[7.5px] text-neutral-400">
                    <span className="text-daraz-orange font-bold uppercase block tracking-wider">🎯 Address Locator:</span>
                    <span className="leading-tight block mt-0.5">
                      Click preset landmarks above or tap anywhere on the radar zone to place your delivery drop-off pin immediately! It will auto-populate your coordinates state so driver routing boy can locate you.
                    </span>
                  </div>
                </div>

                {/* Popular Landmark Shortcuts Quick Pick */}
                <div className="space-y-1.5 p-2 bg-neutral-50/50 rounded-lg border border-neutral-150">
                  <p className="text-[8px] font-black text-neutral-450 uppercase tracking-widest text-left">
                     Popular Landmarks Quick Pick:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {NEPAL_LANDMARKS_PRESETS.map((landmark) => (
                      <button
                        key={landmark.name}
                        type="button"
                        onClick={() => {
                          setAddress(prev => ({
                            ...prev,
                            city: landmark.city,
                            area: landmark.area,
                            details: landmark.details,
                            latitude: landmark.lat,
                            longitude: landmark.lng,
                            hasPinned: true
                          }));
                        }}
                        className={cn(
                          "text-[8px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer",
                          address.area === landmark.area
                            ? "bg-daraz-orange/10 border-daraz-orange text-daraz-orange font-extrabold"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        )}
                      >
                        🏔️ {landmark.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vouchers and Promos Segment */}
            <div className="mb-8 border-b border-neutral-100 pb-8">
              <h2 className="text-xs font-black tracking-widest text-neutral-400 mb-6 uppercase flex items-center gap-2 italic">
                <Ticket size={14} className="text-daraz-orange" /> Vouchers & Promos
              </h2>

              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="PROMO CODE (e.g. GEM50)" 
                  className="flex-1 text-xs p-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-daraz-orange rounded-sm font-bold uppercase tracking-wider"
                  value={voucherCodeInput}
                  onChange={e => setVoucherCodeInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCodeManual}
                  className="bg-neutral-900 text-white text-xs font-black uppercase px-6 rounded-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>

              {voucherError && (
                <p className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider mb-4">
                  ⚠️ {voucherError}
                </p>
              )}

              {voucherSuccessMsg && (
                <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-wider mb-4">
                  ✓ {voucherSuccessMsg}
                </p>
              )}

              {unusedVouchers.length > 0 ? (
                <div className="space-y-2 mt-4">
                  <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-1">
                    Redeemed Vouchers (Click to apply):
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {unusedVouchers.map((v) => {
                      const isSelected = appliedVoucher?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleApplyVoucher(v)}
                          className={cn(
                            "w-full text-left p-3 rounded-sm border transition-all flex justify-between items-center bg-white",
                            isSelected 
                              ? "bg-daraz-orange/10 border-daraz-orange text-daraz-orange" 
                              : "border-neutral-200 text-neutral-805 hover:border-daraz-orange/30"
                          )}
                        >
                          <div>
                            <span className="text-xs font-bold font-mono tracking-wider block">
                              {v.code}
                            </span>
                            <span className="text-[9px] text-neutral-450 block font-semibold">
                              {v.title} (Min spend: {formatCurrency(v.minSpent)})
                            </span>
                          </div>
                          <span className="text-xs font-black uppercase italic shrink-0">
                            {v.discount}{v.type === 'percentage' ? '%' : ' Rs'} OFF
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 p-4 rounded-sm border border-neutral-100 text-center">
                  <p className="text-[9px] text-neutral-400 font-black uppercase tracking-wider leading-relaxed">
                    No active vouchers. Visit the <Link to="/vouchers" className="text-daraz-orange font-black underline decoration-2 decoration-daraz-orange/40">Gems Hub</Link> to secure some!
                  </p>
                </div>
              )}

              {appliedVoucher && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-sm flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-green-600 font-black uppercase tracking-widest block">
                      Applied Discount
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-tight text-neutral-800">
                      {appliedVoucher.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherSuccessMsg(null);
                    }}
                    className="text-[10px] font-black uppercase text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase italic underline decoration-daraz-orange decoration-4 underline-offset-8">Order Summary</h2>
            
            <div className="mb-8 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Select Payment Method</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-sm border transition-all text-xs font-bold uppercase tracking-widest",
                    paymentMethod === 'cod' ? "bg-daraz-orange border-daraz-orange text-white" : "bg-white border-neutral-100 text-neutral-400 hover:border-daraz-orange"
                  )}
                >
                  <div className="flex items-center gap-3">
                     <Truck size={14} />
                     <span>Cash on Delivery</span>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 size={14} className="text-white" />}
                </button>

                <button 
                  onClick={() => setPaymentMethod('esewa')}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-sm border transition-all text-xs font-bold uppercase tracking-widest",
                    paymentMethod === 'esewa' ? "bg-[#60bb46] border-[#60bb46] text-white" : "bg-white border-neutral-100 text-[#60bb46] hover:border-[#60bb46]"
                  )}
                >
                  <div className="flex items-center gap-3">
                     <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-black italic",
                        paymentMethod === 'esewa' ? "bg-white text-[#60bb46]" : "bg-[#60bb46] text-white"
                     )}>e</div>
                     <span>eSewa Mobile Wallet</span>
                  </div>
                  {paymentMethod === 'esewa' && <CheckCircle2 size={14} className="text-white" />}
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-neutral-400 font-medium">
                <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="text-neutral-800 tracking-tighter text-lg">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-extrabold bg-green-50/50 p-2 rounded-sm border border-green-100">
                  <span className="uppercase tracking-widest text-[10px]">Voucher Discount</span>
                  <span className="tracking-tighter text-lg">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400 font-medium">
                <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                <span className="text-neutral-800 tracking-tighter text-lg">{finalShipping === 0 ? "FREE" : formatCurrency(finalShipping)}</span>
              </div>
              <div className="h-px bg-neutral-100 my-6"></div>
              <div className="flex justify-between items-baseline">
                <span className="uppercase tracking-[0.2em] text-xs font-black">Total Estimate</span>
                <span className="text-4xl font-black tracking-tighter text-daraz-orange italic underline-none">{formatCurrency(total)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!isAddressValid}
              className={cn(
                "w-full py-6 rounded-sm font-black uppercase tracking-[0.3em] text-sm transition-all shadow-xl flex items-center justify-center gap-3 group",
                isAddressValid 
                ? "bg-daraz-orange text-white hover:opacity-90"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              )}
            >
              Check Out 
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            {checkoutError && <p className="text-[10px] text-red-500 font-black uppercase text-center mt-3 tracking-widest">{checkoutError}</p>}
            {!isAddressValid && <p className="text-[9px] text-red-400 font-black uppercase text-center mt-3 tracking-widest italic">Please set delivery address to proceed</p>}
            <p className="mt-8 text-[10px] text-neutral-400 text-center uppercase tracking-widest font-bold">
              Secure Checkout • Global Support +977 982-8105337
            </p>
          </div>
        </div>
      </div>
    </div>
    
      <AnimatePresence>
        {showEsewaFlow && (
          <EsewaPayment 
            amount={total} 
            onCancel={() => setShowEsewaFlow(false)} 
            onSuccess={async () => {
              setShowEsewaFlow(false);
              setIsProcessing(true);
              try {
                await orderService.createOrder({
                  customerId: user?.id || 'guest',
                  customerName: address.fullName,
                  items: cart,
                  total,
                  status: 'paid', // Mark as paid for eSewa
                  method: 'ESEWA',
                  address
                });

                if (appliedVoucher) {
                  await gemService.useVoucherOffline(appliedVoucher.code, user?.id);
                }

                setIsProcessing(false);
                setIsCheckingOut(true);
              } catch (err) {
                setIsProcessing(false);
                setCheckoutError('Order creation failed after payment. Please contact support.');
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
