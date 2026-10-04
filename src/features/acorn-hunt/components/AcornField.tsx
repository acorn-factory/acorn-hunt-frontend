import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import acornUrl from '../assets/acorn.png';
import type { Acorn } from '../model/gameState';
import './AcornField.css';

/** Sprite width as a fraction of the field width (prototype: 30.3 / 374). */
const ACORN_WIDTH_RATIO = 0.088;
const ACORN_ASPECT = 120 / 140;
/** Finger hit radius around an acorn center, in px. */
const HIT_RADIUS = 22;
/** Where dropped acorns start, relative to the field's top-center (the tree canopy). */
const DROP_ORIGIN_Y = -110;

interface AcornFieldProps {
  acorns: readonly Acorn[];
  /** false while the bar is full — touched acorns bounce back instead */
  canPick: boolean;
  /** pointer input is ignored entirely (e.g. shake / notify prompts) */
  disabled: boolean;
  onPick: (acorn: Acorn, at: { x: number; y: number }) => void;
  onReject: () => void;
}

/**
 * "도토리 클릭 영역". Acorns are collected by tapping or by dragging a finger
 * across them, so hit-testing runs on pointer move instead of per-button clicks.
 */
export function AcornField({ acorns, canPick, disabled, onPick, onReject }: AcornFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rejectingRef = useRef(new Set<number>());
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (el == null) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const acornWidth = size.width * ACORN_WIDTH_RATIO;

  const hitTest = (clientX: number, clientY: number) => {
    const root = rootRef.current;
    if (root == null || disabled) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    for (let i = acorns.length - 1; i >= 0; i--) {
      const acorn = acorns[i];
      const ax = acorn.x * rect.width;
      const ay = acorn.y * rect.height;
      if (Math.hypot(px - ax, py - ay) > HIT_RADIUS) {
        continue;
      }
      if (canPick) {
        onPick(acorn, { x: rect.left + ax, y: rect.top + ay });
      } else {
        reject(acorn, root);
      }
      return;
    }
  };

  const reject = (acorn: Acorn, root: HTMLElement) => {
    if (rejectingRef.current.has(acorn.id)) {
      return;
    }
    const el = root.querySelector<HTMLElement>(`[data-acorn="${acorn.id}"] .acorn__body`);
    rejectingRef.current.add(acorn.id);
    onReject();
    const anim = el?.animate(
      [
        { transform: 'translate(0, 0) scale(1)' },
        { transform: 'translate(0, -24px) scale(1.3)', offset: 0.2 },
        { transform: 'translate(0, 0) scale(1.12, 0.88)', offset: 0.7 },
        { transform: 'translate(0, -3px) scale(0.97, 1.04)', offset: 0.85 },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 620, easing: 'cubic-bezier(.4,.02,.3,1)' },
    );
    const done = () => rejectingRef.current.delete(acorn.id);
    if (anim) {
      anim.onfinish = done;
    } else {
      done();
    }
  };

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    hitTest(e.clientX, e.clientY);
  };
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      hitTest(e.clientX, e.clientY);
    }
  };
  const stopDragging = () => {
    draggingRef.current = false;
  };

  return (
    <div
      ref={rootRef}
      className="acorn-field"
      role="group"
      aria-label={`도토리 ${acorns.length}개`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
    >
      {size.width > 0 &&
        acorns.map((acorn) => {
          const left = acorn.x * size.width;
          const top = acorn.y * size.height;
          const style = {
            left,
            top,
            width: acornWidth,
            height: acornWidth / ACORN_ASPECT,
            '--rot': `${acorn.rot}deg`,
            '--from-x': `${size.width / 2 - left}px`,
            '--from-y': `${DROP_ORIGIN_Y - top}px`,
            animationDelay: `${acorn.delayMs}ms`,
          } as CSSProperties;

          return (
            <div
              key={acorn.id}
              data-acorn={acorn.id}
              className={`acorn acorn--${acorn.enter}`}
              style={style}
            >
              <img className="acorn__body" src={acornUrl} alt="" draggable={false} />
            </div>
          );
        })}
    </div>
  );
}
