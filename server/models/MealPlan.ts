import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMealPlanMeal {
  day: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_name: string;
  ingredients: string[];
  prep_time?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface IMealPlanGroceryItem {
  item: string;
  quantity: string;
  purchased: boolean;
}

export interface IMealPlan extends Document {
  user: mongoose.Types.ObjectId;
  week_start_date: string;
  meals: IMealPlanMeal[];
  grocery_list: IMealPlanGroceryItem[];
  total_cost_estimate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMealPlanMeal>(
  {
    day: { type: String, required: true },
    meal_type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    recipe_name: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    prep_time: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  { _id: false }
);

const grocerySchema = new Schema<IMealPlanGroceryItem>(
  {
    item: { type: String, required: true },
    quantity: { type: String, required: true },
    purchased: { type: Boolean, default: false },
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    week_start_date: { type: String, required: true },
    meals: { type: [mealSchema], default: [] },
    grocery_list: { type: [grocerySchema], default: [] },
    total_cost_estimate: Number,
  },
  { timestamps: true }
);

mealPlanSchema.index({ user: 1, week_start_date: -1 }, { unique: true });

mealPlanSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan || mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
