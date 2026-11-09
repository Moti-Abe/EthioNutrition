import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  BookmarkPlus,
  CalendarPlus,
  AlertCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { searchFoodsForBuilder } from '../services/foods';
import { createMeal, addMealEntry, createDailyMeal, addDailyMealEntry } from '../services/meals';
import { useMealBuilder } from '../context/MealBuilderContext';
import { useAuth } from '../context/AuthContext';
import { formatNutrient, sumNutrition } from '../utils/nutrition';
import { toLocalDateString } from '../utils/storage';
import { SEED_FOODS } from '../data/seedData';
import type { FoodWithNutrition } from '../types';
import Button from '../components/ui/Button';

const POPULAR_SLUGS = ['injera', 'shiro', 'doro-wot', 'beef-tibs', 'eggs', 'chechebsa', 'lentils', 'kinche'];

export default function BuildMealPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, addItem, removeItem, updateGrams, setName, clear } = useMealBuilder();

  // Food search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodWithNutrition | null>(null);
  const [selectedNutritionId, setSelectedNutritionId] = useState<string>('');
  const [gramsInput, setGramsInput] = useState<number>(100);

  // Meal save state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [mealNameInput, setMealNameInput] = useState(state.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Daily log state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  // Autocomplete query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['foodSearchBuilder', searchTerm],
    queryFn: () => searchFoodsForBuilder(searchTerm, 8),
    enabled: searchTerm.trim().length >= 2,
  });

  // Calculate totals
  const computedList = state.items.map((i) => i.computed);
  const totals = sumNutrition(computedList);
  const totalGrams = state.items.reduce((acc, i) => acc + i.grams, 0);

  const handleSelectFood = (food: FoodWithNutrition) => {
    setSelectedFood(food);
    const firstNutrition = food.food_nutrition?.[0];
    setSelectedNutritionId(firstNutrition?.id || '');
    setGramsInput(100);
    setSearchTerm('');
  };

  const handleAddSelectedFood = () => {
    if (!selectedFood) return;
    const nutrition =
      selectedFood.food_nutrition?.find((n) => n.id === selectedNutritionId) ||
      selectedFood.food_nutrition?.[0];
    if (!nutrition || gramsInput <= 0) return;

    addItem(selectedFood, nutrition, gramsInput);
    setSelectedFood(null);
    setSelectedNutritionId('');
    setGramsInput(100);
  };

  const handleSaveMealTemplate = async () => {
    if (!user) {
      navigate('/auth?redirect=/build');
      return;
    }
    if (!mealNameInput.trim()) {
      setSaveError('Please give your meal a name.');
      return;
    }
    if (state.items.length === 0) {
      setSaveError('Add at least one food before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const meal = await createMeal(user.id, mealNameInput.trim());
      for (const item of state.items) {
        await addMealEntry(meal.id, item.food.id, item.nutrition.id, item.grams);
      }
      setName(mealNameInput.trim());
      setSaveSuccess(`"${mealNameInput.trim()}" saved to your meals!`);
      setTimeout(() => {
        setSaveModalOpen(false);
        setSaveSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save meal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogToToday = async () => {
    if (!user) {
      navigate('/auth?redirect=/build');
      return;
    }
    if (state.items.length === 0) return;

    setIsLogging(true);
    try {
      const today = toLocalDateString();
      const dailyMeal = await createDailyMeal(user.id, selectedMealType, today);
      for (const item of state.items) {
        await addDailyMealEntry(dailyMeal.id, item.food.id, item.nutrition.id, item.grams);
      }
      setLogSuccess(`Logged to today's ${selectedMealType}!`);
      setTimeout(() => {
        setLogModalOpen(false);
        setLogSuccess(null);
        navigate('/meal');
      }, 1000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to log meal.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 600,
            color: '#17422E',
            margin: '0 0 0.5rem',
          }}
        >
          Build a Meal
        </h1>
        <p style={{ color: '#4A5B50', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', margin: 0 }}>
          Compose your dish with accurate portion sizes, see real-time nutritional totals, and save
          or log your intake.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Food Search & Add */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            border: '1px solid #DCD5C4',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            boxShadow: '0 1px 3px rgba(23,66,46,0.04)',
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#17422E',
              margin: '0 0 1rem',
            }}
          >
            Add Food
          </h2>

          {/* Autocomplete Search input */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#17422E',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Search by Food Name or Local Name
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4A5B50',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Injera, Shiro, Teff, Tibs, Lentils…"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.25rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#F7F4EC',
                  color: '#17422E',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Dropdown Suggestions */}
            {searchTerm.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #DCD5C4',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(23,66,46,0.1)',
                  zIndex: 20,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {isSearching ? (
                  <div style={{ padding: '0.75rem 1rem', color: '#4A5B50', fontSize: '0.85rem' }}>
                    Searching food catalog…
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', color: '#4A5B50', fontSize: '0.85rem' }}>
                    No foods found matching "{searchTerm}".
                  </div>
                ) : (
                  searchResults.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFood(f)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderBottom: '1px solid #EFEADC',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      className="hover:bg-[#F7F4EC]"
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#17422E', fontSize: '0.9rem' }}>
                          {f.name}
                        </div>
                        {f.name_amharic && (
                          <div style={{ fontSize: '0.75rem', color: '#4A5B50' }}>
                            {f.name_amharic}
                            {f.name_afaan_oromo ? ` • ${f.name_afaan_oromo}` : ''}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#C46A3F',
                          fontWeight: 500,
                          backgroundColor: '#F7F4EC',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {f.food_group}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Quick Add Ethiopian Staples when no search is active */}
            {searchTerm.trim().length === 0 && !selectedFood && (
              <div style={{ marginTop: '0.85rem' }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#4A5B50',
                    marginBottom: '0.45rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Quick Add Ethiopian Staples:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {SEED_FOODS.filter((f) => POPULAR_SLUGS.includes(f.slug)).slice(0, 6).map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: '1px solid #DCD5C4',
                        backgroundColor: '#ffffff',
                        color: '#17422E',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[#17422E] hover:bg-[#F7F4EC]"
                    >
                      <span style={{ color: '#C46A3F', fontWeight: 700 }}>+</span>
                      <span>{food.name}</span>
                      {food.name_amharic && (
                        <span style={{ color: '#4A5B50', fontSize: '0.72rem' }}>({food.name_amharic})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Food Configuration Box */}
          {selectedFood ? (
            <div
              style={{
                backgroundColor: '#F7F4EC',
                borderRadius: 10,
                padding: '1.25rem',
                border: '1px solid #DCD5C4',
                marginTop: '1rem',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#17422E',
                        margin: 0,
                      }}
                    >
                      {selectedFood.name}
                    </h3>
                    {selectedFood.name_amharic && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4A5B50' }}>
                        {selectedFood.name_amharic}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedFood(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4A5B50',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Preparation state selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Preparation State
                </label>
                <select
                  value={selectedNutritionId}
                  onChange={(e) => setSelectedNutritionId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 6,
                    border: '1px solid #DCD5C4',
                    backgroundColor: '#ffffff',
                    color: '#17422E',
                    fontSize: '0.875rem',
                  }}
                >
                  {selectedFood.food_nutrition?.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.preparation_state} — {n.calories_kcal} kcal / 100g
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity in grams */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#17422E',
                    marginBottom: '0.35rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Quantity (grams)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={gramsInput}
                    onChange={(e) => setGramsInput(Math.max(1, Number(e.target.value) || 0))}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: 6,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#ffffff',
                      color: '#17422E',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#4A5B50' }}>g</span>
                </div>
                {/* Quick gram buttons */}
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[50, 100, 150, 200, 250, 300].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGramsInput(preset)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        minHeight: '36px',
                        borderRadius: 4,
                        border: '1px solid #DCD5C4',
                        backgroundColor: gramsInput === preset ? '#17422E' : '#ffffff',
                        color: gramsInput === preset ? '#ffffff' : '#17422E',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {preset}g
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleAddSelectedFood}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 6 }}
              >
                <Plus size={16} /> Add to Meal
              </Button>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed #DCD5C4',
                borderRadius: 10,
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: '#4A5B50',
                fontSize: '0.875rem',
              }}
            >
              Search above and pick a food to choose preparation state and portion size.
            </div>
          )}
        </div>

        {/* Right Column: Meal Items & Nutritional Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Items Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
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
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#17422E',
                    margin: 0,
                  }}
                >
                  Current Meal Items
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#4A5B50' }}>
                  {state.items.length} {state.items.length === 1 ? 'item' : 'items'} • {totalGrams}g
                  total
                </span>
              </div>
              {state.items.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    color: '#b03535',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={14} /> Clear All
                </button>
              )}
            </div>

            {state.items.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#4A5B50',
                }}
              >
                <p style={{ margin: 0, fontWeight: 500 }}>Your meal is empty.</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                  Search and add foods on the left to start calculating your meal's nutrition.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {state.items.map((item) => (
                  <div
                    key={item.tempId}
                    style={{
                      border: '1px solid #DCD5C4',
                      borderRadius: 10,
                      padding: '0.85rem 1rem',
                      backgroundColor: '#F7F4EC',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#17422E', fontSize: '0.95rem' }}>
                          {item.food.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#4A5B50' }}>
                          State: {item.nutrition.preparation_state}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.tempId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b03535',
                          cursor: 'pointer',
                          padding: 4,
                        }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quantity modifier and nutrient summary */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #EFEADC',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#4A5B50' }}>Portion:</span>
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          value={item.grams}
                          onChange={(e) =>
                            updateGrams(item.tempId, Math.max(1, Number(e.target.value) || 0))
                          }
                          style={{
                            width: 70,
                            padding: '0.25rem 0.4rem',
                            borderRadius: 4,
                            border: '1px solid #DCD5C4',
                            backgroundColor: '#ffffff',
                            color: '#17422E',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#4A5B50' }}>g</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#17422E',
                        }}
                      >
                        <span>
                          <strong>{formatNutrient(item.computed.calories_kcal, 0)}</strong> kcal
                        </span>
                        <span>
                          <strong>{formatNutrient(item.computed.protein_g, 1)}</strong>g P
                        </span>
                        <span>
                          <strong>{formatNutrient(item.computed.carbohydrates_g, 1)}</strong>g C
                        </span>
                        <span>
                          <strong>{formatNutrient(item.computed.fat_g, 1)}</strong>g F
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Ethiopian Staples when no search is active */}
            {searchTerm.trim().length === 0 && !selectedFood && (
              <div style={{ marginTop: '0.85rem' }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#4A5B50',
                    marginBottom: '0.45rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Quick Add Ethiopian Staples:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {SEED_FOODS.filter((f) => POPULAR_SLUGS.includes(f.slug)).slice(0, 6).map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: '1px solid #DCD5C4',
                        backgroundColor: '#ffffff',
                        color: '#17422E',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[#17422E] hover:bg-[#F7F4EC]"
                    >
                      <span style={{ color: '#C46A3F', fontWeight: 700 }}>+</span>
                      <span>{food.name}</span>
                      {food.name_amharic && (
                        <span style={{ color: '#4A5B50', fontSize: '0.72rem' }}>({food.name_amharic})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Totals & Action Card */}
          {state.items.length > 0 && (
            <div
              style={{
                backgroundColor: '#17422E',
                color: '#ffffff',
                borderRadius: 14,
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                boxShadow: '0 4px 16px rgba(23,66,46,0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                    fontWeight: 600,
                    margin: 0,
                    color: '#ffffff',
                  }}
                >
                  Meal Total Nutrition
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  {totalGrams} grams total
                </span>
              </div>

              {/* Big 4 Macro Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 65px), 1fr))',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '0.65rem 0.35rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 700, color: '#ffffff' }}>
                    {formatNutrient(totals.calories_kcal, 0)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Calories</div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '0.65rem 0.35rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 700, color: '#e8956a' }}>
                    {formatNutrient(totals.protein_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Protein</div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '0.65rem 0.35rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 700, color: '#ffffff' }}>
                    {formatNutrient(totals.carbohydrates_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Carbs</div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '0.65rem 0.35rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: 700, color: '#ffffff' }}>
                    {formatNutrient(totals.fat_g, 1)}g
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Fat</div>
                </div>
              </div>

              {/* Additional Nutrients */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '0.5rem 0',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.85)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span>Fiber: {formatNutrient(totals.fiber_g, 1)}g</span>
                <span>Sodium: {formatNutrient(totals.sodium_mg, 0)}mg</span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(true)}
                  style={{
                    flex: '1 1 180px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0.65rem 1rem',
                    backgroundColor: '#C46A3F',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <BookmarkPlus size={16} /> Save Meal Template
                </button>

                <button
                  type="button"
                  onClick={() => setLogModalOpen(true)}
                  style={{
                    flex: '1 1 180px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0.65rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <CalendarPlus size={16} /> Log to Today
                </button>
              </div>

              {!user && (
                <p
                  style={{
                    margin: '0.75rem 0 0',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.65)',
                    textAlign: 'center',
                  }}
                >
                  Draft saved locally. <Link to="/auth?redirect=/build" style={{ color: '#e8956a' }}>Sign in</Link> to permanently save your meals or track daily targets.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Meal Template Modal */}
      {saveModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23,66,46,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              maxWidth: 420,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #DCD5C4',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#17422E',
                margin: '0 0 0.5rem',
              }}
            >
              Save Meal Template
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A5B50', margin: '0 0 1rem' }}>
              Give this combination a name so you can reuse or log it anytime.
            </p>

            {saveError && (
              <div
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#fbeaea',
                  color: '#b03535',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AlertCircle size={14} /> {saveError}
              </div>
            )}

            {saveSuccess ? (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#d1f5e0',
                  color: '#1a6633',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                <Check size={16} /> {saveSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={mealNameInput}
                    onChange={(e) => setMealNameInput(e.target.value)}
                    placeholder="e.g. Injera with Shiro & Gomen"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 6,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#F7F4EC',
                      color: '#17422E',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    variant="outline"
                    onClick={() => setSaveModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveMealTemplate}
                    disabled={isSaving}
                    style={{ flex: 1 }}
                  >
                    {isSaving ? 'Saving…' : 'Save Meal'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Log to Today Modal */}
      {logModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23,66,46,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
          onClick={() => setLogModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              maxWidth: 420,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #DCD5C4',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#17422E',
                margin: '0 0 0.5rem',
              }}
            >
              Log to Today's Meals
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A5B50', margin: '0 0 1rem' }}>
              Select which meal category to record this intake under for today.
            </p>

            {logSuccess ? (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#d1f5e0',
                  color: '#1a6633',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                <Check size={16} /> {logSuccess}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedMealType(type)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 8,
                        border: '1px solid #DCD5C4',
                        backgroundColor: selectedMealType === type ? '#17422E' : '#F7F4EC',
                        color: selectedMealType === type ? '#ffffff' : '#17422E',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    variant="outline"
                    onClick={() => setLogModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleLogToToday}
                    disabled={isLogging}
                    style={{ flex: 1 }}
                  >
                    {isLogging ? 'Logging…' : 'Confirm'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
