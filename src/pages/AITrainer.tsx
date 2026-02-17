import React, { useState } from "react";
import {
  base44,
  type DemoUser,
  type AIInsight,
  type WorkoutSession,
  type NutritionLog,
  type CoachResponse,
  type CoachExerciseRecommendation,
  type Exercise,
} from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Loader2, Zap, TrendingUp, Target, Brain, PlusCircle, CheckCircle2, LibraryBig, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AITrainer() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiResponse, setAiResponse] = useState<CoachResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exerciseActionMessage, setExerciseActionMessage] = useState<string | null>(null);
  const [savingExerciseName, setSavingExerciseName] = useState<string | null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: insights = [] } = useQuery<AIInsight[]>({
    queryKey: ['all-insights'],
    queryFn: () => base44.entities.AIInsight.list('-date', 20),
  });

  const { data: workouts = [] } = useQuery<WorkoutSession[]>({
    queryKey: ['recent-workouts'],
    queryFn: () => base44.entities.WorkoutSession.list('-date', 7),
  });

  const { data: nutrition = [] } = useQuery<NutritionLog[]>({
    queryKey: ['recent-nutrition'],
    queryFn: () => base44.entities.NutritionLog.list('-date', 7),
  });

  const { data: exerciseLibrary = [] } = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  const generateInsight = useMutation<AIInsight, Error>({
    mutationFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { answer, tips } = await base44.ai.askCoach({
        question: "Review my recent training logs and highlight one priority insight with action items for the week.",
      });

      return base44.entities.AIInsight.create({
        date: today,
        title: "Weekly Focus",
        message: answer,
        type: "recommendation",
        priority: "medium",
        action_items: tips ?? ["Stay consistent"],
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const askAI = async () => {
    if (!question.trim()) return;
    setErrorMessage(null);
    setExerciseActionMessage(null);
    setIsAsking(true);
    try {
      const response = await base44.ai.askCoach({ question });
      setAiResponse(response);
      setQuestion("");
    } catch (error) {
      console.error("Error asking AI:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to reach AI service");
    }
    setIsAsking(false);
  };

  const normalizeExerciseName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

  const findExistingExercise = (name: string) =>
    exerciseLibrary.find((exercise) => normalizeExerciseName(exercise.name) === normalizeExerciseName(name));

  const buildExercisePayload = (exercise: CoachExerciseRecommendation) => ({
    name: exercise.name,
    category: exercise.category,
    difficulty: exercise.difficulty,
    description: exercise.description,
    instructions: exercise.instructions?.length ? exercise.instructions : ["Follow controlled reps and proper form."],
    muscle_groups: [exercise.primary_muscle, ...(exercise.secondary_muscles ?? [])]
      .map((muscle) => muscle.trim().toLowerCase())
      .filter((muscle, index, arr) => muscle.length > 0 && arr.indexOf(muscle) === index),
    equipment: exercise.equipment ?? [],
    form_cues: exercise.form_cues ?? [],
  });

  const handleAddExercise = async (exercise: CoachExerciseRecommendation) => {
    setErrorMessage(null);
    setExerciseActionMessage(null);
    setSavingExerciseName(exercise.name);

    try {
      const existing = findExistingExercise(exercise.name);
      const payload = buildExercisePayload(exercise);

      if (existing && base44.entities.Exercise.update) {
        const shouldUpdate =
          typeof window === "undefined"
            ? true
            : window.confirm(
                `"${exercise.name}" already exists in your Exercise Library.\n\nDo you want to update it with this AI version?`
              );
        if (!shouldUpdate) {
          setSavingExerciseName(null);
          return;
        }

        await base44.entities.Exercise.update(existing.id, payload);
        setExerciseActionMessage(`Updated "${exercise.name}" in Exercise Library.`);
      } else {
        await base44.entities.Exercise.create(payload);
        setExerciseActionMessage(`Added "${exercise.name}" to Exercise Library.`);
      }

      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add exercise");
    } finally {
      setSavingExerciseName(null);
    }
  };

  const insightIcons = {
    workout: Zap,
    nutrition: Target,
    recovery: TrendingUp,
    motivation: Sparkles,
    recommendation: Brain
  };

  const insightColors = {
    workout: "from-indigo-500 to-purple-600",
    nutrition: "from-green-500 to-emerald-600",
    recovery: "from-blue-500 to-cyan-600",
    motivation: "from-orange-500 to-red-600",
    recommendation: "from-pink-500 to-rose-600"
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </motion.div>
          AI Personal Trainer
        </h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">
          Ask for muscle-focused plans and add AI-recommended exercises directly to your library.
        </p>
      </motion.div>

      <Card className="glass-effect border-white/60 shadow-2xl">
        <CardHeader className="border-b border-white/40">
          <CardTitle className="text-xl font-black text-slate-900">Ask Your AI Coach</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="Try: 'I want to focus on chest + triceps. Give me 5 exercises and progression.'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="resize-none glass-effect border-white/60"
          />
          <div className="flex justify-between items-center">
            <Button
              onClick={() => generateInsight.mutate()}
              variant="outline"
              disabled={generateInsight.isPending}
              className="glass-effect border-white/60"
            >
              {generateInsight.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insight
                </>
              )}
            </Button>
            <Button
              onClick={askAI}
              disabled={isAsking || !question.trim()}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-xl transition-shadow"
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>

          {errorMessage && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
              {errorMessage}
            </div>
          )}

          {exerciseActionMessage && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              {exerciseActionMessage}
            </div>
          )}

          <AnimatePresence>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 rounded-2xl glass-effect border-white/60 space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-900">AI Response:</h3>
                <p className="text-slate-700 leading-relaxed">{aiResponse.answer}</p>
                {aiResponse.tips && aiResponse.tips.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Quick Tips:</p>
                    <ul className="space-y-2">
                      {aiResponse.tips.map((tip, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <Zap className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResponse.recommended_exercises && aiResponse.recommended_exercises.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">Recommended Exercises (AI + Library Aware)</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(createPageUrl("Exercises"))}
                      >
                        <LibraryBig className="w-4 h-4 mr-1.5" />
                        Open Exercises
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {aiResponse.recommended_exercises.map((exercise, idx) => {
                        const existing = findExistingExercise(exercise.name);
                        const isSaving = savingExerciseName === exercise.name;
                        return (
                          <div
                            key={`${exercise.name}-${idx}`}
                            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-900">{exercise.name}</p>
                                  {existing ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Already in library
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                                      New recommendation
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 capitalize">
                                  {exercise.category} • {exercise.difficulty} • Primary: {exercise.primary_muscle}
                                </p>
                                <p className="text-sm text-slate-600 mt-2">{exercise.why_this_exercise}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddExercise(exercise)}
                                disabled={isSaving}
                                className="sm:shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    Saving...
                                  </>
                                ) : existing ? (
                                  <>
                                    <ArrowRight className="w-4 h-4 mr-1.5" />
                                    Update Existing
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle className="w-4 h-4 mr-1.5" />
                                    Add to Exercises
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-slate-700">{exercise.description}</p>
                            {(exercise.secondary_muscles ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {exercise.secondary_muscles.map((muscle) => (
                                  <span
                                    key={`${exercise.name}-${muscle}`}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                  >
                                    {muscle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {aiResponse.follow_up_prompt && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide font-semibold text-indigo-600">AI Follow Up</p>
                    <p className="text-sm text-indigo-800 mt-1">{aiResponse.follow_up_prompt}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6">Recent Insights</h2>
        <div className="grid gap-4">
          {insights.map((insight, idx) => {
            const Icon = insightIcons[insight.type] || Sparkles;
            const gradient = insightColors[insight.type] || "from-slate-500 to-slate-600";
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-effect border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">{insight.title}</h3>
                          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                            {format(new Date(insight.date), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{insight.message}</p>
                        {insight.action_items && insight.action_items.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Action Items:</p>
                            <ul className="space-y-1.5">
                              {insight.action_items.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {insights.length === 0 && (
            <Card className="glass-effect border-white/60 p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No insights yet</h3>
                  <p className="text-slate-500 mt-1">Generate your first AI-powered insight</p>
                </div>
                <Button 
                  onClick={() => generateInsight.mutate()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  Generate Insight
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
