import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, BodyMetrics } from '../types';

const STORAGE_PROFILES = 'ethionutrition_profiles';
const STORAGE_BODY_METRICS = 'ethionutrition_body_metrics';

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    const profiles = getLocalItem<Profile[]>(STORAGE_PROFILES, []);
    return profiles.find((p) => p.id === userId) ?? {
      id: userId,
      email: 'demo@ethionutrition.com',
      onboarded: true,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Profile;
  } catch {
    const profiles = getLocalItem<Profile[]>(STORAGE_PROFILES, []);
    return profiles.find((p) => p.id === userId) ?? null;
  }
}

export async function upsertProfile(
  userId: string,
  email: string,
  onboarded: boolean
): Promise<void> {
  const profile: Profile = {
    id: userId,
    email,
    onboarded,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const profiles = getLocalItem<Profile[]>(STORAGE_PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx >= 0) profiles[idx] = profile;
    else profiles.push(profile);
    setLocalItem(STORAGE_PROFILES, profiles);
    return;
  }

  try {
    const { error } = await supabase.from('profiles').upsert(
      { id: userId, email, onboarded },
      { onConflict: 'id' }
    );
    if (error) throw error;
  } catch {
    const profiles = getLocalItem<Profile[]>(STORAGE_PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx >= 0) profiles[idx] = profile;
    else profiles.push(profile);
    setLocalItem(STORAGE_PROFILES, profiles);
  }
}

export async function fetchBodyMetrics(userId: string): Promise<BodyMetrics | null> {
  if (!isSupabaseConfigured()) {
    const all = getLocalItem<BodyMetrics[]>(STORAGE_BODY_METRICS, []);
    return (
      all.find((m) => m.user_id === userId) ?? {
        user_id: userId,
        sex: 'male',
        birth_year: 1996,
        height_cm: 172,
        weight_kg: 68,
        activity: 'moderate',
        goal: 'maintain',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }

  try {
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as BodyMetrics;
  } catch {
    const all = getLocalItem<BodyMetrics[]>(STORAGE_BODY_METRICS, []);
    return all.find((m) => m.user_id === userId) ?? null;
  }
}

export async function upsertBodyMetrics(
  metrics: Omit<BodyMetrics, 'created_at' | 'updated_at'>
): Promise<void> {
  const fullMetrics: BodyMetrics = {
    ...metrics,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const all = getLocalItem<BodyMetrics[]>(STORAGE_BODY_METRICS, []);
    const idx = all.findIndex((m) => m.user_id === metrics.user_id);
    if (idx >= 0) all[idx] = fullMetrics;
    else all.push(fullMetrics);
    setLocalItem(STORAGE_BODY_METRICS, all);
    return;
  }

  try {
    const { error } = await supabase.from('body_metrics').upsert(
      { ...metrics, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  } catch {
    const all = getLocalItem<BodyMetrics[]>(STORAGE_BODY_METRICS, []);
    const idx = all.findIndex((m) => m.user_id === metrics.user_id);
    if (idx >= 0) all[idx] = fullMetrics;
    else all.push(fullMetrics);
    setLocalItem(STORAGE_BODY_METRICS, all);
  }
}
