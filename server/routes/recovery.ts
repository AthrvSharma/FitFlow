import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { RecoveryScore } from "../models/RecoveryScore";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { date, limit } = req.query as { date?: string; limit?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (date) query.date = date;
    const scores = await RecoveryScore.find(query)
      .sort({ date: -1 })
      .limit(limit ? Number(limit) : 0)
      .lean();
    res.json({ scores });
  } catch (error) {
    console.error("List recovery scores error", error);
    res.status(500).json({ message: "Failed to load recovery scores" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const score = await RecoveryScore.findOneAndUpdate(
      { user: req.user!.id, date: payload.date },
      { $set: { ...payload, user: req.user!.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ score: score.toJSON() });
  } catch (error) {
    console.error("Create recovery score error", error);
    res.status(500).json({ message: "Failed to save recovery score" });
  }
});

export default router;
