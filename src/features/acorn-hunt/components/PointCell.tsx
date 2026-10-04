import type { Ref } from 'react';
import chevronUrl from '../assets/chevron-right.svg';
import coinUrl from '../assets/coin.svg';
import './PointCell.css';

interface PointCellProps {
  won: number;
  cellRef?: Ref<HTMLDivElement>;
}

/**
 * "토스 포인트 셀" — running total of won earned.
 * TODO: the chevron's destination (history / convert to Toss points) isn't designed yet.
 */
export function PointCell({ won, cellRef }: PointCellProps) {
  return (
    <div ref={cellRef} className="point-cell">
      <img className="point-cell__coin" src={coinUrl} alt="" />
      <span className="point-cell__label">쌓인 금액</span>
      <span className="point-cell__value">{won.toLocaleString('ko-KR')}원</span>
      <img className="point-cell__chevron" src={chevronUrl} alt="" />
    </div>
  );
}
