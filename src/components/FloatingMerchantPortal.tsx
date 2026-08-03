import React, { useState, useRef } from 'react';
import { 
  Store, 
  Plus, 
  Package, 
  Edit3, 
  Trash2, 
  X, 
  GripVertical, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Play, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Move,
  Eye,
  Tag,
  DollarSign,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { productService } from '../services/productService';
import { useFirebase } from '../context/FirebaseContext';
import { formatCurrency } from '../lib/utils';
import { ProductImage } from './ProductImage';

interface FloatingMerchantPortalProps {
  products: Product[];
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size < 150 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
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
        URL.revokeObjectURL(imageUrl);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(imageUrl);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    };
  });
};

const processVideoFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For smaller videos (< 15MB), read directly as Data URL
    if (file.size <= 15 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    } else {
      // For larger video files, create a Blob URL for efficient memory playback
      const objectUrl = URL.createObjectURL(file);
      resolve(objectUrl);
    }
  });
};

export default function FloatingMerchantPortal({ products }: FloatingMerchantPortalProps) {
  const { user, dispatchNotification } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'edit'>('inventory');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0].name,
    image: '',
    videoUrl: '',
    stock: '15',
    sellerName: user?.name || 'Local Merchant',
    status: 'active' as 'active' | 'pending' | 'rejected'
  });

  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');
  const [videoMode, setVideoMode] = useState<'file' | 'url'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter seller/store products
  const merchantProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: CATEGORIES[0].name,
      image: '',
      videoUrl: '',
      stock: '15',
      sellerName: user?.name || 'Local Merchant',
      status: 'active'
    });
    setImageError(null);
    setVideoError(null);
    setSelectedProductId(null);
    setSuccessMsg(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleStartEdit = (product: Product) => {
    setSelectedProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      videoUrl: product.videoUrl || '',
      stock: product.stock.toString(),
      sellerName: product.sellerName || user?.name || 'Local Merchant',
      status: product.status || 'active'
    });
    setImageError(null);
    setVideoError(null);
    setActiveTab('edit');
  };

  const handleImageFileChange = async (file: File) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif|gif)$/i.test(file.name);
    if (!isImage) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    setImageError(null);
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressed }));
    } catch (e: any) {
      setImageError('Failed to process image. Try a smaller image or URL.');
    } finally {
      setCompressing(false);
    }
  };

  const handleVideoFileChange = async (file: File) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name);
    if (!isVideo) {
      setVideoError('Please select a valid video file (MP4, WEBM, MOV)');
      return;
    }
    setVideoError(null);
    setVideoProcessing(true);
    try {
      const processedVideo = await processVideoFile(file);
      setFormData(prev => ({ ...prev, videoUrl: processedVideo }));
    } catch (e) {
      setVideoError('Could not process video file. You can also paste a video URL.');
    } finally {
      setVideoProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setImageError('Product name is required');
      return;
    }
    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setImageError('Please enter a valid price');
      return;
    }
    if (!formData.image.trim()) {
      setImageError('Product image is required');
      return;
    }

    setSubmitting(true);
    setImageError(null);

    try {
      if (activeTab === 'add') {
        const newId = await productService.addProduct({
          name: formData.name.trim(),
          description: formData.description.trim() || 'High quality product available at best market price.',
          price: numPrice,
          category: formData.category,
          image: formData.image,
          videoUrl: formData.videoUrl.trim() || undefined,
          stock: parseInt(formData.stock, 10) || 10,
          sellerId: user?.id || 'guest-seller',
          sellerName: formData.sellerName.trim() || user?.name || 'Local Merchant',
          status: formData.status
        });
        
        setSuccessMsg('Product published successfully!');
        dispatchNotification('Product Listed!', `Your product "${formData.name}" is now live in the store.`, 'activities');
        setTimeout(() => {
          setActiveTab('inventory');
          resetForm();
        }, 1200);
      } else if (activeTab === 'edit' && selectedProductId) {
        await productService.updateProduct(selectedProductId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: numPrice,
          category: formData.category,
          image: formData.image,
          videoUrl: formData.videoUrl.trim() || undefined,
          stock: parseInt(formData.stock, 10) || 0,
          sellerName: formData.sellerName.trim(),
          status: formData.status
        });

        setSuccessMsg('Product updated successfully!');
        dispatchNotification('Product Updated!', `Changes to "${formData.name}" have been saved.`, 'activities');
        setTimeout(() => {
          setActiveTab('inventory');
          resetForm();
        }, 1200);
      }
    } catch (err: any) {
      setImageError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}" from the store?`)) {
      try {
        await productService.deleteProduct(productId);
        dispatchNotification('Product Deleted', `"${productName}" has been removed from inventory.`, 'activities');
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  return (
    <>
      {/* Floating Draggable Portal Launcher Badge */}
      <motion.div 
        drag
        dragMomentum={false}
        dragElastic={0.05}
        className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-[9999] touch-none select-none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="relative group">
          {/* Pulsing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-daraz-orange via-amber-500 to-orange-600 rounded-full blur-sm opacity-70 group-hover:opacity-100 animate-pulse transition duration-500" />
          
          <div className="relative flex items-center gap-1.5 bg-neutral-900 text-white p-1.5 pr-4 rounded-full shadow-2xl border border-white/20 backdrop-blur-md">
            {/* Move Handle */}
            <div className="p-1.5 text-neutral-400 hover:text-white cursor-grab active:cursor-grabbing rounded-full hover:bg-white/10 transition-colors">
              <GripVertical size={16} />
            </div>

            {/* Expand / Open Portal Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 text-xs font-bold"
            >
              <div className="w-8 h-8 rounded-full bg-daraz-orange flex items-center justify-center text-white shadow-md">
                <Store size={18} />
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="font-extrabold text-[11px] text-amber-300 uppercase tracking-wider">Merchant Portal</p>
                <p className="text-[10px] text-neutral-300 font-medium">Sell & Manage Items</p>
              </div>
            </button>

            {/* Quick Add Product Button */}
            <button
              onClick={() => {
                setIsOpen(true);
                handleStartAdd();
              }}
              className="ml-1 px-2.5 py-1 bg-white/10 hover:bg-daraz-orange text-white text-[10px] font-extrabold uppercase rounded-full transition-all border border-white/10 flex items-center gap-1"
              title="Add New Product"
            >
              <Plus size={12} />
              <span>Sell</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Expandable Merchant Portal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag
            dragHandle=".drag-portal-header"
            dragMomentum={false}
            className="fixed bottom-28 left-4 right-4 sm:left-8 sm:right-auto sm:w-[580px] h-[640px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 z-[99999] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Portal Header with Drag Handle */}
            <div className="drag-portal-header bg-neutral-900 text-white p-4 cursor-grab active:cursor-grabbing flex items-center justify-between border-b border-neutral-800 select-none">
              <div className="flex items-center gap-3">
                <div className="p-1.5 text-neutral-400 hover:text-white rounded">
                  <Move size={16} />
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-daraz-orange to-amber-500 flex items-center justify-center text-white shadow-lg">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
                    Merchant Sales Hub
                    <span className="text-[9px] bg-daraz-orange text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Live Portal
                    </span>
                  </h2>
                  <p className="text-[10px] text-neutral-400">Drag window header to move • Full seller controls</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Portal Sub-Header Navigation */}
            <div className="bg-neutral-100 p-2 border-b border-neutral-200 flex items-center justify-between gap-1 text-xs">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'inventory' 
                      ? 'bg-white text-daraz-orange shadow-sm border border-neutral-200' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  <Package size={14} />
                  <span>My Products</span>
                  <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                    {products.length}
                  </span>
                </button>

                <button
                  onClick={handleStartAdd}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'add' 
                      ? 'bg-daraz-orange text-white shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  <Plus size={14} />
                  <span>+ Add Product</span>
                </button>

                {activeTab === 'edit' && (
                  <div className="px-3 py-1.5 bg-amber-500 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-sm">
                    <Edit3 size={14} />
                    <span>Edit Item</span>
                  </div>
                )}
              </div>

              {/* Status Pill */}
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Store Active
              </div>
            </div>

            {/* Portal Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: INVENTORY LIST */}
              {activeTab === 'inventory' && (
                <div className="space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search listed products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-daraz-orange focus:bg-white transition-all"
                    />
                  </div>

                  {merchantProducts.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
                      <Package size={36} className="mx-auto text-neutral-300 mb-2" />
                      <p className="text-sm font-bold text-neutral-700">No products found</p>
                      <p className="text-xs text-neutral-500 mb-4">Start selling your first product on the marketplace now!</p>
                      <button
                        onClick={handleStartAdd}
                        className="px-4 py-2 bg-daraz-orange text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>List A New Product</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {merchantProducts.map((p) => (
                        <div
                          key={p.id}
                          className="group p-3 bg-white border border-neutral-200 hover:border-daraz-orange/50 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-100 shrink-0 bg-neutral-50">
                              <ProductImage src={p.image} alt={p.name} category={p.category} className="w-full h-full object-contain" />
                              {p.videoUrl && (
                                <div className="absolute bottom-0.5 right-0.5 bg-neutral-900/80 text-white p-0.5 rounded" title="Includes Product Video">
                                  <VideoIcon size={10} className="text-amber-400" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-neutral-800 truncate group-hover:text-daraz-orange transition-colors">
                                {p.name}
                              </h4>
                              <p className="text-[11px] font-extrabold text-daraz-orange">
                                {formatCurrency(p.price)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500">
                                <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium">
                                  {p.category}
                                </span>
                                <span>Stock: <strong className="text-neutral-800">{p.stock}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-2 text-neutral-600 hover:text-daraz-orange hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                              title="Edit all product details"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2 & 3: ADD OR EDIT PRODUCT FORM */}
              {(activeTab === 'add' || activeTab === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Section Title */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h3 className="font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      {activeTab === 'add' ? <Plus className="text-daraz-orange" size={16} /> : <Edit3 className="text-amber-500" size={16} />}
                      <span>{activeTab === 'add' ? 'Create & Publish Product' : 'Edit Product Details'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('inventory');
                        resetForm();
                      }}
                      className="text-neutral-400 hover:text-neutral-700 font-bold"
                    >
                      Back to list
                    </button>
                  </div>

                  {/* Feedback Messages */}
                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {imageError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 font-bold">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  {/* Product Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Men's Leather Jacket / Wireless Earbuds"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange focus:ring-1 focus:ring-daraz-orange/20"
                    />
                  </div>

                  {/* Price & Stock & Category Row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                        Price (NPR) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-daraz-orange text-daraz-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-2 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange bg-white"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe key features, sizing, warranty, or materials..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange resize-none"
                    />
                  </div>

                  {/* PRODUCT IMAGE SECTION */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon size={14} className="text-daraz-orange" />
                        <span>Product Image *</span>
                      </label>

                      <div className="flex gap-1 bg-neutral-200 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImageMode('file')}
                          className={`px-2 py-0.5 rounded ${imageMode === 'file' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                        >
                          Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('url')}
                          className={`px-2 py-0.5 rounded ${imageMode === 'url' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {imageMode === 'file' ? (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageFileChange(e.target.files[0]);
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={compressing}
                          className="w-full border-2 border-dashed border-neutral-300 hover:border-daraz-orange bg-white p-3 rounded-xl text-center transition-all group"
                        >
                          {compressing ? (
                            <div className="flex items-center justify-center gap-2 text-daraz-orange font-bold">
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Compressing photo...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-neutral-600 group-hover:text-daraz-orange font-medium">
                              <Upload size={16} />
                              <span>Click to select photo or take picture</span>
                            </div>
                          )}
                        </button>
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange bg-white"
                      />
                    )}

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm mt-2">
                        <ProductImage src={formData.image} alt="Preview" category={formData.category} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-1 right-1 bg-neutral-900/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PRODUCT VIDEO SECTION */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1">
                        <VideoIcon size={14} className="text-amber-500" />
                        <span>Product Video (Optional)</span>
                      </label>

                      <div className="flex gap-1 bg-neutral-200 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setVideoMode('file')}
                          className={`px-2 py-0.5 rounded ${videoMode === 'file' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                        >
                          Upload Video
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoMode('url')}
                          className={`px-2 py-0.5 rounded ${videoMode === 'url' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                        >
                          Video Link
                        </button>
                      </div>
                    </div>

                    {videoError && (
                      <p className="text-[10px] font-bold text-red-600">{videoError}</p>
                    )}

                    {videoMode === 'file' ? (
                      <div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleVideoFileChange(e.target.files[0]);
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={videoProcessing}
                          className="w-full border-2 border-dashed border-neutral-300 hover:border-amber-500 bg-white p-3 rounded-xl text-center transition-all group"
                        >
                          {videoProcessing ? (
                            <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Processing product video...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-neutral-600 group-hover:text-amber-600 font-medium">
                              <Upload size={16} />
                              <span>Click to select product video file (MP4/WEBM)</span>
                            </div>
                          )}
                        </button>
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="Paste MP4 video link or YouTube/Vimeo URL..."
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500 bg-white"
                      />
                    )}

                    {/* Video Live Preview */}
                    {formData.videoUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 mt-2 p-1">
                        <div className="flex items-center justify-between text-[10px] text-white px-2 py-1 font-bold">
                          <span className="flex items-center gap-1">
                            <Play size={10} className="text-amber-400" />
                            Live Video Preview
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, videoUrl: '' })}
                            className="text-neutral-400 hover:text-red-400"
                          >
                            Remove Video
                          </button>
                        </div>
                        
                        {formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be') ? (
                          <div className="aspect-video w-full rounded-lg overflow-hidden">
                            <iframe
                              src={formData.videoUrl.replace('watch?v=', 'embed/')}
                              className="w-full h-full"
                              title="Video preview"
                            />
                          </div>
                        ) : (
                          <video
                            src={formData.videoUrl}
                            controls
                            className="w-full max-h-48 object-contain rounded-lg"
                          >
                            Your browser does not support playing this video.
                          </video>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Seller Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider mb-1">
                      Merchant / Seller Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium outline-none focus:border-daraz-orange"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('inventory');
                        resetForm();
                      }}
                      className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-2.5 bg-gradient-to-r from-daraz-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Saving Product...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>{activeTab === 'add' ? 'Publish Product To Store' : 'Save Product Updates'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
