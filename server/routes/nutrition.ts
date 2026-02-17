import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { NutritionLog } from "../models/NutritionLog";
import { WaterLog } from "../models/WaterLog";
import { FoodRecognitionError, recognizeFoodWithGroqVision } from "../services/foodRecognition";

const router = Router();

router.use(authenticate);

router.get("/logs", async (req: AuthenticatedRequest, res) => {
  try {
    const { date, limit, sort } = req.query as { date?: string; limit?: string; sort?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (date) query.date = date;

    const mongoQuery = NutritionLog.find(query);
    if (sort === "-date") {
      mongoQuery.sort({ date: -1, time: -1, createdAt: -1 });
    } else {
      mongoQuery.sort({ date: 1, time: 1, createdAt: 1 });
    }
    if (limit) mongoQuery.limit(Number(limit));

    const meals = await mongoQuery.lean();
    res.json({ meals });
  } catch (error) {
    console.error("List meals error", error);
    res.status(500).json({ message: "Failed to load meals" });
  }
});

router.post("/logs", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const meal = await NutritionLog.create({ ...payload, user: req.user!.id });
    res.status(201).json({ meal: meal.toJSON() });
  } catch (error) {
    console.error("Create meal error", error);
    res.status(500).json({ message: "Failed to save meal" });
  }
});

router.get("/water", async (req: AuthenticatedRequest, res) => {
  try {
    const { date, limit } = req.query as { date?: string; limit?: string };
    const query: Record<string, unknown> = { user: req.user!.id };
    if (date) query.date = date;

    const logs = await WaterLog.find(query)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .limit(limit ? Number(limit) : 0)
      .lean();
    res.json({ logs });
  } catch (error) {
    console.error("List water logs error", error);
    res.status(500).json({ message: "Failed to load water logs" });
  }
});

router.post("/water", async (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body ?? {};
    const log = await WaterLog.create({ ...payload, user: req.user!.id });
    res.status(201).json({ log: log.toJSON() });
  } catch (error) {
    console.error("Create water log error", error);
    res.status(500).json({ message: "Failed to save water log" });
  }
});

router.post("/recognize", async (req: AuthenticatedRequest, res) => {
  try {
    const { imageUrl, base64Image, mimeType, topK } = req.body as {
      imageUrl?: string;
      base64Image?: string;
      mimeType?: string;
      topK?: number;
    };
    const recognition = await recognizeFoodWithGroqVision({
      imageUrl,
      base64Image,
      mimeType,
      topK,
    });
    return res.json({
      foods: recognition.foods.map((concept) => ({
        id: concept.id,
        name: concept.name,
        confidence: concept.confidence,
      })),
      analysis: recognition.analysis,
    });
  } catch (error) {
    if (error instanceof FoodRecognitionError) {
      if (error.statusCode >= 500) {
        console.error("Food recognition error", error.message);
      } else {
        console.warn("Food recognition warning", error.message);
      }
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Food recognition error", error);
    const message = error instanceof Error ? error.message : "Unable to analyze food image";
    return res.status(502).json({ message });
  }
});

export default router;
