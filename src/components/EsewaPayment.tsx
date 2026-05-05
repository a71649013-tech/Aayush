import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Landmark, CheckCircle2, XCircle, Smartphone, Bell, Copy, Check } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface EsewaPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type EsewaStep = 'info' | 'login' | 'otp' | 'success';

export function EsewaPayment({ amount, onSuccess, onCancel }: EsewaPaymentProps) {
  const [step, setStep] = useState<EsewaStep>('info');
  const [esewaId, setEsewaId] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [realOtp, setRealOtp] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random OTP and trigger notification
  const triggerOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRealOtp(code);
    setTimeout(() => {
      setShowNotification(true);
      // Auto-hide after 15 seconds
      setTimeout(() => setShowNotification(false), 15000);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      triggerOtp();
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp !== realOtp) {
      setError('Invalid OTP code. Please check the notification and try again.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(realOtp);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans">
      {/* Simulated Phone Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-[200] max-w-md mx-auto"
          >
            <div className="bg-neutral-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#60bb46] rounded-md flex items-center justify-center">
                    <span className="text-white text-[10px] font-black italic">e</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">eSewa Mobile Wallet</span>
                </div>
                <span className="text-[9px] font-medium text-white/40">Now</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold">OTP Verification Code</p>
                  <p className="text-xs text-white/70">Your eSewa verification code is: <span className="text-[#60bb46] font-black text-sm tracking-widest">{realOtp}</span></p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors shrink-0"
                >
                  {isCopied ? <Check size={16} className="text-[#60bb46]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-neutral-100 p-4 flex items-center gap-4">
        <button onClick={onCancel} className="p-1 hover:bg-neutral-50 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-neutral-800">eSewa Mobile Wallet</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#60bb46] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-2xl font-black italic">e</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-neutral-800">Pay with your eSewa Account.</h2>
                  <p className="text-xs text-neutral-500">Please make sure you have enough balance in your account.</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-6 rounded-sm space-y-6">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">You will be redirected to your eSewa account to complete your payment.</p>
                
                <ol className="space-y-3">
                  {[
                    "Login to your eSewa account using your eSewa ID and your Password",
                    "Ensure your eSewa account is active and has sufficient balance",
                    "Enter OTP (one time password) sent to your registered mobile number"
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-[11px] font-medium text-neutral-600">
                      <span className="font-black text-neutral-400">{i + 1}.</span> {text}
                    </li>
                  ))}
                </ol>

                <p className="text-[9px] font-black italic text-neutral-400 text-center border-t border-neutral-200 pt-4 uppercase tracking-widest">
                  {"*** Login with your eSewa mobile and PASSWORD (not PIN) ***"}
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-8 space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Subtotal</span>
                   <span className="text-neutral-900 font-bold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between items-end">
                   <span className="text-lg font-black uppercase italic tracking-tighter text-neutral-900">Total Amount</span>
                   <span className="text-2xl font-black text-[#60bb46]">{formatCurrency(amount)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                   <div className="w-10 h-10 bg-[#60bb46] rounded-full flex items-center justify-center">
                     <span className="text-white text-xl font-black italic">e</span>
                   </div>
                   <span className="text-3xl font-black italic tracking-tighter text-[#60bb46]">Sewa</span>
                </div>
                <div className="space-y-1">
                   <h2 className="text-xl font-black uppercase tracking-tighter text-neutral-800">Welcome</h2>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Please enter your eSewa credentials</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">eSewa ID</label>
                  <input 
                    type="text" 
                    placeholder="eSewa Id" 
                    value={esewaId}
                    onChange={(e) => setEsewaId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-4 font-bold text-sm rounded-sm focus:ring-1 focus:ring-[#60bb46] transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">MPIN/Password</label>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-4 font-bold text-sm rounded-sm focus:ring-1 focus:ring-[#60bb46] transition-all outline-none"
                    required
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-[#60bb46] text-white py-4 font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Login
                  </button>
                </div>
              </form>

              <p className="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                © 2009-2026 eSewa. All Rights Reserved.
              </p>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 space-y-10"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                   <Smartphone size={40} />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter">OTP Verification</h2>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed">
                      OTP has been sent to your eSewa ID <br />
                      <span className="text-neutral-800">{esewaId}</span>
                   </p>
                </div>
              </div>

              <div className="bg-neutral-50 p-6 rounded-sm space-y-6">
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-neutral-300 rounded" defaultChecked />
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight">I have read and agree to the terms & conditions mentioned above.</p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Enter OTP</label>
                       <span className="text-[9px] font-bold text-neutral-400 italic uppercase">OTP expires in: 298 sec</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="eg. 123456" 
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ''));
                        setError(null);
                      }}
                      className={`w-full bg-white border p-4 text-center font-black text-xl tracking-[0.5em] rounded-sm focus:ring-1 outline-none transition-all ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-200 focus:ring-blue-600'
                      }`}
                      maxLength={6}
                    />
                    {error && (
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-2">
                        <XCircle size={12} /> {error}
                      </p>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={handleVerify}
                  disabled={otp.length !== 6 || loading}
                  className="w-full bg-neutral-900 text-white py-4 font-black uppercase tracking-[0.2em] rounded-sm hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                   {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                   Confirm Code
                 </button>
                 <button 
                  onClick={() => {
                    setOtp('');
                    setError(null);
                    triggerOtp();
                  }} 
                  className="w-full text-[10px] font-black uppercase text-neutral-400 hover:text-neutral-600 transition-colors tracking-widest"
                 >
                    Resend Code
                 </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 h-full flex flex-col items-center justify-center text-center space-y-6"
            >
               <div className="w-24 h-24 bg-[#60bb46] text-white rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                  <CheckCircle2 size={48} />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">Payment Success</h2>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Proceeding to order confirmation...</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Bottom Action */}
      {step === 'info' && (
        <div className="p-4 bg-white border-t border-neutral-100">
          <button 
            onClick={() => setStep('login')}
            className="w-full bg-daraz-orange text-white py-4 font-black uppercase tracking-[0.2em] rounded-sm shadow-xl active:scale-95 transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
}

