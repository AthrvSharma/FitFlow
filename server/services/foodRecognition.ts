const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_API_BASE_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_VISION_MIN_FOOD_CONFIDENCE = Number(process.env.GROQ_VISION_MIN_FOOD_CONFIDENCE ?? 0.45);
const GROQ_VISION_MAX_TOKENS = Number(process.env.GROQ_VISION_MAX_TOKENS ?? 900);
const GROQ_VISION_TEMPERATURE = Number(process.env.GROQ_VISION_TEMPERATURE ?? 0.1);

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const buildChatCompletionsUrl = (baseUrl: string) => {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith("/v1")) {
    return `${normalized}/chat/completions`;
  }
  return `${normalized}/v1/chat/completions`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const coerceNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeConfidence = (value: unknown) => {
  const raw = coerceNumber(value, 0);
  if (!Number.isFinite(raw)) return 0;
  if (raw > 1) return clamp(raw / 100, 0, 1);
  return clamp(raw, 0, 1);
};

const parseStringList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length ? normalized : fallback;
};

const parseJsonPayload = <T>(raw: string): T => {
  const withoutFence = raw.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(withoutFence) as T;
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(withoutFence.slice(start, end + 1)) as T;
    }
    throw new Error("Vision response was not valid JSON");
  }
};

const extractResponseText = (payload: unknown) => {
  const data = payload as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string; content?: string }> | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        if (typeof part.text === "string") return part.text;
        if (typeof part.content === "string") return part.content;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
};

type MacroProfile = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const macroLibrary: Array<{ keywords: string[]; profile: MacroProfile }> = [
  { keywords: ["chicken", "turkey"], profile: { calories: 420, protein: 42, carbs: 22, fat: 16 } },
  { keywords: ["salmon", "fish", "tuna"], profile: { calories: 460, protein: 38, carbs: 18, fat: 24 } },
  { keywords: ["beef", "steak"], profile: { calories: 510, protein: 40, carbs: 20, fat: 28 } },
  { keywords: ["rice", "quinoa", "grain", "pasta"], profile: { calories: 470, protein: 18, carbs: 62, fat: 12 } },
  { keywords: ["egg", "omelet"], profile: { calories: 360, protein: 26, carbs: 10, fat: 22 } },
  { keywords: ["yogurt", "parfait", "milk"], profile: { calories: 320, protein: 24, carbs: 28, fat: 12 } },
  { keywords: ["smoothie", "shake"], profile: { calories: 390, protein: 30, carbs: 34, fat: 14 } },
  { keywords: ["salad", "vegetable", "broccoli", "spinach"], profile: { calories: 260, protein: 12, carbs: 26, fat: 10 } },
  { keywords: ["pizza", "burger", "fries"], profile: { calories: 720, protein: 28, carbs: 68, fat: 36 } },
  { keywords: ["dessert", "cake", "cookie", "ice cream"], profile: { calories: 540, protein: 8, carbs: 72, fat: 24 } },
];

const fallbackProfile: MacroProfile = { calories: 430, protein: 24, carbs: 40, fat: 16 };

const estimateNutritionFromFoods = (foods: FoodRecognitionConcept[]) => {
  const topFoods = foods.slice(0, 4);
  const matches = topFoods
    .map((food) => {
      const lower = food.name.toLowerCase();
      return macroLibrary.find((entry) =>
        entry.keywords.some((keyword) => lower.includes(keyword))
      )?.profile;
    })
    .filter((profile): profile is MacroProfile => Boolean(profile));

  const profiles = matches.length ? matches : [fallbackProfile];
  const totals = profiles.reduce(
    (acc, profile) => ({
      calories: acc.calories + profile.calories,
      protein: acc.protein + profile.protein,
      carbs: acc.carbs + profile.carbs,
      fat: acc.fat + profile.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const average = {
    calories: totals.calories / profiles.length,
    protein: totals.protein / profiles.length,
    carbs: totals.carbs / profiles.length,
    fat: totals.fat / profiles.length,
  };

  const avgConfidence =
    topFoods.length > 0 ? topFoods.reduce((sum, food) => sum + food.confidence, 0) / topFoods.length : 0.75;
  const multiplier = avgConfidence >= 0.8 ? 1.05 : avgConfidence >= 0.6 ? 1 : 0.92;

  return {
    calories: Math.round(clamp(average.calories * multiplier, 180, 980)),
    protein: Math.round(clamp(average.protein * multiplier, 8, 80)),
    carbs: Math.round(clamp(average.carbs * multiplier, 8, 115)),
    fat: Math.round(clamp(average.fat * multiplier, 4, 60)),
  };
};

const buildImagePayload = (base64Image?: string, mimeType?: string, imageUrl?: string) => {
  if (imageUrl?.trim()) {
    return imageUrl.trim();
  }
  if (!base64Image) return "";
  const normalizedMime = mimeType?.trim() ? mimeType.trim() : "image/jpeg";
  return `data:${normalizedMime};base64,${base64Image}`;
};

type FoodRecognitionInput = {
  imageUrl?: string;
  base64Image?: string;
  mimeType?: string;
  topK?: number;
};

export type FoodRecognitionConcept = {
  id: string;
  name: string;
  confidence: number;
};

export type FoodScanAnalysis = {
  meal_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthy_alternatives: string[];
  nutrition_tips: string[];
};

type FoodRecognitionResult = {
  foods: FoodRecognitionConcept[];
  analysis: FoodScanAnalysis;
};

type VisionFoodCandidate = {
  id?: string;
  name?: string;
  label?: string;
  food?: string;
  confidence?: number | string;
  score?: number | string;
  probability?: number | string;
};

type VisionModelResponse = {
  is_food?: boolean;
  reason_if_not_food?: string;
  foods?: VisionFoodCandidate[];
  detected_foods?: VisionFoodCandidate[];
  analysis?: Partial<FoodScanAnalysis>;
};

export class FoodRecognitionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "FoodRecognitionError";
    this.statusCode = statusCode;
  }
}

export class NoFoodDetectedError extends FoodRecognitionError {
  constructor(message = "No food detected in the image. Please upload a clear food photo.") {
    super(message, 422);
    this.name = "NoFoodDetectedError";
  }
}

const normalizeDetectedFoods = (response: VisionModelResponse, topK: number): FoodRecognitionConcept[] => {
  const rawFoods = Array.isArray(response.foods)
    ? response.foods
    : Array.isArray(response.detected_foods)
      ? response.detected_foods
      : [];

  return rawFoods
    .map((candidate, index) => {
      const name = candidate.name ?? candidate.label ?? candidate.food ?? "";
      return {
        id: candidate.id ?? `food-${index}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name: String(name).trim(),
        confidence: normalizeConfidence(candidate.confidence ?? candidate.score ?? candidate.probability),
      };
    })
    .filter((food) => food.name.length > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK);
};

const toFoodScanAnalysis = (
  response: VisionModelResponse,
  foods: FoodRecognitionConcept[]
): FoodScanAnalysis => {
  const fallbackMacro = estimateNutritionFromFoods(foods);
  const topFoodNames = foods.slice(0, 3).map((food) => food.name);
  const fallbackName = topFoodNames.length ? `AI Scan: ${topFoodNames.slice(0, 2).join(" + ")}` : "AI Scanned Meal";
  const fallbackDescription = topFoodNames.length
    ? `Estimated from detected foods: ${topFoodNames.join(", ")}.`
    : "Estimated from uploaded meal image.";

  const analysis = response.analysis ?? {};

  return {
    meal_name:
      typeof analysis.meal_name === "string" && analysis.meal_name.trim()
        ? analysis.meal_name.trim()
        : fallbackName,
    description:
      typeof analysis.description === "string" && analysis.description.trim()
        ? analysis.description.trim()
        : fallbackDescription,
    calories: Math.round(clamp(coerceNumber(analysis.calories, fallbackMacro.calories), 80, 2200)),
    protein: Math.round(clamp(coerceNumber(analysis.protein, fallbackMacro.protein), 0, 120)),
    carbs: Math.round(clamp(coerceNumber(analysis.carbs, fallbackMacro.carbs), 0, 220)),
    fat: Math.round(clamp(coerceNumber(analysis.fat, fallbackMacro.fat), 0, 120)),
    healthy_alternatives: parseStringList(analysis.healthy_alternatives, [
      "Add vegetables or salad to improve fiber and micronutrients.",
      "Prioritize lean protein portions to keep macros balanced.",
    ]),
    nutrition_tips: parseStringList(analysis.nutrition_tips, [
      "Treat AI scan macros as estimates and refine with manual logging when needed.",
      "Pair this meal with water intake to support digestion and recovery.",
    ]),
  };
};

export const recognizeFoodWithGroqVision = async ({
  imageUrl,
  base64Image,
  mimeType,
  topK = 8,
}: FoodRecognitionInput): Promise<FoodRecognitionResult> => {
  if (!GROQ_API_KEY) {
    throw new FoodRecognitionError("GROQ_API_KEY is not configured for vision scanning.", 503);
  }

  if (!imageUrl && !base64Image) {
    throw new FoodRecognitionError("Either imageUrl or base64Image must be provided.", 400);
  }

  const topKSafe = clamp(Math.round(coerceNumber(topK, 8)), 1, 12);
  const imagePayload = buildImagePayload(base64Image, mimeType, imageUrl);
  if (!imagePayload) {
    throw new FoodRecognitionError("Invalid image payload.", 400);
  }

  const requestUrl = buildChatCompletionsUrl(GROQ_API_BASE_URL);
  const systemPrompt =
    "You are FitFlow food vision analyst. Inspect one meal image and return STRICT JSON only.";
  const userPrompt = `Analyze this image and return JSON with this exact schema:
{
  "is_food": boolean,
  "reason_if_not_food": "string",
  "foods": [
    { "name": "string", "confidence": 0.0 }
  ],
  "analysis": {
    "meal_name": "string",
    "description": "string",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "healthy_alternatives": ["string"],
    "nutrition_tips": ["string"]
  }
}

Rules:
- If image is not food or drink, set is_food=false and explain why.
- Confidence must be 0 to 1.
- Use ${topKSafe} foods max.
- Macros should be realistic for visible portion size.
- No markdown, no extra keys, no commentary.`;

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imagePayload } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: GROQ_VISION_TEMPERATURE,
        max_tokens: GROQ_VISION_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let upstreamMessage = text;
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        if (parsed?.error?.message) {
          upstreamMessage = parsed.error.message;
        }
      } catch {
        // keep raw text fallback
      }

      const normalizedMessage = upstreamMessage.toLowerCase();
      if (normalizedMessage.includes("failed to retrieve media")) {
        throw new FoodRecognitionError(
          "Unable to fetch the image URL. Upload a photo directly or use a publicly accessible image URL.",
          400
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new FoodRecognitionError(
          "Groq Vision authentication failed. Check GROQ_API_KEY.",
          401
        );
      }
      if (response.status === 429) {
        throw new FoodRecognitionError(
          "Groq Vision rate limit reached. Please retry shortly.",
          429
        );
      }
      throw new FoodRecognitionError(
        `Groq vision request failed (${response.status}).`,
        502
      );
    }

    const payload = (await response.json()) as unknown;
    const rawContent = extractResponseText(payload);
    if (!rawContent) {
      throw new FoodRecognitionError("Groq vision returned an empty response.", 502);
    }

    const parsed = parseJsonPayload<VisionModelResponse>(rawContent);
    if (parsed.is_food === false) {
      throw new NoFoodDetectedError(
        parsed.reason_if_not_food?.trim()
          ? `No food detected: ${parsed.reason_if_not_food.trim()}`
          : "No food detected in the image. Please upload a clear food photo."
      );
    }

    const foods = normalizeDetectedFoods(parsed, topKSafe);
    if (!foods.length) {
      throw new NoFoodDetectedError();
    }

    if (foods[0].confidence < GROQ_VISION_MIN_FOOD_CONFIDENCE) {
      throw new NoFoodDetectedError(
        `No food was confidently detected (top confidence ${(foods[0].confidence * 100).toFixed(
          1
        )}%). Please upload a clearer food image.`
      );
    }

    return {
      foods,
      analysis: toFoodScanAnalysis(parsed, foods),
    };
  } catch (error) {
    if (error instanceof FoodRecognitionError) {
      throw error;
    }
    console.error("Groq vision food recognition failed", error);
    throw new FoodRecognitionError("Unable to analyze food image via Groq Vision.", 502);
  }
};
