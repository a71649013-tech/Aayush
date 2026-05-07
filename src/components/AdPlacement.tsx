import React from 'react';
import { ExternalLink, Info, PlayCircle } from 'lucide-react';
import { UNITY_GAME_ID, showUnityAd } from '../services/unityAdsService';

interface AdPlacementProps {
  type?: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ type = 'sidebar', className = '' }) => {
  const handleShowAd = (e: React.MouseEvent) => {
    e.preventDefault();
    showUnityAd(); // Standard video placement
  };

  return (
    <div className={`relative overflow-hidden bg-white border border-neutral-100 rounded-sm group ${className}`}>
      {/* Ad Label */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-bl-sm">
        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Sponsored</span>
        <Info size={8} className="text-neutral-400" />
      </div>

      <div className="block">
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
                  <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Game ID: {UNITY_GAME_ID.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-800 uppercase tracking-tight mb-1">Scale Your Game Globally</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">Unity Ads integration active with project ID {UNITY_GAME_ID}.</p>
            </div>
            <button 
              onClick={handleShowAd}
              className="w-full py-2 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-daraz-orange transition-colors"
            >
              Watch Ad <PlayCircle size={10} />
            </button>
            <a 
              href={`https://dashboard.unity3d.com/organizations/-/projects/${UNITY_GAME_ID}/monetization/reporting`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8px] font-black uppercase tracking-widest text-neutral-400 hover:text-daraz-orange block text-center mt-2"
            >
               View Dashboard <ExternalLink size={8} className="inline ml-1" />
            </a>
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
               <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Unity Ads integrated. Project: {UNITY_GAME_ID.slice(0, 13)}...</p>
             </div>
             <button 
               onClick={handleShowAd}
               className="px-6 py-2 bg-daraz-orange text-white text-[10px] font-black uppercase tracking-widest rounded-sm whitespace-nowrap hover:scale-105 active:scale-95 transition-all"
             >
               Play Ad
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
