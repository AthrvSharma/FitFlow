import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INutritionLog extends Document {
  user: mongoose.Types.ObjectId;
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: string;
  time?: string;
  createdAt: Date;
  updatedAt: Date;
}

const nutritionLogSchema = new Schema<INutritionLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    meal_name: { type: String, required: true },
    meal_type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      default: "snack",
    },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    date: { type: String, required: true },
    time: String,
  },
  { timestamps: true }
);

nutritionLogSchema.index({ user: 1, date: -1 });

nutritionLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const NutritionLog: Model<INutritionLog> =
  mongoose.models.NutritionLog || mongoose.model<INutritionLog>("NutritionLog", nutritionLogSchema);
