import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Category } from '../types';
import { SEED_CATEGORIES } from '../data/seedData';

export const TARGET_CATEGORY_SLUGS = [
  'high-protein',
  'weight-gain',
  'weight-loss',
  'fasting-foods',
] as const;

/**
 * Fetch the 4 active filter categories:
 * High Protein, Weight Gain, Weight Loss, and Fasting Food (Yetsom).
 */
export async function fetchCategories(): Promise<Category[]> {
  const fallback = SEED_CATEGORIES.filter((c) =>
    (TARGET_CATEGORY_SLUGS as readonly string[]).includes(c.slug)
  );

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );

    const fetchPromise = supabase
      .from('categories')
      .select('*')
      .in('slug', TARGET_CATEGORY_SLUGS as readonly string[])
      .eq('is_active', true)
      .order('sort_order');

    const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
      data: Category[] | null;
      error: Error | null;
    };

    if (result.error) throw result.error;
    if (result.data && result.data.length > 0) {
      return result.data as Category[];
    }
    return fallback;
  } catch (err) {
    console.warn('Failed to fetch categories from Supabase, using seed categories:', err);
    return fallback;
  }
}

