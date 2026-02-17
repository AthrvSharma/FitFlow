import { Router } from "express";
import { MoodLog } from "../models/MoodLog";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = "21" } = req.query as { limit?: string };
    const moods = await MoodLog.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    return res.json({ moods });
  } catch (error) {
    console.error("List moods error", error);
    return res.status(500).json({ message: "Failed to load mood logs" });
  }
});

router.get("/latest", async (req: AuthenticatedRequest, res) => {
  try {
    const mood = await MoodLog.findOne({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
    if (!mood) {
      return res.status(404).json({ message: "No mood entries yet" });
    }
    return res.json({ mood });
  } catch (error) {
    console.error("Latest mood error", error);
    return res.status(500).json({ message: "Failed to fetch latest mood entry" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const mood = await MoodLog.create({
      ...payload,
      mood: payload.mood ?? "balanced",
      tags: payload.tags ?? [],
      user: req.user!.id,
    });
    return res.status(201).json({ mood: mood.toJSON() });
  } catch (error) {
    console.error("Create mood error", error);
    return res.status(500).json({ message: "Failed to record mood entry" });
  }
});

export default router;
