import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { FoodWithNutrition, FoodNutrition } from '../../types';
import { useMealBuilder } from '../../context/MealBuilderContext';
import { calculateNutrition, formatNutrient } from '../../utils/nutrition';
import Button from '../ui/Button';

interface AddToMealModalProps {
  food: FoodWithNutrition;
  nutritionOptions: FoodNutrition[];
  defaultNutritionId?: string;
  onClose: () => void;
}

export default function AddToMealModal({
  food,
  nutritionOptions,
  defaultNutritionId,
  onClose,
}: AddToMealModalProps) {
  const { addItem } = useMealBuilder();
  const [selectedNutritionId, setSelectedNutritionId] = useState<string>(
    defaultNutritionId || nutritionOptions[0]?.id || ''
  );
  const [grams, setGrams] = useState<number>(100);
  const [added, setAdded] = useState(false);

  const selectedNutrition =
    nutritionOptions.find((n) => n.id === selectedNutritionId) || nutritionOptions[0];

  const computed = selectedNutrition ? calculateNutrition(selectedNutrition, grams) : null;

  const handleAdd = () => {
    if (!selectedNutrition || grams <= 0) return;
    addItem(food, selectedNutrition, grams);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 66, 46, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #DCD5C4',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          maxWidth: 480,
          width: '100%',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #DCD5C4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F7F4EC',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#17422E',
                margin: 0,
              }}
            >
              Add to Meal Builder
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#4A5B50' }}>
              {food.name}
              {food.name_amharic ? ` (${food.name_amharic})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#4A5B50',
              padding: 4,
              borderRadius: 6,
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Preparation state selection */}
          {nutritionOptions.length > 1 && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#17422E',
                  marginBottom: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Preparation State
              </label>
              <select
                value={selectedNutritionId}
                onChange={(e) => setSelectedNutritionId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#ffffff',
                  color: '#17422E',
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {nutritionOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.preparation_state} ({opt.calories_kcal} kcal / 100g)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Grams input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#17422E',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Portion Size (grams)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                max={5000}
                value={grams}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 0))}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#ffffff',
                  color: '#17422E',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              />
              <span style={{ fontSize: '0.9rem', color: '#4A5B50', fontWeight: 500 }}>grams</span>
            </div>
            {/* Quick portion buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[50, 100, 150, 200, 300].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGrams(preset)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: 6,
                    border: '1px solid #DCD5C4',
                    backgroundColor: grams === preset ? '#17422E' : '#EFEADC',
                    color: grams === preset ? '#ffffff' : '#17422E',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {preset}g
                </button>
              ))}
            </div>
          </div>

          {/* Live computed nutrition */}
          {computed && selectedNutrition && (
            <div
              style={{
                backgroundColor: '#F7F4EC',
                borderRadius: 10,
                padding: '0.85rem 1rem',
                border: '1px solid #DCD5C4',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#4A5B50', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {selectedNutrition.preparation_state} ({grams} g)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#4A5B50', fontStyle: 'italic' }}>
                  Approximate
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 6, border: '1px solid #DCD5C4' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(computed.calories_kcal, 0)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4A5B50' }}>kcal</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 6, border: '1px solid #DCD5C4' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#C46A3F' }}>
                    {formatNutrient(computed.protein_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4A5B50' }}>Protein</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 6, border: '1px solid #DCD5C4' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(computed.carbohydrates_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4A5B50' }}>Carbs</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: 6, border: '1px solid #DCD5C4' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17422E' }}>
                    {formatNutrient(computed.fat_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4A5B50' }}>Fat</div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={added}
              style={{
                flex: 2,
                backgroundColor: added ? '#2d7a4f' : '#17422E',
              }}
            >
              {added ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to Meal
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

