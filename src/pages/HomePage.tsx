import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, BarChart3, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Utensils,
    title: 'Explore Foods',
    description:
      'Browse a comprehensive database of Ethiopian and international foods with accurate nutritional values.',
    href: '/foods',
    cta: 'Browse Foods',
  },
  {
    icon: BarChart3,
    title: 'Build Meal',
    description:
      'Compose custom meals from any foods, adjust portions, and see real-time nutritional totals.',
    href: '/build',
    cta: 'Build Now',
  },
  {
    icon: TrendingUp,
    title: 'Your Meals',
    description:
      'Log what you eat each day, monitor progress against personal targets, and stay on track.',
    href: '/meal',
    cta: 'Start Tracking',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: 'linear-gradient(135deg, #17422E 0%, #1e5438 100%)' }}
        className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <span
            style={{
              background: 'rgba(196,106,63,0.2)',
              border: '1px solid rgba(196,106,63,0.4)',
              color: '#e8956a',
              borderRadius: '999px',
              padding: '4px 14px',
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              display: 'inline-block',
              marginBottom: '18px',
            }}
          >
            YOUR NUTRITION. YOUR TRANSFORMATION.
          </span>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.8rem, 5vw, 3.25rem)',
              fontWeight: 600,
              lineHeight: 1.25,
              marginBottom: '16px',
            }}
          >
            Know What You Eat,<br />Build Your Dream physique 
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
              maxWidth: '580px',
              margin: '0 auto 28px',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Accurate nutritional information for Ethiopian and international foods.
            Build meals, track daily intake, and understand what you eat.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/foods"
              style={{
                background: '#C46A3F',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '44px',
                flex: '1 1 200px',
                maxWidth: '260px',
              }}
            >
              Explore Foods <ArrowRight size={16} />
            </Link>
            <Link
              to="/build"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                flex: '1 1 200px',
                maxWidth: '260px',
              }}
            >
              Build a Meal
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#EFEADC', borderBottom: '1px solid #DCD5C4' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            {[
              { value: '50+', label: 'Ethiopian Foods' },
              { value: '100+', label: 'Nutrition Records' },
              { value: '100%', label: 'Verified Nutrition' },
              { value: 'Free', label: 'Always Free' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                    fontWeight: 600,
                    color: '#17422E',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: '#4A5B50',
                    marginTop: '2px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 600,
                color: '#17422E',
                marginBottom: '10px',
              }}
            >
              Everything You Need
            </h2>
            <p style={{ color: '#4A5B50', fontFamily: 'Inter, sans-serif', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
              A simple, honest nutrition tool built for Ethiopian and East African food culture.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '20px',
            }}
          >
            {features.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'white',
                    border: '1px solid #DCD5C4',
                    borderRadius: '12px',
                    padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'border-color 150ms, box-shadow 150ms',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#17422E';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(23,66,46,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#DCD5C4';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      background: '#EFEADC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <feature.icon size={20} color="#17422E" />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '8px',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: '#4A5B50',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                    }}
                  >
                    {feature.description}
                  </p>
                  <span
                    style={{
                      color: '#C46A3F',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {feature.cta} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#EFEADC', borderTop: '1px solid #DCD5C4' }} className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
              fontWeight: 600,
              color: '#17422E',
              marginBottom: '12px',
            }}
          >
            Start Tracking Today
          </h2>
          <p style={{ color: '#4A5B50', fontFamily: 'Inter, sans-serif', marginBottom: '24px' }}>
            Create a free account to save meals and track daily nutrition.
          </p>
          <Link
            to="/auth"
            style={{
              background: '#17422E',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
            }}
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
