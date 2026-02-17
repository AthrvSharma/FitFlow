import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRecoveryScore extends Document {
  user: mongoose.Types.ObjectId;
  date: string;
  overall_score: number;
  sleep_score: number;
  nutrition_score: number;
  workout_load_score: number;
  readiness: "ready" | "moderate" | "rest";
  recommendations: string[];
  suggested_workout_intensity: "high" | "moderate" | "low" | "active_recovery";
  createdAt: Date;
  updatedAt: Date;
}

const recoveryScoreSchema = new Schema<IRecoveryScore>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    overall_score: { type: Number, required: true },
    sleep_score: { type: Number, required: true },
    nutrition_score: { type: Number, required: true },
    workout_load_score: { type: Number, required: true },
    readiness: {
      type: String,
      enum: ["ready", "moderate", "rest"],
      required: true,
    },
    recommendations: { type: [String], default: [] },
    suggested_workout_intensity: {
      type: String,
      enum: ["high", "moderate", "low", "active_recovery"],
      required: true,
    },
  },
  { timestamps: true }
);

recoveryScoreSchema.index({ user: 1, date: -1 }, { unique: true });

recoveryScoreSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const RecoveryScore: Model<IRecoveryScore> =
  mongoose.models.RecoveryScore || mongoose.model<IRecoveryScore>("RecoveryScore", recoveryScoreSchema);
