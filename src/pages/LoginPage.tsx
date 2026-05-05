import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { signInWithGoogle } from '../lib/firebase';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Google login failed.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep internal logic as fallback or just alert
    alert('Standard login is currently disabled. Please use Google Login.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-sm shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-800 uppercase italic tracking-tighter">
              Welcome <span className="text-daraz-orange">Back</span>
            </h2>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-2">Log in to your account</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-neutral-900 text-white py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 mb-6"
            >
              <LogIn size={18} /> Sign In with Google
            </button>

            <div className="relative flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-neutral-100"></div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">OR</span>
              <div className="flex-1 h-px bg-neutral-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Password</label>
                  <Link to="/forgot-password" title="Coming soon!" className="text-[10px] text-blue-500 hover:underline font-bold uppercase">Forgot?</Link>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    placeholder="Enter your password"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-daraz-orange text-white py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 group mt-6"
              >
                Sign In <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-4">
            <p className="text-xs text-neutral-500 font-medium">
              New to Nepali Mart? <Link to="/register" className="text-daraz-orange hover:underline font-bold">Register Now</Link>
            </p>
            <div className="flex justify-center">
              <Link to="/admin-login" className="flex items-center gap-1.5 text-[10px] bg-neutral-100 px-3 py-1.5 rounded-full text-neutral-500 font-bold uppercase hover:bg-neutral-200 transition-colors">
                <ShieldAlert size={12} /> Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
