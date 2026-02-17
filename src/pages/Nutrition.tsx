
import React, { useState } from "react";
import { base44, type DemoUser, type NutritionLog, type WaterLog } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Droplet } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import MealForm, { type MealFormValues } from "../components/nutrition/MealForm";
import MacroRing from "../components/nutrition/MacroRing";
import MealScanner, { type ScannedMeal } from "../components/meal-scanner/MealScanner";

export default function Nutrition() {
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: meals = [] } = useQuery<NutritionLog[]>({
    queryKey: ['nutrition-logs', today],
    queryFn: () => base44.entities.NutritionLog.filter({ date: today }),
  });

  const { data: waterLogs = [] } = useQuery<WaterLog[]>({
    queryKey: ['water-logs', today],
    queryFn: () => base44.entities.WaterLog.filter({ date: today }),
  });

  const createMeal = useMutation<NutritionLog, Error, MealFormValues>({
    mutationFn: (meal) => base44.entities.NutritionLog.create(meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      setShowForm(false);
    },
  });

  const addWater = useMutation<WaterLog, Error, number>({
    mutationFn: (amount) => base44.entities.WaterLog.create({
      date: today,
      amount_ml: amount,
      time: new Date().toTimeString().slice(0, 5)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-logs'] });
      queryClient.invalidateQueries({ queryKey: ['water'] });
    },
  });

  const handleMealScanned = (mealData: ScannedMeal) => {
    createMeal.mutate({
      meal_name: mealData.meal_name,
      meal_type: 'snack', // Defaulting to 'snack' for scanned items, can be refined.
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      date: today,
      time: new Date().toTimeString().slice(0, 5)
    });
  };

  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Nutrition</h1>
          <p className="text-slate-500 mt-1 font-medium">Track your daily intake</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Meal
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MealScanner onMealScanned={handleMealScanned} />

        <Card className="glass-effect border-white/60 shadow-xl bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="border-b border-slate-200/60">
            <CardTitle className="text-xl font-bold text-slate-900">Today's Macros</CardTitle>
            <p className="text-sm text-slate-500">
              {totalCalories} / {user?.daily_calorie_target || 2000} calories
            </p>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-3 gap-8">
              <MacroRing 
                macro="Protein"
                current={Math.round(totalProtein)}
                target={user?.daily_protein_target || 150}
                color="#f97316"
              />
              <MacroRing 
                macro="Carbs"
                current={Math.round(totalCarbs)}
                target={user?.daily_carbs_target || 200}
                color="#10b981"
              />
              <MacroRing 
                macro="Fat"
                current={Math.round(totalFat)}
                target={user?.daily_fat_target || 65}
                color="#6366f1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-200/60">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-600" />
              Hydration
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => addWater.mutate(250)}
              >
                +250ml
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => addWater.mutate(500)}
              >
                +500ml
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalWater / (user?.daily_water_target_ml || 2000)) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {totalWater} / {user?.daily_water_target_ml || 2000}ml
            </span>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MealForm
              onSubmit={(data) => createMeal.mutate(data)}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Today's Meals</h3>
        {meals.map((meal) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{meal.meal_name}</h4>
                    <p className="text-sm text-slate-500 capitalize">{meal.meal_type} • {meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">{meal.calories} cal</p>
                    <p className="text-xs text-slate-500">
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {meals.length === 0 && !showForm && (
          <Card className="border-slate-200/60 p-8 text-center">
            <p className="text-slate-500">No meals logged today</p>
          </Card>
        )}
      </div>
    </div>
  );
}
