import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Smartphone, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would handle registration
    alert('Registration successful! Please login.');
    navigate('/login');
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
                  placeholder="Min. 8 characters"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm py-2.5 px-4 pl-10 text-sm focus:bg-white focus:border-daraz-orange outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-daraz-orange text-white py-3 rounded-sm font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 group mt-6"
            >
              Sign Up <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
