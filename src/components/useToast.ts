import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 1800;

/** Message state for `<Toast>` — `show()` replaces the current message and hides it after a moment. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const show = useCallback((next: string) => {
    window.clearTimeout(timerRef.current);
    setMessage(next);
    timerRef.current = window.setTimeout(() => setMessage(null), TOAST_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return [message, show] as const;
}
