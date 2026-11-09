interface LoadingSpinnerProps {
  /** Spinner size: sm = 24px, md = 40px (default), lg = 56px */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label (screen-reader only) */
  label?: string;
  /** Center horizontally + vertically within parent */
  centered?: boolean;
}

const SIZE_MAP = { sm: 24, md: 40, lg: 56 } as const;
const STROKE_MAP = { sm: 2.5, md: 3, lg: 3.5 } as const;

/**
 * A clean SVG-based loading spinner using the design-system primary color.
 */
export default function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  centered = true,
}: LoadingSpinnerProps) {
  const px = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];

  const spinner = (
    <span role="status" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'spin 0.8s linear infinite' }}
        aria-hidden="true"
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#DCD5C4"
          strokeWidth={stroke * 1.5}
        />
        <path
          d="M 25 5 A 20 20 0 0 1 45 25"
          stroke="#17422E"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {label}
      </span>
    </span>
  );

  if (centered) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '2rem',
        }}
      >
        {spinner}
        {label && (
          <p
            aria-hidden="true"
            style={{
              color: '#4A5B50',
              fontSize: '0.875rem',
              margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {label}
          </p>
        )}
      </div>
    );
  }

  return spinner;
}
