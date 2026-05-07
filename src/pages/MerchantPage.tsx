import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  LayoutGrid,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { productService } from '../services/productService';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

export default function MerchantPage() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'products'>('dashboard');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0].name,
    image: '',
    stock: '10'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'merchant' || user.isMerchant) {
      const unsubscribe = productService.subscribeToSellerProducts(user.id, (products) => {
        setSellerProducts(products);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleBecomeMerchant = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await updateDoc(doc(db, 'users', user.id), {
        role: 'merchant',
        isMerchant: true
      });
      // Context will auto-update or user can refresh
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to become merchant:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      await productService.addProduct({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop',
        stock: Number(formData.stock),
        sellerId: user.id,
        sellerName: user.name,
        status: 'pending' // Products from merchants require approval
      });
      
      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0].name,
        image: '',
        stock: '10'
      });
      
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('products');
      }, 2000);
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-daraz-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // If NOT a merchant, show onboarding
  if (user && user.role !== 'merchant' && !user.isMerchant) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-daraz-orange mb-8 animate-bounce">
            <Store size={48} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-neutral-800">
            Start Selling on <span className="text-daraz-orange">Nepali Mart</span>
          </h1>
          <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest max-w-xl leading-relaxed mb-10">
            Join thousands of local artisans and entrepreneurs. Reach customers across Nepal and grow your business today.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <LayoutGrid size={20} />
              </div>
              <h3 className="font-black uppercase tracking-tight text-neutral-800">Easy Listing</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase leading-relaxed">List your products in seconds with our simple merchant dashboard.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                 <Truck size={20} />
              </div>
              <h3 className="font-black uppercase tracking-tight text-neutral-800">Fast Delivery</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase leading-relaxed">We handle the logistics. You focus on creating amazing products.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-orange-50 text-daraz-orange rounded-full flex items-center justify-center">
                 <DollarSign size={20} />
              </div>
              <h3 className="font-black uppercase tracking-tight text-neutral-800">Low Commission</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase leading-relaxed font-black text-daraz-orange">Only 30% platform fee. You keep 70% of every sale!</p>
            </div>
          </div>

          <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-100 max-w-md w-full mb-10">
            <div className="flex items-start gap-4 text-left">
               <AlertCircle className="text-daraz-orange shrink-0 mt-1" size={24} />
               <div className="space-y-2">
                 <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800">Merchant Agreement</h4>
                 <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase">
                   By clicking the button below, you agree to our Merchant Terms of Service. A 30% platform fee applies to all successful transactions.
                 </p>
               </div>
            </div>
          </div>

          <button 
            onClick={handleBecomeMerchant}
            disabled={submitting}
            className="bg-daraz-orange text-white px-12 py-4 rounded-sm font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-daraz-orange/20 flex items-center gap-3"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Store size={20} />}
            Become a Merchant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Merchant Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-neutral-400 hover:text-daraz-orange transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Merchant <span className="text-daraz-orange">Center</span></h1>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Hello, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex flex-col text-right">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Balance</span>
                <span className="text-sm font-black text-green-600">रू 0.00</span>
             </div>
             <button 
                onClick={() => setActiveTab('add')}
                className="bg-daraz-orange text-white p-2 sm:px-4 sm:py-2 rounded-sm flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-daraz-orange/20"
              >
               <Plus size={18} /> <span className="hidden sm:inline">New Product</span>
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-sm border border-neutral-100 p-2 space-y-1">
             <button 
               onClick={() => setActiveTab('dashboard')}
               className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all ${activeTab === 'dashboard' ? 'bg-daraz-orange text-white shadow-lg shadow-daraz-orange/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
             >
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                </div>
                <ChevronRight size={14} />
             </button>
             <button 
               onClick={() => setActiveTab('products')}
               className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all ${activeTab === 'products' ? 'bg-daraz-orange text-white shadow-lg shadow-daraz-orange/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
             >
                <div className="flex items-center gap-3">
                  <Package size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">My Products</span>
                </div>
                <ChevronRight size={14} />
             </button>
             <button 
               onClick={() => setActiveTab('add')}
               className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all ${activeTab === 'add' ? 'bg-daraz-orange text-white shadow-lg shadow-daraz-orange/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
             >
                <div className="flex items-center gap-3">
                  <Plus size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Listing</span>
                </div>
                <ChevronRight size={14} />
             </button>
          </div>

          <div className="bg-orange-50 p-6 rounded-sm border border-orange-100">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-daraz-orange mb-2">Commission Rate</h4>
             <p className="text-[20px] font-black text-daraz-orange italic leading-none mb-2">30%</p>
             <p className="text-[9px] font-medium text-orange-700 leading-relaxed uppercase">
               Platform fee is automatically deducted from each sale. You receive 70% of the listed price.
             </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
           <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
               <motion.div 
                 key="dashboard"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-6"
               >
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-sm border border-neutral-100 shadow-sm group hover:border-daraz-orange/30 transition-all">
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Total Sales</span>
                       <div className="flex items-end justify-between">
                         <span className="text-2xl font-black text-neutral-800 italic">रू 0</span>
                         <TrendingUp className="text-green-500" size={24} />
                       </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm border border-neutral-100 shadow-sm group hover:border-daraz-orange/30 transition-all">
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Active Products</span>
                       <div className="flex items-end justify-between">
                         <span className="text-2xl font-black text-neutral-800 italic">{sellerProducts.filter(p => p.status === 'active').length}</span>
                         <Package className="text-blue-500" size={24} />
                       </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm border border-neutral-100 shadow-sm group hover:border-daraz-orange/30 transition-all">
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Commission Paid</span>
                       <div className="flex items-end justify-between">
                         <span className="text-2xl font-black text-neutral-800 italic">रू 0</span>
                         <DollarSign className="text-daraz-orange" size={24} />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-neutral-900 p-8 rounded-sm text-white relative overflow-hidden group">
                       <div className="relative z-10">
                          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Unity Ads <span className="text-daraz-orange">Integrated</span></h3>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Game ID: bb5574e7...9fd311f6b509</p>
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-neutral-500 uppercase">Ad Revenue</span>
                                <span className="text-lg font-black text-green-500">रू 0.00</span>
                             </div>
                             <a 
                                href={`https://dashboard.unity3d.com/organizations/-/projects/6104127/monetization`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-black px-6 py-2 rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-daraz-orange hover:text-white transition-all ml-auto"
                             >
                                Dashboard
                             </a>
                          </div>
                       </div>
                       <div className="absolute -right-8 -bottom-8 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                          <LayoutGrid size={160} />
                       </div>
                    </div>

                    <div className="bg-white p-8 rounded-sm border border-neutral-100 flex flex-col justify-center">
                       <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800 mb-2">Marketplace Performance</h4>
                       <div className="space-y-4">
                          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                             <div className="h-full bg-daraz-orange w-[5%]"></div>
                          </div>
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-neutral-400">
                             <span>Conversion Rate</span>
                             <span>0%</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-sm border border-neutral-100 shadow-sm p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4">
                      <TrendingUp size={32} />
                    </div>
                    <h3 className="font-black uppercase tracking-tight text-neutral-800 mb-2">No Sales Yet</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest max-w-xs">
                      Share your products on social media to start getting your first orders!
                    </p>
                 </div>
               </motion.div>
             )}

             {activeTab === 'add' && (
               <motion.div 
                 key="add"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="bg-white rounded-sm border border-neutral-100 shadow-sm overflow-hidden"
               >
                 <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white text-xs font-black uppercase tracking-widest">New Product Listing</h3>
                    <span className="text-[9px] text-daraz-orange font-bold uppercase tracking-widest">Commission: 30%</span>
                 </div>
                 
                 <form onSubmit={handleAddProduct} className="p-8 space-y-8">
                    {success ? (
                      <div className="bg-green-50 text-green-700 p-10 rounded-sm border border-green-100 flex flex-col items-center text-center">
                         <CheckCircle size={48} className="mb-4" />
                         <h4 className="font-black uppercase tracking-tight italic text-xl">Product Submitted!</h4>
                         <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Our team will review your listing shortly.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Product Name</label>
                              <input 
                                required
                                type="text" 
                                placeholder="e.g. Handmade Woolen Scarf"
                                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-bold outline-none focus:border-daraz-orange"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Price (रू)</label>
                                <input 
                                  required
                                  type="number" 
                                  placeholder="0.00"
                                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-bold outline-none focus:border-daraz-orange font-black text-daraz-orange"
                                  value={formData.price}
                                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Stock Qty</label>
                                <input 
                                  required
                                  type="number" 
                                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-bold outline-none focus:border-daraz-orange"
                                  value={formData.stock}
                                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Category</label>
                              <select 
                                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-bold outline-none focus:border-daraz-orange appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Image URL</label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="https://..."
                                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-medium outline-none focus:border-daraz-orange pl-10"
                                  value={formData.image}
                                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                                />
                                <ImageIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Description</label>
                              <textarea 
                                required
                                rows={5}
                                placeholder="Tell customers about your product..."
                                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-medium outline-none focus:border-daraz-orange resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-neutral-50">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">You will receive</span>
                             <span className="text-lg font-black text-green-600 italic">रू {(Number(formData.price || 0) * 0.7).toLocaleString()}</span>
                           </div>
                           <button 
                             disabled={submitting}
                             type="submit" 
                             className="bg-daraz-orange text-white px-12 py-3 rounded-sm font-black uppercase text-xs tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-daraz-orange/20"
                           >
                            {submitting ? 'Submitting...' : 'List Product'}
                           </button>
                        </div>
                      </>
                    )}
                 </form>
               </motion.div>
             )}

             {activeTab === 'products' && (
               <motion.div 
                 key="products"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-4"
               >
                 <div className="bg-white p-6 rounded-sm border border-neutral-100 flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight italic">Product Inventory</h3>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 rounded-full">{sellerProducts.length} Items</span>
                 </div>

                 {sellerProducts.length === 0 ? (
                   <div className="bg-white rounded-sm border border-neutral-100 p-20 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4">
                        <Package size={32} />
                      </div>
                      <h4 className="font-black uppercase tracking-tight text-neutral-800">Your inventory is empty</h4>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2 max-w-sm">Start listing your products to reach millions of customers across Nepal.</p>
                      <button 
                        onClick={() => setActiveTab('add')}
                        className="mt-8 bg-neutral-900 text-white px-8 py-2 rounded-sm font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all"
                      >
                         Add First Product
                      </button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                      {sellerProducts.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-sm border border-neutral-100 flex items-center gap-4 group hover:border-daraz-orange/20 transition-all">
                           <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-sm border border-neutral-100" />
                           <div className="flex-1">
                              <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800 line-clamp-1">{product.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] font-bold text-daraz-orange uppercase tracking-widest italic">रू {product.price.toLocaleString()}</span>
                                 <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-2 py-0.5 rounded-sm">{product.category}</span>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-2 pr-4">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                product.status === 'active' ? 'bg-green-50 text-green-600' : 
                                product.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {product.status || 'pending'}
                              </span>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Stock: {product.stock}</span>
                           </div>
                           
                           <button className="text-neutral-300 hover:text-daraz-orange transition-colors">
                              <ArrowLeft className="rotate-180" size={18} />
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
