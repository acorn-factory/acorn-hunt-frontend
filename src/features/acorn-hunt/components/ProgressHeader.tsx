import type { Ref } from 'react';
import type { ClaimState } from '../model/gameState';
import './ProgressHeader.css';

interface ProgressHeaderProps {
  picked: number;
  goal: number;
  claimState: ClaimState;
  /** an ad is loading or playing before the payout — keep the button disabled */
  busy?: boolean;
  /** slides up out of view (shake phase, Frame 58) */
  hidden: boolean;
  onClaim: () => void;
  fillRef?: Ref<HTMLDivElement>;
  claimRef?: Ref<HTMLButtonElement>;
}

/** Top card ("상단 영역") — progress toward the next 1원, or the claim button once full. */
export function ProgressHeader({
  picked,
  goal,
  claimState,
  busy = false,
  hidden,
  onClaim,
  fillRef,
  claimRef,
}: ProgressHeaderProps) {
  const full = claimState !== 'none';
  const ratio = goal === 0 ? 0 : Math.min(picked / goal, 1);

  return (
    <header className={hidden ? 'progress-header is-hidden' : 'progress-header'} aria-hidden={hidden}>
      <div className="progress-header__row">
        <p className="progress-header__title">
          {full ? '도토리를 가득 채웠어요!' : '도토리를 주으면 1원 받아요'}
        </p>
        <p className="progress-header__count">
          {full ? goal : picked}/{goal}
        </p>
      </div>
      {full ? (
        <button
          ref={claimRef}
          type="button"
          className="progress-header__claim"
          disabled={busy || claimState === 'paying'}
          onClick={onClaim}
        >
          돈으로 바꾸기
        </button>
      ) : (
        <div
          className="progress-header__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={picked}
        >
          <div
            ref={fillRef}
            className="progress-header__fill"
            style={{ width: `max(${ratio * 100}%, 8px)` }}
          />
        </div>
      )}
    </header>
  );
}
