import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Gift, 
  Ticket, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Copy,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showUnityAd } from '../services/unityAdsService';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  watchedRequired: number;
  type: 'percentage' | 'fixed';
}

const AVAILABLE_COUPONS: Coupon[] = [
  { id: '1', code: 'WATCH5', discount: '5% OFF', description: 'Small discount for watching 1 ad', watchedRequired: 1, type: 'percentage' },
  { id: '2', code: 'WATCH15', discount: 'रू 150 OFF', description: 'Flat discount for watching 3 ads', watchedRequired: 3, type: 'fixed' },
  { id: '3', code: 'NEPAL20', discount: '20% OFF', description: 'Big discount for watching 5 ads', watchedRequired: 5, type: 'percentage' },
];

export default function RewardsPage() {
  const navigate = useNavigate();
  const [adsWatched, setAdsWatched] = useState(0);
  const [watching, setWatching] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleWatchAd = () => {
    setWatching(true);
    showUnityAd('rewardedVideo', () => {
      setAdsWatched(prev => prev + 1);
      setWatching(false);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-daraz-bg min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-daraz-orange to-orange-600 p-6 text-white relative overflow-hidden">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="relative z-10 flex flex-col items-center text-center pt-8 pb-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 shadow-2xl border border-white/30">
            <Gift size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Watch & <span className="text-daraz-orange bg-white px-2 py-0.5 rounded-sm">Save</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Support local merchants & earn discounts</p>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 right-10 opacity-10 rotate-12">
          <Sparkles size={80} />
        </div>
        <div className="absolute -bottom-10 -left-10 opacity-10 -rotate-12">
          <Ticket size={120} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
        {/* Progress Card */}
        <div className="bg-white rounded-sm shadow-xl p-6 border border-neutral-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Your Progress</span>
              <span className="text-2xl font-black italic text-neutral-800">{adsWatched} <span className="text-xs uppercase not-italic text-neutral-400">Ads Completed</span></span>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-daraz-orange">
              <PlayCircle size={24} />
            </div>
          </div>

          <button 
            onClick={handleWatchAd}
            disabled={watching}
            className={`w-full py-4 rounded-sm font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
              watching ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-neutral-900 text-white hover:bg-daraz-orange shadow-lg shadow-daraz-orange/20'
            }`}
          >
            {watching ? (
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PlayCircle size={20} />
                Watch Ad to Earn
              </>
            )}
          </button>
          
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-center mt-4">
             Powered by Unity Ads • Support Nepali Mart
          </p>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 flex items-center gap-2">
            <Ticket size={14} className="text-daraz-orange" />
            Unlockable Rewards
          </h2>

          {AVAILABLE_COUPONS.map((coupon) => {
            const isUnlocked = adsWatched >= coupon.watchedRequired;
            const progress = Math.min((adsWatched / coupon.watchedRequired) * 100, 100);

            return (
              <div 
                key={coupon.id} 
                className={`bg-white rounded-sm border p-5 relative overflow-hidden transition-all ${
                  isUnlocked ? 'border-green-500/30' : 'border-neutral-100'
                }`}
              >
                {/* Background Decor */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12">
                   <Ticket size={80} />
                </div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="space-y-1">
                    <h3 className={`text-xl font-black italic uppercase leading-none ${isUnlocked ? 'text-green-600' : 'text-neutral-800'}`}>
                      {coupon.discount}
                    </h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">{coupon.description}</p>
                  </div>
                  
                  {isUnlocked ? (
                    <div className="bg-green-50 text-green-600 p-1.5 rounded-full">
                       <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase text-daraz-orange">{coupon.watchedRequired - adsWatched} More to go</span>
                      <div className="w-20 h-1 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-daraz-orange transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-dashed border-neutral-100 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase text-neutral-400">
                      <Clock size={10} /> Valid for 24h
                   </div>
                   
                   {isUnlocked ? (
                     <button 
                       onClick={() => copyToClipboard(coupon.code)}
                       className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-daraz-orange bg-orange-50 px-4 py-2 rounded-sm border border-daraz-orange/20 hover:bg-daraz-orange hover:text-white transition-all shadow-sm"
                     >
                       {copiedCode === coupon.code ? 'Copied!' : coupon.code}
                       <Copy size={12} />
                     </button>
                   ) : (
                     <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-neutral-400 cursor-not-allowed">
                        <Zap size={12} /> Locked
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {showReward && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-50 border border-white/10"
            >
              <div className="bg-daraz-orange p-1.5 rounded-full">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Ad Watched! Reward Progress +1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
