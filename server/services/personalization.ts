import type { IUser } from "../models/User";
import { User } from "../models/User";
import { MoodLog, type IMoodLog } from "../models/MoodLog";
import {
  PersonalizedPlan,
  type IPersonalizedPlan,
  type IPlanDay,
  type IPlanSession,
  type IPlanExercise,
  type INutritionPlan,
} from "../models/PersonalizedPlan";
import {
  callWorkoutPlannerApi,
  fetchExercisesFromApi,
  type ExternalExercise,
  type ExternalWorkoutPlanResponse,
} from "./externalApis";
import {
  generateFallbackPlan,
  blendExternalWithFallback,
  createPersonalizedPlanDocument,
  adjustNutritionPlanWithFoods,
  buildMoodAwarePlan,
  inferMoodSnapshot,
} from "./fallbackPlan";

type GenerationOptions = {
  reason: string;
  user?: IUser;
};

type AdjustmentOptions = {
  foods: string[];
  purpose: string;
};

const mapFocusToExerciseQuery = (focus: string) => {
  const lower = focus.toLowerCase();
  if (lower.includes("upper push")) return { muscle: "chest", type: "strength" };
  if (lower.includes("push")) return { muscle: "shoulders", type: "strength" };
  if (lower.includes("pull")) return { muscle: "back", type: "strength" };
  if (lower.includes("lower")) return { muscle: "quadriceps", type: "strength" };
  if (lower.includes("posterior")) return { muscle: "lower_back", type: "strength" };
  if (lower.includes("conditioning")) return { type: "cardio" };
  if (lower.includes("core")) return { muscle: "abdominals" };
  if (lower.includes("mobility")) return { type: "stretching" };
  return { name: focus };
};

const translateExternalPlan = (external: ExternalWorkoutPlanResponse | null) => {
  if (!external) return null;
  const schedule: IPlanDay[] =
    external.schedule?.map((day, index) => ({
      day: day.day ?? `Day ${index + 1}`,
      emphasis: day.focus ?? day.day ?? "Hybrid Focus",
      sessions: (day.sessions ?? []).map((session): IPlanSession => ({
        name: session.name ?? session.modality ?? "Training Session",
        focus: session.focus ?? session.modality ?? "custom",
        duration_minutes: Number(session.duration_minutes ?? session.duration ?? 45),
        intensity: (session.intensity as IPlanSession["intensity"]) ?? "moderate",
        modality: session.modality ?? session.focus ?? "custom",
        guidance: session.notes ?? "",
        exercises: (session.exercises ?? []).map((exercise): IPlanExercise => ({
          name: exercise.name ?? "Movement",
          sets: exercise.sets ?? undefined,
          reps: exercise.reps ?? undefined,
          tempo: exercise.tempo ?? undefined,
          rest_seconds: exercise.rest_seconds ?? undefined,
          notes: exercise.notes ?? "",
        })),
      })),
      recovery: day.recovery
        ? {
            focus: day.recovery.focus ?? "Recovery",
            duration_minutes: day.recovery.duration_minutes ?? 10,
            notes: day.recovery.notes ?? "",
          }
        : undefined,
      mindset: day.mindset,
    })) ?? [];

  const nutritionPlan: Partial<INutritionPlan> | undefined = external.nutrition_plan
    ? {
        calories_target: external.nutrition_plan.calories_target ?? undefined,
        macro_split: {
          protein: external.nutrition_plan.macro_split?.protein ?? 0,
          carbs: external.nutrition_plan.macro_split?.carbs ?? 0,
          fat: external.nutrition_plan.macro_split?.fat ?? 0,
        },
        hydration_ml: undefined,
        meals:
          external.nutrition_plan.meals?.map((meal) => ({
            name: meal.name,
            meal_type: (meal.meal_type as INutritionPlan["meals"][number]["meal_type"]) ?? "custom",
            calories: Math.round(meal.calories ?? 0),
            protein: Math.round(meal.protein ?? 0),
            carbs: Math.round(meal.carbs ?? 0),
            fat: Math.round(meal.fat ?? 0),
            ingredients: meal.ingredients ?? [],
            notes: meal.notes ?? "",
          })) ?? [],
        snacks:
          external.nutrition_plan.snacks?.map((snack) => ({
            name: snack.name,
            meal_type: "snack",
            calories: Math.round(snack.calories ?? 0),
            protein: Math.round(snack.protein ?? 0),
            carbs: Math.round(snack.carbs ?? 0),
            fat: Math.round(snack.fat ?? 0),
            ingredients: snack.ingredients ?? [],
            notes: snack.ingredients ? `Ingredients: ${snack.ingredients.join(", ")}` : undefined,
          })) ?? [],
        guidance: external.nutrition_plan.guidance ?? [],
      }
    : undefined;

  return {
    workout_plan: schedule.length ? { focus_summary: external.focus_summary ?? "", schedule } : undefined,
    nutrition_plan,
    lifestyle_plan: external.lifestyle_plan,
    metadata: external.metadata,
  };
};

const injectExternalExercises = async (plan: { workout_plan: { schedule: IPlanDay[] } }) => {
  const cache = new Map<string, ExternalExercise[]>();

  const ensureExercisesForSession = async (session: IPlanSession) => {
    const focus = session.focus || session.modality || session.name;
    if (!focus) return;
    if (session.exercises && session.exercises.length >= 3) return;

    if (!cache.has(focus)) {
      const query = mapFocusToExerciseQuery(focus);
      const remoteExercises = await fetchExercisesFromApi({ ...query, limit: 4 });
      cache.set(focus, remoteExercises);
    }

    const remote = cache.get(focus) ?? [];
    if (!remote.length) return;

    const existingNames = new Set((session.exercises ?? []).map((exercise) => exercise.name.toLowerCase()));
    const additions = remote
      .filter((exercise) => !existingNames.has(exercise.name.toLowerCase()))
      .slice(0, Math.max(0, 3 - (session.exercises?.length ?? 0)))
      .map((exercise): IPlanExercise => ({
        name: exercise.name,
        sets: 3,
        reps: exercise.difficulty === "beginner" ? 12 : 8,
        notes: exercise.instructions?.split(".").slice(0, 2).join(". ") ?? "",
      }));

    session.exercises = [...(session.exercises ?? []), ...additions];
  };

  for (const day of plan.workout_plan.schedule) {
    for (const session of day.sessions) {
      await ensureExercisesForSession(session);
    }
  }
};

const fetchUser = async (userId: string, provided?: IUser) => {
  if (provided) return provided;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const fetchRecentMood = async (userId: string) => {
  const moods = await MoodLog.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean<IMoodLog[]>();
  return { moods, snapshot: inferMoodSnapshot(moods) };
};

export const generatePersonalizedPlanForUser = async (
  userId: string,
  options: GenerationOptions
): Promise<IPersonalizedPlan> => {
  const user = await fetchUser(userId, options.user);
  const { moods, snapshot } = await fetchRecentMood(userId);

  const fallbackPlan = buildMoodAwarePlan(user, snapshot);
  const externalPlanRaw = await callWorkoutPlannerApi(user, {
    reason: options.reason,
    mood_snapshot: snapshot ?? undefined,
  });

  const externalPlanTranslated = translateExternalPlan(externalPlanRaw);
  const blendedPlan = blendExternalWithFallback(user, fallbackPlan, externalPlanTranslated as any);

  await injectExternalExercises(blendedPlan);

  const docPayload = createPersonalizedPlanDocument(user, blendedPlan, externalPlanRaw ? "hybrid" : "fallback", options.reason, {
    moods_used: moods.map((mood) => ({
      id: mood._id?.toString(),
      mood: mood.mood,
      createdAt: mood.createdAt,
    })),
    external_source: externalPlanRaw ? "ai-workout-planner" : undefined,
  });

  const plan = await PersonalizedPlan.create(docPayload);
  return plan.toJSON() as unknown as IPersonalizedPlan;
};

export const getLatestPlanForUser = async (userId: string) => {
  const plan = await PersonalizedPlan.findOne({ user: userId }).sort({ updatedAt: -1 }).lean<IPersonalizedPlan | null>();
  return plan;
};

export const adjustPlanNutritionForUser = async (userId: string, options: AdjustmentOptions) => {
  const latestPlan = await PersonalizedPlan.findOne({ user: userId }).sort({ updatedAt: -1 });
  if (!latestPlan) {
    throw new Error("No personalized plan available to adjust.");
  }

  const updatedNutrition = adjustNutritionPlanWithFoods(
    latestPlan.nutrition_plan,
    options.foods,
    options.purpose ?? "personal preference"
  );

  latestPlan.nutrition_plan = updatedNutrition;
  latestPlan.metadata = {
    ...(latestPlan.metadata ?? {}),
    last_adjustment_reason: options.purpose,
    last_adjustment_foods: options.foods,
    updated_at: new Date().toISOString(),
  };

  await latestPlan.save();
  return latestPlan.toJSON() as unknown as IPersonalizedPlan;
};

export const upsertPersonalIntake = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...payload,
        profile_completed: true,
      },
    },
    { new: true }
  );
  if (!user) {
    throw new Error("Unable to update profile");
  }
  return user.toJSON() as IUser;
};
