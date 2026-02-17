import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { PersonalIntake } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type RegistrationForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profile: PersonalIntake;
};

const DEFAULT_FORM: RegistrationForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  profile: {
    age: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    target_weight: undefined,
    gender: "",
    body_type: "",
    primary_goal: "",
    secondary_goal: "",
    goal_reason: "",
    fitness_goal: "",
    experience_level: "intermediate",
    dietary_preference: "none",
    dietary_restrictions: [],
    allergies: [],
    favorite_foods: [],
    avoid_foods: [],
    preferred_cuisines: [],
    activity_level: "moderately_active",
    available_equipment: [],
    workout_environment: "gym",
    preferred_training_time: "early_morning",
    motivation_style: "data-driven",
    mood_tags: [],
    stress_level: "moderate",
    injuries: [],
    medical_conditions: [],
    lifestyle_notes: "",
    support_expectations: "",
    hydration_focus: "",
    ai_persona: "high-energy-coach",
    sleep_challenges: [],
    sleep_target_hours: 7,
    daily_water_target_ml: 3000,
  },
};

const steps = [
  { id: 0, label: "Account" },
  { id: 1, label: "Body & Metrics" },
  { id: 2, label: "Goals & Nutrition" },
  { id: 3, label: "Lifestyle & Vibes" },
];

const goals = [
  { value: "build_muscle", label: "Build Lean Muscle" },
  { value: "lose_weight", label: "Drop Body Fat" },
  { value: "improve_endurance", label: "Boost Endurance" },
  { value: "increase_strength", label: "Increase Strength" },
  { value: "general_health", label: "Better General Health" },
];

const bodyTypes = ["ectomorph", "mesomorph", "endomorph", "athletic", "balanced"];

const equipmentOptions = ["barbell", "dumbbells", "kettlebells", "machines", "resistance bands", "bodyweight", "cardio machines"];

const cuisineOptions = ["mediterranean", "asian-fusion", "latin", "indian", "japanese", "middle_eastern", "comfort_food", "plant-forward"];

const motivationStyles = ["data-driven", "empathetic", "tough-love", "story-driven", "calm-guide"];

const moodTags = ["creative", "competitive", "analytical", "playful", "focused", "social"];

const sleepChallenges = ["late_screen_time", "irregular_schedule", "stress", "travel", "early_mornings"];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL);

  const [form, setForm] = useState<RegistrationForm>(DEFAULT_FORM);
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const updateProfile = (patch: Partial<PersonalIntake>) => {
    setForm((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  };

  const toggleArrayField = (field: keyof PersonalIntake, value: string) => {
    const current = Array.isArray(form.profile[field]) ? (form.profile[field] as string[]) : [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateProfile({ [field]: next } as Partial<PersonalIntake>);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!apiConfigured) {
      setError("API URL is not configured. Please set VITE_API_URL in your environment.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register({
        full_name: form.fullName,
        email: form.email,
        password: form.password,
        profile: {
          ...form.profile,
          fitness_goal: form.profile.primary_goal,
          target_weight: form.profile.target_weight,
          age: form.profile.age,
          height_cm: form.profile.height_cm,
          weight_kg: form.profile.weight_kg,
        },
      });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    }
    setLoading(false);
  };

  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-900 p-4 md:p-10">
      <div className="w-full max-w-4xl bg-white/10 text-white border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 md:p-10 space-y-6">
            <div className="text-xs uppercase tracking-[0.4em] text-indigo-200/70 font-semibold">
              FitFlow onboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Build your adaptive fitness OS
            </h1>
            <p className="text-indigo-100/80 text-sm md:text-base">
              Tell us how you train, fuel, and recover so your AI coach can architect a plan that flexes with your life,
              mood, and goals.
            </p>

            <div className="mt-10 space-y-3">
              <div className="flex items-center justify-between text-xs tracking-wide uppercase text-indigo-200/70">
                <span>{steps[step].label}</span>
                <span>
                  Step {step + 1} of {steps.length}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-indigo-100/60">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse" />
                Live personalization updates training, meals, and recovery in real time.
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-100/60">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 animate-pulse" />
                Groq Vision logs meals automatically—just snap and upload.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border-t border-white/10 lg:border-t-0 lg:border-l px-6 py-8 md:px-10 md:py-12">
            {!apiConfigured && (
              <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-400/40 rounded-xl px-3 py-2 mb-6">
                Configure <code className="font-mono">VITE_API_URL</code> in your <code className="font-mono">.env</code> so FitFlow can register against the backend API.
              </div>
            )}

            {error && (
              <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label htmlFor="full_name" className="text-xs font-semibold tracking-wide uppercase text-indigo-200/70">
                        Full name
                      </label>
                      <Input
                        id="full_name"
                        placeholder="Jordan Carter"
                        value={form.fullName}
                        onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-indigo-200/70">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase text-indigo-200/70">
                          Password
                        </label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm_password" className="text-xs font-semibold tracking-wide uppercase text-indigo-200/70">
                          Confirm
                        </label>
                        <Input
                          id="confirm_password"
                          type="password"
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <p className="text-xs text-indigo-100/60 leading-relaxed">
                      We’ll sync across devices and keep your personalized coach, plans, and progress safe. Passwords require at least eight characters.
                    </p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Age</label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={form.profile.age ?? ""}
                          onChange={(event) => updateProfile({ age: Number(event.target.value) })}
                          min={14}
                          max={95}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Gender</label>
                        <Input
                          placeholder="male / female / non-binary"
                          value={form.profile.gender ?? ""}
                          onChange={(event) => updateProfile({ gender: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Height (cm)</label>
                        <Input
                          type="number"
                          placeholder="180"
                          value={form.profile.height_cm ?? ""}
                          onChange={(event) => updateProfile({ height_cm: Number(event.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Weight (kg)</label>
                        <Input
                          type="number"
                          placeholder="78"
                          value={form.profile.weight_kg ?? ""}
                          onChange={(event) => updateProfile({ weight_kg: Number(event.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Body type</label>
                      <div className="flex flex-wrap gap-2">
                        {bodyTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateProfile({ body_type: type })}
                            className={clsx(
                              "px-3 py-2 rounded-full text-xs font-semibold transition border",
                              form.profile.body_type === type
                                ? "bg-indigo-500/30 border-indigo-300 text-white shadow-lg shadow-indigo-500/20"
                                : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                            )}
                          >
                            {type.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Equipment access</label>
                      <div className="grid grid-cols-2 gap-2">
                        {equipmentOptions.map((equipment) => (
                          <label key={equipment} className="flex items-center gap-2 text-sm text-indigo-100/80 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                            <Checkbox
                              checked={(form.profile.available_equipment ?? []).includes(equipment)}
                              onCheckedChange={() => toggleArrayField("available_equipment", equipment)}
                            />
                            <span>{equipment.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Primary goal</label>
                      <div className="flex flex-wrap gap-2">
                        {goals.map((goal) => (
                          <button
                            key={goal.value}
                            type="button"
                            onClick={() =>
                              updateProfile({
                                primary_goal: goal.value,
                                fitness_goal: goal.value,
                              })
                            }
                            className={clsx(
                              "px-3 py-2 rounded-full text-xs font-semibold transition border",
                              form.profile.primary_goal === goal.value
                                ? "bg-pink-500/30 border-pink-300 text-white shadow-lg shadow-pink-500/20"
                                : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                            )}
                          >
                            {goal.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Secondary focus (optional)</label>
                      <Input
                        placeholder="e.g. improve mobility, prep for race"
                        value={form.profile.secondary_goal ?? ""}
                        onChange={(event) => updateProfile({ secondary_goal: event.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Why now?</label>
                      <Input
                        placeholder="What’s your ‘why’ for this season?"
                        value={form.profile.goal_reason ?? ""}
                        onChange={(event) => updateProfile({ goal_reason: event.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Experience level</label>
                        <Input
                          placeholder="beginner / intermediate / advanced"
                          value={form.profile.experience_level ?? ""}
                          onChange={(event) => updateProfile({ experience_level: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Preferred training time</label>
                        <Input
                          placeholder="early_morning / afternoon / evening"
                          value={form.profile.preferred_training_time ?? ""}
                          onChange={(event) => updateProfile({ preferred_training_time: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Dietary style</label>
                        <Input
                          placeholder="none / vegetarian / vegan / paleo / keto"
                          value={form.profile.dietary_preference ?? ""}
                          onChange={(event) => updateProfile({ dietary_preference: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Allergies (comma separated)</label>
                        <Input
                          placeholder="e.g. peanuts, dairy"
                          value={(form.profile.allergies ?? []).join(", ")}
                          onChange={(event) =>
                            updateProfile({
                              allergies: event.target.value
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Favourite fuels (comma separated)</label>
                      <Input
                        placeholder="e.g. salmon, sweet potato, smoothie bowls"
                        value={(form.profile.favorite_foods ?? []).join(", ")}
                        onChange={(event) =>
                          updateProfile({
                            favorite_foods: event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Preferred cuisines</label>
                      <div className="flex flex-wrap gap-2">
                        {cuisineOptions.map((cuisine) => (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={() => toggleArrayField("preferred_cuisines", cuisine)}
                            className={clsx(
                              "px-3 py-2 rounded-full text-xs font-semibold transition border",
                              (form.profile.preferred_cuisines ?? []).includes(cuisine)
                                ? "bg-emerald-500/25 border-emerald-300 text-white shadow-lg shadow-emerald-500/20"
                                : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                            )}
                          >
                            {cuisine.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Motivation style</label>
                        <div className="flex flex-wrap gap-2">
                          {motivationStyles.map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => updateProfile({ motivation_style: style })}
                              className={clsx(
                                "px-3 py-2 rounded-full text-xs font-semibold transition border",
                                form.profile.motivation_style === style
                                  ? "bg-sky-500/30 border-sky-300 text-white shadow-lg shadow-sky-500/20"
                                  : "border-white/10 text-indigo-100/70 hover:bg-white/10"
                              )}
                            >
                              {style.replace("-", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Coach voice</label>
                        <Input
                          placeholder="e.g. high-energy-coach, zen-guide"
                          value={form.profile.ai_persona ?? ""}
                          onChange={(event) => updateProfile({ ai_persona: event.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Mood vibe tags</label>
                      <div className="flex flex-wrap gap-2">
                        {moodTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleArrayField("mood_tags", tag)}
                            className={clsx(
                              "px-3 py-2 rounded-full text-xs font-semibold transition border",
                              (form.profile.mood_tags ?? []).includes(tag)
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
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Sleep targets (hours)</label>
                      <Input
                        type="number"
                        placeholder="7.5"
                        value={form.profile.sleep_target_hours ?? ""}
                        onChange={(event) => updateProfile({ sleep_target_hours: Number(event.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Sleep challenges</label>
                      <div className="flex flex-wrap gap-2">
                        {sleepChallenges.map((challenge) => (
                          <button
                            key={challenge}
                            type="button"
                            onClick={() => toggleArrayField("sleep_challenges", challenge)}
                            className={clsx(
                              "px-3 py-2 rounded-full text-xs font-semibold transition border",
                              (form.profile.sleep_challenges ?? []).includes(challenge)
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
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">How can FitFlow support you?</label>
                      <Input
                        placeholder="e.g. proactive travel plan tweaks, hype on race week"
                        value={form.profile.support_expectations ?? ""}
                        onChange={(event) => updateProfile({ support_expectations: event.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-indigo-200/70">Lifestyle notes</label>
                      <Input
                        placeholder="e.g. travel twice a month, remote work, marathon in fall"
                        value={form.profile.lifestyle_notes ?? ""}
                        onChange={(event) => updateProfile({ lifestyle_notes: event.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={step === 0 || loading}
                  className="text-indigo-100/80 hover:text-white hover:bg-white/10"
                >
                  Back
                </Button>

                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40"
                  >
                    {loading ? "Creating account..." : "Create My Adaptive Plan"}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center text-xs text-indigo-200/70 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
