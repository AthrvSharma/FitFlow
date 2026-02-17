
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Dumbbell, Apple, Droplet, Moon, Zap, Activity, Sparkles, Brain, CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import ActivityRing from "../components/dashboard/ActivityRing";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import AICoachCard from "../components/dashboard/AICoachCard";
import StreakCard from "../components/dashboard/StreakCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: workouts } = useQuery({
    queryKey: ['workouts', today],
    queryFn: () => base44.entities.WorkoutSession.filter({ date: today }),
    initialData: [],
  });

  const { data: nutritionLogs } = useQuery({
    queryKey: ['nutrition', today],
    queryFn: () => base44.entities.NutritionLog.filter({ date: today }),
    initialData: [],
  });

  const { data: sleepLogs } = useQuery({
    queryKey: ['sleep', today],
    queryFn: () => base44.entities.SleepLog.filter({ date: today }),
    initialData: [],
  });

  const { data: waterLogs } = useQuery({
    queryKey: ['water', today],
    queryFn: () => base44.entities.WaterLog.filter({ date: today }),
    initialData: [],
  });

  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => base44.entities.AIInsight.filter({ read: false }),
    initialData: [],
  });

  const { data: plan } = useQuery({
    queryKey: ['personalized-plan-preview'],
    queryFn: async () => {
      try {
        return await base44.personalization.getLatest();
      } catch (error) {
        console.warn('No personalized plan yet', error);
        return null;
      }
    },
  });

  const { data: latestMood } = useQuery({
    queryKey: ['dashboard-latest-mood'],
    queryFn: async () => {
      try {
        return await base44.mood.latest();
      } catch {
        return null;
      }
    },
  });

  const totalCalories = nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
  const totalSleep = sleepLogs.reduce((sum, log) => sum + (log.duration_hours || 0), 0);
  const workoutDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

  const calorieTarget = user?.daily_calorie_target || 2000;
  const waterTarget = user?.daily_water_target_ml || 2000;
  const sleepTarget = user?.sleep_target_hours || 8;
  const workoutTarget = 60;

  const activityProgress = Math.min((workoutDuration / workoutTarget) * 100, 100);
  const nutritionProgress = Math.min((totalCalories / calorieTarget) * 100, 100);
  const sleepProgress = Math.min((totalSleep / sleepTarget) * 100, 100);
  const hydrationProgress = Math.min((totalWater / waterTarget) * 100, 100);
  const moodLoggedToday =
    Boolean(latestMood?.createdAt) && new Date(latestMood.createdAt).toDateString() === new Date().toDateString();

  const dailyChecklist = [
    {
      title: "Review your Adaptive Blueprint",
      done: Boolean(plan),
      actionLabel: "Open Blueprint",
      onClick: () => navigate(createPageUrl("Plan")),
      note: plan ? "Plan ready and synced" : "Generate and review your personalized plan",
    },
    {
      title: "Log mood pulse",
      done: moodLoggedToday,
      actionLabel: "Update mood",
      onClick: () => navigate(createPageUrl("Plan")),
      note: moodLoggedToday ? "Mood updated today" : "Mood helps AI tune intensity and recovery",
    },
    {
      title: "Log one meal",
      done: nutritionLogs.length > 0,
      actionLabel: "Go to Nutrition",
      onClick: () => navigate(createPageUrl("Nutrition")),
      note: nutritionLogs.length > 0 ? "Nutrition logged today" : "Keep macros accurate with scanner or manual entry",
    },
    {
      title: "Complete one workout log",
      done: workouts.length > 0,
      actionLabel: "Go to Workouts",
      onClick: () => navigate(createPageUrl("Workouts")),
      note: workouts.length > 0 ? "Workout logged today" : "Training logs drive smarter weekly adjustments",
    },
  ];
  const completedChecklistCount = dailyChecklist.filter((item) => item.done).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-600 mt-2 font-semibold text-lg">
            Your day is simple: check readiness, execute one key action, and log feedback.
          </p>
        </div>
      </motion.div>

      <motion.section
        className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-xl p-6 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-semibold">Start Here</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Daily Operating Checklist</h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete these to keep your AI plan accurate and adaptive.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm">
            <span className="font-semibold text-indigo-700">{completedChecklistCount}/4 completed</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {dailyChecklist.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-slate-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={item.onClick} className="shrink-0">
                {item.actionLabel}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ActivityRing 
          progress={activityProgress}
          label="Activity"
          value={`${workoutDuration}m`}
          target={`${workoutTarget}m`}
          color="#6366f1"
          icon={Activity}
        />
        <ActivityRing 
          progress={nutritionProgress}
          label="Nutrition"
          value={`${totalCalories}`}
          target={`${calorieTarget}`}
          color="#10b981"
          icon={Apple}
        />
        <ActivityRing 
          progress={sleepProgress}
          label="Sleep"
          value={`${totalSleep}h`}
          target={`${sleepTarget}h`}
          color="#8b5cf6"
          icon={Moon}
        />
        <ActivityRing 
          progress={hydrationProgress}
          label="Hydration"
          value={`${Math.round(totalWater)}ml`}
          target={`${waterTarget}ml`}
          color="#06b6d4"
          icon={Droplet}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {plan && (
          <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-semibold">Adaptive blueprint</div>
                <h2 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  {plan.workout_plan.focus_summary}
                </h2>
                <p className="text-sm text-slate-600 mt-3 max-w-xl">
                  Nutrition, training, and lifestyle synced in real time. Latest readiness score: {plan.readiness_score ?? '--'}.
                </p>
              </div>
              <Button
                onClick={() => navigate(createPageUrl("Plan"))}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
              >
                View Plan
              </Button>
            </div>

            <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/70 p-4">
                <div className="text-xs uppercase tracking-wide text-indigo-500 font-semibold">Next session</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {plan.workout_plan?.schedule?.[0]?.day ?? "TBD"}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {plan.workout_plan?.schedule?.[0]?.sessions?.[0]?.name ?? "Review plan"}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/70 p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Fuel focus</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {plan.nutrition_plan?.meals?.[0]?.name ?? "Refresh meal plan"}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {plan.nutrition_plan?.calories_target ?? 0} kcal target
                </p>
              </div>
              <div className="rounded-2xl border border-purple-200/50 bg-purple-50/70 p-4">
                <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Lifestyle cue</div>
                <p className="text-xs text-slate-500 mt-2">
                  {plan.lifestyle_plan?.mood_support?.[0] ?? "Log mood to unlock personalized recovery"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-500 font-semibold">Mood sync</div>
              <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                {latestMood ? latestMood.mood.toUpperCase() : "Log how you feel"}
              </h2>
              <p className="text-sm text-slate-600 mt-3 max-w-sm">
                Mood pulses teach FitFlow when to push, when to pivot. Head to Blueprint to drop a quick update.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Plan"))}
              className="border-indigo-300/70 text-indigo-600 hover:bg-indigo-50"
            >
              Update mood
            </Button>
          </div>
          {latestMood && (
            <div className="mt-4 text-xs text-slate-500">
              Logged {new Date(latestMood.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AICoachCard insights={insights.slice(0, 3)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StreakCard 
            currentStreak={user?.current_streak || 0}
            longestStreak={user?.longest_streak || 0}
          />
        </motion.div>
      </div>

      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <QuickActionCard 
          icon={Dumbbell}
          title="Start Workout"
          description="Log a real session to improve AI adjustments"
          gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
          onClick={() => navigate(createPageUrl("Workouts"))}
        />
        <QuickActionCard 
          icon={Zap}
          title="AI Workout Plan"
          description="Ask the coach what to do today"
          gradient="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
          onClick={() => navigate(createPageUrl("AITrainer"))}
        />
        <QuickActionCard 
          icon={Apple}
          title="Log Meal"
          description="Use scanner or manual log for macros"
          gradient="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500"
          onClick={() => navigate(createPageUrl("Nutrition"))}
        />
      </motion.div>
    </div>
  );
}
