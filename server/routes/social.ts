import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { WorkoutBuddy } from "../models/WorkoutBuddy";
import { Challenge } from "../models/Challenge";

const router = Router();

router.use(authenticate);

router.get("/buddies", async (req: AuthenticatedRequest, res) => {
  try {
    const buddies = await WorkoutBuddy.find({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
    res.json({ buddies });
  } catch (error) {
    console.error("List buddies error", error);
    res.status(500).json({ message: "Failed to load buddies" });
  }
});

router.post("/buddies", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const buddy = await WorkoutBuddy.findOneAndUpdate(
      { user: req.user!.id, buddy_email: payload.buddy_email },
      { $setOnInsert: { user: req.user!.id }, $set: payload },
      { new: true, upsert: true }
    );
    res.status(201).json({ buddy: buddy.toJSON() });
  } catch (error) {
    console.error("Create buddy error", error);
    res.status(500).json({ message: "Failed to create buddy" });
  }
});

router.get("/challenges", async (req: AuthenticatedRequest, res) => {
  try {
    const { is_community } = req.query as { is_community?: string };
    const query: Record<string, unknown> = {
      $or: [{ user: req.user!.id }, { is_community: true }],
    };
    if (is_community === "true") {
      query.is_community = true;
    }
    const challenges = await Challenge.find(query).sort({ createdAt: -1 }).lean();
    res.json({ challenges });
  } catch (error) {
    console.error("List challenges error", error);
    res.status(500).json({ message: "Failed to load challenges" });
  }
});

router.post("/challenges", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const challenge = await Challenge.create({ ...payload, user: req.user!.id });
    res.status(201).json({ challenge: challenge.toJSON() });
  } catch (error) {
    console.error("Create challenge error", error);
    res.status(500).json({ message: "Failed to create challenge" });
  }
});

export default router;
