import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { upsertBodyMetrics, upsertProfile } from '../services/profiles';
import { upsertDailyTarget } from '../services/meals';
import { calculateTargets } from '../utils/targets';
import { toLocalDateString } from '../utils/storage';
import { formatNutrient } from '../utils/nutrition';
import type { BodyMetrics } from '../types';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState<number>(currentYear - 28);
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [activity, setActivity] = useState<BodyMetrics['activity']>('moderate');
  const [goal, setGoal] = useState<BodyMetrics['goal']>('maintain');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live computed targets
  const metrics: BodyMetrics = useMemo(
    () => ({
      user_id: user?.id || '',
      sex,
      birth_year: birthYear,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity,
      goal,
      created_at: '',
      updated_at: '',
    }),
    [user?.id, sex, birthYear, heightCm, weightKg, activity, goal]
  );

  const targets = useMemo(() => calculateTargets(metrics), [metrics]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (heightCm < 50 || heightCm > 260) {
      setError('Please provide a realistic height in cm.');
      return;
    }
    if (weightKg < 20 || weightKg > 400) {
      setError('Please provide a realistic weight in kg.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // 1. Save body metrics
      await upsertBodyMetrics({
        user_id: user.id,
        sex,
        birth_year: birthYear,
        height_cm: heightCm,
        weight_kg: weightKg,
        activity,
        goal,
      });

      // 2. Snapshot today's target
      const today = toLocalDateString();
      await upsertDailyTarget({
        user_id: user.id,
        day: today,
        calories: targets.calories,
        protein_g: targets.protein_g,
        carbs_g: targets.carbs_g,
        fat_g: targets.fat_g,
      });

      // 3. Mark user as onboarded
      await upsertProfile(user.id, user.email || '', true);
      await refreshProfile();

      navigate('/meal');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save targets.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F4EC',
        padding: '3rem 1rem',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              padding: '4px 14px',
              borderRadius: 999,
              backgroundColor: '#EFEADC',
              color: '#17422E',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Personalization
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 600,
              color: '#17422E',
              margin: '0.5rem 0',
            }}
          >
            Set Your Nutrition Targets
          </h1>
          <p style={{ color: '#4A5B50', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
            We calculate your Basal Metabolic Rate and daily targets based on validated Mifflin-St
            Jeor formulas.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fbeaea',
              color: '#b03535',
              borderRadius: 8,
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConfirm}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2rem',
              alignItems: 'start',
            }}
          >
            {/* Left Box: User Inputs */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: '2rem',
                border: '1px solid #DCD5C4',
                boxShadow: '0 2px 8px rgba(23,66,46,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
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
                Your Body Metrics
              </h2>

              {/* Sex */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Biological Sex
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['male', 'female'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: 8,
                        border: '1px solid #DCD5C4',
                        backgroundColor: sex === s ? '#17422E' : '#F7F4EC',
                        color: sex === s ? '#ffffff' : '#17422E',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year / Age */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Birth Year (Age: {currentYear - birthYear})
                </label>
                <input
                  type="number"
                  min={1920}
                  max={currentYear - 10}
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 8,
                    border: '1px solid #DCD5C4',
                    backgroundColor: '#F7F4EC',
                    color: '#17422E',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
              </div>

              {/* Height & Weight 2-Col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min={80}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 8,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#F7F4EC',
                      color: '#17422E',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 8,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#F7F4EC',
                      color: '#17422E',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Activity Level
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as BodyMetrics['activity'])}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 8,
                    border: '1px solid #DCD5C4',
                    backgroundColor: '#F7F4EC',
                    color: '#17422E',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="sedentary">Sedentary (Little or no exercise, x1.2)</option>
                  <option value="light">Light (Exercise 1–3 times/week, x1.375)</option>
                  <option value="moderate">Moderate (Exercise 3–5 times/week, x1.55)</option>
                  <option value="active">Active (Heavy exercise 6–7 times/week, x1.725)</option>
                  <option value="very_active">Very Active (Physical job or intense training, x1.9)</option>
                </select>
              </div>

              {/* Goal */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Nutritional Goal
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { key: 'lose', label: 'Weight Loss (-20%)' },
                    { key: 'maintain', label: 'Maintain (0%)' },
                    { key: 'gain', label: 'Weight Gain (+15%)' },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setGoal(g.key as BodyMetrics['goal'])}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.4rem',
                        borderRadius: 8,
                        border: '1px solid #DCD5C4',
                        backgroundColor: goal === g.key ? '#17422E' : '#F7F4EC',
                        color: goal === g.key ? '#ffffff' : '#17422E',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Live Target Preview */}
            <div
              style={{
                backgroundColor: '#17422E',
                color: '#ffffff',
                borderRadius: 14,
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(23,66,46,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <div>
                <span
                  style={{
                    color: '#e8956a',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Calculated Preview
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    margin: '0.25rem 0 0',
                  }}
                >
                  Your Daily Nutrition Blueprint
                </h2>
              </div>

              {/* BMR and TDEE summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>BMR: </span>
                  <strong>{targets.bmr} kcal</strong>
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>TDEE: </span>
                  <strong>{targets.tdee} kcal</strong>
                </div>
              </div>

              {/* Big Daily Calories */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.25rem',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
                  Target Daily Energy
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {formatNutrient(targets.calories, 0)}
                  <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: 6 }}>kcal / day</span>
                </div>
              </div>

              {/* 3 Macro Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '0.75rem 0.5rem',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8956a' }}>
                    {targets.protein_g}g
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Protein (1.6g/kg)</div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '0.75rem 0.5rem',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                    {targets.carbs_g}g
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Carbs (Remainder)</div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '0.75rem 0.5rem',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                    {targets.fat_g}g
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Fat (25% kcal)</div>
                </div>
              </div>

              {/* Disclaimer */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5,
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  These values are evidence-based nutritional estimates designed to assist with meal planning,
                  not medical prescriptions. Consult a clinical dietitian for medical conditions.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#C46A3F',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {saving ? (
                  'Saving Your Targets…'
                ) : (
                  <>
                    <Check size={18} /> Confirm & Start Tracking
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
