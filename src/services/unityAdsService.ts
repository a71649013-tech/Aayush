
// Unity Ads Service
// Integrates Unity Ads SDK for web functionality
// Using Game ID provided by user: 6104126

export const UNITY_GAME_ID = '6104126';

declare global {
  interface Window {
    UnityAds?: any;
  }
}

export const isUnityAdsLoaded = () => {
  return !!(window && window.UnityAds);
};

export const initUnityAds = () => {
  if (typeof window !== 'undefined' && window.UnityAds) {
    try {
      window.UnityAds.initialize(UNITY_GAME_ID, true, {
        complete: () => console.log("Unity Ads Initialized Successfully!"),
        error: (error: any) => console.log("Unity Ads Initialization Failed: ", error)
      });
    } catch (error) {
      console.error('Error initializing Unity Ads:', error);
    }
  } else {
    // If script hasn't loaded yet, try again in a bit
    setTimeout(() => {
      if (window && window.UnityAds) {
        initUnityAds();
      }
    }, 3000);
  }
};

export const showUnityAd = (placementId: string = 'video', onComplete?: () => void) => {
  if (window.UnityAds && window.UnityAds.isReady(placementId)) {
    window.UnityAds.show(placementId);
    
    // For demo/web integration, we trigger onComplete to acknowledge the action
    if (onComplete) {
      setTimeout(onComplete, 2000); 
    }
  } else {
    console.log("Ad is not ready yet or UnityAds SDK not found.");
    // For demo purposes, we still trigger the reward if requested
    if (onComplete) {
      onComplete();
    }
  }
};
