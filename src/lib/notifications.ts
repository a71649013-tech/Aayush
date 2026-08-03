/**
 * Web Notifications Utility for Nepali Mart
 * Handles HTML5 Web Notification permissions, native push alerts,
 * and elegant sound/vibration micro-interactions.
 */

// Simple audio effect when notification is triggered (audio synthesizer fallback)
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a dual-tone "chime" sound (gorgeous classic digital chime)
    const now = ctx.currentTime;
    
    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Note 2 (delayed slightly for chime effect)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn("Could not play synthesized audio notification chime:", err);
  }
}

/**
 * Safely requests permission for native browser notifications
 */
/**
 * Safely requests permission for native browser notifications (callable on "ENABLE" button click)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const status = await requestNativeNotificationPermission();
  if (status === 'granted') {
    playNotificationSound();
    console.log("Notification Permission Granted!");
  }
  return status;
}

export async function requestNativeNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn("This browser does not support browser text notifications.");
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    // Legacy callback-based support fallback
    return new Promise((resolve) => {
      try {
        Notification.requestPermission((p) => resolve(p));
      } catch (legacyErr) {
        resolve('denied');
      }
    });
  }
}

/**
 * Returns current Native Notification permission status
 */
export function getNativeNotificationStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Notification Channels configuration
 */
export const NOTIFICATION_CHANNELS = {
  promos_channel: {
    id: 'promos_channel',
    name: 'Promotions & Deals',
    description: 'Notifications for flash sales and discounts',
    importance: 'high',
  },
};

/**
 * Triggers a high-importance Promotions & Deals notification (Flash sales & discounts)
 */
export function triggerPromosNotification(title: string, body: string, options?: NotificationOptions) {
  return triggerNativeNotification(`🔥 ${title}`, body, {
    tag: NOTIFICATION_CHANNELS.promos_channel.id,
    requireInteraction: true,
    ...options,
  });
}

export function triggerNativeNotification(title: string, body: string, options?: NotificationOptions) {
  playNotificationSound();
  
  if (!('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const defaultOptions: NotificationOptions = {
      body,
      icon: '/logo.png', // Fallback
      tag: 'nepali-mart-alerts',
      badge: '/logo.png',
      ...options
    };
    
    return new Notification(title, defaultOptions);
  } catch (err) {
    console.error("Failed to showcase native browser notification:", err);
    return null;
  }
}
