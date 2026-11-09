import { describe, it, expect } from 'vitest';
import {
  calculateNutrition,
  sumNutrition,
  roundForDisplay,
  formatNutrient,
} from '../utils/nutrition';
import type { FoodNutrition } from '../types';

describe('Nutrition Utility (per 100g calculations)', () => {
  const mockNutrition: FoodNutrition = {
    id: 'n1',
    food_id: 'f1',
    preparation_state: 'Cooked stew',
    calories_kcal: 350,
    protein_g: 20,
    carbohydrates_g: 50,
    fat_g: 10,
    fiber_g: 8,
    sodium_mg: 300,
    source_name: 'Test Source',
    source_reference: 'Ref 1',
    verification_status: 'verified',
    notes: 'Standard test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('calculates exact values for 100g without modification', () => {
    const result = calculateNutrition(mockNutrition, 100);
    expect(result.calories_kcal).toBe(350);
    expect(result.protein_g).toBe(20);
    expect(result.carbohydrates_g).toBe(50);
    expect(result.fat_g).toBe(10);
    expect(result.fiber_g).toBe(8);
    expect(result.sodium_mg).toBe(300);
  });

  it('calculates scaled values correctly for 150g (prompt example: 350->525, 20->30)', () => {
    const result = calculateNutrition(mockNutrition, 150);
    expect(result.calories_kcal).toBe(525);
    expect(result.protein_g).toBe(30);
    expect(result.carbohydrates_g).toBe(75);
    expect(result.fat_g).toBe(15);
    expect(result.fiber_g).toBe(12);
    expect(result.sodium_mg).toBe(450);
  });

  it('calculates scaled values for 50g', () => {
    const result = calculateNutrition(mockNutrition, 50);
    expect(result.calories_kcal).toBe(175);
    expect(result.protein_g).toBe(10);
    expect(result.carbohydrates_g).toBe(25);
    expect(result.fat_g).toBe(5);
  });

  it('preserves floating point precision during intermediate calculations', () => {
    const result = calculateNutrition(mockNutrition, 33.33);
    // 350 * 0.3333 = 116.655
    expect(result.calories_kcal).toBeCloseTo(116.655, 2);
    // Not prematurely rounded to an integer
    expect(Number.isInteger(result.calories_kcal)).toBe(false);
  });

  it('sums multiple computed nutrition objects accurately', () => {
    const item1 = calculateNutrition(mockNutrition, 100); // 350 kcal, 20g P
    const item2 = calculateNutrition(mockNutrition, 50); // 175 kcal, 10g P
    const total = sumNutrition([item1, item2]);

    expect(total.calories_kcal).toBe(525);
    expect(total.protein_g).toBe(30);
    expect(total.carbohydrates_g).toBe(75);
    expect(total.fat_g).toBe(15);
    expect(total.fiber_g).toBe(12);
    expect(total.sodium_mg).toBe(450);
  });

  it('rounds values for display correctly', () => {
    expect(roundForDisplay(116.655, 1)).toBe(116.7);
    expect(roundForDisplay(116.655, 0)).toBe(117);
    expect(roundForDisplay(116.64, 1)).toBe(116.6);
  });

  it('formats nutrient strings for UI display', () => {
    expect(formatNutrient(116.655, 1)).toBe('116.7');
    expect(formatNutrient(116.655, 0)).toBe('117');
    expect(formatNutrient(0, 1)).toBe('0.0');
  });
});

