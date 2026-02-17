import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IPlanExercise {
  name: string;
  sets?: number;
  reps?: number;
  tempo?: string;
  rest_seconds?: number;
  equipment?: string;
  notes?: string;
}

export interface IPlanSession {
  name: string;
  focus: string;
  duration_minutes: number;
  intensity: "low" | "moderate" | "high" | "custom";
  modality?: string;
  guidance?: string;
  exercises: IPlanExercise[];
}

export interface IPlanDay {
  day: string;
  emphasis: string;
  sessions: IPlanSession[];
  recovery?: {
    focus: string;
    duration_minutes?: number;
    notes?: string;
  };
  mindset?: string;
}

export interface INutritionMeal {
  name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "preworkout" | "postworkout" | "custom";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  ingredients: string[];
  preparation?: string;
  swaps?: string[];
  notes?: string;
}

export interface INutritionPlan {
  calories_target: number;
  macro_split: {
    protein: number;
    carbs: number;
    fat: number;
  };
  hydration_ml: number;
  meals: INutritionMeal[];
  snacks?: INutritionMeal[];
  supplements?: string[];
  guidance?: string[];
}

export interface ILifestylePlan {
  sleep: {
    target_hours: number;
    wind_down_rituals: string[];
  };
  mood_support: string[];
  recovery_focus: string[];
  micro_habits: string[];
}

export interface IPersonalizedPlan extends Document {
  user: Types.ObjectId;
  version: number;
  source: "external" | "fallback" | "hybrid";
  generated_reason: string;
  workout_plan: {
    focus_summary: string;
    schedule: IPlanDay[];
  };
  nutrition_plan: INutritionPlan;
  lifestyle_plan: ILifestylePlan;
  readiness_score?: number | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const planDaySchema = new Schema<IPlanDay>(
  {
    day: { type: String, required: true },
    emphasis: { type: String, required: true },
    sessions: [
      new Schema<IPlanSession>(
        {
          name: { type: String, required: true },
          focus: { type: String, required: true },
          duration_minutes: { type: Number, required: true },
          intensity: { type: String, enum: ["low", "moderate", "high", "custom"], default: "moderate" },
          modality: { type: String, default: "" },
          guidance: { type: String, default: "" },
          exercises: [
            new Schema<IPlanExercise>(
              {
                name: { type: String, required: true },
                sets: { type: Number, default: null },
                reps: { type: Number, default: null },
                tempo: { type: String, default: "" },
                rest_seconds: { type: Number, default: null },
                equipment: { type: String, default: "" },
                notes: { type: String, default: "" },
              },
              { _id: false }
            ),
          ],
        },
        { _id: false }
      ),
    ],
    recovery: {
      focus: { type: String, default: "" },
      duration_minutes: { type: Number, default: null },
      notes: { type: String, default: "" },
    },
    mindset: { type: String, default: "" },
  },
  { _id: false }
);

const nutritionMealSchema = new Schema<INutritionMeal>(
  {
    name: { type: String, required: true },
    meal_type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "preworkout", "postworkout", "custom"],
      default: "custom",
    },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: null },
    ingredients: { type: [String], default: [] },
    preparation: { type: String, default: "" },
    swaps: { type: [String], default: [] },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const nutritionPlanSchema = new Schema<INutritionPlan>(
  {
    calories_target: { type: Number, required: true },
    macro_split: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    hydration_ml: { type: Number, required: true },
    meals: { type: [nutritionMealSchema], default: [] },
    snacks: { type: [nutritionMealSchema], default: [] },
    supplements: { type: [String], default: [] },
    guidance: { type: [String], default: [] },
  },
  { _id: false }
);

const lifestylePlanSchema = new Schema<ILifestylePlan>(
  {
    sleep: {
      target_hours: { type: Number, default: 7 },
      wind_down_rituals: { type: [String], default: [] },
    },
    mood_support: { type: [String], default: [] },
    recovery_focus: { type: [String], default: [] },
    micro_habits: { type: [String], default: [] },
  },
  { _id: false }
);

const personalizedPlanSchema = new Schema<IPersonalizedPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    version: { type: Number, default: 1 },
    source: { type: String, enum: ["external", "fallback", "hybrid"], default: "fallback" },
    generated_reason: { type: String, default: "initial" },
    workout_plan: {
      focus_summary: { type: String, default: "" },
      schedule: { type: [planDaySchema], default: [] },
    },
    nutrition_plan: { type: nutritionPlanSchema, default: () => ({}) },
    lifestyle_plan: { type: lifestylePlanSchema, default: () => ({}) },
    readiness_score: { type: Number, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

personalizedPlanSchema.index({ user: 1, updatedAt: -1 });

personalizedPlanSchema.methods.toJSON = function () {
  const planObject = this.toObject();
  if (planObject._id) {
    planObject.id = String(planObject._id);
    delete planObject._id;
  }
  return planObject;
};

export const PersonalizedPlan: Model<IPersonalizedPlan> =
  mongoose.models.PersonalizedPlan ||
  mongoose.model<IPersonalizedPlan>("PersonalizedPlan", personalizedPlanSchema);
