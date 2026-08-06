import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '../types';
import { Package, ShoppingCart, TrendingUp, Users, Edit3, Trash2, CheckCircle, Clock, ShieldAlert, Zap, Plus, Upload, X, MessageSquare, Bell, Send, User as UserIcon, Link as LinkIcon, Globe, Video as VideoIcon, Play, Sparkles, ExternalLink, RefreshCw, FileText, Layers, Truck, Save } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useFirebase } from '../context/FirebaseContext';
import { ProductImage } from '../components/ProductImage';
import { formatVideoEmbedUrl, PRESET_PRODUCT_VIDEOS } from '../lib/videoUtils';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CATEGORIES } from '../constants';

const PRESET_PRODUCT_IMAGES = [
  { name: 'Earbuds', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
  { name: 'Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sandals', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800' },
  { name: 'Biker Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
  { name: 'Beauty Set', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800' }
];

const processVideoFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size <= 15 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      resolve(objectUrl);
    }
  });
};

const parseProductFromUrl = (inputUrl: string) => {
  let url = inputUrl.trim();
  if (!url) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let domain = 'Online Store';
  if (url.includes('amazon.')) domain = 'Amazon';
  else if (url.includes('flipkart.')) domain = 'Flipkart';
  else if (url.includes('daraz.')) domain = 'Daraz';
  else if (url.includes('myntra.')) domain = 'Myntra';
  else if (url.includes('ebay.')) domain = 'eBay';
  else if (url.includes('walmart.')) domain = 'Walmart';
  else if (url.includes('alibaba.') || url.includes('aliexpress.')) domain = 'AliExpress';

  let cleanName = '';
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, '');
    const pathParts = pathname.split('/').filter(p => p.length > 2 && !p.includes('.html') && !p.startsWith('dp') && !p.startsWith('p') && !p.match(/^[0-9a-f]{8,}$/i));
    cleanName = pathParts.join(' ');
  } catch (e) {
    cleanName = url;
  }

  cleanName = cleanName
    .replace(/[-_]/g, ' ')
    .replace(/\b(pd|dp|gp|product|item|ref|qid|sr|buy|online)\b/gi, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanName.length < 4) {
    cleanName = `${domain} Featured Product`;
  } else {
    cleanName = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  const nameLower = cleanName.toLowerCase();
  let category = 'Fashion & Clothing';
  let image = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
  let estimatedPrice = 2450;

  if (nameLower.includes('phone') || nameLower.includes('iphone') || nameLower.includes('samsung') || nameLower.includes('earbud') || nameLower.includes('headphone') || nameLower.includes('watch') || nameLower.includes('laptop') || nameLower.includes('electronics') || nameLower.includes('gadget') || nameLower.includes('bluetooth') || nameLower.includes('buds')) {
    category = 'Electronics & Gadgets';
    image = nameLower.includes('watch')
      ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
      : nameLower.includes('earbud') || nameLower.includes('headphone') || nameLower.includes('buds')
      ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    estimatedPrice = 14500;
  } else if (nameLower.includes('sandal') || nameLower.includes('shoe') || nameLower.includes('shirt') || nameLower.includes('dress') || nameLower.includes('jacket') || nameLower.includes('wear') || nameLower.includes('fashion') || nameLower.includes('cloth') || nameLower.includes('boot')) {
    category = 'Fashion & Clothing';
    image = nameLower.includes('sandal') || nameLower.includes('shoe')
      ? 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800';
    estimatedPrice = 1950;
  } else if (nameLower.includes('bag') || nameLower.includes('wallet') || nameLower.includes('backpack')) {
    category = 'Fashion & Clothing';
    image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800';
    estimatedPrice = 2800;
  } else if (nameLower.includes('tea') || nameLower.includes('food') || nameLower.includes('grocery') || nameLower.includes('snack') || nameLower.includes('honey')) {
    category = 'Groceries & Foods';
    image = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800';
    estimatedPrice = 850;
  } else if (nameLower.includes('craft') || nameLower.includes('wood') || nameLower.includes('statue') || nameLower.includes('decor')) {
    category = 'Handicrafts & Decor';
    image = 'https://images.unsplash.com/photo-1606744888344-49423b812d02?auto=format&fit=crop&q=80&w=800';
    estimatedPrice = 3800;
  }

  return {
    name: cleanName,
    price: estimatedPrice,
    category,
    stock: 35,
    description: `Original authentic item imported from ${domain}. Direct specs, premium build quality, warranty coverage, and express delivery across Nepal. Source: ${url}`,
    image,
    videoUrl: '',
    sourceDomain: domain,
    originalUrl: url
  };
};

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

export default function AdminDashboard({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onDeleteAllProducts }: { 
  products: Product[], 
  onAddProduct: (p: any) => void,
  onUpdateProduct: (id: string, p: any) => void,
  onDeleteProduct: (id: string) => void,
  onDeleteAllProducts?: () => void
}) {
  const { 
    user, 
    loading, 
    nativePermission, 
    requestNotificationPermission, 
    dispatchNotification 
  } = useFirebase();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'messages' | 'driver'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Link Product Importer State
  const [importUrl, setImportUrl] = useState('');
  const [importedProduct, setImportedProduct] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'Handicrafts & Decor',
    stock: 50,
    description: '',
    image: '',
    videoUrl: ''
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

  // Driver Fleet & Assignment State
  const [drivers, setDrivers] = useState([
    {
      id: 'drv_1',
      name: 'Subash Tamang',
      phone: '+977 981-3255901',
      vehicle: 'Bajaj Pulsar (Ba 2 Pa 5620)',
      hub: 'Kathmandu Central Hub',
      status: 'On Duty',
      rating: '4.9'
    },
    {
      id: 'drv_2',
      name: 'Ramesh Shrestha',
      phone: '+977 984-1122334',
      vehicle: 'Yamaha FZ (Ba 3 Pa 9812)',
      hub: 'Lalitpur Hub',
      status: 'On Duty',
      rating: '4.8'
    },
    {
      id: 'drv_3',
      name: 'Bikash Sunuwar',
      phone: '+977 980-8765432',
      vehicle: 'TVS NTorq (Ba 4 Pa 3311)',
      hub: 'Bhaktapur Hub',
      status: 'On Duty',
      rating: '4.9'
    },
    {
      id: 'drv_4',
      name: 'Saroj Rai',
      phone: '+977 986-5544332',
      vehicle: 'Honda Shine (Ba 1 Pa 4400)',
      hub: 'Thamel Dispatch Hub',
      status: 'On Duty',
      rating: '5.0'
    }
  ]);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [driverViewMode, setDriverViewMode] = useState<'cards' | 'direct_table'>('direct_table');
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    hub: 'Kathmandu Central Hub',
    status: 'On Duty'
  });
  
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
        videoUrl: newProduct.videoUrl ? newProduct.videoUrl.trim() : undefined,
        sellerId: user?.id || 'admin',
        sellerName: user?.name || 'Administrator',
        status: 'active',
        addedByAdmin: true,
        addedViaMerchantPortal: false
      });
      setShowAddModal(false);
      setNewProduct({
        name: '',
        price: 0,
        category: 'Handicrafts & Decor',
        stock: 50,
        description: '',
        image: '',
        videoUrl: ''
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

  const handleVideoUploadForNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setVideoProcessing(true);
        const processed = await processVideoFile(file);
        setNewProduct(prev => ({ ...prev, videoUrl: processed }));
      } catch (err) {
        alert('Could not process video file.');
      } finally {
        setVideoProcessing(false);
      }
    }
  };

  const handleVideoUploadForEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      try {
        setVideoProcessing(true);
        const processed = await processVideoFile(file);
        setEditingProduct({ ...editingProduct, videoUrl: processed });
      } catch (err) {
        alert('Could not process video file.');
      } finally {
        setVideoProcessing(false);
      }
    }
  };

  const handleVideoUploadForImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && importedProduct) {
      try {
        setVideoProcessing(true);
        const processed = await processVideoFile(file);
        setImportedProduct({ ...importedProduct, videoUrl: processed });
      } catch (err) {
        alert('Could not process video file.');
      } finally {
        setVideoProcessing(false);
      }
    }
  };

  const handleFetchUrlProduct = async (targetUrl?: string) => {
    const urlToParse = targetUrl || importUrl;
    if (!urlToParse.trim()) return;

    setIsImporting(true);
    setImportSuccessMsg(null);
    setImportUrl(urlToParse);

    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToParse })
      });

      if (res.ok) {
        const data = await res.json();
        setImportedProduct(data);
      } else {
        const fallback = parseProductFromUrl(urlToParse);
        setImportedProduct(fallback);
      }
    } catch (err) {
      console.warn("AI URL scraper endpoint error, using fallback parser:", err);
      const fallback = parseProductFromUrl(urlToParse);
      setImportedProduct(fallback);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePublishImportedProduct = async () => {
    if (!importedProduct) return;
    try {
      setSubmitting(true);
      await onAddProduct({
        name: importedProduct.name,
        price: Number(importedProduct.price),
        category: importedProduct.category,
        stock: Number(importedProduct.stock) || 35,
        description: importedProduct.description,
        image: importedProduct.image,
        videoUrl: importedProduct.videoUrl ? importedProduct.videoUrl.trim() : undefined,
        sellerId: user?.id || 'admin',
        sellerName: `${importedProduct.sourceDomain || 'Global'} Import`,
        status: 'active'
      });
      setImportSuccessMsg(`Successfully imported "${importedProduct.name}" into store inventory!`);
      dispatchNotification("Product Imported!", `"${importedProduct.name}" was imported from link and published live.`, "promos");
      setImportedProduct(null);
      setImportUrl('');
    } catch (err: any) {
      console.error("Error publishing imported product:", err);
      alert(err?.message || "Failed to publish imported product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      try {
        setSubmitting(true);
        setSubmitError(null);
        await onUpdateProduct(editingProduct.id, {
          ...editingProduct,
          videoUrl: editingProduct.videoUrl ? editingProduct.videoUrl.trim() : undefined
        });
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

  const handleUpdateStatus = async (orderId: string, status: string, driverStatus?: string) => {
    const finalDriverStatus = driverStatus || status;
    await orderService.updateOrderStatus(orderId, status, finalDriverStatus);
    dispatchNotification("Delivery Status Updated!", `Order #${orderId.substring(0, 8).toUpperCase()} status set to "${finalDriverStatus}".`, "orders");
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverFormData.name.trim() || !driverFormData.phone.trim()) {
      alert("Please provide both Driver Name and Phone Number.");
      return;
    }

    if (editingDriver) {
      // Edit existing driver
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? {
        ...d,
        name: driverFormData.name,
        phone: driverFormData.phone,
        vehicle: driverFormData.vehicle || 'Delivery Scooter',
        hub: driverFormData.hub,
        status: driverFormData.status
      } : d));
      
      // Also update any orders assigned to this driver
      orders.forEach(async (ord) => {
        if (ord.driverId === editingDriver.id || ord.driverName === editingDriver.name) {
          await orderService.assignDriverToOrder(ord.id, {
            driverId: editingDriver.id,
            driverName: driverFormData.name,
            driverPhone: driverFormData.phone,
            driverVehicle: driverFormData.vehicle || 'Delivery Scooter'
          });
        }
      });

      dispatchNotification("Driver Profile Updated!", `Updated ${driverFormData.name}'s info (${driverFormData.phone}).`, "orders");
    } else {
      // Create new driver
      const newDrv = {
        id: 'drv_' + Date.now(),
        name: driverFormData.name,
        phone: driverFormData.phone,
        vehicle: driverFormData.vehicle || 'Delivery Scooter',
        hub: driverFormData.hub,
        status: driverFormData.status,
        rating: '5.0'
      };
      setDrivers(prev => [...prev, newDrv]);
      dispatchNotification("New Driver Registered!", `Registered ${newDrv.name} (${newDrv.phone}) to ${newDrv.hub}.`, "orders");
    }

    setShowAddDriverModal(false);
    setEditingDriver(null);
    setDriverFormData({
      name: '',
      phone: '',
      vehicle: '',
      hub: 'Kathmandu Central Hub',
      status: 'On Duty'
    });
  };

  const handleAssignDriverToOrder = async (orderId: string, driverObj: any) => {
    await orderService.assignDriverToOrder(orderId, {
      driverId: driverObj.id,
      driverName: driverObj.name,
      driverPhone: driverObj.phone,
      driverVehicle: driverObj.vehicle
    });
    dispatchNotification(
      "Courier Assigned to Order!", 
      `Order #${orderId.substring(0,8).toUpperCase()} assigned to ${driverObj.name} (${driverObj.phone}).`, 
      "orders"
    );
  };

  const handleDirectUpdateDriver = (driverId: string, field: string, value: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const updated = { ...d, [field]: value };
        // Sync assigned orders in real time
        orders.forEach(async (ord) => {
          if (ord.driverId === driverId || ord.driverName === d.name) {
            await orderService.assignDriverToOrder(ord.id, {
              driverId: driverId,
              driverName: updated.name,
              driverPhone: updated.phone,
              driverVehicle: updated.vehicle
            });
          }
        });
        return updated;
      }
      return d;
    }));
  };

  const handleDeleteDriver = (driverId: string, name: string) => {
    if (confirm(`Are you sure you want to delete driver "${name}" from the fleet?`)) {
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      dispatchNotification("Driver Removed", `Driver ${name} was removed from the fleet.`, "orders");
    }
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
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                setActiveTab('messages');
                setTimeout(() => {
                  const el = document.getElementById('management-area');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}
              className="px-6 py-3 border-2 border-blue-500 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 flex items-center gap-2 group transition-all rounded-sm shadow-md cursor-pointer shrink-0"
              title="Send broadcast notifications and respond to live support chats"
            >
              <MessageSquare size={14} className="text-white animate-pulse" /> Send Alert / Direct Message
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
        <div id="management-area" className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="flex border-b border-neutral-100 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0",
                activeTab === 'orders' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Recent Orders
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0",
                activeTab === 'products' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Product Management
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0",
                activeTab === 'messages' ? "border-daraz-orange text-daraz-orange" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              Messages & Broadcasts
            </button>
            <button 
              onClick={() => setActiveTab('driver')}
              className={cn(
                "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 flex items-center gap-2",
                activeTab === 'driver' ? "border-daraz-orange text-daraz-orange font-black" : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              <Truck size={14} className={activeTab === 'driver' ? "text-daraz-orange" : ""} /> Driver Dashboard
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
                      <th className="px-4 py-3">Order Status</th>
                      <th className="px-4 py-3">Driver Status Toggle</th>
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
                              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight outline-none border cursor-pointer transition-colors shadow-2xs",
                              order.status === 'pending' || order.status === 'processing' ? "bg-amber-50 text-amber-800 border-amber-200" :
                              order.status === 'in transit' || order.status === 'in-transit' ? "bg-purple-50 text-purple-800 border-purple-200" :
                              order.status === 'out for delivery' ? "bg-sky-50 text-sky-800 border-sky-200 font-extrabold" :
                              order.status === 'shipped' ? "bg-blue-50 text-blue-800 border-blue-200" :
                              order.status === 'delivered' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                              "bg-rose-50 text-rose-800 border-rose-200"
                            )}
                          >
                            <option value="pending">🏪 Pending / Prep</option>
                            <option value="in transit">🚚 In Transit</option>
                            <option value="out for delivery">🛵 Out for Delivery</option>
                            <option value="shipped">📦 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md border border-neutral-200/80 w-fit">
                            <button
                              type="button"
                              title="Set Driver Status: In Transit"
                              onClick={() => handleUpdateStatus(order.id, 'in transit')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer flex items-center gap-1",
                                order.status === 'in transit' ? "bg-purple-600 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-200"
                              )}
                            >
                              🚚 Transit
                            </button>
                            <button
                              type="button"
                              title="Set Driver Status: Out for Delivery"
                              onClick={() => handleUpdateStatus(order.id, 'out for delivery')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer flex items-center gap-1",
                                order.status === 'out for delivery' ? "bg-sky-600 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-200"
                              )}
                            >
                              🛵 Delivery
                            </button>
                            <button
                              type="button"
                              title="Set Driver Status: Delivered"
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className={cn(
                                "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer flex items-center gap-1",
                                order.status === 'delivered' ? "bg-emerald-600 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-200"
                              )}
                            >
                              ✅ Done
                            </button>
                          </div>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight italic">Inventory Overview</h3>
                    <p className="text-[10px] text-neutral-400 font-medium">Manage existing items in store inventory</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-daraz-orange text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Plus size={12} /> Add New Product
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-[10px] font-black uppercase text-neutral-400 tracking-tighter">
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Video</th>
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
                        <td className="px-4 py-3 font-bold">
                          <div>{product.name}</div>
                          {product.sellerName && (
                            <span className="text-[9px] font-medium text-neutral-400">Seller: {product.sellerName}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-daraz-orange font-bold">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-sm font-bold",
                            product.stock < 10 ? "text-red-500 bg-red-50" : "text-green-600"
                          )}>
                            {product.stock} pcs
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.videoUrl ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-sm text-[9px] font-bold uppercase" title={product.videoUrl}>
                              <VideoIcon size={10} /> Video
                            </span>
                          ) : (
                            <span className="text-neutral-300 text-[10px] font-normal">None</span>
                          )}
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

                  {/* Browser Push Control Service */}
                  <div className="bg-white border text-left border-neutral-200 p-4 rounded-sm flex flex-col space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b pb-2 border-neutral-100">
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-800">Browser System Push Service</p>
                        <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-tight mt-0.5">Device Permission Status</p>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shrink-0",
                        nativePermission === 'granted' ? "bg-green-50 text-green-600 border border-green-100" :
                        nativePermission === 'denied' ? "bg-red-50 text-red-500 border border-red-100" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      )}>
                        {nativePermission === 'granted' ? '● OS AUTHORIZED' :
                         nativePermission === 'denied' ? '✖ OS BLOCKED' :
                         nativePermission === 'unsupported' ? '⚠ OS UNSUPPORTED' :
                         '● DEFAULTS'}
                      </span>
                    </div>
                    
                    <p className="text-[9px] text-neutral-500 leading-relaxed font-semibold">
                      Enable real-time push alerts to receive system alarms.
                      {nativePermission === 'unsupported' && (
                        <span className="block mt-1 text-amber-700 bg-amber-50 p-1.5 rounded-sm border border-amber-200 font-bold">
                          Note: OS System Popups are unsupported in mobile WebView / iframe previews. In-App push banners & audio chimes are fully ACTIVE and working for all users!
                        </span>
                      )}
                      {nativePermission === 'denied' && (
                        <span className="block mt-1 text-red-600 bg-red-50 p-1.5 rounded-sm border border-red-200 font-bold">
                          Note: Browser OS popups are blocked in browser site permissions. In-App push banners & audio chimes remain fully functional.
                        </span>
                      )}
                    </p>

                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={async () => {
                          const res = await requestNotificationPermission();
                          if (res === 'granted') {
                            dispatchNotification("Notifications Activated!", "Nepali Mart system notifications are now fully authorized.", "promos");
                          } else {
                            // Perfect fallback for mobile WebViews / App-wrappers
                            dispatchNotification(
                              "In-App Chime Active! 🔊",
                              "Standard web-push is blocked by the app wrapper, but we successfully turned on high-fidelity live audio & in-app banners for you!",
                              "promos"
                            );
                          }
                        }}
                        className="flex-1 bg-neutral-950 hover:bg-neutral-850 text-white text-[9px] font-bold uppercase tracking-wider py-2 px-2.5 rounded-sm text-center transition-colors cursor-pointer"
                      >
                        🔑 Enable Desk Push
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          dispatchNotification(
                            "Device Alert Chime Tested! 🔔",
                            "High-fidelity visual banner & audio tone connected successfully.",
                            "promos"
                          );
                        }}
                        className="flex-1 bg-white border border-neutral-250 text-neutral-800 hover:bg-neutral-50 text-[9px] font-bold uppercase tracking-wider py-2 px-2.5 rounded-sm text-center transition-colors cursor-pointer"
                      >
                        🔊 Live Chime Test
                      </button>
                    </div>
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

            {activeTab === 'driver' && (
              <div className="space-y-6 text-left">
                {/* Driver Dispatcher Header Card */}
                <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 text-white p-6 rounded-md shadow-md border border-neutral-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Truck size={160} className="text-daraz-orange" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-daraz-orange/20 border-2 border-daraz-orange flex items-center justify-center text-2xl shadow-inner shrink-0">
                        👨🏽‍✈️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black uppercase tracking-tight text-white">Driver Dispatch Console</h2>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Sync
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 font-medium mt-0.5">
                          Assigned Courier: <strong className="text-daraz-orange">Subash Tamang</strong> (Bajaj Pulsar Ba 2 Pa 5620) • KTM Hub Dispatch
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Updates made here automatically reflect in real-time on the customer's live order tracking map & status timeline.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
                          if (activeOrders.length === 0) {
                            alert("No active orders available to advance.");
                            return;
                          }
                          for (const ord of activeOrders) {
                            const cur = (ord.driverStatus || ord.status || '').toLowerCase();
                            let next = 'in transit';
                            if (cur === 'pending' || cur === 'processing') next = 'in transit';
                            else if (cur === 'in transit' || cur === 'in-transit') next = 'out for delivery';
                            else if (cur === 'out for delivery') next = 'arrived';
                            else if (cur === 'arrived') next = 'delivered';
                            
                            await handleUpdateStatus(ord.id, next, next);
                          }
                        }}
                        className="bg-daraz-orange hover:bg-orange-600 text-white px-4 py-2.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                      >
                        <Zap size={14} /> Auto-Advance All Active Drivers (+1 Step)
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-neutral-800">
                    <div className="bg-neutral-800/60 p-3 rounded border border-neutral-700/60 text-center">
                      <p className="text-[8.5px] font-black text-neutral-400 uppercase tracking-wider">Total Active Orders</p>
                      <p className="text-xl font-black text-white mt-0.5">{orders.filter(o => o.status !== 'cancelled').length}</p>
                    </div>
                    <div className="bg-neutral-800/60 p-3 rounded border border-neutral-700/60 text-center">
                      <p className="text-[8.5px] font-black text-purple-400 uppercase tracking-wider">🚚 In Transit</p>
                      <p className="text-xl font-black text-purple-300 mt-0.5">
                        {orders.filter(o => (o.driverStatus || o.status || '').toLowerCase().includes('transit')).length}
                      </p>
                    </div>
                    <div className="bg-neutral-800/60 p-3 rounded border border-neutral-700/60 text-center">
                      <p className="text-[8.5px] font-black text-sky-400 uppercase tracking-wider">🛵 Out for Delivery</p>
                      <p className="text-xl font-black text-sky-300 mt-0.5">
                        {orders.filter(o => (o.driverStatus || o.status || '').toLowerCase().includes('out for delivery')).length}
                      </p>
                    </div>
                    <div className="bg-neutral-800/60 p-3 rounded border border-neutral-700/60 text-center">
                      <p className="text-[8.5px] font-black text-emerald-400 uppercase tracking-wider">📍 Arrived at Location</p>
                      <p className="text-xl font-black text-emerald-300 mt-0.5">
                        {orders.filter(o => (o.driverStatus || o.status || '').toLowerCase().includes('arrived')).length}
                      </p>
                    </div>
                    <div className="bg-neutral-800/60 p-3 rounded border border-neutral-700/60 text-center">
                      <p className="text-[8.5px] font-black text-green-400 uppercase tracking-wider">✅ Delivered Today</p>
                      <p className="text-xl font-black text-green-300 mt-0.5">
                        {orders.filter(o => (o.driverStatus || o.status || '').toLowerCase() === 'delivered').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver Fleet Roster & Fleet Management */}
                <div className="bg-white rounded-md border border-neutral-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                        👨🏽‍✈️ Courier Fleet & Driver Roster ({drivers.length} Drivers)
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        Manage active drivers, update phone numbers, vehicle details directly or register new drivers for delivery dispatches.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      {/* View Switcher */}
                      <div className="bg-neutral-200/80 p-0.5 rounded flex items-center gap-0.5 text-[9px] font-black uppercase">
                        <button
                          type="button"
                          onClick={() => setDriverViewMode('direct_table')}
                          className={cn(
                            "px-2.5 py-1 rounded transition-colors cursor-pointer",
                            driverViewMode === 'direct_table' ? "bg-white text-daraz-orange shadow-2xs font-black" : "text-neutral-600 hover:text-neutral-900"
                          )}
                        >
                          ✏️ Direct Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setDriverViewMode('cards')}
                          className={cn(
                            "px-2.5 py-1 rounded transition-colors cursor-pointer",
                            driverViewMode === 'cards' ? "bg-white text-daraz-orange shadow-2xs font-black" : "text-neutral-600 hover:text-neutral-900"
                          )}
                        >
                          🎴 Cards View
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingDriver(null);
                          setDriverFormData({
                            name: '',
                            phone: '',
                            vehicle: '',
                            hub: 'Kathmandu Central Hub',
                            status: 'On Duty'
                          });
                          setShowAddDriverModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                      >
                        <Plus size={14} /> Add Driver
                      </button>
                    </div>
                  </div>

                  {/* DIRECT TABLE EDITOR MODE */}
                  {driverViewMode === 'direct_table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-100/80 text-[9px] font-black uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
                            <th className="p-3">Driver Name</th>
                            <th className="p-3">Phone Number</th>
                            <th className="p-3">Vehicle Details</th>
                            <th className="p-3">Dispatch Hub</th>
                            <th className="p-3">Duty Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/80 text-xs font-semibold">
                          {drivers.map((drv) => (
                            <tr key={drv.id} className="hover:bg-amber-50/30 transition-colors">
                              {/* Driver Name Input */}
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">👨🏽‍✈️</span>
                                  <input
                                    type="text"
                                    value={drv.name}
                                    onChange={(e) => handleDirectUpdateDriver(drv.id, 'name', e.target.value)}
                                    placeholder="Driver name..."
                                    className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs font-bold text-neutral-900 focus:border-daraz-orange focus:ring-1 focus:ring-daraz-orange outline-none w-full max-w-[160px]"
                                  />
                                </div>
                              </td>

                              {/* Direct Phone Input */}
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={drv.phone}
                                  onChange={(e) => handleDirectUpdateDriver(drv.id, 'phone', e.target.value)}
                                  placeholder="Phone number..."
                                  className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs font-bold text-daraz-orange focus:border-daraz-orange focus:ring-1 focus:ring-daraz-orange outline-none w-full max-w-[150px]"
                                />
                              </td>

                              {/* Direct Vehicle Input */}
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={drv.vehicle}
                                  onChange={(e) => handleDirectUpdateDriver(drv.id, 'vehicle', e.target.value)}
                                  placeholder="Vehicle info..."
                                  className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs font-medium text-neutral-800 focus:border-daraz-orange focus:ring-1 focus:ring-daraz-orange outline-none w-full max-w-[180px]"
                                />
                              </td>

                              {/* Dispatch Hub Select */}
                              <td className="p-2.5">
                                <select
                                  value={drv.hub}
                                  onChange={(e) => handleDirectUpdateDriver(drv.id, 'hub', e.target.value)}
                                  className="bg-white border border-neutral-300 rounded px-2 py-1 text-[11px] font-bold text-neutral-800 focus:border-daraz-orange outline-none cursor-pointer"
                                >
                                  <option value="Kathmandu Central Hub">Kathmandu Central Hub</option>
                                  <option value="Lalitpur Hub">Lalitpur Hub</option>
                                  <option value="Bhaktapur Hub">Bhaktapur Hub</option>
                                  <option value="Thamel Dispatch Hub">Thamel Dispatch Hub</option>
                                </select>
                              </td>

                              {/* Duty Status Select */}
                              <td className="p-2.5">
                                <select
                                  value={drv.status}
                                  onChange={(e) => handleDirectUpdateDriver(drv.id, 'status', e.target.value)}
                                  className={cn(
                                    "border rounded px-2 py-1 text-[10px] font-black uppercase outline-none cursor-pointer",
                                    drv.status === 'On Duty' ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                                    drv.status === 'In Transit' ? "bg-amber-50 text-amber-800 border-amber-300" :
                                    "bg-neutral-100 text-neutral-700 border-neutral-300"
                                  )}
                                >
                                  <option value="On Duty">🟢 On Duty</option>
                                  <option value="In Transit">🚚 In Transit</option>
                                  <option value="Off Duty">🔴 Off Duty</option>
                                </select>
                              </td>

                              {/* Action Buttons */}
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingDriver(drv);
                                      setDriverFormData({
                                        name: drv.name,
                                        phone: drv.phone,
                                        vehicle: drv.vehicle,
                                        hub: drv.hub,
                                        status: drv.status
                                      });
                                      setShowAddDriverModal(true);
                                    }}
                                    title="Open Full Modal Editor"
                                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDriver(drv.id, drv.name)}
                                    title="Delete Driver"
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* CARDS GRID VIEW */
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {drivers.map((drv) => (
                        <div key={drv.id} className="bg-neutral-50/80 p-3.5 rounded-lg border border-neutral-200 space-y-2.5 relative flex flex-col justify-between hover:border-neutral-300 transition-all">
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-full bg-daraz-orange/15 border border-daraz-orange/30 flex items-center justify-center text-sm font-black shrink-0">
                                  👨🏽‍✈️
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-neutral-900 leading-tight">{drv.name}</h4>
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">⭐ {drv.rating}</span>
                                </div>
                              </div>
                              <span className={cn(
                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                                drv.status === 'On Duty' ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-neutral-100 text-neutral-600 border-neutral-200"
                              )}>
                                {drv.status}
                              </span>
                            </div>

                            <div className="text-[10.5px] space-y-0.5 text-neutral-600 font-medium pt-1">
                              <p className="flex items-center gap-1 font-bold text-daraz-orange">
                                📞 {drv.phone}
                              </p>
                              <p className="flex items-center gap-1">
                                🛵 {drv.vehicle}
                              </p>
                              <p className="text-[9.5px] text-neutral-400 font-semibold">
                                📍 {drv.hub}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDriver(drv);
                                setDriverFormData({
                                  name: drv.name,
                                  phone: drv.phone,
                                  vehicle: drv.vehicle,
                                  hub: drv.hub,
                                  status: drv.status
                                });
                                setShowAddDriverModal(true);
                              }}
                              className="flex-1 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-250 text-[9px] font-black uppercase rounded text-center cursor-pointer transition-colors"
                            >
                              ✏️ Edit Driver Info
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDriver(drv.id, drv.name)}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[9px] font-black uppercase rounded text-center cursor-pointer transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Driver Order Management List */}
                <div className="bg-white rounded-md border border-neutral-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                        <Truck size={16} className="text-daraz-orange" /> Driver Delivery Status & Assignment Controller
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        Assign drivers to orders or change the assigned driver. Updates sync in real-time to the customer's app.
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase bg-white px-2.5 py-1 border border-neutral-200 rounded">
                      {orders.length} Order Documents
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-neutral-400">
                      <Truck size={36} className="mx-auto mb-2 text-neutral-300" />
                      <p className="text-xs font-black uppercase">No delivery orders found</p>
                      <p className="text-[10px] text-neutral-400 mt-1">Place an order from the shop or cart to test live driver status toggles.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-150">
                      {orders.map((order) => {
                        const currentStatus = (order.driverStatus || order.status || 'pending').toLowerCase();
                        const currentDriverName = order.driverName || 'Subash Tamang';
                        const currentDriverPhone = order.driverPhone || '+977 981-3255901';
                        const currentDriverVehicle = order.driverVehicle || 'Bajaj Pulsar (Ba 2 Pa 5620)';
                        
                        return (
                          <div key={order.id} className="p-5 hover:bg-neutral-50/80 transition-colors space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-black text-neutral-900 uppercase tracking-tight bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                    #{order.id.substring(0, 8).toUpperCase()}
                                  </span>
                                  <span className="text-xs font-black text-neutral-800">
                                    {order.address?.fullName || order.customerName || 'Customer'}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-bold">
                                    ({order.address?.phone || 'No Phone'})
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-600 font-medium">
                                  📍 {order.address?.address || order.address?.details || 'Kathmandu'}, {order.address?.area?.name || order.address?.area || 'Baneshwor'}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="text-xs font-black text-daraz-orange">{formatCurrency(order.total)}</p>
                                  <p className="text-[9px] font-bold text-neutral-400 uppercase">{order.items?.length || 1} Item(s) • {order.method}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[9px] font-black uppercase rounded tracking-wider cursor-pointer border border-neutral-200"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>

                            {/* Assigned Driver Box & Driver Selection Dropdown */}
                            <div className="bg-amber-50/60 p-3 rounded border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-daraz-orange text-white flex items-center justify-center text-xs font-black shrink-0">
                                  👨🏽‍✈️
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-900">Assigned Driver:</span>
                                    <span className="text-xs font-black text-neutral-900">{currentDriverName}</span>
                                    <span className="text-[10px] font-bold text-daraz-orange">({currentDriverPhone})</span>
                                  </div>
                                  <p className="text-[10px] text-neutral-500 font-medium">
                                    🛵 {currentDriverVehicle}
                                  </p>
                                </div>
                              </div>

                              {/* Assign / Change Driver Select */}
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-[9px] font-black text-neutral-500 uppercase whitespace-nowrap">Change Driver:</span>
                                <select
                                  value={drivers.find(d => d.name === currentDriverName)?.id || drivers[0]?.id}
                                  onChange={(e) => {
                                    const selectedDrv = drivers.find(d => d.id === e.target.value);
                                    if (selectedDrv) {
                                      handleAssignDriverToOrder(order.id, selectedDrv);
                                    }
                                  }}
                                  className="bg-white border border-neutral-300 text-neutral-800 text-[10px] font-bold p-1.5 rounded outline-none focus:border-daraz-orange cursor-pointer w-full sm:w-auto"
                                >
                                  {drivers.map(d => (
                                    <option key={d.id} value={d.id}>
                                      👨🏽‍✈️ {d.name} ({d.phone}) - {d.vehicle}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Driver Status Toggle Buttons Grid */}
                            <div className="bg-neutral-50 p-3 rounded border border-neutral-200/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500">
                                  Set Simulated Driver Status:
                                </span>
                                <span className={cn(
                                  "text-[9.5px] font-black uppercase px-2 py-0.5 rounded border tracking-tight",
                                  currentStatus === 'pending' || currentStatus === 'processing' ? "bg-amber-50 text-amber-800 border-amber-200" :
                                  currentStatus === 'in transit' || currentStatus === 'in-transit' ? "bg-purple-50 text-purple-800 border-purple-200" :
                                  currentStatus === 'out for delivery' ? "bg-sky-50 text-sky-800 border-sky-200" :
                                  currentStatus === 'arrived' ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse" :
                                  currentStatus === 'delivered' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                                  "bg-rose-50 text-rose-800 border-rose-200"
                                )}>
                                  Current: {currentStatus}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {[
                                  { label: 'Preparing', value: 'pending', icon: '🏪', bg: 'hover:bg-amber-50 hover:border-amber-300' },
                                  { label: 'In Transit', value: 'in transit', icon: '🚚', bg: 'hover:bg-purple-50 hover:border-purple-300' },
                                  { label: 'Out for Delivery', value: 'out for delivery', icon: '🛵', bg: 'hover:bg-sky-50 hover:border-sky-300' },
                                  { label: 'Arrived', value: 'arrived', icon: '🏁', bg: 'hover:bg-emerald-50 hover:border-emerald-300' },
                                  { label: 'Delivered', value: 'delivered', icon: '✅', bg: 'hover:bg-green-50 hover:border-green-300' },
                                ].map((st) => {
                                  const isActive = currentStatus === st.value;
                                  return (
                                    <button
                                      key={st.value}
                                      type="button"
                                      onClick={() => handleUpdateStatus(order.id, st.value, st.value)}
                                      className={cn(
                                        "p-2 rounded text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border text-[10px] font-black uppercase tracking-tight",
                                        isActive
                                          ? "bg-daraz-orange text-white border-daraz-orange shadow-sm scale-102"
                                          : `bg-white border-neutral-200 text-neutral-700 ${st.bg}`
                                      )}
                                    >
                                      <span className="text-base">{st.icon}</span>
                                      <span>{st.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Video (YouTube / MP4 Video File)</label>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      value={editingProduct.videoUrl || ''}
                      onChange={e => setEditingProduct({...editingProduct, videoUrl: e.target.value})}
                      placeholder="Paste YouTube or MP4 Video Link"
                      className="w-full bg-neutral-50 border border-neutral-200 p-2 text-xs outline-none focus:border-blue-500 rounded-sm"
                    />
                    <label className="flex items-center justify-center gap-2 p-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all">
                      <VideoIcon size={14} className="text-blue-600" />
                      <span>{videoProcessing ? 'Uploading Video...' : 'Upload Video File'}</span>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUploadForEdit} />
                    </label>
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

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Video (YouTube / MP4 Video File)</label>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      value={newProduct.videoUrl || ''}
                      onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})}
                      placeholder="Paste YouTube or MP4 Video Link"
                      className="w-full bg-neutral-50 border border-neutral-200 p-2 text-xs outline-none focus:border-daraz-orange rounded-sm"
                    />
                    <label className="flex items-center justify-center gap-2 p-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all">
                      <VideoIcon size={14} className="text-daraz-orange" />
                      <span>{videoProcessing ? 'Uploading Video...' : 'Upload Video File'}</span>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUploadForNew} />
                    </label>
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

               {/* Driver Status Simulator Toggle Panel */}
               <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Truck className="text-daraz-orange" size={18} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                          Driver Status Simulator
                        </h4>
                     </div>
                     <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800">
                        Real-Time Sync to Customer
                     </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-medium leading-normal">
                    Select a driver status below to automatically update the live order status visible to the customer on their Profile / Track Orders screen.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                     {[
                        { label: 'Preparing', value: 'pending', icon: '🏪' },
                        { label: 'In Transit', value: 'in transit', icon: '🚚' },
                        { label: 'Out for Delivery', value: 'out for delivery', icon: '🛵' },
                        { label: 'Delivered', value: 'delivered', icon: '✅' },
                        { label: 'Cancelled', value: 'cancelled', icon: '❌' }
                     ].map((st) => {
                        const isActive = selectedOrder.status === st.value;
                        return (
                           <button
                             key={st.value}
                             type="button"
                             onClick={async () => {
                               await handleUpdateStatus(selectedOrder.id, st.value);
                               setSelectedOrder({ ...selectedOrder, status: st.value });
                             }}
                             className={cn(
                               "p-2.5 rounded text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border text-[10px] font-black uppercase tracking-tight",
                               isActive
                                 ? "bg-daraz-orange text-white border-daraz-orange shadow-sm scale-105"
                                 : "bg-white border-neutral-200 text-neutral-700 hover:border-daraz-orange/50 hover:bg-neutral-50"
                             )}
                           >
                              <span className="text-base">{st.icon}</span>
                              <span>{st.label}</span>
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* Payment & Meta */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-sm border border-neutral-150">
                  <div>
                    <p className="text-[8px] font-black text-neutral-400 uppercase">Payment Method</p>
                    <p className="text-xs font-black text-neutral-800 uppercase tracking-widest">{selectedOrder.method}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-neutral-400 uppercase">Current Status</p>
                    <p className="text-xs font-black text-daraz-orange uppercase tracking-widest">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-neutral-400 uppercase">Assigned Driver</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={drivers.find(d => d.name === (selectedOrder.driverName || 'Subash Tamang'))?.id || drivers[0]?.id}
                        onChange={(e) => {
                          const selectedDrv = drivers.find(d => d.id === e.target.value);
                          if (selectedDrv) {
                            handleAssignDriverToOrder(selectedOrder.id, selectedDrv);
                            setSelectedOrder({
                              ...selectedOrder,
                              driverId: selectedDrv.id,
                              driverName: selectedDrv.name,
                              driverPhone: selectedDrv.phone,
                              driverVehicle: selectedDrv.vehicle
                            });
                          }
                        }}
                        className="bg-white border border-neutral-300 text-neutral-900 text-[10px] font-bold p-1 rounded outline-none focus:border-daraz-orange cursor-pointer w-full"
                      >
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            👨🏽‍✈️ {d.name} ({d.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-neutral-50 p-6 border-t border-neutral-100 flex flex-wrap gap-3">
               <button 
                onClick={async () => {
                  await handleUpdateStatus(selectedOrder.id, 'in transit');
                  setSelectedOrder({ ...selectedOrder, status: 'in transit' });
                }}
                className="flex-1 bg-purple-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 cursor-pointer"
               >
                🚚 Mark In Transit
               </button>
               <button 
                onClick={async () => {
                  await handleUpdateStatus(selectedOrder.id, 'out for delivery');
                  setSelectedOrder({ ...selectedOrder, status: 'out for delivery' });
                }}
                className="flex-1 bg-sky-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 cursor-pointer"
               >
                🛵 Out for Delivery
               </button>
               <button 
                onClick={async () => {
                  await handleUpdateStatus(selectedOrder.id, 'delivered');
                  setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                }}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 cursor-pointer"
               >
                ✅ Mark Delivered
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-left">
          <div className="bg-white w-full max-w-md rounded-md shadow-2xl p-6 relative border border-neutral-200">
            <button 
              type="button"
              onClick={() => {
                setShowAddDriverModal(false);
                setEditingDriver(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-150 pb-3">
              <div className="h-10 w-10 rounded-full bg-daraz-orange/10 border border-daraz-orange/30 flex items-center justify-center text-xl shrink-0">
                👨🏽‍✈️
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-neutral-900">
                  {editingDriver ? 'Edit Driver Details' : 'Register New Courier Driver'}
                </h2>
                <p className="text-[10px] text-neutral-500 font-medium">
                  {editingDriver ? 'Update driver phone number, vehicle plate or dispatch hub' : 'Add a new courier driver to your delivery roster'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Driver Full Name *
                </label>
                <input 
                  type="text"
                  required
                  value={driverFormData.name}
                  onChange={e => setDriverFormData({ ...driverFormData, name: e.target.value })}
                  placeholder="e.g. Subash Tamang"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2.5 text-xs text-neutral-900 font-bold focus:border-daraz-orange focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Driver Phone Number *
                </label>
                <input 
                  type="text"
                  required
                  value={driverFormData.phone}
                  onChange={e => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                  placeholder="e.g. +977 981-3255901"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2.5 text-xs text-neutral-900 font-bold focus:border-daraz-orange focus:bg-white outline-none"
                />
                <p className="text-[9px] text-neutral-400 mt-1">Customers will be able to call this phone number directly from their live order map.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Vehicle Model & License Plate Number
                </label>
                <input 
                  type="text"
                  value={driverFormData.vehicle}
                  onChange={e => setDriverFormData({ ...driverFormData, vehicle: e.target.value })}
                  placeholder="e.g. Bajaj Pulsar (Ba 2 Pa 5620)"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2.5 text-xs text-neutral-900 font-bold focus:border-daraz-orange focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Dispatch Hub
                  </label>
                  <select
                    value={driverFormData.hub}
                    onChange={e => setDriverFormData({ ...driverFormData, hub: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2.5 text-xs text-neutral-900 font-bold focus:border-daraz-orange focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Kathmandu Central Hub">Kathmandu Central Hub</option>
                    <option value="Lalitpur Hub">Lalitpur Hub</option>
                    <option value="Bhaktapur Hub">Bhaktapur Hub</option>
                    <option value="Thamel Dispatch Hub">Thamel Dispatch Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                    Duty Status
                  </label>
                  <select
                    value={driverFormData.status}
                    onChange={e => setDriverFormData({ ...driverFormData, status: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded p-2.5 text-xs text-neutral-900 font-bold focus:border-daraz-orange focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="On Duty">🟢 On Duty</option>
                    <option value="In Transit">🚚 In Transit</option>
                    <option value="Off Duty">🔴 Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDriverModal(false);
                    setEditingDriver(null);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-black uppercase rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-daraz-orange hover:bg-orange-600 text-white text-xs font-black uppercase rounded cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save size={14} /> {editingDriver ? 'Save Driver Changes' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
