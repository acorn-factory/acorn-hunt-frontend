import './fx.css';

/**
 * Fire-and-forget effects drawn into a fixed overlay layer, in viewport
 * coordinates. Kept outside React state since they never affect game logic.
 */

interface Point {
  x: number;
  y: number;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Picked acorn flies into the progress bar. */
export function flyAcorn(layer: HTMLElement, from: Point, to: Point, src: string) {
  if (reducedMotion()) {
    return;
  }
  const el = document.createElement('img');
  el.src = src;
  el.className = 'fx-flyer';
  layer.appendChild(el);
  const anim = el.animate(
    [
      { transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(1.35) rotate(-10deg)`, opacity: 1 },
      { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.28) rotate(330deg)`, opacity: 0.1 },
    ],
    { duration: 560, easing: 'cubic-bezier(.5,.02,.28,1)' },
  );
  anim.onfinish = () => el.remove();
}

/** Ring + sparks + "+1" at the pick point. */
export function burst(layer: HTMLElement, at: Point) {
  if (reducedMotion()) {
    return;
  }
  const root = document.createElement('div');
  root.className = 'fx-burst';
  root.style.transform = `translate(${at.x}px, ${at.y}px)`;

  const ring = document.createElement('span');
  ring.className = 'fx-burst__ring';
  root.appendChild(ring);

  const seed = Math.random() * 6;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + seed;
    const dist = 26 + (i % 3) * 9;
    const spark = document.createElement('span');
    spark.className = 'fx-burst__spark';
    spark.style.background = i % 2 ? '#ffe8a3' : '#fff7de';
    spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    spark.style.animationDelay = `${i * 8}ms`;
    root.appendChild(spark);
  }

  const plus = document.createElement('span');
  plus.className = 'fx-burst__plus';
  plus.textContent = '+1';
  root.appendChild(plus);

  layer.appendChild(root);
  window.setTimeout(() => root.remove(), 700);
}

/** Coin with the payout amount flies from the claim button into the point cell. */
export function flyCoin(layer: HTMLElement, from: Point, to: Point, label: string) {
  if (reducedMotion()) {
    return;
  }
  const el = document.createElement('div');
  el.className = 'fx-coin';
  el.textContent = label;
  layer.appendChild(el);
  const anim = el.animate(
    [
      { transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
      { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.34)`, opacity: 0 },
    ],
    { duration: 620, easing: 'cubic-bezier(.5,-0.2,.3,1)' },
  );
  anim.onfinish = () => el.remove();
}

/** Short horizontal shake telling the user to press this element first. */
export function nudge(el: Element | null) {
  if (el == null || reducedMotion()) {
    return;
  }
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-7px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(2px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 460, easing: 'ease-in-out' },
  );
}

/** Pulse used when the point cell's amount goes up. */
export function pop(el: Element | null) {
  if (el == null || reducedMotion()) {
    return;
  }
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
    { duration: 500, easing: 'ease-out' },
  );
}
