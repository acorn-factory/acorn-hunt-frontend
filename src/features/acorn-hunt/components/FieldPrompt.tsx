import type { ReactNode } from 'react';
import './FieldPrompt.css';

interface FieldPromptProps {
  message: ReactNode;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void };
}

/** Centered message over the field with an optional dark CTA (Frames 50, 55, 58). */
export function FieldPrompt({ message, action, secondary }: FieldPromptProps) {
  return (
    <div className="field-prompt">
      <p className="field-prompt__message">{message}</p>
      {action && (
        <button
          type="button"
          className="field-prompt__action"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      {secondary && (
        <button type="button" className="field-prompt__secondary" onClick={secondary.onClick}>
          {secondary.label}
        </button>
      )}
    </div>
  );
}
