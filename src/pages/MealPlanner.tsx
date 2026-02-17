import React, { useState } from "react";
import { base44, type DemoUser, type MealPlan } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, ShoppingCart, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek } from "date-fns";

type ToggleGroceryVariables = {
  itemIndex: number;
};

export default function MealPlanner() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ['meal-plan', weekStart],
    queryFn: () => base44.entities.MealPlan.filter({ week_start_date: weekStart }),
  });
  const currentPlan = mealPlans[0] ?? null;

  const generateMealPlan = useMutation<MealPlan, Error>({
    mutationFn: async () => {
      const response = await base44.ai.generateMealPlan({
        dietaryPreference: user?.dietary_preference,
        calorieTarget: user?.daily_calorie_target,
        proteinTarget: user?.daily_protein_target,
        carbsTarget: user?.daily_carbs_target,
        fatTarget: user?.daily_fat_target,
      });

      const payload = {
        week_start_date: weekStart,
        meals: response.meals,
        grocery_list: response.grocery_list,
        total_cost_estimate: response.total_cost_estimate,
      };

      if (currentPlan?.id) {
        const updated = await base44.entities.MealPlan.update(currentPlan.id, payload);
        if (updated) return updated;
      }

      return base44.entities.MealPlan.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const toggleGroceryItem = useMutation<MealPlan | null, Error, ToggleGroceryVariables>({
    mutationFn: async ({ itemIndex }) => {
      if (!currentPlan) return null;
      const updatedList = [...currentPlan.grocery_list];
      updatedList[itemIndex].purchased = !updatedList[itemIndex].purchased;
      return base44.entities.MealPlan.update(currentPlan.id, {
        grocery_list: updatedList
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
    },
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMessage(null);
    try {
      await generateMealPlan.mutateAsync();
    } finally {
      setGenerating(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-green-600" />
              Meal Planner
            </h1>
            <p className="text-slate-600 mt-2 font-semibold text-lg">AI-powered weekly meal planning</p>
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {errorMessage && (
        <Card className="glass-effect border-red-200/60 bg-red-50/40">
          <CardContent className="py-4 text-sm text-red-600 font-semibold">
            {errorMessage}
          </CardContent>
        </Card>
      )}

      {currentPlan ? (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {days.map((day, dayIdx) => {
                const dayMeals = currentPlan.meals?.filter(m => m.day === day) || [];
                
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIdx * 0.05 }}
                  >
                    <Card className="glass-effect border-white/60 shadow-lg">
                      <CardHeader className="border-b border-white/40">
                        <CardTitle className="text-lg font-bold text-slate-900">{day}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        {dayMeals.map((meal, idx) => (
                          <div key={idx} className="p-4 rounded-xl glass-effect border-white/60">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-slate-900">{meal.recipe_name}</p>
                                <p className="text-xs text-slate-500 capitalize font-semibold">{meal.meal_type} • {meal.prep_time} min</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-900">{meal.calories} cal</p>
                                <p className="text-xs text-slate-500">
                                  P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                </p>
                              </div>
                            </div>
                            {meal.ingredients && (
                              <div className="mt-2 pt-2 border-t border-slate-200/50">
                                <p className="text-xs text-slate-600">
                                  {meal.ingredients.slice(0, 3).join(', ')}
                                  {meal.ingredients.length > 3 && `... +${meal.ingredients.length - 3} more`}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="space-y-6">
              <Card className="glass-effect border-white/60 shadow-2xl sticky top-6">
                <CardHeader className="border-b border-white/40">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    Grocery List
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 max-h-96 overflow-y-auto">
                  {currentPlan.grocery_list?.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      <Checkbox
                        checked={item.purchased}
                        onCheckedChange={() => toggleGroceryItem.mutate({ itemIndex: idx })}
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${item.purchased ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.item}
                        </p>
                        <p className="text-xs text-slate-500">{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                {currentPlan.total_cost_estimate && (
                  <div className="border-t border-white/40 p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Estimated Cost:</span>
                      <span className="text-xl font-black text-green-600">
                                ${currentPlan.total_cost_estimate}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card className="glass-effect border-white/60 shadow-2xl p-16 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">No Meal Plan Yet</h3>
              <p className="text-slate-600 mt-2 font-medium">Generate your personalized weekly meal plan</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
