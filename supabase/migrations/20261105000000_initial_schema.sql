-- =============================================================================
-- ETHIONUTRITION DATABASE SCHEMA & SECURITY POLICIES
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper function to automatically update `updated_at` timestamps
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. FOODS
-- Stores identity of each food item.
-- Managed exclusively by Administrator.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_amharic TEXT,
  name_afaan_oromo TEXT,
  description TEXT,
  food_group TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_foods_updated_at ON public.foods;
CREATE TRIGGER trigger_update_foods_updated_at
BEFORE UPDATE ON public.foods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_foods_slug ON public.foods(slug);
CREATE INDEX IF NOT EXISTS idx_foods_is_active ON public.foods(is_active);
CREATE INDEX IF NOT EXISTS idx_foods_food_group ON public.foods(food_group);
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);

-- -----------------------------------------------------------------------------
-- 2. FOOD_NUTRITION
-- Stores nutritional information per 100 grams for different preparation states.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  preparation_state TEXT NOT NULL,
  calories_kcal NUMERIC(8,2) NOT NULL CHECK (calories_kcal >= 0),
  protein_g NUMERIC(8,2) NOT NULL CHECK (protein_g >= 0),
  carbohydrates_g NUMERIC(8,2) NOT NULL CHECK (carbohydrates_g >= 0),
  fat_g NUMERIC(8,2) NOT NULL CHECK (fat_g >= 0),
  fiber_g NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (fiber_g >= 0),
  sodium_mg NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (sodium_mg >= 0),
  source_name TEXT NOT NULL,
  source_reference TEXT,
  verification_status TEXT NOT NULL DEFAULT 'estimated' CHECK (verification_status IN ('verified', 'estimated', 'unverified')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_food_nutrition_updated_at ON public.food_nutrition;
CREATE TRIGGER trigger_update_food_nutrition_updated_at
BEFORE UPDATE ON public.food_nutrition
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_food_nutrition_food_id ON public.food_nutrition(food_id);
CREATE INDEX IF NOT EXISTS idx_food_nutrition_prep_state ON public.food_nutrition(preparation_state);

-- -----------------------------------------------------------------------------
-- 3. FOOD_ALIASES
-- Supports alternative names, Amharic variations, Oromo variations, and synonyms.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_aliases_food_id ON public.food_aliases(food_id);
CREATE INDEX IF NOT EXISTS idx_food_aliases_alias ON public.food_aliases(alias);

-- -----------------------------------------------------------------------------
-- 4. CATEGORIES
-- Browsing categories (e.g. Weight Gain, High-Protein, Weight Loss, Traditional).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- -----------------------------------------------------------------------------
-- 5. FOOD_CATEGORIES
-- Many-to-many relationship between foods and categories.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_categories (
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (food_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_food_categories_cat_id ON public.food_categories(category_id);

-- -----------------------------------------------------------------------------
-- 6. CLASSIFICATION_RULES
-- Configurable nutritional classification thresholds (e.g. protein_g >= 15).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  nutrient TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('>=', '<=', '>', '<', '=')),
  threshold_value NUMERIC(8,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classification_rules_cat_id ON public.classification_rules(category_id);

-- -----------------------------------------------------------------------------
-- 7. PROFILES
-- User profiles automatically created upon user registration.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function and trigger to auto-create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarded)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth.users trigger (profile created by app): %', SQLERRM;
END $$;

-- -----------------------------------------------------------------------------
-- 8. BODY_METRICS
-- Stores user metrics for BMR/TDEE calculation and goals.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.body_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  birth_year INTEGER NOT NULL CHECK (birth_year BETWEEN 1900 AND 2100),
  height_cm NUMERIC(5,1) NOT NULL CHECK (height_cm > 0),
  weight_kg NUMERIC(5,1) NOT NULL CHECK (weight_kg > 0),
  activity TEXT NOT NULL CHECK (activity IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_body_metrics_updated_at ON public.body_metrics;
CREATE TRIGGER trigger_update_body_metrics_updated_at
BEFORE UPDATE ON public.body_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 9. DAILY_TARGETS
-- Stores day-by-day snapshotted nutritional targets so profile changes
-- do not overwrite historical target values.
-- Composite primary key: (user_id, day)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_targets (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein_g INTEGER NOT NULL CHECK (protein_g >= 0),
  carbs_g INTEGER NOT NULL CHECK (carbs_g >= 0),
  fat_g INTEGER NOT NULL CHECK (fat_g >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_daily_targets_user_day ON public.daily_targets(user_id, day);

-- -----------------------------------------------------------------------------
-- 10. MEALS
-- Stores reusable saved meal templates created by authenticated users.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_meals_updated_at ON public.meals;
CREATE TRIGGER trigger_update_meals_updated_at
BEFORE UPDATE ON public.meals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);

-- -----------------------------------------------------------------------------
-- 11. MEAL_ENTRIES
-- Stores foods inside saved meal templates.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  nutrition_id UUID NOT NULL REFERENCES public.food_nutrition(id) ON DELETE RESTRICT,
  grams NUMERIC(8,2) NOT NULL CHECK (grams > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_entries_meal_id ON public.meal_entries(meal_id);

-- -----------------------------------------------------------------------------
-- 12. DAILY_MEALS
-- Stores actual consumed meal sessions on a given date (e.g. Breakfast, Lunch).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  logged_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_meals_user_date ON public.daily_meals(user_id, logged_date);

-- -----------------------------------------------------------------------------
-- 13. DAILY_MEAL_ENTRIES
-- Stores specific foods consumed in each daily meal.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_meal_id UUID NOT NULL REFERENCES public.daily_meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  nutrition_id UUID NOT NULL REFERENCES public.food_nutrition(id) ON DELETE RESTRICT,
  grams NUMERIC(8,2) NOT NULL CHECK (grams > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_meal_entries_dm_id ON public.daily_meal_entries(daily_meal_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all 13 tables
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meal_entries ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Public / Catalog Tables: READ-ONLY for anonymous and authenticated users.
-- Administrator manages these tables directly via Supabase Dashboard / SQL.
-- No INSERT / UPDATE / DELETE policies are granted to the anon or authenticated roles.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view active foods" ON public.foods;
CREATE POLICY "Public can view active foods"
ON public.foods FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Public can view published nutrition records" ON public.food_nutrition;
CREATE POLICY "Public can view published nutrition records"
ON public.food_nutrition FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.foods f
  WHERE f.id = food_nutrition.food_id AND f.is_active = true
));

DROP POLICY IF EXISTS "Public can view food aliases" ON public.food_aliases;
CREATE POLICY "Public can view food aliases"
ON public.food_aliases FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.foods f
  WHERE f.id = food_aliases.food_id AND f.is_active = true
));

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Public can view food categories" ON public.food_categories;
CREATE POLICY "Public can view food categories"
ON public.food_categories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can view active classification rules" ON public.classification_rules;
CREATE POLICY "Public can view active classification rules"
ON public.classification_rules FOR SELECT
USING (is_active = true);

-- -----------------------------------------------------------------------------
-- User Profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- Body Metrics
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own body metrics" ON public.body_metrics;
CREATE POLICY "Users can view own body metrics"
ON public.body_metrics FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own body metrics" ON public.body_metrics;
CREATE POLICY "Users can insert own body metrics"
ON public.body_metrics FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own body metrics" ON public.body_metrics;
CREATE POLICY "Users can update own body metrics"
ON public.body_metrics FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own body metrics" ON public.body_metrics;
CREATE POLICY "Users can delete own body metrics"
ON public.body_metrics FOR DELETE
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Daily Targets
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own daily targets" ON public.daily_targets;
CREATE POLICY "Users can view own daily targets"
ON public.daily_targets FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own daily targets" ON public.daily_targets;
CREATE POLICY "Users can insert own daily targets"
ON public.daily_targets FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own daily targets" ON public.daily_targets;
CREATE POLICY "Users can update own daily targets"
ON public.daily_targets FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own daily targets" ON public.daily_targets;
CREATE POLICY "Users can delete own daily targets"
ON public.daily_targets FOR DELETE
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Saved Meals (Templates)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own saved meals" ON public.meals;
CREATE POLICY "Users can view own saved meals"
ON public.meals FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own saved meals" ON public.meals;
CREATE POLICY "Users can insert own saved meals"
ON public.meals FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own saved meals" ON public.meals;
CREATE POLICY "Users can update own saved meals"
ON public.meals FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own saved meals" ON public.meals;
CREATE POLICY "Users can delete own saved meals"
ON public.meals FOR DELETE
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Saved Meal Entries
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view entries of own saved meals" ON public.meal_entries;
CREATE POLICY "Users can view entries of own saved meals"
ON public.meal_entries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.meals m
  WHERE m.id = meal_entries.meal_id AND m.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert entries into own saved meals" ON public.meal_entries;
CREATE POLICY "Users can insert entries into own saved meals"
ON public.meal_entries FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meals m
  WHERE m.id = meal_entries.meal_id AND m.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete entries from own saved meals" ON public.meal_entries;
CREATE POLICY "Users can delete entries from own saved meals"
ON public.meal_entries FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.meals m
  WHERE m.id = meal_entries.meal_id AND m.user_id = auth.uid()
));

-- -----------------------------------------------------------------------------
-- Daily Logged Meals
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own daily meals" ON public.daily_meals;
CREATE POLICY "Users can view own daily meals"
ON public.daily_meals FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own daily meals" ON public.daily_meals;
CREATE POLICY "Users can insert own daily meals"
ON public.daily_meals FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own daily meals" ON public.daily_meals;
CREATE POLICY "Users can update own daily meals"
ON public.daily_meals FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own daily meals" ON public.daily_meals;
CREATE POLICY "Users can delete own daily meals"
ON public.daily_meals FOR DELETE
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Daily Logged Meal Entries
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view entries of own daily meals" ON public.daily_meal_entries;
CREATE POLICY "Users can view entries of own daily meals"
ON public.daily_meal_entries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.daily_meals dm
  WHERE dm.id = daily_meal_entries.daily_meal_id AND dm.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert entries into own daily meals" ON public.daily_meal_entries;
CREATE POLICY "Users can insert entries into own daily meals"
ON public.daily_meal_entries FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.daily_meals dm
  WHERE dm.id = daily_meal_entries.daily_meal_id AND dm.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update entries in own daily meals" ON public.daily_meal_entries;
CREATE POLICY "Users can update entries in own daily meals"
ON public.daily_meal_entries FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.daily_meals dm
  WHERE dm.id = daily_meal_entries.daily_meal_id AND dm.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.daily_meals dm
  WHERE dm.id = daily_meal_entries.daily_meal_id AND dm.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete entries from own daily meals" ON public.daily_meal_entries;
CREATE POLICY "Users can delete entries from own daily meals"
ON public.daily_meal_entries FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.daily_meals dm
  WHERE dm.id = daily_meal_entries.daily_meal_id AND dm.user_id = auth.uid()
));

-- -----------------------------------------------------------------------------
-- TABLE PRIVILEGES FOR SUPABASE ROLES (anon & authenticated)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, anon, authenticated;

-- Allow authenticated users to manage their personal records (controlled by RLS):
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.body_metrics TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_targets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.meals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.meal_entries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_meals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_meal_entries TO authenticated;
