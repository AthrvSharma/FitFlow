import { format, subDays } from "date-fns";

const dateString = (daysAgo: number) => format(subDays(new Date(), daysAgo), "yyyy-MM-dd");
const timeString = (hours: number, minutes: number) =>
  `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

export type WorkoutExercise = {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
};

export type WorkoutSession = {
  id: string;
  workout_name: string;
  workout_type: "strength" | "cardio" | "flexibility" | "sports" | "other";
  duration_minutes: number;
  calories_burned: number;
  date: string;
  overall_rpe?: number;
  energy_level?: "low" | "moderate" | "high";
  exercises: WorkoutExercise[];
  notes?: string;
};

export type NutritionLog = {
  id: string;
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
};

export type SleepLog = {
  id: string;
  date: string;
  duration_hours: number;
  sleep_quality?: "poor" | "fair" | "good" | "excellent";
};

export type WaterLog = {
  id: string;
  date: string;
  amount_ml: number;
  time: string;
};

export type AIInsight = {
  id: string;
  date: string;
  type: "workout" | "nutrition" | "recovery" | "motivation" | "recommendation";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  action_items: string[];
  read?: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "core" | "plyometric";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment?: string[];
  form_cues?: string[];
};

export type WorkoutBuddy = {
  id: string;
  buddy_email: string;
  buddy_name: string;
  status: "active" | "pending" | "paused";
  shared_goals: string[];
  weekly_checkins: number;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  target: string;
  participants: string[];
  start_date: string;
  end_date: string;
  prize?: string;
  is_community: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earned_at: string;
  badge_color: string;
  unlocked?: boolean;
  unlocked_date?: string;
  type?: string;
  progress?: number;
};

export type MealPlanMeal = {
  day: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_name: string;
  ingredients: string[];
  prep_time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPlanGroceryItem = {
  item: string;
  quantity: string;
  purchased: boolean;
};

export type MealPlan = {
  id: string;
  week_start_date: string;
  meals: MealPlanMeal[];
  grocery_list: MealPlanGroceryItem[];
  total_cost_estimate: number;
};

export type RecoveryScore = {
  id: string;
  date: string;
  overall_score: number;
  sleep_score: number;
  nutrition_score: number;
  workout_load_score: number;
  readiness: "ready" | "moderate" | "rest";
  recommendations: string[];
  suggested_workout_intensity: "high" | "moderate" | "low" | "active_recovery";
};

export type MoodLogEntry = {
  id: string;
  mood: "energized" | "balanced" | "tired" | "stressed" | "sore" | "low" | "custom";
  custom_mood?: string;
  energy_level?: "low" | "moderate" | "high";
  stress_level?: "low" | "moderate" | "high";
  motivation_level?: "low" | "moderate" | "high";
  soreness_level?: "low" | "moderate" | "high";
  sleep_quality?: "poor" | "fair" | "good" | "excellent";
  tags: string[];
  note?: string;
  context?: string;
  createdAt: string;
};

export type PlanExercise = {
  name: string;
  sets?: number;
  reps?: number;
  tempo?: string;
  rest_seconds?: number;
  notes?: string;
};

export type PlanSession = {
  name: string;
  focus: string;
  duration_minutes: number;
  intensity: "low" | "moderate" | "high" | "custom";
  modality?: string;
  guidance?: string;
  exercises: PlanExercise[];
};

export type PlanDay = {
  day: string;
  emphasis: string;
  sessions: PlanSession[];
  recovery?: {
    focus: string;
    duration_minutes?: number;
    notes?: string;
  };
  mindset?: string;
};

export type NutritionPlan = {
  calories_target: number;
  macro_split: {
    protein: number;
    carbs: number;
    fat: number;
  };
  hydration_ml: number;
  meals: Array<{
    name: string;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "custom";
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    ingredients: string[];
    notes?: string;
  }>;
  snacks?: NutritionPlan["meals"];
  supplements?: string[];
  guidance?: string[];
};

export type LifestylePlan = {
  sleep: {
    target_hours: number;
    wind_down_rituals: string[];
  };
  mood_support: string[];
  recovery_focus: string[];
  micro_habits: string[];
};

export type PersonalizedPlan = {
  id: string;
  source: "external" | "fallback" | "hybrid";
  generated_reason: string;
  workout_plan: {
    focus_summary: string;
    schedule: PlanDay[];
  };
  nutrition_plan: NutritionPlan;
  lifestyle_plan: LifestylePlan;
  readiness_score?: number | null;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

export type DemoUser = {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  first_name?: string;
  last_name?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  body_type?: string;
  primary_goal?: string;
  secondary_goal?: string;
  goal_reason?: string;
  fitness_goal: string;
  experience_level: string;
  target_weight: number;
  daily_calorie_target: number;
  daily_protein_target: number;
  daily_carbs_target: number;
  daily_fat_target: number;
  daily_water_target_ml: number;
  sleep_target_hours: number;
  current_streak: number;
  longest_streak: number;
  dietary_preference: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  favorite_foods?: string[];
  avoid_foods?: string[];
  preferred_cuisines?: string[];
  activity_level?: string;
  available_equipment?: string[];
  workout_environment?: string;
  preferred_training_time?: string;
  motivation_style?: string;
  mood_tags?: string[];
  stress_level?: string;
  injuries?: string[];
  medical_conditions?: string[];
  lifestyle_notes?: string;
  hydration_focus?: string;
  sleep_challenges?: string[];
  ai_persona?: string;
  support_expectations?: string;
  profile_completed?: boolean;
  age?: number;
};

export const demoUser: DemoUser = {
  id: "user-demo",
  email: "demo@fitflow.ai",
  full_name: "Jordan Carter",
  first_name: "Jordan",
  last_name: "Carter",
  gender: "male",
  role: "user",
  height_cm: 180,
  weight_kg: 79,
  body_type: "mesomorph",
  primary_goal: "build_muscle",
  secondary_goal: "improve_endurance",
  goal_reason: "Preparing for a hybrid athlete competition while staying photo-shoot ready.",
  fitness_goal: "Lean muscle gain",
  experience_level: "intermediate",
  target_weight: 175,
  daily_calorie_target: 2400,
  daily_protein_target: 180,
  daily_carbs_target: 220,
  daily_fat_target: 70,
  daily_water_target_ml: 3000,
  sleep_target_hours: 7.5,
  current_streak: 5,
  longest_streak: 18,
  dietary_preference: "high-protein",
  dietary_restrictions: ["lactose-light"],
  allergies: ["peanuts"],
  favorite_foods: ["grilled salmon", "sweet potato mash", "citrus bowls"],
  avoid_foods: ["fried foods"],
  preferred_cuisines: ["mediterranean", "japanese"],
  activity_level: "moderately_active",
  available_equipment: ["barbell", "dumbbell", "kettlebell", "medicine ball", "bodyweight"],
  workout_environment: "performance gym",
  preferred_training_time: "early_morning",
  motivation_style: "data_and_story-driven",
  mood_tags: ["creative", "competitive"],
  stress_level: "moderate",
  injuries: ["mild right shoulder tightness"],
  medical_conditions: [],
  lifestyle_notes: "Travels twice a month; enjoys outdoor endurance adventures.",
  hydration_focus: "target 3.2L with electrolytes on double session days",
  sleep_challenges: ["late-evening blue light"],
  ai_persona: "coach_like_pep_talks_with_hard_data",
  support_expectations: "Wants proactive plan nudges when travel disrupts routine.",
  profile_completed: true,
  age: 30,
};

export const sampleWorkoutSessions: WorkoutSession[] = [
  {
    id: "ws-1",
    workout_name: "Push Power Session",
    workout_type: "strength",
    duration_minutes: 62,
    calories_burned: 540,
    date: dateString(0),
    overall_rpe: 7,
    energy_level: "moderate",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: 6, weight: 205 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 70 },
      { name: "Cable Fly", sets: 3, reps: 15, weight: 30 },
      { name: "Triceps Rope Pushdown", sets: 3, reps: 12, weight: 45 },
    ],
    notes: "Felt strong, slight shoulder tightness on last set",
  },
  {
    id: "ws-2",
    workout_name: "Metabolic Conditioning",
    workout_type: "cardio",
    duration_minutes: 35,
    calories_burned: 410,
    date: dateString(1),
    overall_rpe: 8,
    energy_level: "high",
    exercises: [
      { name: "Assault Bike", sets: 5, reps: 45, notes: "45s on / 45s off" },
      { name: "Burpee Box Jumps", sets: 4, reps: 12 },
      { name: "Kettlebell Swings", sets: 4, reps: 15, weight: 24 },
    ],
    notes: "Great sweat, HR peaked at 180",
  },
  {
    id: "ws-3",
    workout_name: "Lower Body Strength",
    workout_type: "strength",
    duration_minutes: 58,
    calories_burned: 520,
    date: dateString(2),
    overall_rpe: 6,
    energy_level: "moderate",
    exercises: [
      { name: "Back Squat", sets: 4, reps: 5, weight: 255 },
      { name: "Romanian Deadlift", sets: 3, reps: 8, weight: 225 },
      { name: "Walking Lunges", sets: 3, reps: 12, weight: 50 },
      { name: "Calf Raises", sets: 4, reps: 15, weight: 90 },
    ],
    notes: "Solid depth, focus on bracing",
  },
  {
    id: "ws-4",
    workout_name: "Mobility + Core Flow",
    workout_type: "flexibility",
    duration_minutes: 40,
    calories_burned: 210,
    date: dateString(3),
    overall_rpe: 4,
    energy_level: "high",
    exercises: [
      { name: "Sun Salutation Flow", sets: 3, reps: 12 },
      { name: "Pike Walkouts", sets: 3, reps: 10 },
      { name: "Pallof Press", sets: 3, reps: 15, weight: 25 },
    ],
    notes: "Helped reduce hamstring tightness",
  },
  {
    id: "ws-5",
    workout_name: "Tempo Run",
    workout_type: "cardio",
    duration_minutes: 45,
    calories_burned: 480,
    date: dateString(4),
    overall_rpe: 7,
    energy_level: "moderate",
    exercises: [{ name: "5K Tempo Run", sets: 1, reps: 1, notes: "Maintained 7:20 pace" }],
    notes: "Paced well, felt consistent",
  },
];

export const sampleNutritionLogs: NutritionLog[] = [
  {
    id: "meal-1",
    meal_name: "Protein Berry Oats",
    meal_type: "breakfast",
    calories: 520,
    protein: 42,
    carbs: 58,
    fat: 16,
    date: dateString(0),
    time: timeString(7, 30),
  },
  {
    id: "meal-2",
    meal_name: "Grilled Salmon Bowl",
    meal_type: "lunch",
    calories: 640,
    protein: 48,
    carbs: 52,
    fat: 22,
    date: dateString(0),
    time: timeString(12, 45),
  },
  {
    id: "meal-3",
    meal_name: "Greek Yogurt + Almonds",
    meal_type: "snack",
    calories: 220,
    protein: 18,
    carbs: 14,
    fat: 8,
    date: dateString(0),
    time: timeString(16, 0),
  },
  {
    id: "meal-4",
    meal_name: "Chicken Quinoa Power Bowl",
    meal_type: "dinner",
    calories: 710,
    protein: 54,
    carbs: 62,
    fat: 24,
    date: dateString(0),
    time: timeString(19, 15),
  },
  {
    id: "meal-5",
    meal_name: "Overnight Oats",
    meal_type: "breakfast",
    calories: 480,
    protein: 35,
    carbs: 55,
    fat: 14,
    date: dateString(1),
    time: timeString(7, 20),
  },
];

export const sampleSleepLogs: SleepLog[] = [
  { id: "sleep-1", date: dateString(0), duration_hours: 7.4, sleep_quality: "good" },
  { id: "sleep-2", date: dateString(1), duration_hours: 7.1, sleep_quality: "good" },
  { id: "sleep-3", date: dateString(2), duration_hours: 6.8, sleep_quality: "fair" },
  { id: "sleep-4", date: dateString(3), duration_hours: 8.0, sleep_quality: "excellent" },
  { id: "sleep-5", date: dateString(4), duration_hours: 7.6, sleep_quality: "good" },
];

export const sampleWaterLogs: WaterLog[] = [
  { id: "water-1", date: dateString(0), amount_ml: 500, time: timeString(8, 0) },
  { id: "water-2", date: dateString(0), amount_ml: 750, time: timeString(11, 0) },
  { id: "water-3", date: dateString(0), amount_ml: 600, time: timeString(14, 30) },
  { id: "water-4", date: dateString(0), amount_ml: 700, time: timeString(18, 0) },
];

export const sampleInsights: AIInsight[] = [
  {
    id: "insight-1",
    date: dateString(0),
    type: "motivation",
    title: "Protein Consistency Wins",
    message: "You've hit over 180g of protein for 4 straight days. This is accelerating your recovery and muscle gain.",
    priority: "medium",
    action_items: [
      "Continue prioritizing a lean protein source every meal",
      "Add a post-workout shake within 30 minutes of lifting",
      "Prep tomorrow's lunch tonight to stay ahead",
    ],
    read: false,
  },
  {
    id: "insight-2",
    date: dateString(1),
    type: "recovery",
    title: "Schedule Active Recovery",
    message: "Your training load has been high this week. Plan a mobility session to stay fresh.",
    priority: "high",
    action_items: [
      "Add a 20-minute mobility flow tomorrow",
      "Focus on nasal breathing walks to lower stress",
      "Hydrate with electrolytes after evening sessions",
    ],
    read: false,
  },
  {
    id: "insight-3",
    date: dateString(2),
    type: "workout",
    title: "Strength Trend",
    message: "Bench press volume increased 8% compared to last week. Maintain tempo control to keep joints happy.",
    priority: "medium",
    action_items: [
      "Stay within RPE 7-8 for compound lifts",
      "Add 2 sets of face pulls post-session",
      "Log perceived shoulder stability after each push day",
    ],
    read: true,
  },
];

export const sampleExercises: Exercise[] = [
  {
    id: "exercise-1",
    name: "Barbell Back Squat",
    category: "strength",
    difficulty: "intermediate",
    description: "A compound movement targeting the quadriceps, glutes, and core for lower-body strength.",
    instructions: [
      "Set the barbell at mid-chest height.",
      "Unrack with feet shoulder-width apart.",
      "Descend until thighs are parallel to the floor, keeping chest up.",
      "Drive through heels to return to standing.",
    ],
    muscle_groups: ["quadriceps", "glutes", "core", "hamstrings"],
    equipment: ["barbell", "rack"],
    form_cues: [
      "Keep knees tracking over toes",
      "Brace core before each descent",
      "Maintain neutral spine through the movement",
    ],
  },
  {
    id: "exercise-2",
    name: "Romanian Deadlift",
    category: "strength",
    difficulty: "intermediate",
    description: "Hip hinge movement emphasizing hamstrings and posterior chain strength.",
    instructions: [
      "Stand tall holding barbell at hips.",
      "Push hips back while keeping bar close to legs.",
      "Lower until hamstrings stretch, then drive hips forward to stand.",
    ],
    muscle_groups: ["hamstrings", "glutes", "lower back"],
    equipment: ["barbell"],
    form_cues: ["Keep slight bend in knees", "Maintain neutral spine", "Squeeze glutes at the top"],
  },
  {
    id: "exercise-3",
    name: "Assault Bike Intervals",
    category: "cardio",
    difficulty: "advanced",
    description: "High-intensity interval protocol for conditioning and calorie burn.",
    instructions: [
      "Sprint hard for prescribed interval.",
      "Maintain tight core and drive through legs and arms.",
      "Recover with easy pedaling between efforts.",
    ],
    muscle_groups: ["full body"],
    equipment: ["assault bike"],
    form_cues: ["Keep shoulders relaxed", "Drive elbows back", "Stay tall on the seat"],
  },
  {
    id: "exercise-4",
    name: "Mobility Flow",
    category: "flexibility",
    difficulty: "beginner",
    description: "Dynamic sequence to improve hip and thoracic mobility.",
    instructions: [
      "Move slowly through each position.",
      "Hold end range for 2 breaths.",
      "Repeat flow for prescribed sets.",
    ],
    muscle_groups: ["hips", "thoracic spine"],
    form_cues: ["Breathe through transitions", "Focus on long spine"],
  },
  {
    id: "exercise-5",
    name: "Plank with Row",
    category: "core",
    difficulty: "intermediate",
    description: "Core stability drill combining anti-rotation and scapular strength.",
    instructions: [
      "Start in high plank with dumbbells.",
      "Row one dumbbell towards hip without twisting.",
      "Alternate sides keeping hips square.",
    ],
    muscle_groups: ["core", "back", "shoulders"],
    equipment: ["dumbbells"],
    form_cues: ["Squeeze glutes to stabilize", "Press floor away", "Minimal hip sway"],
  },
  {
    id: "exercise-6",
    name: "Walking Lunges",
    category: "strength",
    difficulty: "beginner",
    description: "Dynamic lunge pattern building unilateral leg strength and stability.",
    instructions: [
      "Step forward into a lunge lowering the back knee toward the floor.",
      "Drive through the front heel to stand and swing the back leg forward.",
      "Repeat alternating legs for desired distance or reps.",
    ],
    muscle_groups: ["quadriceps", "glutes", "hamstrings", "core"],
    equipment: ["dumbbells"],
    form_cues: ["Keep chest lifted", "Take long controlled steps", "Push through the front heel"],
  },
  {
    id: "exercise-7",
    name: "Pull-Up",
    category: "strength",
    difficulty: "advanced",
    description: "Bodyweight pull emphasizing lats, upper back, and grip strength.",
    instructions: [
      "Hang from a bar with hands slightly wider than shoulder-width.",
      "Drive elbows down and back to lift the chin over the bar.",
      "Lower under control until arms are fully extended.",
    ],
    muscle_groups: ["lats", "biceps", "upper back", "core"],
    equipment: ["pull-up bar"],
    form_cues: ["Keep ribs down", "Lead with the chest", "Squeeze shoulder blades at the top"],
  },
  {
    id: "exercise-8",
    name: "Single-Leg Romanian Deadlift",
    category: "strength",
    difficulty: "intermediate",
    description: "Unilateral hinge improving posterior chain strength and balance.",
    instructions: [
      "Hold a dumbbell in the opposite hand of the working leg.",
      "Hinge at the hips while the free leg extends straight back.",
      "Keep hips square and return to standing by driving through the planted heel.",
    ],
    muscle_groups: ["hamstrings", "glutes", "core"],
    equipment: ["dumbbell"],
    form_cues: ["Keep a micro-bend in the knee", "Reach the back heel long", "Maintain level hips"],
  },
  {
    id: "exercise-9",
    name: "Kettlebell Swing",
    category: "cardio",
    difficulty: "intermediate",
    description: "Explosive hinge pattern building hip power and conditioning.",
    instructions: [
      "Hinge to hike the kettlebell between the legs.",
      "Snap the hips forward to float the bell to chest height.",
      "Guide the bell back between the legs maintaining a neutral spine.",
    ],
    muscle_groups: ["glutes", "hamstrings", "core", "shoulders"],
    equipment: ["kettlebell"],
    form_cues: ["Power comes from hips", "Keep spine neutral", "Squeeze glutes at the top"],
  },
  {
    id: "exercise-10",
    name: "Box Jump",
    category: "plyometric",
    difficulty: "intermediate",
    description: "Explosive jump to develop lower-body power and coordination.",
    instructions: [
      "Stand an arm's length from the box with feet hip-width apart.",
      "Dip into a quarter squat and swing arms forward to jump onto the box.",
      "Land softly, stand tall, then step down under control.",
    ],
    muscle_groups: ["quadriceps", "glutes", "calves", "core"],
    equipment: ["plyo box"],
    form_cues: ["Absorb landing softly", "Use full arm swing", "Keep knees aligned over toes"],
  },
  {
    id: "exercise-11",
    name: "Battle Rope Slams",
    category: "cardio",
    difficulty: "beginner",
    description: "High-output conditioning drill taxing shoulders, core, and grip.",
    instructions: [
      "Hold one rope in each hand with knees slightly bent.",
      "Raise arms overhead and slam ropes to the floor with power.",
      "Alternate between double slams and alternating waves.",
    ],
    muscle_groups: ["shoulders", "core", "forearms"],
    equipment: ["battle ropes"],
    form_cues: ["Keep rib cage stacked", "Drive from hips", "Maintain rhythmic breathing"],
  },
  {
    id: "exercise-12",
    name: "Turkish Get-Up",
    category: "strength",
    difficulty: "advanced",
    description: "Full-body stability drill improving shoulder control and core strength.",
    instructions: [
      "Lie flat holding a kettlebell locked out above chest.",
      "Roll to elbow, then hand, and bridge hips high.",
      "Sweep the leg under into a lunge and stand tall with bell overhead.",
    ],
    muscle_groups: ["shoulders", "core", "hips"],
    equipment: ["kettlebell"],
    form_cues: ["Keep eyes on the kettlebell", "Move slow and deliberate", "Punch knuckles to the sky"],
  },
  {
    id: "exercise-13",
    name: "Sled Push",
    category: "cardio",
    difficulty: "intermediate",
    description: "Total-body conditioning finisher building leg drive and work capacity.",
    instructions: [
      "Grip sled handles with arms extended.",
      "Drive knees forward in powerful steps keeping torso at 45 degrees.",
      "Push for set distance or time, rest, and repeat.",
    ],
    muscle_groups: ["quadriceps", "glutes", "calves", "core"],
    equipment: ["sled"],
    form_cues: ["Stay tall through spine", "Drive knees aggressively", "Keep consistent breathing"],
  },
  {
    id: "exercise-14",
    name: "Dumbbell Bench Press",
    category: "strength",
    difficulty: "beginner",
    description: "Horizontal press variation developing chest and triceps strength.",
    instructions: [
      "Lie back with dumbbells pressed above chest, palms forward.",
      "Lower elbows at ~45° until forearms are vertical.",
      "Press dumbbells back to start squeezing chest.",
    ],
    muscle_groups: ["chest", "triceps", "shoulders"],
    equipment: ["dumbbells", "bench"],
    form_cues: ["Maintain slight arch", "Keep wrists stacked", "Drive feet into floor"],
  },
  {
    id: "exercise-15",
    name: "Seated Cable Row",
    category: "strength",
    difficulty: "beginner",
    description: "Horizontal pull targeting mid-back and posterior shoulder strength.",
    instructions: [
      "Sit tall with knees slightly bent holding the cable handle.",
      "Pull handle toward navel while squeezing shoulder blades together.",
      "Control the return without rounding shoulders.",
    ],
    muscle_groups: ["upper back", "lats", "biceps"],
    equipment: ["cable machine"],
    form_cues: ["Keep chest proud", "Lead with elbows", "Pause at full squeeze"],
  },
  {
    id: "exercise-16",
    name: "Pallof Press",
    category: "core",
    difficulty: "beginner",
    description: "Anti-rotation drill that builds core stability and posture.",
    instructions: [
      "Stand perpendicular to a cable stack holding the handle at chest height.",
      "Press the handle straight out resisting rotation.",
      "Hold briefly before returning to chest.",
    ],
    muscle_groups: ["core", "obliques"],
    equipment: ["cable machine", "resistance band"],
    form_cues: ["Keep hips squared", "Brace ribs down", "Slow tempo with control"],
  },
  {
    id: "exercise-17",
    name: "Farmer's Carry",
    category: "strength",
    difficulty: "beginner",
    description: "Loaded carry developing grip strength, posture, and core endurance.",
    instructions: [
      "Pick up heavy dumbbells or kettlebells and stand tall.",
      "Walk with controlled steps maintaining upright posture.",
      "Turn carefully and walk back to start.",
    ],
    muscle_groups: ["forearms", "shoulders", "core", "glutes"],
    equipment: ["dumbbells", "kettlebells"],
    form_cues: ["Keep shoulders packed", "Walk tall—no leaning", "Breathe steadily"],
  },
  {
    id: "exercise-18",
    name: "Medicine Ball Rotational Throw",
    category: "plyometric",
    difficulty: "intermediate",
    description: "Explosive rotational power drill for athletes and lifters.",
    instructions: [
      "Stand side-on to a wall holding a med ball at chest height.",
      "Rotate hips and torso quickly to hurl the ball into the wall.",
      "Catch on the rebound, reset, and repeat explosively.",
    ],
    muscle_groups: ["core", "hips", "shoulders"],
    equipment: ["medicine ball"],
    form_cues: ["Drive from the hips", "Finish with arms long", "Stay light on lead foot"],
  },
  {
    id: "exercise-19",
    name: "Glute Bridge March",
    category: "strength",
    difficulty: "beginner",
    description: "Posterior chain drill that challenges glute activation and hip stability.",
    instructions: [
      "Lie on back with knees bent, feet hip-width apart.",
      "Press hips up and hold the bridge while alternating knee lifts.",
      "Keep hips level as you march in place.",
    ],
    muscle_groups: ["glutes", "hamstrings", "core"],
    equipment: [],
    form_cues: ["Drive through heels", "Keep ribs down", "Move slow and controlled"],
  },
  {
    id: "exercise-20",
    name: "Landmine Press",
    category: "strength",
    difficulty: "intermediate",
    description: "Diagonal press pattern strengthening shoulders and core.",
    instructions: [
      "Set barbell in a landmine attachment and hold at shoulder height.",
      "Press bar up and forward in an arc locking out elbow.",
      "Control the return keeping core braced.",
    ],
    muscle_groups: ["shoulders", "triceps", "core"],
    equipment: ["landmine", "barbell"],
    form_cues: ["Keep ribs stacked", "Drive through the floor", "Reach long at the top"],
  },
  {
    id: "exercise-21",
    name: "Sprint Intervals",
    category: "cardio",
    difficulty: "advanced",
    description: "All-out running intervals to develop speed and VO2 max.",
    instructions: [
      "Warm up thoroughly with dynamic drills.",
      "Sprint at near max effort for 10-20 seconds.",
      "Walk or jog for 60-90 seconds before repeating.",
    ],
    muscle_groups: ["lower body", "cardiovascular"],
    equipment: ["track", "treadmill"],
    form_cues: ["Relax shoulders", "Drive arms powerfully", "Stay tall with fast turnover"],
  },
  {
    id: "exercise-22",
    name: "90/90 Hip Flow",
    category: "flexibility",
    difficulty: "beginner",
    description: "Mobility flow targeting hip rotation and posture.",
    instructions: [
      "Sit in 90/90 position with one leg in front, one behind.",
      "Rotate torso over front shin and hinge forward.",
      "Switch sides slowly and repeat for breaths.",
    ],
    muscle_groups: ["hips", "glutes", "lower back"],
    equipment: [],
    form_cues: ["Keep spine long", "Move with the breath", "Stay relaxed in shoulders"],
  },
  {
    id: "exercise-23",
    name: "Bear Crawl",
    category: "cardio",
    difficulty: "beginner",
    description: "Quadruped locomotion drill improving core strength and coordination.",
    instructions: [
      "Start on all fours with knees hovering just off the floor.",
      "Move opposite hand and foot forward maintaining low hips.",
      "Crawl for distance, keeping movements smooth and controlled.",
    ],
    muscle_groups: ["core", "shoulders", "hips"],
    equipment: [],
    form_cues: ["Keep knees close to floor", "Brace core to resist rotation", "Move quietly"],
  },
];

export const sampleWorkoutBuddies: WorkoutBuddy[] = [
  {
    id: "buddy-1",
    buddy_email: "melissa@fitcrew.com",
    buddy_name: "Melissa",
    status: "active",
    shared_goals: ["Run sub 50 min 10K", "3x weekly strength"],
    weekly_checkins: 3,
  },
  {
    id: "buddy-2",
    buddy_email: "coachd@fitflow.ai",
    buddy_name: "Coach D",
    status: "active",
    shared_goals: ["Maintain streak", "Sleep >7h"],
    weekly_checkins: 2,
  },
];

export const sampleChallenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Spring Strength Sprint",
    description: "Complete 12 strength sessions in 4 weeks focusing on compound lifts.",
    target: "12 workouts",
    participants: ["Jordan", "Melissa", "Alex", "Taylor"],
    start_date: dateString(7),
    end_date: dateString(-21),
    prize: "$150 gear voucher",
    is_community: true,
  },
  {
    id: "challenge-2",
    title: "Hydration Mastery",
    description: "Drink at least 3L of water daily for 21 consecutive days.",
    target: "21 days",
    participants: ["Jordan", "Dana", "Chris"],
    start_date: dateString(5),
    end_date: dateString(-16),
    is_community: true,
  },
];

export const sampleAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "Streak Crusher",
    description: "Logged workouts 14 days in a row.",
    earned_at: dateString(3),
    badge_color: "from-indigo-500 to-purple-600",
    unlocked: true,
    unlocked_date: dateString(3),
    type: "streak",
    progress: 100,
  },
  {
    id: "ach-2",
    title: "Hydration Hero",
    description: "Met hydration goal for 10 consecutive days.",
    earned_at: dateString(5),
    badge_color: "from-cyan-500 to-blue-500",
    unlocked: true,
    unlocked_date: dateString(5),
    type: "hydration",
    progress: 100,
  },
  {
    id: "ach-3",
    title: "Protein Pro",
    description: "Averaged 180g protein for a week.",
    earned_at: dateString(8),
    badge_color: "from-emerald-500 to-teal-500",
    unlocked: false,
    type: "nutrition",
    progress: 65,
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const mealsPerDay: MealPlanMeal[] = days.flatMap((day) => [
  {
    day,
    meal_type: "breakfast",
    recipe_name: `${day} Fuel Oats`,
    ingredients: ["rolled oats", "whey protein", "berries", "almond butter"],
    prep_time: 10,
    calories: 520,
    protein: 42,
    carbs: 58,
    fat: 15,
  },
  {
    day,
    meal_type: "lunch",
    recipe_name: `${day} Power Bowl`,
    ingredients: ["quinoa", "grilled chicken", "roasted vegetables", "olive oil"],
    prep_time: 25,
    calories: 640,
    protein: 48,
    carbs: 55,
    fat: 20,
  },
  {
    day,
    meal_type: "dinner",
    recipe_name: `${day} Recovery Plate`,
    ingredients: ["salmon", "sweet potato", "broccoli", "mixed greens"],
    prep_time: 30,
    calories: 680,
    protein: 50,
    carbs: 48,
    fat: 24,
  },
]);

export const sampleMealPlan: MealPlan = {
  id: "meal-plan-1",
  week_start_date: dateString(0),
  meals: mealsPerDay,
  grocery_list: [
    { item: "Rolled oats", quantity: "2 lbs", purchased: false },
    { item: "Chicken breast", quantity: "8 pieces", purchased: false },
    { item: "Salmon fillets", quantity: "6 fillets", purchased: true },
    { item: "Sweet potatoes", quantity: "5 lb bag", purchased: false },
    { item: "Mixed greens", quantity: "4 boxes", purchased: false },
  ],
  total_cost_estimate: 145,
};

export const sampleRecoveryScores: RecoveryScore[] = [
  {
    id: "recovery-1",
    date: dateString(0),
    overall_score: 82,
    sleep_score: 78,
    nutrition_score: 85,
    workout_load_score: 76,
    readiness: "ready",
    recommendations: [
      "Maintain hydration pace—aim for 750ml every four hours",
      "Include light mobility work before today's session",
      "Prioritize a recovery meal with 40g protein post workout",
    ],
    suggested_workout_intensity: "moderate",
  },
];

export const sampleMoodLogs: MoodLogEntry[] = [
  {
    id: "mood-1",
    mood: "energized",
    energy_level: "high",
    stress_level: "moderate",
    motivation_level: "high",
    soreness_level: "moderate",
    sleep_quality: "good",
    tags: ["post-strength", "sunrise-session"],
    note: "Felt powerful under the bar. Slight shoulder tightness resolved after mobility.",
    context: "Strength Day",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mood-2",
    mood: "balanced",
    energy_level: "moderate",
    stress_level: "moderate",
    motivation_level: "moderate",
    soreness_level: "low",
    sleep_quality: "excellent",
    tags: ["outdoor-run", "gratitude"],
    note: "Long trail run felt meditative. Planning to add more breath work mid-week.",
    context: "Endurance Play",
    createdAt: dateString(1),
  },
  {
    id: "mood-3",
    mood: "stressed",
    energy_level: "low",
    stress_level: "high",
    motivation_level: "moderate",
    soreness_level: "moderate",
    sleep_quality: "fair",
    tags: ["travel-day", "tight-deadline"],
    note: "Workload heavy. Need extra sleep and a mobility reset tomorrow.",
    context: "Recovery Day",
    createdAt: dateString(2),
  },
];

export const samplePersonalizedPlan: PersonalizedPlan = {
  id: "plan-demo",
  source: "hybrid",
  generated_reason: "demo-seeded-plan",
  workout_plan: {
    focus_summary: "Hybrid strength & engine cycle balancing performance gains with elevated recovery practices.",
    schedule: [
      {
        day: "Monday",
        emphasis: "Upper Strength Acceleration",
        sessions: [
          {
            name: "Push Compound Focus",
            focus: "upper_push",
            duration_minutes: 55,
            intensity: "high",
            modality: "strength",
            guidance: "Control tempo at 3-1-1. Track bar speed on final sets and stop at RPE 8.",
            exercises: [
              { name: "Barbell Bench Press", sets: 5, reps: 5, tempo: "3-1-1", rest_seconds: 120 },
              { name: "Incline Dumbbell Press", sets: 4, reps: 10, rest_seconds: 90 },
              { name: "Single-Arm Landmine Press", sets: 3, reps: 12, notes: "Focus on scapular control." },
              { name: "Tempo Push-Up Ladder", sets: 3, reps: 12, tempo: "2-1-2" },
            ],
          },
          {
            name: "Metabolic Booster",
            focus: "conditioning",
            duration_minutes: 14,
            intensity: "high",
            modality: "anaerobic intervals",
            guidance: "Bike or rower: 45s hard / 45s easy x 7. Keep nasal breathing on recoveries.",
            exercises: [
              { name: "Assault Bike Sprint Intervals", sets: 7, reps: 45, notes: "45s on / 45s off" },
              { name: "Copenhagen Plank Pulses", sets: 3, reps: 30, notes: "Optional finisher" },
            ],
          },
        ],
        recovery: {
          focus: "Shoulder + T-spine reset",
          duration_minutes: 12,
          notes: "Band dislocates, wall slides, open books.",
        },
        mindset: "End session with a 90-second visualization of tomorrow's training win.",
      },
      {
        day: "Wednesday",
        emphasis: "Lower Power & Posterior Chain",
        sessions: [
          {
            name: "Strength Foundations",
            focus: "lower_strength",
            duration_minutes: 60,
            intensity: "high",
            modality: "strength",
            guidance: "Drive through mid-foot, brace hard. Track tempo for RDL eccentric.",
            exercises: [
              { name: "Back Squat", sets: 4, reps: 6, tempo: "3-1-1", rest_seconds: 150 },
              { name: "Romanian Deadlift", sets: 4, reps: 8, tempo: "3-1-1", rest_seconds: 120 },
              { name: "Walking Lunges", sets: 3, reps: 12, notes: "Controlled pace, keep chest tall." },
              { name: "Heels-Elevated Goblet Squat Pulse", sets: 3, reps: 15 },
            ],
          },
          {
            name: "Posterior Chain Aux",
            focus: "posterior_chain",
            duration_minutes: 18,
            intensity: "moderate",
            modality: "accessory",
            guidance: "Slow tempo, own each hinge. Finish with calf raises for tendon resilience.",
            exercises: [
              { name: "Single-Leg RDL", sets: 3, reps: 12 },
              { name: "Glute Bridge Iso Holds", sets: 3, reps: 45, notes: "3 second squeeze per rep." },
              { name: "Standing Calf Raises", sets: 4, reps: 15 },
            ],
          },
        ],
        recovery: {
          focus: "Contrast shower or plunges",
          duration_minutes: 10,
          notes: "2 rounds hot/cold to refresh nervous system.",
        },
      },
      {
        day: "Saturday",
        emphasis: "Mobility + Creative Conditioning",
        sessions: [
          {
            name: "Mobility Flow",
            focus: "mobility",
            duration_minutes: 35,
            intensity: "low",
            modality: "mobility",
            guidance: "Start with CARs, move into 90/90 work, finish with flow sequence.",
            exercises: [
              { name: "Controlled Articular Rotations", sets: 3, reps: 10 },
              { name: "90/90 Transitions", sets: 3, reps: 12 },
              { name: "World's Greatest Stretch Flow", sets: 3, reps: 14 },
            ],
          },
          {
            name: "Adventure Session",
            focus: "conditioning",
            duration_minutes: 45,
            intensity: "moderate",
            modality: "zone2_endurance",
            guidance: "Outdoor ride or trail run in zone 2. Hold posture tall, breathe through nose.",
            exercises: [
              { name: "Zone 2 Endurance Play", sets: 1, reps: 45, notes: "Stay 120-140 bpm." },
            ],
          },
        ],
        recovery: {
          focus: "Sunlight gratitude walk",
          duration_minutes: 15,
          notes: "No phone. Capture three highlights from the week.",
        },
        mindset: "Log one curiosity you want the AI coach to explore next week.",
      },
    ],
  },
  nutrition_plan: {
    calories_target: 2400,
    macro_split: { protein: 180, carbs: 240, fat: 70 },
    hydration_ml: 3200,
    meals: [
      {
        name: "Protein Berry Oats",
        meal_type: "breakfast",
        calories: 520,
        protein: 40,
        carbs: 62,
        fat: 14,
        fiber: 10,
        ingredients: ["rolled oats", "whey protein", "blueberries", "chia seeds", "almond butter"],
        notes: "Swap whey for plant protein on vegan days.",
      },
      {
        name: "Seared Salmon Power Bowl",
        meal_type: "lunch",
        calories: 620,
        protein: 45,
        carbs: 55,
        fat: 22,
        fiber: 8,
        ingredients: ["salmon", "quinoa", "roasted broccoli", "avocado", "pickled onions"],
      },
      {
        name: "Herbed Chicken Harvest Plate",
        meal_type: "dinner",
        calories: 680,
        protein: 48,
        carbs: 65,
        fat: 22,
        fiber: 9,
        ingredients: ["grilled chicken", "sweet potato mash", "brussels sprouts", "olive oil drizzle"],
      },
    ],
    snacks: [
      {
        name: "Greek Yogurt Crunch",
        meal_type: "snack",
        calories: 220,
        protein: 22,
        carbs: 18,
        fat: 8,
        fiber: 3,
        ingredients: ["2% greek yogurt", "pistachios", "cacao nibs", "kiwi"],
      },
      {
        name: "Post-Session Recovery Smoothie",
        meal_type: "snack",
        calories: 360,
        protein: 32,
        carbs: 45,
        fat: 9,
        fiber: 6,
        ingredients: ["plant protein", "banana", "spinach", "spirulina", "coconut water"],
      },
    ],
    supplements: ["Creatine 5g", "Vitamin D3 + K2", "Omega-3 (1.5g EPA/DHA)", "Electrolytes on double days"],
    guidance: [
      "Anchor each plate with colour, protein, and ferment to support gut diversity.",
      "Fuel workouts with 35g slow carbs 60 minutes prior on intensity days.",
      "Log plate photos with the AI scanner to keep macros adaptive.",
    ],
  },
  lifestyle_plan: {
    sleep: {
      target_hours: 7.5,
      wind_down_rituals: [
        "Golden-hour sunset walk to signal circadian cues.",
        "Magnesium tea 45 minutes before bed, screens off 60 minutes prior.",
      ],
    },
    mood_support: [
      "Micro-journaling prompt: win, lesson, commitment every evening.",
      "3-minute breathing ladder (4-6-8) between meetings on high-stress days.",
    ],
    recovery_focus: [
      "Weekly mobility remix session with foam rolling and 90/90 transitions.",
      "Check HRV every Sunday; if trending down, swap Monday intensity for mobility focus.",
    ],
    micro_habits: [
      "Hydration pulse on waking: 500ml water + pinch of sea salt + squeeze of citrus.",
      "Capture mood + energy after each training session to teach the AI coach.",
      "Batch-prep power bowls on Sunday for mid-week resilience.",
    ],
  },
  readiness_score: 82,
  metadata: {
    version: 1,
    demo: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
