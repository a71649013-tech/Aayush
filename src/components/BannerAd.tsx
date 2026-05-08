import React, { useEffect } from 'react';

const BannerAd: React.FC = () => {
  useEffect(() => {
    // Access googletag from window
    const googletag = (window as any).googletag;
    let slot: any = null;

    if (googletag && googletag.cmd) {
      googletag.cmd.push(() => {
        try {
          // Define the ad slot using the exact provided Ad Unit ID
          // Prefix with / if it doesn't have one as GPT expects a path
          const adUnitPath = 'ca-app-pub-8390678349815193/5067082313';
          const formattedPath = adUnitPath.startsWith('/') ? adUnitPath : `/${adUnitPath}`;

          slot = googletag.defineSlot(
            formattedPath,
            [320, 50],
            'banner-ad'
          );

          if (slot) {
            slot.addService(googletag.pubads());
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();

            // Display the ad
            googletag.display('banner-ad');
            // Refresh to ensure it loads if it was previously defined
            googletag.pubads().refresh([slot]);
          }
        } catch (err) {
          console.error('GPT definition error:', err);
        }
      });
    }

    return () => {
      // Cleanup: destroy slots on unmount to allow re-definition if the component remounts
      if (googletag && googletag.cmd && slot) {
        googletag.cmd.push(() => {
          googletag.destroySlots([slot]);
        });
      }
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white flex justify-center py-0.5 border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] h-[54px] items-center">
      <div 
        id="banner-ad" 
        style={{ width: '320px', height: '50px' }}
        className="bg-neutral-50 flex items-center justify-center text-[10px] text-neutral-400 overflow-hidden"
      >
        <span className="animate-pulse">Loading Advertisement...</span>
      </div>
    </div>
  );
};

export default BannerAd;
