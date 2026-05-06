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
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { CartItem, Product } from './types';
import { productService } from './services/productService';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Seed and Subscribe
    productService.seedIfEmpty();
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

  return (
    <Router>
      <div className="min-h-screen w-full bg-neutral-50 font-sans text-neutral-900 md:border-x md:border-neutral-200 max-w-7xl mx-auto md:shadow-2xl overflow-x-hidden relative">
        <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
        <main className="pb-20">
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
      </div>
    </Router>
  );
}

