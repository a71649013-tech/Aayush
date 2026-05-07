import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, ShoppingCart, Zap, ShieldCheck, ChevronRight, Landmark, Truck, CreditCard, Headphones, Mail, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Store } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { AdPlacement } from '../components/AdPlacement';
import { useFirebase } from '../context/FirebaseContext';

import { CATEGORIES } from '../constants';

export default function HomePage({ products }: { products: Product[] }) {
  const { user } = useFirebase();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q')?.toLowerCase();
  const [visibleCount, setVisibleCount] = useState(12);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery) || 
        p.description.toLowerCase().includes(searchQuery);
      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  const flashSaleProducts = useMemo(() => products.slice(0, 6), [products]);

  const faqs = [
    { q: "How long does delivery take in Kathmandu?", a: "Standard delivery within Kathmandu Valley takes 24-48 hours. Express delivery is available for select items." },
    { q: "Are the handicrafts authentic?", a: "Yes, every handicraft is sourced directly from verified local artisans across Nepal. We provide a Certificate of Authenticity on request." },
    { q: "Do you offer bulk institutional pricing?", a: "Absolutely. We specialize in corporate gifting and institutional supplies. Contact our Merchant Center for quotes." },
    { q: "What is your return policy?", a: "We offer a 7-day no-questions-asked return policy for most items, provided they are in original condition." }
  ];

  return (
    <div className="bg-daraz-bg min-h-screen overflow-x-hidden">
      {/* Promo Bar */}
      <div className="bg-neutral-900 text-white py-1 overflow-hidden w-full relative border-b border-white/5">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex gap-8 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] px-4">
            <span>FREE SHIPPING OVER रू5000</span>
            <span>• ORGANIC TEA FROM ILAM</span>
            <span>• CASH ON DELIVERY</span>
            <span>• SUPPORT LOCAL ARTISANS</span>
          </div>
          <div className="flex gap-8 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] px-4">
            <span>FREE SHIPPING OVER रू5000</span>
            <span>• ORGANIC TEA FROM ILAM</span>
            <span>• CASH ON DELIVERY</span>
            <span>• SUPPORT LOCAL ARTISANS</span>
          </div>
        </div>
      </div>

      {/* Hero / Banner System */}
      {!categoryFilter && !searchQuery && (
        <section className="bg-white pb-4 md:pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-4">
            {/* Sidebar Categories */}
            <div className="hidden md:block col-span-3 border-r border-neutral-100 pr-4">
              <ul className="space-y-2 py-4">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name} className="flex justify-between items-center text-xs font-medium text-neutral-600 hover:text-daraz-orange cursor-pointer transition-colors group">
                    <Link to={`/?category=${cat.name}`} className="w-full h-full flex items-center gap-3 py-1 uppercase tracking-tighter">
                      <span className="text-neutral-400 group-hover:text-daraz-orange transition-colors">{cat.icon}</span>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4">
                <AdPlacement type="sidebar" />
              </div>
            </div>
            
            {/* Main Carousel / Banner */}
            <div className="col-span-12 md:col-span-9 pt-2 md:pt-4">
              <div className="relative h-40 sm:h-64 md:h-96 rounded-sm overflow-hidden bg-neutral-200">
                <img 
                  src="https://images.unsplash.com/photo-1621251319760-49666c1b3f9c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/10 to-transparent flex flex-col justify-center px-6 sm:px-12">
                  <span className="text-white text-[7px] sm:text-xs font-bold uppercase tracking-widest bg-daraz-orange self-start px-2 py-0.5 rounded-sm mb-1 shadow-sm">New Season</span>
                  <h2 className="text-white text-[1.4rem] sm:text-4xl md:text-6xl font-black italic tracking-tighter mb-2 sm:mb-4 leading-[0.85] sm:leading-none uppercase">
                    SALE <br /><span className="text-daraz-orange">IS GOING ON</span>
                  </h2>
                  <Link to="/?category=Handicrafts" className="bg-daraz-orange text-white px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-sm font-bold text-[9px] sm:text-sm hover:bg-orange-700 transition-colors self-start uppercase">Explore Collection</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        {/* Quick Links Grid */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white rounded-sm p-6 shadow-sm overflow-x-auto scrollbar-hide">
            <div className="flex md:grid md:grid-cols-8 gap-8 min-w-max md:min-w-0">
               {[
                 { name: 'Earn Gems', icon: '💎', color: 'bg-purple-100' },
                 { name: 'Freebie', icon: '🎁', color: 'bg-blue-100' },
                 { name: 'DarazMall', icon: '🏢', color: 'bg-red-100' },
                 { name: 'Fashion', icon: '👗', color: 'bg-pink-100' },
                 { name: 'Early Bird', icon: '🕒', color: 'bg-yellow-100' },
                 { name: 'Choice', icon: '✨', color: 'bg-indigo-100' },
                 { name: 'Free Delivery', icon: '🚚', color: 'bg-green-100' },
                 { name: 'New Trends', icon: '🔥', color: 'bg-orange-100' },
               ].map((link, idx) => (
                 <Link key={idx} to="/" className="flex flex-col items-center gap-2 group">
                    <div className={`${link.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                       {link.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase text-neutral-600 tracking-tighter text-center">{link.name}</span>
                 </Link>
               ))}
            </div>
          </section>
        )}

        {/* Active Filters Display */}
        {(categoryFilter || searchQuery) && (
          <div className="bg-white p-4 rounded-sm flex items-center justify-between">
            <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
               {searchQuery ? `Search Results for: "${searchQuery}"` : `Category: ${categoryFilter}`}
               <span className="ml-2 text-neutral-300 font-normal">({filteredProducts.length} items found)</span>
            </h1>
            <Link to="/" className="text-[10px] font-black uppercase text-daraz-orange hover:underline">Clear Filters</Link>
          </div>
        )}

        {/* Flash Sale Section */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-daraz-orange/10 to-transparent">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black italic text-daraz-orange flex items-center gap-2 uppercase tracking-tighter">
                  <Zap size={22} fill="currentColor" /> Flash Sale
                </h2>
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Ending In</span>
                  <div className="flex gap-1.5">
                    <span className="bg-neutral-900 text-white px-2 py-1 rounded-sm text-xs font-black tracking-tight">01</span>
                    <span className="text-neutral-900 font-bold">:</span>
                    <span className="bg-neutral-900 text-white px-2 py-1 rounded-sm text-xs font-black tracking-tight">43</span>
                    <span className="text-neutral-900 font-bold">:</span>
                    <span className="bg-neutral-900 text-white px-2 py-1 rounded-sm text-xs font-black tracking-tight">00</span>
                  </div>
                </div>
              </div>
              <button className="text-daraz-orange text-[10px] font-black uppercase border-2 border-daraz-orange/20 px-5 py-2 rounded-sm hover:bg-daraz-orange hover:text-white transition-all tracking-widest">See All</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {flashSaleProducts.map((product) => (
                <div key={product.id} className="border-r border-b border-neutral-50 group cursor-pointer hover:shadow-xl transition-all bg-white relative">
                  <Link to={`/product/${product.id}`} className="block p-4">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-sm">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 bg-daraz-orange text-white text-[9px] font-black px-2 py-1 rounded-sm uppercase italic shadow-lg">Save 15%</div>
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xs font-bold text-neutral-800 line-clamp-1 leading-tight group-hover:text-daraz-orange transition-colors">{product.name}</h3>
                       <div className="flex flex-col">
                         <span className="text-lg font-black text-daraz-orange leading-none">{formatCurrency(product.price * 0.85)}</span>
                         <span className="text-[10px] text-neutral-400 font-bold line-through">{formatCurrency(product.price)}</span>
                       </div>
                       
                       {/* Stock Progress Bar */}
                       <div className="mt-4 space-y-1.5">
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                             <div className="h-full bg-daraz-orange" style={{ width: '65%' }}></div>
                          </div>
                          <p className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">62 Sold</p>
                       </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        {!categoryFilter && !searchQuery && (
          <section>
            <h2 className="text-[14px] font-black uppercase tracking-widest text-neutral-800 mb-6 flex justify-between items-center bg-white p-4 rounded-sm">
              Categories
              <Link to="/categories" className="text-[10px] font-black text-daraz-orange hover:underline">View More</Link>
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-px bg-neutral-100 border border-neutral-100 rounded-sm overflow-hidden">
               {[
                 { name: 'Electronics', icon: '💻' },
                 { name: 'Fashion', icon: '👕' },
                 { name: 'Home', icon: '🏠' },
                 { name: 'Beauty', icon: '💄' },
                 { name: 'Health', icon: '💊' },
                 { name: 'Sports', icon: '⚽' },
                 { name: 'Artisans', icon: '🎨' },
                 { name: 'Grocery', icon: '🍎' }
               ].map((cat, i) => (
                 <Link key={i} to={`/?category=${cat.name}`} className="bg-white p-6 flex flex-col items-center gap-4 hover:shadow-inner transition-shadow group">
                   <div className="w-16 h-16 rounded-full bg-daraz-bg group-hover:bg-daraz-orange/10 flex items-center justify-center transition-all text-2xl">
                      {cat.icon}
                   </div>
                   <span className="text-[10px] font-black uppercase text-neutral-600 text-center tracking-tighter">{cat.name}</span>
                 </Link>
               ))}
            </div>
          </section>
        )}


        {/* Just For You Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-neutral-800">
               {categoryFilter || searchQuery ? 'Search Results' : 'Just For You'}
            </h2>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-sm">
              <p className="text-neutral-400 font-bold uppercase tracking-widest italic">No products found for this criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {visibleCount < filteredProducts.length && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="px-12 py-3 border-2 border-daraz-orange/20 text-daraz-orange font-black uppercase text-sm tracking-[0.2em] hover:bg-daraz-orange hover:text-white transition-all rounded-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* FAQ Section */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white p-12 rounded-sm border border-neutral-100">
             <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center">
                   <HelpCircle size={40} className="mx-auto text-daraz-orange mb-4" />
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">HAVE QUESTIONS?</h2>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest opacity-80">Everything a first-time visitor needs to know</p>
                </div>
                
                <div className="space-y-4">
                   {faqs.map((faq, idx) => (
                      <div key={idx} className="bg-white border border-neutral-100 rounded-sm overflow-hidden">
                         <button 
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors"
                         >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-800">{faq.q}</span>
                            {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </button>
                         <motion.div 
                          initial={false}
                          animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                          className="overflow-hidden"
                         >
                            <div className="p-6 pt-0 text-[10px] uppercase font-bold text-neutral-400 tracking-wider leading-relaxed border-t border-neutral-50">
                               {faq.a}
                            </div>
                         </motion.div>
                      </div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* Trust Signals */}
        <section className="bg-white p-10 rounded-sm shadow-sm border border-neutral-100">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center group">
                 <div className="w-16 h-16 rounded-full bg-daraz-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Truck size={32} className="text-daraz-orange" />
                 </div>
                 <h3 className="font-black uppercase tracking-widest text-xs mb-2">Free Shipping</h3>
                 <p className="text-[10px] text-neutral-500 font-medium uppercase leading-relaxed">Free delivery on select products <br /> across 75+ districts of Nepal.</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                 <div className="w-16 h-16 rounded-full bg-daraz-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard size={32} className="text-daraz-orange" />
                 </div>
                 <h3 className="font-black uppercase tracking-widest text-xs mb-2">Secure Payment</h3>
                 <p className="text-[10px] text-neutral-500 font-medium uppercase leading-relaxed">PCI-DSS compliant cash on delivery <br /> and digital wallet integrations.</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                 <div className="w-16 h-16 rounded-full bg-daraz-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Headphones size={32} className="text-daraz-orange" />
                 </div>
                 <h3 className="font-black uppercase tracking-widest text-xs mb-2">24/7 Support</h3>
                 <p className="text-[10px] text-neutral-500 font-medium uppercase leading-relaxed">Dedicated support line for local <br /> and institutional customer needs.</p>
              </div>
           </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-daraz-orange rounded-sm p-12 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-12 translate-y-[-20%]">
              <Mail size={300} />
           </div>
           <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">JOIN THE NEPALI MART CLUB</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-80 underline underline-offset-4">Get exclusive deals and flash sale alerts</p>
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                 <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL@EXAMPLE.COM" 
                  className="flex-1 bg-white border-2 border-white/20 p-4 font-bold text-xs uppercase tracking-widest text-neutral-900 outline-none focus:border-white focus:bg-daraz-bg transition-all"
                 />
                 <button className="bg-neutral-900 text-white px-8 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-800 transition-colors">
                    Subscribe
                 </button>
              </form>
              <p className="mt-4 text-[8px] font-bold uppercase opacity-50 tracking-widest">No spam. Only high-value handicrafts and electronics alerts.</p>
           </div>
        </section>
      </div>

      {user && (
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed bottom-10 right-6 z-[100]"
        >
          <Link 
            to="/merchant" 
            className="flex items-center gap-3 bg-neutral-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group border-2 border-daraz-orange/30"
          >
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 decoration-daraz-orange decoration-2 underline">{user.isMerchant ? 'Merchant Portal' : 'Start Selling'}</span>
              <span className="text-xs font-black uppercase tracking-tighter italic">Earn <span className="text-daraz-orange">70%</span> Profit</span>
            </div>
            <div className="w-10 h-10 bg-daraz-orange rounded-full flex items-center justify-center text-white">
              <Store size={20} />
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-sm overflow-hidden border border-transparent hover:border-neutral-200 hover:shadow-xl transition-all h-full flex flex-col group relative">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Brand Badge */}
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-1.5 py-1 rounded-br-sm shadow-lg flex flex-col items-center leading-none">
           <span>NEPALI</span>
           <span className="text-[7px] opacity-70">MART</span>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
           <span className="bg-daraz-orange text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase italic shadow-sm">Official Store</span>
        </div>
      </Link>
      
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs font-bold text-neutral-800 line-clamp-2 h-8 leading-tight mb-2 group-hover:text-daraz-orange transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-2">
          <div className="flex flex-col">
            <span className="text-lg font-black text-daraz-orange tracking-tighter leading-none">{formatCurrency(product.price)}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-neutral-400 font-bold line-through">{formatCurrency(product.price * 1.2)}</span>
              <span className="text-[10px] text-green-600 font-black bg-green-50 px-1 rounded-sm">-20%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                />
              ))}
              <span className="text-[9px] text-neutral-400 font-bold ml-1">({product.numReviews})</span>
            </div>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Nepal</span>
          </div>

          <div className="pt-2 border-t border-neutral-50">
             <div className="flex items-center gap-1.5">
                <Truck size={10} className="text-blue-500" />
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Free Shipping</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
