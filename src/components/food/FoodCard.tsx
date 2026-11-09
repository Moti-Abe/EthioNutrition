import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Utensils } from 'lucide-react';
import type { FoodWithNutrition, FoodNutrition } from '../../types';
import { formatNutrient } from '../../utils/nutrition';
import AddToMealModal from '../meal/AddToMealModal';

interface FoodCardProps {
  food: FoodWithNutrition;
}

export default function FoodCard({ food }: FoodCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const nutritionList: FoodNutrition[] = food.food_nutrition ?? [];
  const [selectedNutritionId, setSelectedNutritionId] = useState<string>(
    nutritionList[0]?.id || ''
  );

  const activeNutrition =
    nutritionList.find((n) => n.id === selectedNutritionId) || nutritionList[0];

  return (
    <>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #DCD5C4',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          boxShadow: '0 1px 3px rgba(23, 66, 46, 0.05)',
        }}
        className="hover:border-[#17422E] hover:shadow-md"
      >
        {/* Image / Banner Header */}
        <div
          style={{
            height: 140,
            backgroundColor: '#EFEADC',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {food.image_url ? (
            <img
              src={food.image_url}
              alt={food.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                color: '#4A5B50',
              }}
            >
              <Utensils size={32} strokeWidth={1.5} color="#17422E" />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em' }}>
                {food.food_group || 'Ethiopian Food'}
              </span>
            </div>
          )}

          {/* Food group tag */}
          {food.food_group && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(23, 66, 46, 0.85)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                backdropFilter: 'blur(2px)',
              }}
            >
              {food.food_group}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div>
            {/* Title & Local Names */}
            <div style={{ marginBottom: '0.35rem' }}>
              <Link
                to={`/foods/${food.slug}`}
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#17422E',
                  textDecoration: 'none',
                  display: 'inline-block',
                  lineHeight: 1.3,
                }}
                className="hover:text-[#C46A3F]"
              >
                {food.name}
              </Link>

              {(food.name_amharic || food.name_afaan_oromo) && (
                <div
                  style={{
                    fontSize: '0.825rem',
                    color: '#4A5B50',
                    marginTop: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  {food.name_amharic && (
                    <span style={{ fontWeight: 500 }}>{food.name_amharic}</span>
                  )}
                  {food.name_amharic && food.name_afaan_oromo && <span>•</span>}
                  {food.name_afaan_oromo && (
                    <span style={{ fontStyle: 'italic' }}>{food.name_afaan_oromo}</span>
                  )}
                </div>
              )}
            </div>

            {/* Preparation State Selector if multiple */}
            {nutritionList.length > 1 ? (
              <div style={{ marginTop: '0.5rem' }}>
                <select
                  value={selectedNutritionId}
                  onChange={(e) => setSelectedNutritionId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: 6,
                    border: '1px solid #DCD5C4',
                    backgroundColor: '#F7F4EC',
                    color: '#17422E',
                    cursor: 'pointer',
                  }}
                  aria-label="Select preparation state"
                >
                  {nutritionList.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.preparation_state}
                    </option>
                  ))}
                </select>
              </div>
            ) : activeNutrition ? (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#4A5B50',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                State: <span style={{ color: '#17422E' }}>{activeNutrition.preparation_state}</span>
              </div>
            ) : null}
          </div>

          {/* Nutritional Values Display */}
          {activeNutrition ? (
            <div>
              {/* Qualifier requirement */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  color: '#4A5B50',
                  marginBottom: '0.35rem',
                }}
              >
                <span>Approximate, per 100 g</span>
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: '0.65rem',
                    backgroundColor:
                      activeNutrition.verification_status === 'verified' ? '#d1f5e0' : '#fef3e2',
                    color:
                      activeNutrition.verification_status === 'verified' ? '#1a6633' : '#8a5a1a',
                    fontWeight: 500,
                  }}
                >
                  {activeNutrition.verification_status}
                </span>
              </div>

              {/* 4-col macro grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.35rem',
                  backgroundColor: '#F7F4EC',
                  padding: '0.5rem 0.4rem',
                  borderRadius: 8,
                  border: '1px solid #EFEADC',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(activeNutrition.calories_kcal, 0)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4A5B50' }}>kcal</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#C46A3F' }}>
                    {formatNutrient(activeNutrition.protein_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4A5B50' }}>Protein</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(activeNutrition.carbohydrates_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4A5B50' }}>Carbs</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(activeNutrition.fat_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4A5B50' }}>Fat</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#8a7f6a', fontStyle: 'italic' }}>
              No nutrition data available.
            </div>
          )}

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              paddingTop: '0.5rem',
              borderTop: '1px solid #EFEADC',
            }}
          >
            {activeNutrition && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  backgroundColor: '#17422E',
                  color: '#ffffff',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                className="hover:bg-[#1e5438]"
              >
                <Plus size={14} /> Add
              </button>
            )}

            <Link
              to={`/foods/${food.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#EFEADC',
                color: '#17422E',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                border: '1px solid #DCD5C4',
              }}
              className="hover:bg-[#DCD5C4]"
              aria-label={`View details for ${food.name}`}
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && activeNutrition && (
        <AddToMealModal
          food={food}
          nutritionOptions={nutritionList}
          defaultNutritionId={activeNutrition.id}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

