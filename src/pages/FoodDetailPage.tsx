import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { fetchFoodBySlug } from '../services/foods';
import { calculateNutrition, formatNutrient } from '../utils/nutrition';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddToMealModal from '../components/meal/AddToMealModal';
import type { FoodNutrition } from '../types';

const NUTRIENT_ROWS = [
  { key: 'calories_kcal', label: 'Calories', unit: 'kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbohydrates_g', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
] as const;

export default function FoodDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [grams, setGrams] = useState(100);
  const [selectedNutritionId, setSelectedNutritionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: food, isLoading, isError } = useQuery({
    queryKey: ['food', slug],
    queryFn: () => fetchFoodBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !food) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p style={{ color: '#b03535' }}>Food not found.</p>
        <Link to="/foods" style={{ color: '#17422E', marginTop: '12px', display: 'inline-block' }}>← Back to Foods</Link>
      </div>
    );
  }

  const nutrition: FoodNutrition[] = food.food_nutrition ?? [];
  const selectedNutrition = nutrition.find((n) => n.id === selectedNutritionId) ?? nutrition[0];

  const computed = selectedNutrition ? calculateNutrition(selectedNutrition, grams) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Back */}
      <Link
        to="/foods"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#4A5B50',
          fontSize: '14px',
          textDecoration: 'none',
          marginBottom: '20px',
          padding: '4px 0',
        }}
      >
        <ArrowLeft size={15} /> Back to Foods
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '32px' }} className="food-detail-grid">
        {/* Image & basic info */}
        <div>
          <div
            style={{
              background: '#EFEADC',
              border: '1px solid #DCD5C4',
              borderRadius: '12px',
              height: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            {food.image_url ? (
              <img src={food.image_url} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <span style={{ fontSize: '64px' }}>🍽️</span>
            )}
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '999px',
              background: '#EFEADC',
              border: '1px solid #DCD5C4',
              fontSize: '12px',
              color: '#4A5B50',
              textTransform: 'capitalize',
              marginBottom: '8px',
            }}
          >
            {food.food_group}
          </span>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: '#17422E',
              marginBottom: '4px',
            }}
          >
            {food.name}
          </h1>
          {food.name_amharic && (
            <p style={{ color: '#4A5B50', fontSize: '15px', marginBottom: '4px' }}>{food.name_amharic}</p>
          )}
          {food.name_afaan_oromo && (
            <p style={{ color: '#4A5B50', fontSize: '14px', marginBottom: '8px' }}>{food.name_afaan_oromo}</p>
          )}
          {food.description && (
            <p style={{ color: '#4A5B50', fontSize: '14px', lineHeight: 1.6, marginTop: '12px' }}>{food.description}</p>
          )}
        </div>

        {/* Nutrition panel */}
        <div>
          {/* Preparation state selector */}
          {nutrition.length > 1 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4A5B50', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preparation State
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {nutrition.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNutritionId(n.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: (selectedNutrition?.id === n.id) ? '#17422E' : '#DCD5C4',
                      background: (selectedNutrition?.id === n.id) ? '#17422E' : 'white',
                      color: (selectedNutrition?.id === n.id) ? 'white' : '#4A5B50',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {n.preparation_state}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gram adjuster */}
          <div
            style={{
              background: 'white',
              border: '1px solid #DCD5C4',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#4A5B50', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Serving Size
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={1}
                max={2000}
                value={grams}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '90px',
                  padding: '8px 12px',
                  border: '1px solid #DCD5C4',
                  borderRadius: '6px',
                  fontSize: '15px',
                  color: '#17422E',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              />
              <span style={{ color: '#4A5B50', fontSize: '14px' }}>grams</span>
            </div>
          </div>

          {/* Nutrition table */}
          {selectedNutrition && computed && (
            <div
              style={{
                background: 'white',
                border: '1px solid #DCD5C4',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #DCD5C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#17422E' }}>
                  Nutrition Facts
                </span>
                <span style={{ fontSize: '12px', color: '#4A5B50', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={12} />
                  Approximate, per {grams} g
                </span>
              </div>
              {NUTRIENT_ROWS.map((row, i) => {
                const val = computed[row.key];
                const per100 = selectedNutrition[row.key];
                return (
                  <div
                    key={row.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      borderBottom: i < NUTRIENT_ROWS.length - 1 ? '1px solid #F4F1E9' : undefined,
                      background: i % 2 === 0 ? 'white' : '#FAFAF8',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: '#4A5B50' }}>{row.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#17422E' }}>
                        {formatNutrient(val)} {row.unit}
                      </span>
                      {grams !== 100 && (
                        <span style={{ fontSize: '12px', color: '#4A5B50', display: 'block' }}>
                          ({formatNutrient(per100)} / 100 g)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Source info */}
              <div style={{ padding: '12px 20px', background: '#FAFAF8', borderTop: '1px solid #DCD5C4' }}>
                <div style={{ fontSize: '12px', color: '#4A5B50' }}>
                  Source: {selectedNutrition.source_name || 'Unknown'}
                  {' · '}
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: selectedNutrition.verification_status === 'verified' ? '#d1f5e0' : '#fef3e2',
                      color: selectedNutrition.verification_status === 'verified' ? '#1a6633' : '#8a5a1a',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {selectedNutrition.verification_status}
                  </span>
                </div>
                {selectedNutrition.notes && (
                  <div style={{ fontSize: '12px', color: '#4A5B50', marginTop: '4px' }}>{selectedNutrition.notes}</div>
                )}
              </div>
            </div>
          )}

          {/* Add to Meal */}
          {selectedNutrition && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                minHeight: '44px',
                background: '#17422E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Add to Meal Builder
            </button>
          )}
        </div>
      </div>

      {showAddModal && selectedNutrition && (
        <AddToMealModal
          food={food}
          nutritionOptions={nutrition}
          defaultNutritionId={selectedNutrition.id}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .food-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
