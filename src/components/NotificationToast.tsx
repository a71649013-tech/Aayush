import React, { useEffect } from 'react';
import { Bell, MessageSquare, Package, Megaphone, X, Sparkles } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationToast() {
  const { activeToast, dismissToast } = useFirebase();
  const navigate = useNavigate();

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const { title, body, category } = activeToast;

  // Icon selector based on category
  const getCategoryTheme = () => {
    switch (category) {
      case 'chats':
        return {
          icon: <MessageSquare className="text-blue-500 shrink-0" size={18} />,
          label: 'Customer Support Inquiry',
          borderColor: 'border-blue-500',
          badgeBg: 'bg-blue-50 text-blue-700',
          navigatePath: '/messages'
        };
      case 'orders':
        return {
          icon: <Package className="text-emerald-500 shrink-0" size={18} />,
          label: 'Logistics Update',
          borderColor: 'border-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700',
          navigatePath: '/messages'
        };
      case 'activities':
        return {
          icon: <Sparkles className="text-amber-500 shrink-0" size={18} />,
          label: 'Gems & Activities Reward',
          borderColor: 'border-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700',
          navigatePath: '/gems'
        };
      case 'promos':
      default:
        return {
          icon: <Megaphone className="text-daraz-orange shrink-0" size={18} />,
          label: 'Nepali Mart Blast',
          borderColor: 'border-daraz-orange',
          badgeBg: 'bg-orange-50 text-daraz-orange',
          navigatePath: '/messages'
        };
    }
  };

  const theme = getCategoryTheme();

  const handleToastClick = () => {
    navigate(theme.navigatePath);
    dismissToast();
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-[9999] animate-bounce-short">
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-lg shadow-xl border-l-4 ${theme.borderColor} p-4 flex gap-3 transition-all duration-350 transform hover:-translate-y-0.5 cursor-pointer relative items-start`}
        onClick={handleToastClick}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Left Icon Area */}
        <div className="p-2 bg-neutral-50 rounded-md">
          {theme.icon}
        </div>

        {/* Text Area */}
        <div className="flex-1 text-left min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badgeBg}`}>
              {theme.label}
            </span>
            <span className="text-[9px] text-neutral-400 font-bold ml-auto shrink-0">Just Now</span>
          </div>
          <h4 className="text-[12px] font-extrabold text-neutral-900 leading-snug truncate">
            {title}
          </h4>
          <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
            {body}
          </p>
          <p className="text-[8px] text-daraz-orange font-bold uppercase tracking-widest mt-1.5 flex items-center gap-0.5 hover:underline">
            View details &rsaquo;
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 transition-colors p-1 hover:bg-neutral-50 rounded"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
