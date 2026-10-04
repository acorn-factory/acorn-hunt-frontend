/**
 * True when the @apps-in-toss/devtools SDK mock is active (`npm run dev` in a
 * plain browser). The mock exposes its state as `window.__ait`. Its ad APIs
 * fire events but draw nothing (full-screen) or only a grey box (banner), so
 * the app swaps in its own design-accurate mocks instead.
 */
export const isDevtoolsMock = typeof window !== 'undefined' && '__ait' in window;
