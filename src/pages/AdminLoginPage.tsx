import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, LogIn } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useFirebase } from '../context/FirebaseContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // The context will update, showing the user as logged in.
      // We can then check their role or just navigate to dashboard
      // where the guard will handle it.
      navigate('/admin');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-neutral-900 rounded-sm shadow-2xl border border-neutral-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>
        
        <div className="p-10 relative z-10">
          <div className="mb-10">
            <Link to="/login" className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase transition-colors hover:text-white mb-6">
              <ArrowLeft size={12} /> Back to User Login
            </Link>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
              Control <br /><span className="text-daraz-orange">Panel</span>
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
              <ShieldCheck size={12} className="text-daraz-orange" /> Restricted Access Area
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-neutral-400">
              Please sign in with your authorized Google account to access the administration dashboard.
            </p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                <p className="text-xs text-red-500 font-bold uppercase">{error}</p>
              </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-neutral-900 py-4 rounded-sm font-black uppercase text-xs tracking-[0.2em] hover:bg-neutral-100 transition-all flex items-center justify-center gap-3 group"
            >
              <LogIn size={18} /> Sign In with Google
            </button>
          </div>

          <p className="mt-12 text-[9px] text-neutral-600 text-center uppercase tracking-widest leading-relaxed">
            All attempts are logged. Unauthorized access is strictly prohibited under the Nepali Mart Digital Security Act.
          </p>
        </div>
      </div>
    </div>
  );
}
