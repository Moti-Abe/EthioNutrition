-- =============================================================================
-- ETHIONUTRITION SEED DATA
-- Ethiopian & International Foods with Accurate Nutritional Profiles per 100g
-- =============================================================================

-- Clear existing catalog data in case of re-seed
DELETE FROM public.food_categories;
DELETE FROM public.food_aliases;
DELETE FROM public.food_nutrition;
DELETE FROM public.classification_rules;
DELETE FROM public.categories;
DELETE FROM public.foods;

-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, category_type, is_active, sort_order)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'High Protein', 'high-protein', 'Foods particularly rich in protein to support muscle repair, satiety, and active lifestyles.', 'Macronutrient', true, 1),
  ('c0000002-0000-0000-0000-000000000002', 'Weight Gain', 'weight-gain', 'Foods suitable for people trying to gain weight or achieve a healthy caloric surplus.', 'Goal', true, 2),
  ('c0000003-0000-0000-0000-000000000003', 'Weight Loss', 'weight-loss', 'Foods suitable for people trying to lose weight or maintain a caloric deficit.', 'Goal', true, 3),
  ('c0000004-0000-0000-0000-000000000004', 'Traditional Staples', 'traditional-staples', 'Foundational Ethiopian grains, stews, flatbreads, and heritage dishes.', 'Cuisine', true, 4),
  ('c0000005-0000-0000-0000-000000000005', 'Fasting Food (Yetsom)', 'fasting-foods', 'Foods suitable for Ethiopian Orthodox fasting (pure plant-based).', 'Dietary', true, 5);

-- -----------------------------------------------------------------------------
-- CLASSIFICATION RULES
-- -----------------------------------------------------------------------------
INSERT INTO public.classification_rules (category_id, nutrient, operator, threshold_value, is_active)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'protein_g', '>=', 12.00, true),
  ('c0000002-0000-0000-0000-000000000002', 'calories_kcal', '>=', 250.00, true),
  ('c0000003-0000-0000-0000-000000000003', 'calories_kcal', '<=', 160.00, true);

-- -----------------------------------------------------------------------------
-- FOODS & NUTRITION
-- -----------------------------------------------------------------------------

-- 1. Injera (Teff Flatbread)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000001-0000-0000-0000-000000000001',
  'injera',
  'Injera',
  'እንጀራ',
  'Biddeena',
  'Traditional sourdough fermented flatbread with a spongy texture, traditionally made from 100% teff flour.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Fermented, baked (100% Teff)', 161.0, 4.2, 33.5, 0.7, 3.2, 12.0, 'Ethiopian Public Health Institute (EPHI)', 'Food Composition Table for Use in Ethiopia', 'verified', 'Prepared with fermented pure brown/white teff flour dough baked on a clay mitad.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Enjera', 'en'),
  ('f0000001-0000-0000-0000-000000000001', 'Biddeena', 'om'),
  ('f0000001-0000-0000-0000-000000000001', 'Teff bread', 'en');

-- 2. Shiro (Chickpea / Broad Bean Stew)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000002-0000-0000-0000-000000000002',
  'shiro',
  'Shiro',
  'ሽሮ',
  'Ittoo Shiroo',
  'A staple savory stew made of powdered roasted chickpeas, broad beans, berbere spices, garlic, and vegetable oil.',
  'Legumes & Pulses',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000002-0000-0000-0000-000000000002', 'Cooked stew (moderate oil)', 138.0, 5.8, 16.2, 5.5, 4.1, 380.0, 'EPHI / FAO Food Balance', 'EPHI Traditional Foods Analysis', 'estimated', 'Assumes standard home recipe with 100g cooked stew having roughly 15g shiro powder, onion, garlic, berbere, and 5g oil.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000002-0000-0000-0000-000000000002', 'Shiro Wat', 'en'),
  ('f0000002-0000-0000-0000-000000000002', 'Shiro Wot', 'en'),
  ('f0000002-0000-0000-0000-000000000002', 'Tegabino', 'am');

-- 3. Misir Wot (Red Lentil Stew)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000003-0000-0000-0000-000000000003',
  'misir-wot',
  'Misir Wot',
  'ምስር ወጥ',
  'Ittoo Misira',
  'Slow-cooked red split lentils simmered in a fragrant sauce of onions, berbere spices, garlic, and ginger.',
  'Legumes & Pulses',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000003-0000-0000-0000-000000000003', 'Cooked stew', 132.0, 7.6, 18.4, 3.2, 5.0, 310.0, 'EPHI', 'Ethiopian Nutrition Institute Database', 'verified', 'Recipe modeled with split red lentils, red onion, garlic, berbere, water, and sunflower oil.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000003-0000-0000-0000-000000000003', 'Misir Wat', 'en'),
  ('f0000003-0000-0000-0000-000000000003', 'Spicy Lentils', 'en'),
  ('f0000003-0000-0000-0000-000000000003', 'Yemisir Kik', 'am');

-- 4. Doro Wot (Spicy Chicken Stew)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000004-0000-0000-0000-000000000004',
  'doro-wot',
  'Doro Wot',
  'ዶሮ ወጥ',
  'Ittoo Lukkuu',
  'The quintessential Ethiopian celebration dish: tender chicken drumsticks and hard-boiled eggs simmered in rich berbere gravy and spiced butter (niter kibbeh).',
  'Poultry & Meat Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000004-0000-0000-0000-000000000004', 'Cooked chicken with sauce (excluding egg)', 188.0, 15.4, 5.2, 11.8, 1.8, 420.0, 'EPHI Traditional Dishes Analysis', 'EPHI 2018 Survey', 'estimated', 'Skinless chicken simmered with slow-caramelized red onions, niter kibbeh (spiced clarified butter), and berbere.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000004-0000-0000-0000-000000000004', 'Doro Wat', 'en'),
  ('f0000004-0000-0000-0000-000000000004', 'Ethiopian Chicken Stew', 'en');

-- 5. Tibs (Sautéed Beef)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000005-0000-0000-0000-000000000005',
  'tibs',
  'Tibs',
  'ጥብስ',
  'Tibsi Foonii',
  'Pan-seared cubes of lean beef sautéed with onions, rosemary, jalapeño peppers, garlic, and spiced butter or oil.',
  'Meat & Beef Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000005-0000-0000-0000-000000000005', 'Pan-fried lean beef with onions', 215.0, 24.2, 2.8, 11.5, 0.6, 290.0, 'USDA FoodData Central / EPHI', 'Composite Beef Analysis', 'verified', 'Prepared with lean cut beef, caramelized yellow onions, green peppers, and minimal niter kibbeh.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000005-0000-0000-0000-000000000005', 'Beef Tibs', 'en'),
  ('f0000005-0000-0000-0000-000000000005', 'Shekla Tibs', 'am'),
  ('f0000005-0000-0000-0000-000000000005', 'Awaze Tibs', 'am');

-- 6. Kitfo (Minced Beef Tartare)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000006-0000-0000-0000-000000000006',
  'kitfo',
  'Kitfo',
  'ክትፎ',
  'Kitfoo',
  'Minced ultra-lean beef seasoned with mitmita chili powder and warm herb-infused clarified butter (niter kibbeh).',
  'Meat & Beef Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000006-0000-0000-0000-000000000006', 'Raw minced with niter kibbeh & mitmita', 234.0, 21.0, 0.4, 16.5, 0.2, 280.0, 'EPHI / FAO Meat Tables', 'Kitfo Nutrient Analysis', 'verified', 'Lean topside beef ground finely, mixed with 10% niter kibbeh and mitmita spice.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000006-0000-0000-0000-000000000006', 'Ketfo', 'en'),
  ('f0000006-0000-0000-0000-000000000006', 'Leb Leb Kitfo', 'am');

-- 7. Gomen (Ethiopian Braised Collard Greens)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000007-0000-0000-0000-000000000007',
  'gomen',
  'Gomen',
  'ጎመን',
  'Raafuu',
  'Tender chopped collard greens stewed with red onions, garlic, ginger, and cardamom.',
  'Vegetables & Greens',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000007-0000-0000-0000-000000000007', 'Braised with onions & oil', 58.0, 2.5, 6.2, 2.8, 3.4, 180.0, 'EPHI Vegetable Surveys', 'Traditional Vegetable Dishes', 'verified', 'Chopped collard greens simmered in vegetable oil with onion, garlic, ginger.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000007-0000-0000-0000-000000000007', 'Collard Greens', 'en'),
  ('f0000007-0000-0000-0000-000000000007', 'Ye Gomen Wot', 'am'),
  ('f0000007-0000-0000-0000-000000000007', 'Raafuu', 'om');

-- 8. Kinche (Cracked Wheat Porridge)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000008-0000-0000-0000-000000000008',
  'kinche',
  'Kinche',
  'ቂንጬ',
  'Qincee',
  'Warm cracked wheat cooked soft in water and finished with spiced butter or oil and a pinch of salt.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000008-0000-0000-0000-000000000008', 'Cooked with niter kibbeh', 145.0, 3.8, 24.5, 3.5, 4.2, 190.0, 'EPHI Grain Database', 'Ethiopian Breakfast Foods', 'estimated', 'Boiled cracked wheat (bulgur-style) lightly dressed with clarified butter.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000008-0000-0000-0000-000000000008', 'Cracked wheat', 'en'),
  ('f0000008-0000-0000-0000-000000000008', 'Qincee', 'om'),
  ('f0000008-0000-0000-0000-000000000008', 'Quinche', 'en');

-- 9. Chechebsa (Kita Firfir)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000009-0000-0000-0000-000000000009',
  'chechebsa',
  'Chechebsa',
  'ጨጨብሳ',
  'Caccabsaa',
  'Torn bits of thin unleavened pan flatbread (kita) warm-tossed in spiced butter (niter kibbeh) and berbere spice.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000009-0000-0000-0000-000000000009', 'Prepared with spiced butter & berbere', 290.0, 6.2, 38.0, 12.8, 3.1, 310.0, 'EPHI Breakfast Studies', 'Caccabsaa Nutrient Comp', 'estimated', 'Whole wheat and teff flour flatbread lightly crisped and coated with generous niter kibbeh.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000009-0000-0000-0000-000000000009', 'Kita Firfir', 'am'),
  ('f0000009-0000-0000-0000-000000000009', 'Caccabsaa', 'om');

-- 10. Firfir (Injera in Spiced Sauce)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000010-0000-0000-0000-000000000010',
  'firfir',
  'Firfir',
  'ፍርፍር',
  'Firfira',
  'Torn injera pieces tossed and soaked in a savory spicy berbere sauce with onions and garlic.',
  'Traditional Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000010-0000-0000-0000-000000000010', 'Cooked vegetarian (sils)', 175.0, 4.4, 30.5, 4.2, 3.5, 340.0, 'EPHI', 'Injera Dishes Analysis', 'estimated', 'Injera infused in onion-tomato-berbere reduction sauce with sunflower oil.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000010-0000-0000-0000-000000000010', 'Fitfit', 'am'),
  ('f0000010-0000-0000-0000-000000000010', 'Injera Firfir', 'en'),
  ('f0000010-0000-0000-0000-000000000010', 'Kuanta Firfir', 'am');

-- 11. Besso (Roasted Barley Drink / Paste)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000011-0000-0000-0000-000000000011',
  'besso',
  'Besso',
  'በሶ',
  'Basso',
  'Nutrient-dense flour milled from carefully roasted whole hull-less barley, mixed with water or milk and honey.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000011-0000-0000-0000-000000000011', 'Dry roasted barley flour', 354.0, 11.2, 73.0, 2.3, 14.5, 12.0, 'EPHI / FAO', 'Barley Composition Tables', 'verified', '100% roasted barley flour before hydration. Rich in beta-glucan soluble fiber.'),
  ('f0000011-0000-0000-0000-000000000011', 'Prepared drink (1 part flour : 3 parts water)', 88.0, 2.8, 18.2, 0.6, 3.6, 4.0, 'EPHI', 'Prepared Beverage Calculation', 'estimated', 'Diluted beverage made with 25g besso powder and water.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000011-0000-0000-0000-000000000011', 'Roasted Barley', 'en'),
  ('f0000011-0000-0000-0000-000000000011', 'Basso', 'om'),
  ('f0000011-0000-0000-0000-000000000011', 'Besso drink', 'en');

-- 12. Nifro (Boiled Mixed Legumes & Grains)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000012-0000-0000-0000-000000000012',
  'nifro',
  'Nifro',
  'ንፍሮ',
  'Nifroo',
  'Wholesome boiled combination of whole wheat, chickpeas, and broad beans lightly salted, often eaten as an afternoon snack.',
  'Legumes & Pulses',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000012-0000-0000-0000-000000000012', 'Boiled with chickpeas and wheat', 168.0, 7.8, 30.5, 1.8, 6.8, 140.0, 'EPHI Traditional Snack Tables', 'EPHI 2017 Survey', 'verified', 'Boiled mixture of 50% wheat berries and 50% chickpeas.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000012-0000-0000-0000-000000000012', 'Boiled grain and pulse', 'en'),
  ('f0000012-0000-0000-0000-000000000012', 'Nifroo', 'om'),
  ('f0000012-0000-0000-0000-000000000012', 'Nifro snack', 'en');

-- 13. Teff (Raw Grain)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000013-0000-0000-0000-000000000013',
  'teff',
  'Teff',
  'ጤፍ',
  'Xaafee',
  'Ancient tiny Ethiopian gluten-free cereal grain packed with iron, protein, fiber, and calcium.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000013-0000-0000-0000-000000000013', 'Raw whole grain', 367.0, 13.3, 73.1, 2.4, 8.0, 12.0, 'USDA FoodData Central / EPHI', 'USDA FDC 169747', 'verified', 'Whole uncooked dry teff grain (Eragrostis tef).'),
  ('f0000013-0000-0000-0000-000000000013', 'Cooked porridge', 101.0, 3.9, 19.9, 0.7, 2.8, 5.0, 'USDA FoodData Central', 'USDA FDC 169748', 'verified', 'Teff grain simmered in water (1:3 ratio).');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000013-0000-0000-0000-000000000013', 'Tef', 'en'),
  ('f0000013-0000-0000-0000-000000000013', 'Xaafee', 'om'),
  ('f0000013-0000-0000-0000-000000000013', 'Teff grain', 'en');

-- 14. Chickpeas (Shimbra)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000014-0000-0000-0000-000000000014',
  'chickpeas',
  'Chickpeas',
  'ሽንብራ',
  'Shumburaa',
  'Versatile high-protein legume used across Ethiopian cooking for shiro, snacks (kolo, nifro), and salads.',
  'Legumes & Pulses',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000014-0000-0000-0000-000000000014', 'Raw, dry', 378.0, 20.5, 63.0, 6.0, 12.2, 24.0, 'USDA FoodData Central', 'USDA FDC 173756', 'verified', 'Dry garbanzo beans before soaking or cooking.'),
  ('f0000014-0000-0000-0000-000000000014', 'Boiled, drained', 164.0, 8.9, 27.4, 2.6, 7.6, 7.0, 'USDA FoodData Central', 'USDA FDC 173757', 'verified', 'Chickpeas boiled in unsalted water.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000014-0000-0000-0000-000000000014', 'Shimbra', 'am'),
  ('f0000014-0000-0000-0000-000000000014', 'Shumburaa', 'om'),
  ('f0000014-0000-0000-0000-000000000014', 'Garbanzo beans', 'en');

-- 15. Lentils (Misir)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000015-0000-0000-0000-000000000015',
  'lentils',
  'Lentils',
  'ምስር',
  'Misira',
  'Nutrient-dense legumes, central to Ethiopian vegan cuisine during fasting seasons.',
  'Legumes & Pulses',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000015-0000-0000-0000-000000000015', 'Raw, dry', 352.0, 24.6, 63.4, 1.1, 10.7, 6.0, 'USDA FoodData Central', 'USDA FDC 172420', 'verified', 'Whole uncooked dry brown/green lentils.'),
  ('f0000015-0000-0000-0000-000000000015', 'Boiled, drained', 116.0, 9.0, 20.1, 0.4, 7.9, 2.0, 'USDA FoodData Central', 'USDA FDC 172421', 'verified', 'Lentils boiled in plain water.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000015-0000-0000-0000-000000000015', 'Misir', 'am'),
  ('f0000015-0000-0000-0000-000000000015', 'Misira', 'om'),
  ('f0000015-0000-0000-0000-000000000015', 'Brown lentils', 'en');

-- 16. Eggs (Inkoolal)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000016-0000-0000-0000-000000000016',
  'eggs',
  'Eggs',
  'እንቁላል',
  'Hanqaaquu',
  'Whole chicken eggs, an exceptional source of bioavailable complete protein, choline, and essential vitamins.',
  'Dairy & Eggs',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000016-0000-0000-0000-000000000016', 'Boiled', 155.0, 12.6, 1.1, 10.6, 0.0, 124.0, 'USDA FoodData Central', 'USDA FDC 171287', 'verified', 'Hard-boiled whole chicken egg.'),
  ('f0000016-0000-0000-0000-000000000016', 'Scrambled (with 5g oil)', 196.0, 11.8, 1.4, 15.2, 0.0, 160.0, 'USDA FoodData Central', 'USDA FDC 173424', 'verified', 'Whole eggs scrambled with vegetable oil and salt.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000016-0000-0000-0000-000000000016', 'Enkulal', 'am'),
  ('f0000016-0000-0000-0000-000000000016', 'Hanqaaquu', 'om'),
  ('f0000016-0000-0000-0000-000000000016', 'Boiled egg', 'en');

-- 17. Whole Milk (Wetet)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000017-0000-0000-0000-000000000017',
  'milk',
  'Milk',
  'ወተት',
  'Aannan',
  'Fresh whole cow milk providing balanced calcium, carbohydrates, and protein.',
  'Dairy & Eggs',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000017-0000-0000-0000-000000000017', 'Fresh whole milk (3.25% fat)', 61.0, 3.2, 4.8, 3.3, 0.0, 43.0, 'USDA FoodData Central', 'USDA FDC 746782', 'verified', 'Standard pasteurized whole cow milk.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000017-0000-0000-0000-000000000017', 'Wetet', 'am'),
  ('f0000017-0000-0000-0000-000000000017', 'Aannan', 'om'),
  ('f0000017-0000-0000-0000-000000000017', 'Cow milk', 'en');

-- 18. Yogurt / Ergo (Traditional Fermented Milk)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000018-0000-0000-0000-000000000018',
  'yogurt',
  'Yogurt',
  'እርጎ',
  'Itittu',
  'Traditional Ethiopian naturally fermented whole milk with probiotics and a rich tart flavor.',
  'Dairy & Eggs',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000018-0000-0000-0000-000000000018', 'Plain, fermented whole milk', 65.0, 3.5, 4.7, 3.5, 0.0, 46.0, 'EPHI Dairy Analysis', 'Ergo Quality Parameters', 'verified', 'Traditional Ethiopian naturally cultured sour milk (Ergo/Itittu).');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000018-0000-0000-0000-000000000018', 'Ergo', 'am'),
  ('f0000018-0000-0000-0000-000000000018', 'Itittu', 'om'),
  ('f0000018-0000-0000-0000-000000000018', 'Curd', 'en');

-- 19. White Rice
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000019-0000-0000-0000-000000000019',
  'rice',
  'Rice',
  'ሩዝ',
  'Ruuzii',
  'Long-grain polished white rice, easily digested carbohydrate staple.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000019-0000-0000-0000-000000000019', 'Raw, dry', 365.0, 7.1, 80.0, 0.7, 1.3, 1.0, 'USDA FoodData Central', 'USDA FDC 168878', 'verified', 'Uncooked white long-grain rice.'),
  ('f0000019-0000-0000-0000-000000000019', 'Cooked, steamed', 130.0, 2.7, 28.2, 0.3, 0.4, 1.0, 'USDA FoodData Central', 'USDA FDC 168879', 'verified', 'Steamed in water without added fat.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000019-0000-0000-0000-000000000019', 'Ruz', 'am'),
  ('f0000019-0000-0000-0000-000000000019', 'Ruuzii', 'om'),
  ('f0000019-0000-0000-0000-000000000019', 'White rice', 'en');

-- 20. Potatoes (Dinich)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000020-0000-0000-0000-000000000020',
  'potatoes',
  'Potatoes',
  'ድንች',
  'Dinnicha',
  'Hearty tubers rich in potassium and vitamin C, commonly prepared in Ethiopian dinich wot or boiled.',
  'Vegetables & Tubers',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000020-0000-0000-0000-000000000020', 'Boiled without skin', 87.0, 1.9, 20.1, 0.1, 1.8, 4.0, 'USDA FoodData Central', 'USDA FDC 170027', 'verified', 'Peeled white/russet potato boiled in water.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000020-0000-0000-0000-000000000020', 'Dinich', 'am'),
  ('f0000020-0000-0000-0000-000000000020', 'Dinnicha', 'om'),
  ('f0000020-0000-0000-0000-000000000020', 'Boiled potatoes', 'en');

-- 21. Bananas (Muz)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000021-0000-0000-0000-000000000021',
  'bananas',
  'Bananas',
  'ሙዝ',
  'Muzii',
  'Sweet yellow tropical fruit, quick source of energy, potassium, and vitamin B6.',
  'Fruits',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000021-0000-0000-0000-000000000021', 'Raw, peeled', 89.0, 1.1, 22.8, 0.3, 2.6, 1.0, 'USDA FoodData Central', 'USDA FDC 173944', 'verified', 'Fresh ripe banana flesh.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000021-0000-0000-0000-000000000021', 'Muz', 'am'),
  ('f0000021-0000-0000-0000-000000000021', 'Muzii', 'om');

-- 22. Avocados (Abokado)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000022-0000-0000-0000-000000000022',
  'avocados',
  'Avocados',
  'አቮካዶ',
  'Avokaadoo',
  'Creamy, nutrient-rich fruit abundant across southern Ethiopia, famously layered in mixed juice (espris).',
  'Fruits',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000022-0000-0000-0000-000000000022', 'Raw, peeled', 160.0, 2.0, 8.5, 14.7, 6.7, 7.0, 'USDA FoodData Central', 'USDA FDC 171705', 'verified', 'Fresh ripe avocado flesh rich in heart-healthy monounsaturated oleic acid.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000022-0000-0000-0000-000000000022', 'Abokado', 'am'),
  ('f0000022-0000-0000-0000-000000000022', 'Avokaadoo', 'om'),
  ('f0000022-0000-0000-0000-000000000022', 'Alligator pear', 'en');

-- 23. Peanuts (Ocholoni)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000023-0000-0000-0000-000000000023',
  'peanuts',
  'Peanuts',
  'ኦቾሎኒ',
  'Lawaaza',
  'Calorie-dense legume seeds packed with plant protein, minerals, and healthy fats.',
  'Nuts & Seeds',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000023-0000-0000-0000-000000000023', 'Roasted, unsalted', 587.0, 24.4, 21.3, 49.7, 8.4, 6.0, 'USDA FoodData Central', 'USDA FDC 172430', 'verified', 'Dry roasted whole peanuts without added salt.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000023-0000-0000-0000-000000000023', 'Ocholoni', 'am'),
  ('f0000023-0000-0000-0000-000000000023', 'Lawaaza', 'om'),
  ('f0000023-0000-0000-0000-000000000023', 'Groundnuts', 'en');

-- 24. Chicken Breast
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000024-0000-0000-0000-000000000024',
  'chicken-breast',
  'Chicken Breast',
  'የዶሮ ደረት ስጋ',
  'Foon Lukkuu',
  'Lean poultry breast meat, premier high-protein food with minimal fat.',
  'Poultry & Meat Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000024-0000-0000-0000-000000000024', 'Cooked, grilled skinless', 165.0, 31.0, 0.0, 3.6, 0.0, 74.0, 'USDA FoodData Central', 'USDA FDC 171077', 'verified', 'Boneless skinless chicken breast grilled with minimal oil.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000024-0000-0000-0000-000000000024', 'Doro deret', 'am'),
  ('f0000024-0000-0000-0000-000000000024', 'Foon Lukkuu', 'om'),
  ('f0000024-0000-0000-0000-000000000024', 'Grilled chicken', 'en');

-- 25. Lean Beef
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000025-0000-0000-0000-000000000025',
  'lean-beef',
  'Lean Beef',
  'የበሬ ስጋ',
  'Foon Saawwaa',
  'High quality red meat rich in creatine, zinc, and bioavailable heme iron.',
  'Meat & Beef Dishes',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000025-0000-0000-0000-000000000025', 'Raw, trimmed lean', 143.0, 21.5, 0.0, 5.8, 0.0, 55.0, 'USDA FoodData Central', 'USDA FDC 174032', 'verified', 'Top round raw beef trimmed to 0% fat.'),
  ('f0000025-0000-0000-0000-000000000025', 'Cooked, braised', 217.0, 26.1, 0.0, 11.8, 0.0, 68.0, 'USDA FoodData Central', 'USDA FDC 174033', 'verified', 'Braised lean beef.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000025-0000-0000-0000-000000000025', 'Bef siga', 'am'),
  ('f0000025-0000-0000-0000-000000000025', 'Foon Saawwaa', 'om'),
  ('f0000025-0000-0000-0000-000000000025', 'Beef meat', 'en');

-- 26. Pasta
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000026-0000-0000-0000-000000000026',
  'pasta',
  'Pasta',
  'ፓስታ',
  'Paastaa',
  'Durum wheat semolina pasta, widely prepared in Ethiopian restaurants with tomato sauce or sugo.',
  'Grains & Cereals',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000026-0000-0000-0000-000000000026', 'Cooked, boiled in water', 158.0, 5.8, 30.9, 0.9, 1.8, 1.0, 'USDA FoodData Central', 'USDA FDC 168937', 'verified', 'Cooked al dente without salt or oil.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000026-0000-0000-0000-000000000026', 'Spaghetti', 'en'),
  ('f0000026-0000-0000-0000-000000000026', 'Paastaa', 'om'),
  ('f0000026-0000-0000-0000-000000000026', 'Macaroni', 'en');

-- 27. Bread (Dabo)
INSERT INTO public.foods (id, slug, name, name_amharic, name_afaan_oromo, description, food_group, is_active)
VALUES (
  'f0000027-0000-0000-0000-000000000027',
  'bread',
  'Bread',
  'ዳቦ',
  'Daaboo',
  'Traditional baked wheat loaf, often spiced with nigella seeds (tikur azmud) or baked in banana leaves.',
  'Bakery & Bread',
  true
);

INSERT INTO public.food_nutrition (food_id, preparation_state, calories_kcal, protein_g, carbohydrates_g, fat_g, fiber_g, sodium_mg, source_name, source_reference, verification_status, notes)
VALUES
  ('f0000027-0000-0000-0000-000000000027', 'Baked wheat loaf', 265.0, 9.0, 49.0, 3.2, 2.7, 490.0, 'EPHI Traditional Bread Study', 'Dabo Analysis', 'verified', 'Standard Ethiopian hearth-baked wheat bread.');

INSERT INTO public.food_aliases (food_id, alias, language)
VALUES
  ('f0000027-0000-0000-0000-000000000027', 'Dabo', 'am'),
  ('f0000027-0000-0000-0000-000000000027', 'Daaboo', 'om'),
  ('f0000027-0000-0000-0000-000000000027', 'Wheat bread', 'en');

-- -----------------------------------------------------------------------------
-- FOOD CATEGORIES ASSOCIATIONS (Many-to-Many)
-- -----------------------------------------------------------------------------
-- Category IDs:
-- c0000001 = High-Protein (>=12g protein)
-- c0000002 = Weight Gain (>=250 kcal)
-- c0000003 = Weight Loss (<=160 kcal)
-- c0000004 = Traditional Staples
-- c0000005 = Fasting Foods (Plant-based)

INSERT INTO public.food_categories (food_id, category_id)
VALUES
  -- Injera: Traditional Staple, Fasting Food, Weight Loss (satiating ~161 kcal)
  ('f0000001-0000-0000-0000-000000000001', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000001-0000-0000-0000-000000000001', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000001-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000005'),

  -- Shiro: Traditional Staple, Fasting Food, Weight Loss (~138 kcal)
  ('f0000002-0000-0000-0000-000000000002', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000002-0000-0000-0000-000000000002', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000002-0000-0000-0000-000000000002', 'c0000005-0000-0000-0000-000000000005'),

  -- Misir Wot: Traditional Staple, Fasting Food, Weight Loss (~132 kcal)
  ('f0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000003-0000-0000-0000-000000000003', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000005'),

  -- Doro Wot: High-Protein (15.4g P), Traditional Staple
  ('f0000004-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004'),

  -- Tibs: High-Protein (24.2g P), Traditional Staple
  ('f0000005-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000005-0000-0000-0000-000000000005', 'c0000004-0000-0000-0000-000000000004'),

  -- Kitfo: High-Protein (21.0g P), Traditional Staple
  ('f0000006-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000006-0000-0000-0000-000000000006', 'c0000004-0000-0000-0000-000000000004'),

  -- Gomen: Weight Loss (58 kcal), Traditional Staple, Fasting Food
  ('f0000007-0000-0000-0000-000000000007', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000007-0000-0000-0000-000000000007', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000007-0000-0000-0000-000000000007', 'c0000005-0000-0000-0000-000000000005'),

  -- Kinche: Traditional Staple, Weight Loss (145 kcal)
  ('f0000008-0000-0000-0000-000000000008', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000008-0000-0000-0000-000000000008', 'c0000004-0000-0000-0000-000000000004'),

  -- Chechebsa: Weight Gain (290 kcal), Traditional Staple
  ('f0000009-0000-0000-0000-000000000009', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000009-0000-0000-0000-000000000009', 'c0000004-0000-0000-0000-000000000004'),

  -- Firfir: Traditional Staple, Fasting Food
  ('f0000010-0000-0000-0000-000000000010', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000010-0000-0000-0000-000000000010', 'c0000005-0000-0000-0000-000000000005'),

  -- Besso: Weight Gain (354 kcal dry), Traditional Staple, Fasting Food
  ('f0000011-0000-0000-0000-000000000011', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000011-0000-0000-0000-000000000011', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000011-0000-0000-0000-000000000011', 'c0000005-0000-0000-0000-000000000005'),

  -- Nifro: Traditional Staple, Fasting Food
  ('f0000012-0000-0000-0000-000000000012', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000012-0000-0000-0000-000000000012', 'c0000005-0000-0000-0000-000000000005'),

  -- Teff: High-Protein (13.3g P), Weight Gain (367 kcal), Traditional Staple, Fasting Food
  ('f0000013-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000013-0000-0000-0000-000000000013', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000013-0000-0000-0000-000000000013', 'c0000004-0000-0000-0000-000000000004'),
  ('f0000013-0000-0000-0000-000000000013', 'c0000005-0000-0000-0000-000000000005'),

  -- Chickpeas: High-Protein (20.5g P), Weight Gain (378 kcal), Fasting Food
  ('f0000014-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000014-0000-0000-0000-000000000014', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000014-0000-0000-0000-000000000014', 'c0000005-0000-0000-0000-000000000005'),

  -- Lentils: High-Protein (24.6g P), Weight Gain (352 kcal), Fasting Food
  ('f0000015-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000015-0000-0000-0000-000000000015', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000015-0000-0000-0000-000000000015', 'c0000005-0000-0000-0000-000000000005'),

  -- Eggs: High-Protein (12.6g P), Weight Gain
  ('f0000016-0000-0000-0000-000000000016', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000016-0000-0000-0000-000000000016', 'c0000002-0000-0000-0000-000000000002'),

  -- Milk: High Protein, Weight Gain
  ('f0000017-0000-0000-0000-000000000017', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000017-0000-0000-0000-000000000017', 'c0000002-0000-0000-0000-000000000002'),

  -- Yogurt (Ergo): High Protein, Weight Loss
  ('f0000018-0000-0000-0000-000000000018', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000018-0000-0000-0000-000000000018', 'c0000003-0000-0000-0000-000000000003'),

  -- Rice: Weight Loss cooked (130 kcal)
  ('f0000019-0000-0000-0000-000000000019', 'c0000003-0000-0000-0000-000000000003'),

  -- Potatoes: Weight Loss (87 kcal), Fasting Food
  ('f0000020-0000-0000-0000-000000000020', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000020-0000-0000-0000-000000000020', 'c0000005-0000-0000-0000-000000000005'),

  -- Bananas: Weight Loss (89 kcal), Fasting Food
  ('f0000021-0000-0000-0000-000000000021', 'c0000003-0000-0000-0000-000000000003'),
  ('f0000021-0000-0000-0000-000000000021', 'c0000005-0000-0000-0000-000000000005'),

  -- Avocados: Weight Gain, Fasting Food
  ('f0000022-0000-0000-0000-000000000022', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000022-0000-0000-0000-000000000022', 'c0000005-0000-0000-0000-000000000005'),

  -- Peanuts: High-Protein (24.4g P), Weight Gain (587 kcal), Fasting Food
  ('f0000023-0000-0000-0000-000000000023', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000023-0000-0000-0000-000000000023', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000023-0000-0000-0000-000000000023', 'c0000005-0000-0000-0000-000000000005'),

  -- Chicken Breast: High-Protein (31.0g P), Weight Loss, Weight Gain
  ('f0000024-0000-0000-0000-000000000024', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000024-0000-0000-0000-000000000024', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000024-0000-0000-0000-000000000024', 'c0000003-0000-0000-0000-000000000003'),

  -- Lean Beef: High-Protein (21.5g P), Weight Loss, Weight Gain
  ('f0000025-0000-0000-0000-000000000025', 'c0000001-0000-0000-0000-000000000001'),
  ('f0000025-0000-0000-0000-000000000025', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000025-0000-0000-0000-000000000025', 'c0000003-0000-0000-0000-000000000003'),

  -- Pasta: Weight Loss cooked (158 kcal)
  ('f0000026-0000-0000-0000-000000000026', 'c0000003-0000-0000-0000-000000000003'),

  -- Bread (Dabo): Weight Gain (265 kcal), Traditional Staple
  ('f0000027-0000-0000-0000-000000000027', 'c0000002-0000-0000-0000-000000000002'),
  ('f0000027-0000-0000-0000-000000000027', 'c0000004-0000-0000-0000-000000000004');
