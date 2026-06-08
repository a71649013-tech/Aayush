import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Smartphone, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { registerWithEmail } from '../lib/firebase';
import { useFirebase } from '../context/FirebaseContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginAsLocalGuest } = useFirebase();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await registerWithEmail(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('FIREBASE_OPERATION_NOT_ALLOWED');
      } else {
        setError(`Registration failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-sm shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-800 uppercase italic tracking-tighter">
              Create <span className="text-daraz-orange">Account</span>
            </h2>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-2">Join Nepali Mart community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Mobile Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  required
                  placeholder="+977"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

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
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {error && (
              error === 'FIREBASE_OPERATION_NOT_ALLOWED' ? (
                <div className="bg-amber-50/90 border border-amber-200 rounded-sm p-4 text-left space-y-3 shadow-sm select-text text-neutral-800">
                  <div className="flex gap-2.5">
                    <div className="p-1 h-fit bg-amber-100 rounded-full text-amber-600 mt-0.5">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                        Firebase Email/Password Auth Disabled
                      </h4>
                      <p className="text-[11px] leading-relaxed text-amber-900 mt-1 font-medium">
                        Your Firebase project does not have the **Email/Password** sign-in provider enabled yet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 rounded border border-amber-200/50 p-3 space-y-2 text-[10.5px]">
                    <p className="font-bold text-amber-950 uppercase tracking-wider">How to enable it (takes 30 seconds):</p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-neutral-700 leading-normal font-medium">
                      <li>
                        Go to your <a href="https://console.firebase.google.com/project/ai-studio-071403a4-bd3d-49d9-94db-c87381642bd4/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline hover:text-blue-800">Firebase Console (Click here)</a>.
                      </li>
                      <li>Under <strong>Build &gt; Authentication</strong>, select the <strong>Sign-in method</strong> tab.</li>
                      <li>Click <strong>Add new provider</strong> (or edit the disabled <strong>Email/Password</strong>).</li>
                      <li>Toggle it to <strong>Enable</strong> and click <strong>Save</strong>!</li>
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-amber-200/50 flex flex-col gap-2">
                    <p className="text-[10px] text-amber-900 font-bold uppercase tracking-wider text-center">Or skip settings & play instantly:</p>
                    <button
                      type="button"
                      onClick={() => {
                        loginAsLocalGuest();
                        navigate('/');
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-widest py-2.5 rounded-sm text-center shadow transition-all cursor-pointer"
                    >
                      ⚡ Instant Bypass to Demo Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-[11px] font-semibold rounded-sm leading-relaxed bg-red-50 border border-red-150 text-red-600 uppercase">
                  {error}
                </div>
              )
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-daraz-orange text-white py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign Up <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500 font-medium">
              Already have an account? <Link to="/login" className="text-daraz-orange hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
