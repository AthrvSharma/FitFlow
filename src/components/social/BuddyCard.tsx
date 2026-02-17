import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuddyCard({ buddy, onMessage, onViewProgress }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="glass-effect border-white/60 shadow-lg overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                {buddy.buddy_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{buddy.buddy_name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{buddy.buddy_email}</p>
              </div>
            </div>
            {buddy.status === 'active' && (
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                Weekly Check-ins
              </span>
              <span className="font-bold text-slate-900">{buddy.weekly_checkins || 0}</span>
            </div>
            {buddy.shared_goals && buddy.shared_goals.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {buddy.shared_goals.slice(0, 2).map((goal, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    {goal}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onMessage}
              className="flex-1 glass-effect border-white/60"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button 
              size="sm" 
              onClick={onViewProgress}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Progress
            </Button>
          </div>

          {buddy.motivation_message && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/50">
              <p className="text-xs text-slate-600 italic">"{buddy.motivation_message}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}