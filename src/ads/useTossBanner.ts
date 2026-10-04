import { TossAds, type TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';
import { useCallback, useEffect, useState } from 'react';

export type BannerStatus = 'idle' | 'initializing' | 'ready' | 'unsupported' | 'error';

let sharedInitialize: Promise<void> | null = null;

function initializeOnce() {
  if (sharedInitialize != null) {
    return sharedInitialize;
  }

  sharedInitialize = new Promise<void>((resolve, reject) => {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => resolve(),
        onInitializationFailed: (error) => reject(error),
      },
    });
  });

  return sharedInitialize;
}

/**
 * Initializes the Toss Ads SDK once for the whole app and exposes a helper to
 * attach a banner to a DOM slot. Outside the Toss app (local browser) the SDK is
 * not supported, so `status` becomes `"unsupported"` and callers should render a
 * plain placeholder instead.
 */
export function useTossBanner() {
  const [status, setStatus] = useState<BannerStatus>('idle');

  const isSupported =
    TossAds.initialize.isSupported() && TossAds.attachBanner.isSupported();

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    setStatus('initializing');
    initializeOnce()
      .then(() => setStatus('ready'))
      .catch((error) => {
        console.error('Toss Ads SDK initialization failed:', error);
        setStatus('error');
      });
  }, [isSupported]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (status !== 'ready') {
        return undefined;
      }

      return TossAds.attachBanner(adGroupId, element, options);
    },
    [status],
  );

  return { status, isReady: status === 'ready', isSupported, attachBanner };
}
