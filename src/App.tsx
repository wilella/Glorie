import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const TODAY = new Date().toISOString().slice(0, 10);

// ─── MEAL DATABASE ────────────────────────────────────────────────────────────
const MEAL_DB = [
  // ── FROZEN MEALS ─────────────────────────────────────────────────────────────
  { name: "Healthy Choice Power Bowls Chicken Marinara", cal: 360, protein: 28, carbs: 43, fat: 8, serving: "1 bowl (283g)" },
  { name: "Healthy Choice Simply Steamers Burrito Bowl", cal: 310, protein: 12, carbs: 53, fat: 5, serving: "1 bowl" },
  { name: "Healthy Choice Café Steamers Grilled Basil Chicken", cal: 280, protein: 22, carbs: 36, fat: 5, serving: "1 meal" },
  { name: "Healthy Choice Power Bowls Adobo Chicken", cal: 370, protein: 30, carbs: 45, fat: 8, serving: "1 bowl" },
  { name: "Healthy Choice Chicken Tikka Masala", cal: 290, protein: 22, carbs: 36, fat: 6, serving: "1 bowl" },
  { name: "Healthy Choice Simply Steamers Chicken & Vegetables", cal: 190, protein: 19, carbs: 21, fat: 3, serving: "1 bowl" },
  { name: "Healthy Choice Zero Chicken Fettuccine Alfredo", cal: 270, protein: 18, carbs: 38, fat: 6, serving: "1 meal" },
  { name: "Healthy Choice Simply Steamers Pineapple Chicken", cal: 340, protein: 20, carbs: 51, fat: 6, serving: "1 bowl" },
  { name: "Lean Cuisine Chicken Teriyaki", cal: 290, protein: 16, carbs: 45, fat: 4, serving: "1 meal" },
  { name: "Lean Cuisine Chicken Marsala", cal: 250, protein: 17, carbs: 31, fat: 6, serving: "1 meal" },
  { name: "Lean Cuisine Butternut Squash Ravioli", cal: 260, protein: 9, carbs: 43, fat: 6, serving: "1 meal" },
  { name: "Lean Cuisine Beef & Vegetable Bowl", cal: 280, protein: 19, carbs: 36, fat: 6, serving: "1 meal" },
  { name: "Lean Cuisine Chicken Pot Pie", cal: 310, protein: 12, carbs: 40, fat: 10, serving: "1 meal" },
  { name: "Lean Cuisine Vermont White Cheddar Mac", cal: 280, protein: 11, carbs: 46, fat: 7, serving: "1 meal" },
  { name: "Amy's Bowls Teriyaki", cal: 310, protein: 9, carbs: 57, fat: 6, serving: "1 bowl" },
  { name: "Amy's Burrito Especial", cal: 320, protein: 10, carbs: 54, fat: 8, serving: "1 burrito" },
  { name: "Amy's Black Bean Enchilada", cal: 330, protein: 11, carbs: 50, fat: 10, serving: "1 meal" },
  { name: "Trader Joe's Mandarin Orange Chicken (1 cup)", cal: 430, protein: 18, carbs: 54, fat: 16, serving: "1 cup" },
  { name: "Trader Joe's Indian Fare Chana Masala", cal: 240, protein: 11, carbs: 44, fat: 3, serving: "1 package" },
  { name: "Bird's Eye Protein Bowl Chicken Fried Rice", cal: 340, protein: 20, carbs: 47, fat: 8, serving: "1 bowl" },
  // ── CHICKEN ───────────────────────────────────────────────────────────────────
  { name: "Grilled Chicken Breast (2 oz)", cal: 93, protein: 17, carbs: 0, fat: 2, serving: "2 oz (57g)" },
  { name: "Grilled Chicken Breast (3 oz)", cal: 140, protein: 26, carbs: 0, fat: 3, serving: "3 oz (85g)" },
  { name: "Grilled Chicken Breast (4 oz)", cal: 185, protein: 35, carbs: 0, fat: 4, serving: "4 oz (113g)" },
  { name: "Grilled Chicken Breast (5 oz)", cal: 231, protein: 43, carbs: 0, fat: 5, serving: "5 oz" },
  { name: "Grilled Chicken Breast (6 oz)", cal: 280, protein: 52, carbs: 0, fat: 6, serving: "6 oz (170g)" },
  { name: "Baked Chicken Breast (4 oz)", cal: 185, protein: 35, carbs: 0, fat: 4, serving: "4 oz" },
  { name: "Rotisserie Chicken (3 oz, no skin)", cal: 130, protein: 23, carbs: 0, fat: 4, serving: "3 oz" },
  { name: "Rotisserie Chicken Breast (half)", cal: 240, protein: 44, carbs: 0, fat: 6, serving: "half breast" },
  { name: "Chicken Thigh, Boneless Skinless (3 oz)", cal: 150, protein: 22, carbs: 0, fat: 7, serving: "3 oz" },
  { name: "Chicken Thigh, Boneless Skinless (4 oz)", cal: 200, protein: 29, carbs: 0, fat: 9, serving: "4 oz" },
  { name: "Chicken Drumstick (1 medium, no skin)", cal: 116, protein: 19, carbs: 0, fat: 4, serving: "1 drumstick" },
  { name: "Chicken Wing (1, no skin)", cal: 43, protein: 6, carbs: 0, fat: 2, serving: "1 wing" },
  { name: "Shredded Chicken (1/2 cup)", cal: 110, protein: 20, carbs: 0, fat: 3, serving: "1/2 cup (85g)" },
  { name: "Chicken Strips, Baked (3 oz)", cal: 170, protein: 24, carbs: 10, fat: 4, serving: "3 oz" },
  { name: "Chicken Nuggets, Baked (6 pieces)", cal: 270, protein: 14, carbs: 24, fat: 12, serving: "6 pieces" },
  // ── TURKEY & PORK ────────────────────────────────────────────────────────────
  { name: "Ground Turkey (3 oz, 93% lean)", cal: 130, protein: 22, carbs: 0, fat: 5, serving: "3 oz" },
  { name: "Ground Turkey (4 oz, 93% lean)", cal: 170, protein: 29, carbs: 0, fat: 6, serving: "4 oz" },
  { name: "Ground Turkey (4 oz, 85% lean)", cal: 200, protein: 27, carbs: 0, fat: 10, serving: "4 oz" },
  { name: "Turkey Breast Deli (2 oz)", cal: 60, protein: 12, carbs: 1, fat: 1, serving: "2 oz (57g)" },
  { name: "Turkey Burger Patty (4 oz, 93% lean)", cal: 170, protein: 29, carbs: 0, fat: 6, serving: "4 oz patty" },
  { name: "Turkey Meatballs (3 oz)", cal: 160, protein: 18, carbs: 6, fat: 7, serving: "3 oz (~3 meatballs)" },
  { name: "Pork Tenderloin (3 oz)", cal: 120, protein: 22, carbs: 0, fat: 3, serving: "3 oz" },
  { name: "Pork Chop, Lean (3 oz)", cal: 137, protein: 22, carbs: 0, fat: 5, serving: "3 oz" },
  { name: "Canadian Bacon (2 oz)", cal: 68, protein: 11, carbs: 1, fat: 2, serving: "2 oz" },
  { name: "Turkey Bacon (2 strips)", cal: 70, protein: 6, carbs: 1, fat: 4, serving: "2 strips" },
  // ── BEEF ─────────────────────────────────────────────────────────────────────
  { name: "Ground Beef (3 oz, 90% lean)", cal: 150, protein: 23, carbs: 0, fat: 7, serving: "3 oz" },
  { name: "Ground Beef (4 oz, 90% lean)", cal: 200, protein: 30, carbs: 0, fat: 9, serving: "4 oz" },
  { name: "Ground Beef (4 oz, 80% lean)", cal: 280, protein: 26, carbs: 0, fat: 19, serving: "4 oz" },
  { name: "Sirloin Steak (3 oz)", cal: 158, protein: 24, carbs: 0, fat: 7, serving: "3 oz" },
  { name: "Sirloin Steak (6 oz)", cal: 315, protein: 48, carbs: 0, fat: 13, serving: "6 oz" },
  { name: "Filet Mignon (3 oz)", cal: 165, protein: 23, carbs: 0, fat: 8, serving: "3 oz" },
  { name: "Ribeye Steak (4 oz)", cal: 310, protein: 26, carbs: 0, fat: 22, serving: "4 oz" },
  { name: "Beef Burger Patty (4 oz, 90% lean)", cal: 200, protein: 28, carbs: 0, fat: 10, serving: "4 oz patty" },
  { name: "Beef Meatballs (3 oz)", cal: 190, protein: 14, carbs: 7, fat: 12, serving: "3 oz" },
  { name: "Beef Taco Meat (3 oz, seasoned)", cal: 180, protein: 19, carbs: 3, fat: 10, serving: "3 oz" },
  { name: "Deli Ham (2 oz)", cal: 60, protein: 10, carbs: 2, fat: 2, serving: "2 oz" },
  // ── SEAFOOD ──────────────────────────────────────────────────────────────────
  { name: "Salmon Fillet (3 oz)", cal: 177, protein: 17, carbs: 0, fat: 11, serving: "3 oz" },
  { name: "Salmon Fillet (4 oz)", cal: 234, protein: 23, carbs: 0, fat: 14, serving: "4 oz" },
  { name: "Salmon Fillet (6 oz)", cal: 354, protein: 34, carbs: 0, fat: 22, serving: "6 oz" },
  { name: "Tuna in Water (3 oz can)", cal: 80, protein: 18, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Tuna in Olive Oil (3 oz can)", cal: 140, protein: 18, carbs: 0, fat: 7, serving: "3 oz" },
  { name: "Tilapia (3 oz)", cal: 110, protein: 22, carbs: 0, fat: 2, serving: "3 oz" },
  { name: "Tilapia (4 oz)", cal: 145, protein: 29, carbs: 0, fat: 3, serving: "4 oz" },
  { name: "Shrimp (3 oz, steamed)", cal: 84, protein: 18, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Shrimp (6 oz, steamed)", cal: 168, protein: 36, carbs: 0, fat: 2, serving: "6 oz" },
  { name: "Cod (3 oz, baked)", cal: 90, protein: 20, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Halibut (3 oz)", cal: 119, protein: 23, carbs: 0, fat: 2, serving: "3 oz" },
  { name: "Mahi Mahi (3 oz)", cal: 93, protein: 20, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Crab Meat (3 oz)", cal: 82, protein: 17, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Lobster (3 oz)", cal: 83, protein: 17, carbs: 1, fat: 1, serving: "3 oz" },
  { name: "Sardines in Water (3 oz)", cal: 140, protein: 20, carbs: 0, fat: 6, serving: "3 oz" },
  { name: "Scallops (3 oz, pan-seared)", cal: 100, protein: 19, carbs: 3, fat: 1, serving: "3 oz" },
  { name: "Tuna Salad (1/2 cup, light mayo)", cal: 190, protein: 21, carbs: 4, fat: 9, serving: "1/2 cup" },
  // ── EGGS & DAIRY ─────────────────────────────────────────────────────────────
  { name: "Whole Egg (1 large)", cal: 72, protein: 6, carbs: 0, fat: 5, serving: "1 egg" },
  { name: "Eggs (2 large)", cal: 143, protein: 13, carbs: 1, fat: 10, serving: "2 eggs" },
  { name: "Eggs (3 large)", cal: 214, protein: 19, carbs: 1, fat: 14, serving: "3 eggs" },
  { name: "Egg Whites (3 large)", cal: 51, protein: 11, carbs: 1, fat: 0, serving: "3 whites" },
  { name: "Egg Whites (6 large)", cal: 102, protein: 22, carbs: 1, fat: 0, serving: "6 whites" },
  { name: "Scrambled Eggs (2 eggs, no butter)", cal: 182, protein: 13, carbs: 2, fat: 14, serving: "2 eggs" },
  { name: "Scrambled Eggs (3 eggs, no butter)", cal: 270, protein: 19, carbs: 2, fat: 20, serving: "3 eggs" },
  { name: "Hard Boiled Egg (1)", cal: 78, protein: 6, carbs: 1, fat: 5, serving: "1 egg" },
  { name: "Omelette (2 eggs, veggies, no cheese)", cal: 200, protein: 15, carbs: 5, fat: 13, serving: "1 omelette" },
  { name: "Omelette (3 eggs, cheese, veggies)", cal: 340, protein: 24, carbs: 5, fat: 25, serving: "1 omelette" },
  { name: "Greek Yogurt Plain Nonfat (6 oz)", cal: 100, protein: 17, carbs: 6, fat: 0, serving: "6 oz" },
  { name: "Greek Yogurt Plain 2% (6 oz)", cal: 130, protein: 15, carbs: 8, fat: 4, serving: "6 oz" },
  { name: "Greek Yogurt with Honey (5.3 oz)", cal: 150, protein: 11, carbs: 22, fat: 2, serving: "5.3 oz" },
  { name: "Chobani Plain Non-Fat (5.3 oz)", cal: 80, protein: 14, carbs: 6, fat: 0, serving: "5.3 oz" },
  { name: "Cottage Cheese 2% (1/2 cup)", cal: 90, protein: 12, carbs: 5, fat: 2, serving: "1/2 cup" },
  { name: "Cottage Cheese 4% (1/2 cup)", cal: 110, protein: 12, carbs: 4, fat: 5, serving: "1/2 cup" },
  { name: "Skim Milk (1 cup)", cal: 83, protein: 8, carbs: 12, fat: 0, serving: "1 cup" },
  { name: "Whole Milk (1 cup)", cal: 149, protein: 8, carbs: 12, fat: 8, serving: "1 cup" },
  { name: "2% Milk (1 cup)", cal: 122, protein: 8, carbs: 12, fat: 5, serving: "1 cup" },
  { name: "String Cheese (1 stick)", cal: 80, protein: 7, carbs: 0, fat: 5, serving: "1 stick" },
  { name: "Cheese, Cheddar (1 oz)", cal: 115, protein: 7, carbs: 0, fat: 9, serving: "1 oz" },
  { name: "Cheese, Mozzarella (1 oz)", cal: 85, protein: 6, carbs: 1, fat: 6, serving: "1 oz" },
  { name: "Cheese, Swiss (1 oz)", cal: 108, protein: 8, carbs: 2, fat: 8, serving: "1 oz" },
  { name: "Cheese, Feta (1 oz)", cal: 75, protein: 4, carbs: 1, fat: 6, serving: "1 oz" },
  { name: "Cheese, Parmesan (2 tbsp)", cal: 43, protein: 4, carbs: 0, fat: 3, serving: "2 tbsp" },
  // ── GRAINS & CARBS ────────────────────────────────────────────────────────────
  { name: "White Rice, Cooked (1/3 cup)", cal: 68, protein: 1, carbs: 15, fat: 0, serving: "1/3 cup" },
  { name: "White Rice, Cooked (1/2 cup)", cal: 103, protein: 2, carbs: 22, fat: 0, serving: "1/2 cup" },
  { name: "White Rice, Cooked (1 cup)", cal: 206, protein: 4, carbs: 45, fat: 0, serving: "1 cup" },
  { name: "Brown Rice, Cooked (1/2 cup)", cal: 108, protein: 2, carbs: 22, fat: 1, serving: "1/2 cup" },
  { name: "Brown Rice, Cooked (1 cup)", cal: 216, protein: 5, carbs: 45, fat: 2, serving: "1 cup" },
  { name: "Jasmine Rice, Cooked (1 cup)", cal: 205, protein: 4, carbs: 45, fat: 0, serving: "1 cup" },
  { name: "Cauliflower Rice (1 cup)", cal: 25, protein: 2, carbs: 5, fat: 0, serving: "1 cup" },
  { name: "Quinoa, Cooked (1/2 cup)", cal: 111, protein: 4, carbs: 20, fat: 2, serving: "1/2 cup" },
  { name: "Quinoa, Cooked (1 cup)", cal: 222, protein: 8, carbs: 39, fat: 4, serving: "1 cup" },
  { name: "Oatmeal, Cooked (1/2 cup)", cal: 77, protein: 3, carbs: 14, fat: 2, serving: "1/2 cup" },
  { name: "Oatmeal, Cooked (1 cup)", cal: 154, protein: 6, carbs: 28, fat: 3, serving: "1 cup" },
  { name: "Rolled Oats, Dry (1/2 cup)", cal: 150, protein: 5, carbs: 27, fat: 3, serving: "1/2 cup" },
  { name: "Overnight Oats (oats, almond milk, berries)", cal: 310, protein: 11, carbs: 52, fat: 7, serving: "1 jar" },
  { name: "Pasta, Cooked (1/2 cup)", cal: 110, protein: 4, carbs: 22, fat: 0, serving: "1/2 cup" },
  { name: "Pasta, Cooked (1 cup)", cal: 220, protein: 8, carbs: 43, fat: 1, serving: "1 cup" },
  { name: "Pasta, Whole Wheat (1 cup)", cal: 174, protein: 7, carbs: 37, fat: 1, serving: "1 cup" },
  { name: "Spaghetti with Marinara (1 cup pasta + sauce)", cal: 290, protein: 10, carbs: 54, fat: 4, serving: "1 cup" },
  { name: "Sweet Potato, Baked (small)", cal: 60, protein: 1, carbs: 14, fat: 0, serving: "1 small" },
  { name: "Sweet Potato, Baked (medium)", cal: 103, protein: 2, carbs: 24, fat: 0, serving: "1 medium" },
  { name: "Sweet Potato, Baked (large)", cal: 162, protein: 4, carbs: 37, fat: 0, serving: "1 large" },
  { name: "White Potato, Baked (medium)", cal: 161, protein: 4, carbs: 37, fat: 0, serving: "1 medium" },
  { name: "White Potato, Baked (large)", cal: 220, protein: 6, carbs: 51, fat: 0, serving: "1 large" },
  { name: "Bread, White (1 slice)", cal: 79, protein: 3, carbs: 15, fat: 1, serving: "1 slice" },
  { name: "Bread, Whole Wheat (1 slice)", cal: 80, protein: 4, carbs: 15, fat: 1, serving: "1 slice" },
  { name: "Bread, Sourdough (1 slice)", cal: 93, protein: 4, carbs: 18, fat: 1, serving: "1 slice" },
  { name: "Bagel, Plain (1 medium)", cal: 270, protein: 11, carbs: 53, fat: 2, serving: "1 medium bagel" },
  { name: "English Muffin (1)", cal: 132, protein: 5, carbs: 26, fat: 1, serving: "1 muffin" },
  { name: "Tortilla, Flour (medium, 8-inch)", cal: 146, protein: 4, carbs: 25, fat: 4, serving: "1 tortilla" },
  { name: "Tortilla, Corn (2 small)", cal: 104, protein: 3, carbs: 22, fat: 1, serving: "2 tortillas" },
  { name: "Tortilla, Low-Carb Wheat (1)", cal: 80, protein: 6, carbs: 14, fat: 3, serving: "1 tortilla" },
  { name: "Pita Bread (1 small)", cal: 77, protein: 3, carbs: 16, fat: 0, serving: "1 small pita" },
  { name: "Crackers, Wheat Thins (16 crackers)", cal: 140, protein: 2, carbs: 22, fat: 5, serving: "16 crackers" },
  { name: "Rice Cake, Plain (1)", cal: 35, protein: 1, carbs: 7, fat: 0, serving: "1 cake" },
  { name: "Rice Cake with PB (1 cake + 1 tbsp)", cal: 130, protein: 4, carbs: 13, fat: 8, serving: "1 cake" },
  { name: "Granola (1/4 cup)", cal: 150, protein: 4, carbs: 22, fat: 6, serving: "1/4 cup" },
  { name: "Cereal, Special K (1 cup)", cal: 120, protein: 6, carbs: 22, fat: 1, serving: "1 cup" },
  { name: "Cereal, Cheerios (1 cup)", cal: 100, protein: 3, carbs: 20, fat: 2, serving: "1 cup" },
  { name: "Cereal, Frosted Flakes (3/4 cup)", cal: 110, protein: 1, carbs: 27, fat: 0, serving: "3/4 cup" },
  // ── VEGETABLES ────────────────────────────────────────────────────────────────
  { name: "Broccoli (1/2 cup, steamed)", cal: 27, protein: 2, carbs: 5, fat: 0, serving: "1/2 cup" },
  { name: "Broccoli (1 cup, steamed)", cal: 55, protein: 4, carbs: 11, fat: 1, serving: "1 cup" },
  { name: "Broccoli (2 cups, steamed)", cal: 110, protein: 8, carbs: 22, fat: 1, serving: "2 cups" },
  { name: "Spinach (1 cup, raw)", cal: 7, protein: 1, carbs: 1, fat: 0, serving: "1 cup" },
  { name: "Spinach (2 cups, raw)", cal: 14, protein: 2, carbs: 2, fat: 0, serving: "2 cups" },
  { name: "Kale (1 cup, raw)", cal: 33, protein: 2, carbs: 6, fat: 0, serving: "1 cup" },
  { name: "Mixed Salad Greens (2 cups)", cal: 20, protein: 2, carbs: 3, fat: 0, serving: "2 cups" },
  { name: "Asparagus (6 spears)", cal: 20, protein: 2, carbs: 4, fat: 0, serving: "6 spears" },
  { name: "Green Beans (1 cup, cooked)", cal: 44, protein: 2, carbs: 10, fat: 0, serving: "1 cup" },
  { name: "Brussels Sprouts (1 cup, roasted)", cal: 65, protein: 5, carbs: 13, fat: 1, serving: "1 cup" },
  { name: "Cauliflower (1 cup, roasted)", cal: 40, protein: 3, carbs: 8, fat: 0, serving: "1 cup" },
  { name: "Zucchini (1 cup, cooked)", cal: 27, protein: 2, carbs: 5, fat: 0, serving: "1 cup" },
  { name: "Bell Pepper (1 medium)", cal: 37, protein: 1, carbs: 9, fat: 0, serving: "1 medium" },
  { name: "Cucumber (1 cup, sliced)", cal: 16, protein: 1, carbs: 4, fat: 0, serving: "1 cup" },
  { name: "Celery (2 stalks)", cal: 12, protein: 1, carbs: 2, fat: 0, serving: "2 stalks" },
  { name: "Carrots (1 medium)", cal: 25, protein: 1, carbs: 6, fat: 0, serving: "1 medium" },
  { name: "Carrots (1 cup, sliced)", cal: 52, protein: 1, carbs: 12, fat: 0, serving: "1 cup" },
  { name: "Cherry Tomatoes (1 cup)", cal: 27, protein: 1, carbs: 6, fat: 0, serving: "1 cup" },
  { name: "Avocado (1/4)", cal: 60, protein: 1, carbs: 3, fat: 5, serving: "1/4 medium" },
  { name: "Avocado (1/2)", cal: 120, protein: 2, carbs: 6, fat: 11, serving: "1/2 medium" },
  { name: "Avocado (1 whole)", cal: 240, protein: 3, carbs: 13, fat: 22, serving: "1 whole" },
  { name: "Corn (1 ear)", cal: 77, protein: 3, carbs: 17, fat: 1, serving: "1 ear" },
  { name: "Corn (1/2 cup)", cal: 66, protein: 2, carbs: 15, fat: 1, serving: "1/2 cup" },
  { name: "Edamame (1/2 cup, shelled)", cal: 94, protein: 8, carbs: 8, fat: 4, serving: "1/2 cup" },
  { name: "Edamame (1 cup, shelled)", cal: 188, protein: 16, carbs: 16, fat: 8, serving: "1 cup" },
  { name: "Mixed Vegetables (1 cup, steamed)", cal: 59, protein: 3, carbs: 12, fat: 0, serving: "1 cup" },
  // ── FRUITS ────────────────────────────────────────────────────────────────────
  { name: "Apple (small)", cal: 77, protein: 0, carbs: 20, fat: 0, serving: "1 small" },
  { name: "Apple (medium)", cal: 95, protein: 0, carbs: 25, fat: 0, serving: "1 medium" },
  { name: "Apple (large)", cal: 116, protein: 1, carbs: 31, fat: 0, serving: "1 large" },
  { name: "Banana (small)", cal: 72, protein: 1, carbs: 19, fat: 0, serving: "1 small" },
  { name: "Banana (medium)", cal: 105, protein: 1, carbs: 27, fat: 0, serving: "1 medium" },
  { name: "Banana (large)", cal: 121, protein: 2, carbs: 31, fat: 0, serving: "1 large" },
  { name: "Strawberries (1/2 cup)", cal: 25, protein: 1, carbs: 6, fat: 0, serving: "1/2 cup" },
  { name: "Strawberries (1 cup)", cal: 49, protein: 1, carbs: 12, fat: 0, serving: "1 cup" },
  { name: "Blueberries (1/2 cup)", cal: 42, protein: 1, carbs: 11, fat: 0, serving: "1/2 cup" },
  { name: "Blueberries (1 cup)", cal: 84, protein: 1, carbs: 21, fat: 0, serving: "1 cup" },
  { name: "Raspberries (1 cup)", cal: 64, protein: 1, carbs: 15, fat: 1, serving: "1 cup" },
  { name: "Mixed Berries (1 cup)", cal: 70, protein: 1, carbs: 17, fat: 0, serving: "1 cup" },
  { name: "Orange (medium)", cal: 62, protein: 1, carbs: 15, fat: 0, serving: "1 medium" },
  { name: "Grapes (1 cup)", cal: 104, protein: 1, carbs: 27, fat: 0, serving: "1 cup" },
  { name: "Watermelon (2 cups, cubed)", cal: 86, protein: 2, carbs: 22, fat: 0, serving: "2 cups" },
  { name: "Mango (1 cup, sliced)", cal: 107, protein: 1, carbs: 28, fat: 0, serving: "1 cup" },
  { name: "Pineapple (1 cup, chunks)", cal: 82, protein: 1, carbs: 22, fat: 0, serving: "1 cup" },
  { name: "Peach (1 medium)", cal: 58, protein: 1, carbs: 14, fat: 0, serving: "1 medium" },
  { name: "Pear (1 medium)", cal: 101, protein: 1, carbs: 27, fat: 0, serving: "1 medium" },
  { name: "Kiwi (1 medium)", cal: 42, protein: 1, carbs: 10, fat: 0, serving: "1 medium" },
  { name: "Grapefruit (1/2)", cal: 52, protein: 1, carbs: 13, fat: 0, serving: "1/2 medium" },
  { name: "Cherries (1 cup)", cal: 87, protein: 1, carbs: 22, fat: 0, serving: "1 cup" },
  { name: "Dates (2 Medjool)", cal: 133, protein: 1, carbs: 36, fat: 0, serving: "2 dates" },
  // ── BEANS & LEGUMES ───────────────────────────────────────────────────────────
  { name: "Black Beans (1/2 cup, cooked)", cal: 109, protein: 7, carbs: 20, fat: 0, serving: "1/2 cup" },
  { name: "Black Beans (1 cup, cooked)", cal: 218, protein: 15, carbs: 40, fat: 1, serving: "1 cup" },
  { name: "Chickpeas / Garbanzo (1/2 cup)", cal: 134, protein: 7, carbs: 22, fat: 2, serving: "1/2 cup" },
  { name: "Chickpeas / Garbanzo (1 cup)", cal: 268, protein: 15, carbs: 45, fat: 4, serving: "1 cup" },
  { name: "Lentils, Cooked (1/2 cup)", cal: 115, protein: 9, carbs: 20, fat: 0, serving: "1/2 cup" },
  { name: "Kidney Beans (1/2 cup)", cal: 113, protein: 8, carbs: 20, fat: 0, serving: "1/2 cup" },
  { name: "Pinto Beans (1/2 cup)", cal: 122, protein: 8, carbs: 22, fat: 1, serving: "1/2 cup" },
  { name: "Refried Beans (1/2 cup, fat-free)", cal: 110, protein: 7, carbs: 20, fat: 0, serving: "1/2 cup" },
  { name: "Hummus (2 tbsp)", cal: 50, protein: 2, carbs: 5, fat: 3, serving: "2 tbsp" },
  { name: "Hummus (1/4 cup)", cal: 100, protein: 5, carbs: 9, fat: 6, serving: "1/4 cup" },
  // ── NUTS, SEEDS & FATS ────────────────────────────────────────────────────────
  { name: "Almonds (1 oz / 23 nuts)", cal: 164, protein: 6, carbs: 6, fat: 14, serving: "1 oz" },
  { name: "Walnuts (1 oz / 14 halves)", cal: 185, protein: 4, carbs: 4, fat: 18, serving: "1 oz" },
  { name: "Cashews (1 oz / 18 nuts)", cal: 157, protein: 5, carbs: 9, fat: 12, serving: "1 oz" },
  { name: "Peanuts (1 oz)", cal: 166, protein: 7, carbs: 6, fat: 14, serving: "1 oz" },
  { name: "Mixed Nuts (1 oz)", cal: 168, protein: 5, carbs: 7, fat: 15, serving: "1 oz" },
  { name: "Peanut Butter (1 tbsp)", cal: 95, protein: 4, carbs: 4, fat: 8, serving: "1 tbsp" },
  { name: "Peanut Butter (2 tbsp)", cal: 190, protein: 8, carbs: 7, fat: 16, serving: "2 tbsp" },
  { name: "Almond Butter (2 tbsp)", cal: 196, protein: 7, carbs: 6, fat: 18, serving: "2 tbsp" },
  { name: "Sunflower Seeds (1 oz)", cal: 165, protein: 5, carbs: 7, fat: 14, serving: "1 oz" },
  { name: "Chia Seeds (1 tbsp)", cal: 58, protein: 2, carbs: 5, fat: 4, serving: "1 tbsp" },
  { name: "Flaxseed (1 tbsp)", cal: 37, protein: 1, carbs: 2, fat: 3, serving: "1 tbsp" },
  { name: "Olive Oil (1 tbsp)", cal: 119, protein: 0, carbs: 0, fat: 14, serving: "1 tbsp" },
  { name: "Coconut Oil (1 tbsp)", cal: 121, protein: 0, carbs: 0, fat: 14, serving: "1 tbsp" },
  { name: "Butter (1 tbsp)", cal: 102, protein: 0, carbs: 0, fat: 12, serving: "1 tbsp" },
  // ── PROTEIN SUPPLEMENTS ───────────────────────────────────────────────────────
  { name: "Whey Protein Shake (1 scoop in water)", cal: 120, protein: 24, carbs: 3, fat: 2, serving: "1 scoop (~30g)" },
  { name: "Whey Protein Shake (1 scoop in milk)", cal: 220, protein: 29, carbs: 15, fat: 5, serving: "1 scoop + 1 cup skim milk" },
  { name: "Casein Protein Shake (1 scoop)", cal: 120, protein: 24, carbs: 3, fat: 1, serving: "1 scoop" },
  { name: "Plant Protein Shake (1 scoop)", cal: 130, protein: 22, carbs: 6, fat: 3, serving: "1 scoop" },
  { name: "Protein Bar (Quest Bar)", cal: 190, protein: 21, carbs: 21, fat: 8, serving: "1 bar (60g)" },
  { name: "Protein Bar (RXBar)", cal: 210, protein: 12, carbs: 24, fat: 9, serving: "1 bar (52g)" },
  { name: "Protein Bar (Clif Builder's)", cal: 270, protein: 20, carbs: 30, fat: 8, serving: "1 bar" },
  { name: "Protein Bar (KIND Protein)", cal: 250, protein: 12, carbs: 24, fat: 12, serving: "1 bar" },
  { name: "Protein Bar (ONE Bar)", cal: 220, protein: 20, carbs: 24, fat: 8, serving: "1 bar" },
  { name: "Protein Pudding (1 serving)", cal: 150, protein: 15, carbs: 12, fat: 4, serving: "1 cup" },
  // ── SMOOTHIES & SHAKES ────────────────────────────────────────────────────────
  { name: "Protein Smoothie (banana, protein, almond milk)", cal: 320, protein: 26, carbs: 45, fat: 4, serving: "~16 oz" },
  { name: "Green Smoothie (spinach, banana, protein)", cal: 280, protein: 24, carbs: 40, fat: 3, serving: "~16 oz" },
  { name: "Berry Protein Shake (berries, Greek yogurt, protein)", cal: 290, protein: 28, carbs: 35, fat: 3, serving: "~16 oz" },
  { name: "Peanut Butter Banana Shake", cal: 420, protein: 22, carbs: 50, fat: 16, serving: "~16 oz" },
  { name: "Chocolate Protein Shake (1 scoop + almond milk)", cal: 160, protein: 25, carbs: 8, fat: 4, serving: "~12 oz" },
  { name: "Smoothie King Lean1 Vanilla (20 oz)", cal: 260, protein: 20, carbs: 38, fat: 4, serving: "20 oz" },
  // ── BREAKFAST ─────────────────────────────────────────────────────────────────
  { name: "Avocado Toast (1 slice wheat, 1/4 avocado)", cal: 175, protein: 5, carbs: 20, fat: 9, serving: "1 slice" },
  { name: "Avocado Toast (2 slices wheat, 1/2 avocado)", cal: 350, protein: 10, carbs: 40, fat: 18, serving: "2 slices" },
  { name: "Greek Yogurt Parfait (yogurt, berries, granola)", cal: 280, protein: 16, carbs: 42, fat: 6, serving: "1 cup" },
  { name: "Pancakes (2 medium, plain)", cal: 260, protein: 7, carbs: 46, fat: 6, serving: "2 pancakes" },
  { name: "Pancakes (2 medium, with syrup)", cal: 360, protein: 7, carbs: 70, fat: 6, serving: "2 pancakes + 2 tbsp syrup" },
  { name: "Waffles (2 Eggo frozen)", cal: 190, protein: 4, carbs: 30, fat: 6, serving: "2 waffles" },
  { name: "Bagel with Cream Cheese", cal: 390, protein: 12, carbs: 60, fat: 11, serving: "1 bagel + 2 tbsp CC" },
  { name: "Bagel with Peanut Butter", cal: 440, protein: 18, carbs: 62, fat: 14, serving: "1 bagel + 2 tbsp PB" },
  { name: "Toast with Peanut Butter (2 slices)", cal: 320, protein: 14, carbs: 36, fat: 15, serving: "2 slices" },
  { name: "Breakfast Burrito (eggs, cheese, salsa)", cal: 350, protein: 18, carbs: 38, fat: 14, serving: "1 burrito" },
  { name: "Breakfast Burrito (eggs, turkey, veggies)", cal: 310, protein: 22, carbs: 36, fat: 9, serving: "1 burrito" },
  { name: "Oatmeal with Banana and Honey", cal: 280, protein: 7, carbs: 56, fat: 4, serving: "1 bowl" },
  { name: "Açaí Bowl (base, granola, fruit)", cal: 380, protein: 6, carbs: 65, fat: 11, serving: "1 bowl" },
  // ── SALADS ────────────────────────────────────────────────────────────────────
  { name: "Garden Salad (no dressing)", cal: 50, protein: 3, carbs: 8, fat: 0, serving: "2 cups" },
  { name: "Caesar Salad (side, no croutons)", cal: 150, protein: 4, carbs: 6, fat: 13, serving: "1 side" },
  { name: "Grilled Chicken Caesar Salad", cal: 350, protein: 32, carbs: 12, fat: 19, serving: "1 full salad" },
  { name: "Cobb Salad (no dressing)", cal: 410, protein: 30, carbs: 10, fat: 28, serving: "1 full salad" },
  { name: "Spinach Salad with Grilled Chicken", cal: 280, protein: 28, carbs: 10, fat: 14, serving: "1 salad" },
  { name: "Greek Salad with Chicken (no dressing)", cal: 300, protein: 26, carbs: 12, fat: 16, serving: "1 salad" },
  { name: "Taco Salad (no shell, with chicken)", cal: 420, protein: 28, carbs: 35, fat: 18, serving: "1 salad" },
  { name: "Asian Chicken Salad", cal: 380, protein: 24, carbs: 38, fat: 14, serving: "1 salad" },
  // ── SOUPS ─────────────────────────────────────────────────────────────────────
  { name: "Chicken Noodle Soup (1 cup)", cal: 90, protein: 6, carbs: 13, fat: 2, serving: "1 cup" },
  { name: "Tomato Basil Soup (1 cup)", cal: 120, protein: 3, carbs: 20, fat: 4, serving: "1 cup" },
  { name: "Lentil Soup (1 cup)", cal: 180, protein: 12, carbs: 30, fat: 2, serving: "1 cup" },
  { name: "Minestrone Soup (1 cup)", cal: 130, protein: 5, carbs: 22, fat: 3, serving: "1 cup" },
  { name: "Black Bean Soup (1 cup)", cal: 170, protein: 9, carbs: 30, fat: 2, serving: "1 cup" },
  { name: "Broccoli Cheddar Soup (1 cup, Panera)", cal: 290, protein: 12, carbs: 21, fat: 18, serving: "1 cup" },
  { name: "Miso Soup (1 cup)", cal: 35, protein: 3, carbs: 5, fat: 1, serving: "1 cup" },
  // ── MEAL COMBOS ───────────────────────────────────────────────────────────────
  { name: "Chicken & White Rice (4 oz chicken, 1 cup rice)", cal: 391, protein: 39, carbs: 45, fat: 4, serving: "meal" },
  { name: "Chicken & Brown Rice (4 oz chicken, 1 cup rice)", cal: 401, protein: 40, carbs: 45, fat: 6, serving: "meal" },
  { name: "Chicken & Rice (2 oz chicken, 1 cup rice)", cal: 299, protein: 21, carbs: 45, fat: 2, serving: "meal" },
  { name: "Chicken & Sweet Potato (4 oz chicken, 1 medium)", cal: 288, protein: 37, carbs: 24, fat: 4, serving: "meal" },
  { name: "Salmon & Quinoa (4 oz salmon, 1 cup quinoa)", cal: 456, protein: 31, carbs: 39, fat: 18, serving: "meal" },
  { name: "Ground Turkey & Sweet Potato Bowl", cal: 350, protein: 32, carbs: 30, fat: 8, serving: "meal" },
  { name: "Shrimp Stir Fry with Brown Rice", cal: 380, protein: 24, carbs: 52, fat: 7, serving: "meal" },
  { name: "Turkey & Veggie Bowl (turkey, rice, broccoli)", cal: 380, protein: 36, carbs: 40, fat: 7, serving: "meal" },
  { name: "Steak & Potatoes (6 oz sirloin, medium potato)", cal: 476, protein: 52, carbs: 37, fat: 13, serving: "meal" },
  { name: "Tuna & Rice Cake (1 can tuna, 2 rice cakes)", cal: 150, protein: 21, carbs: 15, fat: 1, serving: "snack meal" },
  // ── FAST FOOD ─────────────────────────────────────────────────────────────────
  { name: "Chick-fil-A Grilled Chicken Sandwich", cal: 320, protein: 30, carbs: 40, fat: 7, serving: "1 sandwich" },
  { name: "Chick-fil-A Grilled Nuggets (8 ct)", cal: 140, protein: 25, carbs: 2, fat: 4, serving: "8 count" },
  { name: "Chick-fil-A Grilled Chicken Cool Wrap", cal: 350, protein: 42, carbs: 29, fat: 14, serving: "1 wrap" },
  { name: "Chick-fil-A Waffle Fries (medium)", cal: 420, protein: 5, carbs: 55, fat: 21, serving: "medium" },
  { name: "McDonald's Big Mac", cal: 590, protein: 25, carbs: 46, fat: 34, serving: "1 burger" },
  { name: "McDonald's McDouble", cal: 400, protein: 23, carbs: 36, fat: 20, serving: "1 burger" },
  { name: "McDonald's Egg McMuffin", cal: 310, protein: 18, carbs: 30, fat: 13, serving: "1 sandwich" },
  { name: "McDonald's Grilled Chicken Sandwich", cal: 380, protein: 37, carbs: 44, fat: 7, serving: "1 sandwich" },
  { name: "McDonald's Small Fries", cal: 230, protein: 3, carbs: 29, fat: 11, serving: "small" },
  { name: "McDonald's Medium Fries", cal: 320, protein: 4, carbs: 43, fat: 15, serving: "medium" },
  { name: "Subway Turkey 6-inch (9-grain wheat)", cal: 280, protein: 18, carbs: 46, fat: 4, serving: "6-inch" },
  { name: "Subway Chicken Teriyaki 6-inch", cal: 370, protein: 26, carbs: 54, fat: 5, serving: "6-inch" },
  { name: "Subway Rotisserie Chicken 6-inch", cal: 350, protein: 29, carbs: 45, fat: 6, serving: "6-inch" },
  { name: "Subway Veggie Delite 6-inch", cal: 200, protein: 8, carbs: 40, fat: 2, serving: "6-inch" },
  { name: "Chipotle Chicken Bowl (basic, no guac)", cal: 550, protein: 42, carbs: 62, fat: 14, serving: "1 bowl" },
  { name: "Chipotle Chicken Bowl (with guac)", cal: 760, protein: 43, carbs: 79, fat: 30, serving: "1 bowl" },
  { name: "Chipotle Steak Bowl (basic)", cal: 570, protein: 38, carbs: 63, fat: 17, serving: "1 bowl" },
  { name: "Chipotle Chicken Burrito (flour tortilla)", cal: 870, protein: 51, carbs: 98, fat: 28, serving: "1 burrito" },
  { name: "Chipotle Chicken Tacos (3 corn tortillas)", cal: 405, protein: 30, carbs: 50, fat: 10, serving: "3 tacos" },
  { name: "Taco Bell Chicken Quesadilla", cal: 520, protein: 28, carbs: 40, fat: 27, serving: "1 quesadilla" },
  { name: "Taco Bell Bean & Cheese Burrito", cal: 380, protein: 15, carbs: 55, fat: 12, serving: "1 burrito" },
  { name: "Wendy's Grilled Chicken Sandwich", cal: 370, protein: 35, carbs: 38, fat: 8, serving: "1 sandwich" },
  { name: "Wendy's Small Chili", cal: 160, protein: 14, carbs: 16, fat: 4, serving: "small" },
  { name: "Panera Turkey Avocado BLT", cal: 590, protein: 31, carbs: 55, fat: 28, serving: "1 sandwich" },
  { name: "Panera You Pick 2 (half turkey, cup tomato soup)", cal: 470, protein: 24, carbs: 56, fat: 16, serving: "combo" },
  { name: "Starbucks Egg White & Roasted Red Pepper Egg Bites", cal: 170, protein: 13, carbs: 12, fat: 7, serving: "2 bites" },
  { name: "Starbucks Spinach & Feta Wrap", cal: 290, protein: 20, carbs: 33, fat: 10, serving: "1 wrap" },
  // ── SNACKS ────────────────────────────────────────────────────────────────────
  { name: "Apple with Peanut Butter (1 apple + 2 tbsp PB)", cal: 285, protein: 9, carbs: 39, fat: 16, serving: "1 apple + 2 tbsp" },
  { name: "Celery & Peanut Butter (3 stalks + 2 tbsp)", cal: 212, protein: 9, carbs: 16, fat: 16, serving: "3 stalks + 2 tbsp" },
  { name: "Hummus & Carrots (1/4 cup + 1 cup carrots)", cal: 130, protein: 5, carbs: 19, fat: 6, serving: "serving" },
  { name: "Hummus & Pita (2 tbsp + 1/2 pita)", cal: 127, protein: 5, carbs: 20, fat: 3, serving: "serving" },
  { name: "Mixed Nuts (1 oz)", cal: 168, protein: 5, carbs: 7, fat: 15, serving: "1 oz" },
  { name: "Trail Mix (1 oz)", cal: 130, protein: 3, carbs: 14, fat: 8, serving: "1 oz" },
  { name: "Cheese & Crackers (1 oz cheese + 5 crackers)", cal: 190, protein: 8, carbs: 15, fat: 11, serving: "serving" },
  { name: "Popcorn (3 cups, air-popped)", cal: 93, protein: 3, carbs: 19, fat: 1, serving: "3 cups" },
  { name: "Popcorn (1 bag, microwave light)", cal: 130, protein: 3, carbs: 23, fat: 5, serving: "1 bag" },
  { name: "Chips, Lay's Classic (1 oz)", cal: 160, protein: 2, carbs: 15, fat: 10, serving: "1 oz (15 chips)" },
  { name: "Tortilla Chips (1 oz, ~12 chips)", cal: 140, protein: 2, carbs: 19, fat: 6, serving: "1 oz" },
  { name: "Dark Chocolate (1 oz, 70%+)", cal: 170, protein: 2, carbs: 13, fat: 12, serving: "1 oz" },
  { name: "Dark Chocolate (2 squares)", cal: 70, protein: 1, carbs: 7, fat: 4, serving: "2 squares" },
  { name: "Protein Muffin (homemade, oat-based)", cal: 185, protein: 10, carbs: 24, fat: 5, serving: "1 muffin" },
  { name: "Baby Carrots (1 cup)", cal: 52, protein: 1, carbs: 12, fat: 0, serving: "1 cup" },
  { name: "Edamame in Shell (1 cup)", cal: 122, protein: 11, carbs: 9, fat: 5, serving: "1 cup" },
  // ── BEVERAGES ─────────────────────────────────────────────────────────────────
  { name: "Water (0 cal)", cal: 0, protein: 0, carbs: 0, fat: 0, serving: "any amount" },
  { name: "Coffee, Black (8 oz)", cal: 2, protein: 0, carbs: 0, fat: 0, serving: "8 oz" },
  { name: "Espresso (1 shot)", cal: 5, protein: 0, carbs: 1, fat: 0, serving: "1 shot" },
  { name: "Latte, Skim Milk (12 oz)", cal: 120, protein: 9, carbs: 14, fat: 0, serving: "12 oz" },
  { name: "Latte, 2% Milk (16 oz)", cal: 190, protein: 12, carbs: 18, fat: 7, serving: "16 oz" },
  { name: "Latte, Oat Milk (12 oz)", cal: 140, protein: 5, carbs: 20, fat: 5, serving: "12 oz" },
  { name: "Cappuccino (12 oz, 2% milk)", cal: 120, protein: 8, carbs: 12, fat: 4, serving: "12 oz" },
  { name: "Cold Brew Coffee (12 oz, black)", cal: 5, protein: 1, carbs: 0, fat: 0, serving: "12 oz" },
  { name: "Almond Milk, Unsweetened (1 cup)", cal: 30, protein: 1, carbs: 1, fat: 3, serving: "1 cup" },
  { name: "Oat Milk (1 cup)", cal: 120, protein: 3, carbs: 16, fat: 5, serving: "1 cup" },
  { name: "Orange Juice (8 oz)", cal: 112, protein: 2, carbs: 26, fat: 0, serving: "8 oz" },
  { name: "Apple Juice (8 oz)", cal: 114, protein: 0, carbs: 28, fat: 0, serving: "8 oz" },
  { name: "Green Tea (8 oz)", cal: 2, protein: 0, carbs: 0, fat: 0, serving: "8 oz" },
  { name: "Sparkling Water (0 cal)", cal: 0, protein: 0, carbs: 0, fat: 0, serving: "12 oz" },
  { name: "Sports Drink, Gatorade (20 oz)", cal: 140, protein: 0, carbs: 36, fat: 0, serving: "20 oz" },
  { name: "Coconut Water (1 cup)", cal: 46, protein: 2, carbs: 9, fat: 0, serving: "1 cup" },
  { name: "Soda, Coca-Cola (12 oz)", cal: 140, protein: 0, carbs: 39, fat: 0, serving: "12 oz" },
  { name: "Soda, Diet Coke (12 oz)", cal: 0, protein: 0, carbs: 0, fat: 0, serving: "12 oz" },
  // ── CONDIMENTS & EXTRAS ───────────────────────────────────────────────────────
  { name: "Honey (1 tbsp)", cal: 64, protein: 0, carbs: 17, fat: 0, serving: "1 tbsp" },
  { name: "Maple Syrup (1 tbsp)", cal: 52, protein: 0, carbs: 13, fat: 0, serving: "1 tbsp" },
  { name: "Ketchup (1 tbsp)", cal: 17, protein: 0, carbs: 4, fat: 0, serving: "1 tbsp" },
  { name: "Salsa (2 tbsp)", cal: 10, protein: 0, carbs: 2, fat: 0, serving: "2 tbsp" },
  { name: "Guacamole (2 tbsp)", cal: 50, protein: 1, carbs: 3, fat: 4, serving: "2 tbsp" },
  { name: "Sour Cream (2 tbsp)", cal: 60, protein: 1, carbs: 1, fat: 6, serving: "2 tbsp" },
  { name: "Ranch Dressing (2 tbsp)", cal: 140, protein: 1, carbs: 1, fat: 14, serving: "2 tbsp" },
  { name: "Balsamic Vinaigrette (2 tbsp)", cal: 90, protein: 0, carbs: 5, fat: 8, serving: "2 tbsp" },
  { name: "Hot Sauce (1 tsp)", cal: 0, protein: 0, carbs: 0, fat: 0, serving: "1 tsp" },
  { name: "Soy Sauce (1 tbsp)", cal: 11, protein: 2, carbs: 1, fat: 0, serving: "1 tbsp" },
];

// ─── WORKOUT DATABASE ─────────────────────────────────────────────────────────
const WORKOUT_DB = [
  { name: "Running (5 mph / 12 min mile)", category: "Cardio", met: 8.3, emoji: "🏃" },
  { name: "Running (6 mph / 10 min mile)", category: "Cardio", met: 9.8, emoji: "🏃" },
  { name: "Running (7 mph / 8.5 min mile)", category: "Cardio", met: 11.0, emoji: "🏃" },
  { name: "Running (8+ mph)", category: "Cardio", met: 11.8, emoji: "🏃" },
  { name: "Walking (2 mph, slow)", category: "Cardio", met: 2.5, emoji: "🚶" },
  { name: "Walking (3 mph, moderate)", category: "Cardio", met: 3.5, emoji: "🚶" },
  { name: "Walking (3.5 mph, brisk)", category: "Cardio", met: 4.3, emoji: "🚶" },
  { name: "Cycling (12-14 mph, moderate)", category: "Cardio", met: 8.0, emoji: "🚴" },
  { name: "Cycling (14-16 mph, vigorous)", category: "Cardio", met: 10.0, emoji: "🚴" },
  { name: "Stationary Bike (moderate)", category: "Cardio", met: 5.5, emoji: "🚴" },
  { name: "Stationary Bike (vigorous)", category: "Cardio", met: 8.0, emoji: "🚴" },
  { name: "Elliptical (moderate)", category: "Cardio", met: 5.0, emoji: "🏃" },
  { name: "Elliptical (vigorous)", category: "Cardio", met: 7.5, emoji: "🏃" },
  { name: "Rowing Machine (moderate)", category: "Cardio", met: 7.0, emoji: "🚣" },
  { name: "Jump Rope (moderate)", category: "Cardio", met: 10.0, emoji: "⚡" },
  { name: "Swimming (freestyle, moderate)", category: "Cardio", met: 5.8, emoji: "🏊" },
  { name: "Swimming (freestyle, vigorous)", category: "Cardio", met: 9.8, emoji: "🏊" },
  { name: "Stair Climbing", category: "Cardio", met: 8.0, emoji: "🏃" },
  { name: "Hiking (moderate terrain)", category: "Cardio", met: 6.0, emoji: "🥾" },
  { name: "Kickboxing / Cardio Kickboxing", category: "Cardio", met: 7.8, emoji: "🥊" },
  { name: "Zumba", category: "Cardio", met: 6.0, emoji: "💃" },
  { name: "Weight Training (general)", category: "Strength", met: 3.5, emoji: "🏋️" },
  { name: "Weight Training (vigorous)", category: "Strength", met: 6.0, emoji: "🏋️" },
  { name: "Bodyweight Training", category: "Strength", met: 3.8, emoji: "💪" },
  { name: "Circuit Training", category: "Strength", met: 8.0, emoji: "⚡" },
  { name: "Powerlifting / Olympic Lifting", category: "Strength", met: 6.0, emoji: "🏋️" },
  { name: "Squats (barbell)", category: "Strength", met: 5.0, emoji: "🏋️" },
  { name: "Deadlifts", category: "Strength", met: 6.0, emoji: "🏋️" },
  { name: "Kettlebell Training", category: "Strength", met: 8.0, emoji: "⚡" },
  { name: "CrossFit / Functional Training", category: "Strength", met: 8.0, emoji: "⚡" },
  { name: "HIIT (general)", category: "HIIT", met: 10.0, emoji: "⚡" },
  { name: "HIIT (Tabata style)", category: "HIIT", met: 11.0, emoji: "⚡" },
  { name: "HIIT (low impact)", category: "HIIT", met: 7.0, emoji: "⚡" },
  { name: "Orange Theory Workout", category: "HIIT", met: 9.0, emoji: "⚡" },
  { name: "Yoga (Hatha / gentle)", category: "Yoga", met: 2.5, emoji: "🧘" },
  { name: "Yoga (Vinyasa / flow)", category: "Yoga", met: 4.0, emoji: "🧘" },
  { name: "Yoga (Bikram / hot yoga)", category: "Yoga", met: 5.0, emoji: "🧘" },
  { name: "Yoga (Power / Ashtanga)", category: "Yoga", met: 4.5, emoji: "🧘" },
  { name: "Pilates (mat)", category: "Yoga", met: 3.0, emoji: "🧘" },
  { name: "Pilates (reformer)", category: "Yoga", met: 4.0, emoji: "🧘" },
  { name: "Stretching / Flexibility", category: "Yoga", met: 2.3, emoji: "🧘" },
  { name: "Basketball (game)", category: "Sports", met: 8.0, emoji: "🏀" },
  { name: "Soccer (game)", category: "Sports", met: 7.0, emoji: "⚽" },
  { name: "Tennis (singles)", category: "Sports", met: 7.3, emoji: "🎾" },
  { name: "Volleyball", category: "Sports", met: 4.0, emoji: "🏐" },
  { name: "Golf (walking, carrying bag)", category: "Sports", met: 4.8, emoji: "⛳" },
  { name: "Rock Climbing (indoor)", category: "Sports", met: 8.0, emoji: "🧗" },
];

// ─── SUPPLEMENT PAIRINGS ──────────────────────────────────────────────────────
const SUPP_PAIRINGS = {
  "Strength": ["creatine", "protein", "bcaa", "pre-workout", "magnesium"],
  "HIIT": ["electrolytes", "beta-alanine", "caffeine", "protein", "bcaa"],
  "Cardio": ["electrolytes", "caffeine", "iron", "vitamin b12"],
  "Yoga": ["magnesium", "ashwagandha", "cbd"],
  "Sports": ["creatine", "electrolytes", "protein", "bcaa"],
};

const CYCLE_PHASES = [
  { id: "menstrual", label: "Menstrual", days: "Day 1–5", emoji: "🌑", color: "#ff6b6b", calAdj: -100, carbAdj: "+20g", intensity: "low", notes: "Rest or gentle movement. Cravings are normal — iron-rich foods help.", workouts: ["Yoga (Hatha / gentle)", "Stretching / Flexibility", "Walking (3 mph, moderate)"] },
  { id: "follicular", label: "Follicular", days: "Day 6–13", emoji: "🌒", color: "#ffb347", calAdj: 0, carbAdj: "normal", intensity: "moderate-high", notes: "Energy rising. Great time to try new workouts and push harder.", workouts: ["Running (5 mph / 12 min mile)", "Weight Training (vigorous)", "HIIT (general)"] },
  { id: "ovulatory", label: "Ovulatory", days: "Day 14–16", emoji: "🌕", color: "#a8ff78", calAdj: 100, carbAdj: "normal", intensity: "peak", notes: "Peak strength and energy. Best time for PRs and high-intensity work.", workouts: ["HIIT (Tabata style)", "CrossFit / Functional Training", "Running (7 mph / 8.5 min mile)"] },
  { id: "luteal", label: "Luteal", days: "Day 17–28", emoji: "🌘", color: "#c3b1e1", calAdj: 150, carbAdj: "+30g complex", intensity: "low-moderate", notes: "Energy drops in late luteal. Focus on consistency. Complex carbs reduce PMS.", workouts: ["Pilates (mat)", "Yoga (Vinyasa / flow)", "Walking (3.5 mph, brisk)"] },
];

// ─── CALORIE MATH ─────────────────────────────────────────────────────────────
function calcBMR(p) {
  const w = p.weightUnit === "lbs" ? (Number(p.weight) || 70) * 0.453592 : (Number(p.weight) || 70);
  const h = p.heightUnit === "imperial" ? (parseInt(p.heightFt)||0)*30.48 + (parseInt(p.heightIn)||0)*2.54 : (Number(p.height)||170);
  const age = parseInt(p.age) || 30;
  return p.sex === "female" ? 10*w + 6.25*h - 5*age - 161 : 10*w + 6.25*h - 5*age + 5;
}
function calcTDEE(p) {
  const mults = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
  return Math.round(calcBMR(p) * (mults[p.activity]||1.55));
}
function calcGoalCalories(p, cyclePhase) {
  let base = calcTDEE(p);
  if (p.goal === "lose") base -= 500;
  if (p.goal === "gain") base += 300;
  const phase = CYCLE_PHASES.find(c => c.id === cyclePhase);
  if (p.sex === "female" && phase) base += phase.calAdj;
  return Math.max(1200, Math.round(base));
}
function calcWorkoutCal(met, p, mins) {
  const w = p.weightUnit === "lbs" ? (Number(p.weight)||70)*0.453592 : (Number(p.weight)||70);
  return Math.round(met * w * (mins/60));
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const fmt = {
  time: () => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
  timeLabel: (t) => { if(!t) return ""; const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`; },
  date: () => new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}),
  short: () => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
};
// ─── GLORIÉ DESIGN TOKENS ────────────────────────────────────────────────────
const G = {
  peach:"#E8B89A", peachLight:"#F2D0B8", peachSoft:"#FBF0E8",
  sage:"#A8B89A", sageSoft:"#C8D4BE", sageLight:"#E8EFE4",
  gold:"#C9A96E", goldLight:"#E8D4A8",
  cream:"#FAF6F0", warmWhite:"#FDF9F4",
  ink:"#2C2416", inkSoft:"#4A3F30", inkMid:"#7A6B58", inkLight:"#A8998A",
  bg:"linear-gradient(135deg, #F5E6D8 0%, #FAF0E8 35%, #F8F4EE 65%, #EDF2E8 100%)",
  headerBg:"linear-gradient(180deg, rgba(245,230,216,0.98) 0%, rgba(250,246,240,0.95) 100%)",
  cardBg:"rgba(255,252,248,0.85)", cardBorder:"rgba(201,169,110,0.18)",
};

// ─── LEAF LOGO ────────────────────────────────────────────────────────────────
function GlorieLogo({size=36}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 48" fill="none">
      <path d="M20 4 C20 4, 32 12, 32 26 C32 36, 26 44, 20 44 C14 44, 8 36, 8 26 C8 12, 20 4, 20 4Z" stroke={G.gold} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M20 44 C20 44, 20 24, 20 8" stroke={G.gold} strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M20 28 C20 28, 13 23, 10 18" stroke={G.gold} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M20 28 C20 28, 27 23, 30 18" stroke={G.gold} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      <circle cx="20" cy="6" r="1.5" fill={G.gold} opacity="0.6"/>
    </svg>
  );
}

function GoldSpeckles({corner="tr"}) {
  const dots=[[88,8,1.2],[94,14,0.8],[82,16,0.6],[91,22,1],[97,10,0.5],[85,4,0.7],[79,20,0.4],[96,18,0.6],[90,6,0.5],[93,26,0.8]];
  return (
    <svg width={100} height={40} style={{position:"absolute",top:corner.includes("b")?"auto":0,bottom:corner.includes("b")?0:"auto",right:corner.includes("r")?0:"auto",left:corner.includes("l")?0:"auto",opacity:0.5,pointerEvents:"none"}} viewBox="0 0 100 40">
      {dots.map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={G.gold} opacity={0.5}/>)}
    </svg>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const iS={width:"100%",background:"rgba(255,252,248,0.9)",border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"12px 16px",color:G.ink,fontSize:14,outline:"none",marginBottom:8,boxSizing:"border-box",fontFamily:"'Cormorant Garamond','Georgia',serif",letterSpacing:"0.02em"};
const bS=(bg,fg=G.ink)=>({width:"100%",background:bg,border:"none",borderRadius:14,padding:"13px",color:fg,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"'Jost','sans-serif'",letterSpacing:"0.08em",textTransform:"uppercase"});

function StatPill({label,value,unit,color}) {
  return (
    <div style={{background:color||G.peachSoft,borderRadius:20,padding:"10px 14px",display:"flex",flexDirection:"column",alignItems:"center",minWidth:74,border:`1px solid ${G.cardBorder}`}}>
      <span style={{fontSize:17,fontWeight:700,color:G.inkSoft,letterSpacing:"-0.5px",fontFamily:"'Cormorant Garamond',serif"}}>{value}</span>
      <span style={{fontSize:9,fontWeight:600,color:G.inkMid,textTransform:"uppercase",letterSpacing:1.5,marginTop:1}}>{unit}</span>
      <span style={{fontSize:9,color:G.inkLight,marginTop:1}}>{label}</span>
    </div>
  );
}

function ProgressBar({value,max,color,height=5}) {
  const pct=Math.min((value/Math.max(max,1))*100,100);
  return (
    <div style={{background:"rgba(201,169,110,0.15)",borderRadius:99,height,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:color||`linear-gradient(90deg,${G.peach},${G.gold})`,borderRadius:99,transition:"width 0.7s cubic-bezier(0.34,1.56,0.64,1)"}}/>
    </div>
  );
}

function Card({children,style,accent}) {
  return <div style={{background:G.cardBg,border:`1px solid ${accent||G.cardBorder}`,borderRadius:20,padding:18,marginBottom:14,backdropFilter:"blur(8px)",boxShadow:"0 2px 20px rgba(201,169,110,0.08)",...style}}>{children}</div>;
}
function SLabel({text}) {
  return <div style={{fontSize:10,fontWeight:600,color:G.inkLight,textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontFamily:"'Jost',sans-serif"}}>{text}</div>;
}
function Empty({emoji,text}) {
  return <div style={{textAlign:"center",padding:"34px 0",color:G.inkLight}}><div style={{fontSize:32,marginBottom:8}}>{emoji}</div><div style={{fontSize:13,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{text}</div></div>;
}
function Chip({label,active,onClick,small,color}) {
  return <button onClick={onClick} style={{padding:small?"5px 10px":"7px 13px",borderRadius:99,border:`1px solid ${active?G.gold:G.cardBorder}`,cursor:"pointer",fontSize:small?10:11,fontWeight:600,background:active?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(255,252,248,0.8)",color:active?G.ink:G.inkMid,transition:"all 0.2s",whiteSpace:"nowrap",fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{label}</button>;
}
function DelBtn({onClick}) {
  return <button onClick={onClick} style={{background:"rgba(220,100,80,0.1)",border:"1px solid rgba(220,100,80,0.2)",borderRadius:8,color:"#C05040",cursor:"pointer",padding:"4px 9px",fontSize:11,fontWeight:600,flexShrink:0}}>✕</button>;
}

function Toast({toasts}) {
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,display:"flex",flexDirection:"column",gap:8,width:"92%",maxWidth:440,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:t.type==="reminder"?`linear-gradient(135deg,${G.peachLight},${G.goldLight})`:t.type==="warning"?`linear-gradient(135deg,#F5D0A0,${G.goldLight})`:`linear-gradient(135deg,${G.sageLight},${G.sageSoft})`,color:G.ink,borderRadius:16,padding:"13px 16px",fontWeight:600,fontSize:13,boxShadow:"0 4px 24px rgba(201,169,110,0.3)",animation:"toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",display:"flex",alignItems:"center",gap:10,border:`1px solid ${G.cardBorder}`}}>
          <span style={{fontSize:20}}>{t.emoji||"🌿"}</span>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14}}>{t.title}</div>{t.body&&<div style={{fontWeight:400,fontSize:12,opacity:0.72,marginTop:2}}>{t.body}</div>}</div>
        </div>
      ))}
    </div>
  );
}

function AutocompleteInput({placeholder,value,onChange,onSelect,database,style}) {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const filtered=useMemo(()=>{if(!value||value.length<2)return[];const q=value.toLowerCase();return database.filter(i=>i.name.toLowerCase().includes(q)).slice(0,8);},[value,database]);
  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return (
    <div ref={ref} style={{position:"relative",marginBottom:8}}>
      <input placeholder={placeholder} value={value} onChange={e=>{onChange(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} style={{...iS,marginBottom:0,...(style||{})}}/>
      {open&&filtered.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:G.warmWhite,border:`1px solid ${G.cardBorder}`,borderRadius:14,zIndex:100,maxHeight:240,overflowY:"auto",boxShadow:"0 8px 32px rgba(201,169,110,0.2)",marginTop:4}}>
          {filtered.map((item,i)=>(
            <div key={i} onMouseDown={()=>{onSelect(item);setOpen(false);}} style={{padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid rgba(201,169,110,0.1)`,display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=G.peachSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div><div style={{color:G.ink,fontSize:13,fontFamily:"'Cormorant Garamond',serif"}}>{item.name}</div>{item.serving&&<div style={{color:G.inkLight,fontSize:11,marginTop:1}}>{item.serving}</div>}</div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                {item.cal!==undefined&&<><div style={{color:G.gold,fontSize:13,fontWeight:700}}>{item.cal}</div><div style={{color:G.inkLight,fontSize:10}}>kcal</div></>}
                {item.met!==undefined&&<span style={{fontSize:18}}>{item.emoji||"🌿"}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INSIGHT ENGINE ───────────────────────────────────────────────────────────
function generateInsights({dayState,medList,takenLog,profile,recovery,cyclePhase}) {
  const insights=[];
  const hour=new Date().getHours();
  const totalCal=dayState.meals.reduce((s,m)=>s+Number(m.calories||0),0);
  const totalProt=dayState.meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const totalBurned=dayState.workouts.reduce((s,w)=>s+Number(w.burned||0),0);
  const waterCups=dayState.water.reduce((s,w)=>s+Number(w.cups||0),0);
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;
  const workoutCats=[...new Set(dayState.workouts.map(w=>w.category))];
  if(hour>=14&&totalCal<goalCal*0.4) insights.push({type:"warning",emoji:"🌿",title:"Nourish your body",body:`Only ${totalCal} kcal logged — you're ${goalCal-totalCal} kcal below your goal. A protein-rich snack would serve you well.`,priority:9});
  const protGoal=profile.weight?(profile.weightUnit==="lbs"?Number(profile.weight)*0.7:Number(profile.weight)*1.5):120;
  if(hour>=16&&totalProt<protGoal*0.5) insights.push({type:"tip",emoji:"✨",title:"Protein is low today",body:`${totalProt}g logged. Try chicken, Greek yogurt, or a shake to hit your target.`,priority:8});
  if(hour>=12&&waterCups<3) insights.push({type:"warning",emoji:"💧",title:"Hydration check",body:`Only ${waterCups} cups so far. Your glow starts from within.`,priority:7});
  if(profile.sex==="female"&&cyclePhase){const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);if(phase)insights.push({type:"cycle",emoji:phase.emoji,title:`${phase.label} phase`,body:phase.notes,priority:6});}
  if(totalCal>=goalCal*0.8&&totalCal<=goalCal*1.05&&hour>=18) insights.push({type:"success",emoji:"🌟",title:"You showed up for yourself today",body:`${totalCal} kcal — right in your goal range. Beautiful consistency.`,priority:7});
  return insights.sort((a,b)=>b.priority-a.priority).slice(0,4);
}

// ─── MACRO PIE CHART ─────────────────────────────────────────────────────────
function MacroPie({protein,carbs,fat}) {
  const total=(protein*4)+(carbs*4)+(fat*9);
  if(total===0) return <div style={{textAlign:"center",fontSize:12,color:G.inkLight,fontStyle:"italic"}}>Log meals to see macros</div>;
  const pPct=Math.round((protein*4/total)*100);
  const cPct=Math.round((carbs*4/total)*100);
  const fPct=100-pPct-cPct;
  const cx=60,cy=60,r=50;
  const slice=(start,pct,color)=>{
    if(pct<=0)return null;
    if(pct>=100){return <circle cx={cx} cy={cy} r={r} fill={color}/>;}
    const s=((start/100)*2*Math.PI)-Math.PI/2;
    const e=(((start+pct)/100)*2*Math.PI)-Math.PI/2;
    const x1=cx+r*Math.cos(s),y1=cy+r*Math.sin(s);
    const x2=cx+r*Math.cos(e),y2=cy+r*Math.sin(e);
    const large=pct>50?1:0;
    return <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={color}/>;
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slice(0,pPct,G.peach)}
        {slice(pPct,cPct,G.sage)}
        {slice(pPct+cPct,fPct,G.gold)}
        <circle cx={cx} cy={cy} r={30} fill={G.warmWhite}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={10} fill={G.inkSoft} fontWeight={700} fontFamily="Jost,sans-serif">{Math.round(total)}</text>
        <text x={cx} y={cy+8} textAnchor="middle" fontSize={8} fill={G.inkLight} fontFamily="Jost,sans-serif">kcal</text>
      </svg>
      <div style={{flex:1}}>
        {[{label:"Protein",val:protein,pct:pPct,cal:protein*4,color:G.peach},{label:"Carbs",val:carbs,pct:cPct,cal:carbs*4,color:G.sage},{label:"Fat",val:fat,pct:fPct,cal:fat*9,color:G.gold}].map(m=>(
          <div key={m.label} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{m.label} — {m.val}g</span>
              <span style={{fontSize:11,color:G.inkLight}}>{m.pct}%</span>
            </div>
            <ProgressBar value={m.pct} max={100} color={m.color} height={5}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SUMMARY TAB ─────────────────────────────────────────────────────────────
function SummaryTab({dayState,medList,takenLog,profile,recovery,cyclePhase,habits,setHabits}) {
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;
  const totalCals=dayState.meals.reduce((s,m)=>s+Number(m.calories||0),0);
  const totalProt=dayState.meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const totalCarbs=dayState.meals.reduce((s,m)=>s+Number(m.carbs||0),0);
  const totalFat=dayState.meals.reduce((s,m)=>s+Number(m.fat||0),0);
  const totalMins=dayState.workouts.reduce((s,w)=>s+Number(w.duration||0),0);
  const totalBurned=dayState.workouts.reduce((s,w)=>s+Number(w.burned||0),0);
  const waterCups=dayState.water.reduce((s,w)=>s+Number(w.cups||0),0);
  const medsTaken=medList.filter(m=>takenLog[`${m.id}_${TODAY}`]).length;
  const netCals=totalCals-totalBurned;
  const insights=generateInsights({dayState,medList,takenLog,profile,recovery,cyclePhase});
  const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);
  const todayHabits=habits[TODAY]||{};
  const habitCount=Object.values(todayHabits).filter(Boolean).length;

  const rings=[
    {label:"Calories",val:totalCals,max:goalCal,color:G.peach,unit:"kcal",icon:"🥗"},
    {label:"Water",val:waterCups,max:8,color:G.sage,unit:"cups",icon:"💧"},
    {label:"Movement",val:totalMins,max:60,color:G.gold,unit:"min",icon:"🌿"},
  ];

  return (
    <div>
      {profile.name&&<div style={{fontSize:14,color:G.inkMid,marginBottom:4,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Good day, {profile.name} ✨</div>}
      <div style={{fontSize:11,color:G.inkLight,marginBottom:18,letterSpacing:"0.05em"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>

      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {rings.map(r=>{
          const pct=Math.min(r.val/Math.max(r.max,1)*100,100);
          const R=30,cx=38,cy=38,circ=2*Math.PI*R;
          return (
            <div key={r.label} style={{flex:1,background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:18,padding:"14px 6px",textAlign:"center",boxShadow:"0 2px 12px rgba(201,169,110,0.08)"}}>
              <svg width={76} height={76} style={{margin:"0 auto",display:"block"}}>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth={5}/>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke={r.color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
                <text x={cx} y={cx-2} textAnchor="middle" fill={G.inkSoft} fontSize={12} fontWeight={700} fontFamily="Cormorant Garamond,serif">{r.val}</text>
                <text x={cx} y={cx+10} textAnchor="middle" fill={G.inkLight} fontSize={8} fontFamily="Jost,sans-serif">{r.unit}</text>
              </svg>
              <div style={{fontSize:10,color:G.inkMid,fontWeight:600,marginTop:2,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{r.icon} {r.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[
          {label:"Net Calories",val:netCals,sub:"consumed − burned",color:netCals<=goalCal?G.sage:G.peach},
          {label:"Daily Goal",val:goalCal,sub:profile.goal==="lose"?"fat loss":profile.goal==="gain"?"muscle gain":"maintenance",color:G.gold},
          {label:"Habits Today",val:`${habitCount}/${Object.keys(DEFAULT_HABITS).length}`,sub:"completed",color:G.peach},
          {label:"Wellness",val:`${medsTaken}/${medList.length}`,sub:"meds taken",color:G.sageSoft},
        ].map(s=>(
          <div key={s.label} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"14px"}}>
            <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div>
            <div style={{fontSize:11,fontWeight:600,color:G.inkSoft,marginTop:2,fontFamily:"'Jost',sans-serif"}}>{s.label}</div>
            <div style={{fontSize:11,color:G.inkLight}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Macro summary */}
      {totalCals>0&&(
        <Card>
          <SLabel text="Today's Macros"/>
          <MacroPie protein={totalProt} carbs={totalCarbs} fat={totalFat}/>
        </Card>
      )}

      {/* Cycle phase */}
      {profile.sex==="female"&&phase&&(
        <div style={{background:`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`,border:`1px solid ${G.cardBorder}`,borderRadius:18,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:26}}>{phase.emoji}</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{phase.label} Phase · {phase.days}</div>
            <div style={{fontSize:12,color:G.inkMid,marginTop:3,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>{phase.notes}</div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length>0&&(
        <div style={{marginBottom:14}}>
          <SLabel text="Your Daily Glow Guide"/>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"13px 14px",marginBottom:8,animation:"slideIn 0.3s ease"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{ins.emoji}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:15,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{ins.title}</div>
                  <div style={{fontSize:12,color:G.inkMid,marginTop:3,lineHeight:1.6}}>{ins.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {dayState.meals.length>0&&(
        <Card>
          <SLabel text="Today's Nourishment"/>
          {dayState.meals.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
              <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{m.name}</span>
              <span style={{fontSize:13,color:G.gold,fontWeight:700}}>{m.calories}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",marginTop:4}}>
            <span style={{fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>Total</span>
            <span style={{fontSize:15,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{totalCals} kcal</span>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── MEALS TAB ────────────────────────────────────────────────────────────────
function MealsTab({dayState,setDayState,profile,cyclePhase}) {
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;
  const [query,setQuery]=useState("");const [selected,setSelected]=useState(null);
  const [mName,setMName]=useState("");const [mCal,setMCal]=useState("");
  const [mProt,setMProt]=useState("");const [mCarbs,setMCarbs]=useState("");
  const [mFat,setMFat]=useState("");const [mType,setMType]=useState("Breakfast");
  const [mode,setMode]=useState("search");const [view,setView]=useState("log"); // log | plan
  const meals=dayState.meals;
  const totalCal=meals.reduce((s,m)=>s+Number(m.calories),0);
  const totalProt=meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const totalCarbs=meals.reduce((s,m)=>s+Number(m.carbs||0),0);
  const totalFat=meals.reduce((s,m)=>s+Number(m.fat||0),0);
  const [mealPlan,setMealPlan]=useState(()=>LS.get("glorie_mealplan",{}));
  useEffect(()=>{LS.set("glorie_mealplan",mealPlan);},[mealPlan]);
  const mEmojis={Breakfast:"🍳",Lunch:"🥙",Dinner:"🍽️",Snack:"🍎"};

  const add=()=>{
    if(mode==="search"){
      if(!selected&&!query)return;
      const meal=selected||{name:query,cal:0,protein:0,carbs:0,fat:0};
      setDayState(p=>({...p,meals:[...p.meals,{id:Date.now(),name:meal.name,calories:meal.cal,protein:meal.protein||0,carbs:meal.carbs||0,fat:meal.fat||0,serving:meal.serving||"",mealType:mType,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}]}));
      setQuery("");setSelected(null);
    }else{
      if(!mName||!mCal)return;
      setDayState(p=>({...p,meals:[...p.meals,{id:Date.now(),name:mName,calories:Number(mCal),protein:Number(mProt||0),carbs:Number(mCarbs||0),fat:Number(mFat||0),mealType:mType,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}]}));
      setMName("");setMCal("");setMProt("");setMCarbs("");setMFat("");
    }
  };

  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const [planDay,setPlanDay]=useState(DAYS[new Date().getDay()-1]||"Mon");
  const [planMeal,setPlanMeal]=useState("");const [planType,setPlanType]=useState("Breakfast");
  const addToPlan=()=>{
    if(!planMeal)return;
    const key=`${planDay}_${planType}`;
    setMealPlan(p=>({...p,[key]:[...(p[key]||[]),planMeal]}));
    setPlanMeal("");
  };

  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Consumed" value={totalCal} unit="kcal" color={G.peachSoft}/>
        <StatPill label="Remaining" value={Math.max(0,goalCal-totalCal)} unit="kcal" color={G.sageLight}/>
        <StatPill label="Protein" value={totalProt} unit="grams" color={G.goldLight}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:G.inkLight,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Jost',sans-serif"}}>Goal: {goalCal} kcal</div>
        <ProgressBar value={totalCal} max={goalCal}/>
      </div>

      {/* Macro breakdown */}
      {totalCal>0&&(
        <Card>
          <SLabel text="Macro Breakdown"/>
          <MacroPie protein={totalProt} carbs={totalCarbs} fat={totalFat}/>
        </Card>
      )}

      {/* View toggle */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <Chip label="📋 Log Meals" active={view==="log"} onClick={()=>setView("log")}/>
        <Chip label="📅 Meal Plan" active={view==="plan"} onClick={()=>setView("plan")}/>
      </div>

      {view==="log"&&(
        <>
          <Card>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <Chip label="🔍 Search" active={mode==="search"} onClick={()=>setMode("search")}/>
              <Chip label="✏️ Manual" active={mode==="manual"} onClick={()=>setMode("manual")}/>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {["Breakfast","Lunch","Dinner","Snack"].map(t=><Chip key={t} label={t} active={mType===t} onClick={()=>setMType(t)}/>)}
            </div>
            {mode==="search"?(
              <>
                <AutocompleteInput placeholder="Search foods — chicken rice, Healthy Choice…" value={query} onChange={v=>{setQuery(v);setSelected(null);}} onSelect={item=>{setSelected(item);setQuery(item.name);}} database={MEAL_DB}/>
                {selected&&(
                  <div style={{background:`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"10px 14px",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{selected.name}</div>
                    <div style={{fontSize:11,color:G.inkMid,marginTop:3,display:"flex",gap:12,flexWrap:"wrap"}}>
                      <span>🔥 {selected.cal} kcal</span><span>🥩 {selected.protein}g</span><span>🌾 {selected.carbs}g</span><span>🫙 {selected.fat}g fat</span>
                    </div>
                  </div>
                )}
              </>
            ):(
              <>
                <input placeholder="Food name" value={mName} onChange={e=>setMName(e.target.value)} style={iS}/>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input placeholder="Calories" type="number" value={mCal} onChange={e=>setMCal(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
                  <input placeholder="Protein (g)" type="number" value={mProt} onChange={e=>setMProt(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input placeholder="Carbs (g)" type="number" value={mCarbs} onChange={e=>setMCarbs(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
                  <input placeholder="Fat (g)" type="number" value={mFat} onChange={e=>setMFat(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
                </div>
              </>
            )}
            <button onClick={add} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>+ Add {mType}</button>
          </Card>
          {meals.length===0?<Empty emoji="🌿" text="No meals logged yet"/>:
            meals.map(m=>(
              <div key={m.id} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,animation:"slideIn 0.3s ease"}}>
                <span style={{fontSize:20}}>{mEmojis[m.mealType]||"🍽️"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,color:G.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Cormorant Garamond',serif"}}>{m.name}</div>
                  <div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{m.mealType} · P:{m.protein}g C:{m.carbs||0}g F:{m.fat||0}g</div>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:G.gold,flexShrink:0,fontFamily:"'Cormorant Garamond',serif"}}>{m.calories}</div>
                <DelBtn onClick={()=>setDayState(p=>({...p,meals:p.meals.filter(x=>x.id!==m.id)}))}/>
              </div>
            ))
          }
        </>
      )}

      {view==="plan"&&(
        <div>
          <Card>
            <SLabel text="Weekly Meal Planner"/>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {DAYS.map(d=><Chip key={d} label={d} active={planDay===d} onClick={()=>setPlanDay(d)} small/>)}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {["Breakfast","Lunch","Dinner","Snack"].map(t=><Chip key={t} label={t} active={planType===t} onClick={()=>setPlanType(t)} small/>)}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input placeholder={`Add ${planType} for ${planDay}…`} value={planMeal} onChange={e=>setPlanMeal(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
              <button onClick={addToPlan} style={{...bS(`linear-gradient(135deg,${G.peach},${G.gold})`),flex:"none",padding:"0 18px",marginBottom:0}}>+</button>
            </div>
          </Card>
          {DAYS.map(day=>{
            const dayMeals=["Breakfast","Lunch","Dinner","Snack"].map(t=>({type:t,items:mealPlan[`${day}_${t}`]||[]})).filter(x=>x.items.length>0);
            if(!dayMeals.length)return null;
            return (
              <Card key={day}>
                <SLabel text={day}/>
                {dayMeals.map(({type,items})=>(
                  <div key={type} style={{marginBottom:8}}>
                    <div style={{fontSize:11,color:G.inkMid,fontWeight:600,fontFamily:"'Jost',sans-serif",marginBottom:4}}>{type}</div>
                    {items.map((item,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                        <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{item}</span>
                        <button onClick={()=>setMealPlan(p=>{const k=`${day}_${type}`;return{...p,[k]:p[k].filter((_,j)=>j!==i)};})} style={{background:"none",border:"none",cursor:"pointer",color:G.inkLight,fontSize:12}}>✕</button>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            );
          })}
          {DAYS.every(d=>["Breakfast","Lunch","Dinner","Snack"].every(t=>!(mealPlan[`${d}_${t}`]||[]).length))&&<Empty emoji="📅" text="Your meal plan is empty — start adding meals above"/>}
        </div>
      )}
    </div>
  );
}

// ─── WORKOUTS TAB ─────────────────────────────────────────────────────────────
function WorkoutsTab({dayState,setDayState,profile}) {
  const [query,setQuery]=useState("");const [selected,setSelected]=useState(null);
  const [dur,setDur]=useState("");const [mName,setMName]=useState("");
  const [mBurned,setMBurned]=useState("");const [mode,setMode]=useState("search");
  const workouts=dayState.workouts;
  const totalBurned=workouts.reduce((s,w)=>s+Number(w.burned||0),0);
  const totalMins=workouts.reduce((s,w)=>s+Number(w.duration||0),0);
  const preview=useMemo(()=>{if(!selected||!dur||!profile.weight)return null;return calcWorkoutCal(selected.met,profile,Number(dur));},[selected,dur,profile]);
  const catColors={Cardio:G.peach,Strength:G.gold,HIIT:"#C08080",Yoga:G.sage,Sports:G.sageSoft,Custom:G.peachLight};
  const add=()=>{
    if(mode==="search"){if(!selected||!dur)return;const burned=calcWorkoutCal(selected.met,profile,Number(dur));setDayState(p=>({...p,workouts:[...p.workouts,{id:Date.now(),name:selected.name,category:selected.category,duration:Number(dur),burned,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}]}));setQuery("");setSelected(null);setDur("");}
    else{if(!mName||!dur)return;setDayState(p=>({...p,workouts:[...p.workouts,{id:Date.now(),name:mName,category:"Custom",duration:Number(dur),burned:Number(mBurned||0),time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}]}));setMName("");setDur("");setMBurned("");}
  };
  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Sessions" value={workouts.length} unit="today" color={G.peachSoft}/>
        <StatPill label="Active" value={totalMins} unit="mins" color={G.sageLight}/>
        <StatPill label="Burned" value={totalBurned} unit="kcal" color={G.goldLight}/>
      </div>
      <Card>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <Chip label="🔍 Library" active={mode==="search"} onClick={()=>setMode("search")}/>
          <Chip label="✏️ Manual" active={mode==="manual"} onClick={()=>setMode("manual")}/>
        </div>
        {mode==="search"?(
          <>
            <AutocompleteInput placeholder="Search — running, yoga, deadlifts, HIIT…" value={query} onChange={v=>{setQuery(v);setSelected(null);}} onSelect={item=>{setSelected(item);setQuery(item.name);}} database={WORKOUT_DB}/>
            {selected&&(<div style={{background:`linear-gradient(135deg,${G.sageLight},${G.peachSoft})`,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"10px 14px",marginBottom:8}}><div style={{fontWeight:600,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{selected.emoji} {selected.name}</div><div style={{fontSize:11,color:G.inkMid,marginTop:3}}>{selected.category} · MET: {selected.met}</div></div>)}
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input placeholder="Duration (minutes)" type="number" value={dur} onChange={e=>setDur(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
              {preview!==null&&(<div style={{background:`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`,borderRadius:14,padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${G.cardBorder}`}}><span style={{fontSize:16,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{preview}</span><span style={{fontSize:9,color:G.inkLight}}>kcal est.</span></div>)}
            </div>
          </>
        ):(
          <>
            <input placeholder="Exercise name" value={mName} onChange={e=>setMName(e.target.value)} style={iS}/>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input placeholder="Duration (min)" type="number" value={dur} onChange={e=>setDur(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
              <input placeholder="Calories burned" type="number" value={mBurned} onChange={e=>setMBurned(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
            </div>
          </>
        )}
        <button onClick={add} style={bS(`linear-gradient(135deg,${G.sage},${G.gold})`)}>+ Log Movement</button>
      </Card>
      {workouts.length===0?<Empty emoji="🌿" text="No movement logged yet"/>:workouts.map(w=>(
        <div key={w.id} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,animation:"slideIn 0.3s ease"}}>
          <div style={{width:6,height:40,background:catColors[w.category]||G.gold,borderRadius:4,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div><div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{w.category||"Custom"} · {w.duration} min</div></div>
          <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:15,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{w.burned}</div><div style={{fontSize:9,color:G.inkLight}}>kcal</div></div>
          <DelBtn onClick={()=>setDayState(p=>({...p,workouts:p.workouts.filter(x=>x.id!==w.id)}))}/>
        </div>
      ))}
    </div>
  );
}

// ─── WATER TAB ────────────────────────────────────────────────────────────────
function WaterTab({dayState,setDayState}) {
  const [custom,setCustom]=useState("");
  const water=dayState.water;
  const totalOz=water.reduce((s,w)=>s+Number(w.oz),0);
  const totalCups=water.reduce((s,w)=>s+Number(w.cups),0);
  const circ=2*Math.PI*56,pct=Math.min((totalCups/8)*100,100);
  const addWater=oz=>setDayState(p=>({...p,water:[...p.water,{id:Date.now(),oz,cups:oz/8,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}]}));
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:22}}>
        <svg width={148} height={148}>
          <circle cx={74} cy={74} r={56} fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth={8}/>
          <circle cx={74} cy={74} r={56} fill="none" stroke={G.sage} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" transform="rotate(-90 74 74)" style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
          <text x={74} y={67} textAnchor="middle" fill={G.inkSoft} fontSize={28} fontWeight={700} fontFamily="Cormorant Garamond,serif">{Math.round(totalCups*10)/10}</text>
          <text x={74} y={84} textAnchor="middle" fill={G.inkLight} fontSize={11} fontFamily="Jost,sans-serif">of 8 cups</text>
          <text x={74} y={100} textAnchor="middle" fill={G.sage} fontSize={10} fontFamily="Jost,sans-serif">{totalOz} oz total</text>
        </svg>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{label:"8 oz",oz:8},{label:"12 oz",oz:12},{label:"16 oz",oz:16},{label:"20 oz",oz:20}].map(b=>(
          <button key={b.label} onClick={()=>addWater(b.oz)} style={{padding:"14px",borderRadius:16,border:`1px solid ${G.cardBorder}`,cursor:"pointer",background:`linear-gradient(135deg,${G.sageLight},rgba(255,252,248,0.9))`,color:G.inkSoft,fontWeight:600,fontSize:15,display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"'Cormorant Garamond',serif"}}>
            <span>💧</span><span>{b.label}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input placeholder="Custom oz" type="number" value={custom} onChange={e=>setCustom(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
        <button onClick={()=>{if(custom){addWater(Number(custom));setCustom("");}}} style={{...bS(`linear-gradient(135deg,${G.sage},${G.gold})`),flex:"none",padding:"0 22px"}}>Add</button>
      </div>
      {water.length===0?<Empty emoji="💧" text="No water logged yet"/>:water.map(w=>(
        <div key={w.id} style={{background:`linear-gradient(135deg,${G.sageLight},rgba(255,252,248,0.9))`,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <span style={{fontSize:18}}>💧</span>
          <div style={{flex:1,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{w.oz} oz</div>
          <span style={{fontSize:11,color:G.inkLight}}>{w.time}</span>
          <DelBtn onClick={()=>setDayState(p=>({...p,water:p.water.filter(x=>x.id!==w.id)}))}/>
        </div>
      ))}
    </div>
  );
}

// ─── WEIGHT TAB (weekly) ─────────────────────────────────────────────────────
function WeightTab({profile,setProfile,addToast}) {
  const [weightLog,setWeightLog]=useState(()=>LS.get("glorie_weightlog",[]));
  const [newWeight,setNewWeight]=useState("");const [newNote,setNewNote]=useState("");
  const [goalWeight,setGoalWeight]=useState(profile.goalWeight||"");
  const [editGoal,setEditGoal]=useState(false);
  const unit=profile.weightUnit||"lbs";
  useEffect(()=>{LS.set("glorie_weightlog",weightLog);},[weightLog]);

  // Check if already logged this week
  const getWeekKey=()=>{const d=new Date();const day=d.getDay();const diff=d.getDate()-day+(day===0?-6:1);const mon=new Date(d.setDate(diff));return mon.toISOString().slice(0,10);};
  const thisWeek=getWeekKey();
  const loggedThisWeek=weightLog.find(e=>e.weekKey===thisWeek);

  const logWeight=()=>{
    if(!newWeight)return;
    if(loggedThisWeek){addToast({emoji:"⚖️",title:"Already logged this week",body:"You can update your entry below.",type:"warning"});return;}
    const entry={id:Date.now(),weight:Number(newWeight),date:TODAY,weekKey:thisWeek,note:newNote};
    const updated=[...weightLog,entry].sort((a,b)=>a.date.localeCompare(b.date));
    setWeightLog(updated);
    setProfile(p=>({...p,weight:newWeight,startWeight:p.startWeight||newWeight}));
    addToast({emoji:"⚖️",title:`${newWeight} ${unit} logged`,body:"Consistency is the key — see you next week.",type:"success"});
    setNewWeight("");setNewNote("");
  };

  const saveGoal=()=>{setProfile(p=>({...p,goalWeight}));setEditGoal(false);addToast({emoji:"🎯",title:`Goal set: ${goalWeight} ${unit}`,type:"success"});};
  const deleteEntry=(id)=>setWeightLog(p=>p.filter(x=>x.id!==id));
  const updateEntry=(id,w)=>setWeightLog(p=>p.map(x=>x.id===id?{...x,weight:Number(w)}:x));

  const startW=Number(profile.startWeight||weightLog[0]?.weight||profile.weight||0);
  const currentW=Number(weightLog.length>0?weightLog[weightLog.length-1].weight:profile.weight||0);
  const goalW=Number(goalWeight||profile.goalWeight||0);
  const totalLoss=startW&&currentW?startW-currentW:0;
  const toGo=goalW&&currentW?currentW-goalW:0;
  const pctDone=startW&&goalW&&startW!==goalW?Math.min(Math.max(((startW-currentW)/(startW-goalW))*100,0),100):0;
  const weeks=goalW&&currentW&&currentW!==goalW?Math.ceil(Math.abs(currentW-goalW)/1):null;

  // BMI
  const calcBMI=()=>{if(!currentW)return null;const w=unit==="lbs"?currentW*0.453592:currentW;const h=profile.heightUnit==="imperial"?(parseInt(profile.heightFt)||0)*0.3048+(parseInt(profile.heightIn)||0)*0.0254:Number(profile.height)/100;if(!h)return null;return(w/(h*h)).toFixed(1);};
  const bmi=calcBMI();
  const bmiInfo=(b)=>{if(!b)return null;if(b<18.5)return{label:"Underweight",color:"#78d4ff"};if(b<25)return{label:"Healthy",color:G.sage};if(b<30)return{label:"Overweight",color:G.peach};return{label:"Obese",color:"#C06050"};};
  const bmiData=bmiInfo(Number(bmi));

  // Chart
  const chartData=weightLog.slice(-12);
  const chartMin=chartData.length?Math.min(...chartData.map(d=>d.weight))-2:0;
  const chartMax=chartData.length?Math.max(...chartData.map(d=>d.weight))+2:1;
  const chartW=300,chartH=80;
  const px=(i)=>chartData.length<2?chartW/2:i*(chartW/(chartData.length-1));
  const py=(w)=>chartH-((w-chartMin)/(chartMax-chartMin))*chartH;

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Weight Journey</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:4,fontStyle:"italic"}}>Log once a week for the most accurate trends.</div>
      {loggedThisWeek&&<div style={{background:`linear-gradient(135deg,${G.sageLight},${G.peachSoft})`,border:`1px solid ${G.cardBorder}`,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>✅ This week logged: <strong>{loggedThisWeek.weight} {unit}</strong> on {loggedThisWeek.date}</div>}

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <StatPill label="Current" value={currentW||"—"} unit={unit} color={G.peachSoft}/>
        <StatPill label="Goal" value={goalW||"—"} unit={unit} color={G.sageLight}/>
        <StatPill label={totalLoss>=0?"Lost":"Gained"} value={totalLoss?Math.abs(totalLoss).toFixed(1):"—"} unit={unit} color={G.goldLight}/>
      </div>

      {goalW>0&&currentW>0&&(
        <Card accent={`${G.gold}30`}>
          <SLabel text="Progress to Goal"/>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:G.inkMid}}>{startW} {unit}</span>
            <span style={{fontSize:13,color:G.gold,fontWeight:600}}>{pctDone.toFixed(0)}% there ✨</span>
            <span style={{fontSize:12,color:G.inkMid}}>{goalW} {unit}</span>
          </div>
          <ProgressBar value={pctDone} max={100} height={10}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
            <div style={{background:G.peachSoft,borderRadius:12,padding:"10px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{toGo>0?toGo.toFixed(1):0}</div><div style={{fontSize:10,color:G.inkLight}}>{unit} to go</div></div>
            {weeks&&<div style={{background:G.sageLight,borderRadius:12,padding:"10px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{weeks}</div><div style={{fontSize:10,color:G.inkLight}}>est. weeks</div></div>}
          </div>
        </Card>
      )}

      {bmi&&(<Card>
        <SLabel text="BMI"/>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
          <div style={{fontSize:36,fontWeight:700,color:bmiData?.color||G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{bmi}</div>
          <div><div style={{fontSize:14,fontWeight:600,color:bmiData?.color||G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{bmiData?.label}</div><div style={{fontSize:11,color:G.inkLight}}>Body Mass Index</div></div>
        </div>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",height:8,borderRadius:99,overflow:"hidden"}}>
            {[{w:"25%",c:"#78d4ff"},{w:"25%",c:G.sage},{w:"25%",c:G.peach},{w:"25%",c:"#C06050"}].map((s,i)=><div key={i} style={{width:s.w,background:s.c,opacity:0.6}}/>)}
          </div>
          <div style={{position:"absolute",top:-4,left:`${Math.min(Math.max((Number(bmi)-15)/(40-15)*100,0),96)}%`,width:16,height:16,borderRadius:99,background:bmiData?.color||G.gold,border:"2px solid white",transform:"translateX(-50%)",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            {["Under","Healthy","Over","Obese"].map(l=><span key={l} style={{fontSize:9,color:G.inkLight}}>{l}</span>)}
          </div>
        </div>
      </Card>)}

      {chartData.length>=2&&(
        <Card>
          <SLabel text="Weight Trend"/>
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH+20}`} style={{overflow:"visible"}}>
            <defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.peach} stopOpacity={0.3}/><stop offset="100%" stopColor={G.peach} stopOpacity={0}/></linearGradient></defs>
            {goalW>0&&goalW>=chartMin&&goalW<=chartMax&&<line x1={0} y1={py(goalW)} x2={chartW} y2={py(goalW)} stroke={G.sage} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.6}/>}
            <path d={`M ${px(0)} ${py(chartData[0].weight)} ${chartData.slice(1).map((d,i)=>`L ${px(i+1)} ${py(d.weight)}`).join(" ")} L ${px(chartData.length-1)} ${chartH} L 0 ${chartH} Z`} fill="url(#wGrad)"/>
            <polyline points={chartData.map((d,i)=>`${px(i)},${py(d.weight)}`).join(" ")} fill="none" stroke={G.peach} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            {chartData.map((d,i)=><circle key={i} cx={px(i)} cy={py(d.weight)} r={4} fill={G.peach} stroke="white" strokeWidth={2}/>)}
            <text x={px(0)} y={chartH+16} textAnchor="middle" fontSize={9} fill={G.inkLight} fontFamily="Jost,sans-serif">{chartData[0].date.slice(5)}</text>
            <text x={px(chartData.length-1)} y={chartH+16} textAnchor="middle" fontSize={9} fill={G.inkLight} fontFamily="Jost,sans-serif">{chartData[chartData.length-1].date.slice(5)}</text>
          </svg>
          {goalW>0&&<div style={{fontSize:11,color:G.sage,marginTop:4,fontStyle:"italic"}}>── Goal: {goalW} {unit}</div>}
        </Card>
      )}

      <Card>
        <SLabel text="🎯 Goal Weight"/>
        {editGoal||!goalW?(<><input placeholder={`Goal weight (${unit})`} type="number" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} style={iS}/><button onClick={saveGoal} style={bS(`linear-gradient(135deg,${G.sage},${G.gold})`)}>Set My Goal</button></>):
        (<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:22,fontWeight:700,color:G.sage,fontFamily:"'Cormorant Garamond',serif"}}>{goalW} {unit}</div><div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{toGo>0?`${toGo.toFixed(1)} ${unit} to go`:"🎉 Goal reached!"}</div></div><button onClick={()=>setEditGoal(true)} style={{background:"none",border:`1px solid ${G.cardBorder}`,borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:11,color:G.inkMid,fontFamily:"'Jost',sans-serif"}}>Edit</button></div>)}
      </Card>

      <Card>
        <SLabel text="⚖️ Log This Week's Weight"/>
        {loggedThisWeek?<div style={{fontSize:13,color:G.inkMid,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",marginBottom:8}}>Already logged this week. Next log available Monday.</div>:null}
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input placeholder={`Weight (${unit})`} type="number" value={newWeight} onChange={e=>setNewWeight(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
          <div style={{display:"flex",alignItems:"center",padding:"0 10px",background:G.peachSoft,borderRadius:12,fontSize:12,color:G.inkMid,fontWeight:600,border:`1px solid ${G.cardBorder}`}}>{unit}</div>
        </div>
        <input placeholder="Note (optional — morning, post-workout…)" value={newNote} onChange={e=>setNewNote(e.target.value)} style={iS}/>
        <button onClick={logWeight} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>+ Log Weight</button>
      </Card>

      {weightLog.length>0&&(
        <div>
          <SLabel text="Weekly History"/>
          {[...weightLog].reverse().map((entry,idx)=>{
            const prev=[...weightLog].reverse()[idx+1];
            const diff=prev?entry.weight-prev.weight:0;
            return (
              <div key={entry.id} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <span style={{fontSize:20,fontWeight:700,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{entry.weight}</span>
                    <span style={{fontSize:12,color:G.inkLight}}>{unit}</span>
                    {diff!==0&&<span style={{fontSize:11,color:diff<0?G.sage:G.peach,fontWeight:600}}>{diff<0?"▼":"▲"} {Math.abs(diff).toFixed(1)}</span>}
                  </div>
                  <div style={{fontSize:11,color:G.inkLight,marginTop:2}}>Week of {entry.weekKey||entry.date}{entry.note&&` · ${entry.note}`}</div>
                </div>
                <DelBtn onClick={()=>deleteEntry(entry.id)}/>
              </div>
            );
          })}
        </div>
      )}
      {weightLog.length===0&&<Empty emoji="⚖️" text="No entries yet — log your first weekly weight above"/>}
    </div>
  );
}

// ─── MEASUREMENTS TAB ─────────────────────────────────────────────────────────
const MEASUREMENT_FIELDS=[
  {key:"waist",label:"Waist",icon:"📏"},
  {key:"hips",label:"Hips",icon:"📐"},
  {key:"chest",label:"Chest",icon:"💪"},
  {key:"thighs",label:"Thighs",icon:"🦵"},
  {key:"arms",label:"Upper Arms",icon:"💪"},
  {key:"neck",label:"Neck",icon:"📏"},
  {key:"calves",label:"Calves",icon:"🦵"},
];

function MeasurementsTab({addToast}) {
  const [log,setLog]=useState(()=>LS.get("glorie_measurements",[]));
  const [form,setForm]=useState({});
  const [unit,setUnit]=useState("in");
  const [showForm,setShowForm]=useState(false);
  useEffect(()=>{LS.set("glorie_measurements",log);},[log]);

  const save=()=>{
    if(!Object.values(form).some(v=>v)){addToast({emoji:"📏",title:"Enter at least one measurement",type:"warning"});return;}
    const entry={id:Date.now(),date:TODAY,unit,...form};
    setLog(p=>[...p,entry].sort((a,b)=>a.date.localeCompare(b.date)));
    setForm({});setShowForm(false);
    addToast({emoji:"📏",title:"Measurements saved!",body:"Progress beyond the scale.",type:"success"});
  };

  const latest=log.length>0?log[log.length-1]:null;
  const prev=log.length>1?log[log.length-2]:null;

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Body Measurements</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>The scale doesn't tell the full story. Your body does.</div>

      {latest&&(
        <Card>
          <SLabel text="Latest Measurements"/>
          <div style={{fontSize:11,color:G.inkLight,marginBottom:12,fontFamily:"'Jost',sans-serif"}}>{latest.date} · in {latest.unit}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {MEASUREMENT_FIELDS.filter(f=>latest[f.key]).map(f=>{
              const diff=prev&&prev[f.key]?Number(latest[f.key])-Number(prev[f.key]):null;
              return (
                <div key={f.key} style={{background:G.peachSoft,borderRadius:14,padding:"12px"}}>
                  <div style={{fontSize:10,color:G.inkLight,textTransform:"uppercase",letterSpacing:1,fontFamily:"'Jost',sans-serif"}}>{f.icon} {f.label}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
                    <span style={{fontSize:20,fontWeight:700,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{latest[f.key]}</span>
                    <span style={{fontSize:11,color:G.inkLight}}>{latest.unit}</span>
                    {diff!==null&&diff!==0&&<span style={{fontSize:10,color:diff<0?G.sage:G.peach,fontWeight:600}}>{diff<0?"▼":"▲"}{Math.abs(diff).toFixed(1)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <button onClick={()=>setShowForm(p=>!p)} style={{...bS(showForm?`rgba(201,169,110,0.1)`:`linear-gradient(135deg,${G.peach},${G.gold})`),marginBottom:14,border:`1px solid ${G.cardBorder}`}}>
        {showForm?"✕ Cancel":"+ Log Measurements"}
      </button>

      {showForm&&(
        <Card>
          <SLabel text="New Entry"/>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <Chip label="inches" active={unit==="in"} onClick={()=>setUnit("in")}/>
            <Chip label="cm" active={unit==="cm"} onClick={()=>setUnit("cm")}/>
          </div>
          {MEASUREMENT_FIELDS.map(f=>(
            <div key={f.key} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:16,width:24}}>{f.icon}</span>
              <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif",width:80}}>{f.label}</span>
              <input placeholder={`0.0 ${unit}`} type="number" value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{...iS,flex:1,marginBottom:0,padding:"9px 12px"}}/>
            </div>
          ))}
          <button onClick={save} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>💾 Save Measurements</button>
        </Card>
      )}

      {log.length>1&&(
        <Card>
          <SLabel text="Progress Over Time"/>
          {MEASUREMENT_FIELDS.filter(f=>log.some(e=>e[f.key])).map(f=>{
            const entries=log.filter(e=>e[f.key]);
            if(entries.length<2)return null;
            const first=Number(entries[0][f.key]);
            const last=Number(entries[entries.length-1][f.key]);
            const diff=last-first;
            return (
              <div key={f.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
                <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{f.icon} {f.label}</span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{last} {entries[entries.length-1].unit}</span>
                  {diff!==0&&<span style={{fontSize:11,color:diff<0?G.sage:G.peach,fontWeight:600,marginLeft:8}}>{diff<0?"▼":"▲"}{Math.abs(diff).toFixed(1)}</span>}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {log.length===0&&<Empty emoji="📏" text="No measurements yet — log your first entry above"/>}
    </div>
  );
}

// ─── HABITS TAB ───────────────────────────────────────────────────────────────
const DEFAULT_HABITS={
  "💧 Drank water before coffee":"water",
  "💊 Took vitamins/supplements":"vitamins",
  "🥗 Ate a vegetable":"veggies",
  "🏃 Moved my body":"movement",
  "😴 Got 7+ hours sleep":"sleep",
  "🚫 No late night eating":"latenight",
  "📱 Logged my meals":"logging",
  "🙏 Morning intention":"intention",
};

function HabitsTab({habits,setHabits,addToast}) {
  const todayHabits=habits[TODAY]||{};
  const [customHabit,setCustomHabit]=useState("");
  const [customHabits,setCustomHabits]=useState(()=>LS.get("glorie_custom_habits",[]));
  useEffect(()=>{LS.set("glorie_custom_habits",customHabits);},[customHabits]);

  const allHabits={...DEFAULT_HABITS,...Object.fromEntries(customHabits.map(h=>[h,h]))};
  const total=Object.keys(allHabits).length;
  const done=Object.values(todayHabits).filter(Boolean).length;

  const toggle=(key)=>{
    const updated={...todayHabits,[key]:!todayHabits[key]};
    setHabits(p=>({...p,[TODAY]:updated}));
    if(!todayHabits[key]) addToast({emoji:"✅",title:key.split(" ").slice(1).join(" "),body:"Another habit checked off!",type:"success"});
  };

  const addCustom=()=>{
    if(!customHabit.trim())return;
    setCustomHabits(p=>[...p,customHabit.trim()]);
    setCustomHabit("");
    addToast({emoji:"✨",title:"Habit added",body:"Building your routine one day at a time.",type:"success"});
  };

  // Streak calculation
  const getStreak=()=>{
    let streak=0;
    let d=new Date();
    while(true){
      const key=d.toISOString().slice(0,10);
      const dayHabits=habits[key]||{};
      const dayDone=Object.values(dayHabits).filter(Boolean).length;
      if(dayDone===0&&key!==TODAY)break;
      if(dayDone>0)streak++;
      d.setDate(d.getDate()-1);
      if(streak>365)break;
    }
    return streak;
  };
  const streak=getStreak();

  // Calendar (last 4 weeks)
  const calDays=[];
  for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);const dayDone=Object.values(habits[key]||{}).filter(Boolean).length;calDays.push({key,day:d.getDate(),done:dayDone,total});}

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Daily Habits</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Small consistent actions create lasting change.</div>

      {/* Streak & progress */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <StatPill label="Streak" value={streak} unit="days" color={G.peachSoft}/>
        <StatPill label="Today" value={`${done}/${total}`} unit="done" color={G.sageLight}/>
        <StatPill label="Best" value={`${Math.round((done/total)*100)||0}%`} unit="today" color={G.goldLight}/>
      </div>

      {/* 4-week calendar */}
      <Card>
        <SLabel text="Last 4 Weeks"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:G.inkLight,fontFamily:"'Jost',sans-serif",marginBottom:4}}>{d}</div>)}
          {calDays.map(d=>{
            const pct=d.total>0?(d.done/d.total):0;
            const bg=pct===0?"rgba(201,169,110,0.1)":pct<0.5?G.peachSoft:pct<1?G.peachLight:G.sage;
            return <div key={d.key} style={{aspectRatio:"1",borderRadius:6,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:G.inkSoft,fontFamily:"'Jost',sans-serif",cursor:"default"}}>{d.done>0?d.day:""}</div>;
          })}
        </div>
        <div style={{display:"flex",gap:12,marginTop:10,fontSize:10,color:G.inkLight}}>
          <span>◻️ None</span><span style={{color:G.peachLight}}>▪️ Some</span><span style={{color:G.sage}}>▪️ All done</span>
        </div>
      </Card>

      {/* Today's habits */}
      <Card>
        <SLabel text="Today's Checklist"/>
        {Object.keys(allHabits).map(habit=>(
          <button key={habit} onClick={()=>toggle(habit)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 0",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid rgba(201,169,110,0.1)`,textAlign:"left",fontFamily:"inherit"}}>
            <div style={{width:24,height:24,borderRadius:8,border:`1.5px solid ${todayHabits[habit]?G.sage:G.cardBorder}`,background:todayHabits[habit]?G.sage:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
              {todayHabits[habit]&&<span style={{color:G.ink,fontSize:14,fontWeight:700}}>✓</span>}
            </div>
            <span style={{fontSize:14,color:todayHabits[habit]?G.inkLight:G.inkSoft,textDecoration:todayHabits[habit]?"line-through":"none",fontFamily:"'Cormorant Garamond',serif",transition:"all 0.2s"}}>{habit}</span>
          </button>
        ))}
      </Card>

      {/* Add custom habit */}
      <Card>
        <SLabel text="Add Custom Habit"/>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="e.g. 🧘 Meditated for 5 min" value={customHabit} onChange={e=>setCustomHabit(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
          <button onClick={addCustom} style={{...bS(`linear-gradient(135deg,${G.peach},${G.gold})`),flex:"none",padding:"0 18px"}}>+</button>
        </div>
        {customHabits.length>0&&(
          <div style={{marginTop:10}}>
            {customHabits.map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{h}</span>
                <button onClick={()=>setCustomHabits(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:G.inkLight,fontSize:12}}>✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── MILESTONES TAB ───────────────────────────────────────────────────────────
const MILESTONE_DEFS=[
  {id:"first_meal",icon:"🥗",title:"First Nourishment",desc:"Logged your first meal",check:({meals})=>meals.length>=1},
  {id:"first_workout",icon:"🌸",title:"First Movement",desc:"Logged your first workout",check:({workouts})=>workouts.length>=1},
  {id:"first_water",icon:"💧",title:"First Sip",desc:"Logged your first water",check:({water})=>water.length>=1},
  {id:"calorie_goal",icon:"🎯",title:"On Target",desc:"Hit your calorie goal for the day",check:({meals,profile,cyclePhase})=>{const goal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;const cal=meals.reduce((s,m)=>s+Number(m.calories||0),0);return cal>=goal*0.9&&cal<=goal*1.1;}},
  {id:"protein_50",icon:"🥩",title:"Protein Power",desc:"Logged 50g+ protein in a day",check:({meals})=>meals.reduce((s,m)=>s+Number(m.protein||0),0)>=50},
  {id:"water_goal",icon:"🌊",title:"Fully Hydrated",desc:"Hit 8 cups of water in a day",check:({water})=>water.reduce((s,w)=>s+Number(w.cups||0),0)>=8},
  {id:"weight_5",icon:"⚖️",title:"First 5 Lost",desc:"Lost your first 5 lbs",check:({weightLog,profile})=>{if(!weightLog||weightLog.length<2)return false;const start=Number(weightLog[0].weight);const last=Number(weightLog[weightLog.length-1].weight);return start-last>=5;}},
  {id:"weight_10",icon:"🏆",title:"10 Lbs Down",desc:"Lost 10 lbs total",check:({weightLog})=>{if(!weightLog||weightLog.length<2)return false;const start=Number(weightLog[0].weight);const last=Number(weightLog[weightLog.length-1].weight);return start-last>=10;}},
  {id:"workout_5",icon:"💪",title:"5 Workouts",desc:"Completed 5 total workouts",check:({allWorkouts})=>(allWorkouts||[]).length>=5},
  {id:"workout_10",icon:"🔥",title:"10 Workouts",desc:"Completed 10 total workouts",check:({allWorkouts})=>(allWorkouts||[]).length>=10},
  {id:"habit_streak_3",icon:"🌿",title:"3-Day Habit Streak",desc:"Completed habits 3 days in a row",check:({habitStreak})=>(habitStreak||0)>=3},
  {id:"habit_streak_7",icon:"✨",title:"7-Day Habit Streak",desc:"One full week of habits",check:({habitStreak})=>(habitStreak||0)>=7},
  {id:"logged_weight",icon:"📊",title:"On the Scale",desc:"Logged your first weekly weight",check:({weightLog})=>(weightLog||[]).length>=1},
  {id:"measurements",icon:"📏",title:"Beyond the Scale",desc:"Logged body measurements",check:({measurements})=>(measurements||[]).length>=1},
  {id:"full_day",icon:"🌟",title:"Perfect Day",desc:"Logged meals, workout, and water in one day",check:({meals,workouts,water})=>meals.length>=1&&workouts.length>=1&&water.length>=1},
];

function MilestonesTab({dayState,profile,cyclePhase,habits,weightLog,measurements}) {
  const [earned,setEarned]=useState(()=>LS.get("glorie_milestones",{}));
  const [newlyUnlocked,setNewlyUnlocked]=useState([]);

  const habitStreak=useMemo(()=>{
    let streak=0;let d=new Date();
    while(true){const key=d.toISOString().slice(0,10);const done=Object.values(habits[key]||{}).filter(Boolean).length;if(done===0&&key!==TODAY)break;if(done>0)streak++;d.setDate(d.getDate()-1);if(streak>365)break;}
    return streak;
  },[habits]);

  const allWorkouts=useMemo(()=>{
    const all=[];
    Object.keys(localStorage).filter(k=>k.startsWith("wellness_day_")).forEach(k=>{try{const d=JSON.parse(localStorage.getItem(k));if(d?.workouts)all.push(...d.workouts);}catch{}});
    return all;
  },[]);

  useEffect(()=>{
    const ctx={...dayState,profile,cyclePhase,weightLog,measurements,habitStreak,allWorkouts};
    const newEarned={...earned};let changed=false;const unlocked=[];
    MILESTONE_DEFS.forEach(m=>{
      if(!newEarned[m.id]&&m.check(ctx)){newEarned[m.id]=TODAY;changed=true;unlocked.push(m);}
    });
    if(changed){setEarned(newEarned);LS.set("glorie_milestones",newEarned);setNewlyUnlocked(unlocked);}
  },[dayState,weightLog,measurements,habitStreak]);

  const earnedCount=Object.keys(earned).length;

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Milestones</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Every win deserves to be celebrated.</div>

      {newlyUnlocked.length>0&&(
        <div style={{background:`linear-gradient(135deg,${G.goldLight},${G.peachSoft})`,border:`1px solid ${G.gold}`,borderRadius:18,padding:"16px",marginBottom:16,textAlign:"center",animation:"slideIn 0.5s ease"}}>
          <div style={{fontSize:32,marginBottom:8}}>🎉</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:G.inkSoft,fontWeight:600}}>New Achievement{newlyUnlocked.length>1?"s":""} Unlocked!</div>
          {newlyUnlocked.map(m=><div key={m.id} style={{fontSize:14,color:G.inkMid,marginTop:4}}>{m.icon} {m.title}</div>)}
        </div>
      )}

      <div style={{display:"flex",gap:10,marginBottom:18}}>
        <StatPill label="Earned" value={earnedCount} unit="badges" color={G.goldLight}/>
        <StatPill label="Total" value={MILESTONE_DEFS.length} unit="available" color={G.peachSoft}/>
        <StatPill label="Progress" value={`${Math.round((earnedCount/MILESTONE_DEFS.length)*100)}%`} unit="complete" color={G.sageLight}/>
      </div>

      <ProgressBar value={earnedCount} max={MILESTONE_DEFS.length} height={8}/>
      <div style={{fontSize:11,color:G.inkLight,marginBottom:18,marginTop:6,fontFamily:"'Jost',sans-serif"}}>{earnedCount} of {MILESTONE_DEFS.length} milestones unlocked</div>

      {/* Earned */}
      {earnedCount>0&&(
        <>
          <SLabel text="✨ Earned"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {MILESTONE_DEFS.filter(m=>earned[m.id]).map(m=>(
              <div key={m.id} style={{background:`linear-gradient(135deg,${G.goldLight},${G.peachSoft})`,border:`1px solid ${G.gold}`,borderRadius:16,padding:"14px",textAlign:"center",animation:"slideIn 0.3s ease"}}>
                <div style={{fontSize:28,marginBottom:6}}>{m.icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{m.title}</div>
                <div style={{fontSize:10,color:G.inkMid,marginTop:3,lineHeight:1.4}}>{m.desc}</div>
                <div style={{fontSize:9,color:G.inkLight,marginTop:4}}>{earned[m.id]}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Locked */}
      <SLabel text="🔒 Locked"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {MILESTONE_DEFS.filter(m=>!earned[m.id]).map(m=>(
          <div key={m.id} style={{background:"rgba(255,252,248,0.5)",border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"14px",textAlign:"center",opacity:0.6}}>
            <div style={{fontSize:28,marginBottom:6,filter:"grayscale(1)"}}>{m.icon}</div>
            <div style={{fontSize:13,fontWeight:600,color:G.inkLight,fontFamily:"'Cormorant Garamond',serif"}}>{m.title}</div>
            <div style={{fontSize:10,color:G.inkLight,marginTop:3,lineHeight:1.4}}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab({profile,cyclePhase}) {
  const [range,setRange]=useState(7);
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;

  const getDayData=(daysAgo)=>{
    const d=new Date();d.setDate(d.getDate()-daysAgo);
    const key=d.toISOString().slice(0,10);
    try{const data=JSON.parse(localStorage.getItem(`wellness_day_${key}`)||"{}");return{key,date:d,meals:data.meals||[],workouts:data.workouts||[],water:data.water||[]};}
    catch{return{key,date:d,meals:[],workouts:[],water:[]};}
  };

  const days=useMemo(()=>Array.from({length:range},(_,i)=>getDayData(range-1-i)),[range]);
  const avgCal=Math.round(days.reduce((s,d)=>s+d.meals.reduce((a,m)=>a+Number(m.calories||0),0),0)/days.filter(d=>d.meals.length>0).length)||0;
  const avgProt=Math.round(days.reduce((s,d)=>s+d.meals.reduce((a,m)=>a+Number(m.protein||0),0),0)/days.filter(d=>d.meals.length>0).length)||0;
  const totalWorkouts=days.reduce((s,d)=>s+d.workouts.length,0);
  const avgWater=Math.round(days.reduce((s,d)=>s+d.water.reduce((a,w)=>a+Number(w.cups||0),0),0)/days.filter(d=>d.water.length>0).length*10)/10||0;
  const loggedDays=days.filter(d=>d.meals.length>0).length;
  const onTargetDays=days.filter(d=>{const cal=d.meals.reduce((s,m)=>s+Number(m.calories||0),0);return cal>=goalCal*0.85&&cal<=goalCal*1.15;}).length;

  // Best/worst day for calories
  const calsByDay=days.map(d=>({label:d.date.toLocaleDateString("en-US",{weekday:"short"}),cal:d.meals.reduce((s,m)=>s+Number(m.calories||0),0),workouts:d.workouts.length,water:d.water.reduce((s,w)=>s+Number(w.cups||0),0)}));
  const maxCal=Math.max(...calsByDay.map(d=>d.cal),goalCal);

  // Pattern insight
  const getInsight=()=>{
    const overDays=calsByDay.filter(d=>d.cal>goalCal*1.1&&d.cal>0);
    const noLogDays=calsByDay.filter(d=>d.cal===0);
    if(noLogDays.length>range*0.4)return{emoji:"📝",text:`You didn't log ${noLogDays.length} of ${range} days. Consistent logging is the #1 predictor of success.`};
    if(overDays.length>0)return{emoji:"💡",text:`You went over your goal on ${overDays.length} day${overDays.length>1?"s":""} — often ${overDays[0]?.label}s. Try prepping meals on those days.`};
    if(onTargetDays>=range*0.7)return{emoji:"🌟",text:`You hit your calorie goal ${onTargetDays} out of ${range} days. That's exceptional consistency.`};
    return{emoji:"🌿",text:`You averaged ${avgCal} kcal/day vs your ${goalCal} kcal goal. ${avgCal<goalCal?"Try not to go too far under — under-eating slows metabolism.":"Keep it up!"}`};
  };
  const insight=getInsight();

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Weekly Analytics</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Patterns you can't see day-to-day.</div>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[7,14,30].map(r=><Chip key={r} label={`${r} days`} active={range===r} onClick={()=>setRange(r)}/>)}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {label:"Avg Calories",val:avgCal,unit:"kcal/day",color:G.peach},
          {label:"Avg Protein",val:avgProt,unit:"g/day",color:G.gold},
          {label:"Workouts",val:totalWorkouts,unit:`in ${range} days`,color:G.sage},
          {label:"Avg Water",val:avgWater,unit:"cups/day",color:G.sageSoft},
          {label:"Days Logged",val:loggedDays,unit:`of ${range}`,color:G.peachLight},
          {label:"On Target",val:onTargetDays,unit:"days",color:G.goldLight},
        ].map(s=>(
          <div key={s.label} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px"}}>
            <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div>
            <div style={{fontSize:11,fontWeight:600,color:G.inkSoft,fontFamily:"'Jost',sans-serif"}}>{s.label}</div>
            <div style={{fontSize:10,color:G.inkLight}}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Pattern insight */}
      <Card accent={`${G.gold}30`}>
        <SLabel text="Pattern Insight"/>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:20}}>{insight.emoji}</span>
          <div style={{fontSize:13,color:G.inkMid,lineHeight:1.6,fontFamily:"'Cormorant Garamond',serif"}}>{insight.text}</div>
        </div>
      </Card>

      {/* Calorie bar chart */}
      <Card>
        <SLabel text={`Calories — Last ${range} Days`}/>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
          {calsByDay.map((d,i)=>{
            const h=maxCal>0?Math.max((d.cal/maxCal)*70,d.cal>0?4:0):0;
            const onTarget=d.cal>=goalCal*0.85&&d.cal<=goalCal*1.15;
            const over=d.cal>goalCal*1.15;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",height:h,background:d.cal===0?"rgba(201,169,110,0.1)":onTarget?G.sage:over?G.peach:G.goldLight,borderRadius:"4px 4px 0 0",transition:"height 0.5s ease",minHeight:d.cal>0?4:0}}/>
                <span style={{fontSize:8,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>{d.label}</span>
              </div>
            );
          })}
        </div>
        {/* Goal line label */}
        <div style={{display:"flex",gap:12,marginTop:10,fontSize:10,color:G.inkLight}}>
          <span style={{color:G.sage}}>■ On target</span>
          <span style={{color:G.peach}}>■ Over</span>
          <span style={{color:G.goldLight}}>■ Under</span>
        </div>
      </Card>

      {/* Workout frequency */}
      <Card>
        <SLabel text="Movement Frequency"/>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:40}}>
          {calsByDay.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:"100%",height:d.workouts>0?30:4,background:d.workouts>0?G.sage:"rgba(201,169,110,0.1)",borderRadius:"4px 4px 0 0"}}/>
              <span style={{fontSize:8,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>{d.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── CHECK-IN TAB ─────────────────────────────────────────────────────────────
function CheckInTab({recovery,setRecovery,dayState,profile,cyclePhase,addToast}) {
  const [sleep,setSleep]=useState(recovery.sleep||"");
  const [soreness,setSoreness]=useState(recovery.soreness||3);
  const [stress,setStress]=useState(recovery.stress||3);
  const [energy,setEnergy]=useState(recovery.energy||3);
  const [mood,setMood]=useState(recovery.mood||"");
  const [restDay,setRestDay]=useState(recovery.restDay||false);
  const [notes,setNotes]=useState(recovery.notes||"");
  const workoutCats=[...new Set(dayState.workouts.map(w=>w.category))];
  const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);

  const save=()=>{
    const rec={sleep:Number(sleep),soreness,stress,energy,mood,restDay,notes,date:TODAY};
    setRecovery(rec);LS.set("wellness_recovery_"+TODAY,rec);
    addToast({emoji:"🌸",title:"Check-in saved",body:restDay?"Rest day marked — you deserve it.":"Keep listening to your body.",type:"success"});
  };

  const suppSugg=[];
  if(soreness>=4)suppSugg.push({name:"Magnesium",why:"Soothes muscles and improves sleep"});
  if(stress>=4)suppSugg.push({name:"Ashwagandha",why:"Calms cortisol and stress response"});
  if(energy<=2)suppSugg.push({name:"Vitamin B12",why:"Supports natural energy"});
  if(sleep<6)suppSugg.push({name:"Melatonin",why:"Gently regulates sleep cycles"});

  const workoutRecs=soreness>=4||restDay?["Yoga (Hatha / gentle)","Stretching / Flexibility","Walking (2 mph, slow)"]:energy>=4&&soreness<=2?phase?phase.workouts:["HIIT (general)","Weight Training (vigorous)"]:["Walking (3.5 mph, brisk)","Yoga (Vinyasa / flow)"];

  const ScaleBtn=({val,current,setter,color})=>(
    <button onClick={()=>setter(val)} style={{width:36,height:36,borderRadius:10,border:`1.5px solid ${current===val?color:G.cardBorder}`,background:current===val?`${color}30`:"rgba(255,252,248,0.8)",cursor:"pointer",color:current===val?G.inkSoft:G.inkLight,fontWeight:700,fontSize:14,fontFamily:"'Cormorant Garamond',serif"}}>{val}</button>
  );

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Morning Check-In</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>10 seconds of honesty sets your whole day up right.</div>

      {recovery.date===TODAY&&(
        <Card accent={`${G.sage}40`}>
          <SLabel text="Today's Check-In Saved"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{label:"Sleep",val:`${recovery.sleep||"—"}h`,color:G.peach},{label:"Energy",val:`${recovery.energy||"—"}/5`,color:G.sage},{label:"Soreness",val:`${recovery.soreness||"—"}/5`,color:G.gold}].map(s=>(
              <div key={s.label} style={{background:G.peachSoft,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div>
                <div style={{fontSize:10,color:G.inkLight}}>{s.label}</div>
              </div>
            ))}
          </div>
          {recovery.mood&&<div style={{fontSize:13,color:G.inkMid,marginTop:10,fontFamily:"'Cormorant Garamond',serif"}}>Mood: {recovery.mood}</div>}
        </Card>
      )}

      <Card>
        <SLabel text="How are you today?"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,color:G.inkSoft,marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>😴 Hours of sleep last night</div>
          <input type="number" placeholder="e.g. 7.5" value={sleep} onChange={e=>setSleep(e.target.value)} style={{...iS,marginBottom:0}}/>
        </div>
        {[
          {label:"💪 Muscle soreness",val:soreness,setter:setSoreness,color:G.peach,low:"None",high:"Very sore"},
          {label:"⚡ Energy level",val:energy,setter:setEnergy,color:G.sage,low:"Drained",high:"Energized"},
          {label:"🧠 Stress level",val:stress,setter:setStress,color:G.gold,low:"Calm",high:"Stressed"},
        ].map(s=>(
          <div key={s.label} style={{marginBottom:16}}>
            <div style={{fontSize:13,color:G.inkSoft,marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>{s.label}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:G.inkLight,width:46}}>{s.low}</span>
              {[1,2,3,4,5].map(v=><ScaleBtn key={v} val={v} current={s.val} setter={s.setter} color={s.color}/>)}
              <span style={{fontSize:10,color:G.inkLight,width:52,textAlign:"right"}}>{s.high}</span>
            </div>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:13,color:G.inkSoft,marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>😊 Mood</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["😊 Good","😌 Calm","😤 Frustrated","😰 Anxious","😴 Tired","🔥 Motivated","😢 Low"].map(m=>(
              <Chip key={m} label={m} active={mood===m} onClick={()=>setMood(mood===m?"":m)} small/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button onClick={()=>setRestDay(!restDay)} style={{width:28,height:28,borderRadius:8,border:`1.5px solid ${restDay?G.sage:G.cardBorder}`,background:restDay?G.sage:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:G.ink,fontWeight:700}}>{restDay?"✓":""}</button>
          <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>🛌 Rest day</span>
        </div>
        <input placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} style={iS}/>
        <button onClick={save} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>Save Check-In</button>
      </Card>

      {workoutRecs.length>0&&(
        <Card accent={`${G.sage}40`}>
          <SLabel text="Recommended movement today"/>
          {workoutRecs.slice(0,3).map((w,i)=>{const entry=WORKOUT_DB.find(x=>x.name===w);return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
              <span style={{fontSize:18}}>{entry?.emoji||"🌿"}</span>
              <div style={{flex:1}}><div style={{fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{w}</div><div style={{fontSize:11,color:G.inkLight}}>{entry?.category} · MET {entry?.met}</div></div>
            </div>
          );})}
        </Card>
      )}

      {suppSugg.length>0&&(
        <Card accent={`${G.gold}30`}>
          <SLabel text="Recovery suggestions"/>
          {suppSugg.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
              <span style={{fontSize:16}}>🌿</span>
              <div><div style={{fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{s.name}</div><div style={{fontSize:12,color:G.inkMid,fontStyle:"italic",marginTop:2}}>{s.why}</div></div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── CYCLE TAB ────────────────────────────────────────────────────────────────
function CycleTab({cyclePhase,setCyclePhase,profile,addToast}) {
  if(profile.sex!=="female") return(
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:40,marginBottom:12}}>🌙</div>
      <div style={{fontSize:18,color:G.inkMid,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Cycle Sync is for female profiles</div>
      <div style={{fontSize:13,color:G.inkLight,marginTop:8}}>Update your sex in Profile to enable this feature.</div>
    </div>
  );
  const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);
  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Cycle Sync</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Your body changes each phase — so should your approach.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {CYCLE_PHASES.map(p=>(
          <button key={p.id} onClick={()=>{setCyclePhase(p.id);addToast({emoji:p.emoji,title:`${p.label} phase set`,body:p.notes,type:"success"});}} style={{background:cyclePhase===p.id?`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`:"rgba(255,252,248,0.7)",border:`1.5px solid ${cyclePhase===p.id?G.gold:G.cardBorder}`,borderRadius:18,padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:28}}>{p.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:15,color:cyclePhase===p.id?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{p.label}<span style={{fontSize:11,fontWeight:400,color:G.inkLight,marginLeft:8}}>{p.days}</span></div>
                <div style={{fontSize:12,color:G.inkMid,marginTop:3,fontStyle:"italic"}}>{p.notes}</div>
              </div>
              {cyclePhase===p.id&&<span style={{color:G.gold,fontSize:18}}>✓</span>}
            </div>
            {cyclePhase===p.id&&(
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid rgba(201,169,110,0.15)`,display:"flex",gap:16}}>
                <div><div style={{fontSize:10,color:G.inkLight}}>Cal adj</div><div style={{fontSize:13,fontWeight:600,color:G.gold}}>{p.calAdj>0?"+":""}{p.calAdj} kcal</div></div>
                <div><div style={{fontSize:10,color:G.inkLight}}>Carbs</div><div style={{fontSize:13,fontWeight:600,color:G.gold}}>{p.carbAdj}</div></div>
                <div><div style={{fontSize:10,color:G.inkLight}}>Intensity</div><div style={{fontSize:13,fontWeight:600,color:G.gold}}>{p.intensity}</div></div>
              </div>
            )}
          </button>
        ))}
      </div>
      {phase&&(<Card accent={`${G.gold}30`}><SLabel text="Suggested workouts this phase"/>{phase.workouts.map((w,i)=>{const entry=WORKOUT_DB.find(x=>x.name===w);return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}><span style={{fontSize:20}}>{entry?.emoji||"🏋️"}</span><div style={{flex:1}}><div style={{fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{w}</div><div style={{fontSize:11,color:G.inkLight}}>{entry?.category} · MET {entry?.met}</div></div></div>);})}</Card>)}
    </div>
  );
}

// ─── MEDS TAB ─────────────────────────────────────────────────────────────────
const CAT_EMOJIS={Supplement:"💊",Prescription:"💉",Vitamin:"🌟",Protein:"🥤",Herb:"🌿",OTC:"🧴"};


function MedCard({med,takenLog,onToggle,onDelete}) {
  const taken=!!takenLog[`${med.id}_${TODAY}`];const takenAt=takenLog[`${med.id}_${TODAY}`];
  return(
    <div style={{background:taken?`linear-gradient(135deg,${G.sageLight},rgba(255,252,248,0.9))`:G.cardBg,border:`1px solid ${taken?G.sage:G.cardBorder}`,borderRadius:16,padding:"14px 12px",display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,transition:"all 0.25s"}}>
      <button onClick={onToggle} style={{width:30,height:30,borderRadius:9,border:`1.5px solid ${taken?G.sage:G.cardBorder}`,background:taken?G.sage:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:G.ink,fontWeight:800,transition:"all 0.2s",marginTop:2}}>{taken?"✓":""}</button>
      <span style={{fontSize:22,flexShrink:0}}>{CAT_EMOJIS[med.category]||"🌿"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:15,color:taken?G.inkLight:G.inkSoft,textDecoration:taken?"line-through":"none",fontFamily:"'Cormorant Garamond',serif"}}>{med.name}</div>
        <div style={{fontSize:11,color:G.inkLight,marginTop:3,display:"flex",gap:8,flexWrap:"wrap"}}>
          {med.dose&&<span>💊 {med.dose}</span>}{med.frequency&&<span>🔁 {med.frequency}</span>}
          {med.reminderTime&&<span style={{color:G.gold}}>⏰ {fmt.timeLabel(med.reminderTime)}</span>}
        </div>
        {med.notes&&<div style={{fontSize:11,color:G.inkLight,marginTop:3,fontStyle:"italic"}}>{med.notes}</div>}
        {taken&&takenAt&&typeof takenAt==="string"&&takenAt.includes(":")&&<div style={{fontSize:11,color:G.sage,marginTop:4}}>✅ Taken at {takenAt}</div>}
      </div>
      <DelBtn onClick={onDelete}/>
    </div>
  );
}

function MedsTab({medList,setMedList,takenLog,setTakenLog,addToast,dayState}) {
  const [showForm,setShowForm]=useState(false);
  const [name,setName]=useState("");const [dose,setDose]=useState("");
  const [cat,setCat]=useState("Supplement");const [freq,setFreq]=useState("Daily");
  const [remTime,setRemTime]=useState("");const [notes,setNotes]=useState("");
  const takenToday=medList.filter(m=>takenLog[`${m.id}_${TODAY}`]).length;
  const workoutCats=[...new Set(dayState.workouts.map(w=>w.category))];
  const pairingSuggestions=workoutCats.flatMap(cat=>{const suggested=SUPP_PAIRINGS[cat]||[];return suggested.filter(s=>!medList.some(m=>m.name.toLowerCase().includes(s))).slice(0,1).map(s=>({workout:cat,supp:s}));}).slice(0,2);

  const add=()=>{if(!name)return;const med={id:Date.now(),name,dose,category:cat,frequency:freq,reminderTime:remTime,notes};setMedList(p=>[...p,med]);addToast({emoji:CAT_EMOJIS[cat]||"🌿",title:`${name} added`,body:remTime?`Reminder set for ${fmt.timeLabel(remTime)}`:"No reminder set",type:"success"});setName("");setDose("");setNotes("");setRemTime("");setShowForm(false);};
  const toggleTaken=(med)=>{const key=`${med.id}_${TODAY}`;const already=takenLog[key];setTakenLog(p=>{const n={...p};if(already)delete n[key];else n[key]=fmt.time();return n;});if(!already)addToast({emoji:"✅",title:`${med.name} marked taken`,body:med.dose||"",type:"success"});};
  const scheduled=medList.filter(m=>m.reminderTime).sort((a,b)=>a.reminderTime.localeCompare(b.reminderTime));
  const unscheduled=medList.filter(m=>!m.reminderTime);

  return(
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Total" value={medList.length} unit="in list" color={G.peachSoft}/>
        <StatPill label="Taken" value={takenToday} unit="today" color={G.sageLight}/>
        <StatPill label="Pending" value={medList.length-takenToday} unit="left" color={G.goldLight}/>
      </div>
      {pairingSuggestions.length>0&&(<Card accent={`${G.gold}40`}><SLabel text="Suggested for your workout"/>{pairingSuggestions.map((p,i)=>(<div key={i} style={{fontSize:13,color:G.inkSoft,padding:"5px 0",fontFamily:"'Cormorant Garamond',serif"}}>You logged <span style={{color:G.peach,fontWeight:600}}>{p.workout}</span> — consider adding <span style={{color:G.gold,fontWeight:600}}>{p.supp}</span>.</div>))}</Card>)}
      <button onClick={()=>setShowForm(p=>!p)} style={{...bS(showForm?`rgba(201,169,110,0.1)`:`linear-gradient(135deg,${G.peach},${G.gold})`),marginBottom:14,border:`1px solid ${G.cardBorder}`}}>{showForm?"✕ Cancel":"+ Add Supplement or Medication"}</button>
      {showForm&&(<Card><SLabel text="New Entry"/>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>{Object.keys(CAT_EMOJIS).map(t=><Chip key={t} label={`${CAT_EMOJIS[t]} ${t}`} active={cat===t} onClick={()=>setCat(t)}/>)}</div>
        <input placeholder="Name (e.g. Vitamin D3, Metformin)" value={name} onChange={e=>setName(e.target.value)} style={iS}/>
        <input placeholder="Dosage (e.g. 1000mg, 2 capsules)" value={dose} onChange={e=>setDose(e.target.value)} style={iS}/>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>{["Daily","Twice Daily","With Meals","Weekly","As Needed"].map(f=><Chip key={f} label={f} active={freq===f} onClick={()=>setFreq(f)}/>)}</div>
        <div style={{marginBottom:10}}><div style={{fontSize:10,color:G.inkLight,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Jost',sans-serif"}}>⏰ Reminder Time</div><input type="time" value={remTime} onChange={e=>setRemTime(e.target.value)} style={{...iS,marginBottom:4,colorScheme:"light"}}/></div>
        <input placeholder="Notes (e.g. take with food)" value={notes} onChange={e=>setNotes(e.target.value)} style={iS}/>
        <button onClick={add} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>💾 Save to My List</button>
      </Card>)}
      {medList.length===0?<Empty emoji="🌿" text="No supplements or meds added yet"/>:(
        <>{scheduled.length>0&&<><SLabel text="⏰ Scheduled"/>{scheduled.map(m=><MedCard key={m.id} med={m} takenLog={takenLog} onToggle={()=>toggleTaken(m)} onDelete={()=>setMedList(p=>p.filter(x=>x.id!==m.id))}/>)}</>}
        {unscheduled.length>0&&<><SLabel text={scheduled.length>0?"📋 No Reminder":"📋 My List"}/>{unscheduled.map(m=><MedCard key={m.id} med={m} takenLog={takenLog} onToggle={()=>toggleTaken(m)} onDelete={()=>setMedList(p=>p.filter(x=>x.id!==m.id))}/>)}</>}</>
      )}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
const DEF_PROFILE={name:"",age:"",sex:"female",weight:"",weightUnit:"lbs",heightFt:"",heightIn:"",heightUnit:"imperial",height:"",activity:"moderate",goal:"maintain",streak:0,goalWeight:"",startWeight:""};

function ProfileTab({profile,setProfile,addToast}) {
  const [local,setLocal]=useState({...profile});
  const set=(k,v)=>setLocal(p=>({...p,[k]:v}));
  const tdee=local.weight&&local.age?calcTDEE(local):null;
  const goalCal=tdee?calcGoalCalories(local,null):null;
  const bmr=local.weight&&local.age?Math.round(calcBMR(local)):null;
  const save=()=>{setProfile(local);addToast({emoji:"✨",title:"Profile saved!",body:goalCal?`Daily target: ${goalCal} kcal`:"",type:"success"});};
  return(
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Your Profile</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Personalizes your goals, calorie targets & insights</div>
      {tdee&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>{[{label:"BMR",val:bmr,sub:"base rate",color:G.peach},{label:"TDEE",val:tdee,sub:"daily burn",color:G.gold},{label:"Goal",val:goalCal,sub:local.goal==="lose"?"fat loss":local.goal==="gain"?"muscle gain":"maintenance",color:G.sage}].map(s=>(<div key={s.label} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div><div style={{fontSize:10,fontWeight:600,color:G.inkSoft,marginTop:2,fontFamily:"'Jost',sans-serif"}}>{s.label}</div><div style={{fontSize:9,color:G.inkLight}}>{s.sub}</div></div>))}</div>)}
      {tdee&&(<Card accent={`${G.gold}30`}><SLabel text="Why your goal is what it is"/><div style={{fontSize:14,color:G.inkMid,lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif"}}>Your body burns <span style={{color:G.gold,fontWeight:600}}>{tdee} kcal/day</span> at your activity level.{local.goal==="lose"&&<> A <span style={{color:G.sage,fontWeight:600}}>500 kcal daily deficit</span> creates ~1 lb/week fat loss safely.</>}{local.goal==="gain"&&<> A <span style={{color:G.sage,fontWeight:600}}>300 kcal surplus</span> supports lean muscle growth.</>}{local.goal==="maintain"&&<> Eating at <span style={{color:G.sage,fontWeight:600}}>{tdee} kcal</span> maintains your weight.</>}</div></Card>)}
      <Card><SLabel text="Basic Info"/><input placeholder="Your name" value={local.name} onChange={e=>set("name",e.target.value)} style={iS}/><div style={{display:"flex",gap:8,marginBottom:8}}><input placeholder="Age" type="number" value={local.age} onChange={e=>set("age",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/><div style={{flex:1,display:"flex",gap:6,alignItems:"center"}}><Chip label="Female" active={local.sex==="female"} onClick={()=>set("sex","female")}/><Chip label="Male" active={local.sex==="male"} onClick={()=>set("sex","male")}/></div></div></Card>
      <Card><SLabel text="Weight"/><div style={{display:"flex",gap:8,marginBottom:8}}><input placeholder={local.weightUnit==="lbs"?"Weight (lbs)":"Weight (kg)"} type="number" value={local.weight} onChange={e=>set("weight",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/><div style={{display:"flex",gap:6,alignItems:"center"}}><Chip label="lbs" active={local.weightUnit==="lbs"} onClick={()=>set("weightUnit","lbs")}/><Chip label="kg" active={local.weightUnit==="kg"} onClick={()=>set("weightUnit","kg")}/></div></div></Card>
      <Card><SLabel text="Height"/><div style={{display:"flex",gap:6,marginBottom:8}}><Chip label="ft/in" active={local.heightUnit==="imperial"} onClick={()=>set("heightUnit","imperial")}/><Chip label="cm" active={local.heightUnit==="metric"} onClick={()=>set("heightUnit","metric")}/></div>{local.heightUnit==="imperial"?(<div style={{display:"flex",gap:8}}><input placeholder="Feet" type="number" value={local.heightFt} onChange={e=>set("heightFt",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/><input placeholder="Inches" type="number" value={local.heightIn} onChange={e=>set("heightIn",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/></div>):(<input placeholder="Height (cm)" type="number" value={local.height} onChange={e=>set("height",e.target.value)} style={{...iS,marginBottom:0}}/>)}</Card>
      <Card><SLabel text="Activity Level"/><div style={{display:"flex",flexDirection:"column",gap:6}}>{[{val:"sedentary",label:"Sedentary",sub:"Desk job, little exercise"},{val:"light",label:"Lightly Active",sub:"1–3 days/week"},{val:"moderate",label:"Moderately Active",sub:"3–5 days/week"},{val:"active",label:"Very Active",sub:"6–7 days/week"},{val:"veryActive",label:"Extra Active",sub:"Physical job + training"}].map(a=>(<button key={a.val} onClick={()=>set("activity",a.val)} style={{background:local.activity===a.val?`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`:"rgba(255,252,248,0.7)",border:`1.5px solid ${local.activity===a.val?G.gold:G.cardBorder}`,borderRadius:14,padding:"11px 14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}><div style={{fontWeight:600,fontSize:14,color:local.activity===a.val?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{a.label}</div><div style={{fontSize:11,color:G.inkLight,fontStyle:"italic"}}>{a.sub}</div></button>))}</div></Card>
      <Card><SLabel text="Your Goal"/><div style={{display:"flex",gap:8}}>{[{val:"lose",label:"🔥 Lose Fat"},{val:"maintain",label:"⚖️ Maintain"},{val:"gain",label:"💪 Build"}].map(g=>(<button key={g.val} onClick={()=>set("goal",g.val)} style={{flex:1,padding:"13px 4px",borderRadius:14,border:`1.5px solid ${local.goal===g.val?G.gold:G.cardBorder}`,background:local.goal===g.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.7)",cursor:"pointer",fontWeight:600,fontSize:11,color:local.goal===g.val?G.inkSoft:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{g.label}</button>))}</div></Card>
      <button onClick={save} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>✨ Save Profile</button>
    </div>
  );
}
// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({onDone}) {
  const [fade,setFade]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setFade(true),1800);
    const t2=setTimeout(()=>onDone(),2400);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:G.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      opacity:fade?0:1,transition:"opacity 0.6s ease",
      fontFamily:"'Cormorant Garamond',serif",
    }}>
      <GoldSpeckles corner="tr"/>
      <GoldSpeckles corner="bl"/>
      <div style={{textAlign:"center",animation:"splashIn 0.9s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <GlorieLogo size={72}/>
        <div style={{fontSize:52,fontWeight:600,color:G.inkSoft,letterSpacing:"-1px",marginTop:16,lineHeight:1}}>Glorié</div>
        <div style={{fontSize:15,color:G.inkLight,fontStyle:"italic",marginTop:8,letterSpacing:"0.05em"}}>your daily glow, inside and out.</div>
      </div>
      <div style={{position:"absolute",bottom:48,fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.15em",textTransform:"uppercase"}}>Wellness by design</div>
    </div>
  );
}

// ─── ONBOARDING SCREENS ───────────────────────────────────────────────────────
const ONBOARDING_SLIDES=[
  {
    emoji:"🥗",
    title:"Nourish your body",
    body:"Log meals from our food database with calories that fill in automatically. Your daily goal adjusts to your body and goals.",
    bg:`linear-gradient(135deg,${G.peachSoft},${G.cream})`,
    accent:G.peach,
  },
  {
    emoji:"🌸",
    title:"Move with intention",
    body:"Track workouts from our exercise library. Calories burned calculate based on your weight and duration — automatically.",
    bg:`linear-gradient(135deg,${G.sageLight},${G.cream})`,
    accent:G.sage,
  },
  {
    emoji:"💊",
    title:"Your wellness routine",
    body:"Track supplements and medications with smart reminders. Your app connects your workout to the right supplements to take after.",
    bg:`linear-gradient(135deg,${G.goldLight},${G.cream})`,
    accent:G.gold,
  },
  {
    emoji:"🌙",
    title:"Built around your body",
    body:"Cycle sync adjusts your calories, carbs, and workout intensity based on your phase. Recovery tracking keeps you from overdoing it.",
    bg:`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`,
    accent:G.inkMid,
  },
];

function OnboardingScreen({onDone}) {
  const [slide,setSlide]=useState(0);
  const [animating,setAnimating]=useState(false);
  const current=ONBOARDING_SLIDES[slide];
  const isLast=slide===ONBOARDING_SLIDES.length-1;

  const next=()=>{
    if(animating)return;
    setAnimating(true);
    setTimeout(()=>{
      if(isLast){onDone();}
      else{setSlide(s=>s+1);}
      setAnimating(false);
    },200);
  };

  const skip=()=>onDone();

  return (
    <div style={{
      minHeight:"100vh",background:current.bg,
      display:"flex",flexDirection:"column",
      fontFamily:"'Cormorant Garamond',serif",
      maxWidth:480,margin:"0 auto",
      transition:"background 0.5s ease",
    }}>
      {/* Skip */}
      <div style={{padding:"52px 24px 0",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={skip} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase"}}>Skip</button>
      </div>

      {/* Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 32px",textAlign:"center",opacity:animating?0:1,transition:"opacity 0.2s"}}>
        <div style={{fontSize:72,marginBottom:28}}>{current.emoji}</div>
        <div style={{fontSize:34,fontWeight:600,color:G.inkSoft,lineHeight:1.2,marginBottom:16}}>{current.title}</div>
        <div style={{fontSize:16,color:G.inkMid,lineHeight:1.7,fontStyle:"italic",maxWidth:320}}>{current.body}</div>
      </div>

      {/* Dots + button */}
      <div style={{padding:"0 32px 60px",display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
        <div style={{display:"flex",gap:8}}>
          {ONBOARDING_SLIDES.map((_,i)=>(
            <div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?24:8,height:8,borderRadius:99,background:i===slide?current.accent:"rgba(44,36,22,0.15)",transition:"all 0.3s",cursor:"pointer"}}/>
          ))}
        </div>
        <button onClick={next} style={{
          width:"100%",padding:"16px",borderRadius:16,border:"none",cursor:"pointer",
          background:`linear-gradient(135deg,${G.peach},${G.gold})`,
          color:G.ink,fontWeight:700,fontSize:15,
          fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",
          boxShadow:"0 4px 20px rgba(201,169,110,0.3)",
        }}>
          {isLast?"Get Started →":"Continue →"}
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN / SIGNUP SCREEN ────────────────────────────────────────────────────
function AuthScreen({onAuth}) {
  const [screen,setScreen]=useState("welcome"); // welcome | login | signup | questionnaire
  const [step,setStep]=useState(0); // questionnaire step 0-6
  const [anim,setAnim]=useState(false);

  // Account fields
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  // Profile questionnaire fields
  const [sex,setSex]=useState("");
  const [age,setAge]=useState("");
  const [heightFt,setHeightFt]=useState("");
  const [heightIn,setHeightIn]=useState("");
  const [weight,setWeight]=useState("");
  const [weightUnit,setWeightUnit]=useState("lbs");
  const [goalWeight,setGoalWeight]=useState("");
  const [goal,setGoal]=useState("");
  const [activity,setActivity]=useState("");
  const [challenges,setChallenges]=useState([]);
  const [dietStyle,setDietStyle]=useState("");
  const [workoutFreq,setWorkoutFreq]=useState("");
  const [motivation,setMotivation]=useState("");

  const aS={...iS,marginBottom:12,fontSize:15,padding:"14px 16px",borderRadius:14,background:"rgba(255,252,248,0.9)"};

  const TOTAL_STEPS=7;

  const toggleChallenge=(c)=>setChallenges(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);

  const handleSignup=()=>{
    setError("");
    if(!name.trim()){setError("Please enter your name.");return;}
    if(!email.includes("@")){setError("Please enter a valid email.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    setLoading(true);
    setTimeout(()=>{
      const users=LS.get("glorie_users",{});
      if(users[email.toLowerCase()]){setError("An account with this email already exists.");setLoading(false);return;}
      users[email.toLowerCase()]={name,email,password,createdAt:TODAY};
      LS.set("glorie_users",users);
      LS.set("glorie_session",{email:email.toLowerCase(),name,loggedIn:true});
      setLoading(false);
      setScreen("questionnaire");
      setStep(0);
    },800);
  };

  const handleLogin=()=>{
    setError("");
    if(!email.includes("@")){setError("Please enter a valid email.");return;}
    if(!password){setError("Please enter your password.");return;}
    setLoading(true);
    setTimeout(()=>{
      const users=LS.get("glorie_users",{});
      const user=users[email.toLowerCase()];
      if(!user){setError("No account found with this email.");setLoading(false);return;}
      if(user.password!==password){setError("Incorrect password.");setLoading(false);return;}
      LS.set("glorie_session",{email:email.toLowerCase(),name:user.name,loggedIn:true});
      setLoading(false);
      onAuth({name:user.name,email:email.toLowerCase()});
    },800);
  };

  const nextStep=()=>{
    setAnim(true);
    setTimeout(()=>{setStep(s=>s+1);setAnim(false);},200);
  };

  const prevStep=()=>{
    if(step===0){setScreen("signup");return;}
    setAnim(true);
    setTimeout(()=>{setStep(s=>s-1);setAnim(false);},200);
  };

  const finishQuestionnaire=()=>{
    // Build and save full profile from questionnaire answers
    const tdeeMultipliers={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};
    const wKg=weightUnit==="lbs"?Number(weight)*0.453592:Number(weight);
    const hCm=(parseInt(heightFt)||0)*30.48+(parseInt(heightIn)||0)*2.54;
    const ageN=parseInt(age)||25;
    const bmr=sex==="female"?10*wKg+6.25*hCm-5*ageN-161:10*wKg+6.25*hCm-5*ageN+5;
    const actKey=activity||"moderate";
    const tdee=Math.round(bmr*(tdeeMultipliers[actKey]||1.55));
    let goalCal=tdee;
    if(goal==="lose")goalCal=tdee-500;
    if(goal==="gain")goalCal=tdee+300;

    const profile={
      name,age,sex,weight,weightUnit,
      heightFt,heightIn,heightUnit:"imperial",
      activity:actKey,goal:goal||"maintain",
      goalWeight,startWeight:weight,
      dietStyle,workoutFreq,challenges,motivation,
      goalCalories:Math.max(1200,Math.round(goalCal)),
      onboarded:true,
    };
    LS.set("wellness_profile",profile);
    onAuth({name,email:email.toLowerCase(),profile});
  };

  // ── Welcome screen ─────────────────────────────────────────────────────────
  if(screen==="welcome") return (
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",fontFamily:"'Cormorant Garamond',serif",maxWidth:480,margin:"0 auto",padding:"0 28px",position:"relative",overflow:"hidden"}}>
      <GoldSpeckles corner="tr"/>
      <GoldSpeckles corner="bl"/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <GlorieLogo size={80}/>
        <div style={{fontSize:54,fontWeight:600,color:G.inkSoft,letterSpacing:"-1px",marginTop:20,lineHeight:1}}>Glorié</div>
        <div style={{fontSize:16,color:G.inkLight,fontStyle:"italic",marginTop:10}}>your daily glow, inside and out.</div>
        <div style={{display:"flex",gap:12,marginTop:48,width:"100%",flexDirection:"column"}}>
          <button onClick={()=>setScreen("signup")} style={{padding:"16px",borderRadius:16,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${G.peach},${G.gold})`,color:G.ink,fontWeight:700,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",boxShadow:"0 4px 20px rgba(201,169,110,0.3)"}}>Begin My Journey</button>
          <button onClick={()=>setScreen("login")} style={{padding:"16px",borderRadius:16,border:`1.5px solid ${G.cardBorder}`,cursor:"pointer",background:"rgba(255,252,248,0.8)",color:G.inkSoft,fontWeight:600,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase"}}>Sign In</button>
        </div>
      </div>
      <div style={{paddingBottom:40,fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.1em",textAlign:"center",lineHeight:1.8}}>Private. Judgment-free. Yours.</div>
    </div>
  );

  // ── Login screen ───────────────────────────────────────────────────────────
  if(screen==="login") return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Cormorant Garamond',serif",maxWidth:480,margin:"0 auto",padding:"0 24px",overflowY:"auto"}}>
      <GoldSpeckles corner="tr"/>
      <div style={{paddingTop:52,marginBottom:8}}>
        <button onClick={()=>setScreen("welcome")} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>← Back</button>
      </div>
      <div style={{marginBottom:32,marginTop:24}}>
        <GlorieLogo size={40}/>
        <div style={{fontSize:36,fontWeight:600,color:G.inkSoft,marginTop:12,lineHeight:1}}>Welcome back.</div>
        <div style={{fontSize:15,color:G.inkLight,fontStyle:"italic",marginTop:6}}>Sign in to continue your journey.</div>
      </div>
      <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={aS}/>
      <div style={{position:"relative",marginBottom:12}}>
        <input placeholder="Password" type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} style={{...aS,marginBottom:0,paddingRight:48}}/>
        <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:G.inkLight}}>{showPass?"🙈":"👁️"}</button>
      </div>
      {error&&<div style={{background:"rgba(200,80,60,0.08)",border:"1px solid rgba(200,80,60,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#A04030",fontFamily:"'Jost',sans-serif"}}>{error}</div>}
      <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",cursor:"pointer",background:loading?`rgba(201,169,110,0.4)`:`linear-gradient(135deg,${G.peach},${G.gold})`,color:G.ink,fontWeight:700,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>{loading?"Please wait…":"Sign In"}</button>
      <div style={{textAlign:"center",fontSize:13,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>Don't have an account? <span onClick={()=>setScreen("signup")} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Create one</span></div>
    </div>
  );

  // ── Signup screen ──────────────────────────────────────────────────────────
  if(screen==="signup") return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Cormorant Garamond',serif",maxWidth:480,margin:"0 auto",padding:"0 24px",overflowY:"auto"}}>
      <GoldSpeckles corner="tr"/>
      <div style={{paddingTop:52,marginBottom:8}}>
        <button onClick={()=>setScreen("welcome")} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>← Back</button>
      </div>
      <div style={{marginBottom:32,marginTop:24}}>
        <GlorieLogo size={40}/>
        <div style={{fontSize:36,fontWeight:600,color:G.inkSoft,marginTop:12,lineHeight:1}}>Welcome.</div>
        <div style={{fontSize:15,color:G.inkLight,fontStyle:"italic",marginTop:6}}>Let's create your account — then we'll personalize everything.</div>
      </div>
      <input placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)} style={aS}/>
      <input placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={aS}/>
      <div style={{position:"relative",marginBottom:12}}>
        <input placeholder="Password (6+ characters)" type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} style={{...aS,marginBottom:0,paddingRight:48}}/>
        <button onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:G.inkLight}}>{showPass?"🙈":"👁️"}</button>
      </div>
      {error&&<div style={{background:"rgba(200,80,60,0.08)",border:"1px solid rgba(200,80,60,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#A04030",fontFamily:"'Jost',sans-serif"}}>{error}</div>}
      <button onClick={handleSignup} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",cursor:"pointer",background:loading?`rgba(201,169,110,0.4)`:`linear-gradient(135deg,${G.peach},${G.gold})`,color:G.ink,fontWeight:700,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16,boxShadow:"0 4px 20px rgba(201,169,110,0.3)"}}>{loading?"Creating your account…":"Continue →"}</button>
      <div style={{textAlign:"center",fontSize:13,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>Already have an account? <span onClick={()=>setScreen("login")} style={{color:G.gold,cursor:"pointer",fontWeight:600}}>Sign in</span></div>
      <div style={{marginTop:24,fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",textAlign:"center",lineHeight:1.8,paddingBottom:40}}>Your data stays on your device.<br/>Private. Secure. Always yours.</div>
    </div>
  );

  // ── Profile questionnaire ──────────────────────────────────────────────────
  const STEPS=[
    {
      id:"basics",
      emoji:"🌸",
      title:`Nice to meet you, ${name}!`,
      subtitle:"Let's start with the basics.",
      content:(
        <div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:12,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>I am</div>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            {[{val:"female",emoji:"👩",label:"Female"},{val:"male",emoji:"👨",label:"Male"},{val:"other",emoji:"🧑",label:"Other"}].map(s=>(
              <button key={s.val} onClick={()=>setSex(s.val)} style={{flex:1,padding:"16px 8px",borderRadius:16,border:`2px solid ${sex===s.val?G.gold:G.cardBorder}`,background:sex===s.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.8)",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",transition:"all 0.2s"}}>
                <div style={{fontSize:28,marginBottom:4}}>{s.emoji}</div>
                <div style={{fontSize:13,fontWeight:600,color:sex===s.val?G.inkSoft:G.inkMid}}>{s.label}</div>
              </button>
            ))}
          </div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:8,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Age</div>
          <input placeholder="Your age" type="number" value={age} onChange={e=>setAge(e.target.value)} style={{...aS,marginBottom:0}}/>
        </div>
      ),
      canNext:sex&&age,
    },
    {
      id:"body",
      emoji:"⚖️",
      title:"Your body, your numbers.",
      subtitle:"This stays completely private and is used only to calculate your personalized goals.",
      content:(
        <div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:8,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Height</div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input placeholder="Feet" type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} style={{...aS,flex:1,marginBottom:0}}/>
            <input placeholder="Inches" type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} style={{...aS,flex:1,marginBottom:0}}/>
          </div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:8,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Current Weight</div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input placeholder="Weight" type="number" value={weight} onChange={e=>setWeight(e.target.value)} style={{...aS,flex:1,marginBottom:0}}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {["lbs","kg"].map(u=><button key={u} onClick={()=>setWeightUnit(u)} style={{padding:"8px 14px",borderRadius:10,border:`1.5px solid ${weightUnit===u?G.gold:G.cardBorder}`,background:weightUnit===u?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.8)",cursor:"pointer",fontSize:12,fontWeight:600,color:weightUnit===u?G.inkSoft:G.inkLight,fontFamily:"'Jost',sans-serif"}}>{u}</button>)}
            </div>
          </div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:8,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Goal Weight <span style={{fontSize:10,color:G.inkLight,textTransform:"none"}}>(optional)</span></div>
          <input placeholder={`Goal weight (${weightUnit})`} type="number" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} style={{...aS,marginBottom:0}}/>
        </div>
      ),
      canNext:weight&&heightFt,
    },
    {
      id:"goal",
      emoji:"🎯",
      title:"What's your main goal?",
      subtitle:"We'll adjust your calorie target, workout suggestions, and insights around this.",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {val:"lose",emoji:"🔥",title:"Lose Fat",desc:"Reduce body fat while preserving muscle"},
            {val:"maintain",emoji:"⚖️",title:"Maintain Weight",desc:"Stay at my current weight and improve health"},
            {val:"gain",emoji:"💪",title:"Build Muscle",desc:"Gain lean muscle and increase strength"},
            {val:"energy",emoji:"⚡",title:"More Energy",desc:"Feel better, sleep better, move more"},
            {val:"health",emoji:"🌿",title:"Overall Wellness",desc:"Focus on healthy habits and balance"},
          ].map(g=>(
            <button key={g.val} onClick={()=>setGoal(g.val)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,border:`2px solid ${goal===g.val?G.gold:G.cardBorder}`,background:goal===g.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.8)",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}>
              <span style={{fontSize:28}}>{g.emoji}</span>
              <div><div style={{fontWeight:600,fontSize:15,color:goal===g.val?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{g.title}</div><div style={{fontSize:12,color:G.inkLight,marginTop:2}}>{g.desc}</div></div>
              {goal===g.val&&<span style={{marginLeft:"auto",color:G.gold,fontSize:18}}>✓</span>}
            </button>
          ))}
        </div>
      ),
      canNext:goal,
    },
    {
      id:"activity",
      emoji:"🏃",
      title:"How active are you?",
      subtitle:"Be honest — this directly impacts your calorie calculations.",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {val:"sedentary",emoji:"🪑",title:"Sedentary",desc:"Desk job, little to no exercise"},
            {val:"light",emoji:"🚶",title:"Lightly Active",desc:"Light exercise 1–3 days/week"},
            {val:"moderate",emoji:"🏃",title:"Moderately Active",desc:"Exercise 3–5 days/week"},
            {val:"active",emoji:"🏋️",title:"Very Active",desc:"Hard exercise 6–7 days/week"},
            {val:"veryActive",emoji:"⚡",title:"Extra Active",desc:"Physical job + daily intense training"},
          ].map(a=>(
            <button key={a.val} onClick={()=>setActivity(a.val)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:16,border:`2px solid ${activity===a.val?G.gold:G.cardBorder}`,background:activity===a.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.8)",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}>
              <span style={{fontSize:24}}>{a.emoji}</span>
              <div><div style={{fontWeight:600,fontSize:14,color:activity===a.val?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{a.title}</div><div style={{fontSize:11,color:G.inkLight,marginTop:1}}>{a.desc}</div></div>
              {activity===a.val&&<span style={{marginLeft:"auto",color:G.gold,fontSize:18}}>✓</span>}
            </button>
          ))}
        </div>
      ),
      canNext:activity,
    },
    {
      id:"diet",
      emoji:"🥗",
      title:"Any dietary preferences?",
      subtitle:"We'll highlight relevant foods and meals in your database.",
      content:(
        <div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {["No restrictions","High Protein","Low Carb / Keto","Vegetarian","Vegan","Intermittent Fasting","Gluten Free","Dairy Free","Mediterranean","Paleo"].map(d=>(
              <button key={d} onClick={()=>setDietStyle(d)} style={{padding:"10px 16px",borderRadius:99,border:`1.5px solid ${dietStyle===d?G.gold:G.cardBorder}`,background:dietStyle===d?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(255,252,248,0.8)",cursor:"pointer",fontSize:12,fontWeight:600,color:dietStyle===d?G.ink:G.inkMid,fontFamily:"'Jost',sans-serif",transition:"all 0.2s"}}>{d}</button>
            ))}
          </div>
          <div style={{fontSize:13,color:G.inkMid,marginBottom:8,fontFamily:"'Jost',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>How often do you work out?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {["Never","1–2x/week","3–4x/week","5–6x/week","Every day"].map(f=>(
              <button key={f} onClick={()=>setWorkoutFreq(f)} style={{padding:"10px 16px",borderRadius:99,border:`1.5px solid ${workoutFreq===f?G.gold:G.cardBorder}`,background:workoutFreq===f?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(255,252,248,0.8)",cursor:"pointer",fontSize:12,fontWeight:600,color:workoutFreq===f?G.ink:G.inkMid,fontFamily:"'Jost',sans-serif",transition:"all 0.2s"}}>{f}</button>
            ))}
          </div>
        </div>
      ),
      canNext:true,
    },
    {
      id:"challenges",
      emoji:"💙",
      title:"What are your biggest challenges?",
      subtitle:"Select all that apply — your app will give you targeted support.",
      content:(
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {[
            "Staying consistent","Late night eating","Emotional eating",
            "Not drinking enough water","Skipping workouts","Low energy",
            "Stress eating","Poor sleep","Slow metabolism","Plateaus",
            "No time to meal prep","Social eating","Cravings",
          ].map(c=>(
            <button key={c} onClick={()=>toggleChallenge(c)} style={{padding:"10px 16px",borderRadius:99,border:`1.5px solid ${challenges.includes(c)?G.gold:G.cardBorder}`,background:challenges.includes(c)?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(255,252,248,0.8)",cursor:"pointer",fontSize:12,fontWeight:600,color:challenges.includes(c)?G.ink:G.inkMid,fontFamily:"'Jost',sans-serif",transition:"all 0.2s"}}>{c}</button>
          ))}
        </div>
      ),
      canNext:true,
    },
    {
      id:"motivation",
      emoji:"✨",
      title:"What motivates you most?",
      subtitle:"We'll personalize your daily messages and insights around this.",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {val:"confidence",emoji:"💫",label:"Feeling confident in my body"},
            {val:"health",emoji:"❤️",label:"Long-term health and longevity"},
            {val:"energy",emoji:"⚡",label:"Having more energy every day"},
            {val:"strength",emoji:"💪",label:"Getting stronger and fitter"},
            {val:"appearance",emoji:"🌸",label:"Looking and feeling my best"},
            {val:"habits",emoji:"🌿",label:"Building lasting healthy habits"},
          ].map(m=>(
            <button key={m.val} onClick={()=>setMotivation(m.val)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,border:`2px solid ${motivation===m.val?G.gold:G.cardBorder}`,background:motivation===m.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.8)",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}>
              <span style={{fontSize:24}}>{m.emoji}</span>
              <span style={{fontSize:14,fontWeight:600,color:motivation===m.val?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{m.label}</span>
              {motivation===m.val&&<span style={{marginLeft:"auto",color:G.gold,fontSize:18}}>✓</span>}
            </button>
          ))}
        </div>
      ),
      canNext:motivation,
    },
  ];

  const current=STEPS[step];
  const isLast=step===STEPS.length-1;

  return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Cormorant Garamond',serif",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <GoldSpeckles corner="tr"/>

      {/* Progress bar */}
      <div style={{padding:"44px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <button onClick={prevStep} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:G.inkLight,fontFamily:"'Jost',sans-serif"}}>← Back</button>
          <span style={{fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase"}}>{step+1} of {TOTAL_STEPS}</span>
          <button onClick={nextStep} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>Skip</button>
        </div>
        <div style={{background:"rgba(201,169,110,0.15)",borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{width:`${((step+1)/TOTAL_STEPS)*100}%`,height:"100%",background:`linear-gradient(90deg,${G.peach},${G.gold})`,borderRadius:99,transition:"width 0.4s ease"}}/>
        </div>
      </div>

      {/* Step content */}
      <div style={{flex:1,padding:"28px 24px",overflowY:"auto",opacity:anim?0:1,transition:"opacity 0.2s"}}>
        <div style={{fontSize:40,marginBottom:12}}>{current.emoji}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:G.inkSoft,lineHeight:1.2,marginBottom:8}}>{current.title}</div>
        <div style={{fontSize:14,color:G.inkLight,fontStyle:"italic",marginBottom:24,lineHeight:1.6}}>{current.subtitle}</div>
        {current.content}
      </div>

      {/* Next button */}
      <div style={{padding:"0 24px 48px"}}>
        {isLast?(
          <button onClick={finishQuestionnaire} style={{width:"100%",padding:"17px",borderRadius:16,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${G.peach},${G.gold})`,color:G.ink,fontWeight:700,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",boxShadow:"0 4px 20px rgba(201,169,110,0.3)"}}>
            ✨ Create My Profile
          </button>
        ):(
          <button onClick={nextStep} disabled={!current.canNext} style={{width:"100%",padding:"17px",borderRadius:16,border:"none",cursor:current.canNext?"pointer":"default",background:current.canNext?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(201,169,110,0.2)",color:current.canNext?G.ink:G.inkLight,fontWeight:700,fontSize:15,fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.2s"}}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );

}

// ─── MAIN APP SHELL ───────────────────────────────────────────────────────────
const ALL_TABS=[
  {id:"Summary",icon:"🌿",label:"Home"},
  {id:"CheckIn",icon:"☀️",label:"Check-In"},
  {id:"Meals",icon:"🥗",label:"Meals"},
  {id:"Workouts",icon:"🌸",label:"Move"},
  {id:"Water",icon:"💧",label:"Water"},
  {id:"Weight",icon:"⚖️",label:"Weight"},
  {id:"Measurements",icon:"📏",label:"Measure"},
  {id:"Habits",icon:"✅",label:"Habits"},
  {id:"Analytics",icon:"📊",label:"Insights"},
  {id:"Milestones",icon:"🏆",label:"Wins"},
  {id:"Meds",icon:"💊",label:"Wellness"},
  {id:"Cycle",icon:"🌙",label:"Cycle",femaleOnly:true},
  {id:"Profile",icon:"✨",label:"Profile"},
];

function MainApp({user,onLogout}) {
  const [activeTab,setActiveTab]=useState("Summary");
  const [dayState,setDayState]=useState(()=>LS.get(`wellness_day_${TODAY}`,{meals:[],workouts:[],water:[]}));
  const [medList,setMedList]=useState(()=>LS.get("wellness_medlist",[]));
  const [takenLog,setTakenLog]=useState(()=>LS.get("wellness_takenlog",{}));
  const [profile,setProfile]=useState(()=>LS.get("wellness_profile",{...DEF_PROFILE,name:user?.name||""}));
  const [recovery,setRecovery]=useState(()=>LS.get("wellness_recovery_"+TODAY,{}));
  const [cyclePhase,setCyclePhase]=useState(()=>LS.get("wellness_cycle",""));
  const [habits,setHabits]=useState(()=>LS.get("glorie_habits",{}));
  const [weightLog]=useState(()=>LS.get("glorie_weightlog",[]));
  const [measurements]=useState(()=>LS.get("glorie_measurements",[]));
  const [toasts,setToasts]=useState([]);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const firedRef=useRef(new Set(LS.get("wellness_fired",[])));

  useEffect(()=>{LS.set(`wellness_day_${TODAY}`,dayState);},[dayState]);
  useEffect(()=>{LS.set("wellness_medlist",medList);},[medList]);
  useEffect(()=>{LS.set("wellness_takenlog",takenLog);},[takenLog]);
  useEffect(()=>{LS.set("wellness_profile",profile);},[profile]);
  useEffect(()=>{LS.set("wellness_cycle",cyclePhase);},[cyclePhase]);
  useEffect(()=>{LS.set("glorie_habits",habits);},[habits]);
  // Redirect away from Cycle tab if profile changes to male
  useEffect(()=>{if(profile.sex!=="female"&&activeTab==="Cycle")setActiveTab("Summary");},[profile.sex]);

  const addToast=useCallback((t)=>{
    const id=Date.now()+Math.random();
    setToasts(p=>[...p,{...t,id}]);
    setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),4200);
  },[]);

  const checkReminders=useCallback(()=>{
    const now=new Date();
    const cur=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    medList.forEach(med=>{
      if(!med.reminderTime||takenLog[`${med.id}_${TODAY}`])return;
      const fk=`${med.id}_${TODAY}_${med.reminderTime}`;
      if(med.reminderTime===cur&&!firedRef.current.has(fk)){
        firedRef.current.add(fk);
        LS.set("wellness_fired",[...firedRef.current]);
        addToast({emoji:CAT_EMOJIS[med.category]||"🌿",title:`Time to take ${med.name}`,body:med.dose||"",type:"reminder"});
      }
    });
  },[medList,takenLog,addToast]);

  useEffect(()=>{checkReminders();const iv=setInterval(checkReminders,30000);return()=>clearInterval(iv);},[checkReminders]);

  const pendingMeds=medList.filter(m=>m.reminderTime&&!takenLog[`${m.id}_${TODAY}`]).length;
  const profileMissing=!profile.weight||!profile.age;
  const displayName=profile.name||user?.name||"";

  return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Jost','sans-serif'",color:G.ink,maxWidth:480,margin:"0 auto",paddingBottom:110}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        input::placeholder{color:${G.inkLight};}
        input:focus{border-color:${G.gold}!important;box-shadow:0 0 0 3px rgba(201,169,110,0.1);}
        @keyframes splashIn{from{opacity:0;transform:translateY(20px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-14px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        ::-webkit-scrollbar{width:0;}
        button{transition:all 0.15s;}
        button:active{opacity:0.8!important;}
      `}</style>

      <Toast toasts={toasts}/>

      {/* User menu overlay */}
      {showUserMenu&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(44,36,22,0.3)",backdropFilter:"blur(4px)",animation:"fadeIn 0.2s ease"}} onClick={()=>setShowUserMenu(false)}>
          <div style={{position:"absolute",top:80,right:16,background:G.warmWhite,border:`1px solid ${G.cardBorder}`,borderRadius:18,padding:"8px",minWidth:200,boxShadow:"0 8px 32px rgba(44,36,22,0.15)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"12px 16px 8px",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:G.inkSoft,fontWeight:600}}>{displayName}</div>
              <div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{user?.email}</div>
            </div>
            {[
              {label:"My Profile",icon:"✨",action:()=>{setActiveTab("Profile");setShowUserMenu(false);}},
              {label:"Cycle Settings",icon:"🌙",action:()=>{setActiveTab("Cycle");setShowUserMenu(false);}},
            ].map(item=>(
              <button key={item.label} onClick={item.action} style={{width:"100%",padding:"12px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'Jost',sans-serif",fontSize:13,color:G.inkSoft,display:"flex",gap:10,alignItems:"center",borderRadius:10}}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
            <div style={{borderTop:`1px solid rgba(201,169,110,0.1)`,marginTop:4,paddingTop:4}}>
              <button onClick={()=>{onLogout();setShowUserMenu(false);}} style={{width:"100%",padding:"12px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'Jost',sans-serif",fontSize:13,color:"#A04030",display:"flex",gap:10,alignItems:"center",borderRadius:10}}>
                <span>👋</span>Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{padding:"28px 20px 14px",background:G.headerBg,position:"sticky",top:0,zIndex:10,borderBottom:`1px solid rgba(201,169,110,0.15)`,backdropFilter:"blur(12px)",overflow:"hidden"}}>
        <GoldSpeckles corner="tr"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
          <div>
            {displayName&&<div style={{fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{displayName}</div>}
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,letterSpacing:"-0.5px",lineHeight:1,color:G.inkSoft}}>Glorié</div>
            <div style={{fontSize:10,color:G.inkLight,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",marginTop:2}}>your daily glow, inside and out.</div>
          </div>
          {/* Avatar / user button */}
          <button onClick={()=>setShowUserMenu(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:44,height:44,borderRadius:99,background:`linear-gradient(135deg,${G.peach},${G.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:G.ink,fontFamily:"'Cormorant Garamond',serif",boxShadow:`0 2px 12px rgba(201,169,110,0.3)`}}>
              {displayName?displayName[0].toUpperCase():"✨"}
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid rgba(201,169,110,0.15)`,background:"rgba(250,246,240,0.95)",position:"sticky",top:88,zIndex:9,overflowX:"auto",scrollbarWidth:"none",backdropFilter:"blur(8px)"}}>
        {ALL_TABS.filter(tab=>!tab.femaleOnly||profile.sex==="female").map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{flex:"0 0 auto",padding:"11px 12px",background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:600,letterSpacing:0.8,whiteSpace:"nowrap",fontFamily:"'Jost',sans-serif",textTransform:"uppercase",color:activeTab===tab.id?G.inkSoft:G.inkLight,borderBottom:activeTab===tab.id?`2px solid ${G.gold}`:"2px solid transparent",position:"relative",transition:"all 0.2s"}}>
            {tab.icon} {tab.label}
            {tab.id==="Meds"&&pendingMeds>0&&<span style={{position:"absolute",top:6,right:3,background:`linear-gradient(135deg,${G.peach},${G.gold})`,borderRadius:99,minWidth:14,height:14,fontSize:8,fontWeight:700,color:G.ink,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{pendingMeds}</span>}
            {tab.id==="Profile"&&profileMissing&&<span style={{position:"absolute",top:6,right:3,background:G.peach,borderRadius:99,width:6,height:6}}/>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:"20px 16px"}}>
        {activeTab==="Summary"      &&<SummaryTab      dayState={dayState} medList={medList} takenLog={takenLog} profile={profile} recovery={recovery} cyclePhase={cyclePhase} habits={habits} setHabits={setHabits}/>}
        {activeTab==="CheckIn"      &&<CheckInTab      recovery={recovery} setRecovery={setRecovery} dayState={dayState} profile={profile} cyclePhase={cyclePhase} addToast={addToast}/>}
        {activeTab==="Meals"        &&<MealsTab        dayState={dayState} setDayState={setDayState} profile={profile} cyclePhase={cyclePhase}/>}
        {activeTab==="Workouts"     &&<WorkoutsTab     dayState={dayState} setDayState={setDayState} profile={profile}/>}
        {activeTab==="Water"        &&<WaterTab        dayState={dayState} setDayState={setDayState}/>}
        {activeTab==="Weight"       &&<WeightTab       profile={profile} setProfile={setProfile} addToast={addToast}/>}
        {activeTab==="Measurements" &&<MeasurementsTab addToast={addToast}/>}
        {activeTab==="Habits"       &&<HabitsTab       habits={habits} setHabits={setHabits} addToast={addToast}/>}
        {activeTab==="Analytics"    &&<AnalyticsTab    profile={profile} cyclePhase={cyclePhase}/>}
        {activeTab==="Milestones"   &&<MilestonesTab   dayState={dayState} profile={profile} cyclePhase={cyclePhase} habits={habits} weightLog={weightLog} measurements={measurements}/>}
        {activeTab==="Meds"         &&<MedsTab         medList={medList} setMedList={setMedList} takenLog={takenLog} setTakenLog={setTakenLog} addToast={addToast} dayState={dayState}/>}
        {activeTab==="Cycle"        &&<CycleTab        cyclePhase={cyclePhase} setCyclePhase={setCyclePhase} profile={profile} addToast={addToast}/>}
        {activeTab==="Profile"      &&<ProfileTab      profile={profile} setProfile={setProfile} addToast={addToast}/>}
        {activeTab==="Profile"  &&<ProfileTab  profile={profile} setProfile={setProfile} addToast={addToast}/>}
      </div>
    </div>
  );
}

// ─── ROOT APP CONTROLLER ──────────────────────────────────────────────────────
export default function App() {
  // "splash" | "onboarding" | "auth" | "app"
  const [screen,setScreen]=useState(()=>{
    const session=LS.get("glorie_session",null);
    const seenOnboarding=LS.get("glorie_onboarded",false);
    if(session?.loggedIn) return "splash_to_app";
    if(seenOnboarding) return "splash_to_auth";
    return "splash_to_onboarding";
  });
  const [user,setUser]=useState(()=>LS.get("glorie_session",null));
  const [showSplash,setShowSplash]=useState(true);

  const afterSplash=()=>{
    setShowSplash(false);
    if(screen==="splash_to_app") setScreen("app");
    else if(screen==="splash_to_auth") setScreen("auth");
    else setScreen("onboarding");
  };

  const handleOnboardingDone=()=>{
    LS.set("glorie_onboarded",true);
    setScreen("auth");
  };

  const handleAuth=(userData)=>{
    setUser(userData);
    setScreen("app");
  };

  const handleLogout=()=>{
    LS.set("glorie_session",null);
    setUser(null);
    setScreen("auth");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${G.peachSoft};}
        @keyframes splashIn{from{opacity:0;transform:translateY(20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>
      {showSplash&&<SplashScreen onDone={afterSplash}/>}
      {!showSplash&&screen==="onboarding"&&<OnboardingScreen onDone={handleOnboardingDone}/>}
      {!showSplash&&screen==="auth"&&<AuthScreen onAuth={handleAuth}/>}
      {!showSplash&&screen==="app"&&<MainApp user={user} onLogout={handleLogout}/>}
    </>
  );
}