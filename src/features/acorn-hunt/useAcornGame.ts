import { useEffect, useReducer, useRef, useState } from 'react';
import { useFullScreenAd } from '../../ads/useFullScreenAd';
import { useToast } from '../../components/useToast';
import { haptic } from '../../lib/haptic';
import { requestFieldFullNotification } from '../../lib/notify';
import acornUrl from './assets/acorn.png';
import { burst, centerOf, flyAcorn, flyCoin, nudge, pop } from './fx';
import {
  FREE_CLAIMS,
  GOAL,
  SHAKE_CHIP_DELAY_MS,
  SHAKES_BEFORE_AD,
  TRICKLE_MS,
  WON_PER_GOAL,
} from './model/config';
import { createInitialState, gameReducer, type Acorn } from './model/gameState';

/** pause after the field empties before switching to the next prompt */
const EMPTY_FIELD_DELAY_MS = 900;
const COIN_FLIGHT_MS = 620;
/** how long the "paying" state (Frame 48) stays before the bar resets (Frame 49) */
const CLAIM_RESET_MS = 1800;

/**
 * Game flow for "도토리 줍고 돈 받기": the reducer plus everything with timing or
 * side effects (timers, ads, haptics, effects). The screen only renders what
 * this returns.
 */
export function useAcornGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [toast, showToast] = useToast();
  const ad = useFullScreenAd();
  const [pointTipVisible, setPointTipVisible] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [shakeChipReady, setShakeChipReady] = useState(false);

  const fxLayerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const claimRef = useRef<HTMLButtonElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const { phase, acorns, claimState, shakeAdsLeft } = state;

  // Field emptied → offer notifications the first time, auto-drop afterwards.
  useEffect(() => {
    if (phase !== 'collect' || acorns.length > 0) {
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: 'fieldEmptied' }), EMPTY_FIELD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, acorns.length]);

  // Auto-drop one acorn every 5s.
  useEffect(() => {
    if (phase !== 'trickle') {
      return;
    }
    const timer = window.setInterval(() => {
      dispatch({ type: 'trickleDrop' });
      haptic('tickWeak');
    }, TRICKLE_MS);
    return () => window.clearInterval(timer);
  }, [phase]);

  // After a moment of auto-drop, highlight the tree to suggest shaking it.
  useEffect(() => {
    if (phase !== 'trickle' || shakeAdsLeft <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setShakeChipReady(true), SHAKE_CHIP_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      setShakeChipReady(false);
    };
  }, [phase, shakeAdsLeft]);

  const pick = (acorn: Acorn, at: { x: number; y: number }) => {
    const layer = fxLayerRef.current;
    if (layer != null) {
      const target = fillRef.current?.parentElement ?? fillRef.current;
      if (target != null) {
        flyAcorn(layer, at, centerOf(target), acornUrl);
      }
      burst(layer, at);
    }
    haptic(state.picked + 1 >= GOAL ? 'success' : 'tickMedium');
    setPointTipVisible(false);
    dispatch({ type: 'pick', id: acorn.id });
  };

  const rejectPick = () => {
    haptic('basicWeak');
    nudge(claimRef.current);
  };

  const claim = async () => {
    if (claimState !== 'ready' || ad.busy) {
      return;
    }
    haptic('tap');
    if (state.claims >= FREE_CLAIMS) {
      // Interstitial, not a reward ad — the payout is the user's own earnings, so it proceeds however the ad ends.
      await ad.run('claim');
    }
    const isFirstClaim = state.claims === 0;
    const from = claimRef.current ? centerOf(claimRef.current) : null;
    dispatch({ type: 'claimStart' });

    // The point cell mounts with claimStart, so measure it on the next frame.
    requestAnimationFrame(() => {
      const layer = fxLayerRef.current;
      if (layer != null && from != null && cellRef.current != null) {
        flyCoin(layer, from, centerOf(cellRef.current), `${WON_PER_GOAL}원`);
      }
    });

    window.setTimeout(() => {
      // TODO: record the earning on the server ledger; Toss points are paid out
      // server-side once the "10원부터" conversion rule is confirmed.
      dispatch({ type: 'claimSettle' });
      pop(cellRef.current);
      haptic('success');
      if (isFirstClaim) {
        setPointTipVisible(true);
      }
    }, COIN_FLIGHT_MS);

    window.setTimeout(() => {
      dispatch({ type: 'claimReset' });
      setPointTipVisible(false);
      showToast('계속 주워보세요!');
    }, CLAIM_RESET_MS);
  };

  const answerNotify = async (wantsNotification: boolean) => {
    haptic('tap');
    if (!wantsNotification) {
      dispatch({ type: 'notifyAnswered', on: false });
      return;
    }
    const agreed = await requestFieldFullNotification();
    dispatch({ type: 'notifyAnswered', on: agreed });
    if (agreed) {
      showToast('알림을 켰어요!');
    }
  };

  const openShake = () => {
    haptic('tap');
    dispatch({ type: 'openShake' });
  };

  const shake = async () => {
    if (ad.busy) {
      return;
    }
    if (state.shakes < SHAKES_BEFORE_AD) {
      haptic('wiggle');
      setShakeKey((k) => k + 1);
      dispatch({ type: 'shakeTree' });
      return;
    }
    const outcome = await ad.run('shake');
    if (outcome !== 'earned') {
      // Ad policy: the drop is the reward, so it's only granted on userEarnedReward. Stay on the shake prompt to retry.
      haptic('basicWeak');
      showToast(outcome === 'failed' ? '광고를 불러오지 못했어요' : '광고를 끝까지 보면 도토리가 떨어져요');
      return;
    }
    haptic('confetti');
    setShakeKey((k) => k + 1);
    dispatch({ type: 'shakeAdWatched' });
    showToast('나무를 흔들어서 도토리가 떨어졌어요!');
  };

  return {
    state,
    view: {
      toast,
      pointTipVisible,
      shakeKey,
      shakeChipReady,
      adBusy: ad.busy,
      mockAdClose: ad.mockAdClose,
    },
    fxLayerRef,
    fillRef,
    claimRef,
    cellRef,
    actions: { pick, rejectPick, claim, answerNotify, openShake, shake },
  };
}
