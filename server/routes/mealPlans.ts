import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { MealPlan } from "../models/MealPlan";

const router = Router();

router.use(authenticate);

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { week_start_date } = req.query as { week_start_date?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (week_start_date) query.week_start_date = week_start_date;

    const plans = await MealPlan.find(query).sort({ week_start_date: -1 }).lean();
    res.json({ plans });
  } catch (error) {
    console.error("List meal plans error", error);
    res.status(500).json({ message: "Failed to load meal plans" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const week_start_date =
      typeof payload.week_start_date === "string" ? payload.week_start_date.trim() : "";

    if (!week_start_date) {
      return res.status(400).json({ message: "week_start_date is required" });
    }

    const query = { user: req.user!.id, week_start_date };
    const existing = await MealPlan.findOne(query).select("_id").lean();

    const updatePayload = { ...(payload as Record<string, unknown>) };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.user;
    updatePayload.week_start_date = week_start_date;

    const plan = await MealPlan.findOneAndUpdate(
      query,
      {
        $set: updatePayload,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!plan) {
      return res.status(500).json({ message: "Failed to save meal plan" });
    }

    return res.status(existing ? 200 : 201).json({ plan: plan.toJSON() });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "A meal plan already exists for this week" });
    }
    console.error("Create meal plan error", error);
    return res.status(500).json({ message: "Failed to save meal plan" });
  }
});

router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updatePayload = { ...(req.body ?? {}) } as Record<string, unknown>;
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.user;

    const plan = await MealPlan.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }
    return res.json({ plan: plan.toJSON() });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "A meal plan already exists for this week" });
    }
    console.error("Update meal plan error", error);
    return res.status(500).json({ message: "Failed to update meal plan" });
  }
});

export default router;
