import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';

export default function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-daraz-bg min-h-screen pb-24">
      {/* Mobile-style sticky header */}
      <div className="bg-white p-4 flex items-center gap-4 border-b border-neutral-200 sticky top-0 z-10 lg:hidden">
        <button onClick={() => navigate(-1)} className="text-neutral-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-black uppercase tracking-tighter italic text-lg">All Categories</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/?category=${cat.name}`)}
              className="bg-white p-4 rounded-sm shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all border border-transparent hover:border-daraz-orange/20"
            >
              <div className="flex items-center gap-4">
                <div className={`${cat.color} text-white p-3 rounded-full flex items-center justify-center`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-neutral-800 uppercase tracking-tight">{cat.name}</span>
              </div>
              <ChevronRight size={18} className="text-neutral-300 group-hover:text-daraz-orange transition-colors" />
            </motion.button>
          ))}
        </div>

        {/* Featured Branding Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-daraz-orange to-orange-700 rounded-sm text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black italic tracking-tighter leading-none mb-2">NEPALI MART</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Supporting 500+ local artisans nationwide</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 scale-150">
             <Landmark size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}
