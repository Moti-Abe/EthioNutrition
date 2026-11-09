import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  toLocalDateString,
  addDays,
  isFutureDate,
  formatDisplayDate,
} from '../utils/storage';
import type { MealBuilderState } from '../types';

describe('LocalStorage & Date Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleState: MealBuilderState = {
    name: 'Sample Lunch',
    items: [
      {
        tempId: 'temp_1',
        food: {
          id: 'f1',
          slug: 'injera',
          name: 'Injera',
          name_amharic: 'እንጀራ',
          name_afaan_oromo: 'Biddeena',
          description: 'Flatbread',
          food_group: 'Grains & Cereals',
          image_url: null,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        nutrition: {
          id: 'n1',
          food_id: 'f1',
          preparation_state: 'Baked',
          calories_kcal: 161,
          protein_g: 4.2,
          carbohydrates_g: 33.5,
          fat_g: 0.7,
          fiber_g: 3.2,
          sodium_mg: 12,
          source_name: 'EPHI',
          source_reference: '',
          verification_status: 'verified',
          notes: '',
          created_at: '',
          updated_at: '',
        },
        grams: 150,
        computed: {
          calories_kcal: 241.5,
          protein_g: 6.3,
          carbohydrates_g: 50.25,
          fat_g: 1.05,
          fiber_g: 4.8,
          sodium_mg: 18,
        },
      },
    ],
  };

  it('saves and loads meal draft state to and from LocalStorage', () => {
    saveDraftToLocalStorage(sampleState);
    const loaded = loadDraftFromLocalStorage();

    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Sample Lunch');
    expect(loaded?.items.length).toBe(1);
    expect(loaded?.items[0].food.name).toBe('Injera');
    expect(loaded?.items[0].grams).toBe(150);
  });

  it('clears draft from LocalStorage', () => {
    saveDraftToLocalStorage(sampleState);
    clearDraftFromLocalStorage();
    expect(loadDraftFromLocalStorage()).toBeNull();
  });

  it('formats dates in YYYY-MM-DD local format', () => {
    const d = new Date(2026, 10, 4); // November 4, 2026
    expect(toLocalDateString(d)).toBe('2026-11-04');
  });

  it('formats display date nicely', () => {
    const formatted = formatDisplayDate('2026-11-04');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('November');
  });

  it('adds and subtracts days accurately', () => {
    expect(addDays('2026-11-04', 1)).toBe('2026-11-05');
    expect(addDays('2026-11-04', -1)).toBe('2026-11-03');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });

  it('correctly detects future dates relative to today', () => {
    const today = toLocalDateString();
    const tomorrow = addDays(today, 1);
    const yesterday = addDays(today, -1);

    expect(isFutureDate(tomorrow)).toBe(true);
    expect(isFutureDate(today)).toBe(false);
    expect(isFutureDate(yesterday)).toBe(false);
  });
});

