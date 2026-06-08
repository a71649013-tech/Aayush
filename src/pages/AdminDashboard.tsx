import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '../types';
import { Package, ShoppingCart, TrendingUp, Users, Edit3, Trash2, CheckCircle, Clock, ShieldAlert, Zap, Plus, Upload, X, MessageSquare, Bell, Send, User as UserIcon } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useFirebase } from '../context/FirebaseContext';
import { ProductImage } from '../components/ProductImage';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For small files (< 150KB), convert directly to bypass Canvas operations for extreme speed
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
      // Scaled down to max 800px bounding box for hyper-speed uploads (takes < 100ms and retains crisp clarity)
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
        reader.onload = (e) => {
          const res = e.target?.result as string;
          if (res.length > 900000) {
            reject(new Error("Image is too large. Please select a smaller photo file."));
          } else {
            resolve(res);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // High details but light weight for speedy performance
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      URL.revokeObjectURL(imageUrl);

      // Verify base64 bounds
      if (dataUrl.length > 900 * 1024) {
        const secondCanvas = document.createElement('canvas');
        secondCanvas.width = Math.round(width * 0.6);
        secondCanvas.height = Math.round(height * 0.6);
        const secondCtx = secondCanvas.getContext('2d');
        if (secondCtx) {
          secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
          const compressedDataUrl = secondCanvas.toDataURL('image/jpeg', 0.5);
          resolve(compressedDataUrl);
        } else {
          resolve(dataUrl);
        }
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(imageUrl);
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        if (res.length > 900000) {
          reject(new Error("Image size too large to process. Please crop or choose a smaller photo."));
        } else {
          resolve(res);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    };
  });
};

export default function AdminDashboard({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: { 
  products: Product[], 
  onAddProduct: (p: any) => void,
  onUpdateProduct: (id: string, p: any) => void,
  onDeleteProduct: (id: string) => void
}) {
  const { user, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'messages'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'Handicrafts',
    stock: 50,
    description: '',
    image: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Real-time Support Chat & Notification Broadcast State
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Broadcaster State
  const [broadcastCategory, setBroadcastCategory] = useState<'promos' | 'activities' | 'orders'>('promos');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  
  // Promo-specific fields
  const [promoBannerTitle, setPromoBannerTitle] = useState('6.6 FLASH DEAL');
  const [promoBannerSub, setPromoBannerSub] = useState('SPECIAL PRICE REDUCTION');
  const [promoDiscount, setPromoDiscount] = useState('30% OFF EVERYTHING');
  const [promoTag, setPromoTag] = useState('Store Special');

  // Activity-specific fields
  const [activityPoints, setActivityPoints] = useState('+100 Gems');

  // Order-specific fields
  const [orderIdField, setOrderIdField] = useState('NM-5521');
  const [orderStatusField, setOrderStatusField] = useState('Dispatched');

  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  // Subscribe to recent orders if admin
  useEffect(() => {
    if (user?.role === 'admin') {
      const unsubscribe = orderService.subscribeToAllOrders((fetched) => {
        setOrders(fetched);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Subscribe to all customer chat channels in real-time
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threads = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = 'Just now';
        if (data.updatedAt) {
          const date = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
        }
        return {
          id: doc.id,
          ...data,
          time: timeStr
        };
      });
      setChatThreads(threads);
    }, (err) => {
      console.error("Failed to load chat channels:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to selected chat thread's history in real-time
  useEffect(() => {
    if (!selectedThread) return;

    const messagesRef = collection(db, 'chats', selectedThread.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = 'Just now';
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id: doc.id,
          sender: data.sender || 'user',
          text: data.text || '',
          time: timeStr
        };
      });
      setThreadMessages(msgs);
      
      // Mark as read by admin when looking at it
      if (selectedThread.unreadByAdmin) {
        setDoc(doc(db, 'chats', selectedThread.id), { unreadByAdmin: false }, { merge: true })
          .catch(err => console.error("Could not sweep unread indicator:", err));
      }

      // Auto-scroll to latest message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    }, (err) => {
      console.error("Failed to subscribe to individual thread messages:", err);
    });

    return () => unsubscribe();
  }, [selectedThread?.id]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastDesc.trim()) return;

    try {
      setBroadcastSuccess(false);
      setBroadcastError(null);

      const payload: any = {
        category: broadcastCategory,
        title: broadcastTitle.trim(),
        desc: broadcastDesc.trim(),
        createdAt: serverTimestamp(),
        unread: true
      };

      if (broadcastCategory === 'promos') {
        payload.bannerTitle = promoBannerTitle.trim();
        payload.bannerSub = promoBannerSub.trim();
        payload.discount = promoDiscount.trim();
        payload.tag = promoTag.trim();
      } else if (broadcastCategory === 'activities') {
        payload.points = activityPoints.trim();
      } else if (broadcastCategory === 'orders') {
        payload.orderId = orderIdField.trim();
        payload.status = orderStatusField;
      }

      await addDoc(collection(db, 'notifications'), payload);
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastDesc('');
      
      // Auto dismiss success toast
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to post broadcast notification:", err);
      setBroadcastError(err?.message || "Failed to post broadcast.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    const typedValue = replyText.trim();
    setReplyText('');

    try {
      // Save message in subcollection
      await addDoc(collection(db, 'chats', selectedThread.id, 'messages'), {
        sender: 'merchant',
        text: typedValue,
        createdAt: serverTimestamp()
      });

      // Update parent metadata to reflect last response from admin
      await setDoc(doc(db, 'chats', selectedThread.id), {
        lastMessage: typedValue,
        updatedAt: serverTimestamp(),
        unreadByAdmin: false,
        unreadByUser: true
      }, { merge: true });

    } catch (err) {
      console.error("Failed to send admin reply:", err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-daraz-bg flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-sm shadow-xl text-center max-w-md">
          <ShieldAlert size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Access Denied</h2>
          <p className="text-neutral-500 text-sm mb-8">This portal is restricted to authorized store administrators only.</p>
          <a href="/" className="inline-block bg-daraz-orange text-white px-8 py-3 font-bold uppercase text-[10px] tracking-widest hover:opacity-90">Back to Shop</a>
        </div>
      </div>
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError(null);
      await onAddProduct({
        ...newProduct,
        sellerId: user?.id || 'admin',
        sellerName: user?.name || 'Administrator',
        status: 'active'
      });
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: 0,
        category: 'Handicrafts',
        stock: 50,
        description: '',
        image: ''
      });
    } catch (err: any) {
      console.error("Save product error:", err);
      let errorMsg = err?.message || 'Failed to list product. Please check your permissions and try again.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.error) {
          errorMsg = `Firestore Error: ${parsed.error}`;
          if (parsed.error.includes("permissions") || parsed.error.includes("Permission denied")) {
            errorMsg = "Security Check: Missing or insufficient permissions. This normally occurs if you log in using only a PIN-code without Google Auth, which prevents secure writes to our Firestore Database. Please log in with your Google account first to securely authenticate, then open the admin dashboard.";
          }
        }
      } catch (px) {}
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      if (file.size > MAX_SIZE) {
        alert('Photo exceeds the 100MB size limit. Please select a smaller photo file.');
        return;
      }
      try {
        setCompressing(true);
        const compressedBase64 = await compressImage(file);
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: compressedBase64 });
        } else {
          setNewProduct({ ...newProduct, image: compressedBase64 });
        }
      } catch (err) {
        console.error("Error compressing image:", err);
        alert('Failed to process image. Try another photo file.');
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      try {
        setSubmitting(true);
        setSubmitError(null);
        await onUpdateProduct(editingProduct.id, editingProduct);
        setEditingProduct(null);
      } catch (err: any) {
        console.error("Edit product error:", err);
        let errorMsg = err?.message || 'Failed to update product.';
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errorMsg = `Firestore Error: ${parsed.error}`;
            if (parsed.error.includes("permissions") || parsed.error.includes("Permission denied")) {
              errorMsg = "Security Check: Missing or insufficient permissions. This normally occurs if you log in using only a PIN-code without Google Auth, which prevents secure writes to our Firestore Database. Please log in with your Google account first to securely authenticate, then open the admin dashboard.";
            }
          }
        } catch (px) {}
        setSubmitError(errorMsg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleQuickSeed = async () => {
    if (window.confirm('This will add all demo products to your database. Continue?')) {
      await productService.seedIfEmpty(true);
      alert('Demo products seeded successfully!');
    }
  };

  const handleDeleteAllProducts = async () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to delete ALL products from Nepali Mart? This action is irreversible.')) {
      try {
        await productService.deleteAllProducts();
        alert('All products successfully deleted from the database!');
      } catch (err) {
        console.error("Error deleting products:", err);
        alert('Failed to delete all products. Please check console.');
      }
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await orderService.updateOrderStatus(orderId, status);
  };

  const stats = {
    totalSales: orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0),
    totalOrders: orders.length,
    inventoryCount: products.length,
    customerCount: new Set(orders.map(o => o.customerId)).size
  };

  return (
    <div className="bg-daraz-bg min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-600">Admin Console</h1>
            <p className="text-neutral-500 font-medium uppercase text-[10px] tracking-widest mt-1">Management Console / v2.4.0</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleDeleteAllProducts}
              className="px-6 py-3 border-2 border-red-200 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 flex items-center gap-2 group transition-all rounded-sm shadow-sm"
              title="Delete all products from the database"
            >
              <Trash2 size={14} className="text-red-500 group-hover:scale-110 transition-transform" /> Delete All Products
            </button>
            <button 
              onClick={handleQuickSeed}
              className="px-6 py-3 border border-neutral-200 bg-white text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 flex items-center gap-2 group transition-all rounded-sm shadow-sm"
            >
              <Zap size={14} className="group-hover:text-daraz-orange" /> Quick Seed Demo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-sm shadow-sm flex items-center gap-4">
            <div className="p-3 bg-daraz-orange/10 rounded-full"><TrendingUp size={24} className="text-daraz-orange" /></div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Sales</p>
              <p className="text-xl font-black text-neutral-800">{formatCurrency(stats.totalSales)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full"><ShoppingCart size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Orders</p>
              <p className="text-xl font-black text-neutral-800">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><Package size={24} className="text-green-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Inventory Items</p>
              <p className="text-xl font-black text-neutral-800">{stats.inventoryCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full"><Users size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Unique Customers</p>
              <p className="text-xl font-black text-neutral-800">{stats.customerCount}</p>
            </div>
          </div>
        </div>

        {/* Management Area */}
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="flex border-b border-neutral-100">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === 'orders' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Recent Orders
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === 'products' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Product Management
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === 'messages' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Messages & Broadcasts
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'orders' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-[10px] font-black uppercase text-neutral-400 tracking-tighter">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-neutral-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                        <td className="px-4 py-4 font-bold text-neutral-400">...{order.id.slice(-6)}</td>
                        <td className="px-4 py-4">{order.customerName}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded-sm text-[9px] font-bold uppercase">{order.method}</span>
                        </td>
                        <td className="px-4 py-4 font-bold">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-4">
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={cn(
                              "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter outline-none border-none cursor-pointer bg-opacity-10",
                              order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                              order.status === 'shipped' ? "bg-blue-100 text-blue-700" :
                              order.status === 'delivered' ? "bg-green-100 text-green-700" :
                              "bg-red-100 text-red-700"
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-daraz-orange font-bold uppercase text-[10px] hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'products' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-tight italic">Inventory Overview</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-daraz-orange text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                  >
                    Add New Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-[10px] font-black uppercase text-neutral-400 tracking-tighter">
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3 text-right">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-neutral-700">
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-neutral-50">
                        <td className="px-4 py-3 border-r border-neutral-50 w-16">
                           <ProductImage src={product.image} alt="" category={product.category} className="w-10 h-10 object-cover rounded-sm" />
                        </td>
                        <td className="px-4 py-3 font-bold">{product.name}</td>
                        <td className="px-4 py-3 text-daraz-orange font-bold">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-sm font-bold",
                            product.stock < 10 ? "text-red-500 bg-red-50" : "text-green-600"
                          )}>
                            {product.stock} pcs
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-1">
                          <Clock size={12} className="text-neutral-400" /> {product.rating}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                              onClick={() => setEditingProduct(product)}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded transition-colors"
                             >
                              <Edit3 size={14} />
                             </button>
                             <button 
                              onClick={() => onDeleteProduct(product.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors"
                             >
                              <Trash2 size={14} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Notification Broadcaster */}
                <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-sm border border-neutral-100 flex flex-col space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                    <Bell className="text-daraz-orange" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-tight">Admin Notify Broadcaster</h3>
                  </div>

                  {broadcastSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-[11px] font-bold rounded-sm animate-pulse">
                      ✓ Broadcast sent successfully to shoppers in real-time!
                    </div>
                  )}
                  {broadcastError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-[11px] font-bold rounded-sm">
                      Error: {broadcastError}
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-neutral-400">Broadcast Channel / Category</label>
                      <select 
                        className="w-full bg-white border border-neutral-200 p-2.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-daraz-orange mt-1"
                        value={broadcastCategory}
                        onChange={(e: any) => setBroadcastCategory(e.target.value)}
                      >
                        <option value="promos">Promotional Alert (Promos)</option>
                        <option value="activities">Daily Activity Award (Activities)</option>
                        <option value="orders">Logistics Alerts / Order Updates (Orders)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-neutral-400">Notification Title</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Kathmandu Midnight Sale is LIVE!"
                        className="w-full bg-white border border-neutral-200 p-2 text-xs outline-none focus:border-daraz-orange mt-1"
                        value={broadcastTitle}
                        onChange={e => setBroadcastTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-neutral-400">Description Message</label>
                      <textarea 
                        required
                        placeholder="Type standard notification alert detail text here..."
                        className="w-full bg-white border border-neutral-200 p-2 text-xs outline-none focus:border-daraz-orange mt-1 h-20 resize-none"
                        value={broadcastDesc}
                        onChange={e => setBroadcastDesc(e.target.value)}
                      />
                    </div>

                    {broadcastCategory === 'promos' && (
                      <div className="space-y-3 p-3 bg-white border border-neutral-200 rounded-sm">
                        <p className="text-[8px] font-black text-daraz-orange uppercase tracking-widest border-b border-neutral-100 pb-1">Promotional Banner Extra Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Banner Title</label>
                            <input 
                              type="text" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100"
                              value={promoBannerTitle} onChange={e => setPromoBannerTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Banner Subtitle</label>
                            <input 
                              type="text" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100"
                              value={promoBannerSub} onChange={e => setPromoBannerSub(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Discount Label</label>
                            <input 
                              type="text" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100"
                              value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Badge Tag</label>
                            <input 
                              type="text" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100"
                              value={promoTag} onChange={e => setPromoTag(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {broadcastCategory === 'activities' && (
                      <div className="space-y-2 p-3 bg-white border border-neutral-200 rounded-sm">
                        <p className="text-[8px] font-black text-daraz-orange uppercase tracking-widest">Activity Reward Coins</p>
                        <div>
                          <label className="text-[8px] font-bold uppercase text-neutral-400">Gems/Points Reward String</label>
                          <input 
                            type="text" placeholder="e.g. +200 Gems" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100 mt-1"
                            value={activityPoints} onChange={e => setActivityPoints(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {broadcastCategory === 'orders' && (
                      <div className="space-y-3 p-3 bg-white border border-neutral-200 rounded-sm">
                        <p className="text-[8px] font-black text-daraz-orange uppercase tracking-widest border-b border-neutral-100 pb-1">Logistics / Order Tracking Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Order ID Key</label>
                            <input 
                              type="text" className="w-full bg-neutral-50 p-1.5 text-[10px] outline-none border border-neutral-100"
                              value={orderIdField} onChange={e => setOrderIdField(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase text-neutral-400">Logistics Status</label>
                            <select 
                              className="w-full bg-neutral-50 p-1 text-[10px] outline-none border"
                              value={orderStatusField} onChange={e => setOrderStatusField(e.target.value)}
                            >
                              <option value="In Transit">In Transit</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-daraz-orange text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-95 transition-opacity rounded-sm shadow-sm flex items-center justify-center gap-2"
                    >
                      <Bell size={12} /> Send Broadcast Notification
                    </button>
                  </form>
                </div>

                {/* Live Customer Chat Support Console */}
                <div className="lg:col-span-7 bg-white p-6 rounded-sm border border-neutral-100 flex flex-col h-[520px]">
                  <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
                    <MessageSquare className="text-blue-600" size={20} />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight">Live Customer Support</h3>
                      <p className="text-[9px] font-medium text-neutral-400 uppercase">Real-time interactions engine</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden pt-4 h-full">
                    {/* User threads side index */}
                    <div className="md:col-span-5 border-r border-neutral-100 pr-2 overflow-y-auto space-y-2 h-full max-h-[380px]">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-wider pb-1">Subscribers / Active Chats</p>
                      {chatThreads.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400 text-[10px] font-medium">No live chats yet.</div>
                      ) : (
                        chatThreads.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => setSelectedThread(thread)}
                            className={cn(
                              "w-full text-left p-2.5 rounded-sm flex flex-col space-y-1 transition-colors border",
                              selectedThread?.id === thread.id
                                ? "bg-blue-50/75 border-blue-200"
                                : "hover:bg-neutral-50 border-neutral-100"
                            )}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-[11px] text-neutral-800 truncate max-w-[100px]">
                                {thread.userName}
                              </span>
                              {thread.unreadByAdmin && (
                                <span className="w-2 h-2 rounded-full bg-daraz-orange shrink-0" title="Unread inquiry" />
                              )}
                            </div>
                            <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-tight">Inquiry Channel: {thread.senderName || 'General Support'}</span>
                            <span className="text-[10px] font-medium text-neutral-500 truncate max-w-[160px] block italic">
                              "{thread.lastMessage}"
                            </span>
                            <span className="text-[8px] text-neutral-400 block pt-1 text-right">{thread.time}</span>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Chat messaging display box */}
                    <div className="md:col-span-7 flex flex-col h-full bg-neutral-50 rounded-sm p-4 border border-neutral-100 overflow-hidden max-h-[380px]">
                      {selectedThread ? (
                        <>
                          {/* Thread Profile Header */}
                          <div className="border-b border-neutral-200 pb-2 mb-2 flex items-center justify-between shrink-0">
                            <div>
                              <p className="font-bold text-xs text-neutral-800">{selectedThread.userName}</p>
                              <p className="text-[9px] text-neutral-400">{selectedThread.userEmail}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tight text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              Active inquiry
                            </span>
                          </div>

                          {/* Message bubble track */}
                          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3 scrollbar-none">
                            {threadMessages.length === 0 ? (
                              <div className="text-center py-12 text-neutral-400 text-[10px] font-medium">Opening conversation stream...</div>
                            ) : (
                              threadMessages.map((msg) => (
                                <div 
                                  key={msg.id}
                                  className={cn(
                                    "flex flex-col space-y-0.5 max-w-[85%] rounded-sm p-2 text-[11px] line-clamp-none",
                                    msg.sender === 'merchant'
                                      ? "bg-daraz-orange text-white ml-auto"
                                      : "bg-white text-neutral-800 mr-auto border border-neutral-100"
                                  )}
                                >
                                  <p className="font-normal leading-relaxed break-words">{msg.text}</p>
                                  <span className={cn(
                                    "text-[7px] text-right block font-bold uppercase tracking-tight",
                                    msg.sender === 'merchant' ? "text-orange-100" : "text-neutral-400"
                                  )}>
                                    {msg.time}
                                  </span>
                                </div>
                              ))
                            )}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Reply input tray */}
                          <form onSubmit={handleSendReply} className="flex gap-2 border-t border-neutral-200 pt-2 shrink-0">
                            <input 
                              required
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={`Reply to ${selectedThread.userName}...`}
                              className="flex-1 bg-white border border-neutral-250 text-[11px] p-2 outline-none focus:border-daraz-orange rounded-sm"
                            />
                            <button 
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 text-xs font-bold rounded-sm shrink-0 flex items-center justify-center min-w-[36px]"
                            >
                              <Send size={12} />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <div className="p-4 bg-white rounded-full border shadow-sm text-neutral-400"><MessageSquare size={32} /></div>
                          <div>
                            <p className="font-black text-xs text-neutral-700 uppercase tracking-wider">No selected conversation</p>
                            <p className="text-[10px] text-neutral-400 max-w-[200px] mx-auto mt-1">Select an active customer chat thread from the left hand side index list to load live chat histories and start responding instantly.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-left">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl p-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600 mb-6">Edit Listing</h2>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-xs font-bold rounded-sm mb-4 leading-relaxed">
                {submitError}
              </div>
            )}
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Name</label>
                  <input 
                    required 
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-blue-500" 
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Price (NPR)</label>
                  <input 
                    required type="number"
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-blue-500" 
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Stock</label>
                  <input 
                    required type="number"
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-blue-500" 
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Image (Supports up to 100MB)</label>
                  <div className="flex gap-4 items-start">
                    {editingProduct.image && (
                      <div className="relative w-24 h-24 shrink-0">
                        <img src={editingProduct.image} className="w-full h-full object-cover rounded-sm border border-neutral-200" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => setEditingProduct({...editingProduct, image: ''})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {compressing ? (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-daraz-orange rounded-sm p-4 h-24 bg-orange-50/20">
                        <div className="w-5 h-5 border-2 border-daraz-orange border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[8px] font-black uppercase text-daraz-orange tracking-widest animate-pulse">OPTIMIZING PHOTO...</span>
                        <span className="text-[7px] text-neutral-400 font-bold uppercase tracking-wider">PREPARING ULTRA HIGH-RES FILE</span>
                      </div>
                    ) : (
                      <label className={cn(
                        "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm p-4 hover:border-blue-500 transition-colors cursor-pointer",
                        !editingProduct.image ? "h-24" : "h-24"
                      )}>
                        <Upload size={20} className="text-neutral-400 mb-1" />
                        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Change Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl p-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-daraz-orange mb-6">Create New Listing</h2>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-xs font-bold rounded-sm mb-4 leading-relaxed">
                {submitError}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Name</label>
                  <input 
                    required 
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-daraz-orange" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Price (NPR)</label>
                  <input 
                    required type="number"
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-daraz-orange" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Stock</label>
                  <input 
                    required type="number"
                    className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-daraz-orange" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Image (Supports up to 100MB)</label>
                  <div className="flex gap-4 items-start">
                    {newProduct.image ? (
                      <div className="relative w-24 h-24 shrink-0">
                        <img src={newProduct.image} className="w-full h-full object-cover rounded-sm border border-neutral-200" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => setNewProduct({...newProduct, image: ''})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : null}
                    {compressing ? (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-daraz-orange rounded-sm p-4 h-24 bg-orange-50/20">
                        <div className="w-5 h-5 border-2 border-daraz-orange border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[8px] font-black uppercase text-daraz-orange tracking-widest animate-pulse">OPTIMIZING PHOTO...</span>
                        <span className="text-[7px] text-neutral-400 font-bold uppercase tracking-wider">PREPARING ULTRA HIGH-RES FILE</span>
                      </div>
                    ) : (
                      <label className={cn(
                        "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm p-4 hover:border-daraz-orange transition-colors cursor-pointer",
                        !newProduct.image ? "h-24" : "h-24"
                      )}>
                        <Upload size={20} className="text-neutral-400 mb-1" />
                        <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">{newProduct.image ? 'Change Photo' : 'Upload Product Photo'}</span>
                        <input type="file" className="hidden" accept="image/*" required={!newProduct.image} onChange={(e) => handleImageUpload(e, false)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-400">Description</label>
                <textarea 
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 p-2 text-sm outline-none focus:border-daraz-orange h-24 resize-none" 
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-3 bg-daraz-orange text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 p-6 text-white flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Order Details</h2>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">ID: {selectedOrder.id}</p>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white uppercase font-black text-[10px] tracking-widest">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               {/* Customer & Address */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-100 pb-2">Customer Info</h3>
                    <div>
                      <p className="text-xs text-neutral-400 font-bold uppercase">Name</p>
                      <p className="text-sm font-black text-neutral-800 tracking-tight">{selectedOrder.address.fullName || selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-bold uppercase">Phone</p>
                      <p className="text-sm font-black text-neutral-800 tracking-tight">{selectedOrder.address.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-100 pb-2">Shipping Address</h3>
                    <div className="bg-neutral-50 p-4 rounded-sm space-y-2">
                       <p className="text-sm font-bold text-neutral-800">
                        {selectedOrder.address.details}, {selectedOrder.address.area.name}
                       </p>
                       <p className="text-xs text-neutral-500 font-medium">
                        {selectedOrder.address.city}, {selectedOrder.address.province}
                       </p>
                    </div>
                  </div>
               </div>

               {/* Order Items */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-100 pb-2">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-neutral-100 rounded-sm">
                        <div className="flex items-center gap-4">
                           <img src={item.image || null} alt="" className="w-10 h-10 object-cover rounded-sm" />
                           <div>
                              <p className="text-sm font-black text-neutral-800 tracking-tight">{item.name}</p>
                              <p className="text-[10px] font-bold text-neutral-400 uppercase">{item.quantity} x {formatCurrency(item.price)}</p>
                           </div>
                        </div>
                        <p className="text-sm font-black text-neutral-800">{formatCurrency(item.quantity * item.price)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center py-4 border-t-2 border-neutral-900 mt-4">
                     <p className="text-xs font-black uppercase tracking-widest">Total Amount</p>
                     <p className="text-xl font-black text-daraz-orange">{formatCurrency(selectedOrder.total)}</p>
                  </div>
               </div>

               {/* Payment & Meta */}
               <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-sm">
                  <div>
                    <p className="text-[8px] font-black text-neutral-400 uppercase">Payment Method</p>
                    <p className="text-xs font-black text-neutral-800 uppercase tracking-widest">{selectedOrder.method}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-neutral-400 uppercase">Current Status</p>
                    <p className="text-xs font-black text-daraz-orange uppercase tracking-widest">{selectedOrder.status}</p>
                  </div>
               </div>
            </div>
            
            <div className="bg-neutral-50 p-6 border-t border-neutral-100 flex gap-4">
               <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90"
               >
                Mark as Shipped
               </button>
               <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                className="flex-1 bg-green-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90"
               >
                Mark as Delivered
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
