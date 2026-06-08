import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Camera, 
  Settings, 
  LogOut, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Heart,
  Store,
  Ticket,
  Phone,
  ShieldCheck,
  Package,
  Wallet,
  MessageSquare,
  RotateCcw,
  Info,
  X,
  Sparkles,
  ShoppingBag,
  Trees,
  Candy,
  Trash2,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '../lib/firebase';
import { User, Order } from '../types';
import { orderService } from '../services/orderService';
import { useFirebase } from '../context/FirebaseContext';
import { cn } from '../lib/utils';

interface ProfilePageProps {
  user: User | null;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const navigate = useNavigate();
  const { unreadCount } = useFirebase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Custom states for interactive screenshot features
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGemsBooster, setShowGemsBooster] = useState(false);
  const [freebieClaimed, setFreebieClaimed] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState<'land' | 'candy' | null>(null);
  
  // Mini game state variables
  const [treeGrowth, setTreeGrowth] = useState<number>(35);
  const [candyScore, setCandyScore] = useState<number>(0);
  const [profileName, setProfileName] = useState(user?.name || 'Nepali Mart Valued Guest');
  const [profilePhone, setProfilePhone] = useState('+977 9812345678');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const unsubscribe = orderService.subscribeToUserOrders(user.id, (fetchedOrders) => {
      setOrders(fetchedOrders as Order[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Dynamically calculate matching order categories based on screenshot status bubbles
  const toPayOrders = orders.filter(o => o.status === 'pending');
  const toShipOrders = orders.filter(o => o.status === 'processing');
  const toReceiveOrders = orders.filter(o => o.status === 'shipped' || o.status === 'delayed');
  const toReviewOrders = orders.filter(o => o.status === 'delivered');
  const returnedOrders = orders.filter(o => o.status === 'cancelled');

  // Filter display orders matching select filter
  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'to-pay': return toPayOrders;
      case 'to-ship': return toShipOrders;
      case 'to-receive': return toReceiveOrders;
      case 'to-review': return toReviewOrders;
      case 'returns': return returnedOrders;
      default: return orders;
    }
  };

  const currentDisplayOrders = getFilteredOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'delayed': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-150';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={13} className="text-emerald-500" />;
      case 'shipped': return <Truck size={13} className="text-blue-500" />;
      case 'processing': return <Clock size={13} className="text-amber-500" />;
      case 'delayed': return <AlertCircle size={13} className="text-rose-500" />;
      default: return <Package size={13} className="text-neutral-500" />;
    }
  };

  return (
    <div id="account-dashboard-root" className="bg-[#f5f5f7] min-h-screen pb-36">
      {/* Pink/Slight peach soft top aesthetic background layer */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#ffebeb]/35 via-[#f9e9f0]/20 to-[#f5f5f7] pointer-events-none z-0" />

      {/* Main Container constrained perfectly for gorgeous Mobile Dashboard & Tablet Responsive grids */}
      <div className="max-w-md mx-auto relative px-4 pt-6 z-10 space-y-4">
        
        {/* Core Header Card EXACTLY replicated from the user's screenshot layout */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100/75 relative overflow-hidden">
          {/* Top-right corner edit settings gear icon */}
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-50 hover:bg-neutral-100 hover:text-daraz-orange transition-all cursor-pointer text-neutral-700"
            title="Account Management"
          >
            <Settings size={20} className="stroke-[2.25]" />
          </button>

          <div className="flex items-center gap-4">
            {/* Playful laughing-face Custom Avatar + Camera edit badge overlay */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-50/10 border-2 border-neutral-150 flex items-center justify-center bg-white shadow-1xs transition-transform group-hover:scale-105 overflow-hidden">
                {/* Simulated smiling emoji icon from image */}
                <span className="text-3xl select-none filter drop-shadow-xs">😄</span>
              </div>
              <div type="button" className="absolute bottom-[-2px] right-[-2px] bg-neutral-800 text-white p-1 rounded-full border-2 border-white shadow-xs cursor-pointer hover:bg-neutral-900 transition-colors">
                <Camera size={11} className="stroke-[2.5]" />
              </div>
            </div>

            {/* User Identification name or email splits */}
            <div className="text-left">
              <p className="mb-0.5 text-daraz-orange font-black text-[9px] tracking-widest uppercase">Loyal Member</p>
              <p className="text-lg font-black text-neutral-800 tracking-tight leading-none uppercase">
                {profileName}
              </p>
              <p className="text-[10px] text-neutral-400 font-bold mt-1 lowercase">{user.email}</p>
              
              {/* Stats line: WishList • Followed Stores • Vouchers */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] font-extrabold text-neutral-500 uppercase tracking-tight">
                <span className="hover:text-daraz-orange cursor-pointer">
                  <strong className="text-neutral-800 text-xs">0</strong> WishList
                </span>
                <span className="text-neutral-300">•</span>
                <span className="hover:text-daraz-orange cursor-pointer">
                  <strong className="text-neutral-800 text-xs text-center">1</strong> Followed Store
                </span>
                <span className="text-neutral-300">•</span>
                <span className="hover:text-daraz-orange cursor-pointer" onClick={() => navigate('/vouchers')}>
                  <strong className="text-neutral-800 text-xs">{user.vouchers?.length || 2}</strong> Vouchers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PLANT. GROW. WIN! GAMIFIED BANNER ROW SECTION */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-sm font-black text-neutral-900 tracking-tight uppercase">Plant. Grow. Win !</h3>
            <button 
              onClick={() => navigate('/vouchers')}
              className="text-xs font-black text-daraz-orange hover:underline uppercase tracking-wide flex items-center gap-0.5 cursor-pointer"
            >
              Grow here <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* TWO BENTO CARDS: GEMS COLLECT & FREEBIE */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Card A: Gems Collect (Purple Diamond Visual Accent) */}
            <div 
              onClick={() => navigate('/vouchers')}
              className="bg-white rounded-xl border border-neutral-100 p-3 flex flex-col justify-between relative overflow-hidden shadow-2xs hover:shadow-1xs transition-all hover:border-violet-100 cursor-pointer text-left"
            >
              {/* Gems banner header badge style */}
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-sm w-fit tracking-wide mb-1.5">
                <Sparkles size={9} className="fill-violet-500" />
                Nepali Mart Gems
              </div>

              <div className="flex items-center gap-2 my-2.5">
                {/* Group model of glowing purple diamonds/gems */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center text-white relative shrink-0 shadow-sm animate-pulse">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-60" />
                  <span className="text-2xl filter drop-shadow">💎</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-850 leading-tight">Enjoy <strong className="text-daraz-orange font-black">60% OFF</strong> with gems</p>
                </div>
              </div>

              <button className="w-full bg-[#f05625] hover:bg-[#e04515] text-white py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-center shadow-[0_2px_6px_rgba(240,86,37,0.15)] transition-all">
                Collect
              </button>
            </div>

            {/* Card B: Freebie Interactive Prize Chest */}
            <div 
              onClick={() => {
                if (!freebieClaimed) {
                  setShowGemsBooster(true);
                  setFreebieClaimed(true);
                }
              }}
              className="bg-white rounded-xl border border-neutral-100 p-3 flex flex-col justify-between relative overflow-hidden shadow-2xs hover:shadow-1xs transition-all hover:border-pink-100 cursor-pointer text-left"
            >
              {/* Freebie tag header */}
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-sm w-fit tracking-wide mb-1.5">
                <ShoppingBag size={9} />
                Nepali Mart Freebie
              </div>

              <div className="flex items-center gap-2 my-2">
                {/* Purple Free gift icon frame */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="text-xs font-black uppercase leading-none tracking-widest text-amber-200">FREE</span>
                  <span className="text-lg mt-0.5">🎁</span>
                </div>
                <div>
                  <p className="text-[10.5px] font-extrabold text-neutral-850 leading-tight">Invite & Win <span className="text-red-600 font-bold">iPhone 17 & Premium TV</span></p>
                </div>
              </div>

              <button className={cn(
                "w-full py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-xs",
                freebieClaimed ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:opacity-90"
              )}>
                {freebieClaimed ? 'Claimed' : 'Play Now'}
              </button>
            </div>

          </div>

          {/* Core horizontal launcher row slider under the plant-grow banner */}
          <div className="grid grid-cols-4 gap-2 bg-white rounded-xl p-3 border border-neutral-100 shadow-sm text-center">
            
            {/* Sub-applet A: Nepali Mart Land Game */}
            <button 
              onClick={() => setShowMiniGame('land')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-xs">
                <Trees size={18} className="fill-emerald-500/15" />
              </div>
              <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Nepali Land</span>
            </button>

            {/* Sub-applet B: Nepali Mart Candy Game */}
            <button 
              onClick={() => setShowMiniGame('candy')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600 group-hover:scale-105 transition-transform shadow-xs">
                <Candy size={18} className="fill-pink-500/15" />
              </div>
              <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Candy POP</span>
            </button>

            {/* Sub-applet C: BMSM */}
            <div 
              onClick={() => navigate('/')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#f05625]/10 flex items-center justify-center text-[#f05625] group-hover:scale-105 transition-transform shadow-xs font-black text-[9px]">
                BMSM
              </div>
              <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Gems Save</span>
            </div>

            {/* Sub-applet D: Voucher */}
            <div 
              onClick={() => navigate('/vouchers')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shadow-xs">
                <Ticket size={18} className="fill-amber-500/15" />
              </div>
              <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Voucher</span>
            </div>

          </div>
        </div>

        {/* "MY ORDERS" DYNAMIC LOGISTICS SELECTOR SECTION WITH REAL FIREBASE CONNECTIONS */}
        <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-neutral-850 uppercase tracking-tight">My Orders</h3>
            <button 
              onClick={() => setActiveFilter('all')}
              className="text-[10px] font-black text-neutral-400 hover:text-daraz-orange transition-colors uppercase tracking-tight flex items-center gap-0.5"
            >
              View All Orders ({orders.length}) <ChevronRight size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* Horizontal category bubbles identical to the uploaded screenshot */}
          <div className="grid grid-cols-5 gap-1 pt-1 text-center">
            
            {/* to pay */}
            <button 
              onClick={() => {
                setActiveFilter(activeFilter === 'to-pay' ? 'all' : 'to-pay');
                setSelectedOrder(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all py-1 rounded",
                activeFilter === 'to-pay' ? "bg-daraz-orange/5 border border-daraz-orange/20" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative text-[#f05625] transition-transform group-hover:scale-105">
                <Wallet size={20} className="stroke-[2.25] fill-neutral-50/50" />
                {toPayOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#f05625] text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {toPayOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-neutral-600 tracking-tight leading-tight mt-1">To Pay</span>
            </button>

            {/* to ship */}
            <button 
              onClick={() => {
                setActiveFilter(activeFilter === 'to-ship' ? 'all' : 'to-ship');
                setSelectedOrder(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all py-1 rounded",
                activeFilter === 'to-ship' ? "bg-daraz-orange/5 border border-daraz-orange/20" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative text-[#f05625] transition-transform group-hover:scale-105">
                <Package size={20} className="stroke-[2.25]" />
                {toShipOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#f05625] text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {toShipOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-neutral-600 tracking-tight leading-tight mt-1">To Ship</span>
            </button>

            {/* to receive */}
            <button 
              onClick={() => {
                setActiveFilter(activeFilter === 'to-receive' ? 'all' : 'to-receive');
                setSelectedOrder(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all py-1 rounded",
                activeFilter === 'to-receive' ? "bg-daraz-orange/5 border border-daraz-orange/20" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative text-[#f05625] transition-transform group-hover:scale-105">
                <Truck size={20} className="stroke-[2.25]" />
                {toReceiveOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {toReceiveOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-neutral-600 tracking-tight leading-tight mt-1">To Receive</span>
            </button>

            {/* to review */}
            <button 
              onClick={() => {
                setActiveFilter(activeFilter === 'to-review' ? 'all' : 'to-review');
                setSelectedOrder(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all py-1 rounded",
                activeFilter === 'to-review' ? "bg-daraz-orange/5 border border-daraz-orange/20" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative text-[#f05625] transition-transform group-hover:scale-105">
                <MessageSquare size={20} className="stroke-[2.25]" />
                {toReviewOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {toReviewOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-neutral-600 tracking-tight leading-tight mt-1">To Review</span>
            </button>

            {/* Returns & Cancellations */}
            <button 
              onClick={() => {
                setActiveFilter(activeFilter === 'returns' ? 'all' : 'returns');
                setSelectedOrder(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all py-1 rounded",
                activeFilter === 'returns' ? "bg-daraz-orange/5 border border-daraz-orange/20" : "hover:bg-neutral-50"
              )}
            >
              <div className="relative text-[#f05625] transition-transform group-hover:scale-105">
                <RotateCcw size={20} className="stroke-[2.25]" />
                {returnedOrders.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-neutral-600 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full">
                    {returnedOrders.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold text-neutral-600 tracking-tight leading-none mt-1">Returns / Caps</span>
            </button>

          </div>

          {/* DYNAMIC ORDERS LIST DRAWER AREA BASED ON CURRENT FILTER CRITERIA */}
          <div className="pt-3 border-t border-neutral-100 bg-neutral-50/70 p-3 rounded-lg space-y-2.5 animate-fadeIn">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-neutral-400 tracking-wider">
              <span>Status: {activeFilter === 'all' ? 'All Orders' : activeFilter.replace('-', ' ')} ({currentDisplayOrders.length})</span>
              {activeFilter !== 'all' && (
                <button onClick={() => setActiveFilter('all')} className="text-blue-600 font-bold hover:underline transition-colors">Clear Filter</button>
              )}
            </div>

            {currentDisplayOrders.length === 0 ? (
              <p className="text-[10px] text-neutral-400 py-3 text-center font-bold uppercase tracking-widest">
                {activeFilter === 'all' ? 'You have not placed any orders yet.' : 'No orders match this logistics category.'}
              </p>
            ) : (
              currentDisplayOrders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className={cn(
                    "p-3 bg-white rounded-md border transition-all cursor-pointer shadow-3xs text-left",
                    selectedOrder?.id === order.id ? "border-daraz-orange ring-1 ring-daraz-orange/20" : "border-neutral-150 hover:border-daraz-orange/40"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-black text-neutral-800">
                      📦 ORDER #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded border", getStatusColor(order.status))}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-[10px] text-neutral-600 font-bold flex-1 text-left truncate">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                    <span className="text-[10.5px] font-black text-daraz-orange shrink-0">
                      रू {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* EXPANDABLE SELECTED ACTIVE ORDER LOGISTICS AND TRACKING MAP */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-xl border-2 border-daraz-orange/20 overflow-hidden shadow-xs text-left"
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-black uppercase text-neutral-800">Tracking Logistic Record</span>
                  <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Truck size={15} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-850">Order Logistics Progress</h4>
                  </div>
                  
                  <div className="flex items-center justify-between px-2 relative py-4">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 rounded-full z-0" />
                    <div className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-1 transition-all" style={{ width: selectedOrder.status === 'delivered' ? '100%' : selectedOrder.status === 'shipped' ? '66%' : '33%' }} />
                    
                    {['Confirmed', 'Shipped', 'Delivered'].map((step, idx) => (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                          (idx === 0) || 
                          (idx === 1 && (selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered')) ||
                          (idx === 2 && selectedOrder.status === 'delivered')
                          ? 'bg-green-500 text-white' : 'bg-neutral-300 text-neutral-500'
                        }`} />
                        <span className="text-[8px] font-black uppercase mt-1.5 text-neutral-500 tracking-tight">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 bg-neutral-50 p-3 rounded">
                  <h4 className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400">Recipient Details:</h4>
                  <p className="text-[10.5px] font-bold text-neutral-700 leading-normal uppercase">
                    {selectedOrder.address.fullName} ({selectedOrder.address.phone})<br />
                    {selectedOrder.address.address}, {selectedOrder.address.area}, {selectedOrder.address.city}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "RECENTLY VIEWED" COMPACT SECTION PRECISELY REPLICATED */}
        <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm text-left">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-neutral-800 uppercase tracking-tight">Recently Viewed</h3>
            <button 
              onClick={() => navigate('/')}
              className="text-[10px] font-black text-neutral-400 hover:text-daraz-orange uppercase tracking-tight flex items-center gap-0.5"
            >
              View More <ChevronRight size={11} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left side text description & action btn */}
            <div className="space-y-3 shrink-0">
              <p className="text-xs text-neutral-500 font-extrabold leading-relaxed">
                Rediscover the delightful items you've viewed recently!
              </p>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-daraz-orange hover:bg-daraz-orange/90 text-white px-4 py-2 rounded font-black uppercase text-[10px] tracking-widest text-center shadow-xs transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>

            {/* Right side illustration container mirroring the kitten-in-delivery-box graphic perfectly */}
            <div className="flex justify-center sm:justify-end">
              <div className="relative w-40 h-28 bg-[#fdfafb] rounded-lg border border-neutral-100/50 flex items-center justify-center overflow-hidden">
                {/* Circular soft accent in backdrop */}
                <div className="absolute w-24 h-24 bg-pink-500/10 rounded-full blur-xl top-[-20%] right-[-20%]" />
                <div className="absolute w-20 h-20 bg-amber-500/10 rounded-full blur-xl bottom-[-20%] left-[-20%]" />
                
                {/* Custom Vector Illustration of a box delivering cute items using CSS & Emoji placements */}
                <div className="relative flex flex-col items-center">
                  {/* Floating sparkly particle dots */}
                  <span className="absolute -top-4 -left-4 text-xs animate-pulse opacity-70">✨</span>
                  <span className="absolute -top-5 right-2 text-xs animate-bounce opacity-50">🌸</span>
                  
                  {/* Smiling virtual delivery box visual */}
                  <div className="w-16 h-12 bg-orange-100 border-2 border-orange-200 rounded-b-md relative flex flex-col justify-end p-1 shadow-sm">
                    {/* Opened box flaps */}
                    <div className="absolute -top-3.5 -left-1.5 w-9 h-4 bg-orange-100 border-t-2 border-l-2 border-r-2 border-orange-200 rounded-t-sm -rotate-25 transform origin-bottom-right" />
                    <div className="absolute -top-3.5 -right-1.5 w-9 h-4 bg-orange-100 border-t-2 border-l-2 border-r-2 border-orange-200 rounded-t-sm rotate-15 transform origin-bottom-left" />
                    
                    {/* Cute animal peaking */}
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl select-none filter group-hover:scale-110 transition-transform">🐱</span>
                    
                    <div className="h-1.5 w-full bg-orange-200/50 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY UTILITY LAUNCHERS LIST ROW */}
        <div className="grid grid-cols-4 gap-2 bg-white rounded-xl p-3 border border-neutral-100 shadow-sm text-center">
          
          {/* Help Center */}
          <a 
            href="/messages"
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-red-100/60 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform shadow-3xs">
              <Phone size={18} className="fill-red-500/10" />
            </div>
            <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Help Center</span>
          </a>

          {/* Daraz Candy Game shortcut */}
          <button 
            onClick={() => setShowMiniGame('candy')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-pink-100/60 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform shadow-3xs">
              <Candy size={18} className="fill-fuchsia-100" />
            </div>
            <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Daraz Candy</span>
          </button>

          {/* Pickup Points locator */}
          <div 
            onClick={() => {
              alert("📍 Standard Express pickup point selection: Kathmandu Central Warehouse Hub open 9:00 AM - 8:00 PM!");
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100/60 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-3xs">
              <MapPin size={18} />
            </div>
            <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Pickup Points</span>
          </div>

          {/* Secure Payment Options */}
          <div 
            onClick={() => {
              alert("💳 Securely integrated with eSewa Instant payments, IME pay & Visa corporate gateways!");
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shadow-3xs">
              <ShieldCheck size={18} className="fill-blue-500/10" />
            </div>
            <span className="text-[9.5px] font-extrabold text-neutral-600 uppercase tracking-tight mt-1">Payments</span>
          </div>

        </div>

        {/* LOGOUT DIGNIFIED OPTION BAR FOR DIRECT ACCESS */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white text-red-500 hover:bg-neutral-50 border border-neutral-200/80 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-center shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={14} className="stroke-[2.5]" />
          Logout current session
        </button>

      </div>

      {/* POPUP A: REALTIME GEMS BOOSTER CLAIMENT ACTION */}
      <AnimatePresence>
        {showGemsBooster && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs select-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 border border-purple-100 text-center relative shadow-xl overflow-hidden"
            >
              {/* Confetti effect background sparks */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-50/10 to-amber-50/30 opacity-70" />
              
              <div className="w-14 h-14 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto mb-3 shadow">
                <Sparkles size={28} className="fill-white/10" />
              </div>

              <h4 className="text-base font-black text-neutral-850 uppercase tracking-tight">Freebie Claim Success! 🎉</h4>
              <p className="text-xs text-neutral-500 leading-normal mt-2">
                Congratulations! You’ve scored an entry card to the <strong>Mid-Year iPhone 17 & Mountain Flight</strong> draw, plus credited <strong>+150 Gems</strong> directly to your Gems Balance!
              </p>

              <div className="my-4 p-3 bg-fuchsia-50 border border-fuchsia-100 rounded-lg text-fuchsia-700 font-extrabold text-xs">
                🎁 Reward Status: ACTIVE DRAWING ENTRY CODE: #NM-DRAW-5520a
              </div>

              <button 
                onClick={() => {
                  setShowGemsBooster(false);
                  navigate('/vouchers');
                }}
                className="w-full bg-gradient-to-r from-purple-650 from-purple-600 to-rose-600 hover:opacity-90 text-white font-black uppercase text-xs tracking-widest py-3 rounded-md shadow-md"
              >
                Go to my Gems & Vouchers
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP B: MINI GAMES INTERACTIVE SANDBOX IN-PAGE */}
      <AnimatePresence>
        {showMiniGame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/55 backdrop-blur-xs">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 border border-neutral-200 relative shadow-2xl"
            >
              <button 
                onClick={() => {
                  setShowMiniGame(null);
                  setCandyScore(0);
                }}
                className="absolute top-4 right-4 p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
              >
                <X size={16} />
              </button>

              {showMiniGame === 'land' ? (
                /* Land garden tree game */
                <div className="text-center space-y-4">
                  <span className="text-3xl">🌳</span>
                  <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Nepali Mart Land Garden</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                    Water your virtual tea plant daily! Grow it to 100% to redeem a <strong>FREE 50% discount voucher</strong> on hand-picked items.
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-400">
                      <span>Tea Plant Growth status</span>
                      <span>{treeGrowth}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${treeGrowth}%` }} />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (treeGrowth >= 100) {
                        alert("🎉 Conratulations! Your tree reached 100%. Claim code IM-TEA-50 for 50% discount on organic products! Or water again.");
                        setTreeGrowth(10);
                      } else {
                        setTreeGrowth(prev => Math.min(100, prev + 15));
                        alert("💧 Watered tea plant! Growth boosts +15%!");
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest py-2.5 rounded shadow cursor-pointer transition-colors"
                  >
                    💦 Water with Gems Booster
                  </button>
                </div>
              ) : (
                /* Candy bubble POP booster */
                <div className="text-center space-y-4">
                  <span className="text-3xl">🍬</span>
                  <h4 className="text-sm font-black text-pink-700 uppercase tracking-widest">Daraz Candy Pop Matcher</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Click the bursting candies below as quickly as possible to accumulate extra loyalty Gems codes!
                  </p>

                  <div className="bg-fuchsia-50 p-3 rounded border border-fuchsia-100 font-black text-neutral-800 text-sm flex justify-between items-center">
                    <span className="text-xs uppercase text-fuchsia-700">🍬 POP Score:</span>
                    <span className="text-fuchsia-900">{candyScore} / 5 Matches</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 max-w-[240px] mx-auto py-2">
                    {['🌸', '🍭', '🍓', '🧁', '🍉', '🍩', '🍌', '🍨', '🍯', '🍇'].map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          if (candyScore >= 5) {
                            alert("🏆 Max Score achieved! Enjoy virtual candy blast bonus and +50 extra Gems codes added under vouchers!");
                            setCandyScore(0);
                            setShowMiniGame(null);
                          } else {
                            setCandyScore(prev => prev + 1);
                          }
                        }}
                        className="text-2xl p-1 bg-neutral-50 hover:bg-pink-50 border border-neutral-100 rounded text-center active:scale-90 transition-transform cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <p className="text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-wide">
                    ⚠️ Click candies until score is 5 to redeem your free bonus code!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP C: EDIT PROFILE & SHIPPING SETTINGS FORM MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/55 backdrop-blur-xs select-text">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 border border-neutral-200 relative shadow-2xl text-left"
            >
              <button 
                onClick={() => {
                  setShowSettingsModal(false);
                  setSavedSuccess(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-250 text-neutral-500"
              >
                <X size={15} />
              </button>

              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">
                ⚙️ Profile Administration
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-sm text-xs font-bold outline-none focus:border-daraz-orange" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text" 
                    value={profilePhone} 
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-sm text-xs font-bold outline-none focus:border-daraz-orange" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Default Shipping Base</label>
                  <input 
                    type="text" 
                    disabled 
                    value="Ward 10, New Baneshwor, Kathmandu, Nepal"
                    className="w-full bg-neutral-100 border border-transparent px-3 py-2 rounded-sm text-xs font-bold text-neutral-500 cursor-not-allowed uppercase" 
                  />
                </div>

                {savedSuccess && (
                  <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded text-center uppercase tracking-wide">
                    ✅ Changes saved locally in session!
                  </p>
                )}

                <button 
                  onClick={() => {
                    setSavedSuccess(true);
                    setTimeout(() => {
                      setShowSettingsModal(false);
                      setSavedSuccess(false);
                    }, 1200);
                  }}
                  className="w-full bg-daraz-orange hover:bg-daraz-orange/95 text-white py-2.5 rounded font-black text-xs uppercase tracking-widest text-center shadow transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
