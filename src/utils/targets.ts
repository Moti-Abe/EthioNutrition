/**
 * BMR and TDEE calculation utilities using Mifflin-St Jeor equation.
 * Values are estimates, not medical prescriptions.
 */

import type { BodyMetrics, NutritionTargets } from '../types';

const ACTIVITY_FACTORS: Record<BodyMetrics['activity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<BodyMetrics['goal'], number> = {
  lose: -0.2, // -20%
  maintain: 0,
  gain: 0.15, // +15%
};

/** Protein target: 1.6g per kg body weight. */
const PROTEIN_G_PER_KG = 1.6;
/** Fat as percentage of calories (25%). */
const FAT_PERCENT = 0.25;
/** Calories per gram of protein. */
const KCAL_PER_G_PROTEIN = 4;
/** Calories per gram of fat. */
const KCAL_PER_G_FAT = 9;
/** Calories per gram of carbs. */
const KCAL_PER_G_CARB = 4;

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 * Male:   10×weight(kg) + 6.25×height(cm) − 5×age + 5
 * Female: 10×weight(kg) + 6.25×height(cm) − 5×age − 161
 */
export function calculateBMR(metrics: BodyMetrics): number {
  const { sex, birth_year, height_cm, weight_kg } = metrics;
  const age = new Date().getFullYear() - birth_year;
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Calculate TDEE from BMR and activity level. */
export function calculateTDEE(bmr: number, activity: BodyMetrics['activity']): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

/** Calculate all daily nutrition targets from body metrics. */
export function calculateTargets(metrics: BodyMetrics): NutritionTargets {
  const bmr = calculateBMR(metrics);
  const tdee = calculateTDEE(bmr, metrics.activity);
  const adjustment = GOAL_ADJUSTMENTS[metrics.goal];
  const calories = Math.round(tdee * (1 + adjustment));

  const protein_g = Math.round(metrics.weight_kg * PROTEIN_G_PER_KG);
  const fat_g = Math.round((calories * FAT_PERCENT) / KCAL_PER_G_FAT);

  const protein_kcal = protein_g * KCAL_PER_G_PROTEIN;
  const fat_kcal = fat_g * KCAL_PER_G_FAT;
  const carb_kcal = Math.max(0, calories - protein_kcal - fat_kcal);
  const carbs_g = Math.round(carb_kcal / KCAL_PER_G_CARB);

  return {
    calories,
    protein_g,
    carbs_g,
    fat_g,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

export { ACTIVITY_FACTORS, GOAL_ADJUSTMENTS };
