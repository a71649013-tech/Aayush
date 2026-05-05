import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { Package, ShoppingCart, TrendingUp, Users, Edit3, Trash2, CheckCircle, Clock, ShieldAlert, Zap, Plus, Upload, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { useFirebase } from '../context/FirebaseContext';

export default function AdminDashboard({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: { 
  products: Product[], 
  onAddProduct: (p: any) => void,
  onUpdateProduct: (id: string, p: any) => void,
  onDeleteProduct: (id: string) => void
}) {
  const { user, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'Handicrafts',
    stock: 50,
    description: '',
    image: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      const unsubscribe = orderService.subscribeToAllOrders((fetched) => {
        setOrders(fetched);
      });
      return () => unsubscribe();
    }
  }, [user]);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      price: 0,
      category: 'Handicrafts',
      stock: 50,
      description: '',
      image: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert('Image is too large. Please select an image under 800KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: base64String });
        } else {
          setNewProduct({ ...newProduct, image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleQuickSeed = async () => {
    if (window.confirm('This will add all demo products to your database. Continue?')) {
      await productService.seedIfEmpty();
      alert('Demo products added! Please refresh if they don\'t appear immediately.');
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
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-600">Merchant Center</h1>
            <p className="text-neutral-500 font-medium uppercase text-[10px] tracking-widest mt-1">Management Console / v2.4.0</p>
          </div>
          <div className="flex gap-4">
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
            ) : (
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
                          <img src={product.image} className="w-10 h-10 object-cover rounded-sm" alt="" />
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
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-left">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl p-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600 mb-6">Edit Listing</h2>
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
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Image</label>
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
                    <label className={cn(
                      "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm p-4 hover:border-blue-500 transition-colors cursor-pointer",
                      !editingProduct.image ? "h-24" : "h-24"
                    )}>
                      <Upload size={20} className="text-neutral-400 mb-1" />
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Change Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90"
                >
                  Update Product
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
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Product Image</label>
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
                    <label className={cn(
                      "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-sm p-4 hover:border-daraz-orange transition-colors cursor-pointer",
                      !newProduct.image ? "h-24" : "h-24"
                    )}>
                      <Upload size={20} className="text-neutral-400 mb-1" />
                      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">{newProduct.image ? 'Change Photo' : 'Upload Product Photo'}</span>
                      <input type="file" className="hidden" accept="image/*" required={!newProduct.image} onChange={(e) => handleImageUpload(e, false)} />
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-daraz-orange text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90"
                >
                  Save Product
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
                           <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-sm" />
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
