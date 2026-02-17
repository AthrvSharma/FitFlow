import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export interface IWorkoutSession extends Document {
  user: mongoose.Types.ObjectId;
  workout_name: string;
  workout_type: "strength" | "cardio" | "flexibility" | "sports" | "other";
  duration_minutes?: number;
  calories_burned?: number;
  date: string;
  exercises: IWorkoutExercise[];
  notes?: string;
  overall_rpe?: number;
  energy_level?: "low" | "moderate" | "high";
  shared_with_buddies?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IWorkoutExercise>(
  {
    name: { type: String, required: true },
    sets: Number,
    reps: Number,
    weight: Number,
    notes: String,
  },
  { _id: false }
);

const workoutSessionSchema = new Schema<IWorkoutSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workout_name: { type: String, required: true },
    workout_type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "sports", "other"],
      default: "strength",
    },
    duration_minutes: Number,
    calories_burned: Number,
    date: { type: String, required: true },
    exercises: { type: [exerciseSchema], default: [] },
    notes: String,
    overall_rpe: Number,
    energy_level: {
      type: String,
      enum: ["low", "moderate", "high"],
    },
    shared_with_buddies: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

workoutSessionSchema.index({ user: 1, date: -1 });

workoutSessionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const WorkoutSession: Model<IWorkoutSession> =
  mongoose.models.WorkoutSession || mongoose.model<IWorkoutSession>("WorkoutSession", workoutSessionSchema);
