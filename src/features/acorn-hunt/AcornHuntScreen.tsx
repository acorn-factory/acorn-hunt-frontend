import { AdBanner } from '../../ads/AdBanner';
import { MockFullScreenAd } from '../../ads/mocks/MockFullScreenAd';
import { PickTooltip } from '../../components/PickTooltip';
import { Toast } from '../../components/Toast';
import { AcornField } from './components/AcornField';
import { FieldPrompt } from './components/FieldPrompt';
import { PointCell } from './components/PointCell';
import { ProgressHeader } from './components/ProgressHeader';
import { Tree } from './components/Tree';
import { GOAL, SHAKES_BEFORE_AD } from './model/config';
import { useAcornGame } from './useAcornGame';
import './AcornHuntScreen.css';

function shakePromptMessage(shakes: number) {
  if (shakes === 0) {
    return '나무를 흔들어서\n도토리를 떨어뜨리세요';
  }
  return shakes < SHAKES_BEFORE_AD ? '한번 더\n흔들어주세요' : '이제 도토리를\n털어볼게요';
}

/**
 * "도토리 줍고 돈 받기" main screen — rendering only; the flow lives in useAcornGame.
 * Follows Figma Frames 45–58; steps after [나무 흔들기] use TEMP prototype rules (see model/config.ts).
 */
export function AcornHuntScreen() {
  const { state, view, actions, fxLayerRef, fillRef, claimRef, cellRef } = useAcornGame();
  const { phase, acorns, claimState } = state;

  const showBottomArea = state.claims > 0 || claimState === 'paying';
  const showPickHint = !state.hasPicked && phase === 'collect';

  return (
    <div className="hunt-shell">
      <div className="hunt">
        <ProgressHeader
          picked={state.picked}
          goal={GOAL}
          claimState={claimState}
          busy={view.adBusy}
          hidden={phase === 'shake'}
          onClaim={() => void actions.claim()}
          fillRef={fillRef}
          claimRef={claimRef}
        />

        <section className="hunt__stage">
          <div className="hunt__tree">
            <Tree
              nuts={phase === 'shake' ? state.shakes : 0}
              shakeKey={view.shakeKey}
              highlighted={phase === 'trickle' && view.shakeChipReady}
              onChipClick={actions.openShake}
            />
            <div className="hunt__toast">
              <Toast message={view.toast} />
            </div>
          </div>

          <div className="hunt__field">
            <AcornField
              acorns={acorns}
              canPick={claimState === 'none'}
              disabled={phase === 'notifyOffer' || phase === 'shake' || view.adBusy}
              onPick={actions.pick}
              onReject={actions.rejectPick}
            />

            {showPickHint && (
              <PickTooltip className="hunt__pick-hint">눌러서 주워보세요</PickTooltip>
            )}

            {phase === 'notifyOffer' && (
              <FieldPrompt
                message={'도토리는 5초에 하나 떨어져요\n가득 차면 알려드릴까요?'}
                action={{ label: '알림 받기', onClick: () => void actions.answerNotify(true) }}
                secondary={{ label: '나중에', onClick: () => void actions.answerNotify(false) }}
              />
            )}

            {phase === 'trickle' && acorns.length === 0 && (
              <FieldPrompt message={'5초에 하나씩\n도토리 떨어지는 중..'} />
            )}

            {phase === 'shake' && (
              <FieldPrompt
                message={shakePromptMessage(state.shakes)}
                action={{
                  label: state.shakes < SHAKES_BEFORE_AD ? '나무 흔들기' : '광고 보고 나무 털기',
                  onClick: () => void actions.shake(),
                  disabled: view.adBusy,
                }}
              />
            )}
          </div>
        </section>

        {showBottomArea && (
          <section className="hunt__bottom">
            {view.pointTipVisible && (
              <PickTooltip className="hunt__point-tip">10원 모아서 토스포인트로 바꿔보세요</PickTooltip>
            )}
            <PointCell won={state.won} cellRef={cellRef} />
            <AdBanner layout="card" />
          </section>
        )}
      </div>

      <div className="hunt-shell__banner">
        <AdBanner />
      </div>

      <div ref={fxLayerRef} className="fx-layer" aria-hidden />

      {view.mockAdClose && <MockFullScreenAd onClose={view.mockAdClose} />}
    </div>
  );
}
