import './Toast.css';

interface ToastProps {
  message: string | null;
}

/** "안내 토스트" — short status pill over the tree ("계속 주워보세요!", "알림을 켰어요!"). */
export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {message != null && (
        <span key={message} className="toast__pill">
          {message}
        </span>
      )}
    </div>
  );
}
