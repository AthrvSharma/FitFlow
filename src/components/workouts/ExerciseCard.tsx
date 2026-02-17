import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExerciseCard({ exercise, onClick }) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    advanced: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/80 backdrop-blur-sm hover:border-indigo-300"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-slate-900 text-lg">{exercise.name}</h3>
          <Badge className={`${difficultyColors[exercise.difficulty]} border`}>
            {exercise.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mb-3">{exercise.description}</p>
        <div className="flex flex-wrap gap-2">
          {exercise.muscle_groups?.map((muscle, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}