import React, { useState } from 'react';
import { ShoppingCart, Search, User as UserIcon, Menu, X, Landmark, Globe, Smartphone, LogOut } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { logout } from '../lib/firebase';

import { User } from '../types';

export default function Navbar({ cartCount }: { cartCount: number }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialSearch);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { user } = useFirebase();
  
  React.useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-daraz-bg py-1.5 px-6 hidden md:block border-b border-neutral-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold text-neutral-600 uppercase tracking-tight">
          <div className="flex gap-4">
             <a href="tel:+9779828105337" className="flex items-center gap-1.5 text-daraz-orange hover:underline">
               <Smartphone size={10} /> CS: +977 982-8105337
             </a>
             <span className="text-neutral-300">|</span>
             {user && (
               <>
                 <Link to="/merchant" className="text-daraz-orange font-bold hover:underline transition-colors flex items-center gap-1">
                   <Landmark size={10} /> Merchant Center
                 </Link>
                 <span className="text-neutral-300">|</span>
               </>
             )}
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-daraz-orange transition-colors">Help & Support</Link>
            <span className="flex items-center gap-1 cursor-pointer hover:text-daraz-orange"><Globe size={10} /> Language</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 lg:gap-12 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-black italic tracking-tighter text-daraz-orange">
                NEPALI<span className="text-neutral-900">MART</span>
              </span>
            </Link>
          </div>

          {/* Search Center */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search in Nepali Mart..." 
              className="w-full bg-neutral-100 border border-transparent rounded-sm py-2.5 px-4 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all pr-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full w-12 bg-daraz-orange text-white flex items-center justify-center rounded-r-sm hover:opacity-90 transition-opacity">
              <Search size={18} />
            </button>
          </form>

          <div className="flex items-center gap-2 md:gap-8 shrink-0">
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 group transition-all">
                <div className="w-10 h-10 bg-daraz-orange/10 rounded-full flex items-center justify-center text-daraz-orange group-hover:bg-daraz-orange group-hover:text-white transition-all">
                  <UserIcon size={20} />
                </div>
                <div className="hidden lg:flex flex-col">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase leading-none italic">Profile</p>
                  <p className="text-xs font-black leading-none mt-1 truncate max-w-[100px] uppercase text-neutral-800 tracking-tighter group-hover:text-daraz-orange transition-colors">{user.name}</p>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-2 hover:text-daraz-orange transition-colors group">
                <UserIcon size={24} className="text-neutral-700 group-hover:text-daraz-orange" />
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase leading-none">Hello, Sign in</p>
                  <p className="text-xs font-bold leading-none mt-1">Accounts</p>
                </div>
              </Link>
            )}
            
            <Link to="/cart" className="relative group flex md:hidden lg:flex">
              <ShoppingCart size={28} className="text-neutral-700 group-hover:text-daraz-orange transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-daraz-orange text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search - Only visible on small screens */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 relative px-1">
          <input 
            type="text" 
            placeholder="Search in Nepali Mart..." 
            className="w-full bg-neutral-100 rounded-full py-2 px-4 text-sm outline-none pr-10 focus:ring-1 focus:ring-daraz-orange transition-all border border-neutral-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-0 h-full w-10 flex items-center justify-center text-daraz-orange">
            <Search size={18} />
          </button>
        </form>
      </nav>

      {/* Sub-header Categories (Desktop) */}
      <div className="bg-white border-y border-neutral-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex gap-8 text-[12px] font-bold text-neutral-600 uppercase tracking-tight">
          <Link to="/" className="hover:text-daraz-orange">Categories</Link>
          <Link to="/?category=Handicrafts" className="hover:text-daraz-orange">Handicrafts</Link>
          <Link to="/?category=Tea" className="hover:text-daraz-orange">Flash Sale</Link>
          <Link to="/?category=Electronics" className="hover:text-daraz-orange">New Arrivals</Link>
          <Link to="/" className="hover:text-daraz-orange">Vouchers</Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white pt-20 p-6 flex flex-col gap-6">
          <button className="absolute top-6 right-6" onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
          <Link to="/" className="text-xl font-black italic tracking-tighter uppercase border-b border-neutral-100 pb-4">Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-xl font-black italic tracking-tighter text-daraz-orange border-b border-neutral-100 pb-4 flex items-center justify-between">
              Merchant Center <Landmark size={24} />
            </Link>
          )}
          <Link to="/?category=Handicrafts" className="text-lg font-bold uppercase border-b border-neutral-50 pb-4">Handicrafts</Link>
          <Link to="/?category=Tea" className="text-lg font-bold uppercase border-b border-neutral-50 pb-4">Flash Sale</Link>
          <Link to="/?category=Electronics" className="text-lg font-bold uppercase border-b border-neutral-50 pb-4">New Arrivals</Link>
        </div>
      )}
    </header>
  );
}
