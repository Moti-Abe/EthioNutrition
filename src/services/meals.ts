import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Meal,
  MealEntry,
  DailyMeal,
  DailyMealEntry,
  DailyTarget,
  DailyMealWithEntries,
  Food,
  FoodNutrition,
} from '../types';
import { SEED_FOODS } from '../data/seedData';

// Local storage fallback helpers for demo/offline mode
const STORAGE_SAVED_MEALS = 'ethionutrition_saved_meals';
const STORAGE_DAILY_MEALS = 'ethionutrition_daily_meals';
const STORAGE_DAILY_TARGETS = 'ethionutrition_daily_targets';

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

// ─── Saved Meal Templates ────────────────────────────────────────────────────

export async function fetchUserMeals(userId: string): Promise<Meal[]> {
  if (!isSupabaseConfigured()) {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    return all.filter((m) => m.user_id === userId);
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Meal[];
  } catch {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    return all.filter((m) => m.user_id === userId);
  }
}

export async function createMeal(userId: string, name: string): Promise<Meal> {
  const newMeal: Meal = {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    setLocalItem(STORAGE_SAVED_MEALS, [newMeal, ...all]);
    return newMeal;
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .insert({ user_id: userId, name })
      .select()
      .single();
    if (error) throw error;
    return data as Meal;
  } catch {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    setLocalItem(STORAGE_SAVED_MEALS, [newMeal, ...all]);
    return newMeal;
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    setLocalItem(
      STORAGE_SAVED_MEALS,
      all.filter((m) => m.id !== mealId)
    );
    return;
  }

  try {
    const { error } = await supabase.from('meals').delete().eq('id', mealId);
    if (error) throw error;
  } catch {
    const all = getLocalItem<Meal[]>(STORAGE_SAVED_MEALS, []);
    setLocalItem(
      STORAGE_SAVED_MEALS,
      all.filter((m) => m.id !== mealId)
    );
  }
}

export async function addMealEntry(
  mealId: string,
  foodId: string,
  nutritionId: string,
  grams: number
): Promise<MealEntry> {
  const entry: MealEntry = {
    id: `entry_${Date.now()}`,
    meal_id: mealId,
    food_id: foodId,
    nutrition_id: nutritionId,
    grams,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return entry;
  }

  try {
    const { data, error } = await supabase
      .from('meal_entries')
      .insert({ meal_id: mealId, food_id: foodId, nutrition_id: nutritionId, grams })
      .select()
      .single();
    if (error) throw error;
    return data as MealEntry;
  } catch {
    return entry;
  }
}

export async function deleteMealEntry(entryId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('meal_entries').delete().eq('id', entryId);
    if (error) throw error;
  } catch {
    // Fallback ignore
  }
}

// ─── Daily Meals ─────────────────────────────────────────────────────────────

function initializeSampleDailyMeals(userId: string, date: string): DailyMealWithEntries[] {
  const chechebsa = SEED_FOODS.find((f) => f.slug === 'chechebsa');
  const milk = SEED_FOODS.find((f) => f.slug === 'milk');
  const injera = SEED_FOODS.find((f) => f.slug === 'injera');
  const shiro = SEED_FOODS.find((f) => f.slug === 'shiro');
  const gomen = SEED_FOODS.find((f) => f.slug === 'gomen');

  const bMealId = `dm_sample_b_${Date.now()}`;
  const lMealId = `dm_sample_l_${Date.now()}`;

  const breakfastMeal: DailyMealWithEntries = {
    id: bMealId,
    user_id: userId,
    meal_name: 'Breakfast',
    logged_date: date,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    entries: [
      ...(chechebsa && chechebsa.food_nutrition?.[0]
        ? [
            {
              id: 'dme_sample_1',
              daily_meal_id: bMealId,
              food_id: chechebsa.id,
              nutrition_id: chechebsa.food_nutrition[0].id,
              grams: 150,
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              food: chechebsa,
              nutrition: chechebsa.food_nutrition[0],
            },
          ]
        : []),
      ...(milk && milk.food_nutrition?.[0]
        ? [
            {
              id: 'dme_sample_2',
              daily_meal_id: bMealId,
              food_id: milk.id,
              nutrition_id: milk.food_nutrition[0].id,
              grams: 200,
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              food: milk,
              nutrition: milk.food_nutrition[0],
            },
          ]
        : []),
    ],
  };

  const lunchMeal: DailyMealWithEntries = {
    id: lMealId,
    user_id: userId,
    meal_name: 'Lunch',
    logged_date: date,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    entries: [
      ...(injera && injera.food_nutrition?.[0]
        ? [
            {
              id: 'dme_sample_3',
              daily_meal_id: lMealId,
              food_id: injera.id,
              nutrition_id: injera.food_nutrition[0].id,
              grams: 200,
              created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
              food: injera,
              nutrition: injera.food_nutrition[0],
            },
          ]
        : []),
      ...(shiro && shiro.food_nutrition?.[0]
        ? [
            {
              id: 'dme_sample_4',
              daily_meal_id: lMealId,
              food_id: shiro.id,
              nutrition_id: shiro.food_nutrition[0].id,
              grams: 220,
              created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
              food: shiro,
              nutrition: shiro.food_nutrition[0],
            },
          ]
        : []),
      ...(gomen && gomen.food_nutrition?.[0]
        ? [
            {
              id: 'dme_sample_5',
              daily_meal_id: lMealId,
              food_id: gomen.id,
              nutrition_id: gomen.food_nutrition[0].id,
              grams: 120,
              created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
              food: gomen,
              nutrition: gomen.food_nutrition[0],
            },
          ]
        : []),
    ],
  };

  return [breakfastMeal, lunchMeal];
}

export async function fetchDailyMeals(
  userId: string,
  date: string
): Promise<DailyMealWithEntries[]> {
  if (!isSupabaseConfigured()) {
    const raw = localStorage.getItem(STORAGE_DAILY_MEALS);
    if (!raw) {
      const sample = initializeSampleDailyMeals(userId, date);
      setLocalItem(STORAGE_DAILY_MEALS, sample);
      return sample;
    }
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    return allDaily.filter((dm) => dm.user_id === userId && dm.logged_date === date);
  }

  try {
    const { data, error } = await supabase
      .from('daily_meals')
      .select(
        `
        *,
        entries:daily_meal_entries (
          *,
          food:foods (*),
          nutrition:food_nutrition (*)
        )
      `
      )
      .eq('user_id', userId)
      .eq('logged_date', date)
      .order('created_at');
    if (error) throw error;
    return (data ?? []) as DailyMealWithEntries[];
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    return allDaily.filter((dm) => dm.user_id === userId && dm.logged_date === date);
  }
}

export async function createDailyMeal(
  userId: string,
  mealName: string,
  loggedDate: string
): Promise<DailyMeal> {
  const newMeal: DailyMealWithEntries = {
    id: `dm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    meal_name: mealName,
    logged_date: loggedDate,
    created_at: new Date().toISOString(),
    entries: [],
  };

  if (!isSupabaseConfigured()) {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    setLocalItem(STORAGE_DAILY_MEALS, [...allDaily, newMeal]);
    return newMeal;
  }

  try {
    const { data, error } = await supabase
      .from('daily_meals')
      .insert({ user_id: userId, meal_name: mealName, logged_date: loggedDate })
      .select()
      .single();
    if (error) throw error;
    return data as DailyMeal;
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    setLocalItem(STORAGE_DAILY_MEALS, [...allDaily, newMeal]);
    return newMeal;
  }
}

export async function deleteDailyMeal(dailyMealId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    setLocalItem(
      STORAGE_DAILY_MEALS,
      allDaily.filter((dm) => dm.id !== dailyMealId)
    );
    return;
  }

  try {
    const { error } = await supabase.from('daily_meals').delete().eq('id', dailyMealId);
    if (error) throw error;
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    setLocalItem(
      STORAGE_DAILY_MEALS,
      allDaily.filter((dm) => dm.id !== dailyMealId)
    );
  }
}

export async function addDailyMealEntry(
  dailyMealId: string,
  foodId: string,
  nutritionId: string,
  grams: number
): Promise<DailyMealEntry> {
  // Helper to resolve food and nutrition from seed
  const foundFood = SEED_FOODS.find((f) => f.id === foodId);
  const foundNutr = foundFood?.food_nutrition?.find((n) => n.id === nutritionId);

  const localEntry: DailyMealEntry & { food: Food; nutrition: FoodNutrition } = {
    id: `dme_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    daily_meal_id: dailyMealId,
    food_id: foodId,
    nutrition_id: nutritionId,
    grams,
    created_at: new Date().toISOString(),
    food: foundFood as Food,
    nutrition: foundNutr as FoodNutrition,
  };

  if (!isSupabaseConfigured()) {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) =>
      dm.id === dailyMealId ? { ...dm, entries: [...(dm.entries || []), localEntry] } : dm
    );
    setLocalItem(STORAGE_DAILY_MEALS, updated);
    return localEntry;
  }

  try {
    const { data, error } = await supabase
      .from('daily_meal_entries')
      .insert({
        daily_meal_id: dailyMealId,
        food_id: foodId,
        nutrition_id: nutritionId,
        grams,
      })
      .select()
      .single();
    if (error) throw error;
    return data as DailyMealEntry;
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) =>
      dm.id === dailyMealId ? { ...dm, entries: [...(dm.entries || []), localEntry] } : dm
    );
    setLocalItem(STORAGE_DAILY_MEALS, updated);
    return localEntry;
  }
}

export async function updateDailyMealEntry(entryId: string, grams: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) => ({
      ...dm,
      entries: dm.entries?.map((e) => (e.id === entryId ? { ...e, grams } : e)) || [],
    }));
    setLocalItem(STORAGE_DAILY_MEALS, updated);
    return;
  }

  try {
    const { error } = await supabase
      .from('daily_meal_entries')
      .update({ grams })
      .eq('id', entryId);
    if (error) throw error;
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) => ({
      ...dm,
      entries: dm.entries?.map((e) => (e.id === entryId ? { ...e, grams } : e)) || [],
    }));
    setLocalItem(STORAGE_DAILY_MEALS, updated);
  }
}

export async function deleteDailyMealEntry(entryId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) => ({
      ...dm,
      entries: dm.entries?.filter((e) => e.id !== entryId) || [],
    }));
    setLocalItem(STORAGE_DAILY_MEALS, updated);
    return;
  }

  try {
    const { error } = await supabase.from('daily_meal_entries').delete().eq('id', entryId);
    if (error) throw error;
  } catch {
    const allDaily = getLocalItem<DailyMealWithEntries[]>(STORAGE_DAILY_MEALS, []);
    const updated = allDaily.map((dm) => ({
      ...dm,
      entries: dm.entries?.filter((e) => e.id !== entryId) || [],
    }));
    setLocalItem(STORAGE_DAILY_MEALS, updated);
  }
}

// ─── Daily Targets ───────────────────────────────────────────────────────────

export async function fetchDailyTarget(userId: string, day: string): Promise<DailyTarget | null> {
  if (!isSupabaseConfigured()) {
    const targets = getLocalItem<DailyTarget[]>(STORAGE_DAILY_TARGETS, []);
    const existing = targets.find((t) => t.user_id === userId && t.day === day);
    if (existing) return existing;

    const defaultTarget: DailyTarget = {
      user_id: userId,
      day,
      calories: 2150,
      protein_g: 115,
      carbs_g: 275,
      fat_g: 60,
    };
    targets.push(defaultTarget);
    setLocalItem(STORAGE_DAILY_TARGETS, targets);
    return defaultTarget;
  }

  try {
    const { data, error } = await supabase
      .from('daily_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('day', day)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as DailyTarget;
  } catch {
    const targets = getLocalItem<DailyTarget[]>(STORAGE_DAILY_TARGETS, []);
    return targets.find((t) => t.user_id === userId && t.day === day) ?? null;
  }
}

export async function upsertDailyTarget(target: DailyTarget): Promise<void> {
  if (!isSupabaseConfigured()) {
    const targets = getLocalItem<DailyTarget[]>(STORAGE_DAILY_TARGETS, []);
    const existingIndex = targets.findIndex(
      (t) => t.user_id === target.user_id && t.day === target.day
    );
    if (existingIndex >= 0) {
      targets[existingIndex] = target;
    } else {
      targets.push(target);
    }
    setLocalItem(STORAGE_DAILY_TARGETS, targets);
    return;
  }

  try {
    const { error } = await supabase.from('daily_targets').upsert(target, {
      onConflict: 'user_id,day',
    });
    if (error) throw error;
  } catch {
    const targets = getLocalItem<DailyTarget[]>(STORAGE_DAILY_TARGETS, []);
    const existingIndex = targets.findIndex(
      (t) => t.user_id === target.user_id && t.day === target.day
    );
    if (existingIndex >= 0) {
      targets[existingIndex] = target;
    } else {
      targets.push(target);
    }
    setLocalItem(STORAGE_DAILY_TARGETS, targets);
  }
}
