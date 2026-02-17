import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISleepLog extends Document {
  user: mongoose.Types.ObjectId;
  date: string;
  duration_hours: number;
  sleep_quality?: "poor" | "fair" | "good" | "excellent";
  createdAt: Date;
  updatedAt: Date;
}

const sleepLogSchema = new Schema<ISleepLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    duration_hours: { type: Number, required: true },
    sleep_quality: {
      type: String,
      enum: ["poor", "fair", "good", "excellent"],
    },
  },
  { timestamps: true }
);

sleepLogSchema.index({ user: 1, date: -1 });

sleepLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const SleepLog: Model<ISleepLog> =
  mongoose.models.SleepLog || mongoose.model<ISleepLog>("SleepLog", sleepLogSchema);
