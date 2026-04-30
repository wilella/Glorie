import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const TODAY = new Date().toISOString().slice(0, 10);

// ─── MEAL DATABASE ────────────────────────────────────────────────────────────
const MEAL_DB = [
  { name: "Healthy Choice Power Bowls Chicken Marinara", cal: 360, protein: 28, carbs: 43, fat: 8, serving: "1 bowl (283g)" },
  { name: "Healthy Choice Simply Steamers Unwrapped Burrito Bowl", cal: 310, protein: 12, carbs: 53, fat: 5, serving: "1 bowl" },
  { name: "Healthy Choice Café Steamers Grilled Basil Chicken", cal: 280, protein: 22, carbs: 36, fat: 5, serving: "1 meal" },
  { name: "Healthy Choice Power Bowls Adobo Chicken", cal: 370, protein: 30, carbs: 45, fat: 8, serving: "1 bowl" },
  { name: "Healthy Choice Chicken Tikka Masala", cal: 290, protein: 22, carbs: 36, fat: 6, serving: "1 bowl" },
  { name: "Lean Cuisine Chicken Teriyaki", cal: 290, protein: 16, carbs: 45, fat: 4, serving: "1 meal" },
  { name: "Lean Cuisine Chicken Marsala", cal: 250, protein: 17, carbs: 31, fat: 6, serving: "1 meal" },
  { name: "Lean Cuisine Butternut Squash Ravioli", cal: 260, protein: 9, carbs: 43, fat: 6, serving: "1 meal" },
  { name: "Grilled Chicken Breast (2 oz)", cal: 93, protein: 17, carbs: 0, fat: 2, serving: "2 oz (57g)" },
  { name: "Grilled Chicken Breast (3 oz)", cal: 140, protein: 26, carbs: 0, fat: 3, serving: "3 oz (85g)" },
  { name: "Grilled Chicken Breast (4 oz)", cal: 185, protein: 35, carbs: 0, fat: 4, serving: "4 oz (113g)" },
  { name: "Grilled Chicken Breast (6 oz)", cal: 280, protein: 52, carbs: 0, fat: 6, serving: "6 oz (170g)" },
  { name: "Rotisserie Chicken (3 oz, no skin)", cal: 130, protein: 23, carbs: 0, fat: 4, serving: "3 oz" },
  { name: "Ground Turkey (3 oz, 93% lean)", cal: 130, protein: 22, carbs: 0, fat: 5, serving: "3 oz" },
  { name: "Ground Turkey (4 oz, 93% lean)", cal: 170, protein: 29, carbs: 0, fat: 6, serving: "4 oz" },
  { name: "Ground Beef (3 oz, 90% lean)", cal: 150, protein: 23, carbs: 0, fat: 7, serving: "3 oz" },
  { name: "Salmon Fillet (3 oz)", cal: 177, protein: 17, carbs: 0, fat: 11, serving: "3 oz" },
  { name: "Salmon Fillet (4 oz)", cal: 234, protein: 23, carbs: 0, fat: 14, serving: "4 oz" },
  { name: "Tilapia (3 oz)", cal: 110, protein: 22, carbs: 0, fat: 2, serving: "3 oz" },
  { name: "Tuna in Water (3 oz can)", cal: 80, protein: 18, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Shrimp (3 oz, steamed)", cal: 84, protein: 18, carbs: 0, fat: 1, serving: "3 oz" },
  { name: "Eggs (2 large)", cal: 143, protein: 13, carbs: 1, fat: 10, serving: "2 eggs" },
  { name: "Egg Whites (3 large)", cal: 51, protein: 11, carbs: 1, fat: 0, serving: "3 whites" },
  { name: "Greek Yogurt Plain Nonfat (6 oz)", cal: 100, protein: 17, carbs: 6, fat: 0, serving: "6 oz" },
  { name: "Cottage Cheese 2% (1/2 cup)", cal: 90, protein: 12, carbs: 5, fat: 2, serving: "1/2 cup" },
  { name: "White Rice, Cooked (1 cup)", cal: 206, protein: 4, carbs: 45, fat: 0, serving: "1 cup" },
  { name: "White Rice, Cooked (1/2 cup)", cal: 103, protein: 2, carbs: 22, fat: 0, serving: "1/2 cup" },
  { name: "Brown Rice, Cooked (1 cup)", cal: 216, protein: 5, carbs: 45, fat: 2, serving: "1 cup" },
  { name: "Quinoa, Cooked (1 cup)", cal: 222, protein: 8, carbs: 39, fat: 4, serving: "1 cup" },
  { name: "Oatmeal, Cooked (1 cup)", cal: 154, protein: 6, carbs: 28, fat: 3, serving: "1 cup" },
  { name: "Sweet Potato, Baked (medium)", cal: 103, protein: 2, carbs: 24, fat: 0, serving: "1 medium" },
  { name: "Sweet Potato, Baked (large)", cal: 162, protein: 4, carbs: 37, fat: 0, serving: "1 large" },
  { name: "Pasta, Cooked (1 cup)", cal: 220, protein: 8, carbs: 43, fat: 1, serving: "1 cup" },
  { name: "Bread, Whole Wheat (1 slice)", cal: 80, protein: 4, carbs: 15, fat: 1, serving: "1 slice" },
  { name: "Chicken & White Rice (4 oz chicken, 1 cup rice)", cal: 391, protein: 39, carbs: 45, fat: 4, serving: "meal" },
  { name: "Chicken & Brown Rice (4 oz chicken, 1 cup rice)", cal: 401, protein: 40, carbs: 45, fat: 6, serving: "meal" },
  { name: "Chicken & Rice (2 oz chicken, 1 cup rice)", cal: 299, protein: 21, carbs: 45, fat: 2, serving: "meal" },
  { name: "Salmon & Quinoa (4 oz salmon, 1 cup quinoa)", cal: 456, protein: 31, carbs: 39, fat: 18, serving: "meal" },
  { name: "Ground Turkey & Sweet Potato Bowl", cal: 350, protein: 32, carbs: 30, fat: 8, serving: "meal" },
  { name: "Shrimp Stir Fry with Brown Rice", cal: 380, protein: 24, carbs: 52, fat: 7, serving: "meal" },
  { name: "Broccoli (1 cup, steamed)", cal: 55, protein: 4, carbs: 11, fat: 1, serving: "1 cup" },
  { name: "Spinach (2 cups, raw)", cal: 14, protein: 2, carbs: 2, fat: 0, serving: "2 cups" },
  { name: "Mixed Salad Greens (2 cups)", cal: 20, protein: 2, carbs: 3, fat: 0, serving: "2 cups" },
  { name: "Banana (medium)", cal: 105, protein: 1, carbs: 27, fat: 0, serving: "1 medium" },
  { name: "Apple (medium)", cal: 95, protein: 0, carbs: 25, fat: 0, serving: "1 medium" },
  { name: "Strawberries (1 cup)", cal: 49, protein: 1, carbs: 12, fat: 0, serving: "1 cup" },
  { name: "Blueberries (1 cup)", cal: 84, protein: 1, carbs: 21, fat: 0, serving: "1 cup" },
  { name: "Almonds (1 oz / 23 nuts)", cal: 164, protein: 6, carbs: 6, fat: 14, serving: "1 oz" },
  { name: "Peanut Butter (2 tbsp)", cal: 190, protein: 8, carbs: 7, fat: 16, serving: "2 tbsp" },
  { name: "Protein Shake (Whey, 1 scoop)", cal: 120, protein: 24, carbs: 3, fat: 2, serving: "1 scoop" },
  { name: "Protein Bar (Quest Bar)", cal: 190, protein: 21, carbs: 21, fat: 8, serving: "1 bar" },
  { name: "Avocado (1/2)", cal: 120, protein: 2, carbs: 6, fat: 11, serving: "1/2 medium" },
  { name: "Chick-fil-A Grilled Chicken Sandwich", cal: 320, protein: 30, carbs: 40, fat: 7, serving: "1 sandwich" },
  { name: "Chick-fil-A Grilled Nuggets (8 ct)", cal: 140, protein: 25, carbs: 2, fat: 4, serving: "8 count" },
  { name: "Subway Turkey 6-inch (9-grain wheat)", cal: 280, protein: 18, carbs: 46, fat: 4, serving: "6-inch sub" },
  { name: "Chipotle Chicken Bowl (basic, no guac)", cal: 550, protein: 42, carbs: 62, fat: 14, serving: "1 bowl" },
  { name: "Chipotle Chicken Bowl (with guac)", cal: 760, protein: 43, carbs: 79, fat: 30, serving: "1 bowl" },
  { name: "Scrambled Eggs (2 eggs)", cal: 182, protein: 13, carbs: 2, fat: 14, serving: "2 eggs" },
  { name: "Greek Yogurt Parfait (yogurt, berries, granola)", cal: 280, protein: 16, carbs: 42, fat: 6, serving: "1 cup" },
  { name: "Smoothie (banana, berries, protein, almond milk)", cal: 320, protein: 26, carbs: 45, fat: 4, serving: "~16 oz" },
  { name: "Avocado Toast (2 slices wheat, 1/2 avocado)", cal: 350, protein: 10, carbs: 40, fat: 18, serving: "2 slices" },
  { name: "Overnight Oats (oats, almond milk, berries)", cal: 310, protein: 11, carbs: 52, fat: 7, serving: "1 jar" },
  { name: "Grilled Chicken Caesar Salad", cal: 350, protein: 32, carbs: 12, fat: 19, serving: "1 salad" },
  { name: "Black Beans (1/2 cup)", cal: 109, protein: 7, carbs: 20, fat: 0, serving: "1/2 cup" },
  { name: "Edamame (1/2 cup, shelled)", cal: 94, protein: 8, carbs: 8, fat: 4, serving: "1/2 cup" },
  { name: "Almond Milk, Unsweetened (1 cup)", cal: 30, protein: 1, carbs: 1, fat: 3, serving: "1 cup" },
  { name: "Latte (16 oz, 2% milk)", cal: 190, protein: 12, carbs: 18, fat: 7, serving: "16 oz" },
  { name: "Olive Oil (1 tbsp)", cal: 119, protein: 0, carbs: 0, fat: 14, serving: "1 tbsp" },
  { name: "Cheese, Cheddar (1 oz)", cal: 115, protein: 7, carbs: 0, fat: 9, serving: "1 oz" },
  { name: "String Cheese (1 stick)", cal: 80, protein: 7, carbs: 0, fat: 5, serving: "1 stick" },
  { name: "Rice Cake (plain)", cal: 35, protein: 1, carbs: 7, fat: 0, serving: "1 cake" },
  { name: "Popcorn (3 cups, air-popped)", cal: 93, protein: 3, carbs: 19, fat: 1, serving: "3 cups" },
  { name: "Dark Chocolate (1 oz, 70%+)", cal: 170, protein: 2, carbs: 13, fat: 12, serving: "1 oz" },
  { name: "Chicken Noodle Soup (1 cup)", cal: 90, protein: 6, carbs: 13, fat: 2, serving: "1 cup" },
  { name: "Lentil Soup (1 cup)", cal: 180, protein: 12, carbs: 30, fat: 2, serving: "1 cup" },
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
  peach:    "#E8B89A",
  peachLight:"#F2D0B8",
  peachSoft: "#FBF0E8",
  sage:     "#A8B89A",
  sageSoft: "#C8D4BE",
  sageLight:"#E8EFE4",
  gold:     "#C9A96E",
  goldLight:"#E8D4A8",
  cream:    "#FAF6F0",
  warmWhite:"#FDF9F4",
  ink:      "#2C2416",
  inkSoft:  "#4A3F30",
  inkMid:   "#7A6B58",
  inkLight: "#A8998A",
  // gradients
  bg: "linear-gradient(135deg, #F5E6D8 0%, #FAF0E8 35%, #F8F4EE 65%, #EDF2E8 100%)",
  headerBg: "linear-gradient(180deg, rgba(245,230,216,0.98) 0%, rgba(250,246,240,0.95) 100%)",
  cardBg: "rgba(255,252,248,0.85)",
  cardBorder: "rgba(201,169,110,0.18)",
};

// ─── LEAF LOGO SVG ────────────────────────────────────────────────────────────
function GlorieLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer leaf */}
      <path d="M20 4 C20 4, 32 12, 32 26 C32 36, 26 44, 20 44 C14 44, 8 36, 8 26 C8 12, 20 4, 20 4Z"
        stroke={G.gold} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Inner leaf / center vein */}
      <path d="M20 44 C20 44, 20 24, 20 8"
        stroke={G.gold} strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Left vein */}
      <path d="M20 28 C20 28, 13 23, 10 18"
        stroke={G.gold} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Right vein */}
      <path d="M20 28 C20 28, 27 23, 30 18"
        stroke={G.gold} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Gold dot accent */}
      <circle cx="20" cy="6" r="1.5" fill={G.gold} opacity="0.6"/>
    </svg>
  );
}

// ─── GOLD SPECKLE DECORATION ──────────────────────────────────────────────────
function GoldSpeckles({ corner = "tr" }) {
  const dots = [
    [88,8,1.2],[94,14,0.8],[82,16,0.6],[91,22,1],[97,10,0.5],
    [85,4,0.7],[79,20,0.4],[96,18,0.6],[90,6,0.5],[93,26,0.8],
  ];
  const flip = corner === "tl" ? "scale(-1,1)" : corner === "bl" ? "scale(-1,-1)" : corner === "br" ? "scale(1,-1)" : "";
  return (
    <svg width={100} height={40} style={{ position:"absolute", top: corner.includes("b") ? "auto" : 0, bottom: corner.includes("b") ? 0 : "auto", right: corner.includes("r") ? 0 : "auto", left: corner.includes("l") ? 0 : "auto", opacity:0.5, pointerEvents:"none" }} viewBox="0 0 100 40">
      <g transform={flip} style={{transformOrigin:"50px 20px"}}>
        {dots.map(([x,y,r],i) => <circle key={i} cx={x} cy={y} r={r} fill={G.gold} opacity={0.4+Math.random()*0.4}/>)}
      </g>
    </svg>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const iS = {
  width:"100%",
  background:"rgba(255,252,248,0.9)",
  border:`1px solid ${G.cardBorder}`,
  borderRadius:14,
  padding:"12px 16px",
  color:G.ink,
  fontSize:14,
  outline:"none",
  marginBottom:8,
  boxSizing:"border-box",
  fontFamily:"'Cormorant Garamond','Georgia',serif",
  letterSpacing:"0.02em",
};

const bS = (bg, fg=G.ink) => ({
  width:"100%",
  background:bg,
  border:"none",
  borderRadius:14,
  padding:"13px",
  color:fg,
  fontWeight:600,
  fontSize:14,
  cursor:"pointer",
  fontFamily:"'Jost','sans-serif'",
  letterSpacing:"0.08em",
  textTransform:"uppercase",
});

function StatPill({label,value,unit,color}) {
  return (
    <div style={{background:color||G.peachSoft, borderRadius:20, padding:"11px 16px", display:"flex", flexDirection:"column", alignItems:"center", minWidth:78, border:`1px solid ${G.cardBorder}`}}>
      <span style={{fontSize:18,fontWeight:700,color:G.inkSoft,letterSpacing:"-0.5px",fontFamily:"'Cormorant Garamond',serif"}}>{value}</span>
      <span style={{fontSize:9,fontWeight:600,color:G.inkMid,textTransform:"uppercase",letterSpacing:1.5,marginTop:1}}>{unit}</span>
      <span style={{fontSize:9,color:G.inkLight,marginTop:1}}>{label}</span>
    </div>
  );
}

function ProgressBar({value,max,color,height=5}) {
  const pct = Math.min((value/Math.max(max,1))*100,100);
  return (
    <div style={{background:`rgba(201,169,110,0.15)`,borderRadius:99,height,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:color||`linear-gradient(90deg,${G.peach},${G.gold})`,borderRadius:99,transition:"width 0.7s cubic-bezier(0.34,1.56,0.64,1)"}}/>
    </div>
  );
}

function Card({children,style,accent}) {
  return (
    <div style={{
      background:G.cardBg,
      border:`1px solid ${accent||G.cardBorder}`,
      borderRadius:20,
      padding:18,
      marginBottom:14,
      backdropFilter:"blur(8px)",
      boxShadow:"0 2px 20px rgba(201,169,110,0.08)",
      ...style
    }}>
      {children}
    </div>
  );
}

function SLabel({text}) {
  return (
    <div style={{fontSize:10,fontWeight:600,color:G.inkLight,textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontFamily:"'Jost',sans-serif"}}>
      {text}
    </div>
  );
}

function Empty({emoji,text}) {
  return (
    <div style={{textAlign:"center",padding:"36px 0",color:G.inkLight}}>
      <div style={{fontSize:32,marginBottom:8}}>{emoji}</div>
      <div style={{fontSize:13,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{text}</div>
    </div>
  );
}

function Chip({label,active,color,onClick,small}) {
  return (
    <button onClick={onClick} style={{
      padding:small?"5px 10px":"7px 13px",
      borderRadius:99,
      border:`1px solid ${active?G.gold:G.cardBorder}`,
      cursor:"pointer",
      fontSize:small?10:11,
      fontWeight:600,
      background:active?`linear-gradient(135deg,${G.peach},${G.gold})`:"rgba(255,252,248,0.8)",
      color:active?G.ink:G.inkMid,
      transition:"all 0.2s",
      whiteSpace:"nowrap",
      fontFamily:"'Jost',sans-serif",
      letterSpacing:"0.05em",
    }}>{label}</button>
  );
}

function DelBtn({onClick}) {
  return (
    <button onClick={onClick} style={{background:"rgba(220,100,80,0.1)",border:"1px solid rgba(220,100,80,0.2)",borderRadius:8,color:"#C05040",cursor:"pointer",padding:"4px 9px",fontSize:11,fontWeight:600,flexShrink:0}}>✕</button>
  );
}

function Toast({toasts}) {
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,display:"flex",flexDirection:"column",gap:8,width:"92%",maxWidth:440,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:t.type==="reminder"?`linear-gradient(135deg,${G.peachLight},${G.goldLight})`:t.type==="warning"?`linear-gradient(135deg,#F5D0A0,${G.goldLight})`:`linear-gradient(135deg,${G.sageLight},${G.sageSoft})`,
          color:G.ink,borderRadius:16,padding:"13px 16px",fontWeight:600,fontSize:13,
          boxShadow:"0 4px 24px rgba(201,169,110,0.3)",animation:"toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          display:"flex",alignItems:"center",gap:10,
          border:`1px solid ${G.cardBorder}`,
        }}>
          <span style={{fontSize:20}}>{t.emoji||"🌿"}</span>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14}}>{t.title}</div>
            {t.body&&<div style={{fontWeight:400,fontSize:12,opacity:0.72,marginTop:2}}>{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AutocompleteInput({placeholder,value,onChange,onSelect,database,style}) {
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = useMemo(()=>{
    if(!value||value.length<2) return [];
    const q=value.toLowerCase();
    return database.filter(i=>i.name.toLowerCase().includes(q)).slice(0,8);
  },[value,database]);
  useEffect(()=>{
    const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div ref={ref} style={{position:"relative",marginBottom:8}}>
      <input placeholder={placeholder} value={value}
        onChange={e=>{onChange(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
        style={{...iS,marginBottom:0,...(style||{})}}/>
      {open&&filtered.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:G.warmWhite,border:`1px solid ${G.cardBorder}`,borderRadius:14,zIndex:100,maxHeight:240,overflowY:"auto",boxShadow:"0 8px 32px rgba(201,169,110,0.2)",marginTop:4}}>
          {filtered.map((item,i)=>(
            <div key={i} onMouseDown={()=>{onSelect(item);setOpen(false);}}
              style={{padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid rgba(201,169,110,0.1)`,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=G.peachSoft}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div>
                <div style={{color:G.ink,fontSize:13,fontFamily:"'Cormorant Garamond',serif"}}>{item.name}</div>
                {item.serving&&<div style={{color:G.inkLight,fontSize:11,marginTop:1}}>{item.serving}</div>}
              </div>
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

// ─── SMART INSIGHTS ───────────────────────────────────────────────────────────
function generateInsights({dayState,medList,takenLog,profile,recovery,cyclePhase}) {
  const insights=[];
  const hour=new Date().getHours();
  const totalCal=dayState.meals.reduce((s,m)=>s+Number(m.calories||0),0);
  const totalProt=dayState.meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const totalBurned=dayState.workouts.reduce((s,w)=>s+Number(w.burned||0),0);
  const waterCups=dayState.water.reduce((s,w)=>s+Number(w.cups||0),0);
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;
  const workoutCats=[...new Set(dayState.workouts.map(w=>w.category))];
  const consecutive=profile.streak||0;

  if(hour>=14&&totalCal<goalCal*0.4)
    insights.push({type:"warning",emoji:"🌿",title:"Nourish your body",body:`Only ${totalCal} kcal logged by midday — you're ${goalCal-totalCal} kcal below your goal. A protein-rich snack would serve you well.`,priority:9});
  const protGoal=profile.weight?(profile.weightUnit==="lbs"?Number(profile.weight)*0.7:Number(profile.weight)*1.5):120;
  if(hour>=16&&totalProt<protGoal*0.5)
    insights.push({type:"tip",emoji:"✨",title:"Protein is low today",body:`${totalProt}g logged so far. Try chicken, Greek yogurt, or a protein shake to reach your goal.`,priority:8});
  if(hour>=12&&waterCups<3)
    insights.push({type:"warning",emoji:"💧",title:"Hydration check",body:`Only ${waterCups} cups so far. Your glow starts from within — aim for 4 cups before 2pm.`,priority:7});
  if(consecutive>=5&&recovery?.soreness>=4)
    insights.push({type:"warning",emoji:"🛌",title:"Your body is asking for rest",body:`${consecutive} days in a row with soreness at ${recovery.soreness}/5. Rest is where growth lives.`,priority:10});
  if(workoutCats.length>0){
    const cat=workoutCats[0];
    const suggested=(SUPP_PAIRINGS[cat]||[]);
    const mySupps=medList.map(m=>m.name.toLowerCase());
    const matches=suggested.filter(s=>mySupps.some(ms=>ms.includes(s)));
    if(matches.length>0){
      const suppEntry=medList.find(m=>m.name.toLowerCase().includes(matches[0]));
      if(suppEntry&&!takenLog[`${suppEntry.id}_${TODAY}`])
        insights.push({type:"tip",emoji:"💊",title:`Post-${cat} reminder`,body:`Now is a great time to take your ${suppEntry.name}.`,priority:8});
    }
  }
  if(profile.sex==="female"&&cyclePhase){
    const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);
    if(phase) insights.push({type:"cycle",emoji:phase.emoji,title:`${phase.label} phase`,body:phase.notes,priority:6});
  }
  if(consecutive===0&&totalCal===0&&hour>=10)
    insights.push({type:"encourage",emoji:"🌸",title:"Begin again, beautifully",body:"Every day is a fresh start. Log one meal to build your momentum.",priority:5});
  if(totalCal>=goalCal*0.8&&totalCal<=goalCal*1.05&&hour>=18)
    insights.push({type:"success",emoji:"🌟",title:"You showed up for yourself today",body:`${totalCal} kcal — right in your goal range. Beautiful consistency.`,priority:7});
  return insights.sort((a,b)=>b.priority-a.priority).slice(0,4);
}

// ─── SUMMARY TAB ─────────────────────────────────────────────────────────────
function SummaryTab({dayState,medList,takenLog,profile,recovery,cyclePhase}) {
  const goalCal=profile.weight&&profile.age?calcGoalCalories(profile,cyclePhase):2000;
  const totalCals=dayState.meals.reduce((s,m)=>s+Number(m.calories||0),0);
  const totalProt=dayState.meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const totalMins=dayState.workouts.reduce((s,w)=>s+Number(w.duration||0),0);
  const totalBurned=dayState.workouts.reduce((s,w)=>s+Number(w.burned||0),0);
  const waterCups=dayState.water.reduce((s,w)=>s+Number(w.cups||0),0);
  const waterOz=dayState.water.reduce((s,w)=>s+Number(w.oz||0),0);
  const medsTaken=medList.filter(m=>takenLog[`${m.id}_${TODAY}`]).length;
  const netCals=totalCals-totalBurned;
  const insights=generateInsights({dayState,medList,takenLog,profile,recovery,cyclePhase});
  const phase=CYCLE_PHASES.find(c=>c.id===cyclePhase);

  const rings=[
    {label:"Calories",val:totalCals,max:goalCal,color:G.peach,unit:"kcal",icon:"🥗"},
    {label:"Water",val:waterCups,max:8,color:G.sage,unit:"cups",icon:"💧"},
    {label:"Movement",val:totalMins,max:60,color:G.gold,unit:"min",icon:"🌿"},
  ];

  return (
    <div>
      {profile.name&&<div style={{fontSize:14,color:G.inkMid,marginBottom:4,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Good day, {profile.name} ✨</div>}
      <div style={{fontSize:11,color:G.inkLight,marginBottom:18,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>
        {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
      </div>

      {/* Rings */}
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {rings.map(r=>{
          const pct=Math.min(r.val/Math.max(r.max,1)*100,100);
          const R=30,cx=38,cy=38,circ=2*Math.PI*R;
          return (
            <div key={r.label} style={{flex:1,background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:20,padding:"14px 6px",textAlign:"center",boxShadow:"0 2px 12px rgba(201,169,110,0.08)"}}>
              <svg width={76} height={76} style={{margin:"0 auto",display:"block"}}>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth={5}/>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke={r.color} strokeWidth={5}
                  strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
                  strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
                  style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
                <text x={cx} y={cx-2} textAnchor="middle" fill={G.inkSoft} fontSize={12} fontWeight={700} fontFamily="Cormorant Garamond,serif">{r.val}</text>
                <text x={cx} y={cx+10} textAnchor="middle" fill={G.inkLight} fontSize={8} fontFamily="Jost,sans-serif">{r.unit}</text>
              </svg>
              <div style={{fontSize:10,color:G.inkMid,fontWeight:600,marginTop:2,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{r.icon} {r.label}</div>
            </div>
          );
        })}
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[
          {label:"Net Calories",val:netCals,sub:"consumed − burned",color:netCals<=goalCal?G.sage:G.peach},
          {label:"Daily Goal",val:goalCal,sub:profile.goal==="lose"?"fat loss":profile.goal==="gain"?"muscle gain":"maintenance",color:G.gold},
          {label:"Protein",val:`${totalProt}g`,sub:"consumed today",color:G.peach},
          {label:"Wellness",val:`${medsTaken}/${medList.length}`,sub:"meds taken",color:G.sageSoft},
        ].map(s=>(
          <div key={s.label} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:18,padding:"14px",boxShadow:"0 2px 12px rgba(201,169,110,0.06)"}}>
            <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div>
            <div style={{fontSize:11,fontWeight:600,color:G.inkSoft,marginTop:2,fontFamily:"'Jost',sans-serif"}}>{s.label}</div>
            <div style={{fontSize:11,color:G.inkLight}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Cycle phase */}
      {profile.sex==="female"&&phase&&(
        <div style={{background:`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`,border:`1px solid ${G.cardBorder}`,borderRadius:18,padding:"14px 16px",marginBottom:14,display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:26}}>{phase.emoji}</span>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{phase.label} Phase · {phase.days}</div>
            <div style={{fontSize:12,color:G.inkMid,marginTop:3,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>{phase.notes}</div>
            <div style={{fontSize:11,color:G.inkLight,marginTop:4}}>Intensity: {phase.intensity} · Cal adj: {phase.calAdj>0?"+":""}{phase.calAdj} · Carbs: {phase.carbAdj}</div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length>0&&(
        <div style={{marginBottom:14}}>
          <SLabel text="Your Daily Glow Guide"/>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"13px 14px",marginBottom:8,animation:"slideIn 0.3s ease",boxShadow:"0 2px 12px rgba(201,169,110,0.06)"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{ins.emoji}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif",fontSize:15}}>{ins.title}</div>
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
            <span style={{fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em",textTransform:"uppercase"}}>Total</span>
            <span style={{fontSize:15,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{totalCals} kcal</span>
          </div>
        </Card>
      )}

      {medList.filter(m=>m.reminderTime).length>0&&(
        <Card>
          <SLabel text="Wellness Schedule"/>
          {medList.filter(m=>m.reminderTime).sort((a,b)=>a.reminderTime.localeCompare(b.reminderTime)).map(m=>{
            const taken=takenLog[`${m.id}_${TODAY}`];
            return (
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
                <span>{taken?"✅":"🌿"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:taken?G.inkLight:G.inkSoft,textDecoration:taken?"line-through":"none",fontFamily:"'Cormorant Garamond',serif"}}>{m.name}</div>
                  <div style={{fontSize:11,color:G.inkLight}}>{m.dose} · {fmt.timeLabel(m.reminderTime)}</div>
                </div>
              </div>
            );
          })}
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
  const [mProt,setMProt]=useState("");const [mType,setMType]=useState("Breakfast");
  const [mode,setMode]=useState("search");
  const meals=dayState.meals;
  const totalCal=meals.reduce((s,m)=>s+Number(m.calories),0);
  const totalProt=meals.reduce((s,m)=>s+Number(m.protein||0),0);
  const mEmojis={Breakfast:"🍳",Lunch:"🥙",Dinner:"🍽️",Snack:"🍎"};

  const add=()=>{
    if(mode==="search"){
      if(!selected&&!query)return;
      const meal=selected||{name:query,cal:0,protein:0,carbs:0,fat:0};
      setDayState(p=>({...p,meals:[...p.meals,{id:Date.now(),name:meal.name,calories:meal.cal,protein:meal.protein||0,carbs:meal.carbs||0,fat:meal.fat||0,serving:meal.serving||"",mealType:mType,time:fmt.time()}]}));
      setQuery("");setSelected(null);
    }else{
      if(!mName||!mCal)return;
      setDayState(p=>({...p,meals:[...p.meals,{id:Date.now(),name:mName,calories:Number(mCal),protein:Number(mProt||0),mealType:mType,time:fmt.time()}]}));
      setMName("");setMCal("");setMProt("");
    }
  };

  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Consumed" value={totalCal} unit="kcal" color={G.peachSoft}/>
        <StatPill label="Remaining" value={Math.max(0,goalCal-totalCal)} unit="kcal" color={G.sageLight}/>
        <StatPill label="Protein" value={totalProt} unit="grams" color={G.goldLight}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:G.inkLight,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Jost',sans-serif"}}>Daily Goal: {goalCal} kcal</div>
        <ProgressBar value={totalCal} max={goalCal}/>
      </div>
      <Card>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          <Chip label="🔍 Search" active={mode==="search"} onClick={()=>setMode("search")}/>
          <Chip label="✏️ Manual" active={mode==="manual"} onClick={()=>setMode("manual")}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {["Breakfast","Lunch","Dinner","Snack"].map(t=><Chip key={t} label={t} active={mType===t} onClick={()=>setMType(t)}/>)}
        </div>
        {mode==="search"?(
          <>
            <AutocompleteInput placeholder="Search foods — chicken rice, Healthy Choice, protein bar…" value={query} onChange={v=>{setQuery(v);setSelected(null);}} onSelect={item=>{setSelected(item);setQuery(item.name);}} database={MEAL_DB}/>
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
          </>
        )}
        <button onClick={add} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>+ Add {mType}</button>
      </Card>
      {meals.length===0?<Empty emoji="🌿" text="No meals logged yet"/>:
        meals.map(m=>(
          <div key={m.id} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,animation:"slideIn 0.3s ease",boxShadow:"0 2px 8px rgba(201,169,110,0.06)"}}>
            <span style={{fontSize:20}}>{mEmojis[m.mealType]||"🍽️"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:14,color:G.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Cormorant Garamond',serif"}}>{m.name}</div>
              <div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{m.mealType} · {m.protein}g protein</div>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:G.gold,flexShrink:0,fontFamily:"'Cormorant Garamond',serif"}}>{m.calories}</div>
            <div style={{fontSize:10,color:G.inkLight,flexShrink:0}}>kcal</div>
            <DelBtn onClick={()=>setDayState(p=>({...p,meals:p.meals.filter(x=>x.id!==m.id)}))}/>
          </div>
        ))
      }
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
    if(mode==="search"){
      if(!selected||!dur)return;
      const burned=calcWorkoutCal(selected.met,profile,Number(dur));
      setDayState(p=>({...p,workouts:[...p.workouts,{id:Date.now(),name:selected.name,category:selected.category,duration:Number(dur),burned,time:fmt.time()}]}));
      setQuery("");setSelected(null);setDur("");
    }else{
      if(!mName||!dur)return;
      setDayState(p=>({...p,workouts:[...p.workouts,{id:Date.now(),name:mName,category:"Custom",duration:Number(dur),burned:Number(mBurned||0),time:fmt.time()}]}));
      setMName("");setDur("");setMBurned("");
    }
  };

  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Sessions" value={workouts.length} unit="today" color={G.peachSoft}/>
        <StatPill label="Active" value={totalMins} unit="mins" color={G.sageLight}/>
        <StatPill label="Burned" value={totalBurned} unit="kcal" color={G.goldLight}/>
      </div>
      <Card>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <Chip label="🔍 Library" active={mode==="search"} onClick={()=>setMode("search")}/>
          <Chip label="✏️ Manual" active={mode==="manual"} onClick={()=>setMode("manual")}/>
        </div>
        {mode==="search"?(
          <>
            <AutocompleteInput placeholder="Search — running, yoga, deadlifts, HIIT…" value={query} onChange={v=>{setQuery(v);setSelected(null);}} onSelect={item=>{setSelected(item);setQuery(item.name);}} database={WORKOUT_DB}/>
            {selected&&(
              <div style={{background:`linear-gradient(135deg,${G.sageLight},${G.peachSoft})`,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"10px 14px",marginBottom:8}}>
                <div style={{fontWeight:600,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{selected.emoji} {selected.name}</div>
                <div style={{fontSize:11,color:G.inkMid,marginTop:3}}>{selected.category} · MET: {selected.met}</div>
              </div>
            )}
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input placeholder="Duration (minutes)" type="number" value={dur} onChange={e=>setDur(e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
              {preview!==null&&(
                <div style={{background:`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`,borderRadius:14,padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${G.cardBorder}`}}>
                  <span style={{fontSize:16,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{preview}</span>
                  <span style={{fontSize:9,color:G.inkLight}}>kcal est.</span>
                </div>
              )}
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
      {workouts.length===0?<Empty emoji="🌿" text="No movement logged yet"/>:
        workouts.map(w=>(
          <div key={w.id} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,animation:"slideIn 0.3s ease"}}>
            <div style={{width:6,height:40,background:catColors[w.category]||G.gold,borderRadius:4,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div>
              <div style={{fontSize:11,color:G.inkLight,marginTop:2}}>{w.category||"Custom"} · {w.duration} min</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:15,fontWeight:700,color:G.gold,fontFamily:"'Cormorant Garamond',serif"}}>{w.burned}</div>
              <div style={{fontSize:9,color:G.inkLight}}>kcal</div>
            </div>
            <DelBtn onClick={()=>setDayState(p=>({...p,workouts:p.workouts.filter(x=>x.id!==w.id)}))}/>
          </div>
        ))
      }
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
  const addWater=oz=>setDayState(p=>({...p,water:[...p.water,{id:Date.now(),oz,cups:oz/8,time:fmt.time()}]}));

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:22}}>
        <svg width={148} height={148}>
          <circle cx={74} cy={74} r={56} fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth={8}/>
          <circle cx={74} cy={74} r={56} fill="none" stroke={G.sage} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
            strokeLinecap="round" transform="rotate(-90 74 74)"
            style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
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
      {water.length===0?<Empty emoji="💧" text="No water logged yet"/>:
        water.map(w=>(
          <div key={w.id} style={{background:`linear-gradient(135deg,${G.sageLight},rgba(255,252,248,0.9))`,border:`1px solid ${G.cardBorder}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:18}}>💧</span>
            <div style={{flex:1,fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{w.oz} oz</div>
            <span style={{fontSize:11,color:G.inkLight}}>{w.time}</span>
            <DelBtn onClick={()=>setDayState(p=>({...p,water:p.water.filter(x=>x.id!==w.id)}))}/>
          </div>
        ))
      }
    </div>
  );
}

// ─── RECOVERY TAB ─────────────────────────────────────────────────────────────
function RecoveryTab({recovery,setRecovery,dayState,profile,cyclePhase,addToast}) {
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
    addToast({emoji:"🌸",title:"Recovery logged",body:restDay?"Rest day marked — you deserve it.":"Hydrate and rest well tonight.",type:"success"});
  };

  const suppSugg=[];
  if(soreness>=4)suppSugg.push({name:"Magnesium",why:"Soothes muscles and improves sleep"});
  if(stress>=4)suppSugg.push({name:"Ashwagandha",why:"Calms cortisol and stress response"});
  if(energy<=2)suppSugg.push({name:"Vitamin B12",why:"Supports natural energy metabolism"});
  if(sleep<6)suppSugg.push({name:"Melatonin",why:"Gently regulates sleep cycles"});

  const workoutRecs=[];
  if(soreness>=4||restDay){workoutRecs.push("Yoga (Hatha / gentle)","Stretching / Flexibility","Walking (2 mph, slow)");}
  else if(energy>=4&&soreness<=2){if(phase)workoutRecs.push(...phase.workouts);else workoutRecs.push("HIIT (general)","Running (6 mph / 10 min mile)","Weight Training (vigorous)");}
  else{workoutRecs.push("Walking (3.5 mph, brisk)","Yoga (Vinyasa / flow)","Stationary Bike (moderate)");}

  const ScaleBtn=({val,current,setter,color})=>(
    <button onClick={()=>setter(val)} style={{width:36,height:36,borderRadius:10,border:`1.5px solid ${current===val?color:G.cardBorder}`,background:current===val?`${color}30`:"rgba(255,252,248,0.8)",cursor:"pointer",color:current===val?G.inkSoft:G.inkLight,fontWeight:700,fontSize:14,fontFamily:"'Cormorant Garamond',serif"}}>{val}</button>
  );

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Recovery & Rest</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Track how you feel — your body speaks, listen.</div>
      <Card>
        <SLabel text="Today's Check-In"/>
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
          <span style={{fontSize:13,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>🛌 Mark as rest day</span>
        </div>
        <input placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} style={iS}/>
        <button onClick={save} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>Save Recovery</button>
      </Card>
      {workoutRecs.length>0&&(
        <Card accent={`${G.sage}40`}>
          <SLabel text="Recommended for today"/>
          {workoutRecs.slice(0,3).map((w,i)=>{
            const entry=WORKOUT_DB.find(x=>x.name===w);
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
                <span style={{fontSize:18}}>{entry?.emoji||"🌿"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{w}</div>
                  <div style={{fontSize:11,color:G.inkLight}}>{entry?.category} · MET {entry?.met}</div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
      {suppSugg.length>0&&(
        <Card accent={`${G.gold}40`}>
          <SLabel text="Recovery supplement suggestions"/>
          {suppSugg.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid rgba(201,169,110,0.1)`}}>
              <span style={{fontSize:16}}>🌿</span>
              <div>
                <div style={{fontSize:14,color:G.inkSoft,fontFamily:"'Cormorant Garamond',serif"}}>{s.name}</div>
                <div style={{fontSize:12,color:G.inkMid,fontStyle:"italic",marginTop:2}}>{s.why}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── CYCLE TAB ────────────────────────────────────────────────────────────────
function CycleTab({cyclePhase,setCyclePhase,profile,addToast}) {
  if(profile.sex!=="female") return (
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
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Your body changes each phase — so should your goals.</div>
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
    </div>
  );
}

// ─── MEDS & SUPPS ─────────────────────────────────────────────────────────────
const CAT_EMOJIS={Supplement:"💊",Prescription:"💉",Vitamin:"🌟",Protein:"🥤",Herb:"🌿",OTC:"🧴"};

function MedCard({med,takenLog,onToggle,onDelete}) {
  const taken=!!takenLog[`${med.id}_${TODAY}`];
  const takenAt=takenLog[`${med.id}_${TODAY}`];
  return (
    <div style={{background:taken?`linear-gradient(135deg,${G.sageLight},rgba(255,252,248,0.9))`:G.cardBg,border:`1px solid ${taken?G.sage:G.cardBorder}`,borderRadius:16,padding:"14px 12px",display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,transition:"all 0.25s"}}>
      <button onClick={onToggle} style={{width:30,height:30,borderRadius:9,border:`1.5px solid ${taken?G.sage:G.cardBorder}`,background:taken?G.sage:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:G.ink,fontWeight:700,transition:"all 0.2s",marginTop:2}}>{taken?"✓":""}</button>
      <span style={{fontSize:22,flexShrink:0}}>{CAT_EMOJIS[med.category]||"🌿"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:15,color:taken?G.inkLight:G.inkSoft,textDecoration:taken?"line-through":"none",fontFamily:"'Cormorant Garamond',serif"}}>{med.name}</div>
        <div style={{fontSize:11,color:G.inkLight,marginTop:3,display:"flex",gap:8,flexWrap:"wrap"}}>
          {med.dose&&<span>💊 {med.dose}</span>}
          {med.frequency&&<span>🔁 {med.frequency}</span>}
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
  const pairingSuggestions=workoutCats.flatMap(cat=>{
    const suggested=SUPP_PAIRINGS[cat]||[];
    return suggested.filter(s=>!medList.some(m=>m.name.toLowerCase().includes(s))).slice(0,1).map(s=>({workout:cat,supp:s}));
  }).slice(0,2);

  const add=()=>{
    if(!name)return;
    const med={id:Date.now(),name,dose,category:cat,frequency:freq,reminderTime:remTime,notes};
    setMedList(p=>[...p,med]);
    addToast({emoji:CAT_EMOJIS[cat]||"🌿",title:`${name} added`,body:remTime?`Reminder set for ${fmt.timeLabel(remTime)}`:"No reminder set",type:"success"});
    setName("");setDose("");setNotes("");setRemTime("");setShowForm(false);
  };
  const toggleTaken=(med)=>{
    const key=`${med.id}_${TODAY}`;const already=takenLog[key];
    setTakenLog(p=>{const n={...p};if(already)delete n[key];else n[key]=fmt.time();return n;});
    if(!already)addToast({emoji:"✅",title:`${med.name} marked taken`,body:med.dose||"",type:"success"});
  };

  const scheduled=medList.filter(m=>m.reminderTime).sort((a,b)=>a.reminderTime.localeCompare(b.reminderTime));
  const unscheduled=medList.filter(m=>!m.reminderTime);

  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <StatPill label="Total" value={medList.length} unit="in list" color={G.peachSoft}/>
        <StatPill label="Taken" value={takenToday} unit="today" color={G.sageLight}/>
        <StatPill label="Pending" value={medList.length-takenToday} unit="left" color={G.goldLight}/>
      </div>
      {pairingSuggestions.length>0&&(
        <Card accent={`${G.gold}40`}>
          <SLabel text="Suggested for your workout"/>
          {pairingSuggestions.map((p,i)=>(
            <div key={i} style={{fontSize:13,color:G.inkSoft,padding:"5px 0",fontFamily:"'Cormorant Garamond',serif"}}>
              You logged <span style={{color:G.peach,fontWeight:600}}>{p.workout}</span> — consider adding <span style={{color:G.gold,fontWeight:600}}>{p.supp}</span> to your routine.
            </div>
          ))}
        </Card>
      )}
      <button onClick={()=>setShowForm(p=>!p)} style={{...bS(showForm?`rgba(201,169,110,0.1)`:`linear-gradient(135deg,${G.peach},${G.gold})`),marginBottom:14,border:`1px solid ${G.cardBorder}`}}>
        {showForm?"✕ Cancel":"+ Add Supplement or Medication"}
      </button>
      {showForm&&(
        <Card>
          <SLabel text="New Entry"/>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {Object.keys(CAT_EMOJIS).map(t=><Chip key={t} label={`${CAT_EMOJIS[t]} ${t}`} active={cat===t} onClick={()=>setCat(t)}/>)}
          </div>
          <input placeholder="Name (e.g. Vitamin D3, Metformin, Magnesium)" value={name} onChange={e=>setName(e.target.value)} style={iS}/>
          <input placeholder="Dosage (e.g. 1000mg, 2 capsules)" value={dose} onChange={e=>setDose(e.target.value)} style={iS}/>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {["Daily","Twice Daily","With Meals","Weekly","As Needed"].map(f=><Chip key={f} label={f} active={freq===f} onClick={()=>setFreq(f)}/>)}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:G.inkLight,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Jost',sans-serif"}}>⏰ Reminder Time</div>
            <input type="time" value={remTime} onChange={e=>setRemTime(e.target.value)} style={{...iS,marginBottom:4,colorScheme:"light"}}/>
          </div>
          <input placeholder="Notes (e.g. take with food, before bed)" value={notes} onChange={e=>setNotes(e.target.value)} style={iS}/>
          <button onClick={add} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>💾 Save to My List</button>
        </Card>
      )}
      {medList.length===0?<Empty emoji="🌿" text="No supplements or meds added yet"/>:(
        <>
          {scheduled.length>0&&<><SLabel text="⏰ Scheduled Reminders"/>{scheduled.map(m=><MedCard key={m.id} med={m} takenLog={takenLog} onToggle={()=>toggleTaken(m)} onDelete={()=>setMedList(p=>p.filter(x=>x.id!==m.id))}/>)}</>}
          {unscheduled.length>0&&<><SLabel text={scheduled.length>0?"📋 No Reminder Set":"📋 My List"}/>{unscheduled.map(m=><MedCard key={m.id} med={m} takenLog={takenLog} onToggle={()=>toggleTaken(m)} onDelete={()=>setMedList(p=>p.filter(x=>x.id!==m.id))}/>)}</>}
        </>
      )}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
const DEF_PROFILE={name:"",age:"",sex:"female",weight:"",weightUnit:"lbs",heightFt:"",heightIn:"",heightUnit:"imperial",height:"",activity:"moderate",goal:"maintain",streak:0};

function ProfileTab({profile,setProfile,addToast}) {
  const [local,setLocal]=useState({...profile});
  const set=(k,v)=>setLocal(p=>({...p,[k]:v}));
  const tdee=local.weight&&local.age?calcTDEE(local):null;
  const goalCal=tdee?calcGoalCalories(local,null):null;
  const bmr=local.weight&&local.age?Math.round(calcBMR(local)):null;
  const save=()=>{setProfile(local);addToast({emoji:"✨",title:"Profile saved!",body:goalCal?`Daily target: ${goalCal} kcal`:"",type:"success"});};

  return (
    <div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.inkSoft,marginBottom:4}}>Your Profile</div>
      <div style={{fontSize:12,color:G.inkLight,marginBottom:18,fontStyle:"italic"}}>Personalizes your goals, calorie targets & insights</div>

      {tdee&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
          {[
            {label:"BMR",val:bmr,sub:"base rate",color:G.peach},
            {label:"TDEE",val:tdee,sub:"daily burn",color:G.gold},
            {label:"Goal",val:goalCal,sub:local.goal==="lose"?"fat loss":local.goal==="gain"?"muscle gain":"maintenance",color:G.sage},
          ].map(s=>(
            <div key={s.label} style={{background:G.cardBg,border:`1px solid ${G.cardBorder}`,borderRadius:16,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:s.color,fontFamily:"'Cormorant Garamond',serif"}}>{s.val}</div>
              <div style={{fontSize:10,fontWeight:600,color:G.inkSoft,marginTop:2,fontFamily:"'Jost',sans-serif"}}>{s.label}</div>
              <div style={{fontSize:9,color:G.inkLight}}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {tdee&&(
        <Card accent={`${G.gold}30`}>
          <SLabel text="Why your goal is what it is"/>
          <div style={{fontSize:13,color:G.inkMid,lineHeight:1.7,fontFamily:"'Cormorant Garamond',serif",fontSize:14}}>
            Your body burns <span style={{color:G.gold,fontWeight:600}}>{tdee} kcal/day</span> at your activity level.
            {local.goal==="lose"&&<> A <span style={{color:G.sage,fontWeight:600}}>500 kcal daily deficit</span> creates a ~1 lb/week fat loss rate safely.</>}
            {local.goal==="gain"&&<> A <span style={{color:G.sage,fontWeight:600}}>300 kcal daily surplus</span> supports lean muscle growth with minimal fat gain.</>}
            {local.goal==="maintain"&&<> Eating at <span style={{color:G.sage,fontWeight:600}}>{tdee} kcal</span> maintains your current weight and composition.</>}
          </div>
        </Card>
      )}

      <Card>
        <SLabel text="Basic Info"/>
        <input placeholder="Your name" value={local.name} onChange={e=>set("name",e.target.value)} style={iS}/>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input placeholder="Age" type="number" value={local.age} onChange={e=>set("age",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
          <div style={{flex:1,display:"flex",gap:6,alignItems:"center"}}>
            <Chip label="Female" active={local.sex==="female"} onClick={()=>set("sex","female")}/>
            <Chip label="Male" active={local.sex==="male"} onClick={()=>set("sex","male")}/>
          </div>
        </div>
      </Card>

      <Card>
        <SLabel text="Weight"/>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input placeholder={local.weightUnit==="lbs"?"Weight (lbs)":"Weight (kg)"} type="number" value={local.weight} onChange={e=>set("weight",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Chip label="lbs" active={local.weightUnit==="lbs"} onClick={()=>set("weightUnit","lbs")}/>
            <Chip label="kg" active={local.weightUnit==="kg"} onClick={()=>set("weightUnit","kg")}/>
          </div>
        </div>
      </Card>

      <Card>
        <SLabel text="Height"/>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <Chip label="ft / in" active={local.heightUnit==="imperial"} onClick={()=>set("heightUnit","imperial")}/>
          <Chip label="cm" active={local.heightUnit==="metric"} onClick={()=>set("heightUnit","metric")}/>
        </div>
        {local.heightUnit==="imperial"?(
          <div style={{display:"flex",gap:8}}>
            <input placeholder="Feet" type="number" value={local.heightFt} onChange={e=>set("heightFt",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
            <input placeholder="Inches" type="number" value={local.heightIn} onChange={e=>set("heightIn",e.target.value)} style={{...iS,flex:1,marginBottom:0}}/>
          </div>
        ):(
          <input placeholder="Height (cm)" type="number" value={local.height} onChange={e=>set("height",e.target.value)} style={{...iS,marginBottom:0}}/>
        )}
      </Card>

      <Card>
        <SLabel text="Activity Level"/>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {val:"sedentary",label:"Sedentary",sub:"Desk job, little exercise"},
            {val:"light",label:"Lightly Active",sub:"Exercise 1–3 days/week"},
            {val:"moderate",label:"Moderately Active",sub:"Exercise 3–5 days/week"},
            {val:"active",label:"Very Active",sub:"Hard training 6–7 days/week"},
            {val:"veryActive",label:"Extra Active",sub:"Physical job + daily training"},
          ].map(a=>(
            <button key={a.val} onClick={()=>set("activity",a.val)} style={{background:local.activity===a.val?`linear-gradient(135deg,${G.peachSoft},${G.sageLight})`:"rgba(255,252,248,0.7)",border:`1.5px solid ${local.activity===a.val?G.gold:G.cardBorder}`,borderRadius:14,padding:"11px 14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}>
              <div style={{fontWeight:600,fontSize:14,color:local.activity===a.val?G.inkSoft:G.inkMid,fontFamily:"'Cormorant Garamond',serif"}}>{a.label}</div>
              <div style={{fontSize:11,color:G.inkLight,marginTop:2,fontStyle:"italic"}}>{a.sub}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SLabel text="Your Goal"/>
        <div style={{display:"flex",gap:8}}>
          {[{val:"lose",label:"🔥 Lose Fat"},{val:"maintain",label:"⚖️ Maintain"},{val:"gain",label:"💪 Build"}].map(g=>(
            <button key={g.val} onClick={()=>set("goal",g.val)} style={{flex:1,padding:"13px 4px",borderRadius:14,border:`1.5px solid ${local.goal===g.val?G.gold:G.cardBorder}`,background:local.goal===g.val?`linear-gradient(135deg,${G.peachSoft},${G.goldLight})`:"rgba(255,252,248,0.7)",cursor:"pointer",fontWeight:600,fontSize:12,color:local.goal===g.val?G.inkSoft:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.05em"}}>{g.label}</button>
          ))}
        </div>
      </Card>

      <button onClick={save} style={bS(`linear-gradient(135deg,${G.peach},${G.gold})`)}>✨ Save Profile</button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const TABS=[
  {id:"Summary",icon:"🌿",label:"Home"},
  {id:"Meals",icon:"🥗",label:"Meals"},
  {id:"Workouts",icon:"🌸",label:"Move"},
  {id:"Water",icon:"💧",label:"Water"},
  {id:"Meds",icon:"🌿",label:"Wellness"},
  {id:"Recovery",icon:"🛌",label:"Rest"},
  {id:"Cycle",icon:"🌙",label:"Cycle"},
  {id:"Profile",icon:"✨",label:"Profile"},
];

export default function App() {
  const [activeTab,setActiveTab]=useState("Summary");
  const [dayState,setDayState]=useState(()=>LS.get(`wellness_day_${TODAY}`,{meals:[],workouts:[],water:[]}));
  const [medList,setMedList]=useState(()=>LS.get("wellness_medlist",[]));
  const [takenLog,setTakenLog]=useState(()=>LS.get("wellness_takenlog",{}));
  const [profile,setProfile]=useState(()=>LS.get("wellness_profile",DEF_PROFILE));
  const [recovery,setRecovery]=useState(()=>LS.get("wellness_recovery_"+TODAY,{}));
  const [cyclePhase,setCyclePhase]=useState(()=>LS.get("wellness_cycle",""));
  const [toasts,setToasts]=useState([]);
  const firedRef=useRef(new Set(LS.get("wellness_fired",[])));

  useEffect(()=>{LS.set(`wellness_day_${TODAY}`,dayState);},[dayState]);
  useEffect(()=>{LS.set("wellness_medlist",medList);},[medList]);
  useEffect(()=>{LS.set("wellness_takenlog",takenLog);},[takenLog]);
  useEffect(()=>{LS.set("wellness_profile",profile);},[profile]);
  useEffect(()=>{LS.set("wellness_cycle",cyclePhase);},[cyclePhase]);

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

  return (
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:"'Jost','sans-serif'",color:G.ink,maxWidth:480,margin:"0 auto",paddingBottom:110}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        input::placeholder{color:${G.inkLight};}
        input:focus{border-color:${G.gold}!important;box-shadow:0 0 0 3px rgba(201,169,110,0.1);}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-14px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
        ::-webkit-scrollbar{width:0;}
        button{transition:all 0.15s;}
        button:active{opacity:0.8!important;}
      `}</style>

      <Toast toasts={toasts}/>

      {/* Header */}
      <div style={{
        padding:"28px 20px 14px",
        background:G.headerBg,
        position:"sticky",top:0,zIndex:10,
        borderBottom:`1px solid rgba(201,169,110,0.15)`,
        backdropFilter:"blur(12px)",
        position:"relative",overflow:"hidden",
      }}>
        <GoldSpeckles corner="tr"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
          <div>
            {profile.name&&<div style={{fontSize:11,color:G.inkLight,fontFamily:"'Jost',sans-serif",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{profile.name}</div>}
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,letterSpacing:"-0.5px",lineHeight:1,color:G.inkSoft}}>Glorié</div>
            <div style={{fontSize:10,color:G.inkLight,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",marginTop:2}}>your daily glow, inside and out.</div>
          </div>
          <GlorieLogo size={44}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid rgba(201,169,110,0.15)`,background:"rgba(250,246,240,0.95)",position:"sticky",top:88,zIndex:9,overflowX:"auto",scrollbarWidth:"none",backdropFilter:"blur(8px)"}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            flex:"0 0 auto",padding:"11px 12px",background:"none",border:"none",cursor:"pointer",
            fontSize:10,fontWeight:600,letterSpacing:0.8,whiteSpace:"nowrap",fontFamily:"'Jost',sans-serif",
            textTransform:"uppercase",
            color:activeTab===tab.id?G.inkSoft:G.inkLight,
            borderBottom:activeTab===tab.id?`2px solid ${G.gold}`:"2px solid transparent",
            position:"relative",
            transition:"all 0.2s",
          }}>
            {tab.icon} {tab.label}
            {tab.id==="Meds"&&pendingMeds>0&&<span style={{position:"absolute",top:6,right:3,background:`linear-gradient(135deg,${G.peach},${G.gold})`,borderRadius:99,minWidth:14,height:14,fontSize:8,fontWeight:700,color:G.ink,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{pendingMeds}</span>}
            {tab.id==="Profile"&&profileMissing&&<span style={{position:"absolute",top:6,right:3,background:G.peach,borderRadius:99,width:6,height:6}}/>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:"20px 16px"}}>
        {activeTab==="Summary"  &&<SummaryTab  dayState={dayState} medList={medList} takenLog={takenLog} profile={profile} recovery={recovery} cyclePhase={cyclePhase}/>}
        {activeTab==="Meals"    &&<MealsTab    dayState={dayState} setDayState={setDayState} profile={profile} cyclePhase={cyclePhase}/>}
        {activeTab==="Workouts" &&<WorkoutsTab dayState={dayState} setDayState={setDayState} profile={profile}/>}
        {activeTab==="Water"    &&<WaterTab    dayState={dayState} setDayState={setDayState}/>}
        {activeTab==="Meds"     &&<MedsTab     medList={medList} setMedList={setMedList} takenLog={takenLog} setTakenLog={setTakenLog} addToast={addToast} dayState={dayState}/>}
        {activeTab==="Recovery" &&<RecoveryTab recovery={recovery} setRecovery={setRecovery} dayState={dayState} profile={profile} cyclePhase={cyclePhase} addToast={addToast}/>}
        {activeTab==="Cycle"    &&<CycleTab    cyclePhase={cyclePhase} setCyclePhase={setCyclePhase} profile={profile} addToast={addToast}/>}
        {activeTab==="Profile"  &&<ProfileTab  profile={profile} setProfile={setProfile} addToast={addToast}/>}
      </div>
    </div>
  );
}