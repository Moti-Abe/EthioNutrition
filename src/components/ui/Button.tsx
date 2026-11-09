import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon */
  leftIcon?: ReactNode;
  /** Trailing icon */
  rightIcon?: ReactNode;
  /** Shows a loading state and disables the button */
  loading?: boolean;
  /** Make the button full-width */
  fullWidth?: boolean;
}

const BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  textDecoration: 'none',
  lineHeight: 1,
  transition: 'background-color 150ms, color 150ms, border-color 150ms, box-shadow 150ms',
  userSelect: 'none',
};

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#17422E',
    color: '#ffffff',
    border: '1px solid #17422E',
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#17422E',
    border: '1px solid #DCD5C4',
  },
  outline: {
    backgroundColor: '#ffffff',
    color: '#17422E',
    border: '1px solid #DCD5C4',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#4A5B50',
    border: '1px solid transparent',
  },
  danger: {
    backgroundColor: '#fdf3f3',
    color: '#b03535',
    border: '1px solid #f0c8c8',
  },
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: '0.8rem', padding: '0.4rem 0.85rem', height: 32 },
  md: { fontSize: '0.875rem', padding: '0.55rem 1.1rem', height: 38 },
  lg: { fontSize: '0.95rem', padding: '0.7rem 1.4rem', height: 46 },
};

/** Hover state colours by variant */
const HOVER_BG: Record<ButtonVariant, string> = {
  primary: '#0f2e1f',
  secondary: '#EFEADC',
  outline: '#EFEADC',
  ghost: '#EFEADC',
  danger: '#f8e8e8',
};

/**
 * Reusable design-system Button component.
 *
 * @example
 * <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>Add Food</Button>
 * <Button variant="secondary" loading>Saving…</Button>
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Minimal hover via onMouseEnter/Leave (avoids CSS modules dependency)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor = HOVER_BG[variant];
    }
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
        VARIANT_STYLES[variant].backgroundColor as string;
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...BASE,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(isDisabled ? { opacity: 0.55, cursor: 'not-allowed' } : {}),
        ...style,
      }}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      {loading ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 50 50"
          fill="none"
          aria-hidden="true"
          style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" opacity="0.3" />
          <path d="M 25 5 A 20 20 0 0 1 45 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ) : leftIcon ? (
        <span style={{ display: 'inline-flex', flexShrink: 0 }} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {children}

      {!loading && rightIcon && (
        <span style={{ display: 'inline-flex', flexShrink: 0 }} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
