import { subHours } from "date-fns";
import type { IUser } from "../models/User";
import type { IMoodLog } from "../models/MoodLog";
import type {
  ILifestylePlan,
  INutritionMeal,
  INutritionPlan,
  IPersonalizedPlan,
  IPlanDay,
  IPlanExercise,
  IPlanSession,
} from "../models/PersonalizedPlan";

type EquipmentTag =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "bands"
  | "bodyweight"
  | "cables"
  | "medicine_ball"
  | "cardio"
  | "suspension"
  | "no-equipment";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type ExerciseTemplate = {
  name: string;
  focusTags: string[];
  equipment: EquipmentTag[];
  levels: ExperienceLevel[];
  defaultSets: number;
  defaultReps: number;
  tempo?: string;
  rest_seconds?: number;
  notes?: string;
};

const EXERCISE_LIBRARY: ExerciseTemplate[] = [
  {
    name: "Barbell Back Squat",
    focusTags: ["lower_strength", "power"],
    equipment: ["barbell"],
    levels: ["intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 6,
    tempo: "3-1-1",
    rest_seconds: 120,
  },
  {
    name: "Dumbbell Goblet Squat",
    focusTags: ["lower_strength", "hypertrophy"],
    equipment: ["dumbbell", "kettlebell"],
    levels: ["beginner", "intermediate"],
    defaultSets: 4,
    defaultReps: 10,
    rest_seconds: 90,
  },
  {
    name: "Romanian Deadlift",
    focusTags: ["posterior_chain", "lower_strength"],
    equipment: ["barbell", "dumbbell"],
    levels: ["intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 8,
    tempo: "3-1-1",
    rest_seconds: 120,
  },
  {
    name: "Single-Leg Romanian Deadlift",
    focusTags: ["posterior_chain", "balance"],
    equipment: ["dumbbell", "kettlebell", "bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 10,
    rest_seconds: 75,
  },
  {
    name: "Incline Dumbbell Press",
    focusTags: ["upper_push", "hypertrophy"],
    equipment: ["dumbbell"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 10,
    rest_seconds: 90,
  },
  {
    name: "Barbell Bench Press",
    focusTags: ["upper_push", "power"],
    equipment: ["barbell"],
    levels: ["intermediate", "advanced"],
    defaultSets: 5,
    defaultReps: 5,
    rest_seconds: 150,
  },
  {
    name: "Push-Up with Tempo",
    focusTags: ["upper_push", "control"],
    equipment: ["bodyweight"],
    levels: ["beginner", "intermediate"],
    defaultSets: 4,
    defaultReps: 12,
    tempo: "2-1-2",
    rest_seconds: 75,
  },
  {
    name: "Pull-Up or Assisted Pull-Up",
    focusTags: ["upper_pull", "strength"],
    equipment: ["bodyweight", "bands"],
    levels: ["intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 8,
    rest_seconds: 120,
  },
  {
    name: "Seated Cable Row",
    focusTags: ["upper_pull", "hypertrophy"],
    equipment: ["machine", "cables"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 12,
    rest_seconds: 90,
  },
  {
    name: "Single-Arm Dumbbell Row",
    focusTags: ["upper_pull", "stability"],
    equipment: ["dumbbell"],
    levels: ["beginner", "intermediate"],
    defaultSets: 4,
    defaultReps: 10,
    rest_seconds: 75,
  },
  {
    name: "Walking Lunge",
    focusTags: ["lower_strength", "functional"],
    equipment: ["dumbbell", "kettlebell", "bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 12,
    rest_seconds: 75,
  },
  {
    name: "Bulgarian Split Squat",
    focusTags: ["lower_strength", "stability"],
    equipment: ["dumbbell", "bodyweight"],
    levels: ["intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 10,
    rest_seconds: 90,
  },
  {
    name: "Kettlebell Swing",
    focusTags: ["conditioning", "posterior_chain"],
    equipment: ["kettlebell"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 4,
    defaultReps: 15,
    rest_seconds: 60,
  },
  {
    name: "Assault Bike Intervals",
    focusTags: ["conditioning", "aerobic_power"],
    equipment: ["cardio"],
    levels: ["intermediate", "advanced"],
    defaultSets: 6,
    defaultReps: 0,
    notes: "45 seconds hard / 45 seconds easy spin",
  },
  {
    name: "Row Erg Power Intervals",
    focusTags: ["conditioning", "aerobic_power"],
    equipment: ["cardio"],
    levels: ["beginner", "intermediate"],
    defaultSets: 6,
    defaultReps: 0,
    notes: "250m push / 150m float",
  },
  {
    name: "Medicine Ball Slam",
    focusTags: ["conditioning", "power"],
    equipment: ["medicine_ball"],
    levels: ["beginner", "intermediate"],
    defaultSets: 4,
    defaultReps: 12,
  },
  {
    name: "Dead Bug with Reach",
    focusTags: ["core", "control"],
    equipment: ["bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 12,
    tempo: "2-1-2",
  },
  {
    name: "Pallof Press Iso Hold",
    focusTags: ["core", "anti_rotation"],
    equipment: ["bands", "cables"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 10,
    rest_seconds: 60,
  },
  {
    name: "90/90 Hip Switches",
    focusTags: ["mobility", "hips"],
    equipment: ["bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 10,
  },
  {
    name: "Thoracic Spine Opener",
    focusTags: ["mobility", "spine"],
    equipment: ["foam roller", "bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 8,
  },
  {
    name: "Tempo Plank Series",
    focusTags: ["core", "stability"],
    equipment: ["bodyweight"],
    levels: ["beginner", "intermediate", "advanced"],
    defaultSets: 3,
    defaultReps: 60,
    notes: "30s front / 15s side each",
  },
  {
    name: "Sprint Intervals",
    focusTags: ["conditioning", "anaerobic"],
    equipment: ["cardio"],
    levels: ["advanced"],
    defaultSets: 8,
    defaultReps: 0,
    notes: "20s sprint / 70s walk",
  },
];

const FOOD_MACRO_LIBRARY: Record<
  string,
  { calories: number; protein: number; carbs: number; fat: number; fiber?: number }
> = {
  "grilled chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 4 },
  "salmon fillet": { calories: 233, protein: 25, carbs: 0, fat: 14 },
  "tofu": { calories: 144, protein: 17, carbs: 4, fat: 8 },
  "tempeh": { calories: 195, protein: 20, carbs: 12, fat: 11 },
  "lentils": { calories: 230, protein: 18, carbs: 40, fat: 1, fiber: 16 },
  "quinoa": { calories: 222, protein: 8, carbs: 39, fat: 4, fiber: 5 },
  "brown rice": { calories: 216, protein: 5, carbs: 45, fat: 2 },
  "sweet potato": { calories: 180, protein: 4, carbs: 41, fat: 0, fiber: 6 },
  "greek yogurt": { calories: 150, protein: 15, carbs: 10, fat: 4 },
  "oats": { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
  "chia pudding": { calories: 200, protein: 6, carbs: 18, fat: 12, fiber: 10 },
  "avocado toast": { calories: 320, protein: 7, carbs: 32, fat: 19, fiber: 8 },
  "smoothie bowl": { calories: 350, protein: 20, carbs: 45, fat: 10, fiber: 8 },
  "edamame": { calories: 180, protein: 17, carbs: 15, fat: 8, fiber: 8 },
  "hummus with veggie sticks": { calories: 220, protein: 8, carbs: 24, fat: 10, fiber: 6 },
  "almonds": { calories: 170, protein: 6, carbs: 6, fat: 15, fiber: 4 },
  "cottage cheese": { calories: 180, protein: 24, carbs: 6, fat: 5 },
  "protein shake": { calories: 200, protein: 30, carbs: 8, fat: 4 },
  "overnight oats": { calories: 380, protein: 24, carbs: 45, fat: 12, fiber: 8 },
};

const PREFERRED_MEAL_PROFILE: Record<
  string,
  { breakfast: string; lunch: string; dinner: string; snacks: string[]; guidance: string[] }
> = {
  omnivore: {
    breakfast: "Protein Berry Oats",
    lunch: "Power Bowl with Lean Protein",
    dinner: "Performance Plate with Seasonal Veg",
    snacks: ["Greek Yogurt + Nuts", "Citrus Recovery Smoothie"],
    guidance: [
      "Anchor meals around lean protein, colorful produce, fibre-rich carbs, and healthy fats.",
      "Aim for hydration pulses of 500ml with breakfast, lunch, and mid-afternoon.",
    ],
  },
  vegetarian: {
    breakfast: "Chia Pudding Sunrise Jar",
    lunch: "Mediterranean Tempeh Power Bowl",
    dinner: "Roasted Veg + Lentil Sheet Pan",
    snacks: ["Matcha Protein Shake", "Apple + Almond Butter"],
    guidance: [
      "Distribute plant proteins across the day to hit amino acid targets.",
      "Layer herbs & citrus for bright flavor without increasing sodium.",
    ],
  },
  vegan: {
    breakfast: "Cacao Greens Smoothie Bowl",
    lunch: "Rainbow Quinoa Glow Bowl",
    dinner: "Tahini Roasted Chickpea Tray",
    snacks: ["Roasted Edamame Crunch", "Coconut Yogurt Parfait"],
    guidance: [
      "Anchor meals with legumes + seeds to unlock complete protein.",
      "Boost iron absorption by pairing vitamin C with high-iron foods.",
    ],
  },
  pescatarian: {
    breakfast: "Citrus Greek Yogurt Bowl",
    lunch: "Seared Salmon Macro Bowl",
    dinner: "Miso Glazed Cod with Greens",
    snacks: ["Smoked Trout Rice Cakes", "Berry Collagen Smoothie"],
    guidance: [
      "Space omega-3 rich meals to support inflammation control.",
      "Pair seafood with fermented produce to aid digestion.",
    ],
  },
  keto: {
    breakfast: "Savory Egg & Greens Scramble",
    lunch: "Power Cobb Salad",
    dinner: "Garlic Butter Salmon with Zoodles",
    snacks: ["Avocado Fat Bombs", "Electrolyte Chia Drink"],
    guidance: [
      "Aim for whole-food fats and colour to diversify micronutrients.",
      "Keep electrolyte support consistent to maintain energy.",
    ],
  },
  paleo: {
    breakfast: "Sweet Potato Protein Skillet",
    lunch: "Grass-Fed Steak Harvest Bowl",
    dinner: "Herbed Chicken with Root Veg",
    snacks: ["Bison Jerky + Berries", "Coconut Cashew Energy Bites"],
    guidance: [
      "Rotate roots & tubers to support glycogen without grains.",
      "Layer in fermented foods for robust gut health.",
    ],
  },
};

const normalizeEquipment = (equipment: string[] | undefined | null): Set<EquipmentTag> => {
  const set = new Set<EquipmentTag>(["bodyweight"]);
  (equipment ?? []).forEach((item) => {
    const normalized = item.trim().toLowerCase();
    if (normalized.includes("barbell")) set.add("barbell");
    if (normalized.includes("dumbbell")) set.add("dumbbell");
    if (normalized.includes("kettlebell")) set.add("kettlebell");
    if (normalized.includes("band")) set.add("bands");
    if (normalized.includes("machine") || normalized.includes("cable")) set.add("machine");
    if (normalized.includes("treadmill") || normalized.includes("bike") || normalized.includes("row"))
      set.add("cardio");
    if (normalized.includes("medicine")) set.add("medicine_ball");
    if (normalized.includes("trx") || normalized.includes("suspension")) set.add("suspension");
    if (normalized.includes("no equipment")) set.add("no-equipment");
    if (normalized.includes("bodyweight")) set.add("bodyweight");
    if (normalized.includes("foam") || normalized.includes("roller")) set.add("bodyweight");
  });
  return set;
};

const resolveExperienceLevel = (user: IUser): ExperienceLevel => {
  const level = (user.experience_level ?? "").toLowerCase();
  if (level.includes("beginner")) return "beginner";
  if (level.includes("advanced")) return "advanced";
  return "intermediate";
};

const chooseExercises = (
  focusTag: string,
  user: IUser,
  targetCount: number,
  allowFallback = true
): IPlanExercise[] => {
  const availableEquipment = normalizeEquipment(user.available_equipment);
  const level = resolveExperienceLevel(user);

  const matches = EXERCISE_LIBRARY.filter((exercise) => {
    if (!exercise.focusTags.includes(focusTag)) return false;
    if (!exercise.levels.includes(level) && !(level === "advanced" && exercise.levels.includes("intermediate"))) {
      return false;
    }

    return exercise.equipment.some((eq) => availableEquipment.has(eq));
  });

  const selected: ExerciseTemplate[] = [];

  for (const candidate of matches) {
    if (selected.length >= targetCount) break;
    selected.push(candidate);
  }

  if (selected.length < targetCount && allowFallback) {
    const fallback = EXERCISE_LIBRARY.filter(
      (exercise) => exercise.focusTags.includes(focusTag) && exercise.equipment.includes("bodyweight")
    );
    for (const candidate of fallback) {
      if (selected.length >= targetCount) break;
      selected.push(candidate);
    }
  }

  const deduped = Array.from(new Set(selected.map((exercise) => exercise.name))).map((name) =>
    selected.find((exercise) => exercise.name === name)
  );

  const sanitized = deduped
    .filter(Boolean)
    .slice(0, targetCount)
    .map((exercise): IPlanExercise => {
      if (!exercise) {
        return {
          name: "Mindful Mobility Flow",
          sets: 3,
          reps: 60,
          tempo: "controlled",
          rest_seconds: 45,
          notes: "Use breath-led movement to open hips and thoracic spine.",
        };
      }
      return {
        name: exercise.name,
        sets: exercise.defaultSets,
        reps: exercise.defaultReps || undefined,
        tempo: exercise.tempo,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes,
      };
    });

  while (sanitized.length < targetCount) {
    sanitized.push({
      name: "Dynamic Mobility Circuit",
      sets: 3,
      reps: 45,
      tempo: "fluid",
      rest_seconds: 30,
      notes: "Flow between cat/cow, world’s greatest stretch, and thoracic rotations.",
    });
  }

  return sanitized;
};

const buildWorkoutSchedule = (user: IUser, mood?: IMoodLog | null): { focus_summary: string; schedule: IPlanDay[] } => {
  const goal = (user.primary_goal || user.fitness_goal || "").toLowerCase();
  const intensityBase = goal.includes("lose") || goal.includes("cut") ? "moderate" : "high";
  const level = resolveExperienceLevel(user);
  const moodModifier = mood?.mood === "stressed" || mood?.stress_level === "high" ? "moderate" : intensityBase;

  const sessions: IPlanDay[] = [
    {
      day: "Monday",
      emphasis: "Upper Strength & Power",
      sessions: [
        {
          name: "Push Power Session",
          focus: "upper_push",
          duration_minutes: 60,
          intensity: moodModifier === "high" ? "high" : "moderate",
          modality: "strength",
          guidance: "Focus on crisp bar speed. Pause at the bottom of presses to build explosive drive.",
          exercises: chooseExercises("upper_push", user, 4),
        },
        {
          name: "Heartline Finisher",
          focus: "conditioning",
          duration_minutes: 12,
          intensity: "high",
          modality: "anaerobic intervals",
          guidance: "90s bike sprint pyramid. Stay tall, drive through the foot.",
          exercises: chooseExercises("conditioning", user, 2),
        },
      ],
      recovery: {
        focus: "Shoulder mobility reset",
        duration_minutes: 10,
        notes: "Band dislocates, wall slides, thoracic extensions.",
      },
    },
    {
      day: "Tuesday",
      emphasis: "Aerobic Conditioning & Core",
      sessions: [
        {
          name: "Engine Builder",
          focus: "conditioning",
          duration_minutes: 40,
          intensity: moodModifier === "high" ? "moderate" : "low",
          modality: "mixed modal conditioning",
          guidance: "Keep breath rhythmic. Nasal breathing for first 10 minutes, then open throttle.",
          exercises: chooseExercises("conditioning", user, 3),
        },
        {
          name: "Core Integrity",
          focus: "core",
          duration_minutes: 15,
          intensity: "moderate",
          modality: "core stability",
          guidance: "Focus on anti-rotation control and tempo.",
          exercises: chooseExercises("core", user, 3),
        },
      ],
      recovery: {
        focus: "Guided breath work",
        duration_minutes: 8,
        notes: "Box breathing 4-4-4-4, emphasising long exhales.",
      },
    },
    {
      day: "Wednesday",
      emphasis: "Lower Body Strength",
      sessions: [
        {
          name: "Strength Foundations",
          focus: "lower_strength",
          duration_minutes: 55,
          intensity: moodModifier,
          modality: "strength",
          guidance: "Own the eccentric, drive through mid-foot. Track load or tempo progression weekly.",
          exercises: chooseExercises("lower_strength", user, 4),
        },
        {
          name: "Posterior Chain Resilience",
          focus: "posterior_chain",
          duration_minutes: 15,
          intensity: "moderate",
          modality: "accessory",
          guidance: "Use slow tempo and full hip lockout.",
          exercises: chooseExercises("posterior_chain", user, 2),
        },
      ],
      recovery: {
        focus: "Contrast shower or hot/cold plunge",
        duration_minutes: 8,
        notes: "Optional protocol for nervous system refresh.",
      },
    },
    {
      day: "Thursday",
      emphasis: "Mobility & Mood Reset",
      sessions: [
        {
          name: "Flow & Restore",
          focus: "mobility",
          duration_minutes: 35,
          intensity: "low",
          modality: "mobility",
          guidance: "Joint capsules first, then global flows. Pair with mellow playlist.",
          exercises: chooseExercises("mobility", user, 3),
        },
        {
          name: "Mindful Core Breath",
          focus: "core",
          duration_minutes: 15,
          intensity: "low",
          modality: "breathwork",
          guidance: "Supine breathing, diaphragmatic drills, box breathing.",
          exercises: chooseExercises("core", user, 2),
        },
      ],
      recovery: {
        focus: "Guided journaling",
        duration_minutes: 10,
        notes: "Prompt: Note three wins + one micro-shift for tomorrow.",
      },
      mindset: "Evening wind-down ritual: magnesium tea + light stretching.",
    },
    {
      day: "Friday",
      emphasis: "Hybrid Performance",
      sessions: [
        {
          name: "Athleticism Blend",
          focus: "upper_pull",
          duration_minutes: 45,
          intensity: "high",
          modality: "strength + plyo",
          guidance: "Contrast sets. Pair power movement with technical strength lifts.",
          exercises: chooseExercises("upper_pull", user, 3),
        },
        {
          name: "Sprint Ladder",
          focus: "conditioning",
          duration_minutes: 18,
          intensity: "high",
          modality: "sprint",
          guidance: "20s sprint / 70s walk x 6. Cap RPE at 8 unless tracking HRV green.",
          exercises: chooseExercises(level === "beginner" ? "conditioning" : "conditioning", user, 2),
        },
      ],
      recovery: {
        focus: "Parasympathetic downshift",
        duration_minutes: 12,
        notes: "5 min legs-up-the-wall + 7 min guided breathing.",
      },
    },
    {
      day: "Saturday",
      emphasis: "Optional Skill + Play",
      sessions: [
        {
          name: "Skill Lab",
          focus: "mobility",
          duration_minutes: 25,
          intensity: "moderate",
          modality: "skill",
          guidance: "Choose skill focus (handstand prep, olympic lifts, yoga flow). Keep it playful.",
          exercises: chooseExercises("mobility", user, 2),
        },
        {
          name: "Adventure Session",
          focus: "conditioning",
          duration_minutes: 30,
          intensity: "moderate",
          modality: "outdoor conditioning",
          guidance: "Pick an outdoor session (hike, zone 2 run, ride) aligned with your joy list.",
          exercises: [
            {
              name: "Choose-your-adventure endurance",
              sets: 1,
              reps: 0,
              notes: "45-60 minute zone 2 movement of choice.",
            },
          ],
        },
      ],
      recovery: {
        focus: "Sunlight + gratitude walk",
        duration_minutes: 15,
        notes: "Phone-free walk, notice three uplifting details.",
      },
    },
    {
      day: "Sunday",
      emphasis: "Full Recovery Ritual",
      sessions: [
        {
          name: "Mobility Recharge",
          focus: "mobility",
          duration_minutes: 25,
          intensity: "low",
          modality: "mobility",
          guidance: "Focus on hips, T-spine, ankles. Pair with breath pacing.",
          exercises: chooseExercises("mobility", user, 2),
        },
        {
          name: "Reflection & Priming",
          focus: "mindset",
          duration_minutes: 20,
          intensity: "low",
          modality: "mindfulness",
          guidance: "Reflect on weekly wins, set intentions, preview upcoming training.",
          exercises: [
            {
              name: "Guided reflection",
              sets: 1,
              reps: 0,
              notes: "Prompted journaling: Celebrate, Course Correct, Commit.",
            },
          ],
        },
      ],
      recovery: {
        focus: "Contrast therapy or mobility bath",
        duration_minutes: 15,
        notes: "Heat + cold rotation to supercharge recovery.",
      },
      mindset: "Prep fueling for Monday. Set micro-intentions for week.",
    },
  ];

  const focus_summary =
    goal.includes("muscle") || goal.includes("build")
      ? "Lean mass acceleration with strength + power emphasis"
      : goal.includes("weight") || goal.includes("fat")
      ? "Metabolic conditioning stack anchored by strength retention"
      : "Performance-driven hybrid training cycle";

  return { focus_summary, schedule: sessions };
};

const computeCalorieTarget = (user: IUser): number => {
  if (user.daily_calorie_target && user.daily_calorie_target > 0) {
    return user.daily_calorie_target;
  }

  const weightKg = user.weight_kg ?? user.target_weight ?? 72;
  const heightCm = user.height_cm ?? 172;
  const age = user.age ?? 30;
  const gender = (user.gender ?? "").toLowerCase();

  const bmr =
    gender === "female"
      ? 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age
      : 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;

  const activityLevel = (user.activity_level ?? "moderate").toLowerCase();
  const activityFactor =
    activityLevel.includes("high") || activityLevel.includes("intense")
      ? 1.725
      : activityLevel.includes("moderate")
      ? 1.55
      : activityLevel.includes("light")
      ? 1.375
      : 1.2;

  let maintenanceCalories = bmr * activityFactor;

  const goal = (user.primary_goal || user.fitness_goal || "").toLowerCase();
  if (goal.includes("lose") || goal.includes("cut")) {
    maintenanceCalories -= 350;
  } else if (goal.includes("gain") || goal.includes("muscle") || goal.includes("build")) {
    maintenanceCalories += 250;
  }

  return Math.round(Math.max(maintenanceCalories, 1500));
};

const computeMacroSplit = (user: IUser, calories: number) => {
  const goal = (user.primary_goal || user.fitness_goal || "").toLowerCase();
  let proteinPercentage = 0.3;
  let fatPercentage = 0.3;
  let carbsPercentage = 0.4;

  if (goal.includes("gain") || goal.includes("muscle") || goal.includes("build")) {
    proteinPercentage = 0.32;
    carbsPercentage = 0.43;
    fatPercentage = 0.25;
  } else if (goal.includes("lose") || goal.includes("cut")) {
    proteinPercentage = 0.34;
    carbsPercentage = 0.33;
    fatPercentage = 0.33;
  } else if (goal.includes("endurance") || goal.includes("marathon")) {
    proteinPercentage = 0.26;
    carbsPercentage = 0.5;
    fatPercentage = 0.24;
  }

  const protein = Math.round((calories * proteinPercentage) / 4);
  const carbs = Math.round((calories * carbsPercentage) / 4);
  const fat = Math.round((calories * fatPercentage) / 9);

  return { protein, carbs, fat };
};

const findMealProfile = (user: IUser) => {
  const preference = (user.dietary_preference ?? "").toLowerCase();
  if (preference.includes("vegan")) return PREFERRED_MEAL_PROFILE.vegan;
  if (preference.includes("vegetarian")) return PREFERRED_MEAL_PROFILE.vegetarian;
  if (preference.includes("pesc")) return PREFERRED_MEAL_PROFILE.pescatarian;
  if (preference.includes("keto")) return PREFERRED_MEAL_PROFILE.keto;
  if (preference.includes("paleo")) return PREFERRED_MEAL_PROFILE.paleo;
  return PREFERRED_MEAL_PROFILE.omnivore;
};

const createMealFromTemplate = (
  name: string,
  type: INutritionMeal["meal_type"],
  ratio: number,
  totalCalories: number,
  macros: { protein: number; carbs: number; fat: number },
  baseIngredients: string[]
): INutritionMeal => {
  const calories = Math.round(totalCalories * ratio);
  const protein = Math.max(5, Math.round(macros.protein * ratio));
  const carbs = Math.max(5, Math.round(macros.carbs * ratio));
  const fat = Math.max(5, Math.round(macros.fat * ratio * 0.9));
  const fiber = type === "snack" ? Math.round(carbs * 0.12) : Math.round(carbs * 0.18);

  return {
    name,
    meal_type: type,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    ingredients: baseIngredients,
    notes: "Scale portions + swap ingredients via preferences list as needed.",
  };
};

const buildNutritionPlan = (user: IUser): INutritionPlan => {
  const calories = computeCalorieTarget(user);
  const macros = computeMacroSplit(user, calories);
  const mealProfile = findMealProfile(user);

  const breakfast = createMealFromTemplate(
    mealProfile.breakfast,
    "breakfast",
    0.28,
    calories,
    macros,
    ["protein-forward base", "fibre-rich carbs", "healthy fats"]
  );
  const lunch = createMealFromTemplate(
    mealProfile.lunch,
    "lunch",
    0.32,
    calories,
    macros,
    ["lean protein or alternative", "vibrant vegetables", "ancient grain or tuber"]
  );
  const dinner = createMealFromTemplate(
    mealProfile.dinner,
    "dinner",
    0.3,
    calories,
    macros,
    ["protein anchor", "seasonal produce", "performance carbs"]
  );

  const snacks: INutritionMeal[] = mealProfile.snacks.map((snack) =>
    createMealFromTemplate(snack, "snack", 0.05, calories, macros, ["smart proteins", "satiety fats", "micronutrients"])
  );

  const hydration_ml = user.daily_water_target_ml ?? Math.round(user.weight_kg ? user.weight_kg * 35 : 2900);

  return {
    calories_target: calories,
    macro_split: macros,
    hydration_ml,
    meals: [breakfast, lunch, dinner],
    snacks,
    supplements: user.support_expectations
      ? [`Coach note: ${user.support_expectations}`, "Electrolytes during conditioning days"]
      : ["Creatine 5g daily", "Omega-3 (if not covering with fatty fish)", "Vitamin D3 + K2"],
    guidance: [
      ...mealProfile.guidance,
      `Hydration target set at ${hydration_ml}ml — checkpoint every 3-4 hours.`,
      "Use the Groq Vision food scanner in the app to log meals visually and auto-adjust macros.",
    ],
  };
};

const buildLifestylePlan = (user: IUser, mood?: IMoodLog | null): ILifestylePlan => {
  const sleepTarget = user.sleep_target_hours ?? 7.5;
  const windDown: string[] = [
    "Screen-free final 45 minutes of the evening.",
    "Dim lights + lavender breath work 10 minutes pre-bed.",
  ];

  if ((user.sleep_challenges ?? []).length > 0) {
    windDown.push("Address sleep blockers noted in profile using 1% experiments weekly.");
  }

  const moodSupport = [
    "2-minute gratitude stack after training sessions.",
    "Sun exposure within 60 minutes of waking to anchor circadian rhythm.",
  ];

  if (mood?.stress_level === "high") {
    moodSupport.push("Box breathing micro-pauses between meetings (4-4-4-4).");
  }

  if ((user.mood_tags ?? []).includes("creative")) {
    moodSupport.push("Schedule one playful movement session weekly (dance, parkour lite, flow arts).");
  }

  const recoveryFocus = [
    "Weekly HRV check-in; if trending down, swap one intensity session for mobility.",
    "Soft tissue work or percussion gun 2x week post-strength.",
  ];

  const microHabits = [
    "Log mood after each workout to teach the AI coach your patterns.",
    "Morning hydration cocktail: water + pinch of salt + squeeze of citrus.",
    "Evening reflection: note one win, one insight, one commitment.",
  ];

  return {
    sleep: { target_hours: sleepTarget, wind_down_rituals: windDown },
    mood_support: moodSupport,
    recovery_focus: recoveryFocus,
    micro_habits: microHabits,
  };
};

const aggregateNutritionTotals = (plan: INutritionPlan) => {
  const allMeals = [...plan.meals, ...(plan.snacks ?? [])];
  return allMeals.reduce(
    (totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
      totals.fiber += meal.fiber ?? 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};

const createMealFromFoodName = (food: string): INutritionMeal => {
  const key = food.trim().toLowerCase();
  const macros = FOOD_MACRO_LIBRARY[key] ?? { calories: 220, protein: 12, carbs: 20, fat: 8, fiber: 3 };

  return {
    name: food,
    meal_type: "custom",
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    fiber: macros.fiber ?? Math.round(macros.carbs * 0.1),
    ingredients: [food],
    notes: "User suggested favourite. Track with Groq Vision scanner to refine macros.",
  };
};

export const adjustNutritionPlanWithFoods = (
  plan: INutritionPlan,
  foods: string[],
  purpose: string
): INutritionPlan => {
  if (!foods || foods.length === 0) {
    return plan;
  }

  const additions = foods.map((food) => createMealFromFoodName(food));
  const updatedSnacks = [...(plan.snacks ?? []), ...additions];

  const updatedPlan = {
    ...plan,
    snacks: updatedSnacks,
    guidance: [
      ...(plan.guidance ?? []),
      `Plan tuned with user-requested items for ${purpose}. Re-scan meals for precise macro tracking.`,
    ],
  };

  const totals = aggregateNutritionTotals(updatedPlan);
  updatedPlan.macro_split = {
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
  };
  updatedPlan.calories_target = totals.calories;

  return updatedPlan;
};

export const generateFallbackPlan = (user: IUser, mood?: IMoodLog | null) => {
  const workout_plan = buildWorkoutSchedule(user, mood);
  const nutrition_plan = buildNutritionPlan(user);
  const lifestyle_plan = buildLifestylePlan(user, mood);

  return {
    workout_plan,
    nutrition_plan,
    lifestyle_plan,
  };
};

export const createPersonalizedPlanDocument = (
  user: IUser,
  basePlan: ReturnType<typeof generateFallbackPlan>,
  source: IPersonalizedPlan["source"],
  generatedReason: string,
  metadata: Record<string, unknown> = {}
) => {
  const readiness =
    metadata?.readiness_score ??
    (moodScoreFromUser(user) > 0 ? Math.min(95, 80 + Math.random() * 10) : Math.min(90, 75 + Math.random() * 12));

  return {
    user: user._id,
    version: metadata?.version ? Number(metadata.version) : 1,
    source,
    generated_reason: generatedReason,
    workout_plan: basePlan.workout_plan,
    nutrition_plan: basePlan.nutrition_plan,
    lifestyle_plan: basePlan.lifestyle_plan,
    readiness_score: readiness,
    metadata: {
      generated_at: new Date().toISOString(),
      ...metadata,
    },
  };
};

const moodScoreFromUser = (user: IUser) => {
  const scoreBase = 70;
  const stressPenalty = (user.stress_level ?? "").toLowerCase().includes("high") ? -10 : 0;
  const sleepBonus = user.sleep_target_hours && user.sleep_target_hours >= 7 ? 5 : 0;
  return scoreBase + stressPenalty + sleepBonus;
};

export const blendExternalWithFallback = (
  user: IUser,
  fallbackPlan: ReturnType<typeof generateFallbackPlan>,
  externalPlan: Partial<IPersonalizedPlan> | null
) => {
  if (!externalPlan) return fallbackPlan;

  const blendedWorkout = externalPlan.workout_plan?.schedule?.length
    ? {
        focus_summary: externalPlan.workout_plan.focus_summary ?? fallbackPlan.workout_plan.focus_summary,
        schedule: externalPlan.workout_plan.schedule as IPlanDay[],
      }
    : fallbackPlan.workout_plan;

  const blendedNutrition = externalPlan.nutrition_plan?.meals?.length
    ? {
        ...fallbackPlan.nutrition_plan,
        ...externalPlan.nutrition_plan,
        guidance: [
          "Hybrid plan: external AI insights fused with FitFlow adaptive nutrition engine.",
          ...(externalPlan.nutrition_plan?.guidance ?? fallbackPlan.nutrition_plan.guidance),
        ],
      }
    : fallbackPlan.nutrition_plan;

  const blendedLifestyle = externalPlan.lifestyle_plan
    ? {
        sleep: externalPlan.lifestyle_plan.sleep ?? fallbackPlan.lifestyle_plan.sleep,
        mood_support: [
          ...(externalPlan.lifestyle_plan.mood_support ?? []),
          ...fallbackPlan.lifestyle_plan.mood_support,
        ],
        recovery_focus: [
          ...(externalPlan.lifestyle_plan.recovery_focus ?? []),
          ...fallbackPlan.lifestyle_plan.recovery_focus,
        ],
        micro_habits: [
          ...(externalPlan.lifestyle_plan.micro_habits ?? []),
          ...fallbackPlan.lifestyle_plan.micro_habits,
        ],
      }
    : fallbackPlan.lifestyle_plan;

  return {
    workout_plan: blendedWorkout,
    nutrition_plan: blendedNutrition,
    lifestyle_plan: blendedLifestyle,
  };
};

export const buildMoodAwarePlan = (user: IUser, recentMood?: IMoodLog | null) => {
  const fallbackPlan = generateFallbackPlan(user, recentMood);

  if (!recentMood) return fallbackPlan;

  const mood = recentMood.mood;
  if (mood === "stressed" || recentMood.stress_level === "high") {
    fallbackPlan.workout_plan.schedule = fallbackPlan.workout_plan.schedule.map((day) => {
      if (day.day === "Monday" || day.day === "Friday") {
        day.sessions[0].intensity = "moderate";
        day.sessions[0].guidance =
          "Dial in tempo control and keep RPE at 7. Prioritize quality movement over load this week.";
      }
      return day;
    });
    fallbackPlan.lifestyle_plan.mood_support.push("Add 10-minute mindfulness walk post-lunch.");
  }

  if (mood === "energized") {
    fallbackPlan.workout_plan.schedule = fallbackPlan.workout_plan.schedule.map((day) => {
      if (day.day === "Friday") {
        day.sessions[1].intensity = "high";
        day.sessions[1].guidance = "Cap RPE at 9. Track sprint splits to capture performance.";
      }
      return day;
    });
  }

  return fallbackPlan;
};

export const inferMoodSnapshot = (moods: IMoodLog[]): IMoodLog | null => {
  if (!moods.length) return null;
  const latest = moods[0];
  if (!latest.createdAt) return latest;

  const twentyFourHoursAgo = subHours(new Date(), 24);
  return new Date(latest.createdAt) > twentyFourHoursAgo ? latest : null;
};
