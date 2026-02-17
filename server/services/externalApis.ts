import axios from "axios";
import type { IUser } from "../models/User";
import type { IMoodLog } from "../models/MoodLog";

const WORKOUT_PLANNER_API_URL = process.env.WORKOUT_PLANNER_API_URL ?? "";
const WORKOUT_PLANNER_API_KEY = process.env.WORKOUT_PLANNER_API_KEY ?? "";
const EXERCISES_API_URL = process.env.EXERCISES_API_URL ?? "https://api.api-ninjas.com/v1/exercises";
const EXERCISES_API_KEY = process.env.EXERCISES_API_KEY ?? "";

type WorkoutPlannerOptions = {
  reason: string;
  mood_snapshot?: Partial<IMoodLog>;
};

export type ExternalWorkoutPlanDay = {
  day: string;
  focus: string;
  sessions: Array<{
    name: string;
    duration_minutes: number;
    intensity?: string;
    modality?: string;
    notes?: string;
    exercises?: Array<{
      name: string;
      sets?: number;
      reps?: number;
      tempo?: string;
      rest_seconds?: number;
      equipment?: string;
    }>;
  }>;
};

export type ExternalWorkoutPlanResponse = {
  focus_summary?: string;
  schedule?: ExternalWorkoutPlanDay[];
  nutrition_plan?: {
    calories_target?: number;
    macro_split?: { protein?: number; carbs?: number; fat?: number };
    meals?: Array<{
      name: string;
      meal_type?: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      ingredients?: string[];
      notes?: string;
    }>;
    snacks?: Array<{
      name: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      ingredients?: string[];
    }>;
    guidance?: string[];
  };
  lifestyle_plan?: {
    sleep?: { target_hours?: number; wind_down_rituals?: string[] };
    mood_support?: string[];
    recovery_focus?: string[];
    micro_habits?: string[];
  };
  metadata?: Record<string, unknown>;
};

export const callWorkoutPlannerApi = async (
  user: IUser,
  options: WorkoutPlannerOptions
): Promise<ExternalWorkoutPlanResponse | null> => {
  if (!WORKOUT_PLANNER_API_URL || !WORKOUT_PLANNER_API_KEY) {
    return null;
  }

  try {
    const payload = {
      profile: {
        name: user.full_name,
        age: user.age,
        gender: user.gender,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        body_type: user.body_type,
        experience_level: user.experience_level,
        activity_level: user.activity_level,
        primary_goal: user.primary_goal || user.fitness_goal,
        secondary_goal: user.secondary_goal,
        available_equipment: user.available_equipment,
        workout_environment: user.workout_environment,
        preferred_training_time: user.preferred_training_time,
        injuries: user.injuries,
        medical_conditions: user.medical_conditions,
      },
      nutrition: {
        dietary_preference: user.dietary_preference,
        dietary_restrictions: user.dietary_restrictions,
        allergies: user.allergies,
        favorite_foods: user.favorite_foods,
        avoid_foods: user.avoid_foods,
        daily_calorie_target: user.daily_calorie_target,
        macro_targets: {
          protein: user.daily_protein_target,
          carbs: user.daily_carbs_target,
          fat: user.daily_fat_target,
        },
      },
      context: {
        reason: options.reason,
        mood_snapshot: options.mood_snapshot
          ? {
              mood: options.mood_snapshot.mood,
              energy_level: options.mood_snapshot.energy_level,
              stress_level: options.mood_snapshot.stress_level,
              motivation_level: options.mood_snapshot.motivation_level,
              soreness_level: options.mood_snapshot.soreness_level,
              tags: options.mood_snapshot.tags,
            }
          : undefined,
      },
    };

    const response = await axios.post(WORKOUT_PLANNER_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WORKOUT_PLANNER_API_KEY,
      },
      timeout: 12_000,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data as ExternalWorkoutPlanResponse;
    }
    return null;
  } catch (error) {
    console.error("Workout planner API failed", error);
    return null;
  }
};

export type ExternalExercise = {
  name: string;
  type?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string;
};

type ExerciseSearchParams = {
  muscle?: string;
  type?: string;
  difficulty?: string;
  equipment?: string;
  name?: string;
  limit?: number;
};

export const fetchExercisesFromApi = async (
  params: ExerciseSearchParams
): Promise<ExternalExercise[]> => {
  if (!EXERCISES_API_KEY) {
    return [];
  }

  try {
    const response = await axios.get(EXERCISES_API_URL, {
      params,
      headers: {
        "X-Api-Key": EXERCISES_API_KEY,
      },
      timeout: 10_000,
    });

    if (Array.isArray(response.data)) {
      return response.data as ExternalExercise[];
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data as ExternalExercise[];
    }
    return [];
  } catch (error) {
    console.error("Exercises API failed", error);
    return [];
  }
};
