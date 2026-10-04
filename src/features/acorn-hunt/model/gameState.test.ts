import { describe, expect, it } from 'vitest';
import {
  FIELD_MAX,
  GOAL,
  INITIAL_ACORNS,
  SHAKE_ADS,
  SHAKE_DROP,
  SHAKES_BEFORE_AD,
  WON_PER_GOAL,
} from './config';
import { createInitialState, gameReducer, type GameAction, type GameState } from './gameState';

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state);

const pickN = (state: GameState, n: number) => {
  let next = state;
  for (let i = 0; i < n; i++) {
    next = gameReducer(next, { type: 'pick', id: next.acorns[0].id });
  }
  return next;
};

/** Picks everything on the field, claiming whenever the bar fills. */
const clearField = (state: GameState) => {
  let next = state;
  while (next.acorns.length > 0) {
    next = next.claimState === 'ready'
      ? run(next, { type: 'claimStart' }, { type: 'claimSettle' }, { type: 'claimReset' })
      : pickN(next, 1);
  }
  return next;
};

describe('initial state', () => {
  it('starts collecting with the full field and an empty bar', () => {
    const state = createInitialState();
    expect(state.phase).toBe('collect');
    expect(state.acorns).toHaveLength(INITIAL_ACORNS);
    expect(state.picked).toBe(0);
    expect(state.won).toBe(0);
    expect(new Set(state.acorns.map((a) => a.spot)).size).toBe(INITIAL_ACORNS);
  });
});

describe('picking and claiming', () => {
  it('fills the bar and switches to the claim button at GOAL', () => {
    const state = pickN(createInitialState(), GOAL);
    expect(state.picked).toBe(GOAL);
    expect(state.claimState).toBe('ready');
    expect(state.acorns).toHaveLength(INITIAL_ACORNS - GOAL);
  });

  it('ignores picks while the bar is full', () => {
    const full = pickN(createInitialState(), GOAL);
    const after = gameReducer(full, { type: 'pick', id: full.acorns[0].id });
    expect(after).toBe(full);
  });

  it('ignores unknown acorn ids', () => {
    const state = createInitialState();
    expect(gameReducer(state, { type: 'pick', id: -1 })).toBe(state);
  });

  it('pays WON_PER_GOAL and resets the bar after a claim', () => {
    const full = pickN(createInitialState(), GOAL);
    const paying = gameReducer(full, { type: 'claimStart' });
    expect(paying.claimState).toBe('paying');

    const done = run(paying, { type: 'claimSettle' }, { type: 'claimReset' });
    expect(done.won).toBe(WON_PER_GOAL);
    expect(done.claims).toBe(1);
    expect(done.picked).toBe(0);
    expect(done.claimState).toBe('none');
  });

  it('only starts a claim from the ready state', () => {
    const state = createInitialState();
    expect(gameReducer(state, { type: 'claimStart' })).toBe(state);
  });
});

describe('empty field flow', () => {
  it('ignores fieldEmptied while acorns remain', () => {
    const state = createInitialState();
    expect(gameReducer(state, { type: 'fieldEmptied' })).toBe(state);
  });

  it('offers notifications the first time, then goes to auto-drop', () => {
    const empty = clearField(createInitialState());
    const offered = gameReducer(empty, { type: 'fieldEmptied' });
    expect(offered.phase).toBe('notifyOffer');

    const trickling = gameReducer(offered, { type: 'notifyAnswered', on: true });
    expect(trickling.phase).toBe('trickle');
    expect(trickling.notifyOn).toBe(true);
  });

  it('keeps auto-drop running when the user declines (나중에)', () => {
    const offered = run(clearField(createInitialState()), { type: 'fieldEmptied' });
    const declined = gameReducer(offered, { type: 'notifyAnswered', on: false });
    expect(declined.phase).toBe('trickle');
    expect(declined.notifyOn).toBe(false);
  });

  it('auto-drops one acorn at a time and stops at FIELD_MAX', () => {
    let state = run(clearField(createInitialState()), { type: 'fieldEmptied' }, { type: 'notifyAnswered', on: true });
    state = gameReducer(state, { type: 'trickleDrop' });
    expect(state.acorns).toHaveLength(1);
    expect(state.acorns[0].enter).toBe('pop');

    for (let i = 0; i < FIELD_MAX + 5; i++) {
      state = gameReducer(state, { type: 'trickleDrop' });
    }
    expect(state.acorns).toHaveLength(FIELD_MAX);
  });

  it('does not auto-drop outside the trickle phase', () => {
    const state = createInitialState();
    expect(gameReducer(state, { type: 'trickleDrop' })).toBe(state);
  });
});

describe('shaking the tree', () => {
  const trickling = () =>
    run(clearField(createInitialState()), { type: 'fieldEmptied' }, { type: 'notifyAnswered', on: true });

  it('counts shakes up to SHAKES_BEFORE_AD', () => {
    let state = gameReducer(trickling(), { type: 'openShake' });
    expect(state.phase).toBe('shake');
    for (let i = 0; i < SHAKES_BEFORE_AD + 2; i++) {
      state = gameReducer(state, { type: 'shakeTree' });
    }
    expect(state.shakes).toBe(SHAKES_BEFORE_AD);
  });

  it('drops SHAKE_DROP acorns after the rewarded ad and uses up a shake', () => {
    const watched = run(trickling(), { type: 'openShake' }, { type: 'shakeAdWatched' });
    expect(watched.phase).toBe('collect');
    expect(watched.acorns).toHaveLength(SHAKE_DROP);
    expect(watched.acorns.every((a) => a.enter === 'drop')).toBe(true);
    expect(watched.shakeAdsLeft).toBe(SHAKE_ADS - 1);
    expect(watched.shakes).toBe(0);
  });

  it('refuses to open the shake prompt once the ads are used up', () => {
    let state = trickling();
    for (let i = 0; i < SHAKE_ADS; i++) {
      state = run(state, { type: 'openShake' }, { type: 'shakeAdWatched' });
    }
    expect(state.shakeAdsLeft).toBe(0);
    expect(gameReducer(state, { type: 'openShake' })).toBe(state);
  });

  it('returns to auto-drop (not the notify offer) when the dropped acorns are cleared', () => {
    const watched = run(trickling(), { type: 'openShake' }, { type: 'shakeAdWatched' });
    const emptied = gameReducer(clearField(watched), { type: 'fieldEmptied' });
    expect(emptied.phase).toBe('trickle');
  });

  it('places dropped acorns on distinct spots', () => {
    const watched = run(trickling(), { type: 'openShake' }, { type: 'shakeAdWatched' });
    const spots = watched.acorns.map((a) => a.spot).filter((s) => s >= 0);
    expect(new Set(spots).size).toBe(spots.length);
  });
});
