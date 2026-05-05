import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard, Truck, ShoppingCart, MapPin, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { orderService } from '../services/orderService';
import { EsewaPayment } from '../components/EsewaPayment';

import { NEPAL_CITIES } from '../constants';

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
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    city: 'Kathmandu',
    area: '',
    details: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 15000 ? 0 : 150;
  const total = subtotal + shipping;

  const isAddressValid = address.fullName && address.phone && address.area && address.details;

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
        await orderService.createOrder({
          customerId: user?.id || 'guest',
          customerName: address.fullName,
          items: cart,
          total,
          status: 'pending',
          method: paymentMethod.toUpperCase(),
          address
        });
        
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
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
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
              </div>
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
              <div className="flex justify-between text-neutral-400 font-medium">
                <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                <span className="text-neutral-800 tracking-tighter text-lg">{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
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
