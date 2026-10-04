/**
 * Game rules for "도토리 줍고 돈 받기".
 *
 * Sources:
 * - Figma (미니앱_1차_260823, page "도토리 줍고 돈 받기") — only the non-dimmed
 *   frames (Frame 45–58) and the responsive guide frames are current.
 * - The planning team's policy prototype for anything the current frames don't
 *   define yet. Those values are marked TEMP and still need
 *   sign-off from planning.
 */

/** Acorns needed to fill the progress bar once. */
export const GOAL = 10;
/** Won paid out per full progress bar. */
export const WON_PER_GOAL = 1;
/** Acorns on the field when the game starts. */
export const INITIAL_ACORNS = 27;
/** Auto-drop stops once this many acorns are on the field. */
export const FIELD_MAX = 27;
/** Auto-drop interval — Figma: "도토리는 5초에 하나 떨어져요". */
export const TRICKLE_MS = 5000;

/** TEMP (prototype): taps on [나무 흔들기] before the ad is offered. */
export const SHAKES_BEFORE_AD = 3;
/** TEMP (prototype): how many times the tree can be shaken (each costs one ad). */
export const SHAKE_ADS = 1;
/** TEMP (prototype): acorns dropped after the shake ad. */
export const SHAKE_DROP = 11;
/** TEMP (prototype): first claim is free; later claims require an interstitial. */
export const FREE_CLAIMS = 1;
/** TEMP (prototype): delay before the "도토리 털기" chip appears during auto-drop. */
export const SHAKE_CHIP_DELAY_MS = 3000;

export interface Spot {
  /** center X, 0–1 of the field box width */
  x: number;
  /** center Y, 0–1 of the field box height */
  y: number;
  /** rotation in degrees */
  rot: number;
}

/**
 * 27 acorn positions from the prototype, authored in a 374×275 box and stored
 * normalized so they stretch with the responsive click area.
 */
export const SPOTS: readonly Spot[] = (
  [
    [100.6, 22.7, 36.03], [203.4, 25.6, -6.23], [30.4, 27.3, 22.67],
    [148.7, 33.2, 29.22], [286.1, 41.3, 36.19], [342.7, 65.0, 24.47],
    [82.1, 65.4, 22.77], [227.0, 80.0, -9.42], [160.2, 82.0, -8.28],
    [282.8, 92.2, 33.88], [45.3, 96.1, -10.7], [115.9, 113.3, 27.89],
    [18.5, 136.0, -12.41], [324.8, 138.6, 24.14], [256.8, 148.4, 25.93],
    [82.7, 153.0, 17.71], [179.1, 156.7, 29.57], [37.8, 178.1, 32.98],
    [352.7, 194.4, 22.5], [113.3, 196.4, 34.73], [303.3, 196.9, -10.24],
    [231.0, 217.0, -13.87], [179.2, 221.6, 16.59], [272.0, 242.0, -9.82],
    [98.7, 245.2, 29.2], [325.4, 248.7, 38.66], [52.2, 249.9, -7.19],
  ] as const
).map(([x, y, rot]) => ({ x: x / 374, y: y / 275, rot }));
