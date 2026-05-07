import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Landmark, Headphones, Smartphone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-daraz-orange">
              Nepali<span className="text-neutral-900">Mart</span>
            </Link>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-loose">
              Nepal's fastest growing institutional and handicraft marketplace. Connecting local artisans to the digital economy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-daraz-orange hover:text-white transition-all cursor-pointer">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-daraz-orange hover:text-white transition-all cursor-pointer">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-daraz-orange hover:text-white transition-all cursor-pointer">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-daraz-orange hover:text-white transition-all cursor-pointer">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-neutral-900">Customer Care</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Help Center</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">How to Buy</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Returns & Refunds</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Contact Us</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div className="space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-neutral-900">Marketplace</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">All Categories</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Flash Sale</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Nepali Handicrafts</Link></li>
              <li><Link to="/" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-daraz-orange">Corporate Purchase</Link></li>
              <li><Link to="/merchant" className="text-[10px] font-black text-daraz-orange uppercase tracking-widest hover:underline flex items-center gap-1">
                <Landmark size={12} /> Merchant Center
              </Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-black uppercase tracking-widest text-xs text-neutral-900">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                 <Smartphone size={16} className="text-daraz-orange shrink-0" />
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">+977 982-8105337</p>
              </div>
              <div className="flex gap-3">
                 <Headphones size={16} className="text-daraz-orange shrink-0" />
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">support@nepalimart.com</p>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
               <p className="text-[8px] font-bold text-neutral-400 uppercase leading-relaxed">
                  Head Office: Kathmandu, Nepal <br />
                  Registration: #4582910-NP
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            © 2026 Nepali Mart. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 grayscale opacity-50">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
             <span className="text-[10px] font-black text-neutral-900 uppercase italic">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
