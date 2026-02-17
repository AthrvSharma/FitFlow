import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  base44,
  type PersonalizedPlan,
  type PlanDay,
  type NutritionPlan,
  type FoodRecognitionResult,
  type MoodLogEntry,
  type PlanSession,
} from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/modules/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Flame,
  RefreshCw,
  Sparkles,
  Brain,
  Smile,
  Image,
  Loader2,
  Droplet,
  Heart,
  Clock,
  ChefHat,
  Leaf,
  UtensilsCrossed,
  PlusCircle,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  Route,
  ArrowRight,
  Compass,
} from "lucide-react";
import clsx from "clsx";

type IntensityStyle = {
  badge: string;
  dot: string;
  label: string;
  description: string;
};

const intensityPalette: Record<PlanSession["intensity"], IntensityStyle> = {
  high: {
    badge: "border-rose-200 bg-rose-50 text-rose-600",
    dot: "bg-rose-400",
    label: "High Effort",
    description: "Push with intention, stay mindful of recovery.",
  },
  moderate: {
    badge: "border-amber-200 bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
    label: "Moderate",
    description: "Hold a sustainable pace and finish energized.",
  },
  low: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
    label: "Low Intensity",
    description: "Restore, breathe, and move with control.",
  },
  custom: {
    badge: "border-indigo-200 bg-indigo-50 text-indigo-600",
    dot: "bg-indigo-400",
    label: "Custom",
    description: "Adapt based on how you feel today.",
  },
};

const mealPalette: Record<
  string,
  { badge: string; container: string; bullet: string; label: string }
> = {
  breakfast: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    container: "bg-gradient-to-br from-amber-50 via-white to-white border-amber-100",
    bullet: "bg-amber-400",
    label: "Breakfast",
  },
  lunch: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    container: "bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-100",
    bullet: "bg-emerald-400",
    label: "Lunch",
  },
  dinner: {
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    container: "bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-100",
    bullet: "bg-indigo-400",
    label: "Dinner",
  },
  snack: {
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    container: "bg-gradient-to-br from-pink-50 via-white to-white border-pink-100",
    bullet: "bg-pink-400",
    label: "Snack",
  },
  custom: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    container: "bg-gradient-to-br from-slate-50 via-white to-white border-slate-100",
    bullet: "bg-slate-400",
    label: "Custom",
  },
};

const getReadinessTheme = (score?: number | null) => {
  if (!score) {
    return {
      gradient: "from-slate-500/80 via-slate-600/80 to-slate-700/80",
      label: "Syncing",
      message: "Log a quick mood pulse so FitFlow can calibrate readiness.",
      ring: "border-slate-200/70",
    };
  }
  if (score >= 85) {
    return {
      gradient: "from-emerald-500/90 via-teal-500/90 to-cyan-500/90",
      label: "Primed",
      message: "Your system is primed for high performance today.",
      ring: "border-emerald-200/70",
    };
  }
  if (score >= 70) {
    return {
      gradient: "from-indigo-500/90 via-purple-500/90 to-sky-500/90",
      label: "Balanced",
      message: "You’re in a strong groove—keep the rhythm and refuel well.",
      ring: "border-indigo-200/70",
    };
  }
  return {
    gradient: "from-amber-500/90 via-orange-500/90 to-rose-500/90",
    label: "Recharge",
    message: "Layer in mobility and recovery rituals to bounce back.",
    ring: "border-amber-200/70",
  };
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "--";

const moodPresets: Array<{ value: MoodLogEntry["mood"]; label: string; gradient: string }> = [
  { value: "energized", label: "Energized", gradient: "from-emerald-500 to-lime-500" },
  { value: "balanced", label: "Balanced", gradient: "from-indigo-500 to-purple-500" },
  { value: "tired", label: "Depleted", gradient: "from-slate-500 to-slate-700" },
  { value: "stressed", label: "Stressed", gradient: "from-amber-500 to-orange-600" },
  { value: "sore", label: "Sore", gradient: "from-rose-500 to-pink-500" },
  { value: "low", label: "Low", gradient: "from-sky-500 to-blue-500" },
];

const scrollToSection = (id: string) => {
  if (typeof document === "undefined") return;
  const node = document.getElementById(id);
  if (node) {
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const isSameLocalDate = (value?: string | Date) => {
  if (!value) return false;
  const now = new Date();
  const date = new Date(value);
  return now.toDateString() === date.toDateString();
};

const Plan: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [foodInput, setFoodInput] = useState("");
  const [foodDetectUrl, setFoodDetectUrl] = useState("");
  const [foodDetection, setFoodDetection] = useState<FoodRecognitionResult[] | null>(null);
  const [foodDetectionError, setFoodDetectionError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["personalized-plan"],
    queryFn: () => base44.personalization.getLatest(),
  });

  const { data: moodHistory } = useQuery({
    queryKey: ["mood-history"],
    queryFn: () => base44.mood.list(21),
    initialData: [] as MoodLogEntry[],
  });

  const { data: todayNutritionLogs = [] } = useQuery({
    queryKey: ["plan-today-nutrition", today],
    queryFn: () => base44.entities.NutritionLog.filter({ date: today }),
    initialData: [] as Array<Record<string, any>>,
  });

  const { data: todayWorkoutLogs = [] } = useQuery({
    queryKey: ["plan-today-workouts", today],
    queryFn: () => base44.entities.WorkoutSession.filter({ date: today }),
    initialData: [] as Array<Record<string, any>>,
  });

  const queryPlanPreview = useQuery({
    queryKey: ["personalized-plan-preview"],
    queryFn: async () => {
      try {
        return await base44.personalization.getLatest();
      } catch (error) {
        console.warn("Plan preview unavailable", error);
        return null;
      }
    },
  });

  const regeneratePlan = useMutation({
    mutationFn: () => base44.personalization.generate("manual refresh"),
    onSuccess: (result) => {
      queryClient.setQueryData(["personalized-plan"], result);
      queryClient.setQueryData(["personalized-plan-preview"], result);
    },
  });

  const adjustNutrition = useMutation({
    mutationFn: (foods: string[]) =>
      base44.personalization.adjustNutrition({
        foods,
        purpose: "user-preference tweak",
      }),
    onSuccess: (result) => {
      setFoodInput("");
      queryClient.setQueryData(["personalized-plan"], result);
      queryClient.setQueryData(["personalized-plan-preview"], result);
    },
  });

  const logMood = useMutation({
    mutationFn: (payload: { mood: MoodLogEntry["mood"]; note?: string }) =>
      base44.mood.create({
        mood: payload.mood,
        note: payload.note,
        tags: [],
        stress_level: payload.mood === "stressed" ? "high" : "moderate",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-history"] });
    },
  });

  const recognizeFood = async () => {
    if (!foodDetectUrl.trim()) {
      setFoodDetection(null);
      setFoodDetectionError(null);
      return;
    }
    try {
      setDetecting(true);
      setFoodDetectionError(null);
      const foods = await base44.nutrition.recognizeFood({ imageUrl: foodDetectUrl.trim(), topK: 5 });
      setFoodDetection(foods);
    } catch (error) {
      setFoodDetection(null);
      setFoodDetectionError(error instanceof Error ? error.message : "Unable to analyze image");
    } finally {
      setDetecting(false);
    }
  };

  const handleFoodAdjust = () => {
    const foods = foodInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!foods.length) return;
    adjustNutrition.mutate(foods);
  };

  const readinessTheme = useMemo(() => getReadinessTheme(plan?.readiness_score), [plan?.readiness_score]);
  const latestMood = moodHistory[0];
  const nextDay = plan?.workout_plan.schedule?.[0];
  const previewPlan = queryPlanPreview.data;
  const moodLoggedToday = Boolean(latestMood?.createdAt) && isSameLocalDate(latestMood?.createdAt);
  const mealLoggedToday = todayNutritionLogs.length > 0;
  const workoutLoggedToday = todayWorkoutLogs.length > 0;
  const nutritionTweakedRecently =
    Array.isArray(plan?.metadata?.last_adjustment_foods) && (plan?.metadata?.last_adjustment_foods?.length ?? 0) > 0;
  const scannedMealToday = todayNutritionLogs.some((meal) =>
    String(meal?.meal_name ?? "")
      .toLowerCase()
      .includes("ai scan")
  );
  const scannerFeedbackCaptured = scannedMealToday || nutritionTweakedRecently;

  const blueprintActions = [
    {
      id: "mood",
      title: "Log your mood pulse",
      description: moodLoggedToday
        ? "Mood is synced for today. AI readiness is calibrated."
        : "Tell FitFlow how you feel so training intensity and recovery guidance adapt.",
      done: moodLoggedToday,
      cta: moodLoggedToday ? "Update mood" : "Log mood",
      target: "mood",
    },
    {
      id: "training",
      title: "Execute your training session",
      description: workoutLoggedToday
        ? "Workout already logged today."
        : `Next planned: ${nextDay?.sessions?.[0]?.name ?? "Review schedule and pick a session"}.`,
      done: workoutLoggedToday,
      cta: workoutLoggedToday ? "Review schedule" : "Open training",
      target: "training",
    },
    {
      id: "nutrition",
      title: "Hit fuel targets",
      description: mealLoggedToday
        ? "At least one meal logged today."
        : "Use the meal scanner or manual log to keep macro targets accurate.",
      done: mealLoggedToday,
      cta: mealLoggedToday ? "View nutrition" : "Plan meals",
      target: "nutrition",
    },
    {
      id: "feedback",
      title: "Feed AI with food feedback",
      description: scannerFeedbackCaptured
        ? "Food preference/scan feedback captured for future plan tuning."
        : "Scan a meal or add favorite foods to improve next recommendations.",
      done: scannerFeedbackCaptured,
      cta: "Open scanner",
      target: "scanner",
    },
  ];

  const completedBlueprintActions = blueprintActions.filter((item) => item.done).length;

  const sectionGuide = [
    { id: "overview", label: "Overview", icon: Compass, description: "Understand readiness and priorities" },
    { id: "training", label: "Training", icon: Calendar, description: "Follow day-by-day sessions" },
    { id: "nutrition", label: "Nutrition", icon: Flame, description: "Track macros, meals, and hydration" },
    { id: "mood", label: "Mood", icon: Brain, description: "Log how you feel for adaptive intensity" },
    { id: "scanner", label: "Scanner", icon: Image, description: "Use AI vision for meal analysis" },
  ];

  const renderBlueprintGuide = () => (
    <section className="rounded-[32px] border border-slate-200/70 bg-white shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.32em] text-indigo-500 font-semibold flex items-center gap-2">
            <Route className="w-4 h-4" />
            How To Use Blueprint
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">Clear flow for every day</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">
            Start with readiness, execute the plan block-by-block, then log feedback so tomorrow’s guidance improves automatically.
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Today Progress</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{completedBlueprintActions}/4</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 1</div>
          <p className="text-base font-semibold text-slate-900 mt-1">Understand your state</p>
          <p className="text-sm text-slate-600 mt-2">Read readiness score and next-session cue before making decisions.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 2</div>
          <p className="text-base font-semibold text-slate-900 mt-1">Execute core blocks</p>
          <p className="text-sm text-slate-600 mt-2">Follow training and nutrition sections to match today’s targets.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 3</div>
          <p className="text-base font-semibold text-slate-900 mt-1">Close the feedback loop</p>
          <p className="text-sm text-slate-600 mt-2">Log mood and meal feedback so AI personalizes the next refresh.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {sectionGuide.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600">
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-2">{item.label}</p>
            <p className="text-xs text-slate-600 mt-1">{item.description}</p>
          </button>
        ))}
      </div>
    </section>
  );

  const renderActionChecklist = () => (
    <section className="rounded-[32px] border border-slate-200/70 bg-white shadow-xl p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-indigo-500" />
        <h3 className="text-xl font-black text-slate-900">Today’s Action Checklist</h3>
      </div>
      <p className="text-sm text-slate-600">
        Follow this sequence to keep your blueprint accurate, adaptive, and easy to execute.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {blueprintActions.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
              ) : (
                <CircleDashed className="w-5 h-5 text-slate-400 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600 mt-1">{item.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(item.target)}
              className="shrink-0"
            >
              {item.cta}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSchedule = (schedule: PlanDay[] = []) => (
    <section id="training" className="rounded-[32px] border border-slate-200/60 bg-white shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-500 font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Training Schedule
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-2">
            AI-crafted sessions for your current season
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl">
            Your week balances performance, conditioning, and recovery. Sessions auto-adjust whenever you regenerate the plan
            or log mood changes.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Powered by: AI Workout Planner • Exercises API enrichment
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {schedule.map((day) => (
          <motion.div
            key={day.day}
            className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-white p-5 shadow-sm hover:shadow-lg transition-shadow"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{day.day}</h3>
                <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mt-1">
                  {day.emphasis}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-600">
                {day.sessions.length} {day.sessions.length === 1 ? "session" : "sessions"}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {day.sessions.map((session, idx) => {
                const intensityKey = (session.intensity ?? "custom") as PlanSession["intensity"];
                const palette = intensityPalette[intensityKey];
                return (
                  <div key={`${session.name}-${idx}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{session.name}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mt-0.5">
                          {session.modality ?? "custom"} • {session.duration_minutes ?? 45} min
                        </p>
                      </div>
                      <span className={clsx("px-3 py-1 rounded-full text-[11px] font-semibold border", palette.badge)}>
                        {palette.label}
                      </span>
                    </div>
                    {session.guidance && <p className="text-sm text-slate-600 mt-3">{session.guidance}</p>}
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                      {(session.exercises ?? []).map((exercise) => (
                        <li key={`${session.name}-${exercise.name}`} className="flex items-start gap-2">
                          <span className={clsx("mt-1 h-1.5 w-1.5 rounded-full", palette.dot)} />
                          <span>
                            <span className="font-semibold text-slate-800">{exercise.name}</span>
                            {exercise.sets ? ` • ${exercise.sets} sets` : ""}
                            {exercise.reps ? ` x ${exercise.reps}` : ""}
                            {exercise.notes ? ` — ${exercise.notes}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {day.recovery?.focus && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-1">Recovery focus</div>
                <p className="text-sm text-emerald-700">{day.recovery.focus}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );

  const renderNutrition = (nutrition: NutritionPlan | undefined) => {
    if (!nutrition) return null;
    const macroCards = [
      {
        label: "Calories",
        value: `${nutrition.calories_target} kcal`,
        hint: "Daily energy target",
        gradient: "from-amber-500 to-orange-500",
        icon: Flame,
      },
      {
        label: "Protein",
        value: `${nutrition.macro_split.protein} g`,
        hint: "Repair & growth",
        gradient: "from-rose-500 to-pink-500",
        icon: ChefHat,
      },
      {
        label: "Carbs",
        value: `${nutrition.macro_split.carbs} g`,
        hint: "Training fuel",
        gradient: "from-indigo-500 to-sky-500",
        icon: UtensilsCrossed,
      },
      {
        label: "Fat",
        value: `${nutrition.macro_split.fat} g`,
        hint: "Hormone support",
        gradient: "from-purple-500 to-fuchsia-500",
        icon: Heart,
      },
      {
        label: "Hydration",
        value: `${nutrition.hydration_ml} ml`,
        hint: "Spread over 5 checkpoints",
        gradient: "from-emerald-500 to-teal-500",
        icon: Droplet,
      },
    ];

    const meals = [...(nutrition.meals ?? []), ...(nutrition.snacks ?? [])];

    return (
      <section id="nutrition" className="rounded-[32px] border border-slate-200/60 bg-white shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-emerald-500 font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Precision Fuel
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Eat for performance, recovery, and joy
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Macro targets flex with your workouts and mood. Swap foods or scan meals—FitFlow keeps the numbers dialed in.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {macroCards.map((card) => (
            <div
              key={card.label}
              className={clsx(
                "rounded-2xl border border-white/20 bg-gradient-to-br text-white px-4 py-5 shadow-lg flex flex-col gap-3",
                card.gradient
              )}
            >
              <card.icon className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70 font-semibold">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
              <p className="text-xs text-white/75">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {meals.map((meal, index) => {
            const palette = mealPalette[meal.meal_type] ?? mealPalette.custom;
            return (
              <div
                key={`${meal.name}-${index}`}
                className={clsx(
                  "rounded-3xl p-5 shadow-sm border",
                  palette.container,
                  "hover:shadow-lg transition-shadow"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={clsx("inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border", palette.badge)}>
                      {palette.label}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mt-3">{meal.name}</h3>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="text-sm font-semibold text-slate-800">{meal.calories} kcal</div>
                    <div>Protein {meal.protein}g</div>
                    <div>Carbs {meal.carbs}g</div>
                    <div>Fat {meal.fat}g</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                  {(meal.ingredients ?? []).map((ingredient) => (
                    <li key={ingredient} className="flex items-start gap-2">
                      <span className={clsx("mt-1 h-1.5 w-1.5 rounded-full", palette.bullet)} />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
                {meal.notes && <p className="text-xs text-slate-500 mt-4 italic">{meal.notes}</p>}
              </div>
            );
          })}
        </div>

        {(nutrition.guidance ?? []).length > 0 && (
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50/70 px-6 py-5 space-y-2">
            <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Guidance
            </div>
            <ul className="space-y-1.5 text-sm text-indigo-700">
              {(nutrition.guidance ?? []).map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-t border-slate-200/60 pt-6">
          <div className="w-full">
            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-2">
              Add foods you love and FitFlow will rebalance macros
            </label>
            <Input
              placeholder="Ex: poké bowls, dark chocolate, mango lassi"
              value={foodInput}
              onChange={(event) => setFoodInput(event.target.value)}
              className="bg-slate-50"
            />
          </div>
          <Button
            type="button"
            onClick={handleFoodAdjust}
            disabled={adjustNutrition.isPending}
            className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white"
          >
            {adjustNutrition.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating plan...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Update Plan with Foods
              </>
            )}
          </Button>
        </div>
      </section>
    );
  };

  const renderFoodRecognition = () => (
    <section id="scanner" className="rounded-[28px] border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-slate-900">Snap-to-Macro with Groq Vision</h3>
      </div>
      <p className="text-sm text-slate-600">
        Drop an image URL (or use the mobile app camera) and Groq Vision will detect foods and estimate meal macros. FitFlow adapts your macro targets automatically.
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="https://..."
          value={foodDetectUrl}
          onChange={(event) => setFoodDetectUrl(event.target.value)}
          className="bg-white"
        />
        <Button
          type="button"
          onClick={recognizeFood}
          disabled={detecting || !foodDetectUrl.trim()}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
        >
          {detecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Detect Foods
            </>
          )}
        </Button>
      </div>
      <AnimatePresence>
        {foodDetectionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-4"
          >
            {foodDetectionError}
          </motion.div>
        )}
        {foodDetection && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="space-y-2 text-sm text-indigo-800 bg-white/70 border border-indigo-100 rounded-2xl p-4"
          >
            {foodDetection.map((food) => (
              <li key={food.id} className="flex items-center justify-between">
                <span>{food.name}</span>
                <span className="text-xs font-semibold text-indigo-600">
                  {(food.confidence * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );

  const renderMetadata = (currentPlan: PersonalizedPlan) => (
    <section id="metadata" className="rounded-[28px] border border-slate-200/70 bg-white shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-900">Plan Metadata</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
        <div>
          <div className="font-semibold text-slate-800">Source</div>
          <div className="text-slate-600 capitalize">{currentPlan.source}</div>
        </div>
        <div>
          <div className="font-semibold text-slate-800">Version</div>
          <div className="text-slate-600">{currentPlan.metadata?.version ?? 1}</div>
        </div>
        <div>
          <div className="font-semibold text-slate-800">Generated</div>
          <div>{formatDateTime(currentPlan.createdAt)}</div>
        </div>
        <div>
          <div className="font-semibold text-slate-800">Updated</div>
          <div>{formatDateTime(currentPlan.updatedAt)}</div>
        </div>
      </div>
      {Array.isArray(currentPlan.metadata?.last_adjustment_foods) && currentPlan.metadata!.last_adjustment_foods!.length > 0 && (
        <div className="text-xs text-slate-500">
          Last nutrition tweak:{" "}
          <span className="font-semibold text-indigo-600">
            {(currentPlan.metadata!.last_adjustment_foods as string[]).join(", ")}
          </span>
        </div>
      )}
    </section>
  );

  const renderLifestyle = (currentPlan: PersonalizedPlan) => (
    <section id="lifestyle" className="rounded-[28px] border border-slate-200/70 bg-white shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-bold text-slate-900">Lifestyle Ritual</h3>
      </div>
      <div className="space-y-4 text-sm text-slate-600">
        {currentPlan.lifestyle_plan.sleep && (
          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-purple-600 font-semibold">
              <Clock className="w-4 h-4" />
              Sleep Blueprint
            </div>
            <p className="text-sm text-purple-700 mt-2">
              Target {currentPlan.lifestyle_plan.sleep.target_hours} hours. Wind-down rituals:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-purple-700">
              {(currentPlan.lifestyle_plan.sleep.wind_down_rituals ?? []).map((ritual) => (
                <li key={ritual}>• {ritual}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="text-xs uppercase tracking-wide text-emerald-500 font-semibold mb-1">Mood Support</div>
          <ul className="space-y-1.5">
            {currentPlan.lifestyle_plan.mood_support.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Smile className="w-4 h-4 mt-0.5 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">Micro Habits</div>
          <ul className="space-y-1.5">
            {currentPlan.lifestyle_plan.micro_habits.map((habit) => (
              <li key={habit} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>{habit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/40 to-indigo-100/40">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-64 rounded-[32px] bg-white/60 border border-white/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/40 to-indigo-100/40">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-[32px] border border-dashed border-indigo-300 bg-white/80 p-10 text-center space-y-4 shadow-xl">
            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
            <h1 className="text-3xl font-black text-slate-900">No personalized plan yet</h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Complete onboarding or hit regenerate to craft your first AI-powered training + nutrition + lifestyle plan.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-left max-w-3xl mx-auto">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 1</div>
                <p className="text-sm font-semibold text-slate-800 mt-1">Generate your blueprint</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 2</div>
                <p className="text-sm font-semibold text-slate-800 mt-1">Review training + nutrition</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Step 3</div>
                <p className="text-sm font-semibold text-slate-800 mt-1">Log mood and meals daily</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => regeneratePlan.mutate()}
              disabled={regeneratePlan.isPending}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              {regeneratePlan.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate plan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const heroStats = [
    {
      label: "Generated Reason",
      value: plan.generated_reason,
    },
    {
      label: "Macro Target",
      value: `${plan.nutrition_plan.calories_target} kcal`,
    },
    {
      label: "Hydration Goal",
      value: `${plan.nutrition_plan.hydration_ml} ml`,
    },
    {
      label: "Today Progress",
      value: `${completedBlueprintActions}/4 actions done`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/40 to-indigo-100/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-10">
        <section id="overview" className="relative overflow-hidden rounded-[36px] border border-white/50 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white shadow-3xl">
          <div className="absolute -right-24 top-[-80px] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-[-60px] bottom-[-60px] h-72 w-72 rounded-full bg-indigo-600/40 blur-3xl" />
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="space-y-6 max-w-2xl">
                <div className="text-xs uppercase tracking-[0.45em] text-indigo-200/80 font-semibold">
                  Personalized Blueprint
                </div>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight">Your Adaptive Blueprint</h1>
                <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
                  {plan.workout_plan.focus_summary}
                </p>
                <p className="text-indigo-200/80 text-sm">
                  Use the “How To Use Blueprint” and “Today’s Action Checklist” sections below to know exactly what to do next.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => regeneratePlan.mutate()}
                    disabled={regeneratePlan.isPending}
                    className="bg-white text-slate-900 hover:bg-indigo-50"
                  >
                    {regeneratePlan.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Refreshing…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Plan
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => scrollToSection("nutrition")}
                    className="border-white/40 text-white hover:bg-white/10"
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Jump to Nutrition
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => scrollToSection("mood")}
                    className="text-white hover:bg-white/10"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Log Mood Pulse
                  </Button>
                </div>
              </div>
              <div
                className={clsx(
                  "relative overflow-hidden rounded-3xl border px-6 py-6 w-full max-w-xs shadow-2xl",
                  "bg-gradient-to-br",
                  readinessTheme.gradient,
                  readinessTheme.ring
                )}
              >
                <div className="text-xs uppercase tracking-wide text-white/75 font-semibold">Readiness</div>
                <div className="mt-4 text-5xl font-black leading-none">
                  {plan.readiness_score ?? "--"}
                </div>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border border-white/40 text-white/80">
                  {readinessTheme.label}
                </div>
                <p className="mt-4 text-sm text-white/80 leading-relaxed">{readinessTheme.message}</p>
                <p className="mt-4 text-xs text-white/60">
                  Next up: {nextDay?.day ?? "Review plan"} — {nextDay?.sessions?.[0]?.name ?? "choose a focus"}
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 text-sm text-indigo-100/80">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-white/60 font-semibold">{stat.label}</div>
                  <div className="text-base font-semibold text-white mt-1">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {renderBlueprintGuide()}
        {renderActionChecklist()}

        <div className="grid gap-8 xl:grid-cols-[1.9fr_1.1fr]">
          <div className="space-y-8">
            {renderSchedule(plan.workout_plan.schedule)}
            {renderNutrition(plan.nutrition_plan)}
          </div>
          <div className="space-y-8">
            <section id="mood" className="rounded-[28px] border border-slate-200/70 bg-white shadow-lg p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900">Mood Intelligence</h3>
              </div>
              <p className="text-sm text-slate-600">
                Teach FitFlow how you feel so it can nudge sessions, pacing, and fuel.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {moodPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => logMood.mutate({ mood: preset.value })}
                    className={clsx(
                      "rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200",
                      "bg-gradient-to-br",
                      preset.gradient,
                      logMood.isPending && "opacity-70 pointer-events-none"
                    )}
                  >
                    <div>{preset.label}</div>
                    <div className="text-xs text-white/80">Log mood pulse</div>
                  </button>
                ))}
              </div>
              {latestMood ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
                  <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Latest Mood Snapshot</div>
                  <p className="font-semibold mt-1">{latestMood.mood.toUpperCase()}</p>
                  {latestMood.note && <p className="text-xs mt-2 text-indigo-600">{latestMood.note}</p>}
                  <p className="text-[11px] text-indigo-500 mt-3">
                    Logged {formatDateTime(latestMood.createdAt)}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-xs text-indigo-600">
                  No mood pulses yet — drop a quick update to unlock readiness insights.
                </div>
              )}
            </section>

            {renderLifestyle(plan)}
            {renderFoodRecognition()}
            {renderMetadata(plan)}
          </div>
        </div>

        {previewPlan && (
          <div className="rounded-[28px] border border-white/40 bg-white/60 backdrop-blur-xl p-6 text-sm text-slate-600 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-semibold text-slate-900">Live preview enabled</p>
                  <p>All dashboards pull directly from your latest personalized plan.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-latest-mood"] })}>
                Sync Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plan;
