import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { SleepLog } from "../models/SleepLog";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { limit, sort } = req.query as { limit?: string; sort?: string };
    const logsQuery = SleepLog.find({ user: req.user!.id });
    if (sort === "-date") {
      logsQuery.sort({ date: -1, createdAt: -1 });
    } else {
      logsQuery.sort({ date: 1, createdAt: 1 });
    }
    if (limit) logsQuery.limit(Number(limit));
    const logs = await logsQuery.lean();
    res.json({ logs });
  } catch (error) {
    console.error("List sleep logs error", error);
    res.status(500).json({ message: "Failed to load sleep logs" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const log = await SleepLog.create({ ...payload, user: req.user!.id });
    res.status(201).json({ log: log.toJSON() });
  } catch (error) {
    console.error("Create sleep log error", error);
    res.status(500).json({ message: "Failed to save sleep log" });
  }
});

export default router;
