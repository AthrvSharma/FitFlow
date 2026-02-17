import React, { useState } from "react";
import { base44, type FoodRecognitionResult, type FoodScanAnalysis } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ScannedMeal = {
  meal_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthy_alternatives?: string[];
  nutrition_tips?: string[];
};

type MealScannerProps = {
  onMealScanned: (meal: ScannedMeal) => void;
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const stripped = result.replace(/^data:[^;]+;base64,/, "").trim();
      if (!stripped) {
        reject(new Error("Unable to process image data"));
        return;
      }
      resolve(stripped);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const estimateMealFromFoods = (foods: FoodRecognitionResult[]): ScannedMeal => {
  const topFoods = foods.slice(0, 4);
  const matchedProfiles: MacroProfile[] = [];

  topFoods.forEach((food) => {
    const lower = food.name.toLowerCase();
    const match = macroLibrary.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
    if (match) {
      matchedProfiles.push(match.profile);
    }
  });

  const profiles = matchedProfiles.length ? matchedProfiles : [fallbackProfile];
  const totals = profiles.reduce(
    (acc, profile) => ({
      calories: acc.calories + profile.calories,
      protein: acc.protein + profile.protein,
      carbs: acc.carbs + profile.carbs,
      fat: acc.fat + profile.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const avg = {
    calories: totals.calories / profiles.length,
    protein: totals.protein / profiles.length,
    carbs: totals.carbs / profiles.length,
    fat: totals.fat / profiles.length,
  };

  const avgConfidence =
    topFoods.length > 0 ? topFoods.reduce((sum, food) => sum + (food.confidence ?? 0), 0) / topFoods.length : 0.7;
  const confidenceMultiplier = avgConfidence >= 0.8 ? 1.05 : avgConfidence >= 0.6 ? 1 : 0.92;

  const mealNameParts = topFoods.slice(0, 2).map((food) => food.name);
  const mealName = mealNameParts.length ? mealNameParts.join(" + ") : "Detected Meal";
  const ingredients = topFoods.map((food) => food.name);

  return {
    meal_name: `AI Scan: ${mealName}`,
    description: `Estimated from detected foods: ${ingredients.join(", ")}`,
    calories: Math.round(clamp(avg.calories * confidenceMultiplier, 180, 950)),
    protein: Math.round(clamp(avg.protein * confidenceMultiplier, 8, 75)),
    carbs: Math.round(clamp(avg.carbs * confidenceMultiplier, 8, 110)),
    fat: Math.round(clamp(avg.fat * confidenceMultiplier, 4, 55)),
    healthy_alternatives: [
      "Add leafy greens or vegetables to increase fiber and micronutrients",
      "Balance the plate with a lean protein source if protein is low",
    ],
    nutrition_tips: [
      "Treat these values as estimates and refine with manual logging when needed",
      "Hydrate with water during and after this meal to support digestion",
    ],
  };
};

const buildMealFromAnalysis = (foods: FoodRecognitionResult[], analysis?: FoodScanAnalysis): ScannedMeal => {
  const estimated = estimateMealFromFoods(foods);
  if (!analysis) return estimated;

  const healthyAlternatives = Array.isArray(analysis.healthy_alternatives)
    ? analysis.healthy_alternatives.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
  const nutritionTips = Array.isArray(analysis.nutrition_tips)
    ? analysis.nutrition_tips.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    meal_name: typeof analysis.meal_name === "string" && analysis.meal_name.trim() ? analysis.meal_name.trim() : estimated.meal_name,
    description:
      typeof analysis.description === "string" && analysis.description.trim()
        ? analysis.description.trim()
        : estimated.description,
    calories: Math.round(clamp(toNumber(analysis.calories, estimated.calories), 80, 2400)),
    protein: Math.round(clamp(toNumber(analysis.protein, estimated.protein), 0, 140)),
    carbs: Math.round(clamp(toNumber(analysis.carbs, estimated.carbs), 0, 260)),
    fat: Math.round(clamp(toNumber(analysis.fat, estimated.fat), 0, 160)),
    healthy_alternatives: healthyAlternatives.length ? healthyAlternatives : estimated.healthy_alternatives,
    nutrition_tips: nutritionTips.length ? nutritionTips : estimated.nutrition_tips,
  };
};

const MealScanner: React.FC<MealScannerProps> = ({ onMealScanned }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedMeal | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<FoodRecognitionResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setErrorMessage(null);
    setScannedData(null);
    setDetectedFoods([]);

    try {
      const base64Image = await readFileAsBase64(file);
      const scan = await base44.nutrition.scanMeal({ base64Image, mimeType: file.type, topK: 6 });
      if (!scan.foods.length) {
        throw new Error("No food detected in the image. Please upload a clear food photo.");
      }
      setDetectedFoods(scan.foods);
      setScannedData(buildMealFromAnalysis(scan.foods, scan.analysis));
    } catch (error) {
      setScannedData(null);
      setDetectedFoods([]);
      setErrorMessage(error instanceof Error ? error.message : "Unable to analyze image");
    } finally {
      setScanning(false);
      event.target.value = "";
    }
  };

  const handleSaveMeal = () => {
    if (scannedData) {
      onMealScanned(scannedData);
      setScannedData(null);
      setDetectedFoods([]);
      setErrorMessage(null);
    }
  };

  return (
    <Card className="glass-effect border-white/60 shadow-2xl">
      <CardHeader className="border-b border-white/40">
        <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-green-600" />
          AI Meal Scanner
        </CardTitle>
        <p className="text-sm text-slate-600 font-medium">Snap a photo to get instant nutrition data</p>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!scannedData ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="meal-upload"
                disabled={scanning}
              />
              <label htmlFor="meal-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    {scanning ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {scanning ? "Analyzing your meal..." : "Upload Food Photo"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Get instant nutrition breakdown</p>
                  </div>
                </div>
              </label>
            </div>
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl glass-effect border-white/60">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{scannedData.meal_name}</h3>
                <p className="text-sm text-slate-600 mb-4">{scannedData.description}</p>

                {detectedFoods.length > 0 && (
                  <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-1">Detected Foods</p>
                    <div className="space-y-1">
                      {detectedFoods.map((food) => (
                        <div key={food.id} className="flex items-center justify-between text-sm text-indigo-900">
                          <span>{food.name}</span>
                          <span className="text-xs font-semibold text-indigo-600">
                            {(food.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-white/60">
                    <p className="text-2xl font-bold text-slate-900">{scannedData.calories}</p>
                    <p className="text-xs text-slate-500 font-semibold">Calories</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-50/60">
                    <p className="text-2xl font-bold text-orange-600">{scannedData.protein}g</p>
                    <p className="text-xs text-slate-500 font-semibold">Protein</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50/60">
                    <p className="text-2xl font-bold text-green-600">{scannedData.carbs}g</p>
                    <p className="text-xs text-slate-500 font-semibold">Carbs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-indigo-50/60">
                    <p className="text-2xl font-bold text-indigo-600">{scannedData.fat}g</p>
                    <p className="text-xs text-slate-500 font-semibold">Fat</p>
                  </div>
                </div>

                {scannedData.healthy_alternatives && scannedData.healthy_alternatives.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm font-bold text-slate-900">Healthier Alternatives:</p>
                    </div>
                    <ul className="space-y-1">
                      {scannedData.healthy_alternatives.map((alt, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scannedData.nutrition_tips && scannedData.nutrition_tips.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-2">Quick Tips:</p>
                    <ul className="space-y-1">
                      {scannedData.nutrition_tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-600">-</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setScannedData(null);
                    setDetectedFoods([]);
                    setErrorMessage(null);
                  }}
                  className="flex-1 glass-effect border-white/60"
                >
                  Scan Another
                </Button>
                <Button
                  onClick={handleSaveMeal}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  Save to Log
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default MealScanner;
export type { ScannedMeal };
