import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LogOut, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchBodyMetrics } from '../services/profiles';
import { fetchUserMeals, deleteMeal } from '../services/meals';
import { calculateTargets } from '../utils/targets';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Body metrics
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['bodyMetrics', user?.id],
    queryFn: () => (user ? fetchBodyMetrics(user.id) : null),
    enabled: !!user,
  });

  // Saved meals
  const { data: meals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['userMeals', user?.id],
    queryFn: () => (user ? fetchUserMeals(user.id) : []),
    enabled: !!user,
  });

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMeals', user?.id] });
    },
    onError: (err: unknown) => {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete meal');
    },
  });

  const targets = metrics ? calculateTargets(metrics) : null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
              fontWeight: 600,
              color: '#17422E',
              margin: '0 0 0.25rem',
            }}
          >
            Your Profile
          </h1>
          <p style={{ color: '#4A5B50', fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)', margin: 0 }}>
            Manage your account, view your body metrics, and inspect saved meal templates.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleSignOut} style={{ display: 'inline-flex', gap: 6 }}>
          <LogOut size={16} /> Sign Out
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Account Details Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #DCD5C4',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            boxShadow: '0 1px 3px rgba(23,66,46,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#17422E',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {user?.email?.[0]?.toUpperCase() ?? <User size={24} />}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#17422E' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4A5B50' }}>
                User ID: <code style={{ fontSize: '0.75rem' }}>{user?.id}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Targets & Metrics Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #DCD5C4',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            boxShadow: '0 1px 3px rgba(23,66,46,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#17422E',
                margin: 0,
              }}
            >
              Nutritional Targets & Metrics
            </h2>

            <Link
              to="/onboarding"
              style={{
                fontSize: '0.85rem',
                color: '#C46A3F',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Edit Targets <ArrowRight size={14} />
            </Link>
          </div>

          {loadingMetrics ? (
            <LoadingSpinner />
          ) : metrics && targets ? (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ backgroundColor: '#F7F4EC', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4A5B50', textTransform: 'uppercase' }}>Height</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#17422E' }}>{metrics.height_cm} cm</div>
                </div>
                <div style={{ backgroundColor: '#F7F4EC', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4A5B50', textTransform: 'uppercase' }}>Weight</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#17422E' }}>{metrics.weight_kg} kg</div>
                </div>
                <div style={{ backgroundColor: '#F7F4EC', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4A5B50', textTransform: 'uppercase' }}>Activity</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17422E', textTransform: 'capitalize' }}>
                    {metrics.activity.replace('_', ' ')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F7F4EC', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4A5B50', textTransform: 'uppercase' }}>Goal</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#C46A3F', textTransform: 'capitalize' }}>
                    {metrics.goal} weight
                  </div>
                </div>
              </div>

              {/* Target numbers */}
              <div
                style={{
                  backgroundColor: '#17422E',
                  color: '#ffffff',
                  borderRadius: 10,
                  padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 65px), 1fr))',
                  gap: '0.5rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 700 }}>{targets.calories}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>kcal Target</div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 700, color: '#e8956a' }}>{targets.protein_g}g</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Protein</div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 700 }}>{targets.carbs_g}g</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Carbs</div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', fontWeight: 700 }}>{targets.fat_g}g</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Fat</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#4A5B50' }}>
              <p>You haven't set up your body metrics yet.</p>
              <Link
                to="/onboarding"
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17422E',
                  color: '#ffffff',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Complete Onboarding
              </Link>
            </div>
          )}
        </div>

        {/* Saved Meal Templates Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #DCD5C4',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            boxShadow: '0 1px 3px rgba(23,66,46,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#17422E',
                margin: 0,
              }}
            >
              Saved Meal Templates ({meals.length})
            </h2>

            <Link
              to="/build"
              style={{
                fontSize: '0.85rem',
                color: '#17422E',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              + Build New Meal
            </Link>
          </div>

          {deleteError && (
            <div style={{ color: '#b03535', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {deleteError}
            </div>
          )}

          {loadingMeals ? (
            <LoadingSpinner />
          ) : meals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#4A5B50' }}>
              <p style={{ margin: 0 }}>No saved meal templates yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                Use <Link to="/build" style={{ color: '#C46A3F' }}>Build a Meal</Link> to craft and save your favorite recipes.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '1px solid #EFEADC',
                    borderRadius: 8,
                    backgroundColor: '#F7F4EC',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#17422E', fontSize: '0.95rem' }}>
                      {meal.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4A5B50' }}>
                      Saved on {new Date(meal.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMealMutation.mutate(meal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b03535',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                    title="Delete template"
                    aria-label="Delete template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

