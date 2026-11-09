import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Food, FoodNutrition, FoodWithNutrition, FoodFilters } from '../types';
import { SEED_FOODS, SEED_FOOD_CATEGORIES, SEED_ALIASES } from '../data/seedData';

// Helper for local mock filtering
function filterLocalFoods(filters: Partial<FoodFilters> = {}): {
  foods: FoodWithNutrition[];
  total: number;
} {
  const {
    search = '',
    categoryIds = [],
    foodGroup = '',
    sortBy = 'name',
    sortDir = 'asc',
    page = 1,
    pageSize = 24,
  } = filters;

  let results = [...SEED_FOODS];

  // Food Group filter
  if (foodGroup) {
    results = results.filter((f) => f.food_group === foodGroup);
  }

  // Category filter with OR logic (food matches if it belongs to ANY selected category)
  if (categoryIds.length > 0) {
    results = results.filter((f) => {
      const foodCatIds = new Set(
        SEED_FOOD_CATEGORIES.filter((fc) => fc.food_id === f.id).map((fc) => fc.category_id)
      );
      // Must contain at least one selected category (OR logic)
      return categoryIds.some((cid) => foodCatIds.has(cid));
    });
  }

  // Search filter across name, Amharic name, Afaan Oromo name, and aliases
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter((f) => {
      const nameMatch = f.name.toLowerCase().includes(q);
      const amharicMatch = f.name_amharic?.toLowerCase().includes(q);
      const oromoMatch = f.name_afaan_oromo?.toLowerCase().includes(q);
      const aliasMatch = SEED_ALIASES.some(
        (a) => a.food_id === f.id && a.alias.toLowerCase().includes(q)
      );
      return nameMatch || amharicMatch || oromoMatch || aliasMatch;
    });
  }

  // Sorting
  results.sort((a, b) => {
    let comparison: number;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else {
      const aVal = a.food_nutrition?.[0]?.[`${sortBy}_g` as keyof FoodNutrition] ?? 0;
      const bVal = b.food_nutrition?.[0]?.[`${sortBy}_g` as keyof FoodNutrition] ?? 0;
      comparison = (Number(aVal) || 0) - (Number(bVal) || 0);
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const total = results.length;
  const from = (page - 1) * pageSize;
  const paginated = results.slice(from, from + pageSize);

  return { foods: paginated, total };
}

/** Fetch a paginated list of foods with their nutrition data, applying filters. */
export async function fetchFoods(filters: Partial<FoodFilters> = {}): Promise<{
  foods: FoodWithNutrition[];
  total: number;
}> {
  if (!isSupabaseConfigured()) {
    return filterLocalFoods(filters);
  }

  try {
    const {
      search = '',
      categoryIds = [],
      foodGroup = '',
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      pageSize = 24,
    } = filters;

    // If filtering by categories (OR logic), get food IDs belonging to at least one selected category
    let allowedFoodIds: string[] | null = null;
    if (categoryIds.length > 0) {
      const { data: catRows, error: catError } = await supabase
        .from('food_categories')
        .select('food_id')
        .in('category_id', categoryIds);

      if (catError) {
        console.warn('Failed to query food_categories:', catError);
        return filterLocalFoods(filters);
      }

      const matchingIds = Array.from(
        new Set((catRows ?? []).map((r: { food_id: string }) => r.food_id))
      );
      allowedFoodIds = matchingIds;
      if (allowedFoodIds.length === 0) {
        return { foods: [], total: 0 };
      }
    }

    // If search is provided, also check aliases
    let searchFoodIds: string[] | null = null;
    if (search.trim()) {
      const { data: aliasData } = await supabase
        .from('food_aliases')
        .select('food_id')
        .ilike('alias', `%${search.trim()}%`);
      const aliasIds = (aliasData ?? []).map((r: { food_id: string }) => r.food_id);
      searchFoodIds = aliasIds;
    }

    // Build main foods query
    let query = supabase
      .from('foods')
      .select('*, food_nutrition (*)', { count: 'exact' })
      .eq('is_active', true);

    if (foodGroup) {
      query = query.eq('food_group', foodGroup);
    }

    if (allowedFoodIds !== null) {
      query = query.in('id', allowedFoodIds);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      if (searchFoodIds && searchFoodIds.length > 0) {
        query = query.or(
          `name.ilike.${term},name_amharic.ilike.${term},name_afaan_oromo.ilike.${term},id.in.(${searchFoodIds.join(',')})`
        );
      } else {
        query = query.or(
          `name.ilike.${term},name_amharic.ilike.${term},name_afaan_oromo.ilike.${term}`
        );
      }
    }

    query = query.order(sortBy === 'name' ? 'name' : 'name', { ascending: sortDir === 'asc' });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      foods: (data ?? []) as FoodWithNutrition[],
      total: count ?? 0,
    };
  } catch (err) {
    // If Supabase request fails (e.g. database unmigrated or network error), fallback to seed data
    console.warn('Supabase fetchFoods failed, falling back to local seed data:', err);
    return filterLocalFoods(filters);
  }
}

/** Fetch a single food by slug, including all nutrition records. */
export async function fetchFoodBySlug(slug: string): Promise<FoodWithNutrition | null> {
  if (!isSupabaseConfigured()) {
    return SEED_FOODS.find((f) => f.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*, food_nutrition (*), food_categories (categories (*))')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as FoodWithNutrition;
  } catch {
    return SEED_FOODS.find((f) => f.slug === slug) ?? null;
  }
}

/** Fetch a food by ID. */
export async function fetchFoodById(id: string): Promise<Food | null> {
  if (!isSupabaseConfigured()) {
    return SEED_FOODS.find((f) => f.id === id) ?? null;
  }

  try {
    const { data, error } = await supabase.from('foods').select('*').eq('id', id).single();
    if (error) return null;
    return data as Food;
  } catch {
    return SEED_FOODS.find((f) => f.id === id) ?? null;
  }
}

/** Fetch a nutrition record by ID. */
export async function fetchNutritionById(id: string): Promise<FoodNutrition | null> {
  if (!isSupabaseConfigured()) {
    for (const f of SEED_FOODS) {
      const match = f.food_nutrition?.find((n) => n.id === id);
      if (match) return match;
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('food_nutrition')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as FoodNutrition;
  } catch {
    for (const f of SEED_FOODS) {
      const match = f.food_nutrition?.find((n) => n.id === id);
      if (match) return match;
    }
    return null;
  }
}

/** Fetch all distinct food groups. */
export async function fetchFoodGroups(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    const groups = [...new Set(SEED_FOODS.map((f) => f.food_group))];
    return groups.filter(Boolean);
  }

  try {
    const { data, error } = await supabase
      .from('foods')
      .select('food_group')
      .eq('is_active', true)
      .order('food_group');
    if (error) throw error;
    const groups = [...new Set((data ?? []).map((r: { food_group: string }) => r.food_group))];
    return groups.filter(Boolean);
  } catch {
    const groups = [...new Set(SEED_FOODS.map((f) => f.food_group))];
    return groups.filter(Boolean);
  }
}

/** Search foods by name/alias for the meal builder autocomplete. */
export async function searchFoodsForBuilder(
  term: string,
  limit = 10
): Promise<FoodWithNutrition[]> {
  if (!term.trim()) return [];

  if (!isSupabaseConfigured()) {
    const q = term.trim().toLowerCase();
    const matched = SEED_FOODS.filter((f) => {
      const nameMatch = f.name.toLowerCase().includes(q);
      const amharicMatch = f.name_amharic?.toLowerCase().includes(q);
      const oromoMatch = f.name_afaan_oromo?.toLowerCase().includes(q);
      const aliasMatch = SEED_ALIASES.some(
        (a) => a.food_id === f.id && a.alias.toLowerCase().includes(q)
      );
      return nameMatch || amharicMatch || oromoMatch || aliasMatch;
    });
    return matched.slice(0, limit);
  }

  try {
    const q = `%${term.trim()}%`;
    const { data: aliasData } = await supabase
      .from('food_aliases')
      .select('food_id')
      .ilike('alias', q);
    const aliasIds = (aliasData ?? []).map((r: { food_id: string }) => r.food_id);

    let query = supabase
      .from('foods')
      .select('*, food_nutrition(*)')
      .eq('is_active', true)
      .order('name')
      .limit(limit);

    if (aliasIds.length > 0) {
      query = query.or(
        `name.ilike.${q},name_amharic.ilike.${q},name_afaan_oromo.ilike.${q},id.in.(${aliasIds.join(',')})`
      );
    } else {
      query = query.or(
        `name.ilike.${q},name_amharic.ilike.${q},name_afaan_oromo.ilike.${q}`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as FoodWithNutrition[];
  } catch {
    const q = term.trim().toLowerCase();
    const matched = SEED_FOODS.filter((f) => {
      const nameMatch = f.name.toLowerCase().includes(q);
      const amharicMatch = f.name_amharic?.toLowerCase().includes(q);
      const oromoMatch = f.name_afaan_oromo?.toLowerCase().includes(q);
      const aliasMatch = SEED_ALIASES.some(
        (a) => a.food_id === f.id && a.alias.toLowerCase().includes(q)
      );
      return nameMatch || amharicMatch || oromoMatch || aliasMatch;
    });
    return matched.slice(0, limit);
  }
}
