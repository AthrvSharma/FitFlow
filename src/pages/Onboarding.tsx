import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { base44, type DemoUser, type PersonalIntake } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/modules/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type IntakeForm = PersonalIntake & {
  full_name?: string;
};

const defaultIntake = (user: DemoUser | null): IntakeForm => ({
  full_name: user?.full_name ?? "",
  age: user?.age ?? undefined,
  height_cm: user?.height_cm ?? undefined,
  weight_kg: user?.weight_kg ?? undefined,
  target_weight: user?.target_weight ?? undefined,
  gender: user?.gender ?? "",
  body_type: user?.body_type ?? "",
  primary_goal: user?.primary_goal ?? user?.fitness_goal ?? "",
  secondary_goal: user?.secondary_goal ?? "",
  goal_reason: user?.goal_reason ?? "",
  fitness_goal: user?.fitness_goal ?? "",
  experience_level: user?.experience_level ?? "intermediate",
  dietary_preference: user?.dietary_preference ?? "none",
  dietary_restrictions: user?.dietary_restrictions ?? [],
  allergies: user?.allergies ?? [],
  favorite_foods: user?.favorite_foods ?? [],
  avoid_foods: user?.avoid_foods ?? [],
  preferred_cuisines: user?.preferred_cuisines ?? [],
  activity_level: user?.activity_level ?? "moderately_active",
  available_equipment: user?.available_equipment ?? [],
  workout_environment: user?.workout_environment ?? "gym",
  preferred_training_time: user?.preferred_training_time ?? "early_morning",
  motivation_style: user?.motivation_style ?? "data-driven",
  mood_tags: user?.mood_tags ?? [],
  stress_level: user?.stress_level ?? "moderate",
  injuries: user?.injuries ?? [],
  medical_conditions: user?.medical_conditions ?? [],
  lifestyle_notes: user?.lifestyle_notes ?? "",
  support_expectations: user?.support_expectations ?? "",
  hydration_focus: user?.hydration_focus ?? "",
  sleep_challenges: user?.sleep_challenges ?? [],
  sleep_target_hours: user?.sleep_target_hours ?? 7,
  daily_water_target_ml: user?.daily_water_target_ml ?? 3000,
  ai_persona: user?.ai_persona ?? "high-energy-coach",
});

const steps = [
  { id: 0, label: "Blueprint", title: "Mission Blueprint", subtitle: "Goals, body data, and training rhythm" },
  { id: 1, label: "Fuel", title: "Fuel Intelligence", subtitle: "Nutrition preferences and guardrails" },
  { id: 2, label: "Lifestyle", title: "Lifestyle Sync", subtitle: "Mood, sleep, support, and coach voice" },
];

const stressLevels = ["low", "moderate", "high"];
const equipmentOptions = ["barbell", "dumbbells", "kettlebells", "machines", "resistance bands", "bodyweight", "cardio"];
const cuisineOptions = ["mediterranean", "asian-fusion", "latin", "indian", "japanese", "plant-forward", "comfort-food"];
const moodTags = ["creative", "competitive", "analytical", "playful", "focused", "social"];
const sleepChallenges = ["late_screen_time", "irregular_schedule", "stress", "travel", "early_mornings"];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [intake, setIntake] = useState<IntakeForm>(defaultIntake(user));
  const [step, setStep] = useState(0);

  const { mutateAsync: saveIntake, isPending: saving } = useMutation({
    mutationFn: async (payload: PersonalIntake) => {
      await base44.personalization.updateIntake(payload);
      const plan = await base44.personalization.generate("onboarding blueprint");
      return plan;
    },
  });

  useEffect(() => {
    setIntake(defaultIntake(user));
  }, [user]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const updateIntake = (patch: Partial<IntakeForm>) => {
    setIntake((prev) => ({ ...prev, ...patch }));
  };

  const updateArrayField = (field: keyof PersonalIntake, value: string) => {
    setIntake((prev) => {
      const current = Array.isArray(prev[field]) ? (prev[field] as string[]) : [];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async () => {
    const payload: PersonalIntake = {
      ...intake,
      fitness_goal: intake.primary_goal ?? intake.fitness_goal,
    };
    await saveIntake(payload);
    await refresh();
    navigate("/plan", { replace: true });
  };

  useEffect(() => {
    if (user && user.profile_completed && (user.primary_goal || user.fitness_goal)) {
      // Allow revisiting onboarding, but if user is done and explicitly came here, do nothing
      // If they landed here automatically with complete profile, push them through
    }
  }, [user]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="step-0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Primary mission</label>
              <Input
                placeholder="e.g. build_muscle, improve_endurance"
                value={intake.primary_goal ?? ""}
                onChange={(event) => updateIntake({ primary_goal: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Secondary focus</label>
              <Input
                placeholder="Optional: mobility, race prep, stress resilience"
                value={intake.secondary_goal ?? ""}
                onChange={(event) => updateIntake({ secondary_goal: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Why now?</label>
              <Input
                placeholder="Tell your coach why this season matters"
                value={intake.goal_reason ?? ""}
                onChange={(event) => updateIntake({ goal_reason: event.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Height (cm)</label>
                <Input
                  type="number"
                  placeholder="180"
                  value={intake.height_cm ?? ""}
                  onChange={(event) => updateIntake({ height_cm: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="78"
                  value={intake.weight_kg ?? ""}
                  onChange={(event) => updateIntake({ weight_kg: Number(event.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Target weight (kg)</label>
                <Input
                  type="number"
                  placeholder="75"
                  value={intake.target_weight ?? ""}
                  onChange={(event) => updateIntake({ target_weight: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Experience level</label>
                <Input
                  placeholder="beginner / intermediate / advanced"
                  value={intake.experience_level ?? ""}
                  onChange={(event) => updateIntake({ experience_level: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Equipment access</label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <label key={equipment} className="flex items-center gap-2 text-sm text-indigo-100/80 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <Checkbox
                      checked={(intake.available_equipment ?? []).includes(equipment)}
                      onCheckedChange={() => updateArrayField("available_equipment", equipment)}
                    />
                    <span>{equipment.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step-1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Dietary preference</label>
                <Input
                  placeholder="none / vegetarian / vegan / paleo / keto"
                  value={intake.dietary_preference ?? ""}
                  onChange={(event) => updateIntake({ dietary_preference: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Dietary restrictions</label>
                <Input
                  placeholder="comma separated: dairy-free, gluten-free"
                  value={(intake.dietary_restrictions ?? []).join(", ")}
                  onChange={(event) =>
                    updateIntake({
                      dietary_restrictions: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Allergies</label>
                <Input
                  placeholder="peanuts, shellfish"
                  value={(intake.allergies ?? []).join(", ")}
                  onChange={(event) =>
                    updateIntake({
                      allergies: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Foods to avoid</label>
                <Input
                  placeholder="fried foods, high sugar snacks"
                  value={(intake.avoid_foods ?? []).join(", ")}
                  onChange={(event) =>
                    updateIntake({
                      avoid_foods: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Foods you love</label>
              <Input
                placeholder="salmon, quinoa bowls, citrus smoothies"
                value={(intake.favorite_foods ?? []).join(", ")}
                onChange={(event) =>
                  updateIntake({
                    favorite_foods: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Preferred cuisines</label>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => updateArrayField("preferred_cuisines", cuisine)}
                    className={clsx(
                      "px-3 py-2 rounded-full text-xs font-semibold transition border",
                      (intake.preferred_cuisines ?? []).includes(cuisine)
                        ? "bg-emerald-500/30 border-emerald-300 text-white shadow-lg shadow-emerald-500/20"
                        : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                    )}
                  >
                    {cuisine.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step-2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Motivation style</label>
                <Input
                  placeholder="data-driven, empathetic, tough-love"
                  value={intake.motivation_style ?? ""}
                  onChange={(event) => updateIntake({ motivation_style: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Coach persona</label>
                <Input
                  placeholder="high-energy-coach, zen-guide"
                  value={intake.ai_persona ?? ""}
                  onChange={(event) => updateIntake({ ai_persona: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Mood vibe tags</label>
              <div className="flex flex-wrap gap-2">
                {moodTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => updateArrayField("mood_tags", tag)}
                    className={clsx(
                      "px-3 py-2 rounded-full text-xs font-semibold transition border",
                      (intake.mood_tags ?? []).includes(tag)
                        ? "bg-purple-500/30 border-purple-300 text-white shadow-lg shadow-purple-500/20"
                        : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Stress level</label>
              <div className="flex gap-2">
                {stressLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateIntake({ stress_level: level })}
                    className={clsx(
                      "px-3 py-2 rounded-full text-xs font-semibold transition border",
                      intake.stress_level === level
                        ? "bg-pink-500/30 border-pink-300 text-white shadow-lg shadow-pink-500/20"
                        : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Sleep target (hours)</label>
              <Input
                type="number"
                placeholder="7.5"
                value={intake.sleep_target_hours ?? ""}
                onChange={(event) => updateIntake({ sleep_target_hours: Number(event.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Sleep challenges</label>
              <div className="flex flex-wrap gap-2">
                {sleepChallenges.map((challenge) => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => updateArrayField("sleep_challenges", challenge)}
                    className={clsx(
                      "px-3 py-2 rounded-full text-xs font-semibold transition border",
                      (intake.sleep_challenges ?? []).includes(challenge)
                        ? "bg-indigo-500/30 border-indigo-300 text-white shadow-lg shadow-indigo-500/20"
                        : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                    )}
                  >
                    {challenge.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">Support expectations</label>
              <Input
                placeholder="e.g. travel plan tweaks, macro reminders, mood-based training swaps"
                value={intake.support_expectations ?? ""}
                onChange={(event) => updateIntake({ support_expectations: event.target.value })}
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-indigo-200/70 font-semibold">
              Adaptive onboarding
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">
              Teach FitFlow how to coach you
            </h1>
            <p className="text-indigo-100/80 mt-4 max-w-xl leading-relaxed">
              Answer these micro-prompts so your AI trainer can deliver workouts, nutrition, and recovery that evolve with your mood,
              schedule, and cravings.
            </p>
          </div>
          <div className="md:text-right space-y-2">
            <div className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">
              Progress
            </div>
            <div className="w-48 h-2 bg-white/10 rounded-full">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-sm text-indigo-100/70">
              Step {step + 1} of {steps.length}: {steps[step].title}
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white/10 border border-white/15 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            <div className="hidden lg:block border-r border-white/10 p-10 space-y-6">
              <div className="text-sm text-indigo-100/70 uppercase tracking-[0.2em] font-semibold">
                {steps[step].label}
              </div>
              <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
              <p className="text-indigo-100/80 text-sm leading-relaxed">
                {steps[step].subtitle}
              </p>

              <div className="space-y-4 pt-10">
                <div className="text-xs uppercase tracking-wide text-indigo-200/70 font-semibold">
                  Precision crafting your plan
                </div>
                <ul className="space-y-3 text-sm text-indigo-100/80">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    Hyper-personal training split mapped to your equipment and schedule.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                    Nutrition engine that adapts to your favourite foods and Groq Vision meal snaps.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-pink-400" />
                    Mood-aware adjustments so your plan flexes with stress, energy, and vibes.
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-8 md:px-10 md:py-12 bg-slate-950/70">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

              <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={step === 0 || saving}
                  onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                  className="text-indigo-100/80 hover:text-white hover:bg-white/10"
                >
                  Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40"
                  >
                    {saving ? "Crafting your plan..." : "Launch personalized plan"}
                  </Button>
                )}
              </div>

              <div className="text-xs text-indigo-200/70 mt-6 text-center">
                Want to adjust later? You can revisit onboarding anytime from your profile preferences.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
