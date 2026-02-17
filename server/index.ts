import "dotenv/config";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors, { type CorsOptions } from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import workoutRoutes from "./routes/workouts";
import nutritionRoutes from "./routes/nutrition";
import sleepRoutes from "./routes/sleep";
import insightsRoutes from "./routes/insights";
import recoveryRoutes from "./routes/recovery";
import mealPlanRoutes from "./routes/mealPlans";
import socialRoutes from "./routes/social";
import adminRoutes from "./routes/admin";
import aiRoutes from "./routes/ai";
import personalizationRoutes from "./routes/personalization";
import moodRoutes from "./routes/mood";
import { connectDatabase } from "./config/database";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/fitflow";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const CLIENT_ORIGIN_REGEX = (process.env.CLIENT_ORIGIN_REGEX ?? "")
  .split(",")
  .map((pattern) => pattern.trim())
  .filter(Boolean);
const SERVE_FRONTEND = (process.env.SERVE_FRONTEND ?? "false").trim().toLowerCase() === "true";

const allowedOrigins = new Set([CLIENT_ORIGIN, ...CLIENT_ORIGINS].filter(Boolean));
const allowedOriginRegexes = CLIENT_ORIGIN_REGEX.map((pattern) => {
  try {
    return new RegExp(pattern);
  } catch (error) {
    console.warn(`Ignoring invalid CLIENT_ORIGIN_REGEX pattern: ${pattern}`);
    return null;
  }
}).filter((regex): regex is RegExp => Boolean(regex));

const isOriginAllowed = (origin?: string) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return allowedOriginRegexes.some((regex) => regex.test(origin));
};

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  credentials: false,
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/personalization", personalizationRoutes);
app.use("/api/mood", moodRoutes);

if (SERVE_FRONTEND) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDistCandidates = [
    path.resolve(__dirname, "../dist"),
    path.resolve(__dirname, ".."),
  ];
  const frontendDist = frontendDistCandidates.find((candidate) =>
    existsSync(path.join(candidate, "index.html"))
  );

  if (!frontendDist) {
    console.warn("SERVE_FRONTEND=true but no frontend dist folder with index.html was found.");
  } else {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      return res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

connectDatabase(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API server listening on http://localhost:${PORT}`);
      if (SERVE_FRONTEND) {
        console.log("✅ Frontend static hosting is enabled (SERVE_FRONTEND=true).");
      }
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database", error);
    process.exit(1);
  });
