import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Package, 
  Settings, 
  LogOut, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '../lib/firebase';
import { User, Order } from '../types';
import { orderService } from '../services/orderService';

interface ProfilePageProps {
  user: User | null;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'processing': return <Clock size={14} />;
      case 'delayed': return <AlertCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  return (
    <div className="bg-daraz-bg min-h-[85vh] py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Account Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-daraz-orange/10 rounded-full flex items-center justify-center text-daraz-orange mb-4">
                <UserIcon size={40} />
              </div>
              <h3 className="font-bold text-neutral-800 uppercase tracking-tight">{user.name}</h3>
              <p className="text-xs text-neutral-500 font-medium">{user.email}</p>
            </div>
            
            <div className="mt-8 space-y-1">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-daraz-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <span className="flex items-center gap-3"><Package size={16} /> My Orders</span>
                <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between p-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-daraz-orange text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <span className="flex items-center gap-3"><Settings size={16} /> Edit Profile</span>
                <ChevronRight size={14} />
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-sm text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all text-left"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-sm p-6 shadow-sm border border-neutral-100 hidden md:block">
            <div className="flex items-center gap-3 text-daraz-orange mb-4">
               <MapPin size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Default Address</span>
            </div>
            <p className="text-[11px] font-bold text-neutral-700 leading-relaxed uppercase">
              Kathmandu, Nepal<br />
              New Baneshwor, Ward 10<br />
              Contact: +977 9800000000
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-white p-4 sm:p-6 rounded-sm shadow-sm border border-neutral-100 flex justify-between items-center">
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-tight italic">Order History</h2>
                  <span className="text-[10px] bg-neutral-100 px-3 py-1 rounded-full font-bold text-neutral-500 uppercase tracking-widest">
                    {orders.length} Orders
                  </span>
                </div>

                {loading ? (
                  <div className="bg-white p-20 rounded-sm shadow-sm border border-neutral-100 flex flex-col items-center text-neutral-400">
                    <div className="w-10 h-10 border-2 border-daraz-orange border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Retrieving your orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-20 rounded-sm shadow-sm border border-neutral-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4">
                      <Package size={32} />
                    </div>
                    <h3 className="font-bold text-neutral-700 uppercase italic tracking-tighter">No orders yet</h3>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-2 max-w-[200px]">
                      Your order history will appear here once you make a purchase.
                    </p>
                    <button 
                      onClick={() => navigate('/')}
                      className="mt-6 bg-daraz-orange text-white px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white rounded-sm shadow-sm border border-neutral-100 overflow-hidden hover:border-daraz-orange/30 transition-all cursor-pointer group"
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      >
                        <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Order #</span>
                            <span className="text-xs font-black text-neutral-800 uppercase tracking-widest">{order.id.substring(0, 8)}...</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Placed on</span>
                            <span className="text-xs font-bold text-neutral-700">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total</span>
                            <span className="text-xs font-black text-daraz-orange">रू {order.total.toLocaleString()}</span>
                          </div>

                          <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                          
                          <div className="hidden sm:block">
                             <ChevronRight className={`text-neutral-300 group-hover:text-daraz-orange transition-all ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Expandable Order Detail */}
                        <AnimatePresence>
                          {selectedOrder?.id === order.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-neutral-50 bg-neutral-50/50"
                            >
                              <div className="p-4 sm:p-6 space-y-6">
                                {/* Tracking Info */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-neutral-500">
                                    <Truck size={16} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Order Tracking</h4>
                                  </div>
                                  <div className="flex items-center justify-between px-2 relative py-4">
                                    {/* Tracking line */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 rounded-full z-0" />
                                    <div className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-1 transition-all" style={{ width: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '66%' : '33%' }} />
                                    
                                    {['confirmed', 'shipped', 'delivered'].map((step, idx) => (
                                      <div key={step} className="relative z-10 flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white ${
                                          (idx === 0) || 
                                          (idx === 1 && (order.status === 'shipped' || order.status === 'delivered')) ||
                                          (idx === 2 && order.status === 'delivered')
                                          ? 'bg-green-500' : 'bg-neutral-300'
                                        }`} />
                                        <span className="text-[8px] font-bold uppercase mt-2 text-neutral-500">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Items ({order.items.length})</h4>
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-sm border border-neutral-100">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm" />
                                        <div className="flex-1">
                                          <h5 className="text-[10px] font-bold text-neutral-800 uppercase tracking-tight truncate max-w-[200px]">{item.name}</h5>
                                          <p className="text-[9px] text-neutral-400 font-bold">Qty: {item.quantity} × रू {item.price.toLocaleString()}</p>
                                        </div>
                                        <span className="text-[11px] font-black text-neutral-700 tracking-tighter">रू {(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Address & Delivery */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Delivery Address</h4>
                                    <p className="text-[10px] font-bold text-neutral-700 leading-relaxed uppercase">
                                      {order.address.fullName}<br />
                                      {order.address.address}, {order.address.area}<br />
                                      {order.address.city}<br />
                                      Phone: {order.address.phone}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                     <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Estimated Delivery</h4>
                                     <div className="flex items-center gap-2 text-daraz-orange">
                                       <Clock size={14} />
                                       <span className="text-[11px] font-black uppercase tracking-tighter">2 - 3 Working Days</span>
                                     </div>
                                     <p className="text-[9px] text-neutral-400 font-medium tracking-tight">Your order is being handled by our express local delivery network.</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-sm p-6 sm:p-10 shadow-sm border border-neutral-100"
              >
                <h2 className="text-lg font-black uppercase tracking-tighter italic mb-8 border-b border-neutral-50 pb-4">Account Settings</h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Full Name</label>
                      <input type="text" defaultValue={user.name} className="w-full bg-neutral-50 border border-neutral-100 px-4 py-2.5 rounded-sm text-sm font-medium outline-none focus:border-daraz-orange" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
                      <input type="email" defaultValue={user.email} disabled className="w-full bg-neutral-100 border border-transparent px-4 py-2.5 rounded-sm text-sm font-medium text-neutral-500 cursor-not-allowed uppercase" />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-sm flex items-start gap-4">
                    <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1 text-blue-700">
                      <h4 className="text-[10px] font-black uppercase">Verify Your Identity</h4>
                      <p className="text-[9px] font-medium leading-relaxed">For security reasons, some identification fields cannot be edited directly. Please visit a Nepali Mart hub if you need to change your registered email.</p>
                    </div>
                  </div>

                  <button className="bg-daraz-orange text-white px-10 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-daraz-orange/20">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
