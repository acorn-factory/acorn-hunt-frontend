import { useEffect, useRef } from 'react';
import { isDevtoolsMock } from './mocks/devtoolsMock';
import { useTossBanner } from './useTossBanner';
import { MockBannerAd } from './mocks/MockBannerAd';
import { AD_GROUP } from './policy';
import './AdBanner.css';

interface AdBannerProps {
  /**
   * bar  — "하단 광고배너", full-width strip pinned to the bottom
   * card — "광고 셀", rounded card in the bottom scroll area
   */
  layout?: 'bar' | 'card';
}

/**
 * Toss Ads banner slot.
 *
 * The SDK renders the ad into an empty container. Keep it as an independent
 * slot — never wrap it in content cards or place it next to the primary action.
 */
export function AdBanner({ layout = 'bar' }: AdBannerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const { status, isReady, attachBanner } = useTossBanner();
  // Outside the Toss app — devtools mock or no SDK at all — draw a design-accurate stand-in.
  const showMock = isDevtoolsMock || status === 'unsupported';

  useEffect(() => {
    const target = slotRef.current;
    if (showMock || !isReady || target == null) {
      return;
    }

    target.innerHTML = '';
    const attached = attachBanner(AD_GROUP.banner, target, {
      theme: 'auto',
      tone: 'blackAndWhite',
      variant: layout === 'card' ? 'card' : 'expanded',
    });

    return () => attached?.destroy();
  }, [attachBanner, isReady, layout, showMock]);

  return (
    <div className={`ad-banner ad-banner--${layout}`} aria-label="광고">
      {showMock ? (
        <MockBannerAd layout={layout} />
      ) : status === 'ready' ? (
        <div ref={slotRef} className="ad-banner__slot" />
      ) : (
        <div className="ad-banner__placeholder">
          <span>광고</span>
        </div>
      )}
    </div>
  );
}
