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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasNoImage = !src || src.trim() === '';

  // Helper to extract initials based on product name
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

  if (hasNoImage || hasError) {
    // Generate a beautiful, premium, brand-colored (orange) placeholder displaying the product name
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
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
}
