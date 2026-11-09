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

describe('Food Database & Category AND Filtering', () => {
  it('correctly uses AND logic when multiple category IDs are provided', async () => {
    // Suppose Cat1 (Weight Loss) has foods: ['food-1', 'food-2', 'food-3']
    // Cat2 (High-Protein) has foods: ['food-2', 'food-3', 'food-4']
    // Intersection (AND) should be: ['food-2', 'food-3']
    const cat1Foods = [{ food_id: 'food-1' }, { food_id: 'food-2' }, { food_id: 'food-3' }];
    const cat2Foods = [{ food_id: 'food-2' }, { food_id: 'food-3' }, { food_id: 'food-4' }];

    const mockSelectFoods = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'food-2',
            slug: 'eggs',
            name: 'Eggs',
            food_group: 'Dairy & Eggs',
            food_nutrition: [{ preparation_state: 'Boiled', calories_kcal: 155, protein_g: 12.6 }],
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
        count: 2,
      }),
    });

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === 'food_categories') {
        return {
          select: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation((_col: string, val: string) => {
              if (val === 'cat-1') return Promise.resolve({ data: cat1Foods });
              if (val === 'cat-2') return Promise.resolve({ data: cat2Foods });
              return Promise.resolve({ data: [] });
            }),
          })),
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

    expect(result.foods.length).toBe(2);
    expect(result.foods.map((f) => f.id)).toEqual(['food-2', 'food-3']);
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
});
