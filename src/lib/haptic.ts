import { generateHapticFeedback, type HapticFeedbackType } from '@apps-in-toss/web-framework';

/**
 * Fire a haptic tap, ignoring failures. Outside the Toss app the bridge call
 * rejects — that's expected and not worth surfacing.
 */
export function haptic(type: HapticFeedbackType = 'tap') {
  void generateHapticFeedback({ type }).catch(() => {});
}
