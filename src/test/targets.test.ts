import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargets,
  ACTIVITY_FACTORS,
  GOAL_ADJUSTMENTS,
} from '../utils/targets';
import type { BodyMetrics } from '../types';

describe('BMR, TDEE, and Nutrition Target Calculations', () => {
  const maleMetrics: BodyMetrics = {
    user_id: 'user1',
    sex: 'male',
    birth_year: 1996, // age ~ 30
    height_cm: 175,
    weight_kg: 70,
    activity: 'moderate',
    goal: 'maintain',
    created_at: '',
    updated_at: '',
  };

  const femaleMetrics: BodyMetrics = {
    user_id: 'user2',
    sex: 'female',
    birth_year: 1996, // age ~ 30
    height_cm: 165,
    weight_kg: 60,
    activity: 'moderate',
    goal: 'lose',
    created_at: '',
    updated_at: '',
  };

  it('calculates Mifflin-St Jeor BMR for males: 10w + 6.25h - 5a + 5', () => {
    // Age = currentYear - 1996
    const age = new Date().getFullYear() - 1996;
    const expected = 10 * 70 + 6.25 * 175 - 5 * age + 5;
    expect(calculateBMR(maleMetrics)).toBe(expected);
  });

  it('calculates Mifflin-St Jeor BMR for females: 10w + 6.25h - 5a - 161', () => {
    const age = new Date().getFullYear() - 1996;
    const expected = 10 * 60 + 6.25 * 165 - 5 * age - 161;
    expect(calculateBMR(femaleMetrics)).toBe(expected);
  });

  it('calculates TDEE using correct activity multipliers', () => {
    const bmr = 1600;
    expect(calculateTDEE(bmr, 'sedentary')).toBe(1600 * ACTIVITY_FACTORS.sedentary); // 1.2
    expect(calculateTDEE(bmr, 'light')).toBe(1600 * ACTIVITY_FACTORS.light); // 1.375
    expect(calculateTDEE(bmr, 'moderate')).toBe(1600 * ACTIVITY_FACTORS.moderate); // 1.55
    expect(calculateTDEE(bmr, 'active')).toBe(1600 * ACTIVITY_FACTORS.active); // 1.725
    expect(calculateTDEE(bmr, 'very_active')).toBe(1600 * ACTIVITY_FACTORS.very_active); // 1.9
  });

  it('applies goal adjustments correctly (lose: -20%, maintain: 0%, gain: +15%)', () => {
    expect(GOAL_ADJUSTMENTS.lose).toBe(-0.2);
    expect(GOAL_ADJUSTMENTS.maintain).toBe(0);
    expect(GOAL_ADJUSTMENTS.gain).toBe(0.15);
  });

  it('calculates protein target at 1.6g per kg body weight', () => {
    const targets = calculateTargets(maleMetrics);
    // 70kg * 1.6g = 112g
    expect(targets.protein_g).toBe(112);
  });

  it('calculates fat target at 25% of total calories', () => {
    const targets = calculateTargets(maleMetrics);
    const expectedFat = Math.round((targets.calories * 0.25) / 9);
    expect(targets.fat_g).toBe(expectedFat);
  });

  it('derives carbohydrate target from remaining calorie allotment', () => {
    const targets = calculateTargets(maleMetrics);
    const proteinKcal = targets.protein_g * 4;
    const fatKcal = targets.fat_g * 9;
    const remainingKcal = Math.max(0, targets.calories - proteinKcal - fatKcal);
    const expectedCarbs = Math.round(remainingKcal / 4);
    expect(targets.carbs_g).toBe(expectedCarbs);
  });
});

