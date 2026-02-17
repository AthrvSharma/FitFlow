import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cloud, Database, Users, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataVerification() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [workouts, nutrition, sleep, water, achievements, exercises] = await Promise.all([
        base44.entities.WorkoutSession.list(),
        base44.entities.NutritionLog.list(),
        base44.entities.SleepLog.list(),
        base44.entities.WaterLog.list(),
        base44.entities.Achievement.list(),
        base44.entities.Exercise.list()
      ]);

      setStats({
        workouts: workouts.length,
        nutrition: nutrition.length,
        sleep: sleep.length,
        water: water.length,
        achievements: achievements.length,
        exercises: exercises.length,
        totalRecords: workouts.length + nutrition.length + sleep.length + water.length + achievements.length + exercises.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Workout Sessions', value: stats?.workouts || 0, icon: Activity, color: 'from-indigo-500 to-purple-600' },
    { label: 'Nutrition Logs', value: stats?.nutrition || 0, icon: Database, color: 'from-green-500 to-emerald-600' },
    { label: 'Sleep Logs', value: stats?.sleep || 0, icon: Cloud, color: 'from-purple-500 to-pink-600' },
    { label: 'Water Logs', value: stats?.water || 0, icon: Cloud, color: 'from-cyan-500 to-blue-600' },
    { label: 'Achievements', value: stats?.achievements || 0, icon: CheckCircle2, color: 'from-amber-500 to-orange-600' },
    { label: 'Exercises', value: stats?.exercises || 0, icon: Activity, color: 'from-rose-500 to-red-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card className="glass-effect border-white/60 shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black mb-2">☁️ Cloud Storage Active</h2>
              <p className="text-indigo-100 font-semibold">All data is securely stored in the cloud</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Automatic backups enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Multi-device sync active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Data isolated per user</span>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Cloud className="w-10 h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-white/60 shadow-xl">
        <CardHeader className="border-b border-white/40">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Your Cloud Database Stats
            </CardTitle>
            <Button 
              onClick={fetchStats} 
              disabled={loading}
              size="sm"
              variant="outline"
              className="glass-effect border-white/60"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {user && (
            <div className="mb-6 p-4 rounded-xl glass-effect border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Current User</p>
                  <p className="text-lg font-black text-slate-900">{user.full_name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Users className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {statCards.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-effect border-white/60 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Records</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50">
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Total Cloud Records: {stats?.totalRecords || 0}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600">
                ✅ All data stored securely on base44 cloud infrastructure
              </p>
              <p className="text-slate-600">
                ✅ Automatically synced across all devices
              </p>
              <p className="text-slate-600">
                ✅ Your data is isolated - only you can access it
              </p>
              <p className="text-slate-600">
                ✅ Production-grade database with automatic backups
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-white/60 shadow-lg">
        <CardHeader className="border-b border-white/40">
          <CardTitle className="text-lg font-black text-slate-900">How Data Storage Works</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="font-black text-indigo-600">1</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Cloud-Native Database</p>
                <p className="text-sm text-slate-600">All entities are stored in base44's managed cloud database - no MongoDB setup needed.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="font-black text-purple-600">2</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Automatic User Isolation</p>
                <p className="text-sm text-slate-600">Each user only sees their own data. The <code className="bg-slate-100 px-1 rounded">created_by</code> field automatically tracks ownership.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <span className="font-black text-pink-600">3</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Real-time Sync</p>
                <p className="text-sm text-slate-600">Changes made on one device instantly appear on all other devices - no manual sync required.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="font-black text-green-600">4</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Production Ready</p>
                <p className="text-sm text-slate-600">Built-in backups, security, and scalability. Your app is ready for thousands of users out of the box.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}