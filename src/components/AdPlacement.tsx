import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface AdPlacementProps {
  type?: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ type = 'sidebar', className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-white border border-neutral-100 rounded-sm group ${className}`}>
      {/* Ad Label */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-bl-sm">
        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Sponsored</span>
        <Info size={8} className="text-neutral-400" />
      </div>

      <a 
        href="https://unity.com/solutions/ads" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {type === 'sidebar' && (
          <div className="p-4 space-y-3">
            <div className="aspect-[4/3] bg-neutral-900 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400" 
                alt="Ad" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                  <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Unity Cloud</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight mb-1">Scale Your Game Globally</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">Get the tools you need to build, manage, and grow your projects on Unity Cloud.</p>
            </div>
            <button className="w-full py-2 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-daraz-orange transition-colors">
              Learn More <ExternalLink size={10} />
            </button>
          </div>
        )}

        {type === 'banner' && (
          <div className="flex items-center gap-6 p-4 h-24">
             <div className="w-32 h-full bg-neutral-900 flex-shrink-0">
               <img 
                 src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=400" 
                 alt="Ad" 
                 className="w-full h-full object-cover"
               />
             </div>
             <div className="flex-1">
               <h4 className="text-sm font-black text-neutral-800 uppercase italic">Powering Real-time 3D Experiences</h4>
               <p className="text-[10px] text-neutral-500 font-medium">Create once, deploy everywhere with the world's most popular game engine.</p>
             </div>
             <button className="px-6 py-2 bg-daraz-orange text-white text-[10px] font-black uppercase tracking-widest rounded-sm whitespace-nowrap">
               Try Now
             </button>
          </div>
        )}
      </a>
    </div>
  );
};
