import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Category } from '../types';
import { SEED_CATEGORIES, SEED_FOOD_CATEGORIES } from '../data/seedData';

/** Fetch all active categories, ordered by sort_order. */
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return SEED_CATEGORIES;
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000)
    );
    const fetchPromise = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
      data: Category[] | null;
      error: Error | null;
    };
    if (result.error) throw result.error;
    return (result.data ?? []) as Category[];
  } catch {
    return SEED_CATEGORIES;
  }
}

/** Fetch a single category by slug. */
export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    return SEED_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Category;
  } catch {
    return SEED_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
}

/** Count foods in a given category. */
export async function countFoodsInCategory(categoryId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return SEED_FOOD_CATEGORIES.filter((fc) => fc.category_id === categoryId).length;
  }

  try {
    const { count, error } = await supabase
      .from('food_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    if (error) return SEED_FOOD_CATEGORIES.filter((fc) => fc.category_id === categoryId).length;
    return count ?? 0;
  } catch {
    return SEED_FOOD_CATEGORIES.filter((fc) => fc.category_id === categoryId).length;
  }
}
