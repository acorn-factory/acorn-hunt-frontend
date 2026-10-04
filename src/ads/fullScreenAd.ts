import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { isDevtoolsMock } from './mocks/devtoolsMock';

/**
 * earned    — rewarded ad: SDK fired `userEarnedReward` before the ad closed
 * dismissed — the ad closed without a reward (always the case for interstitials)
 * failed    — the ad could not be loaded or shown
 */
export type AdOutcome = 'earned' | 'dismissed' | 'failed';

/** The devtools mock counts as unsupported so the screen shows MockFullScreenAd instead. */
export function isFullScreenAdSupported() {
  return !isDevtoolsMock && loadFullScreenAd.isSupported() && showFullScreenAd.isSupported();
}

/** In-flight or finished loads per ad group, so a tap can show the ad without waiting on the network. */
const loads = new Map<string, Promise<boolean>>();

/**
 * Starts loading an ad ahead of time. Safe to call repeatedly — an existing
 * load is reused. Resolves true once the ad is ready to show.
 */
export function preloadFullScreenAd(adGroupId: string): Promise<boolean> {
  const existing = loads.get(adGroupId);
  if (existing != null) {
    return existing;
  }

  const load = new Promise<boolean>((resolve) => {
    let cleanup: (() => void) | undefined;
    cleanup = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          resolve(true);
        }
      },
      onError: (error) => {
        console.error('loadFullScreenAd failed:', error);
        cleanup?.();
        // Let the next attempt retry instead of reusing the failure.
        loads.delete(adGroupId);
        resolve(false);
      },
    });
  });
  loads.set(adGroupId, load);
  return load;
}

/**
 * Shows one full-screen ad (using a preloaded one when available), resolving
 * once it is closed. Failures resolve to `"failed"` instead of rejecting. The
 * next ad starts loading as soon as this one is consumed.
 *
 * Rewards must only be granted on `"earned"` — Apps in Toss ad policy treats
 * `dismissed` as "the user closed it", not as proof the ad was watched.
 */
export async function playFullScreenAd(adGroupId: string): Promise<AdOutcome> {
  const loaded = await preloadFullScreenAd(adGroupId);
  loads.delete(adGroupId);
  if (!loaded) {
    return 'failed';
  }

  const outcome = await new Promise<AdOutcome>((resolve) => {
    let settled = false;
    let earned = false;
    let cleanup: (() => void) | undefined;
    const finish = (result: AdOutcome) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup?.();
      resolve(result);
    };

    cleanup = showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') {
          earned = true;
        } else if (event.type === 'dismissed') {
          finish(earned ? 'earned' : 'dismissed');
        } else if (event.type === 'failedToShow') {
          finish('failed');
        }
      },
      onError: (error) => {
        console.error('showFullScreenAd failed:', error);
        finish('failed');
      },
    });
  });

  void preloadFullScreenAd(adGroupId);
  return outcome;
}
