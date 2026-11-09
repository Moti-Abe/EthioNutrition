import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Architecture & Security Policies Verification', () => {
  const schemaPath = path.resolve(__dirname, '../../supabase/migrations/20261105000000_initial_schema.sql');
  const seedPath = path.resolve(__dirname, '../../supabase/seed.sql');

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const seedContent = fs.readFileSync(seedPath, 'utf-8');

  it('defines all 13 required normalized database tables', () => {
    const requiredTables = [
      'public.foods',
      'public.food_nutrition',
      'public.food_aliases',
      'public.categories',
      'public.food_categories',
      'public.classification_rules',
      'public.profiles',
      'public.body_metrics',
      'public.daily_targets',
      'public.meals',
      'public.meal_entries',
      'public.daily_meals',
      'public.daily_meal_entries',
    ];

    for (const table of requiredTables) {
      expect(schemaContent).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('enables Row Level Security on all 13 tables', () => {
    const tables = [
      'public.foods',
      'public.food_nutrition',
      'public.food_aliases',
      'public.categories',
      'public.food_categories',
      'public.classification_rules',
      'public.profiles',
      'public.body_metrics',
      'public.daily_targets',
      'public.meals',
      'public.meal_entries',
      'public.daily_meals',
      'public.daily_meal_entries',
    ];

    for (const table of tables) {
      expect(schemaContent).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('does NOT permit client-side writes to food catalog tables (Administrator exclusive)', () => {
    // There must be no frontend INSERT / UPDATE / DELETE policies for foods, food_nutrition, categories, etc.
    const forbiddenPolicies = [
      'ON public.foods FOR INSERT',
      'ON public.foods FOR UPDATE',
      'ON public.foods FOR DELETE',
      'ON public.food_nutrition FOR INSERT',
      'ON public.food_nutrition FOR UPDATE',
      'ON public.food_nutrition FOR DELETE',
      'ON public.categories FOR INSERT',
      'ON public.categories FOR UPDATE',
      'ON public.categories FOR DELETE',
      'ON public.classification_rules FOR INSERT',
    ];

    for (const pattern of forbiddenPolicies) {
      expect(schemaContent).not.toContain(pattern);
    }
  });

  it('grants user isolation policies for daily meals, meals, and targets', () => {
    expect(schemaContent).toContain('ON public.daily_meals FOR SELECT');
    expect(schemaContent).toContain('ON public.daily_meals FOR INSERT');
    expect(schemaContent).toContain('ON public.daily_targets FOR SELECT');
    expect(schemaContent).toContain('ON public.daily_targets FOR INSERT');
    expect(schemaContent).toContain('ON public.meals FOR SELECT');
    expect(schemaContent).toContain('ON public.meals FOR INSERT');
  });

  it('contains all 25+ representative foods in the seed dataset', () => {
    const requiredFoods = [
      'Injera',
      'Shiro',
      'Misir Wot',
      'Doro Wot',
      'Tibs',
      'Kitfo',
      'Gomen',
      'Kinche',
      'Chechebsa',
      'Firfir',
      'Besso',
      'Nifro',
      'Teff',
      'Chickpeas',
      'Lentils',
      'Eggs',
      'Milk',
      'Yogurt',
      'Rice',
      'Potatoes',
      'Bananas',
      'Avocados',
      'Peanuts',
      'Chicken Breast',
      'Lean Beef',
      'Pasta',
      'Bread',
    ];

    for (const food of requiredFoods) {
      expect(seedContent).toContain(`'${food}'`);
    }
  });
});

