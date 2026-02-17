import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AICoachCard({ insights = [] }) {
  const navigate = useNavigate();
  const [currentInsight, setCurrentInsight] = useState(0);

  const defaultInsights = [
    {
      title: "Great Progress This Week!",
      message: "You've completed 4 workouts and hit your protein target 5 days in a row. Keep it up!",
      type: "motivation"
    },
    {
      title: "Recovery Suggestion",
      message: "Your workout intensity has been high. Consider a lighter session or rest day tomorrow.",
      type: "recommendation"
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;
  const insight = displayInsights[currentInsight % displayInsights.length];

  const iconMap = {
    motivation: Sparkles,
    recommendation: Zap,
    workout: TrendingUp
  };

  const Icon = iconMap[insight.type] || Sparkles;

  return (
    <Card className="glass-effect border-white/60 shadow-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="border-b border-white/40 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </motion.div>
            AI Coach
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl("AITrainer"))}
            className="hover:bg-white/60"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{insight.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{insight.message}</p>
              </div>
            </div>

            {displayInsights.length > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {displayInsights.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentInsight(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentInsight % displayInsights.length
                        ? 'bg-indigo-600 w-6'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}