import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, type IUser } from "../models/User";
import { generateToken } from "../utils/token";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { generatePersonalizedPlanForUser } from "../services/personalization";

const sanitizeProfileInput = (input: Partial<IUser>): Partial<IUser> => {
  const numberFields: (keyof Partial<IUser>)[] = [
    "age",
    "height_cm",
    "weight_kg",
    "target_weight",
    "daily_calorie_target",
    "daily_protein_target",
    "daily_carbs_target",
    "daily_fat_target",
    "daily_water_target_ml",
    "sleep_target_hours",
  ];
  const arrayFields: (keyof Partial<IUser>)[] = [
    "dietary_restrictions",
    "allergies",
    "favorite_foods",
    "avoid_foods",
    "preferred_cuisines",
    "available_equipment",
    "mood_tags",
    "injuries",
    "medical_conditions",
    "sleep_challenges",
  ];
  const stringFields: (keyof Partial<IUser>)[] = [
    "first_name",
    "last_name",
    "gender",
    "body_type",
    "primary_goal",
    "secondary_goal",
    "goal_reason",
    "fitness_goal",
    "experience_level",
    "dietary_preference",
    "activity_level",
    "workout_environment",
    "preferred_training_time",
    "motivation_style",
    "stress_level",
    "lifestyle_notes",
    "hydration_focus",
    "ai_persona",
    "support_expectations",
  ];

  const sanitized: Partial<IUser> = {};

  numberFields.forEach((field) => {
    if (input[field] !== undefined && input[field] !== null) {
      const value = Number((input[field] as unknown as string) ?? 0);
      if (!Number.isNaN(value)) {
        sanitized[field] = value as any;
      }
    }
  });

  arrayFields.forEach((field) => {
    const value = input[field];
    if (Array.isArray(value)) {
      sanitized[field] = value.map((item) => String(item).trim()).filter(Boolean) as any;
    } else if (typeof value === "string" && value.trim()) {
      sanitized[field] = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean) as any;
    }
  });

  stringFields.forEach((field) => {
    const value = input[field];
    if (typeof value === "string") {
      sanitized[field] = value.trim() as any;
    }
  });

  return sanitized;
};

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      profile,
    } = req.body as {
      email?: string;
      password?: string;
      full_name?: string;
      profile?: Partial<IUser>;
    };
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: "email, password, and full_name are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const intakeSource = profile && typeof profile === "object" ? profile : req.body;

    const profileData = sanitizeProfileInput(intakeSource as Partial<IUser>);
    if (profileData.primary_goal && !profileData.fitness_goal) {
      profileData.fitness_goal = profileData.primary_goal;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const existingCount = await User.countDocuments();
    const role: "user" | "admin" = existingCount === 0 ? "admin" : "user";
    const user = await User.create({
      email,
      password_hash,
      full_name,
      role,
      ...profileData,
      profile_completed: Object.keys(profileData).length > 0,
    });
    const token = generateToken(user);

    if (Object.keys(profileData).length > 0) {
      void generatePersonalizedPlanForUser(String(user._id), {
        reason: "post-registration intake",
        user,
      }).catch((error) => {
        console.error("Background plan generation failed", error);
      });
    }

    return res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ message: "Failed to register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    return res.status(200).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error("Me error", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.put("/profile", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const incoming = (req.body ?? {}) as Partial<IUser> & { full_name?: string };
    const sanitized = sanitizeProfileInput(incoming);
    const updates: Partial<IUser> = { ...sanitized };

    if (typeof incoming.full_name === "string" && incoming.full_name.trim()) {
      updates.full_name = incoming.full_name.trim();
    }
    if (typeof incoming.primary_goal === "string" && !updates.fitness_goal) {
      updates.fitness_goal = incoming.primary_goal.trim();
    }
    if (Object.keys(sanitized).length > 0) {
      updates.profile_completed = true;
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error("Profile update error", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
