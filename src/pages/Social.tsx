import React, { useState } from "react";
import { base44, type WorkoutBuddy, type Challenge } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trophy, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import BuddyCard from "../components/social/BuddyCard";

export default function Social() {
  const [buddyEmail, setBuddyEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: buddies = [] } = useQuery<WorkoutBuddy[]>({
    queryKey: ['workout-buddies'],
    queryFn: () => base44.entities.WorkoutBuddy.list(),
  });

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ['active-challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_community: true }),
  });

  const addBuddy = useMutation<WorkoutBuddy, Error, string>({
    mutationFn: async (email) => {
      return base44.entities.WorkoutBuddy.create({
        buddy_email: email,
        buddy_name: email.split('@')[0],
        status: 'pending',
        shared_goals: [],
        weekly_checkins: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-buddies'] });
      setBuddyEmail("");
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Users className="w-10 h-10 text-indigo-600" />
          Social & Community
        </h1>
        <p className="text-slate-600 mt-2 font-semibold text-lg">Connect, compete, and stay accountable</p>
      </motion.div>

      <Card className="glass-effect border-white/60 shadow-2xl">
        <CardHeader className="border-b border-white/40">
          <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" />
            Add Workout Buddy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter buddy's email..."
              value={buddyEmail}
              onChange={(e) => setBuddyEmail(e.target.value)}
              className="glass-effect border-white/60"
            />
            <Button 
              onClick={() => addBuddy.mutate(buddyEmail)}
              disabled={!buddyEmail || addBuddy.isPending}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Buddy
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Your Workout Buddies ({buddies.length})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buddies.map((buddy, idx) => (
            <motion.div
              key={buddy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <BuddyCard
                buddy={buddy}
                onMessage={() => console.log('Message buddy')}
                onViewProgress={() => console.log('View progress')}
              />
            </motion.div>
          ))}
        </div>

        {buddies.length === 0 && (
          <Card className="glass-effect border-white/60 p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No buddies yet</h3>
                <p className="text-slate-500 mt-1">Add friends to stay accountable together</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Community Challenges
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="glass-effect border-white/60 shadow-lg hover:shadow-2xl transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{challenge.title}</h3>
                      <p className="text-sm text-slate-600">{challenge.description}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Target className="w-4 h-4" />
                      <span className="font-semibold">Goal: {challenge.target}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{challenge.participants?.length || 0} participants</span>
                    </div>
                  </div>

                  {challenge.prize && (
                    <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/50 mb-4">
                      <p className="text-sm font-semibold text-amber-900">🏆 Prize: {challenge.prize}</p>
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
                    Join Challenge
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
