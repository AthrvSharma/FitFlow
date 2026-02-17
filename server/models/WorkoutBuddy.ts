import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWorkoutBuddy extends Document {
  user: mongoose.Types.ObjectId;
  buddy_email: string;
  buddy_name: string;
  status: "active" | "pending" | "paused";
  shared_goals: string[];
  weekly_checkins: number;
  createdAt: Date;
  updatedAt: Date;
}

const workoutBuddySchema = new Schema<IWorkoutBuddy>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buddy_email: { type: String, required: true },
    buddy_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "pending", "paused"],
      default: "pending",
    },
    shared_goals: { type: [String], default: [] },
    weekly_checkins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workoutBuddySchema.index({ user: 1, buddy_email: 1 }, { unique: true });

workoutBuddySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const WorkoutBuddy: Model<IWorkoutBuddy> =
  mongoose.models.WorkoutBuddy || mongoose.model<IWorkoutBuddy>("WorkoutBuddy", workoutBuddySchema);
