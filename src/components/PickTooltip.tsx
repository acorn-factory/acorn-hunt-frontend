import type { ReactNode } from 'react';
import tailUrl from '../assets/tooltip-tail.svg';
import './PickTooltip.css';

interface PickTooltipProps {
  children: ReactNode;
  className?: string;
}

/** Tooltip with a downward tail ("Tooltip", Figma node 40:1873). */
export function PickTooltip({ children, className }: PickTooltipProps) {
  return (
    <div className={className ? `pick-tooltip ${className}` : 'pick-tooltip'}>
      <div className="pick-tooltip__bubble">{children}</div>
      <img className="pick-tooltip__tail" src={tailUrl} alt="" />
    </div>
  );
}
