import './MockBannerAd.css';

interface MockBannerAdProps {
  layout: 'bar' | 'card';
}

/**
 * Local stand-in for a Toss banner ad, laid out like Figma "하단 광고배너" (bar)
 * and "광고 셀" (card) so the screen can be judged without the real SDK.
 * Copy is generic on purpose — the Figma sample uses a real advertiser.
 */
export function MockBannerAd({ layout }: MockBannerAdProps) {
  return (
    <div className={`mock-banner mock-banner--${layout}`}>
      <span className="mock-banner__logo" aria-hidden>
        AD
      </span>
      <div className="mock-banner__text">
        <p className="mock-banner__title">광고 제목이 들어가는 자리예요</p>
        <p className="mock-banner__subtitle">광고주 이름 · 개발용 목업</p>
        {layout === 'bar' && <p className="mock-banner__legal">심의필 번호 등 법적 고지 문구 자리</p>}
      </div>
    </div>
  );
}
