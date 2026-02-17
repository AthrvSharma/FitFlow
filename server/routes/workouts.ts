import { Router } from "express";
import { WorkoutSession } from "../models/WorkoutSession";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { date, limit, sort } = req.query as { date?: string; limit?: string; sort?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (date) {
      query.date = date;
    }

    const mongoQuery = WorkoutSession.find(query);

    if (sort === "-date") {
      mongoQuery.sort({ date: -1, createdAt: -1 });
    } else if (sort === "date") {
      mongoQuery.sort({ date: 1, createdAt: 1 });
    } else {
      mongoQuery.sort({ createdAt: -1 });
    }

    if (limit) {
      mongoQuery.limit(Number(limit));
    }

    const workouts = await mongoQuery.lean();
    res.json({ workouts });
  } catch (error) {
    console.error("List workouts error", error);
    res.status(500).json({ message: "Failed to load workouts" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const workout = await WorkoutSession.create({
      ...payload,
      user: req.user!.id,
    });
    res.status(201).json({ workout: workout.toJSON() });
  } catch (error) {
    console.error("Create workout error", error);
    res.status(500).json({ message: "Failed to save workout" });
  }
});

router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const workout = await WorkoutSession.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      { $set: req.body ?? {} },
      { new: true }
    );
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json({ workout: workout.toJSON() });
  } catch (error) {
    console.error("Update workout error", error);
    res.status(500).json({ message: "Failed to update workout" });
  }
});

export default router;
