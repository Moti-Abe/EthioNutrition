/**
 * Nutrition calculation utility.
 * All nutritional values are stored per 100 grams.
 * Formula: selected_nutrient = (nutrient_per_100g * selected_grams) / 100
 */

import type { FoodNutrition, FoodNutritionComputed } from '../types';

/**
 * Calculate nutrition for a given weight in grams.
 * Does NOT round intermediate calculations.
 */
export function calculateNutrition(
  nutrition: FoodNutrition,
  grams: number
): FoodNutritionComputed {
  const factor = grams / 100;
  return {
    calories_kcal: nutrition.calories_kcal * factor,
    protein_g: nutrition.protein_g * factor,
    carbohydrates_g: nutrition.carbohydrates_g * factor,
    fat_g: nutrition.fat_g * factor,
    fiber_g: nutrition.fiber_g * factor,
    sodium_mg: nutrition.sodium_mg * factor,
  };
}

/** Sum multiple computed nutrition objects. */
export function sumNutrition(items: FoodNutritionComputed[]): FoodNutritionComputed {
  return items.reduce(
    (acc, item) => ({
      calories_kcal: acc.calories_kcal + item.calories_kcal,
      protein_g: acc.protein_g + item.protein_g,
      carbohydrates_g: acc.carbohydrates_g + item.carbohydrates_g,
      fat_g: acc.fat_g + item.fat_g,
      fiber_g: acc.fiber_g + item.fiber_g,
      sodium_mg: acc.sodium_mg + item.sodium_mg,
    }),
    {
      calories_kcal: 0,
      protein_g: 0,
      carbohydrates_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
    }
  );
}

/** Round a number for display only. */
export function roundForDisplay(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/** Format a number for display with given decimal places. */
export function formatNutrient(value: number, decimals = 1): string {
  return roundForDisplay(value, decimals).toFixed(decimals);
}
