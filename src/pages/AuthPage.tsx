import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Leaf, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../services/profiles';
import Button from '../components/ui/Button';

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode: AuthMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectPath = searchParams.get('redirect') || '/foods';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword, signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSuccessfulAuth = async (userId?: string) => {
    if (!userId) {
      navigate(redirectPath);
      return;
    }

    try {
      const profile = await fetchProfile(userId);
      if (profile && profile.onboarded) {
        navigate(redirectPath);
      } else {
        navigate('/onboarding');
      }
    } catch {
      navigate(redirectPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (mode !== 'forgot' && !password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        // Step 1-3: User enters same email and password; Supabase authenticates
        const { user } = await signIn(trimmedEmail, password);
        // Step 4: User accesses their personal nutrition and fitness data
        await handleSuccessfulAuth(user?.id);
      } else if (mode === 'signup') {
        // Step 1-3: User enters email and password; Supabase creates account
        const { user, session } = await signUp(trimmedEmail, password);

        // Step 4: User can immediately log in
        if (session && user) {
          // If auto-authenticated, enter directly into personal nutrition and fitness data
          await handleSuccessfulAuth(user.id);
        } else {
          // Switch to Sign In mode with prefilled credentials ready for immediate login
          setMode('signin');
          setMessage(
            'Account created successfully! Click "Sign In" below to access your personal nutrition and fitness data.'
          );
        }
      } else if (mode === 'forgot') {
        await resetPassword(trimmedEmail);
        setMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Authentication failed.';
      const lower = errMsg.toLowerCase();

      if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
        setError(
          'Email confirmation is currently enabled in your Supabase project. To allow immediate login without email confirmation: in your Supabase Dashboard, go to Authentication > Providers > Email and turn OFF "Confirm email".'
        );
      } else if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
        setError('Incorrect email or password. Please verify your credentials.');
      } else if (lower.includes('user already registered') || lower.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
        setMode('signin');
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F4EC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: '#17422E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Leaf size={22} color="#ffffff" />
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: '1.7rem',
              color: '#17422E',
            }}
          >
            EthioNutrition
          </span>
        </Link>
        <p style={{ color: '#4A5B50', fontSize: '0.95rem', margin: 0 }}>
          {mode === 'signin' && 'Sign in to access your saved meals and daily targets'}
          {mode === 'signup' && 'Create your account and set personalized nutritional targets'}
          {mode === 'forgot' && 'Reset your password'}
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #DCD5C4',
          boxShadow: '0 4px 20px rgba(23,66,46,0.08)',
          padding: '2rem',
        }}
      >
        {/* Mode Tabs (Sign In / Register) */}
        {mode !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F7F4EC',
              borderRadius: 8,
              padding: 4,
              marginBottom: '1.5rem',
              border: '1px solid #DCD5C4',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 6,
                backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
                color: mode === 'signin' ? '#17422E' : '#4A5B50',
                fontWeight: mode === 'signin' ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 6,
                backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? '#17422E' : '#4A5B50',
                fontWeight: mode === 'signup' ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Register
            </button>
          </div>
        )}

        {/* Feedback Banners */}
        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fbeaea',
              color: '#b03535',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#d1f5e0',
              color: '#1a6633',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#17422E',
                marginBottom: '0.35rem',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 8,
                border: '1px solid #DCD5C4',
                backgroundColor: '#ffffff',
                color: '#17422E',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#17422E',
                  }}
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setMessage(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C46A3F',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#ffffff',
                  color: '#17422E',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#17422E',
                  marginBottom: '0.35rem',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#ffffff',
                  color: '#17422E',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading
              ? 'Please wait…'
              : mode === 'signin'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </Button>
        </form>

        {/* Instant Demo Access Button */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #EFEADC',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={async () => {
              await signInAsDemo();
              navigate(redirectPath);
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              backgroundColor: '#EFEADC',
              color: '#17422E',
              border: '1px solid #DCD5C4',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <KeyRound size={16} />
            Explore as Guest / Demo User
          </button>
        </div>

        {mode === 'forgot' && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#17422E',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}