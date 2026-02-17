import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Flame, Moon } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export default function Analytics() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: workouts } = useQuery({
    queryKey: ['workout-history'],
    queryFn: () => base44.entities.WorkoutSession.list('-date', 30),
    initialData: [],
  });

  const { data: nutrition } = useQuery({
    queryKey: ['nutrition-history'],
    queryFn: () => base44.entities.NutritionLog.list('-date', 30),
    initialData: [],
  });

  const { data: sleep } = useQuery({
    queryKey: ['sleep-history'],
    queryFn: () => base44.entities.SleepLog.list('-date', 30),
    initialData: [],
  });

  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const dayWorkouts = workouts.filter(w => w.date === date);
    const dayNutrition = nutrition.filter(n => n.date === date);
    const daySleep = sleep.filter(s => s.date === date);
    
    return {
      date: format(new Date(date), 'MMM d'),
      workouts: dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      calories: dayNutrition.reduce((sum, n) => sum + (n.calories || 0), 0),
      sleep: daySleep.reduce((sum, s) => sum + (s.duration_hours || 0), 0)
    };
  });

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const avgCalories = nutrition.length > 0 
    ? Math.round(nutrition.reduce((sum, n) => sum + (n.calories || 0), 0) / nutrition.length) 
    : 0;
  const avgSleep = sleep.length > 0
    ? (sleep.reduce((sum, s) => sum + (s.duration_hours || 0), 0) / sleep.length).toFixed(1)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1 font-medium">Track your progress and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200/60 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Workouts</p>
                <p className="text-4xl font-bold mt-2">{totalWorkouts}</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Minutes</p>
                <p className="text-4xl font-bold mt-2">{totalMinutes}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg Calories</p>
                <p className="text-4xl font-bold mt-2">{avgCalories}</p>
              </div>
              <Flame className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Sleep</p>
                <p className="text-4xl font-bold mt-2">{avgSleep}h</p>
              </div>
              <Moon className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-200/60">
          <CardTitle className="text-xl font-bold text-slate-900">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="workouts" fill="#6366f1" name="Workout Minutes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200/60 shadow-xl">
          <CardHeader className="border-b border-slate-200/60">
            <CardTitle className="text-xl font-bold text-slate-900">Calorie Intake</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-xl">
          <CardHeader className="border-b border-slate-200/60">
            <CardTitle className="text-xl font-bold text-slate-900">Sleep Duration</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sleep" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="Sleep Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}