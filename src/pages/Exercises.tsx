import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Exercises() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ex.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || ex.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "strength", "cardio", "flexibility", "core", "plyometric"];

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 border-green-300",
    intermediate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    advanced: "bg-red-100 text-red-800 border-red-300"
  };

  const categoryIcons = {
    strength: Dumbbell,
    cardio: Activity,
    flexibility: Zap,
    core: Dumbbell,
    plyometric: Activity
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Exercise Library</h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">Master your form and technique</p>
      </motion.div>

      <Card className="glass-effect border-white/60 shadow-xl">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-effect border-white/60"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className={filterCategory === cat 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600" 
                  : "glass-effect border-white/60"
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, idx) => {
          const Icon = categoryIcons[exercise.category] || Dumbbell;
          
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card 
                className="glass-effect border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardHeader className="border-b border-white/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                        {exercise.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${difficultyColors[exercise.difficulty]} border text-xs font-semibold`}>
                          {exercise.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {exercise.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {exercise.description}
                  </p>
                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exercise.muscle_groups.slice(0, 3).map((muscle, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                      {exercise.muscle_groups.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{exercise.muscle_groups.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="glass-effect border-white/60 p-12 text-center">
          <p className="text-slate-500 font-semibold">No exercises found</p>
        </Card>
      )}

      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl glass-effect">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {selectedExercise?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${difficultyColors[selectedExercise.difficulty]} border`}>
                  {selectedExercise.difficulty}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedExercise.category}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed">{selectedExercise.description}</p>
              </div>

              {selectedExercise.muscle_groups && selectedExercise.muscle_groups.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscle_groups.map((muscle, idx) => (
                      <Badge key={idx} variant="secondary">{muscle}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Instructions</h3>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-600">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedExercise.form_cues && selectedExercise.form_cues.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Form Cues</h3>
                  <ul className="space-y-2">
                    {selectedExercise.form_cues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600">
                        <Zap className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}