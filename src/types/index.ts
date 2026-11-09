// Database entity types matching Supabase schema

export interface Food {
  id: string;
  slug: string;
  name: string;
  name_amharic: string | null;
  name_afaan_oromo: string | null;
  description: string;
  food_group: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodNutrition {
  id: string;
  food_id: string;
  preparation_state: string;
  calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  source_name: string;
  source_reference: string;
  verification_status: 'verified' | 'estimated' | 'unverified';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FoodAlias {
  id: string;
  food_id: string;
  alias: string;
  language: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_type: string;
  is_active: boolean;
  sort_order: number;
}

export interface FoodCategory {
  food_id: string;
  category_id: string;
  created_at: string;
}

export interface ClassificationRule {
  id: string;
  category_id: string;
  nutrient: string;
  operator: string;
  threshold_value: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  onboarded: boolean;
  created_at: string;
}

export interface BodyMetrics {
  user_id: string;
  sex: 'male' | 'female';
  birth_year: number;
  height_cm: number;
  weight_kg: number;
  activity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  created_at: string;
  updated_at: string;
}

export interface DailyTarget {
  user_id: string;
  day: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MealEntry {
  id: string;
  meal_id: string;
  food_id: string;
  nutrition_id: string;
  grams: number;
  created_at: string;
}

export interface DailyMeal {
  id: string;
  user_id: string;
  meal_name: string;
  logged_date: string;
  created_at: string;
}

export interface DailyMealEntry {
  id: string;
  daily_meal_id: string;
  food_id: string;
  nutrition_id: string;
  grams: number;
  created_at: string;
}

export interface FoodWithNutrition extends Food {
  food_nutrition: FoodNutrition[];
  categories?: Category[];
}

export interface FoodNutritionComputed {
  calories_kcal: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

export interface MealBuilderItem {
  tempId: string;
  food: Food;
  nutrition: FoodNutrition;
  grams: number;
  computed: FoodNutritionComputed;
}

export interface MealBuilderState {
  items: MealBuilderItem[];
  name: string;
}

export interface DailyMealWithEntries extends DailyMeal {
  entries: (DailyMealEntry & {
    food: Food;
    nutrition: FoodNutrition;
  })[];
}

export interface FoodFilters {
  search: string;
  categoryIds: string[];
  foodGroup: string;
  preparationState: string;
  sortBy: 'name' | 'calories' | 'protein' | 'carbs' | 'fat';
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface NutritionTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  bmr: number;
  tdee: number;
}
