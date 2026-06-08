import React from 'react';
import { Home, MessageSquare, ShoppingCart, User as UserIcon, Gift } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useFirebase } from '../context/FirebaseContext';

import { User } from '../types';

export default function MobileBottomNav({ cartCount }: { cartCount: number }) {
  const { user, unreadCount } = useFirebase();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2.5 z-[70] flex justify-around items-end shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <Home size={22} className={isActive('/') ? 'fill-daraz-orange' : ''} />
        <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
      </Link>
      
      <Link to="/messages" className={`flex flex-col items-center gap-1 relative ${isActive('/messages') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <MessageSquare size={22} className={isActive('/messages') ? 'fill-daraz-orange' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white animate-pulse">
            {unreadCount}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-tight">Messages</span>
      </Link>

      <Link 
        to="/vouchers" 
        className={`flex flex-col items-center gap-0.5 relative z-10 -translate-y-2.5 bg-white p-1 rounded-full border-2 border-neutral-50/50 shadow-sm ${isActive('/vouchers') ? 'text-daraz-orange' : 'text-neutral-500'}`}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-daraz-orange to-amber-500 flex items-center justify-center text-white shadow-md active:scale-95 transition-all">
          <Gift size={18} className="fill-white/10" />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Gems</span>
      </Link>
      
      <Link to="/cart" className={`flex flex-col items-center gap-1 relative ${isActive('/cart') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <ShoppingCart size={22} className={isActive('/cart') ? 'fill-daraz-orange' : ''} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-daraz-orange text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-tight">Cart</span>
      </Link>
      
      <Link 
        to={user ? "/profile" : "/login"} 
        className={`flex flex-col items-center gap-1 ${isActive('/profile') || isActive('/login') || isActive('/register') ? 'text-daraz-orange' : 'text-neutral-500'}`}
      >
        <UserIcon size={22} className={isActive('/profile') || isActive('/login') ? 'fill-daraz-orange' : ''} />
        <span className="text-[9px] font-bold uppercase tracking-tight">Account</span>
      </Link>
    </div>
  );
}
