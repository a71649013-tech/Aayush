
// Unity Ads Service
// Integrates Unity Ads SDK for web functionality
// Using Game ID provided by user: 6104127

export const UNITY_GAME_ID = '6104127';

declare global {
  interface Window {
    UnityAds?: any;
  }
}

export const initUnityAds = () => {
  if (typeof window !== 'undefined' && window.UnityAds) {
    try {
      window.UnityAds.init(UNITY_GAME_ID, {
        testMode: true, // Set to false for production
        onComplete: () => console.log('Unity Ads initialized successfully'),
        onFailed: (error: any) => console.error('Unity Ads initialization failed:', error)
      });
    } catch (error) {
      console.error('Error initializing Unity Ads:', error);
    }
  } else {
    // If script hasn't loaded yet, try again in a bit
    setTimeout(() => {
      if (window.UnityAds) {
        initUnityAds();
      }
    }, 2000);
  }
};

export const showUnityAd = (placementId: string = 'video') => {
  if (window.UnityAds && window.UnityAds.isReady(placementId)) {
    window.UnityAds.show(placementId);
  } else {
    console.warn(`Unity Ad placement ${placementId} is not ready`);
  }
};
