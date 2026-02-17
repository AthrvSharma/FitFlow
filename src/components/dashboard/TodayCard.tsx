import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Flame } from 'lucide-react';
import { format } from 'date-fns';

export default function TodayCard({ nextWorkout, caloriesRemaining, sleepTarget }) {
  return (
    <Card className="border-slate-200/60 bg-gradient-to-br from-white to-indigo-50/30 shadow-xl">
      <CardHeader className="border-b border-slate-200/60 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Today's Overview
        </CardTitle>
        <p className="text-sm text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM d')}</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {nextWorkout && (
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Next Workout</p>
              <p className="text-sm text-slate-600 mt-0.5">{nextWorkout}</p>
            </div>
          </div>
        )}
        
        {caloriesRemaining !== null && (
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Calories Remaining</p>
              <p className="text-sm text-slate-600 mt-0.5">{caloriesRemaining} kcal left today</p>
            </div>
          </div>
        )}

        {sleepTarget && (
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Sleep Target</p>
              <p className="text-sm text-slate-600 mt-0.5">{sleepTarget} hours tonight</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}