import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAIInsight extends Document {
  user: mongoose.Types.ObjectId;
  date: string;
  type: "workout" | "nutrition" | "recovery" | "motivation" | "recommendation";
  title: string;
  message: string;
  priority?: "low" | "medium" | "high";
  action_items?: string[];
  read?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aiInsightSchema = new Schema<IAIInsight>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    type: {
      type: String,
      enum: ["workout", "nutrition", "recovery", "motivation", "recommendation"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    action_items: { type: [String], default: [] },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

aiInsightSchema.index({ user: 1, date: -1 });

aiInsightSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const AIInsight: Model<IAIInsight> =
  mongoose.models.AIInsight || mongoose.model<IAIInsight>("AIInsight", aiInsightSchema);
