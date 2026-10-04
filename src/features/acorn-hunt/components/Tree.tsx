import { useEffect, useRef } from 'react';
import acornSmallUrl from '../assets/acorn-small.png';
import leafUrl from '../assets/tree-leaf.png';
import pillarUrl from '../assets/tree-pillar.png';
import smallLeafUrl from '../assets/tree-small-leaf.png';
import './Tree.css';

/** Acorns that appear on the canopy as the user shakes (prototype treenut spots, 0–1 of the tree box). */
const TREE_NUTS = [
  { x: 0.166, y: 0.269 },
  { x: 0.537, y: 0.43 },
  { x: 0.714, y: 0.3 },
];

interface TreeProps {
  /** acorns visible on the canopy, 0–3 */
  nuts: number;
  /** increments each time the tree should play its shake animation */
  shakeKey: number;
  /** white outline + "도토리 털기" chip (Frame 56) */
  highlighted: boolean;
  onChipClick?: () => void;
}

/** Layered tree from the Drive exports so the canopy can sway and shake independently of the trunk. */
export function Tree({ nuts, shakeKey, highlighted, onChipClick }: TreeProps) {
  const canopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canopy = canopyRef.current;
    if (shakeKey === 0 || canopy == null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    canopy.animate(
      [
        { transform: 'rotate(0) scale(1)' },
        { transform: 'rotate(-7deg) scale(1.05, .95)', offset: 0.1 },
        { transform: 'rotate(6.5deg) scale(.96, 1.05)', offset: 0.24 },
        { transform: 'rotate(-5deg) scale(1.03, .97)', offset: 0.4 },
        { transform: 'rotate(3.6deg) scale(.98, 1.02)', offset: 0.56 },
        { transform: 'rotate(-2.2deg) scale(1.01, .99)', offset: 0.72 },
        { transform: 'rotate(1deg)', offset: 0.88 },
        { transform: 'rotate(0) scale(1)' },
      ],
      { duration: 540, easing: 'cubic-bezier(.36,.07,.19,.97)', composite: 'add' },
    );
  }, [shakeKey]);

  return (
    <div className={highlighted ? 'tree is-highlighted' : 'tree'}>
      <img className="tree__layer" src={pillarUrl} alt="" draggable={false} />
      <div ref={canopyRef} className="tree__canopy">
        <img className="tree__layer" src={leafUrl} alt="" draggable={false} />
        <img className="tree__layer" src={smallLeafUrl} alt="" draggable={false} />
        {TREE_NUTS.map((pos, i) => (
          <img
            key={i}
            className={i < nuts ? 'tree__nut is-on' : 'tree__nut'}
            src={acornSmallUrl}
            alt=""
            draggable={false}
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
          />
        ))}
      </div>
      {highlighted && onChipClick && (
        <button type="button" className="tree__chip" onClick={onChipClick}>
          도토리 털기
        </button>
      )}
    </div>
  );
}
