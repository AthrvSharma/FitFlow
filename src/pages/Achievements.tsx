import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Lock, Star, Flame, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Achievements() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
    initialData: [],
  });

  const iconMap = {
    workout: Zap,
    nutrition: Target,
    streak: Flame,
    milestone: Star,
    challenge: Trophy
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Trophy className="w-10 h-10 text-amber-500" />
          Achievements
        </h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, idx) => {
          const Icon = iconMap[achievement.type] || Trophy;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
            >
              <Card className={`glass-effect border-white/60 shadow-lg relative overflow-hidden ${
                achievement.unlocked 
                  ? 'hover:shadow-2xl transition-all duration-300' 
                  : 'opacity-60'
              }`}>
                {achievement.unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10"></div>
                )}
                
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-slate-300'
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className="w-8 h-8 text-white" />
                      ) : (
                        <Lock className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {achievement.description}
                      </p>
                      
                      {achievement.unlocked && achievement.unlocked_date && (
                        <p className="text-xs text-amber-600 font-semibold">
                          Unlocked {format(new Date(achievement.unlocked_date), 'MMM d, yyyy')}
                        </p>
                      )}
                      
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-indigo-600">{achievement.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${achievement.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <Card className="glass-effect border-white/60 p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto flex items-center justify-center">
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No achievements yet</h3>
              <p className="text-slate-500 mt-1">Start working out to unlock achievements</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}