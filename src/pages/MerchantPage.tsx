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
  Truck,
  Upload,
  Trash2,
  Camera,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { productService } from '../services/productService';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { isUnityAdsLoaded } from '../services/unityAdsService';
import { ProductImage } from '../components/ProductImage';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1024;
      const MAX_HEIGHT = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback option
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        URL.revokeObjectURL(imageUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(imageUrl);
      resolve(dataUrl);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      // Fallback
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
    };
  });
};

export default function MerchantPage() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'products'>('dashboard');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isDragActive, setIsDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0].name,
    image: '',
    stock: '10'
  });

  const handleFileChange = async (file: File) => {
    // Ensure accurate detection on all devices (some custom runtimes don't supply mime-types)
    const isImageImageFile = file.type.startsWith('image/') || 
                              /\.(jpg|jpeg|png|webp|heic|heif|gif)$/i.test(file.name);
    if (!isImageImageFile) {
      setImageError('Please select a valid photo file (PNG, JPG, JPEG, WEBP, HEIC)');
      return;
    }
    
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      setImageError('Photo exceeds our extremely generous 100MB file size limit. Please select a smaller photo.');
      return;
    }

    try {
      setImageError(null);
      setCompressing(true);
      const base64Data = await compressImage(file);
      setFormData(prev => ({ ...prev, image: base64Data }));
    } catch (err) {
      console.error("Error processing image:", err);
      setImageError('Failed to process. Try a different photo or web camera snaps.');
    } finally {
      setCompressing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileChange(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'merchant' || user.isMerchant || user.role === 'admin') {
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

  // If NOT a merchant or admin, show restricted view
  if (user && user.role !== 'merchant' && !user.isMerchant && user.role !== 'admin') {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-neutral-800">
            Approved <span className="text-daraz-orange">Sellers Only</span>
          </h1>
          <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest max-w-xl leading-relaxed mb-10">
            Merchant access is restricted. Regular customer accounts are not allowed to sell products on Nepali Mart directly.
          </p>

          <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-100 max-w-md w-full mb-10 text-left">
            <div className="flex items-start gap-4">
               <AlertCircle className="text-daraz-orange shrink-0 mt-1" size={24} />
               <div className="space-y-2">
                 <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800">Become a Merchant</h4>
                 <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase">
                   Your account is NOT approved as a merchant. To start selling, please contact an administrator to authorize and register your store on our platform.
                 </p>
                 <p className="text-[10px] font-black text-daraz-orange uppercase">
                   Support Helpline: +977 982-8105337
                 </p>
               </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="bg-neutral-900 text-white px-12 py-4 rounded-sm font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
          >
            <ArrowLeft size={16} /> Back to Shop
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
                          <div className="flex items-center gap-2 mb-6">
                             <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Game ID: 6104126</p>
                             <span className={`w-1.5 h-1.5 rounded-full ${isUnityAdsLoaded() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                             <span className="text-[8px] font-black uppercase text-neutral-500">{isUnityAdsLoaded() ? 'Connected' : 'Connecting...'}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-neutral-500 uppercase">Ad Revenue</span>
                                <span className="text-lg font-black text-green-500">रू 0.00</span>
                             </div>
                             <a 
                                href={`https://dashboard.unity3d.com/organizations/-/projects/6104126/monetization`}
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
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                  {useUrlMode ? 'Product Image URL' : 'Product Photo'}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setUseUrlMode(!useUrlMode)}
                                  className="text-[9px] font-black uppercase tracking-wider text-daraz-orange hover:underline focus:outline-none flex items-center gap-1"
                                >
                                  {useUrlMode ? <Camera size={10} /> : <Globe size={11} />}
                                  {useUrlMode ? 'Upload Photo instead' : 'Use Image URL instead'}
                                </button>
                              </div>

                              {useUrlMode ? (
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-sm text-sm font-medium outline-none focus:border-daraz-orange pl-10"
                                    value={formData.image}
                                    onChange={(e) => {
                                      setFormData({...formData, image: e.target.value});
                                      setImageError(null);
                                    }}
                                  />
                                  <ImageIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {compressing ? (
                                    <div className="border-2 border-dashed border-neutral-200 bg-neutral-50 rounded-sm p-6 flex flex-col items-center justify-center min-h-[160px]">
                                      <div className="w-8 h-8 border-2 border-daraz-orange border-t-transparent rounded-full animate-spin mb-3" />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-700 text-center animate-pulse">
                                        Optimizing & Preparing Photo...
                                      </p>
                                      <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider text-center mt-1">
                                        Processing large high-res image for safe storage
                                      </p>
                                    </div>
                                  ) : formData.image ? (
                                    <div className="relative rounded-sm overflow-hidden border border-neutral-200 aspect-video bg-neutral-100 flex items-center justify-center group">
                                      <img 
                                        src={formData.image} 
                                        alt="Product Preview" 
                                        className="max-h-full max-w-full object-contain"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setFormData({...formData, image: ''})}
                                        className="absolute top-2 right-2 bg-neutral-900/80 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                                        title="Remove photo"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white">Photo Selected Successfully</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <label
                                      onDragEnter={handleDrag}
                                      onDragOver={handleDrag}
                                      onDragLeave={handleDrag}
                                      onDrop={handleDrop}
                                      className={`border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px] ${
                                        isDragActive 
                                          ? 'border-daraz-orange bg-orange-50/50' 
                                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 hover:border-neutral-300'
                                      }`}
                                    >
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleFileChange(e.target.files[0]);
                                          }
                                        }}
                                      />
                                      <div className="w-10 h-10 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center mb-3">
                                        <Camera size={20} />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-700 text-center">
                                        Tap to Snap / Upload Photo (Max 100MB)
                                      </p>
                                      <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider text-center mt-1">
                                        Handles heavy camera images (automagically optimized for storage)
                                      </p>
                                      <span className="mt-3 bg-white border border-neutral-200 hover:border-daraz-orange hover:text-daraz-orange px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest text-neutral-500 shadow-sm transition-all">
                                        Choose File
                                      </span>
                                    </label>
                                  )}

                                  {imageError && (
                                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                      <AlertCircle size={12} className="shrink-0" />
                                      <span>{imageError}</span>
                                    </div>
                                  )}
                                </div>
                              )}
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
                           <ProductImage src={product.image} alt={product.name} category={product.category} className="w-16 h-16 object-cover rounded-sm border border-neutral-100" />
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
