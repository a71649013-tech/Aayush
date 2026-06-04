import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { gemService, VOUCHER_TEMPLATES, STREAK_REWARDS, getLocalDateString, VoucherTemplate } from '../services/gemService';
import { UserVoucher } from '../types'; // Adjust imports if necessary
import { Gift, Flame, Sparkles, Coins, Ticket, Clock, Check, AlertCircle, ShoppingBag, Eye, Copy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function GemsVouchersPage() {
  const { user } = useFirebase();
  const [gems, setGems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastClaimed, setLastClaimed] = useState('');
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Feedback states
  const [claimSuccess, setClaimSuccess] = useState<{ gemsEarned: number; newStreak: number } | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const todayStr = getLocalDateString();
  const hasClaimedToday = lastClaimed === todayStr;

  // Fetch / Sync status
  useEffect(() => {
    if (user?.id && user.id !== 'pin-admin') {
      // Sync from Firebase Context User state
      setGems(user.gems || 0);
      setStreak(user.streak || 0);
      setLastClaimed(user.lastClaimed || '');
      setMyVouchers(user.vouchers || []);
      setLoading(false);
    } else {
      // Load offline guest state
      const state = gemService.getGuestState();
      setGems(state.gems);
      setStreak(state.streak);
      setLastClaimed(state.lastClaimed);
      setMyVouchers(state.vouchers || []);
      setLoading(false);
    }
  }, [user]);

  // Handle daily gems claim
  const handleClaimGems = async () => {
    setActionProcessing(true);
    setErrorMsg(null);
    setClaimSuccess(null);
    try {
      const response = await gemService.claimDailyGems(user?.id);
      
      // Update local states for responsive UI
      setGems(response.newTotal);
      setStreak(response.newStreak);
      setLastClaimed(todayStr);
      setClaimSuccess({ gemsEarned: response.gemsEarned, newStreak: response.newStreak });
      
      // If guest user, also trigger storage syncing just in case
      if (!user?.id || user.id === 'pin-admin') {
        const updatedLocal = gemService.getGuestState();
        setGems(updatedLocal.gems);
        setStreak(updatedLocal.streak);
        setLastClaimed(updatedLocal.lastClaimed);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification error, failed to claim rewards.');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle voucher redemption
  const handleRedeemVoucher = async (templateId: string) => {
    setActionProcessing(true);
    setErrorMsg(null);
    setRedeemSuccess(null);
    try {
      const claimedVoucher = await gemService.redeemVoucher(templateId, user?.id);
      
      setRedeemSuccess(claimedVoucher);
      
      // Refresh local states
      if (user?.id && user.id !== 'pin-admin') {
        setGems(prev => prev - (VOUCHER_TEMPLATES.find(v => v.id === templateId)?.cost || 0));
        setMyVouchers(prev => [...prev, claimedVoucher]);
      } else {
        const state = gemService.getGuestState();
        setGems(state.gems);
        setMyVouchers(state.vouchers);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'System error on voucher purchase.');
    } finally {
      setActionProcessing(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 font-sans">
      
      {/* Banner Segment */}
      <div className="bg-gradient-to-r from-daraz-orange to-[#f55924] rounded-sm p-8 text-white relative overflow-hidden shadow-2xl mb-12">
        <div className="absolute right-0 top-0 opacity-20 transform translate-x-12 -translate-y-12">
          <Sparkles size={300} className="text-white" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white text-[10px] uppercase tracking-[0.25em] font-black px-3 py-1 rounded-sm mb-4 inline-block">
            Gems & Loyalty Hub
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight italic line-height-none">
            Gem Rewards <span className="text-neutral-900 block md:inline">Store</span>
          </h1>
          <p className="mt-4 text-xs md:text-sm font-bold uppercase tracking-wider text-white/90">
            Check in consecutively every single day to rack up Gems points. Burn your Gems here to claim high-value vouchers for instant offsets during checkout!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-sm p-4 text-xs font-bold uppercase tracking-wider mb-8 flex items-center gap-3">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Staking/Daily Claims & Rewards Counter */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Daily Checks Box */}
          <div className="bg-white rounded-sm border border-neutral-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-neutral-800 flex items-center gap-2">
                  <Flame size={20} className="text-daraz-orange" /> Daily Check-In Challenge
                </h2>
                <p className="text-xs text-neutral-500 font-bold mt-1">
                  DON'T BREAK YOUR STREAK! CLAIM VALUE-BOOSTED REWARDS EVERY CONSECUTIVE DAY.
                </p>
              </div>
              
              <button
                onClick={handleClaimGems}
                disabled={hasClaimedToday || actionProcessing}
                className={`py-3.5 px-8 rounded-sm font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2 shadow-md ${
                  hasClaimedToday
                    ? 'bg-neutral-150 border border-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-daraz-orange text-white hover:opacity-95'
                }`}
              >
                {hasClaimedToday ? (
                  <>
                    <Check size={14} /> Claimed Today
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="animate-pulse" /> Claim Today's Gems
                  </>
                )}
              </button>
            </div>

            {/* Week Streak Tracker */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
              {STREAK_REWARDS.map((val, idx) => {
                const dayNum = idx + 1;
                const isClaimed = streak >= dayNum && (hasClaimedToday || streak > dayNum);
                const isCurrentPending = !hasClaimedToday && streak === idx;
                
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-sm border flex flex-col items-center justify-between text-center min-h-[120px] relative transition-all ${
                      isClaimed
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : isCurrentPending
                        ? 'bg-daraz-orange/5 border-daraz-orange text-daraz-orange ring-1 ring-daraz-orange shadow-md'
                        : 'bg-neutral-50 border-neutral-100 text-neutral-400'
                    }`}
                  >
                    {isClaimed && (
                      <span className="absolute top-2 right-2 text-green-600 bg-white shadow-sm p-0.5 rounded-full">
                        <Check size={10} strokeWidth={4} />
                      </span>
                    )}
                    
                    <span className="text-[10px] font-black uppercase tracking-wider">Day {dayNum}</span>
                    <Coins size={22} className={isClaimed ? 'text-green-600' : isCurrentPending ? 'text-daraz-orange' : 'text-neutral-300'} />
                    <div>
                      <span className="text-sm font-black tracking-tight font-mono">{val}</span>
                      <span className="text-[10px] font-bold block opacity-80 uppercase text-[8px] tracking-wide">Gems</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animation claim modals */}
            <AnimatePresence>
              {claimSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border-2 border-green-400/40 rounded-sm p-6 text-center mt-6 flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-3">
                    <Sparkles size={24} className="animate-bounce" />
                  </div>
                  <h3 className="text-md font-black text-green-800 uppercase tracking-tight">Reward Claimed!</h3>
                  <p className="text-xs text-green-700 mt-1 max-w-sm">
                    Awesome! You gained <span className="font-black">+{claimSuccess.gemsEarned} Gems</span> today. Keep up the rhythm to reach the Day 7 jackpot of 150 Gems!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vouchers Store/Redeem Table */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-800 mb-6 flex items-center gap-2">
              <Ticket size={22} className="text-daraz-orange" /> Exchange Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VOUCHER_TEMPLATES.map((tpl) => {
                const canAfford = gems >= tpl.cost;
                return (
                  <div 
                    key={tpl.id}
                    className="bg-white border border-neutral-200 rounded-sm overflow-hidden flex flex-col justify-between hover:border-daraz-orange/40 hover:shadow-lg transition-all"
                  >
                    {/* Voucher perforated ticket top */}
                    <div className="p-5 border-b border-dashed border-neutral-200 bg-neutral-50/50 relative">
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neutral-50 border border-neutral-200 rounded-full"></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neutral-50 border border-neutral-200 rounded-full"></div>
                      
                      <div className="flex justify-between items-start">
                        <div className="bg-daraz-orange text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                          {tpl.code}
                        </div>
                        <div className="flex items-center gap-1 text-daraz-orange">
                          <Coins size={14} />
                          <span className="font-extrabold text-xs text-daraz-orange uppercase font-mono">{tpl.cost} Gems</span>
                        </div>
                      </div>

                      <h3 className="text-md font-black text-neutral-800 tracking-tight mt-3 uppercase leading-tight italic">
                        {tpl.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-medium mt-2 leading-relaxed">
                        {tpl.description}
                      </p>
                      
                      {tpl.category && (
                        <span className="inline-block mt-3 bg-neutral-200 text-neutral-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                          Category: {tpl.category}
                        </span>
                      )}
                    </div>

                    {/* Ticket bottom control */}
                    <div className="p-4 bg-white flex justify-between items-center bg-neutral-50/20">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        Expiry: 30 days after claim
                      </div>
                      <button
                        onClick={() => handleRedeemVoucher(tpl.id)}
                        disabled={!canAfford || actionProcessing}
                        className={`py-2 px-4 rounded-sm font-black uppercase tracking-wider text-[10px] transition-all ${
                          canAfford
                            ? 'bg-daraz-orange text-white hover:opacity-95'
                            : 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Voucher' : 'Not Enough Gems'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Account Balance & My Claimed Vouchers */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Points Balance Card */}
          <div className="bg-neutral-900 text-white rounded-sm p-6 shadow-xl relative overflow-hidden">
            <span className="absolute top-0 right-0 p-8 text-neutral-800 pointer-events-none transform translate-x-4 -translate-y-4">
              <Coins size={120} />
            </span>
            
            <h2 className="text-xs font-black uppercase tracking-widest text-[#f8a87d] mb-4">
              Your Gems Ledger
            </h2>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black font-sans tracking-tight text-white">{gems}</span>
              <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest font-mono">Gems</span>
            </div>
            
            <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider mb-6">
              {user ? `Cloud Account: ${user.email}` : "Visitor mode: Data stored locally on this browser"}
            </p>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Active Streak</span>
              <span className="bg-white/10 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame size={12} className="text-orange-400 fill-orange-400" /> {streak} Days
              </span>
            </div>
          </div>

          {/* Vouchers display feedback */}
          <AnimatePresence>
            {redeemSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border-2 border-dashed border-daraz-orange p-6 text-center rounded-sm relative"
              >
                <div className="absolute top-2 right-2 text-neutral-300 cursor-pointer hover:text-neutral-500" onClick={() => setRedeemSuccess(null)}>×</div>
                <div className="w-10 h-10 bg-daraz-orange text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={20} strokeWidth={3} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-neutral-800">Voucher Secured!</h3>
                <p className="text-xs font-bold text-daraz-orange mt-1 font-mono tracking-wider">{redeemSuccess.code}</p>
                <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest mt-3">
                  It will automatically show up in your Delivery cart checkouts!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User's Claimed Vouchers Ledger */}
          <div className="bg-white rounded-sm border border-neutral-200 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-800 mb-6 pb-4 border-b border-neutral-100 flex items-center gap-2">
              <Ticket size={16} className="text-daraz-orange" /> My Vouchers Portfolio
            </h2>

            {myVouchers.filter(v => !v.isUsed).length === 0 ? (
              <div className="py-8 text-center">
                <Ticket size={32} className="text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider leading-relaxed">
                  Your portfolio is empty.
                </p>
                <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">
                  Redeem gems to populate your chest!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myVouchers.filter(v => !v.isUsed).map((vch) => (
                  <div 
                    key={vch.id}
                    className="border border-neutral-200 rounded-sm p-4 relative overflow-hidden bg-neutral-50 hover:border-daraz-orange/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800 leading-tight">
                          {vch.title}
                        </h4>
                        <p className="text-[9px] text-neutral-400 font-bold mt-1">
                          Min spend: {formatCurrency(vch.minSpent)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs bg-white text-daraz-orange border border-daraz-orange/30 font-black uppercase px-2 py-0.5 rounded-sm">
                          {vch.discount}{vch.type === 'percentage' ? '%' : ' Rs'} OFF
                        </span>
                      </div>
                    </div>

                    {/* Copier overlay */}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-200/60 pt-3">
                      <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider font-mono">
                        {vch.code}
                      </div>

                      <button
                        onClick={() => copyToClipboard(vch.code)}
                        className="text-[9px] font-black uppercase text-neutral-500 hover:text-daraz-orange transition-colors flex items-center gap-1 tracking-wider"
                      >
                        {copiedCode === vch.code ? (
                          <>
                            <Check size={10} className="text-green-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={10} /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hint guidelines */}
            <div className="mt-6 border-t border-neutral-100 pt-4 flex gap-3 text-neutral-400">
              <Gift size={16} className="text-daraz-orange shrink-0 mt-0.5" />
              <p className="text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                Click Vouchers code during delivery bag process to get direct deductions instantly.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
