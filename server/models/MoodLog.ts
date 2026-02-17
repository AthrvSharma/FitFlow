import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IMoodLog extends Document {
  user: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const moodLogSchema = new Schema<IMoodLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mood: {
      type: String,
      enum: ["energized", "balanced", "tired", "stressed", "sore", "low", "custom"],
      default: "balanced",
    },
    custom_mood: { type: String, default: "" },
    energy_level: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
    stress_level: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
    motivation_level: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
    soreness_level: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
    sleep_quality: { type: String, enum: ["poor", "fair", "good", "excellent"], default: "good" },
    tags: { type: [String], default: [] },
    note: { type: String, default: "" },
    context: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

moodLogSchema.index({ user: 1, createdAt: -1 });

moodLogSchema.methods.toJSON = function () {
  const moodObject = this.toObject();
  if (moodObject._id) {
    moodObject.id = String(moodObject._id);
    delete moodObject._id;
  }
  if (moodObject.user && typeof moodObject.user === "object") {
    moodObject.user = String(moodObject.user);
  }
  return moodObject;
};

export const MoodLog: Model<IMoodLog> =
  mongoose.models.MoodLog || mongoose.model<IMoodLog>("MoodLog", moodLogSchema);
