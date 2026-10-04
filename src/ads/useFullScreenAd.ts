import { useCallback, useEffect, useState } from 'react';
import { type AdOutcome, isFullScreenAdSupported, playFullScreenAd, preloadFullScreenAd } from './fullScreenAd';
import { AD_GROUP, type FullScreenAdKind } from './policy';

/**
 * Runs full-screen ads for the screen: preloads them on mount, tracks `busy`
 * while one is loading/showing, and falls back to the local MockFullScreenAd
 * (via `mockAdClose`) when the real SDK isn't available.
 */
export function useFullScreenAd() {
  const [busy, setBusy] = useState(false);
  const [mockAdClose, setMockAdClose] = useState<((earned: boolean) => void) | null>(null);

  // Load ads up front so a tap shows them immediately instead of waiting on the network.
  useEffect(() => {
    if (isFullScreenAdSupported()) {
      void preloadFullScreenAd(AD_GROUP.claim);
      void preloadFullScreenAd(AD_GROUP.shake);
    }
  }, []);

  const run = useCallback(async (kind: FullScreenAdKind): Promise<AdOutcome> => {
    setBusy(true);
    try {
      if (isFullScreenAdSupported()) {
        return await playFullScreenAd(AD_GROUP[kind]);
      }
      return await new Promise<AdOutcome>((resolve) => {
        setMockAdClose(() => (earned: boolean) => {
          setMockAdClose(null);
          resolve(earned ? 'earned' : 'dismissed');
        });
      });
    } finally {
      setBusy(false);
    }
  }, []);

  return { run, busy, mockAdClose };
}
