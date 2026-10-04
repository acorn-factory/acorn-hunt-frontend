/**
 * Ad group ids and placement rules, kept in one place (same layout as the
 * Toss `in-app-ads` example).
 *
 * TODO: these are Apps in Toss test ids — replace with the ad group ids issued
 * in the console before submitting for review.
 */
export const AD_GROUP = {
  /** Interstitial before the 2nd+ "돈으로 바꾸기" (TEMP policy from the prototype). */
  claim: 'ait-ad-test-interstitial-id',
  /** Rewarded ad behind "광고 보고 나무 털기" — reward only on `userEarnedReward`. */
  shake: 'ait-ad-test-rewarded-id',
  /**
   * Text banner used by both the pinned bar and the in-content ad cell.
   * Policy: two same-format banners on one screen is a DUPLICATED_FORMAT risk —
   * pending a planning decision (e.g. make the ad cell a native-image ad).
   */
  banner: 'ait-ad-test-banner-id',
} as const;

export type FullScreenAdKind = 'claim' | 'shake';
