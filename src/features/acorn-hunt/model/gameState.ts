import {
  FIELD_MAX,
  GOAL,
  INITIAL_ACORNS,
  SHAKE_ADS,
  SHAKE_DROP,
  SHAKES_BEFORE_AD,
  SPOTS,
  WON_PER_GOAL,
} from './config';

/**
 * collect     — picking acorns from the field (Frame 45–49)
 * notifyOffer — field emptied for the first time: "가득 차면 알려드릴까요?" (Frame 50)
 * trickle     — one acorn drops every 5s, still pickable (Frame 55–56)
 * shake       — header slides away, shake the tree for an ad-funded drop (Frame 58)
 */
export type Phase = 'collect' | 'notifyOffer' | 'trickle' | 'shake';

/** none → ready (bar full, waiting for 돈으로 바꾸기) → paying (button disabled) → none */
export type ClaimState = 'none' | 'ready' | 'paying';

export type AcornEnter = 'init' | 'drop' | 'pop';

export interface Acorn {
  id: number;
  /** index into SPOTS, or -1 when placed randomly because every spot was taken */
  spot: number;
  x: number;
  y: number;
  rot: number;
  enter: AcornEnter;
  /** stagger before the enter animation starts */
  delayMs: number;
}

export interface GameState {
  phase: Phase;
  acorns: Acorn[];
  nextId: number;
  /** acorns in the current progress bar, 0..GOAL */
  picked: number;
  claimState: ClaimState;
  claims: number;
  won: number;
  shakeAdsLeft: number;
  /** how many times [나무 흔들기] was tapped in the current shake round */
  shakes: number;
  notifyAsked: boolean;
  notifyOn: boolean;
  hasPicked: boolean;
}

export type GameAction =
  | { type: 'pick'; id: number }
  | { type: 'claimStart' }
  | { type: 'claimSettle' }
  | { type: 'claimReset' }
  | { type: 'fieldEmptied' }
  | { type: 'notifyAnswered'; on: boolean }
  | { type: 'trickleDrop' }
  | { type: 'openShake' }
  | { type: 'shakeTree' }
  | { type: 'shakeAdWatched' };

function placeAcorns(state: GameState, count: number, enter: AcornEnter): GameState {
  const taken = new Set(state.acorns.map((a) => a.spot));
  const free = SPOTS.map((_, i) => i).filter((i) => !taken.has(i));
  shuffle(free);

  const added: Acorn[] = [];
  for (let n = 0; n < count; n++) {
    const spotIndex = free[n] ?? -1;
    const spot = spotIndex >= 0 ? SPOTS[spotIndex] : randomSpot();
    added.push({
      id: state.nextId + n,
      spot: spotIndex,
      x: spot.x,
      y: spot.y,
      rot: spot.rot,
      enter,
      delayMs: enter === 'drop' ? 60 + Math.random() * 520 : enter === 'init' ? n * 22 : 0,
    });
  }

  return { ...state, acorns: [...state.acorns, ...added], nextId: state.nextId + count };
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function randomSpot() {
  return { x: 0.05 + Math.random() * 0.9, y: 0.09 + Math.random() * 0.82, rot: -12 + Math.random() * 48 };
}

export function createInitialState(): GameState {
  const empty: GameState = {
    phase: 'collect',
    acorns: [],
    nextId: 1,
    picked: 0,
    claimState: 'none',
    claims: 0,
    won: 0,
    shakeAdsLeft: SHAKE_ADS,
    shakes: 0,
    notifyAsked: false,
    notifyOn: false,
    hasPicked: false,
  };
  // Initial layout uses the spots in order so the first screen matches Figma.
  const acorns = SPOTS.slice(0, INITIAL_ACORNS).map<Acorn>((spot, i) => ({
    id: i + 1,
    spot: i,
    ...spot,
    enter: 'init',
    delayMs: i * 22,
  }));
  return { ...empty, acorns, nextId: acorns.length + 1 };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'pick': {
      if (state.claimState !== 'none' || state.picked >= GOAL) {
        return state;
      }
      const acorns = state.acorns.filter((a) => a.id !== action.id);
      if (acorns.length === state.acorns.length) {
        return state;
      }
      const picked = state.picked + 1;
      return {
        ...state,
        acorns,
        picked,
        hasPicked: true,
        claimState: picked >= GOAL ? 'ready' : 'none',
      };
    }
    case 'claimStart':
      return state.claimState === 'ready' ? { ...state, claimState: 'paying' } : state;
    case 'claimSettle':
      return { ...state, claims: state.claims + 1, won: state.won + WON_PER_GOAL };
    case 'claimReset':
      return { ...state, picked: 0, claimState: 'none' };
    case 'fieldEmptied':
      if (state.phase !== 'collect' || state.acorns.length > 0) {
        return state;
      }
      return { ...state, phase: state.notifyAsked ? 'trickle' : 'notifyOffer' };
    case 'notifyAnswered':
      return { ...state, notifyAsked: true, notifyOn: action.on, phase: 'trickle' };
    case 'trickleDrop':
      if (state.phase !== 'trickle' || state.acorns.length >= FIELD_MAX) {
        return state;
      }
      return placeAcorns(state, 1, 'pop');
    case 'openShake':
      return state.shakeAdsLeft > 0 ? { ...state, phase: 'shake', shakes: 0 } : state;
    case 'shakeTree':
      return state.phase === 'shake' && state.shakes < SHAKES_BEFORE_AD
        ? { ...state, shakes: state.shakes + 1 }
        : state;
    case 'shakeAdWatched':
      return placeAcorns(
        { ...state, phase: 'collect', shakes: 0, shakeAdsLeft: Math.max(0, state.shakeAdsLeft - 1) },
        SHAKE_DROP,
        'drop',
      );
  }
}
