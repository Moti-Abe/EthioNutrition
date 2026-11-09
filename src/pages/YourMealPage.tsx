import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  fetchDailyMeals,
  createDailyMeal,
  deleteDailyMeal,
  addDailyMealEntry,
  updateDailyMealEntry,
  deleteDailyMealEntry,
  fetchDailyTarget,
  upsertDailyTarget,
} from '../services/meals';
import { fetchBodyMetrics } from '../services/profiles';
import { searchFoodsForBuilder } from '../services/foods';
import { useAuth } from '../context/AuthContext';
import { calculateTargets } from '../utils/targets';
import { formatNutrient, calculateNutrition } from '../utils/nutrition';
import {
  toLocalDateString,
  formatDisplayDate,
  addDays,
  isFutureDate,
} from '../utils/storage';
import type { DailyMealWithEntries, FoodWithNutrition } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

export default function YourMealPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const todayStr = useMemo(() => toLocalDateString(), []);
  const [currentDate, setCurrentDate] = useState<string>(todayStr);

  // Quick food addition modal
  const [activeModalMeal, setActiveModalMeal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodWithNutrition | null>(null);
  const [selectedNutritionId, setSelectedNutritionId] = useState<string>('');
  const [addGrams, setAddGrams] = useState<number>(100);

  // Fetch daily target
  const { data: dailyTarget, isLoading: loadingTarget } = useQuery({
    queryKey: ['dailyTarget', user?.id, currentDate],
    queryFn: async () => {
      if (!user) return null;
      const target = await fetchDailyTarget(user.id, currentDate);
      if (target) return target;

      // If not yet snapshotted for this day, calculate from body metrics
      const metrics = await fetchBodyMetrics(user.id);
      if (metrics) {
        const computed = calculateTargets(metrics);
        const newTarget = {
          user_id: user.id,
          day: currentDate,
          calories: computed.calories,
          protein_g: computed.protein_g,
          carbs_g: computed.carbs_g,
          fat_g: computed.fat_g,
        };
        await upsertDailyTarget(newTarget);
        return newTarget;
      }
      return null;
    },
    enabled: !!user,
  });

  // Fetch daily meals
  const { data: dailyMeals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['dailyMeals', user?.id, currentDate],
    queryFn: () => (user ? fetchDailyMeals(user.id, currentDate) : Promise.resolve([])),
    enabled: !!user,
  });

  // Autocomplete query for modal
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['foodSearchLog', searchTerm],
    queryFn: () => searchFoodsForBuilder(searchTerm, 8),
    enabled: searchTerm.trim().length >= 2,
  });

  // Compute daily consumed totals
  const consumed = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    for (const meal of dailyMeals) {
      for (const entry of meal.entries || []) {
        if (entry.nutrition) {
          const comp = calculateNutrition(entry.nutrition, entry.grams);
          calories += comp.calories_kcal;
          protein += comp.protein_g;
          carbs += comp.carbohydrates_g;
          fat += comp.fat_g;
          fiber += comp.fiber_g;
        }
      }
    }

    return { calories, protein, carbs, fat, fiber };
  }, [dailyMeals]);

  // Mutations
  const addFoodMutation = useMutation({
    mutationFn: async ({
      mealName,
      foodId,
      nutritionId,
      grams,
    }: {
      mealName: string;
      foodId: string;
      nutritionId: string;
      grams: number;
    }) => {
      if (!user) return;
      let targetMeal = dailyMeals.find((m) => m.meal_name === mealName);
      if (!targetMeal) {
        targetMeal = (await createDailyMeal(user.id, mealName, currentDate)) as DailyMealWithEntries;
      }
      await addDailyMealEntry(targetMeal.id, foodId, nutritionId, grams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyMeals', user?.id, currentDate] });
      setActiveModalMeal(null);
      setSelectedFood(null);
      setSearchTerm('');
      setAddGrams(100);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteDailyMealEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyMeals', user?.id, currentDate] });
    },
  });

  const updateGramsMutation = useMutation({
    mutationFn: ({ entryId, grams }: { entryId: string; grams: number }) =>
      updateDailyMealEntry(entryId, grams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyMeals', user?.id, currentDate] });
    },
  });

  const deleteMealSectionMutation = useMutation({
    mutationFn: (dailyMealId: string) => deleteDailyMeal(dailyMealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyMeals', user?.id, currentDate] });
    },
  });

  // Date Navigation handlers
  const handlePrevDay = () => {
    setCurrentDate((d) => addDays(d, -1));
  };

  const handleNextDay = () => {
    const next = addDays(currentDate, 1);
    if (!isFutureDate(next)) {
      setCurrentDate(next);
    }
  };

  const isToday = currentDate === todayStr;
  const canGoNext = !isFutureDate(addDays(currentDate, 1));

  // Render nutrient progress bar
  const renderProgressBar = (
    label: string,
    consumedVal: number,
    targetVal: number | undefined,
    unit: string,
    color: string
  ) => {
    const hasTarget = typeof targetVal === 'number' && targetVal > 0;
    const remaining = hasTarget ? targetVal - consumedVal : null;
    const percent = hasTarget ? Math.min(100, Math.round((consumedVal / targetVal) * 100)) : 0;
    const isExceeded = hasTarget && consumedVal > targetVal;

    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: '1rem',
          border: '1px solid #DCD5C4',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#17422E' }}>{label}</span>
          <span style={{ fontSize: '0.85rem', color: '#4A5B50' }}>
            {formatNutrient(consumedVal, unit === 'kcal' ? 0 : 1)}
            {hasTarget ? ` / ${formatNutrient(targetVal, unit === 'kcal' ? 0 : 1)}` : ''} {unit}
          </span>
        </div>

        {/* Bar */}
        <div
          style={{
            height: 8,
            backgroundColor: '#EFEADC',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: '0.4rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              backgroundColor: isExceeded ? '#b03535' : color,
              borderRadius: 4,
              transition: 'width 300ms ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4A5B50' }}>
          {hasTarget ? (
            <span>
              {remaining !== null && remaining >= 0 ? (
                <>
                  <strong style={{ color: '#17422E' }}>
                    {formatNutrient(remaining, unit === 'kcal' ? 0 : 1)}
                  </strong>{' '}
                  {unit} remaining
                </>
              ) : (
                <span style={{ color: '#b03535', fontWeight: 600 }}>
                  +{formatNutrient(Math.abs(remaining!), unit === 'kcal' ? 0 : 1)} {unit} over target
                </span>
              )}
            </span>
          ) : (
            <span>No daily target set</span>
          )}
          {hasTarget && <span>{percent}%</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Date Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '0.75rem 1.25rem',
          border: '1px solid #DCD5C4',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={handlePrevDay}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0.5rem 0.85rem',
            minHeight: '40px',
            borderRadius: 8,
            border: '1px solid #DCD5C4',
            backgroundColor: '#F7F4EC',
            color: '#17422E',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={16} /> Previous Day
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <Calendar size={18} color="#C46A3F" />
          <span style={{ fontWeight: 600, color: '#17422E', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
            {formatDisplayDate(currentDate)}
          </span>
          {isToday && (
            <span
              style={{
                backgroundColor: '#17422E',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}
            >
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          disabled={!canGoNext}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0.5rem 0.85rem',
            minHeight: '40px',
            borderRadius: 8,
            border: '1px solid #DCD5C4',
            backgroundColor: '#F7F4EC',
            color: '#17422E',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.4,
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
          title={!canGoNext ? 'Cannot navigate into future dates' : ''}
        >
          Next Day <ChevronRight size={16} />
        </button>
      </div>

      {/* Targets Overview Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 600,
                color: '#17422E',
                margin: 0,
              }}
            >
              Daily Nutrition Progress
            </h1>
            <p style={{ margin: '4px 0 0', color: '#4A5B50', fontSize: '0.9rem' }}>
              Real-time balance of calories and macronutrients for {isToday ? 'today' : currentDate}.
            </p>
          </div>

          {!dailyTarget && !loadingTarget && (
            <Link
              to="/onboarding"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 0.9rem',
                minHeight: '40px',
                backgroundColor: '#C46A3F',
                color: '#ffffff',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <TrendingUp size={14} /> Calculate Targets
            </Link>
          )}
        </div>

        {/* 4 Macro Progress Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '1rem',
          }}
        >
          {renderProgressBar(
            'Calories',
            consumed.calories,
            dailyTarget?.calories,
            'kcal',
            '#17422E'
          )}
          {renderProgressBar('Protein', consumed.protein, dailyTarget?.protein_g, 'g', '#C46A3F')}
          {renderProgressBar(
            'Carbohydrates',
            consumed.carbs,
            dailyTarget?.carbs_g,
            'g',
            '#2d7a4f'
          )}
          {renderProgressBar('Fat', consumed.fat, dailyTarget?.fat_g, 'g', '#b87d2a')}
        </div>
      </div>

      {/* Meals by Category (Breakfast, Lunch, Dinner, Snacks) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#17422E',
              margin: 0,
            }}
          >
            Logged Meals
          </h2>
        </div>

        {loadingMeals ? (
          <LoadingSpinner label="Loading daily meals…" />
        ) : (
          MEAL_TYPES.map((mealType) => {
            const mealGroup = dailyMeals.find((m) => m.meal_name === mealType);
            const entries = mealGroup?.entries || [];

            // Compute section total
            let sectionCals = 0;
            let sectionProtein = 0;
            let sectionCarbs = 0;
            let sectionFat = 0;
            for (const e of entries) {
              if (e.nutrition) {
                const comp = calculateNutrition(e.nutrition, e.grams);
                sectionCals += comp.calories_kcal;
                sectionProtein += comp.protein_g;
                sectionCarbs += comp.carbohydrates_g;
                sectionFat += comp.fat_g;
              }
            }

            return (
              <div
                key={mealType}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #DCD5C4',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(23,66,46,0.04)',
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: '#F7F4EC',
                    borderBottom: '1px solid #DCD5C4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#17422E',
                        margin: 0,
                      }}
                    >
                      {mealType}
                    </h3>
                    {entries.length > 0 && (
                      <span style={{ fontSize: '0.8rem', color: '#4A5B50' }}>
                        {formatNutrient(sectionCals, 0)} kcal • {formatNutrient(sectionProtein, 1)}g P •{' '}
                        {formatNutrient(sectionCarbs, 1)}g C • {formatNutrient(sectionFat, 1)}g F
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalMeal(mealType);
                        setSelectedFood(null);
                        setSearchTerm('');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#17422E',
                        color: '#ffffff',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> Add Food
                    </button>

                    {mealGroup && entries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => deleteMealSectionMutation.mutate(mealGroup.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b03535',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          borderRadius: 6,
                        }}
                        title={`Clear ${mealType}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Entries */}
                {entries.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#4A5B50',
                      fontSize: '0.875rem',
                    }}
                  >
                    No food logged for {mealType}. Click <strong>Add Food</strong> to log.
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem 1.25rem' }}>
                    {entries.map((entry) => {
                      const comp = entry.nutrition
                        ? calculateNutrition(entry.nutrition, entry.grams)
                        : null;
                      return (
                        <div
                          key={entry.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0',
                            borderBottom: '1px solid #EFEADC',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#17422E', fontSize: '0.9rem' }}>
                              {entry.food?.name}
                              {entry.food?.name_amharic && (
                                <span
                                  style={{
                                    fontWeight: 400,
                                    color: '#4A5B50',
                                    fontSize: '0.8rem',
                                    marginLeft: 6,
                                  }}
                                >
                                  ({entry.food.name_amharic})
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#4A5B50' }}>
                              State: {entry.nutrition?.preparation_state}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Gram editor */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input
                                type="number"
                                min={1}
                                max={5000}
                                defaultValue={entry.grams}
                                onBlur={(e) => {
                                  const val = Math.max(1, Number(e.target.value) || 0);
                                  if (val !== entry.grams) {
                                    updateGramsMutation.mutate({ entryId: entry.id, grams: val });
                                  }
                                }}
                                style={{
                                  width: 65,
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: 4,
                                  border: '1px solid #DCD5C4',
                                  backgroundColor: '#F7F4EC',
                                  color: '#17422E',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                }}
                              />
                              <span style={{ fontSize: '0.8rem', color: '#4A5B50' }}>g</span>
                            </div>

                            {/* Macro values */}
                            {comp && (
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  color: '#17422E',
                                  minWidth: 150,
                                  textAlign: 'right',
                                }}
                              >
                                <strong>{formatNutrient(comp.calories_kcal, 0)}</strong> kcal •{' '}
                                <span style={{ color: '#C46A3F', fontWeight: 600 }}>
                                  {formatNutrient(comp.protein_g, 1)}g P
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#b03535',
                                cursor: 'pointer',
                                padding: 4,
                              }}
                              aria-label="Remove entry"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Food Modal */}
      {activeModalMeal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23,66,46,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
          onClick={() => setActiveModalMeal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              border: '1px solid #DCD5C4',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
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
                margin: '0 0 0.25rem',
              }}
            >
              Add Food to {activeModalMeal}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A5B50', margin: '0 0 1rem' }}>
              Search from verified foods and select portion size.
            </p>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food by name or local name…"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 8,
                  border: '1px solid #DCD5C4',
                  backgroundColor: '#F7F4EC',
                  color: '#17422E',
                  fontSize: '0.9rem',
                }}
              />

              {searchTerm.trim().length >= 2 && !selectedFood && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid #DCD5C4',
                    borderRadius: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 4px 16px rgba(23,66,46,0.1)',
                  }}
                >
                  {isSearching ? (
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#4A5B50' }}>
                      Searching…
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#4A5B50' }}>
                      No matches found.
                    </div>
                  ) : (
                    searchResults.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(f);
                          setSelectedNutritionId(f.food_nutrition?.[0]?.id || '');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.6rem 1rem',
                          border: 'none',
                          borderBottom: '1px solid #EFEADC',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                        }}
                        className="hover:bg-[#F7F4EC]"
                      >
                        <div style={{ fontWeight: 600, color: '#17422E', fontSize: '0.85rem' }}>
                          {f.name}
                        </div>
                        {f.name_amharic && (
                          <div style={{ fontSize: '0.75rem', color: '#4A5B50' }}>
                            {f.name_amharic}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Food State & Grams */}
            {selectedFood && (
              <div
                style={{
                  backgroundColor: '#F7F4EC',
                  borderRadius: 10,
                  padding: '1rem',
                  border: '1px solid #DCD5C4',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#17422E', marginBottom: '0.5rem' }}>
                  {selectedFood.name}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Preparation State
                  </label>
                  <select
                    value={selectedNutritionId}
                    onChange={(e) => setSelectedNutritionId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 6,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#ffffff',
                      color: '#17422E',
                      fontSize: '0.85rem',
                    }}
                  >
                    {selectedFood.food_nutrition?.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.preparation_state} ({n.calories_kcal} kcal / 100g)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#17422E',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Grams
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={addGrams}
                    onChange={(e) => setAddGrams(Math.max(1, Number(e.target.value) || 0))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 6,
                      border: '1px solid #DCD5C4',
                      backgroundColor: '#ffffff',
                      color: '#17422E',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="outline"
                onClick={() => setActiveModalMeal(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!selectedFood || addFoodMutation.isPending}
                onClick={() => {
                  if (selectedFood && selectedNutritionId) {
                    addFoodMutation.mutate({
                      mealName: activeModalMeal,
                      foodId: selectedFood.id,
                      nutritionId: selectedNutritionId,
                      grams: addGrams,
                    });
                  }
                }}
                style={{ flex: 1 }}
              >
                {addFoodMutation.isPending ? 'Adding…' : 'Add to Log'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
