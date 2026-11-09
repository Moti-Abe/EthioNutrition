import type { CSSProperties, ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Additional inline styles */
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  default: {
    backgroundColor: '#EFEADC',
    color: '#4A5B50',
    border: '1px solid #DCD5C4',
  },
  primary: {
    backgroundColor: '#17422E',
    color: '#ffffff',
    border: '1px solid #17422E',
  },
  accent: {
    backgroundColor: '#fdf0ea',
    color: '#C46A3F',
    border: '1px solid #f0c8b0',
  },
  success: {
    backgroundColor: '#edf7f1',
    color: '#2d7a4f',
    border: '1px solid #b8dfc9',
  },
  warning: {
    backgroundColor: '#fdf6ec',
    color: '#b87d2a',
    border: '1px solid #f0dbb0',
  },
  error: {
    backgroundColor: '#fdf3f3',
    color: '#b03535',
    border: '1px solid #f0c8c8',
  },
  muted: {
    backgroundColor: 'transparent',
    color: '#4A5B50',
    border: '1px solid #DCD5C4',
  },
};

const SIZE_STYLES: Record<BadgeSize, CSSProperties> = {
  sm: { fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: 999 },
  md: { fontSize: '0.775rem', padding: '0.2rem 0.65rem', borderRadius: 999 },
};

/**
 * A compact pill/badge for status labels, food groups, verification states, etc.
 *
 * @example
 * <Badge variant="success">Verified</Badge>
 * <Badge variant="accent" size="sm">Cooked</Badge>
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Convenience helper: maps verification_status to a Badge variant.
 */
export function VerificationBadge({
  status,
}: {
  status: 'verified' | 'estimated' | 'unverified';
}) {
  const map: Record<string, BadgeVariant> = {
    verified: 'success',
    estimated: 'warning',
    unverified: 'muted',
  };
  const labels: Record<string, string> = {
    verified: 'Verified',
    estimated: 'Estimated',
    unverified: 'Unverified',
  };
  return <Badge variant={map[status] ?? 'muted'}>{labels[status] ?? status}</Badge>;
}
