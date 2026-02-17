import React, { useState } from "react";
import { base44, type WorkoutSession } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, Flame } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import WorkoutForm, { type WorkoutFormValues } from "../components/workouts/WorkoutForm";

export default function Workouts() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['all-workouts'],
    queryFn: () => base44.entities.WorkoutSession.list('-date'),
  });

  const createWorkout = useMutation<WorkoutSession, Error, WorkoutFormValues>({
    mutationFn: (workout) => base44.entities.WorkoutSession.create(workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setShowForm(false);
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Workouts</h1>
          <p className="text-slate-500 mt-1 font-medium">Track your training sessions</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Workout
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WorkoutForm
              onSubmit={(data) => createWorkout.mutate(data)}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {workouts.map((workout) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-200/60 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-200/60">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {workout.workout_name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(workout.date), 'MMM d, yyyy')}
                      </span>
                      {workout.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workout.duration_minutes}m
                        </span>
                      )}
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {workout.calories_burned} cal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {workout.exercises && workout.exercises.length > 0 && (
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/80 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">{exercise.name}</p>
                          <p className="text-sm text-slate-500">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}lbs`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {workout.notes && (
                    <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg">
                      <p className="text-sm text-slate-700">{workout.notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}

        {workouts.length === 0 && !showForm && (
          <Card className="border-slate-200/60 p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No workouts yet</h3>
                <p className="text-slate-500 mt-1">Start tracking your training sessions</p>
              </div>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                Log Your First Workout
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
