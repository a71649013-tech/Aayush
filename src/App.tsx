/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFirebase } from './context/FirebaseContext';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import MerchantPage from './pages/MerchantPage';
import RewardsPage from './pages/RewardsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MobileBottomNav from './components/MobileBottomNav';
import BannerAd from './components/BannerAd';
import { productService } from './services/productService';
import { initUnityAds } from './services/unityAdsService';
import { CartItem, Product } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { user, loading, connectionError } = useFirebase();

  useEffect(() => {
    // Initialize Unity Ads
    initUnityAds();

    // Check connection and seed
    const checkConnection = async () => {
      try {
        await productService.seedIfEmpty();
      } catch (err) {
        console.error("Connectivity issue detected on startup:", err);
      }
    };
    
    checkConnection();

    // Subscribe
    const unsubscribe = productService.subscribeToProducts((fetched) => {
      setProducts(fetched);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    // Review logic will be handled better by productService but let's keep it simple for now or update it later
    // For now, we'll just use the service but the UI might need to be refreshed
    productService.addReview(productId, {
      userId: 'anonymous-or-logged-in', // should be from context
      userName: 'Valued Customer',
      rating,
      comment,
      createdAt: new Date().toISOString()
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-daraz-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full bg-neutral-50 font-sans text-neutral-900 md:border-x md:border-neutral-200 max-w-7xl mx-auto md:shadow-2xl overflow-x-hidden relative flex flex-col">
        {connectionError && (
          <div className="bg-daraz-orange text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-4 text-center sticky top-0 z-[100] border-b border-white/20">
            Marketplace is in offline mode. Connecting to server...
          </div>
        )}
        <Navbar cartCount={cartCount} />
        <main className="flex-1 pb-32 md:pb-20">
          <Routes>
            <Route path="/" element={<HomePage products={products} />} />
            <Route 
              path="/product/:id" 
              element={<ProductPage products={products} onAddToCart={addToCart} onAddReview={addReview} />} 
            />
            <Route 
              path="/cart" 
              element={<CartPage cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} />} 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/merchant" element={<MerchantPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route 
              path="/admin" 
              element={
                <AdminDashboard 
                  products={products} 
                  onAddProduct={(p) => productService.addProduct(p)}
                  onUpdateProduct={(id, updates) => productService.updateProduct(id, updates)}
                  onDeleteProduct={(id) => productService.deleteProduct(id)}
                />
              } 
            />
          </Routes>
        </main>
        
        <Footer />
        <BannerAd />
        <MobileBottomNav cartCount={cartCount} />
      </div>
    </Router>
  );
}

