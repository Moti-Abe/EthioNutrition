import type { MealBuilderState, MealBuilderItem } from '../types';
import { calculateNutrition } from './nutrition';

const STORAGE_KEY = 'ethionutrition_meal_draft';

export function saveDraftToLocalStorage(state: MealBuilderState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadDraftFromLocalStorage(): MealBuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MealBuilderState;
    // Re-compute nutrition in case calculation logic changed
    parsed.items = parsed.items.map((item: MealBuilderItem) => ({
      ...item,
      computed: calculateNutrition(item.nutrition, item.grams),
    }));
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraftFromLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/** Generate a stable temporary ID for draft items. */
export function generateTempId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Format a date as YYYY-MM-DD in local time. */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format a date for display (e.g. "Wednesday, 4 November 2026"). */
export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Add days to an ISO date string. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return toLocalDateString(date);
}

/** Check whether an ISO date string is in the future (relative to local today). */
export function isFutureDate(isoDate: string): boolean {
  return isoDate > toLocalDateString();
}
