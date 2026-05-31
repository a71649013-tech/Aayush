import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Delete, Key } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loginAsPinAdmin } = useFirebase();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAnimationShaking, setIsAnimationShaking] = useState(false);

  // Authorized passcode list
  const AUTHORIZED_PINS = ['7164', '2580', '2026'];

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Handle digit inputs
  const handleKeyPress = (num: string) => {
    setError(null);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit when 4 digits are completed
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin(prev => prev.slice(0, -1));
  };

  const verifyPin = (submittedPin: string) => {
    if (AUTHORIZED_PINS.includes(submittedPin)) {
      loginAsPinAdmin();
      navigate('/admin');
    } else {
      setIsAnimationShaking(true);
      setError('Incorrect Admin Code. Please check the passcode and try again.');
      setPin('');
      setTimeout(() => setIsAnimationShaking(false), 500);
    }
  };

  // Keyboard support for desktop/webview testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        setPin('');
        setError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-neutral-950">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-daraz-orange/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-daraz-orange/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* Back to User Login Header */}
          <div className="w-full flex justify-between items-center mb-8">
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold transition-colors hover:text-neutral-300">
              <ArrowLeft size={14} /> Back
            </Link>
            <span className="text-[10px] bg-daraz-orange/10 text-daraz-orange px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 border border-daraz-orange/20">
              <ShieldCheck size={12} /> Restricted
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-neutral-800 border border-neutral-700/50 rounded-xl flex items-center justify-center mb-3 mx-auto text-daraz-orange shadow-lg">
              <Key size={22} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              Admin <span className="text-daraz-orange">Access</span>
            </h2>
            <p className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest mt-1">
              Enter 4-Digit Passcode
            </p>
          </div>

          {/* passcode Indicator Gaps */}
          <div className={`flex gap-4 justify-center my-6`}>
            {[...Array(4)].map((_, index) => {
              const isFilled = index < pin.length;
              return (
                <div 
                  key={index}
                  className={`w-12 h-14 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                    isFilled 
                      ? 'bg-daraz-orange/10 border-daraz-orange text-white text-lg font-black shadow-[0_0_15px_rgba(255,70,70,0.15)] scale-105' 
                      : 'bg-neutral-800/50 border-neutral-700/80 text-neutral-600'
                  }`}
                  style={{
                    animation: isAnimationShaking ? 'shake 0.5s ease-in-out' : 'none'
                  }}
                >
                  {isFilled ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-daraz-orange animate-scaleUp" />
                  ) : (
                    <span className="text-xs">•</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message Box */}
          <div className="h-6 w-full flex items-center justify-center">
            {error && (
              <p className="text-[11px] text-red-500 font-bold uppercase tracking-tight bg-red-500/10 border border-red-500/20 px-3 py-0.5 rounded-full">
                {error}
              </p>
            )}
          </div>

          {/* Native Style Number Pad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-14 bg-neutral-800/40 border border-neutral-800 hover:border-neutral-700/50 hover:bg-neutral-800 active:bg-neutral-700 text-white font-black text-lg rounded-xl transition-all duration-100 flex items-center justify-center cursor-pointer shadow-md select-none"
              >
                {num}
              </button>
            ))}
            
            {/* Clear Button */}
            <button
              type="button"
              onClick={() => { setPin(''); setError(null); }}
              className="h-14 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400 font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center cursor-pointer select-none border border-transparent hover:border-neutral-800"
            >
              Clear
            </button>
            
            {/* Number 0 */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 bg-neutral-800/40 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 active:bg-neutral-700 text-white font-black text-lg rounded-xl transition-all duration-100 flex items-center justify-center cursor-pointer shadow-md select-none"
            >
              0
            </button>
            
            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400 rounded-xl transition-all flex items-center justify-center cursor-pointer select-none border border-transparent hover:border-neutral-800"
            >
              <Delete size={18} />
            </button>
          </div>

          {/* Secure disclaimer for high-end feel */}
          <div className="mt-8 border-t border-neutral-800/50 pt-5 w-full">
            <p className="text-[9px] text-neutral-600 uppercase tracking-wider leading-relaxed font-semibold">
              Authorized admin codes reset periodically. System monitored under Sec-Act.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded CSS for shake animation keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .animate-scaleUp {
          animation: scaleUp 0.15s ease-out;
        }
        @keyframes scaleUp {
          from { transform: scale(0.3); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
