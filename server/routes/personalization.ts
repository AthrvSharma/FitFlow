import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import {
  adjustPlanNutritionForUser,
  generatePersonalizedPlanForUser,
  getLatestPlanForUser,
  upsertPersonalIntake,
} from "../services/personalization";
import type { IUser } from "../models/User";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const plan = await getLatestPlanForUser(req.user!.id);
    if (!plan) {
      return res.status(404).json({ message: "No personalized plan available yet." });
    }
    return res.json({ plan });
  } catch (error) {
    console.error("Fetch plan error", error);
    return res.status(500).json({ message: "Failed to load personalized plan" });
  }
});

router.post("/intake", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body as Partial<IUser>;
    const user = await upsertPersonalIntake(req.user!.id, payload);
    return res.json({ user });
  } catch (error) {
    console.error("Intake update error", error);
    return res.status(500).json({ message: "Failed to update onboarding intake" });
  }
});

router.post("/generate", async (req: AuthenticatedRequest, res) => {
  try {
    const { reason = "initial personalized plan" } = req.body as { reason?: string };
    const plan = await generatePersonalizedPlanForUser(req.user!.id, { reason });
    return res.status(201).json({ plan });
  } catch (error) {
    console.error("Plan generation error", error);
    return res.status(500).json({ message: "Failed to generate personalized plan" });
  }
});

router.post("/nutrition/adjust", async (req: AuthenticatedRequest, res) => {
  try {
    const { foods, purpose = "custom tweak" } = req.body as { foods?: string[]; purpose?: string };
    if (!foods || !foods.length) {
      return res.status(400).json({ message: "foods array is required to adjust nutrition plan." });
    }
    const plan = await adjustPlanNutritionForUser(req.user!.id, { foods, purpose });
    return res.json({ plan });
  } catch (error) {
    console.error("Nutrition adjust error", error);
    return res.status(500).json({ message: "Failed to adjust nutrition plan" });
  }
});

export default router;
