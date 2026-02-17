import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";

type WorkoutExerciseInput = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
};

type WorkoutFormValues = {
  workout_name: string;
  workout_type: "strength" | "cardio" | "flexibility" | "sports" | "other";
  duration_minutes: number;
  calories_burned: number;
  date: string;
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
  }>;
  notes?: string;
};

type WorkoutFormProps = {
  onSubmit: (workout: WorkoutFormValues) => void;
  onCancel: () => void;
};

const emptyExercise: WorkoutExerciseInput = { name: "", sets: "", reps: "", weight: "", notes: "" };

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSubmit, onCancel }) => {
  const [workout, setWorkout] = useState({
    workout_name: "",
    workout_type: "strength" as WorkoutFormValues["workout_type"],
    duration_minutes: "",
    calories_burned: "",
    date: new Date().toISOString().split("T")[0],
    exercises: [emptyExercise] as WorkoutExerciseInput[],
    notes: "",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prepared: WorkoutFormValues = {
      workout_name: workout.workout_name,
      workout_type: workout.workout_type,
      duration_minutes: Number(workout.duration_minutes || 0),
      calories_burned: Number(workout.calories_burned || 0),
      date: workout.date,
      exercises: workout.exercises
        .filter((exercise) => exercise.name.trim().length > 0)
        .map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets ? Number(exercise.sets) : undefined,
          reps: exercise.reps ? Number(exercise.reps) : undefined,
          weight: exercise.weight ? Number(exercise.weight) : undefined,
          notes: exercise.notes || undefined,
        })),
      notes: workout.notes || undefined,
    };
    onSubmit(prepared);
  };

  const addExercise = () => {
    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { ...emptyExercise }],
    }));
  };

  const removeExercise = (index: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index: number, field: keyof WorkoutExerciseInput, value: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => (i === index ? { ...exercise, [field]: value } : exercise)),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-200/60">
          <CardTitle className="text-2xl font-bold text-slate-900">Log Workout</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout_name">Workout Name</Label>
              <Input
                id="workout_name"
                value={workout.workout_name}
                onChange={(e) => setWorkout({ ...workout, workout_name: e.target.value })}
                placeholder="e.g., Chest & Triceps"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workout_type">Type</Label>
              <Select
                value={workout.workout_type}
                onValueChange={(value) => setWorkout({ ...workout, workout_type: value as WorkoutFormValues["workout_type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={workout.duration_minutes}
                onChange={(e) => setWorkout({ ...workout, duration_minutes: e.target.value })}
                placeholder="45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                value={workout.calories_burned}
                onChange={(e) => setWorkout({ ...workout, calories_burned: e.target.value })}
                placeholder="300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={workout.date}
                onChange={(e) => setWorkout({ ...workout, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Exercises</Label>
              <Button type="button" onClick={addExercise} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Exercise
              </Button>
            </div>

            {workout.exercises.map((exercise, index) => (
              <Card key={index} className="p-4 bg-slate-50/50">
                <div className="grid md:grid-cols-5 gap-3">
                  <Input
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, "sets", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, "reps", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Weight (lbs)"
                    value={exercise.weight}
                    onChange={(e) => updateExercise(index, "weight", e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={workout.notes}
              onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
              placeholder="How did the workout feel? Any observations..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-200/60 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
            <Save className="w-4 h-4 mr-2" /> Save Workout
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default WorkoutForm;
export type { WorkoutFormValues };
