import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, ShoppingCart, Zap, ShieldCheck, ChevronRight, Landmark, Truck, CreditCard, Headphones, Mail, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Store, PlayCircle, Gift, Search, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { AdPlacement } from '../components/AdPlacement';
import { useFirebase } from '../context/FirebaseContext';
import { ProductImage } from '../components/ProductImage';

import { CATEGORIES } from '../constants';

export default function HomePage({ products }: { products: Product[] }) {
  const { user } = useFirebase();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q')?.toLowerCase();
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Home search bar state
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Slide index for utility icons & main banner indicator
  const [activeSlide, setActiveSlide] = useState(0);

  // Live countdown timer state (counts down to midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 25, seconds: 40 });

  useEffect(() => {
    // Sync search input if URL params change
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    // Setup ticking countdown clock
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23; // Loop back
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery) || 
        p.description.toLowerCase().includes(searchQuery);
      return matchCategory && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  // Extract subset of products with high reviews or discount highlights for the Flash Sale tray
  const flashSaleProducts = useMemo(() => {
    return products.slice(0, 6).map((p, idx) => ({
      ...p,
      discountPercent: [7, 4, 72, 15, 25, 45][idx % 6],
      soldCount: [8, 12, 45, 3, 22, 19][idx % 6],
      totalStock: [15, 20, 50, 10, 30, 25][idx % 6],
    }));
  }, [products]);

  const faqs = [
    { q: "How long does delivery take in Kathmandu?", a: "Standard delivery within Kathmandu Valley takes 24-48 hours. Express delivery is available for select items." },
    { q: "Are the handicrafts authentic?", a: "Yes, every handicraft is sourced directly from verified local artisans across Nepal. We provide a Certificate of Authenticity on request." },
    { q: "Do you offer bulk institutional pricing?", a: "Absolutely. We specialize in corporate gifting and institutional supplies. Contact our Merchant Center for quotes." },
    { q: "What is your return policy?", a: "We offer a 7-day no-questions-asked return policy for most items, provided they are in original condition." }
  ];

  // Helper formatting for countdown digits
  const formatTimeDigit = (val: number) => String(val).padStart(2, '0');

  return (
    <div className="bg-daraz-bg min-h-screen overflow-x-hidden">
      
      {/* 1. TOP MOBILE APP INSTAL BANNER OVERLAY */}
      <div className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between shadow-sm hover:bg-neutral-50 transition-colors md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f85606] to-[#ff7a36] flex items-center justify-center text-white font-black text-2xl shadow-lg relative overflow-hidden">
            <span className="relative z-10 italic">d</span>
            <div className="absolute inset-0 bg-white/20 -rotate-45 translate-y-4"></div>
          </div>
          <div>
            <h4 className="text-xs font-black text-neutral-800 tracking-tight">Daraz App</h4>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Save more on App</p>
          </div>
        </div>
        <a 
          href="https://daraz.com.np" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-daraz-orange text-white text-[11px] font-black uppercase tracking-wider px-6 py-2 rounded-full shadow-md active:scale-95 transition-all text-center"
        >
          Open
        </a>
      </div>

      {/* Promo Bar */}
      <div className="bg-neutral-900 text-white py-1.5 overflow-hidden w-full relative border-b border-white/5">
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

      {/* 2. DYNAMIC INPUT SEARCH CONTAINER (Matching the orange/white search pill layout) */}
      <section className="bg-white py-4 border-b border-neutral-150">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-neutral-100 border-2 border-daraz-orange rounded-full p-1 pl-4 shadow-sm hover:shadow-md transition-shadow">
              <Search className="text-neutral-400 shrink-0 mr-2.5" size={18} />
              <input 
                type="text" 
                placeholder="Search for clothes, mobile phones, tea..." 
                className="w-full text-xs font-bold text-neutral-800 bg-transparent outline-none py-1.5"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-daraz-orange text-white text-xs font-black uppercase tracking-wider px-6 py-2 rounded-full hover:opacity-95 transition-opacity"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Hero / Banner System */}
      {!categoryFilter && !searchQuery && (
        <section className="bg-white pb-6 pt-2">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
            
            {/* Sidebar Categories */}
            <div className="hidden md:block col-span-3 border-r border-neutral-100 pr-4 pt-2">
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name} className="flex justify-between items-center text-xs font-bold text-neutral-600 hover:text-daraz-orange cursor-pointer transition-colors group">
                    <Link to={`/?category=${cat.name}`} className="w-full h-full flex items-center gap-3 py-1.5 uppercase tracking-tighter">
                      <span className="text-neutral-400 group-hover:text-daraz-orange transition-colors">{cat.icon}</span>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6">
                <AdPlacement type="sidebar" />
              </div>
            </div>
            
            {/* 3. CO-BRANDED PORTRAIT BANNER ("SAVE UP TO 20% OFF IN GEMS CHANNEL") */}
            <div className="col-span-12 md:col-span-9 pt-2">
              <div className="relative h-60 sm:h-72 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff471a] via-[#f85606] to-[#e03100] text-white p-6 sm:p-12 shadow-2xl flex flex-col justify-between">
                
                {/* Visual Accent Background Graphics imitating gems and characters */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 sm:opacity-90 pointer-events-none select-none flex items-center justify-end overflow-hidden pb-4 pr-4">
                  <div className="relative w-full h-full flex items-center justify-end">
                    {/* Glowing Purple Gem representation */}
                    <div className="absolute right-12 top-4 w-12 h-12 bg-purple-500 rounded-full blur-2xl animate-pulse"></div>
                    <span className="text-8xl select-none mr-2 transform rotate-12 scale-110">💎</span>
                    <span className="text-6xl select-none absolute bottom-4 right-20 transform -rotate-12">📱</span>
                  </div>
                </div>

                <div className="relative z-10 max-w-md my-auto space-y-4">
                  <span className="bg-yellow-400 text-neutral-900 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm shadow-sm inline-block">
                    EXCLUSIVE LOYALTY CHANNEL
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter leading-none uppercase select-none drop-shadow-md">
                    SAVE UP TO <br />
                    <span className="text-[#ffee00] text-3xl sm:text-5xl md:text-6xl tracking-tight block mt-1">20% OFF</span>
                    IN GEMS CHANNEL
                  </h2>
                  
                  <p className="text-[10px] text-white/90 font-medium uppercase tracking-wider max-w-xs leading-relaxed hidden sm:block">
                    Earn daily check-in gems, then redeem high-value instant store vouchers to apply during checkouts!
                  </p>

                  <div className="pt-2">
                    <Link 
                      to="/vouchers" 
                      className="bg-[#ffee00] text-daraz-orange font-black text-[11px] sm:text-xs px-8 py-3 rounded-full shadow-lg hover:bg-yellow-350 active:scale-95 transition-all inline-block uppercase tracking-widest"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>

                {/* Dot Slider Indicators underneath imitating screenshot */}
                <div className="flex justify-center gap-1.5 self-center mt-auto">
                  {[0, 1, 2, 3, 4, 5, 6].map((dotIdx) => (
                    <span 
                      key={dotIdx} 
                      onClick={() => setActiveSlide(dotIdx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeSlide === dotIdx ? 'w-4 bg-[#ffee00]' : 'w-1.5 bg-white/40'
                      }`}
                    ></span>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-12">
        
        {/* 4. APP-STYLE TWO-ROW ICON GRID WITH SLIDER INDICATOR (Matching screenshot) */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-neutral-150">
            {/* Scrollable Container */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="grid grid-rows-2 grid-flow-col gap-y-6 gap-x-12 justify-start md:justify-around min-w-[700px] md:min-w-0 py-2">
                
                {/* 1. Earn Gems */}
                <Link to="/vouchers" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md relative overflow-hidden">
                    💎
                    <div className="absolute top-0 right-0 bg-amber-400 text-[7px] text-neutral-900 font-extrabold px-1 rounded-bl">EXTRA</div>
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Earn Gems</span>
                </Link>

                {/* 2. Add to Cart */}
                <Link to="/" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-650 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md relative overflow-hidden">
                    <span className="font-extrabold text-[#ffee00] text-sm">6.6</span>
                    <div className="absolute bottom-0 w-full text-center text-[7px] bg-neutral-900/40 text-[#ffee00] py-0.5 font-bold uppercase tracking-widest">EVENT</div>
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Add to Cart!</span>
                </Link>

                {/* 3. Buy Any 3 */}
                <Link to="/?category=Electronic Devices" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-neutral-900 text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md font-black">
                    ✨
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Buy Any 3</span>
                </Link>

                {/* 4. Daraz Freebie */}
                <Link to="/vouchers" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    🎁
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Daraz Freebie</span>
                </Link>

                {/* 5. Buy More Save More */}
                <Link to="/vouchers" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f85606] to-pink-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    💰
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Buy+Save+</span>
                </Link>

                {/* 6. DarazMall */}
                <Link to="/?category=Handicrafts" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-neutral-700 flex flex-col items-center justify-center text-[#ff3333] text-sm font-extrabold group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    <span className="text-white text-[10px] uppercase font-black tracking-widest">DM</span>
                    <span className="text-[#ffee00] text-[6px] font-bold">100% AUTH</span>
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">DarazMall</span>
                </Link>

                {/* 7. Free Delivery */}
                <Link to="/?category=Home & Lifestyle" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    🚚
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Free Delivery</span>
                </Link>

                {/* 8. DarazLook */}
                <Link to="/categories" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    👗
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">DarazLook</span>
                </Link>

                {/* 9. Beauty Hub */}
                <Link to="/?category=Organic Tea" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    💄
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Beauty Hub</span>
                </Link>

                {/* 10. Early Bird Deals */}
                <Link to="/" className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 active:scale-95 transition-transform shadow-md">
                    🕒
                  </div>
                  <span className="text-[11px] font-black text-neutral-700 uppercase tracking-tighter mt-2 group-hover:text-daraz-orange transition-colors">Early Bird</span>
                </Link>

              </div>
            </div>

            {/* Custom Horizontal Scroll Bar Slider Pill Indicator */}
            <div className="flex justify-center mt-4">
              <div className="w-12 h-1 bg-neutral-100 rounded-full relative overflow-hidden flex">
                <div className="w-6 h-full bg-daraz-orange rounded-full absolute left-0"></div>
              </div>
            </div>
          </section>
        )}

        {/* 5. PROMOTIONAL MIDDLE RIBBON BANNER */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-gradient-to-r from-daraz-orange to-red-600 rounded-xl py-4.5 px-6 text-white overflow-hidden shadow-md group relative">
            <div className="absolute right-0 top-0 bottom-0 opacity-15 translate-x-12 rotate-12 flex items-center pointer-events-none select-none text-9xl">
              💥
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#ffee00] text-neutral-900 text-[10px] font-black px-3 py-1 rounded inline-block animate-pulse shrink-0">
                  6.6 MID YEAR
                </span>
                <div>
                  <h3 className="text-md sm:text-lg font-black uppercase tracking-tight italic">
                    6.6 MID YEAR SHOPPING FEST!
                  </h3>
                  <p className="text-[10px] text-white/95 font-bold uppercase tracking-wider mt-0.5">
                    SALE STARTS FROM 5TH JUNE | 8 PM | FILL YOUR CART NOW
                  </p>
                </div>
              </div>
              <Link 
                to="/categories" 
                className="bg-neutral-900 border border-white/20 text-[#ffee00] hover:bg-neutral-800 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-sm transition-colors shrink-0"
              >
                Add to Cart ➔
              </Link>
            </div>
          </section>
        )}

        {/* 6. FLASH SALE SECTION WITH LIVE COUNTDOWN TIMER (Matches screenshot) */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-neutral-150">
            {/* Header with Lightning Bolt and ticking clock */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-100 pb-4 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-daraz-orange/15 text-daraz-orange">
                  <Zap size={18} className="fill-daraz-orange animate-bounce" />
                </div>
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 italic">
                  Flash Sale
                </h2>
                {/* Ticking Digital clock blocks */}
                <div className="flex items-center gap-1.5 ml-1 sm:ml-4 select-none">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-1.5 hidden sm:inline">Ending In</span>
                  <span className="bg-neutral-900 text-[#ffee00] px-2 py-1 rounded text-xs font-mono font-black shadow-sm">
                    {formatTimeDigit(timeLeft.hours)}
                  </span>
                  <span className="text-neutral-800 font-extrabold font-mono text-sm">:</span>
                  <span className="bg-neutral-900 text-[#ffee00] px-2 py-1 rounded text-xs font-mono font-black shadow-sm">
                    {formatTimeDigit(timeLeft.minutes)}
                  </span>
                  <span className="text-neutral-800 font-extrabold font-mono text-sm">:</span>
                  <span className="bg-neutral-900 text-[#ffee00] px-2 py-1 rounded text-xs font-mono font-black shadow-sm">
                    {formatTimeDigit(timeLeft.seconds)}
                  </span>
                </div>
              </div>

              <Link 
                to="/categories" 
                className="text-[11px] font-black uppercase tracking-wider text-daraz-orange hover:underline flex items-center gap-1 group/link"
              >
                Shop More
                <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Horizontal Product list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {flashSaleProducts.map((p) => (
                <div 
                  key={p.id}
                  className="bg-white border border-neutral-150 rounded-lg overflow-hidden flex flex-col group relative hover:shadow-lg transition-shadow"
                >
                  <Link to={`/product/${p.id}`} className="block relative aspect-square overflow-hidden bg-neutral-50 border-b border-neutral-100">
                    <ProductImage 
                      src={p.image} 
                      alt={p.name} 
                      category={p.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* RED BADGE badging matching "SAVE 7%", "SAVE 72%" on screenshot */}
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-md uppercase italic">
                      SAVE {p.discountPercent}%
                    </div>
                  </Link>

                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <Link to={`/product/${p.id}`}>
                        <h3 className="text-[11px] font-bold text-neutral-800 line-clamp-2 leading-snug hover:text-daraz-orange transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      
                      <div className="mt-2 text-left">
                        <span className="text-[15px] font-black text-daraz-orange tracking-tight block leading-none">
                          {formatCurrency(p.price)}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-bold line-through mt-1 block">
                          {formatCurrency(Math.round(p.price * (1 + p.discountPercent / 100)))}
                        </span>
                      </div>
                    </div>

                    {/* Stock items tracking indicator */}
                    <div className="mt-3">
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden relative">
                        <div 
                          className="bg-daraz-orange h-full rounded-full"
                          style={{ width: `${Math.round((p.soldCount / p.totalStock) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest mt-1 block">
                        {p.soldCount} Sold / {p.totalStock - p.soldCount} left
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Filters Display */}
        {(categoryFilter || searchQuery) && (
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
            <h1 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
               {searchQuery ? `Search Results for: "${searchQuery}"` : `Category: ${categoryFilter}`}
               <span className="ml-2 text-neutral-300 font-normal">({filteredProducts.length} items found)</span>
            </h1>
            <Link to="/" className="text-[10px] font-black uppercase text-daraz-orange hover:underline">Clear Filters</Link>
          </div>
        )}

        {/* Just For You Grid / Category Shelf Arrangement */}
        {categoryFilter || searchQuery ? (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-neutral-800">
                 Search Results
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
        ) : (
          /* Arrange all products in their categories */
          <div className="space-y-12">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-neutral-150">
              <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-neutral-900">
                Browse By Category
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Perfectly Organized</span>
            </div>
            
            {CATEGORIES.map((cat) => {
              const catProducts = products.filter(p => p.category === cat.name);
              if (catProducts.length === 0) return null;
              
              return (
                <section key={cat.name} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border-l-4 border-daraz-orange shadow-sm hover:shadow-md transition-shadow border border-neutral-150">
                    <div className="flex items-center gap-3">
                      <div className={`${cat.color} text-white p-2 md:p-2.5 rounded-full flex items-center justify-center shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 animation-fadeIn">
                        <h2 className="text-xs md:text-sm font-black uppercase tracking-tight text-neutral-850">
                          {cat.name}
                        </h2>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                          ({catProducts.length} Items Available)
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/?category=${cat.name}`} 
                      className="text-[10px] font-black uppercase tracking-wider text-daraz-orange hover:underline flex items-center gap-1 group/btn shrink-0"
                    >
                      View All
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fadeIn">
                    {catProducts.slice(0, 6).map((product) => (
                      <div key={product.id}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Categories Grid */}
        {!categoryFilter && !searchQuery && (
          <section>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-neutral-150">
              <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-neutral-900">
                Explore Categories
              </h2>
              <Link to="/categories" className="text-[10px] font-black uppercase tracking-wider text-daraz-orange hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-px bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
               {CATEGORIES.map((cat, i) => (
                 <Link key={i} to={`/?category=${cat.name}`} className="bg-white p-6 flex flex-col items-center gap-3 hover:shadow-inner transition-shadow group">
                    <div className="w-12 h-12 rounded-full bg-daraz-bg group-hover:bg-daraz-orange/10 flex items-center justify-center transition-all text-daraz-orange">
                       {cat.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase text-neutral-600 text-center tracking-tighter leading-tight">{cat.name}</span>
                 </Link>
               ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {!categoryFilter && !searchQuery && (
          <section className="bg-white p-12 rounded-xl border border-neutral-150 shadow-sm">
             <div className="max-w-2xl mx-auto space-y-10">
                <div className="text-center">
                   <HelpCircle size={40} className="mx-auto text-daraz-orange mb-4" />
                   <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase mb-2 text-neutral-900">HAVE QUESTIONS?</h2>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest opacity-80">Everything a first-time visitor needs to know</p>
                </div>
                
                <div className="space-y-4">
                   {faqs.map((faq, idx) => (
                      <div key={idx} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                         <button 
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors"
                         >
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-805">{faq.q}</span>
                            {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </button>
                         <motion.div 
                          initial={false}
                          animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                          className="overflow-hidden"
                         >
                            <div className="p-6 pt-0 text-[10px] uppercase font-bold text-neutral-400 tracking-wider leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
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
        <section className="bg-white p-10 rounded-xl shadow-sm border border-neutral-150">
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
        <section className="bg-daraz-orange rounded-xl p-12 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-12 translate-y-[-20%]">
              <Mail size={300} />
           </div>
           <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase mb-2">JOIN THE NEPALI MART CLUB</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-80 underline underline-offset-4">Get exclusive deals and special collection alerts</p>
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                 <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL@EXAMPLE.COM" 
                  className="flex-1 bg-white border-2 border-white/20 p-4 font-bold text-xs uppercase tracking-widest text-neutral-900 outline-none focus:border-white focus:bg-daraz-bg transition-all rounded"
                 />
                 <button className="bg-neutral-900 text-white px-8 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-800 transition-colors rounded">
                    Subscribe
                 </button>
              </form>
              <p className="mt-4 text-[8px] font-bold uppercase opacity-50 tracking-widest">No spam. Only high-value handicrafts and electronics alerts.</p>
           </div>
        </section>
      </div>

      {user && (user.role === 'admin' || user.role === 'merchant' || user.isMerchant) && (
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
    <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all h-full flex flex-col group relative">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <ProductImage 
          src={product.image} 
          alt={product.name} 
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
