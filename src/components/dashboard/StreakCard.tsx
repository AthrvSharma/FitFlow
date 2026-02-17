import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakCard({ currentStreak, longestStreak }) {
  return (
    <Card className="glass-effect border-white/60 shadow-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Flame className="w-8 h-8 text-orange-500" />
              </motion.div>
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Current Streak</span>
            </div>
            <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {currentStreak}
            </p>
            <p className="text-sm text-slate-500 font-semibold mt-1">days in a row</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{longestStreak}</p>
            <p className="text-xs text-slate-500 font-semibold">personal best</p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}