import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import { fetchFoods, searchFoodsForBuilder } from '../services/foods';

// Mock supabase client calls
vi.mock('../lib/supabase', () => {
  return {
    isSupabaseConfigured: () => true,
    supabase: {
      from: vi.fn(),
    },
  };
});

describe('Food Database & Multi-Category OR Filtering', () => {
  it('correctly uses OR logic when multiple category IDs are provided', async () => {
    // Suppose Cat1 (High Protein) has foods: ['food-1', 'food-2']
    // Cat2 (Weight Gain) has foods: ['food-2', 'food-3']
    // Union (OR logic): ['food-1', 'food-2', 'food-3']
    const combinedFoods = [
      { food_id: 'food-1' },
      { food_id: 'food-2' },
      { food_id: 'food-3' },
    ];

    const mockSelectFoods = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'food-1',
            slug: 'eggs',
            name: 'Eggs',
            food_group: 'Dairy & Eggs',
            food_nutrition: [{ preparation_state: 'Boiled', calories_kcal: 155, protein_g: 12.6 }],
          },
          {
            id: 'food-2',
            slug: 'lentils',
            name: 'Lentils',
            food_group: 'Legumes & Pulses',
            food_nutrition: [{ preparation_state: 'Boiled', calories_kcal: 116, protein_g: 9.0 }],
          },
          {
            id: 'food-3',
            slug: 'chicken-breast',
            name: 'Chicken Breast',
            food_group: 'Poultry & Meat Dishes',
            food_nutrition: [{ preparation_state: 'Grilled', calories_kcal: 165, protein_g: 31.0 }],
          },
        ],
        error: null,
        count: 3,
      }),
    });

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === 'food_categories') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: combinedFoods, error: null }),
          }),
        };
      }
      if (table === 'foods') {
        return {
          select: mockSelectFoods,
        };
      }
      return { select: vi.fn() };
    }) as never);

    const result = await fetchFoods({
      categoryIds: ['cat-1', 'cat-2'],
      page: 1,
      pageSize: 24,
    });

    expect(result.foods.length).toBe(3);
    expect(result.foods.map((f) => f.id)).toEqual(['food-1', 'food-2', 'food-3']);
  });

  it('searches foods by alias and returns matching foods', async () => {
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === 'food_aliases') {
        return {
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockResolvedValue({
              data: [{ food_id: 'food-1' }],
            }),
          }),
        };
      }
      if (table === 'foods') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            or: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'food-1',
                  slug: 'injera',
                  name: 'Injera',
                  name_amharic: 'እንጀራ',
                  food_nutrition: [{ preparation_state: 'Baked' }],
                },
              ],
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn() };
    }) as never);

    const results = await searchFoodsForBuilder('Enjera', 5);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Injera');
  });

  it('fetches the 4 designated filter categories', async () => {
    const { fetchCategories } = await import('../services/categories');
    const categories = await fetchCategories();
    expect(categories.length).toBe(4);
    const names = categories.map((c) => c.name);
    expect(names).toContain('High Protein');
    expect(names).toContain('Weight Gain');
    expect(names).toContain('Weight Loss');
    expect(names).toContain('Fasting Food (Yetsom)');
  });

  it('verifies multi-category OR logic and combinations with seed data fallback', async () => {
    // When Supabase errors or returns null, local filter fallback executes
    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === 'food_categories') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: null, error: new Error('network down') }),
          }),
        };
      }
      return { select: vi.fn() };
    }) as never);

    const HP_ID = 'c0000001-0000-0000-0000-000000000001';
    const WG_ID = 'c0000002-0000-0000-0000-000000000002';
    const WL_ID = 'c0000003-0000-0000-0000-000000000003';
    const FASTING_ID = 'c0000005-0000-0000-0000-000000000005';

    // 1. Single category: High Protein
    const hpResult = await fetchFoods({ categoryIds: [HP_ID], pageSize: 100 });
    const hpNames = hpResult.foods.map((f) => f.name);
    expect(hpNames).toContain('Eggs');
    expect(hpNames).toContain('Chicken Breast');
    expect(hpNames).toContain('Lentils');
    expect(hpNames).not.toContain('Avocados'); // Avocados is not high protein

    // 2. Single category: Weight Gain
    const wgResult = await fetchFoods({ categoryIds: [WG_ID], pageSize: 100 });
    const wgNames = wgResult.foods.map((f) => f.name);
    expect(wgNames).toContain('Avocados');
    expect(wgNames).toContain('Eggs');
    expect(wgNames).toContain('Chickpeas');

    // 3. Multi-category OR logic: High Protein + Weight Gain
    // Must include union of both (e.g., both Avocados [WG] AND Chicken Breast [HP] AND Eggs [both])
    const hpWgResult = await fetchFoods({ categoryIds: [HP_ID, WG_ID], pageSize: 100 });
    const hpWgNames = hpWgResult.foods.map((f) => f.name);
    expect(hpWgNames).toContain('Avocados');
    expect(hpWgNames).toContain('Chicken Breast');
    expect(hpWgNames).toContain('Eggs');
    expect(hpWgNames).toContain('Lentils');
    expect(hpWgNames).toContain('Chickpeas');
    expect(hpWgResult.foods.length).toBeGreaterThanOrEqual(hpResult.foods.length);
    expect(hpWgResult.foods.length).toBeGreaterThanOrEqual(wgResult.foods.length);

    // 4. Multi-category OR logic: High Protein + Weight Loss
    const hpWlResult = await fetchFoods({ categoryIds: [HP_ID, WL_ID], pageSize: 100 });
    const hpWlNames = hpWlResult.foods.map((f) => f.name);
    expect(hpWlNames).toContain('Chicken Breast');
    expect(hpWlNames).toContain('Injera'); // Weight loss food

    // 5. Fasting Food category
    const fastingResult = await fetchFoods({ categoryIds: [FASTING_ID], pageSize: 100 });
    const fastingNames = fastingResult.foods.map((f) => f.name);
    expect(fastingNames).toContain('Lentils');
    expect(fastingNames).toContain('Chickpeas');
    expect(fastingNames).toContain('Avocados');
    expect(fastingNames).not.toContain('Eggs'); // Fasting does not contain animal products
    expect(fastingNames).not.toContain('Chicken Breast');

    // 6. Search + Category combined filter
    const searchResult = await fetchFoods({ categoryIds: [HP_ID], search: 'egg', pageSize: 100 });
    expect(searchResult.foods.length).toBe(1);
    expect(searchResult.foods[0].name).toBe('Eggs');
  });
});
