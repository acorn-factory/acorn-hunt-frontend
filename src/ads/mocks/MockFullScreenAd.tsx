import { useEffect, useState } from 'react';
import './MockFullScreenAd.css';

const AD_SECONDS = 4;

interface MockFullScreenAdProps {
  /** `earned` is true only when the countdown finished, mirroring `userEarnedReward` */
  onClose: (earned: boolean) => void;
}

/**
 * Stand-in for the Toss full-screen ad outside the Toss app (local dev in a
 * browser), where `loadFullScreenAd` is unsupported. Watching the full 4
 * seconds counts as earning the reward; [건너뛰기] closes early without it, so
 * both paths can be tried locally.
 */
export function MockFullScreenAd({ onClose }: MockFullScreenAdProps) {
  const [left, setLeft] = useState(AD_SECONDS);

  useEffect(() => {
    if (left <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  return (
    <div className="mock-ad" role="dialog" aria-label="광고">
      <span className="mock-ad__label">광고 (개발용 목업)</span>
      <button
        type="button"
        className={left > 0 ? 'mock-ad__close is-skip' : 'mock-ad__close'}
        onClick={() => onClose(left <= 0)}
        aria-label={left > 0 ? `건너뛰기 (${left}초 남음, 보상 없음)` : '광고 닫기'}
      >
        {left > 0 ? `${left} · 건너뛰기` : '✕'}
      </button>
      <div className="mock-ad__body">
        <p className="mock-ad__eyebrow">ADVERTISEMENT</p>
        <p className="mock-ad__title">전면 광고 자리</p>
      </div>
      <div className="mock-ad__progress">
        <i style={{ width: `${((AD_SECONDS - left) / AD_SECONDS) * 100}%` }} />
      </div>
    </div>
  );
}
