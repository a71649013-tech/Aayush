import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Facebook, Twitter, Send, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ShareModal({ isOpen, onClose, product }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const productUrl = `${window.location.origin}/product/${product.id}`;
  const shareTitle = `Check out ${product.name} on Nepali Mart!`;
  const shareText = `Buy ${product.name} for ${formatCurrency(product.price)} on Nepali Mart - Nepal's premier online marketplace.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: productUrl,
        });
        onClose();
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="text-emerald-500" size={22} />,
      bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="text-blue-600" size={22} />,
      bg: 'bg-blue-50 hover:bg-blue-100 text-blue-900',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    },
    {
      name: 'Viber',
      icon: <Send className="text-purple-600" size={22} />,
      bg: 'bg-purple-50 hover:bg-purple-100 text-purple-900',
      url: `viber://forward?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
    },
    {
      name: 'Twitter / X',
      icon: <Twitter className="text-sky-500" size={22} />,
      bg: 'bg-sky-50 hover:bg-sky-100 text-sky-900',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
    },
    {
      name: 'Email',
      icon: <Mail className="text-amber-600" size={22} />,
      bg: 'bg-amber-50 hover:bg-amber-100 text-amber-900',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + productUrl)}`,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-daraz-orange to-amber-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-white" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Share Product</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Product Preview Card */}
          <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg border border-neutral-200 bg-white"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-neutral-900 truncate">{product.name}</h4>
              <p className="text-daraz-orange font-black text-sm mt-0.5">{formatCurrency(product.price)}</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nepali Mart Official Item</p>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="p-5 space-y-4">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Share via social apps</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border border-transparent transition-all cursor-pointer ${item.bg}`}
                >
                  {item.icon}
                  <span className="text-[11px] font-black mt-1.5">{item.name}</span>
                </a>
              ))}
            </div>

            {/* Native Share Button (Mobile/Supported devices) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full bg-neutral-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Share2 size={16} />
                <span>Open Device System Share Menu</span>
              </button>
            )}

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-200">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Product Link</label>
              <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-300 rounded-xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={productUrl}
                  className="flex-1 bg-transparent text-xs font-mono text-neutral-700 outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-daraz-orange text-white hover:bg-amber-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
