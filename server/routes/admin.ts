import { Router } from "express";
import { authenticate, requireAdmin, type AuthenticatedRequest } from "../middleware/auth";
import { User } from "../models/User";
import { WorkoutSession } from "../models/WorkoutSession";
import { NutritionLog } from "../models/NutritionLog";
import { RecoveryScore } from "../models/RecoveryScore";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find().select("full_name email role fitness_goal experience_level current_streak longest_streak").lean();
    res.json({ users });
  } catch (error) {
    console.error("Admin users list error", error);
    res.status(500).json({ message: "Failed to load users" });
  }
});

router.get("/users/:userId/summary", async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const [workoutCount, nutritionCount, latestRecovery] = await Promise.all([
      WorkoutSession.countDocuments({ user: userId }),
      NutritionLog.countDocuments({ user: userId }),
      RecoveryScore.findOne({ user: userId }).sort({ date: -1 }).lean(),
    ]);

    res.json({
      metrics: {
        workouts: workoutCount,
        meals: nutritionCount,
        latestRecovery: latestRecovery ?? null,
      },
    });
  } catch (error) {
    console.error("Admin user summary error", error);
    res.status(500).json({ message: "Failed to load user summary" });
  }
});

export default router;
