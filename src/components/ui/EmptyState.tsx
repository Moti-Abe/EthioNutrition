import type { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  /** Icon element (e.g., a Lucide icon) */
  icon?: ReactNode;
  /** Bold title */
  title: string;
  /** Descriptive subtitle */
  description?: string;
  /** Optional action button or custom node */
  action?: ReactNode;
  /** Convenience label when using default button */
  actionLabel?: string;
  /** Convenience handler when using actionLabel */
  onAction?: () => void;
  /** Override container padding */
  compact?: boolean;
}

/**
 * A centered empty-state block with an optional icon, title, description, and CTA.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '2rem 1.5rem' : '4rem 2rem',
        gap: '1rem',
      }}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#EFEADC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4A5B50',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: 360 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            fontSize: '1.2rem',
            color: '#17422E',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              color: '#4A5B50',
              fontSize: '0.9rem',
              margin: 0,
              lineHeight: 1.6,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action ? (
        <div style={{ marginTop: '0.5rem' }}>{action}</div>
      ) : actionLabel && onAction ? (
        <div style={{ marginTop: '0.5rem' }}>
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
