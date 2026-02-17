import React, { useState } from "react";
import { base44, type RecoveryScore, type WorkoutSession, type SleepLog, type NutritionLog } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import RecoveryDashboard from "../components/recovery/RecoveryDashboard";

export default function Recovery() {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: recoveryScores = [] } = useQuery<RecoveryScore[]>({
    queryKey: ['recovery-score', today],
    queryFn: () => base44.entities.RecoveryScore.filter({ date: today }),
  });
  const todayRecovery = recoveryScores[0] ?? null;

  const { data: workouts = [] } = useQuery<WorkoutSession[]>({
    queryKey: ['recent-workouts-recovery'],
    queryFn: () => base44.entities.WorkoutSession.list('-date', 7),
  });

  const { data: sleep = [] } = useQuery<SleepLog[]>({
    queryKey: ['recent-sleep-recovery'],
    queryFn: () => base44.entities.SleepLog.list('-date', 7),
  });

  const { data: nutrition = [] } = useQuery<NutritionLog[]>({
    queryKey: ['recent-nutrition-recovery'],
    queryFn: () => base44.entities.NutritionLog.list('-date', 7),
  });

  const generateRecoveryScore = useMutation<RecoveryScore>({
    mutationFn: async () => {
      const avgSleep = sleep.length > 0
        ? sleep.reduce((sum, s) => sum + (s.duration_hours || 0), 0) / sleep.length
        : 0;
      
      const avgCalories = nutrition.length > 0
        ? nutrition.reduce((sum, n) => sum + (n.calories || 0), 0) / nutrition.length
        : 0;

      const recentWorkoutLoad = workouts.slice(0, 3).reduce((sum, w) => {
        const rpe = w.overall_rpe || 5;
        const duration = w.duration_minutes || 0;
        return sum + (rpe * duration);
      }, 0);

      const prompt = `You are a fitness recovery expert. Analyze this data and provide a recovery score:

Sleep: ${avgSleep.toFixed(1)} hours average (last 7 days)
Nutrition: ${avgCalories} calories average
Recent Workout Load: ${recentWorkoutLoad} (RPE × duration sum)
Workouts this week: ${workouts.length}

Provide:
1. Overall recovery score (0-100)
2. Individual scores for sleep, nutrition, workout load (0-100 each)
3. Readiness level (ready/moderate/rest)
4. 3-4 specific recommendations
5. Suggested workout intensity

Be scientific but encouraging.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            sleep_score: { type: "number" },
            nutrition_score: { type: "number" },
            workout_load_score: { type: "number" },
            readiness: { type: "string", enum: ["ready", "moderate", "rest"] },
            recommendations: { type: "array", items: { type: "string" } },
            suggested_workout_intensity: { type: "string", enum: ["high", "moderate", "low", "active_recovery"] }
          }
        }
      });

      return base44.entities.RecoveryScore.create({
        date: today,
        ...response
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery-score'] });
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    await generateRecoveryScore.mutateAsync();
    setGenerating(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Battery className="w-10 h-10 text-indigo-600" />
          Recovery Center
        </h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">Optimize your training with smart recovery tracking</p>
      </motion.div>

      {todayRecovery ? (
        <RecoveryDashboard recoveryData={todayRecovery} />
      ) : (
        <Card className="glass-effect border-white/60 shadow-2xl p-12 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Generate Today's Score</h3>
              <p className="text-slate-600 mt-2 font-medium">Get AI-powered recovery insights based on your recent activity</p>
            </div>
            <Button 
              onClick={handleGenerate}
              disabled={generating}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-2xl transition-shadow"
            >
              {generating ? (
                <>
                  <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Calculate Recovery Score
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      <Card className="glass-effect border-white/60 shadow-lg">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Understanding Your Score</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💪</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ready (80-100)</p>
                <p className="text-sm text-slate-600">Optimal recovery. Push hard in today's session.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Moderate (50-79)</p>
                <p className="text-sm text-slate-600">Good recovery. Train at moderate intensity.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">😴</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Rest (0-49)</p>
                <p className="text-sm text-slate-600">Low recovery. Consider rest or active recovery.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
