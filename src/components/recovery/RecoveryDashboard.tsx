import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Battery, Moon, Apple, Dumbbell, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecoveryDashboard({ recoveryData }) {
  if (!recoveryData) return null;

  const getReadinessColor = (readiness) => {
    const colors = {
      ready: 'from-green-500 to-emerald-600',
      moderate: 'from-yellow-500 to-orange-600',
      rest: 'from-red-500 to-rose-600'
    };
    return colors[readiness] || 'from-slate-500 to-slate-600';
  };

  const getReadinessIcon = (readiness) => {
    if (readiness === 'ready') return '💪';
    if (readiness === 'moderate') return '⚡';
    return '😴';
  };

  return (
    <Card className="glass-effect border-white/60 shadow-2xl overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${getReadinessColor(recoveryData.readiness)} opacity-5`}></div>
      
      <CardHeader className="border-b border-white/40 relative z-10">
        <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Battery className="w-6 h-6 text-indigo-600" />
          Recovery Score
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="text-7xl font-black mb-2">
              {getReadinessIcon(recoveryData.readiness)}
            </div>
            <div className={`text-6xl font-black bg-gradient-to-r ${getReadinessColor(recoveryData.readiness)} bg-clip-text text-transparent`}>
              {recoveryData.overall_score}
            </div>
            <p className="text-sm text-slate-600 font-semibold mt-2 uppercase tracking-wide">
              {recoveryData.readiness} to Train
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Moon className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{recoveryData.sleep_score}</p>
            <p className="text-xs text-slate-500 font-semibold">Sleep</p>
          </div>
          <div className="text-center">
            <Apple className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{recoveryData.nutrition_score}</p>
            <p className="text-xs text-slate-500 font-semibold">Nutrition</p>
          </div>
          <div className="text-center">
            <Dumbbell className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{recoveryData.workout_load_score}</p>
            <p className="text-xs text-slate-500 font-semibold">Load</p>
          </div>
        </div>

        {recoveryData.recommendations && recoveryData.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              Today's Recommendations
            </div>
            <ul className="space-y-2">
              {recoveryData.recommendations.map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></div>
                  {rec}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {recoveryData.suggested_workout_intensity && (
          <div className="mt-4 p-3 rounded-xl glass-effect border-white/60">
            <p className="text-xs font-bold text-slate-700 mb-1">Suggested Intensity:</p>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
              {recoveryData.suggested_workout_intensity.replace('_', ' ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}