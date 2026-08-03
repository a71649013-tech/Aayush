import React, { useState, useEffect } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  category,
  className = "w-full h-full object-cover"
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    setCurrentSrc(src || null);
    setAttempt(0);
  }, [src]);

  const getCategoryFallback = (catName?: string, titleName?: string) => {
    const combined = `${catName || ''} ${titleName || ''}`.toLowerCase();
    if (combined.includes('watch') || combined.includes('smartwatch')) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
    }
    if (combined.includes('earbud') || combined.includes('headphone') || combined.includes('buds') || combined.includes('audio')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
    }
    if (combined.includes('phone') || combined.includes('mobile') || combined.includes('electronic') || combined.includes('gadget')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    }
    if (combined.includes('sandal') || combined.includes('shoe') || combined.includes('footwear')) {
      return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800';
    }
    if (combined.includes('fashion') || combined.includes('dress') || combined.includes('shirt') || combined.includes('cloth')) {
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800';
    }
    if (combined.includes('beauty') || combined.includes('makeup') || combined.includes('cosmetic')) {
      return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800';
  };

  const handleError = () => {
    if (attempt === 0) {
      // First error: Try category-based high-quality Unsplash image fallback
      const fallback = getCategoryFallback(category, alt);
      if (fallback !== currentSrc) {
        setCurrentSrc(fallback);
        setAttempt(1);
        return;
      }
    }
    // Final error: set currentSrc to null to render initials placeholder
    setCurrentSrc(null);
    setAttempt(2);
  };

  const getInitials = (name: string) => {
    if (!name) return 'NP';
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(alt || category || 'Product');

  if (!currentSrc || currentSrc.trim() === '') {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F57224] to-[#f78f3f] text-white p-4 text-center select-none font-sans ${className}`}
        style={{ minHeight: '100%', height: '100%' }}
      >
        <div className="text-3xl font-black tracking-tight mb-2 drop-shadow-sm">
          {initials}
        </div>
        <div className="text-[10px] font-bold tracking-wider uppercase opacity-90 line-clamp-2 max-w-full px-1">
          {alt || category || 'Nepali Mart'}
        </div>
        <div className="mt-2 text-[8px] font-black uppercase tracking-[0.15em] bg-white/20 px-2 py-0.5 rounded-sm">
          {category || 'Genuine'}
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}
