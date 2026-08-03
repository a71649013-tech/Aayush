// Helper utilities for parsing, formatting, and rendering product videos

export interface FormattedVideo {
  type: 'iframe' | 'video';
  embedUrl: string;
}

export function formatVideoEmbedUrl(url?: string | null): FormattedVideo {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { type: 'video', embedUrl: '' };
  }

  const trimmed = url.trim();

  // YouTube Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
  if (trimmed.includes('youtube.com/shorts/')) {
    const videoId = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return { type: 'iframe', embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0` };
    }
  }

  // YouTube Standard Watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(trimmed);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return { type: 'iframe', embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0` };
      }
    } catch (e) {}
  }

  // YouTube Short Link: https://youtu.be/VIDEO_ID
  if (trimmed.includes('youtu.be/')) {
    const videoId = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return { type: 'iframe', embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0` };
    }
  }

  // YouTube Embed Link: https://www.youtube.com/embed/VIDEO_ID
  if (trimmed.includes('youtube.com/embed/')) {
    return { type: 'iframe', embedUrl: trimmed };
  }

  // Vimeo URL: https://vimeo.com/VIDEO_ID
  if (trimmed.includes('vimeo.com/')) {
    const videoId = trimmed.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
    if (videoId) {
      return { type: 'iframe', embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1` };
    }
  }

  // HTML5 Video (MP4, WebM, Blob, Data URL)
  return { type: 'video', embedUrl: trimmed };
}

// Preset product video clips to quickly attach high quality showcase videos to imported products
export const PRESET_PRODUCT_VIDEOS = [
  {
    name: "Tech & Earbuds Promo",
    url: "https://www.youtube.com/embed/406W9v3Z8V8",
    category: "Electronics & Gadgets"
  },
  {
    name: "Smartwatch Showcase",
    url: "https://www.youtube.com/embed/1U40oXvY6d4",
    category: "Electronics & Gadgets"
  },
  {
    name: "Fashion & Lifestyle Walkthrough",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Fashion & Clothing"
  },
  {
    name: "4K Quadcopter Drone Flight",
    url: "https://www.youtube.com/embed/2X_2IdybTV0",
    category: "Electronics & Gadgets"
  }
];
