import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert, LogIn, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';
import { useFirebase } from '../context/FirebaseContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginAsLocalGuest } = useFirebase();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const email = 'customer@nepalimart.com';
      const password = 'guest_nepalimart_2026';
      
      try {
        await loginWithEmail(email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // If the guest user doesn't exist, register them dynamically
          try {
            await registerWithEmail(email, password, 'Guest Customer');
          } catch (signUpErr) {
            console.warn("Guest account already existed or could not register, trying password sign-in again.");
          }
          await loginWithEmail(email, password);
        } else if (err.code === 'auth/operation-not-allowed') {
          setError('FIREBASE_OPERATION_NOT_ALLOWED');
          return;
        } else {
          throw err;
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error("Guest login registration/auth failed:", err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setError('FIREBASE_OPERATION_NOT_ALLOWED');
      } else {
        setError(`Guest Login failed. Register a brand new free account using "Register Now" below!\nDetails: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in the Firebase console for Google Sign-In. You need to add this domain to "Authorized domains" under Authentication settings.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled as a sign-in provider in your Firebase project. Please enable it in the Firebase console.');
      } else if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user') || err.message?.includes('popup')) {
        setError('GOOGLE LOGIN ERROR: The Google login popup was blocked or closed. This happens because the app is running nested in an iframe preview. To fix this:\n\n1. Click "Open in New Tab" at the top of your preview screen to run the app outside the iframe, then Google login will work seamlessly.\n2. Or register a test account below using standard Email & Password!');
      } else {
        setError(`Google login failed: ${err.message || err.code || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginWithEmail(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      console.error("Email Login Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('FIREBASE_OPERATION_NOT_ALLOWED');
      } else {
        setError(`Login failed: ${err.message || 'Please try again.'}`);
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
              Welcome <span className="text-daraz-orange">Back</span>
            </h2>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-2">Log in to your account</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-daraz-orange text-white py-3.5 rounded-sm font-black uppercase text-xs tracking-widest hover:bg-daraz-orange/95 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(240,86,37,0.18)] cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={16} className="text-amber-200" />
              )}
              ⚡ Quick Guest Sign-In
            </button>

            <p className="text-[9px] text-neutral-500 text-center font-extrabold uppercase tracking-widest leading-normal mb-8 max-w-[320px] mx-auto">
              💡 Bypasses iframe / cookie partitioning errors instantly. Recommended for testing!
            </p>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              Sign In with Google
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
                  <div className={cn(
                    "p-3 text-[11px] font-semibold rounded-sm leading-relaxed whitespace-pre-wrap",
                    error.includes('GOOGLE LOGIN ERROR')
                      ? "bg-amber-50 border border-amber-200 text-amber-800 text-left"
                      : "bg-red-50 border border-red-150 text-red-600 uppercase"
                  )}>
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
                    Sign In <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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
