import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password_hash: string;
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
  fitness_goal?: string;
  experience_level?: string;
  dietary_preference?: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  favorite_foods?: string[];
  avoid_foods?: string[];
  preferred_cuisines?: string[];
  target_weight?: number;
  daily_calorie_target?: number;
  daily_protein_target?: number;
  daily_carbs_target?: number;
  daily_fat_target?: number;
  daily_water_target_ml?: number;
  sleep_target_hours?: number;
  current_streak?: number;
  longest_streak?: number;
  age?: number;
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
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    gender: { type: String, default: "" },
    height_cm: { type: Number, default: null },
    weight_kg: { type: Number, default: null },
    body_type: { type: String, default: "" },
    primary_goal: { type: String, default: "" },
    secondary_goal: { type: String, default: "" },
    goal_reason: { type: String, default: "" },
    fitness_goal: { type: String, default: "" },
    experience_level: { type: String, default: "intermediate" },
    dietary_preference: { type: String, default: "none" },
    dietary_restrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    favorite_foods: { type: [String], default: [] },
    avoid_foods: { type: [String], default: [] },
    preferred_cuisines: { type: [String], default: [] },
    target_weight: { type: Number, default: 0 },
    daily_calorie_target: { type: Number, default: 2400 },
    daily_protein_target: { type: Number, default: 180 },
    daily_carbs_target: { type: Number, default: 220 },
    daily_fat_target: { type: Number, default: 70 },
    daily_water_target_ml: { type: Number, default: 3000 },
    sleep_target_hours: { type: Number, default: 7 },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    age: { type: Number, default: null },
    activity_level: { type: String, default: "moderate" },
    available_equipment: { type: [String], default: [] },
    workout_environment: { type: String, default: "" },
    preferred_training_time: { type: String, default: "" },
    motivation_style: { type: String, default: "" },
    mood_tags: { type: [String], default: [] },
    stress_level: { type: String, default: "" },
    injuries: { type: [String], default: [] },
    medical_conditions: { type: [String], default: [] },
    lifestyle_notes: { type: String, default: "" },
    hydration_focus: { type: String, default: "" },
    sleep_challenges: { type: [String], default: [] },
    ai_persona: { type: String, default: "" },
    support_expectations: { type: String, default: "" },
    profile_completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password_hash;
  if (userObject._id) {
    userObject.id = userObject._id.toString();
    delete userObject._id;
  }
  if (userObject.user) {
    userObject.user = String(userObject.user);
  }
  return userObject;
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
