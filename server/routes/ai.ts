import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { callOpenAI, OpenAIUnavailableError, type ChatCompletionMessageParam } from "../utils/openai";
import { WorkoutSession } from "../models/WorkoutSession";
import { NutritionLog } from "../models/NutritionLog";
import { SleepLog } from "../models/SleepLog";
import { RecoveryScore } from "../models/RecoveryScore";

const router = Router();

router.use(authenticate);

type ExerciseCategory = "strength" | "cardio" | "flexibility" | "core" | "plyometric";
type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

type CoachExerciseRecommendation = {
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  description: string;
  why_this_exercise: string;
  instructions: string[];
  form_cues: string[];
  equipment: string[];
};

type CoachResponsePayload = {
  answer: string;
  tips: string[];
  recommended_exercises: CoachExerciseRecommendation[];
  follow_up_prompt: string;
};

const VALID_CATEGORIES: ExerciseCategory[] = ["strength", "cardio", "flexibility", "core", "plyometric"];
const VALID_DIFFICULTIES: ExerciseDifficulty[] = ["beginner", "intermediate", "advanced"];

const COACH_EXERCISE_LIBRARY: CoachExerciseRecommendation[] = [
  {
    name: "Barbell Back Squat",
    primary_muscle: "quadriceps",
    secondary_muscles: ["glutes", "core", "hamstrings"],
    category: "strength",
    difficulty: "intermediate",
    description: "Compound squat for leg strength and lower-body power.",
    why_this_exercise: "Builds knee-dominant strength and supports athletic performance.",
    instructions: [
      "Set the bar across upper traps and brace core.",
      "Sit hips down and back until thighs are parallel.",
      "Drive through mid-foot to stand while keeping chest tall.",
    ],
    form_cues: ["Brace before each rep", "Track knees over toes", "Keep neutral spine"],
    equipment: ["barbell", "rack"],
  },
  {
    name: "Romanian Deadlift",
    primary_muscle: "hamstrings",
    secondary_muscles: ["glutes", "lower back"],
    category: "strength",
    difficulty: "intermediate",
    description: "Hip hinge movement for posterior chain strength.",
    why_this_exercise: "Improves hinge mechanics and balances quad-dominant training.",
    instructions: [
      "Hold barbell at hips with a soft knee bend.",
      "Push hips back while keeping bar close to legs.",
      "Return by driving hips forward and squeezing glutes.",
    ],
    form_cues: ["Hinge, don’t squat", "Keep lats tight", "Maintain long spine"],
    equipment: ["barbell"],
  },
  {
    name: "Dumbbell Bench Press",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    category: "strength",
    difficulty: "beginner",
    description: "Horizontal pressing movement to build upper-body pushing strength.",
    why_this_exercise: "Direct chest stimulus with joint-friendly range of motion.",
    instructions: [
      "Lie on a bench with feet grounded.",
      "Lower dumbbells to chest with elbows at ~45 degrees.",
      "Press up under control and finish with stacked wrists.",
    ],
    form_cues: ["Keep shoulder blades retracted", "Avoid flared elbows", "Control the eccentric"],
    equipment: ["dumbbells", "bench"],
  },
  {
    name: "Pull-Up",
    primary_muscle: "lats",
    secondary_muscles: ["biceps", "upper back", "core"],
    category: "strength",
    difficulty: "advanced",
    description: "Vertical pull emphasizing upper-body strength and control.",
    why_this_exercise: "High-return back builder that improves pulling capacity.",
    instructions: [
      "Hang from bar with full arm extension.",
      "Pull elbows down and back until chin clears bar.",
      "Lower under control to full extension.",
    ],
    form_cues: ["Lead with chest", "Avoid excessive kipping", "Keep ribs down"],
    equipment: ["pull-up bar"],
  },
  {
    name: "Dumbbell Lateral Raise",
    primary_muscle: "shoulders",
    secondary_muscles: ["upper traps"],
    category: "strength",
    difficulty: "beginner",
    description: "Isolation movement to build lateral deltoid size and shoulder shape.",
    why_this_exercise: "Targets side delts for shoulder balance and aesthetics.",
    instructions: [
      "Stand tall with dumbbells at sides.",
      "Raise arms to shoulder height with slight elbow bend.",
      "Lower slowly without swinging.",
    ],
    form_cues: ["Lead with elbows", "Use controlled tempo", "Keep torso still"],
    equipment: ["dumbbells"],
  },
  {
    name: "Face Pull",
    primary_muscle: "rear delts",
    secondary_muscles: ["upper back", "rotator cuff"],
    category: "strength",
    difficulty: "beginner",
    description: "Cable pull for shoulder health and upper-back posture.",
    why_this_exercise: "Balances pressing work and supports shoulder stability.",
    instructions: [
      "Set rope at face height.",
      "Pull rope toward nose while externally rotating shoulders.",
      "Pause briefly then return with control.",
    ],
    form_cues: ["Keep elbows high", "Squeeze rear delts", "Avoid shrugging"],
    equipment: ["cable machine", "rope attachment"],
  },
  {
    name: "Plank with Row",
    primary_muscle: "core",
    secondary_muscles: ["back", "shoulders"],
    category: "core",
    difficulty: "intermediate",
    description: "Anti-rotation core drill with unilateral pulling challenge.",
    why_this_exercise: "Develops trunk stability and shoulder control.",
    instructions: [
      "Start in high plank with dumbbells.",
      "Row one side while minimizing hip shift.",
      "Alternate sides with steady breathing.",
    ],
    form_cues: ["Brace glutes and abs", "Keep hips square", "Move slowly"],
    equipment: ["dumbbells"],
  },
  {
    name: "Battle Rope Slams",
    primary_muscle: "conditioning",
    secondary_muscles: ["shoulders", "core", "arms"],
    category: "cardio",
    difficulty: "beginner",
    description: "High-output conditioning drill for power endurance.",
    why_this_exercise: "Raises heart rate quickly while training total-body output.",
    instructions: [
      "Assume athletic stance holding rope ends.",
      "Explosively slam ropes to floor repeatedly for interval.",
      "Rest and repeat for rounds.",
    ],
    form_cues: ["Stay braced", "Use hips and core", "Keep rhythm aggressive but controlled"],
    equipment: ["battle ropes"],
  },
  {
    name: "Hip Flexor Mobility Flow",
    primary_muscle: "hip flexors",
    secondary_muscles: ["glutes", "thoracic spine"],
    category: "flexibility",
    difficulty: "beginner",
    description: "Mobility sequence improving hip extension and movement quality.",
    why_this_exercise: "Reduces stiffness from sitting and improves squat/deadlift setup.",
    instructions: [
      "Move through half-kneeling lunge stretch.",
      "Add thoracic rotation over front leg.",
      "Repeat slow controlled reps each side.",
    ],
    form_cues: ["Keep pelvis tucked", "Breathe through range", "Avoid lumbar overextension"],
    equipment: ["bodyweight"],
  },
];

const MUSCLE_KEYWORDS: Array<{ muscle: string; pattern: RegExp }> = [
  { muscle: "chest", pattern: /\b(chest|pec|pectoral|bench)\b/i },
  { muscle: "back", pattern: /\b(back|lats?|latissimus|upper back|mid back)\b/i },
  { muscle: "shoulders", pattern: /\b(shoulder|delts?|rear delt)\b/i },
  { muscle: "arms", pattern: /\b(arms?|biceps?|triceps?)\b/i },
  { muscle: "quadriceps", pattern: /\b(quads?|quadriceps|thighs?)\b/i },
  { muscle: "hamstrings", pattern: /\b(hamstrings?|posterior chain)\b/i },
  { muscle: "glutes", pattern: /\b(glutes?|gluteus)\b/i },
  { muscle: "core", pattern: /\b(core|abs?|abdominals?)\b/i },
  { muscle: "calves", pattern: /\b(calves|calf)\b/i },
  { muscle: "conditioning", pattern: /\b(cardio|conditioning|endurance|stamina)\b/i },
  { muscle: "mobility", pattern: /\b(mobility|flexibility|stretch)\b/i },
];

const FITNESS_INTENT_PATTERN = /\b(workout|exercise|muscle|train|program|split|strength|hypertrophy|cardio|conditioning|mobility)\b/i;

const buildCoachFallback = (
  workouts: Array<Record<string, any>>,
  meals: Array<Record<string, any>>,
  sleep: Array<Record<string, any>>,
  recovery: Array<Record<string, any>>,
  question?: string
) : CoachResponsePayload => {
  const weeklyWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes ?? 0), 0);
  const avgCalories =
    meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + (m.calories ?? 0), 0) / meals.length) : null;
  const avgSleep =
    sleep.length > 0
      ? (sleep.reduce((sum, s) => sum + (s.duration_hours ?? 0), 0) / sleep.length).toFixed(1)
      : null;
  const latestRecovery = recovery[0];

  const tips: string[] = [];
  if (weeklyWorkouts < 3) {
    tips.push("Schedule at least three purposeful sessions this week to build momentum.");
  } else {
    tips.push("Maintain your training streak and consider layering in a mobility flush day.");
  }
  if (avgCalories) {
    tips.push(`Aim for roughly ${avgCalories + 150} calories on heavy days to stay fueled.`);
  } else {
    tips.push("Log a few meals so we can dial in precise nutrition adjustments.");
  }
  if (avgSleep && Number(avgSleep) < 7) {
    tips.push("Push bedtime forward 15 minutes to drift toward a 7+ hour sleep window.");
  } else {
    tips.push("Keep protecting your sleep routine—it's accelerating recovery.");
  }

  const answer: string[] = [
    `You completed ${weeklyWorkouts} workouts totaling ${totalMinutes} minutes last week.`,
  ];
  if (latestRecovery?.overall_score) {
    answer.push(
      `Your latest recovery score was ${latestRecovery.overall_score} (${latestRecovery.readiness}).`
    );
  }
  if (question) {
    answer.push(`Regarding your question: ${question.trim()}`);
  }

  const recommended_exercises = buildFallbackExercises(question, workouts);

  return {
    answer: answer.join(" "),
    tips: tips.slice(0, 3),
    recommended_exercises,
    follow_up_prompt:
      "Tell me your available equipment and weekly schedule, and I will turn this into a 7-day micro-plan.",
  };
};

const normalizeCategory = (value: unknown): ExerciseCategory => {
  const lower = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (VALID_CATEGORIES.includes(lower as ExerciseCategory)) {
    return lower as ExerciseCategory;
  }
  return "strength";
};

const normalizeDifficulty = (value: unknown): ExerciseDifficulty => {
  const lower = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (VALID_DIFFICULTIES.includes(lower as ExerciseDifficulty)) {
    return lower as ExerciseDifficulty;
  }
  return "intermediate";
};

const normalizeStringArray = (value: unknown, fallback: string[] = []) => {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length ? normalized : fallback;
};

const normalizeRecommendation = (candidate: unknown, fallback: CoachExerciseRecommendation): CoachExerciseRecommendation => {
  const record = (candidate && typeof candidate === "object" ? candidate : {}) as Partial<CoachExerciseRecommendation>;

  return {
    name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : fallback.name,
    primary_muscle:
      typeof record.primary_muscle === "string" && record.primary_muscle.trim()
        ? record.primary_muscle.trim().toLowerCase()
        : fallback.primary_muscle,
    secondary_muscles: normalizeStringArray(record.secondary_muscles, fallback.secondary_muscles),
    category: normalizeCategory(record.category),
    difficulty: normalizeDifficulty(record.difficulty),
    description:
      typeof record.description === "string" && record.description.trim()
        ? record.description.trim()
        : fallback.description,
    why_this_exercise:
      typeof record.why_this_exercise === "string" && record.why_this_exercise.trim()
        ? record.why_this_exercise.trim()
        : fallback.why_this_exercise,
    instructions: normalizeStringArray(record.instructions, fallback.instructions).slice(0, 5),
    form_cues: normalizeStringArray(record.form_cues, fallback.form_cues).slice(0, 4),
    equipment: normalizeStringArray(record.equipment, fallback.equipment).slice(0, 6),
  };
};

const detectTargetMuscles = (question?: string) => {
  if (!question) return [];
  const found = MUSCLE_KEYWORDS.filter((entry) => entry.pattern.test(question)).map((entry) => entry.muscle);
  return Array.from(new Set(found));
};

const pickRecommendationsByMuscles = (muscles: string[]) => {
  if (!muscles.length) {
    return COACH_EXERCISE_LIBRARY.slice(0, 4);
  }

  const picked = COACH_EXERCISE_LIBRARY.filter((exercise) => {
    const aggregate = [exercise.primary_muscle, ...(exercise.secondary_muscles ?? [])]
      .join(" ")
      .toLowerCase();
    return muscles.some((muscle) => aggregate.includes(muscle.toLowerCase()));
  });

  if (picked.length >= 3) {
    return picked.slice(0, 5);
  }

  const fallback = COACH_EXERCISE_LIBRARY.filter((exercise) =>
    ["core", "mobility", "conditioning"].some((needle) =>
      [exercise.primary_muscle, ...(exercise.secondary_muscles ?? [])].join(" ").toLowerCase().includes(needle)
    )
  );
  return [...picked, ...fallback].slice(0, 5);
};

const buildFallbackExercises = (question?: string, workouts: Array<Record<string, any>> = []) => {
  const targetMuscles = detectTargetMuscles(question);
  const recommendations = pickRecommendationsByMuscles(targetMuscles);

  if (!question || !FITNESS_INTENT_PATTERN.test(question)) {
    return recommendations.slice(0, 3);
  }

  const recentWorkoutTypes = new Set(workouts.map((workout) => String(workout.workout_type ?? "").toLowerCase()));
  if (!recentWorkoutTypes.has("cardio")) {
    const conditioning = COACH_EXERCISE_LIBRARY.find((exercise) => exercise.category === "cardio");
    if (conditioning && !recommendations.some((exercise) => exercise.name === conditioning.name)) {
      recommendations.push(conditioning);
    }
  }

  return recommendations.slice(0, 5);
};

const MEAL_LIBRARY = [
  {
    meal_type: "breakfast" as const,
    recipe_name: "Protein Oats with Berries",
    ingredients: ["rolled oats", "whey protein", "mixed berries", "almond butter"],
    prep_time: 10,
    calories: 520,
    protein: 38,
    carbs: 60,
    fat: 16,
  },
  {
    meal_type: "lunch" as const,
    recipe_name: "Grilled Chicken Power Bowl",
    ingredients: ["chicken breast", "quinoa", "spinach", "olive oil", "avocado"],
    prep_time: 25,
    calories: 620,
    protein: 46,
    carbs: 55,
    fat: 22,
  },
  {
    meal_type: "dinner" as const,
    recipe_name: "Salmon with Roasted Veggies",
    ingredients: ["salmon fillet", "sweet potato", "broccoli", "lemon"],
    prep_time: 30,
    calories: 680,
    protein: 48,
    carbs: 48,
    fat: 28,
  },
  {
    meal_type: "breakfast" as const,
    recipe_name: "Greek Yogurt Parfait",
    ingredients: ["greek yogurt", "granola", "chia seeds", "strawberries"],
    prep_time: 8,
    calories: 420,
    protein: 32,
    carbs: 45,
    fat: 12,
  },
  {
    meal_type: "lunch" as const,
    recipe_name: "Turkey & Avocado Wrap",
    ingredients: ["whole wheat wrap", "turkey", "avocado", "spinach", "tomato"],
    prep_time: 15,
    calories: 540,
    protein: 36,
    carbs: 50,
    fat: 18,
  },
  {
    meal_type: "dinner" as const,
    recipe_name: "Lean Beef Stir Fry",
    ingredients: ["lean beef", "brown rice", "bell peppers", "snap peas", "soy sauce"],
    prep_time: 25,
    calories: 640,
    protein: 42,
    carbs: 58,
    fat: 20,
  },
];

const shouldUseRemoteAI = () => {
  const remoteToggle = (process.env.USE_OPENAI ?? "").trim().toLowerCase();
  if (remoteToggle === "false") {
    return false;
  }

  const provider = (process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  if (provider === "grok" || provider === "xai") {
    return Boolean(process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.OPENAI_API_KEY);
  }
  if (provider === "groq") {
    return Boolean(process.env.GROQ_API_KEY);
  }

  return Boolean(process.env.OPENAI_API_KEY);
};

const buildMealPlanFallback = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = days.flatMap((day, index) => {
    const rotation = [MEAL_LIBRARY[index % MEAL_LIBRARY.length], MEAL_LIBRARY[(index + 1) % MEAL_LIBRARY.length], MEAL_LIBRARY[(index + 2) % MEAL_LIBRARY.length]];
    return rotation.map((meal) => ({
      day,
      ...meal,
    }));
  });

  const grocery_list = [
    { item: "Chicken breast", quantity: "6 pieces", purchased: false },
    { item: "Salmon fillet", quantity: "4 fillets", purchased: false },
    { item: "Lean beef", quantity: "2 lb", purchased: false },
    { item: "Quinoa", quantity: "2 cups", purchased: false },
    { item: "Mixed berries", quantity: "6 cups", purchased: false },
    { item: "Greek yogurt", quantity: "5 tubs", purchased: false },
  ];

  return {
    meals,
    grocery_list,
    total_cost_estimate: 140,
  };
};

router.post("/coach", async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { question } = req.body as { question?: string };

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  const [recentWorkouts, recentMeals, recentSleep, recentRecovery] = await Promise.all([
    WorkoutSession.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
    NutritionLog.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
    SleepLog.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
    RecoveryScore.find({ user: userId }).sort({ date: -1 }).limit(1).lean(),
  ]);

  const systemPrompt = `You are FitFlow AI, an elite hybrid strength & conditioning coach. Use the user's recent logs to deliver specific, encouraging guidance.`;

  const contextPrompt = `Recent data for this athlete:
- Workouts: ${recentWorkouts
      .map(
        (w) => `${w.date} ${w.workout_name} (${w.workout_type}, ${w.duration_minutes ?? 0}m, RPE ${w.overall_rpe ?? "n/a"})`
      )
      .join("; ") || "None logged"}
- Meals: ${recentMeals.map((m) => `${m.date} ${m.meal_name} (${m.calories ?? 0} cal)`).join("; ") || "None logged"}
- Sleep: ${recentSleep.map((s) => `${s.date} ${s.duration_hours}h`).join("; ") || "None logged"}
- Recovery: ${recentRecovery[0]?.overall_score ?? "n/a"} (${recentRecovery[0]?.readiness ?? "n/a"})

User question: ${question}

Provide:
1. A concise answer (2-3 sentences)
2. Exactly three actionable tips
3. 3 to 5 recommended exercises aligned to the user's question.
   - If user asks about specific muscles, focus those muscles first.
   - Include for each exercise: name, primary_muscle, secondary_muscles, category, difficulty, description, why_this_exercise, instructions, form_cues, equipment
4. One short follow-up question to refine the plan.

Return only valid JSON with this shape:
{
  "answer": "string",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "recommended_exercises": [
    {
      "name": "string",
      "primary_muscle": "string",
      "secondary_muscles": ["string"],
      "category": "strength|cardio|flexibility|core|plyometric",
      "difficulty": "beginner|intermediate|advanced",
      "description": "string",
      "why_this_exercise": "string",
      "instructions": ["string"],
      "form_cues": ["string"],
      "equipment": ["string"]
    }
  ],
  "follow_up_prompt": "string"
}`;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: contextPrompt },
  ];

  if (shouldUseRemoteAI()) {
    try {
      const { content } = await callOpenAI<{
        answer?: string;
        tips?: string[];
        recommended_exercises?: unknown[];
        follow_up_prompt?: string;
      }>(messages, "json_object");
      const fallback = buildCoachFallback(recentWorkouts, recentMeals, recentSleep, recentRecovery, question);
      const answer = typeof content?.answer === "string" && content.answer.trim() ? content.answer.trim() : fallback.answer;
      const tips = Array.isArray(content?.tips)
        ? content.tips.filter((tip): tip is string => typeof tip === "string" && tip.trim().length > 0).slice(0, 3)
        : [];
      const baseRecommendations = buildFallbackExercises(question, recentWorkouts);
      const defaultExerciseFallback = baseRecommendations[0] ?? fallback.recommended_exercises[0] ?? COACH_EXERCISE_LIBRARY[0];
      const recommendedExercises = Array.isArray(content?.recommended_exercises)
        ? content.recommended_exercises
            .slice(0, 5)
            .map((exercise, index) =>
              normalizeRecommendation(exercise, baseRecommendations[index] ?? defaultExerciseFallback)
            )
        : [];
      const followUpPrompt =
        typeof content?.follow_up_prompt === "string" && content.follow_up_prompt.trim()
          ? content.follow_up_prompt.trim()
          : fallback.follow_up_prompt;

      return res.json({
        answer,
        tips: tips.length === 3 ? tips : fallback.tips,
        recommended_exercises: recommendedExercises.length ? recommendedExercises : fallback.recommended_exercises,
        follow_up_prompt: followUpPrompt,
      });
    } catch (error) {
      const fallback = buildCoachFallback(recentWorkouts, recentMeals, recentSleep, recentRecovery, question);
      if (!(error instanceof OpenAIUnavailableError)) {
        console.info("Using heuristic coaching response (remote AI unavailable)");
      }
      return res.json(fallback);
    }
  }

  const fallback = buildCoachFallback(recentWorkouts, recentMeals, recentSleep, recentRecovery, question);
  return res.json(fallback);
});

router.post("/meal-plan", async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { dietaryPreference, calorieTarget, proteinTarget, carbsTarget, fatTarget } = req.body as {
    dietaryPreference?: string;
    calorieTarget?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
  };

  const recentMeals = await NutritionLog.find({ user: userId }).sort({ date: -1 }).limit(5).lean();

  const systemPrompt = `You are FitFlow AI nutrition architect. Build detailed, actionable weekly meal plans tailored to the athlete.`;

  const userPrompt = `Create a 7-day meal plan with breakfast, lunch, dinner for each day.

Targets:
- Calories: ${calorieTarget ?? 2400} per day
- Protein: ${proteinTarget ?? 180} g
- Carbs: ${carbsTarget ?? 220} g
- Fat: ${fatTarget ?? 70} g
- Dietary preference: ${dietaryPreference ?? "none"}

Recent meals for variety awareness: ${recentMeals.map((m) => `${m.meal_name}`).join(", ") || "none"}

For every meal include: recipe_name, ingredients, prep_time, calories, protein, carbs, fat.
Also provide grocery_list (array of { item, quantity, purchased:false }) and total_cost_estimate (USD).
Respond strictly as JSON.`;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  if (shouldUseRemoteAI()) {
    try {
      const { content } = await callOpenAI<{
        meals: Array<{
          day: string;
          meal_type: "breakfast" | "lunch" | "dinner";
          recipe_name: string;
          ingredients: string[];
          prep_time: number;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        }>;
        grocery_list: Array<{ item: string; quantity: string; purchased: boolean }>;
        total_cost_estimate: number;
      }>(messages, "json_object");

      const fallback = buildMealPlanFallback();
      const meals = Array.isArray(content?.meals) ? content.meals : fallback.meals;
      const groceryList = Array.isArray(content?.grocery_list) ? content.grocery_list : fallback.grocery_list;
      const totalCostEstimate =
        typeof content?.total_cost_estimate === "number" && Number.isFinite(content.total_cost_estimate)
          ? content.total_cost_estimate
          : fallback.total_cost_estimate;

      return res.json({
        meals,
        grocery_list: groceryList,
        total_cost_estimate: totalCostEstimate,
      });
    } catch (error) {
      if (!(error instanceof OpenAIUnavailableError)) {
        console.info("Using heuristic meal plan (remote AI unavailable)");
      }
      const fallback = buildMealPlanFallback();
      return res.json(fallback);
    }
  }

  const fallback = buildMealPlanFallback();
  return res.json(fallback);
});

export default router;
