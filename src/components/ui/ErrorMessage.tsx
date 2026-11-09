import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** Optional longer detail / stack information */
  detail?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Whether to render as a compact inline variant */
  inline?: boolean;
}

/**
 * Displays an error in a styled box with an optional retry button.
 * Use `inline` for smaller contexts (e.g., inside a card).
 */
export default function ErrorMessage({
  message,
  detail,
  onRetry,
  inline = false,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: inline ? 'center' : 'flex-start',
        gap: '0.75rem',
        padding: inline ? '0.65rem 0.9rem' : '1.1rem 1.25rem',
        backgroundColor: '#fdf3f3',
        border: '1px solid #f0c8c8',
        borderRadius: 10,
        color: '#b03535',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <AlertCircle
        size={inline ? 16 : 20}
        style={{ flexShrink: 0, marginTop: inline ? 0 : 2, color: '#b03535' }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: inline ? '0.875rem' : '0.95rem',
            color: '#b03535',
          }}
        >
          {message}
        </p>

        {detail && !inline && (
          <p
            style={{
              margin: '0.3rem 0 0',
              fontSize: '0.8rem',
              color: '#c95050',
              lineHeight: 1.5,
            }}
          >
            {detail}
          </p>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          aria-label="Retry"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            border: '1px solid #f0c8c8',
            borderRadius: 6,
            backgroundColor: '#fff',
            color: '#b03535',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <RefreshCw size={13} />
          {!inline && 'Retry'}
        </button>
      )}
    </div>
  );
}
