import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { AIInsight } from "../models/AIInsight";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { limit, sort, unread } = req.query as { limit?: string; sort?: string; unread?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (unread === "true") {
      query.read = false;
    }
    const insightsQuery = AIInsight.find(query);
    if (sort === "-date") {
      insightsQuery.sort({ date: -1, createdAt: -1 });
    } else {
      insightsQuery.sort({ createdAt: -1 });
    }
    if (limit) insightsQuery.limit(Number(limit));
    const insights = await insightsQuery.lean();
    res.json({ insights });
  } catch (error) {
    console.error("List insights error", error);
    res.status(500).json({ message: "Failed to load insights" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const insight = await AIInsight.create({ ...payload, user: req.user!.id });
    res.status(201).json({ insight: insight.toJSON() });
  } catch (error) {
    console.error("Create insight error", error);
    res.status(500).json({ message: "Failed to save insight" });
  }
});

router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const insight = await AIInsight.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      { $set: req.body ?? {} },
      { new: true }
    );
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    res.json({ insight: insight.toJSON() });
  } catch (error) {
    console.error("Update insight error", error);
    res.status(500).json({ message: "Failed to update insight" });
  }
});

router.patch("/:id/read", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const insight = await AIInsight.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    res.json({ insight: insight.toJSON() });
  } catch (error) {
    console.error("Update insight error", error);
    res.status(500).json({ message: "Failed to update insight" });
  }
});

export default router;
