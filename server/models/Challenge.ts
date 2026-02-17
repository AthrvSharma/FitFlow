import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IChallenge extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  target: string;
  participants: string[];
  start_date?: string;
  end_date?: string;
  prize?: string;
  is_community: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    target: { type: String, required: true },
    participants: { type: [String], default: [] },
    start_date: String,
    end_date: String,
    prize: String,
    is_community: { type: Boolean, default: false },
  },
  { timestamps: true }
);

challengeSchema.index({ user: 1, is_community: 1 });

challengeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() ?? ret.user;
    delete ret._id;
  },
});

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>("Challenge", challengeSchema);
