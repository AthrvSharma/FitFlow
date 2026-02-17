import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWaterLog extends Document {
  user: mongoose.Types.ObjectId;
  date: string;
  amount_ml: number;
  time?: string;
  createdAt: Date;
  updatedAt: Date;
}

const waterLogSchema = new Schema<IWaterLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    amount_ml: { type: Number, required: true },
    time: String,
  },
  { timestamps: true }
);

waterLogSchema.index({ user: 1, date: -1 });

waterLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const WaterLog: Model<IWaterLog> =
  mongoose.models.WaterLog || mongoose.model<IWaterLog>("WaterLog", waterLogSchema);
