import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Foods', to: '/foods' },
  { label: 'Build Meal', to: '/build' },
  { label: 'Your Meals', to: '/meal' },
];

export default function MainLayout() {
  const { user, signOut, loading, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // Close desktop user dropdown if clicked outside
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      // Close mobile drawer if clicked outside the drawer and hamburger button
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileOpen(false);
        setShowDbGuide(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [navigate]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? { color: '#C46A3F', fontWeight: 600 }
      : { color: '#4A5B50' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F4EC' }}>
      {/* ── Demo Mode Banner if Supabase credentials are placeholder ── */}
      {isDemoMode && !dismissBanner && (
        <div
          style={{
            backgroundColor: '#EFEADC',
            borderBottom: '1px solid #DCD5C4',
            padding: '0.45rem 1.5rem',
            fontSize: '0.8rem',
            color: '#17422E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span>
              ℹ️ <strong>Interactive Demo Mode:</strong> All features are active with the local 27-food dataset.
            </span>
            <button
              type="button"
              onClick={() => setShowDbGuide(true)}
              style={{
                textDecoration: 'underline',
                color: '#C46A3F',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: 0,
              }}
            >
              Connect Live Supabase PostgreSQL →
            </button>
          </span>
          <button
            onClick={() => setDismissBanner(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#4A5B50',
              fontWeight: 600,
              padding: '2px 6px',
            }}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Sticky Nav ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#F7F4EC',
          borderBottom: '1px solid #DCD5C4',
          boxShadow: '0 1px 3px rgba(23,66,46,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 clamp(1rem, 3vw, 1.5rem)',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#17422E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Leaf size={18} color="#ffffff" />
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
                color: '#17422E',
                letterSpacing: '-0.02em',
              }}
            >
              EthioNutrition
            </span>
          </Link>

          {/* Desktop nav - ONLY on desktop (>= 768px) */}
          <nav
            className="nav-desktop-only"
            style={{ alignItems: 'center', gap: '0.25rem' }}
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...activeLinkStyle({ isActive }),
                  padding: '0.45rem 0.9rem',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: 'color 150ms, background-color 150ms',
                  backgroundColor: isActive ? '#EFEADC' : 'transparent',
                })}
                className="hover:bg-[#EFEADC]"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth - ONLY on desktop (>= 768px) */}
          <div className="nav-desktop-only" style={{ alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {!loading && (
              user ? (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.75rem',
                      border: '1px solid #DCD5C4',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                      color: '#17422E',
                      cursor: 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      minHeight: 40,
                    }}
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#17422E',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {user.email?.[0]?.toUpperCase() ?? <User size={14} />}
                    </span>
                    <ChevronDown size={14} style={{ color: '#4A5B50' }} />
                  </button>

                  {userMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #DCD5C4',
                        borderRadius: 10,
                        boxShadow: '0 4px 16px rgba(23,66,46,0.10)',
                        minWidth: 200,
                        overflow: 'hidden',
                        zIndex: 100,
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #DCD5C4',
                        }}
                      >
                        <p style={{ fontSize: '0.75rem', color: '#4A5B50', margin: 0 }}>Signed in as</p>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#17422E',
                            fontWeight: 600,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.85rem',
                          color: '#17422E',
                          textDecoration: 'none',
                          borderBottom: '1px solid #EFEADC',
                        }}
                        className="hover:bg-[#F7F4EC]"
                      >
                        <User size={15} style={{ color: '#4A5B50' }} />
                        <span>Profile & Saved Meals</span>
                      </Link>
                      <Link
                        to="/onboarding"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.85rem',
                          color: '#17422E',
                          textDecoration: 'none',
                          borderBottom: '1px solid #EFEADC',
                        }}
                        className="hover:bg-[#F7F4EC]"
                      >
                        <Leaf size={15} style={{ color: '#4A5B50' }} />
                        <span>Nutrition Blueprint</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#b03535',
                          cursor: 'pointer',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: '0.875rem',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  style={{
                    padding: '0.45rem 1.1rem',
                    backgroundColor: '#17422E',
                    color: '#ffffff',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-block',
                    minHeight: 38,
                    lineHeight: '26px',
                  }}
                >
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Mobile Navbar Controls - ONLY on small screens (< 768px):
              1. Logo is to the left (above)
              2. Hamburger menu button
              3. Sign in button */}
          <div
            className="nav-mobile-only"
            style={{
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0,
            }}
          >
            {/* 2. Hamburger menu button */}
            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                minHeight: 40,
                width: 40,
                height: 40,
                border: '1px solid #DCD5C4',
                borderRadius: 8,
                backgroundColor: mobileOpen ? '#EFEADC' : '#ffffff',
                cursor: 'pointer',
                color: '#17422E',
                transition: 'background-color 150ms ease',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* 3. Sign in button (or user profile button if logged in) */}
            {!loading && (
              user ? (
                <Link
                  to="/profile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    minHeight: 38,
                    backgroundColor: '#17422E',
                    color: '#ffffff',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                  aria-label="User profile"
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.email?.[0]?.toUpperCase() ?? <User size={12} />}
                  </span>
                  <span>Profile</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.4rem 0.85rem',
                    minHeight: 38,
                    backgroundColor: '#17422E',
                    color: '#ffffff',
                    borderRadius: 8,
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign in
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#F7F4EC',
              borderTop: '1px solid #DCD5C4',
              borderBottom: '1px solid #DCD5C4',
              padding: '1rem clamp(1rem, 4vw, 1.5rem) 1.5rem',
              boxShadow: '0 12px 30px rgba(23,66,46,0.12)',
              maxHeight: 'calc(100vh - 65px)',
              overflowY: 'auto',
              zIndex: 60,
            }}
            className="md:hidden"
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }} aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    ...activeLinkStyle({ isActive }),
                    padding: '0.75rem 1rem',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 44,
                    backgroundColor: isActive ? '#EFEADC' : 'transparent',
                    border: isActive ? '1px solid #DCD5C4' : '1px solid transparent',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Auth & Account links inside menu */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #DCD5C4' }}>
              {!loading && (
                user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      style={{
                        padding: '0.6rem 0.8rem',
                        backgroundColor: '#EFEADC',
                        borderRadius: 8,
                        marginBottom: '0.35rem',
                      }}
                    >
                      <p style={{ fontSize: '0.75rem', color: '#4A5B50', margin: 0 }}>Signed in as</p>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#17422E',
                          fontWeight: 600,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        color: '#17422E',
                        textDecoration: 'none',
                        borderRadius: 8,
                        minHeight: 44,
                        backgroundColor: '#ffffff',
                        border: '1px solid #DCD5C4',
                      }}
                    >
                      <User size={18} style={{ color: '#4A5B50' }} />
                      <span>Profile & Saved Meals</span>
                    </Link>

                    <Link
                      to="/onboarding"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        color: '#17422E',
                        textDecoration: 'none',
                        borderRadius: 8,
                        minHeight: 44,
                        backgroundColor: '#ffffff',
                        border: '1px solid #DCD5C4',
                      }}
                    >
                      <Leaf size={18} style={{ color: '#4A5B50' }} />
                      <span>Nutrition Blueprint</span>
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        setMobileOpen(false);
                        await handleSignOut();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1rem',
                        border: '1px solid #f0cccc',
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                        color: '#b03535',
                        cursor: 'pointer',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontSize: '0.95rem',
                        minHeight: 44,
                        textAlign: 'left',
                        marginTop: '0.25rem',
                      }}
                    >
                      <LogOut size={18} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem 1.25rem',
                      backgroundColor: '#17422E',
                      color: '#ffffff',
                      borderRadius: 8,
                      textDecoration: 'none',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      minHeight: 44,
                    }}
                  >
                    Sign in / Register
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: '#17422E',
          color: '#ffffff',
          padding: '2.5rem clamp(1rem, 3vw, 1.5rem)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Leaf size={18} color="#C46A3F" />
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                }}
              >
                EthioNutrition
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0, maxWidth: 280 }}>
              Nutritional data for traditional Ethiopian foods, carefully curated and verified.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'clamp(1.5rem, 5vw, 3rem)', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Explore
              </p>
              {NAV_ITEMS.map((item) => (
                <div key={item.to} style={{ marginBottom: '0.4rem' }}>
                  <Link
                    to={item.to}
                    style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '2rem auto 0',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
            © {new Date().getFullYear()} EthioNutrition. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
            Nutritional data is approximate. Consult a professional for medical advice.
          </p>
        </div>
      </footer>

      {/* ── Supabase PostgreSQL Database Setup Modal ── */}
      {showDbGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23,66,46,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={() => setShowDbGuide(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              maxWidth: 620,
              width: '100%',
              border: '1px solid #DCD5C4',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: '#17422E',
                  margin: 0,
                }}
              >
                Connect Your Live Supabase Database
              </h2>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#4A5B50',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#4A5B50', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#17422E' }}>1. Create or Open a Supabase Project</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#C46A3F', textDecoration: 'underline' }}>supabase.com</a> and sign in. Create a new free project.
                </p>
              </div>

              <div>
                <strong style={{ color: '#17422E' }}>2. Run the 1-Click Database Setup Script</strong>
                <p style={{ margin: '4px 0 0' }}>
                  In your Supabase Dashboard, go to <strong>SQL Editor</strong> → <strong>New Query</strong>. Copy and paste the contents of:
                </p>
                <div style={{ backgroundColor: '#F7F4EC', padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid #DCD5C4', marginTop: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#17422E' }}>
                  supabase/setup_all.sql
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#4A5B50' }}>
                  This creates all 13 tables, activates Row Level Security (read-only for visitors, isolated tracking for users), and seeds all 27 Ethiopian foods and categories.
                </p>
              </div>

              <div>
                <strong style={{ color: '#17422E' }}>3. Add API Credentials to <code>.env.local</code></strong>
                <p style={{ margin: '4px 0 0' }}>
                  In Supabase, go to <strong>Project Settings</strong> → <strong>API</strong>. Copy your Project URL and anon public key into <code>.env.local</code>:
                </p>
                <pre style={{ backgroundColor: '#17422E', color: '#F7F4EC', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', overflowX: 'auto', marginTop: '6px' }}>
{`VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>`}
                </pre>
              </div>

              <div>
                <strong style={{ color: '#17422E' }}>4. Adding New Foods as Administrator</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Whenever you add foods directly in the Supabase Table Editor or SQL Editor, they will instantly appear across Foods and Meal Builder without redeploying!
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 8,
                  backgroundColor: '#17422E',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
