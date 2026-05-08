import React from 'react';
import { Home, List, ShoppingCart, User as UserIcon, Gift } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useFirebase } from '../context/FirebaseContext';

import { User } from '../types';

export default function MobileBottomNav({ cartCount }: { cartCount: number }) {
  const { user } = useFirebase();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-[54px] left-0 right-0 bg-white border-t border-neutral-200 px-6 py-2 z-[70] flex justify-between items-center shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <Home size={22} className={isActive('/') ? 'fill-daraz-orange' : ''} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
      </Link>
      
      <Link to="/categories" className={`flex flex-col items-center gap-1 ${isActive('/categories') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <List size={22} className={isActive('/categories') ? 'text-daraz-orange' : ''} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Categories</span>
      </Link>

      <Link to="/rewards" className={`flex flex-col items-center gap-1 ${isActive('/rewards') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <Gift size={22} className={isActive('/rewards') ? 'text-daraz-orange' : 'fill-none'} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Rewards</span>
      </Link>
      
      <Link to="/cart" className={`flex flex-col items-center gap-1 relative ${isActive('/cart') ? 'text-daraz-orange' : 'text-neutral-500'}`}>
        <ShoppingCart size={22} className={isActive('/cart') ? 'fill-daraz-orange' : ''} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-daraz-orange text-white text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-tighter">Cart</span>
      </Link>
      
      <Link 
        to={user ? "/profile" : "/login"} 
        className={`flex flex-col items-center gap-1 ${isActive('/profile') || isActive('/login') || isActive('/register') ? 'text-daraz-orange' : 'text-neutral-500'}`}
      >
        <UserIcon size={22} className={isActive('/profile') || isActive('/login') ? 'fill-daraz-orange' : ''} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Account</span>
      </Link>
    </div>
  );
}
