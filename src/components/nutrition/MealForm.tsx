import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export type MealFormValues = {
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
};

type MealFormProps = {
  onSubmit: (meal: MealFormValues) => void;
  onCancel: () => void;
};

const MealForm: React.FC<MealFormProps> = ({ onSubmit, onCancel }) => {
  const [meal, setMeal] = useState({
    meal_name: "",
    meal_type: "breakfast" as MealFormValues["meal_type"],
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prepared: MealFormValues = {
      meal_name: meal.meal_name,
      meal_type: meal.meal_type,
      calories: Number(meal.calories || 0),
      protein: Number(meal.protein || 0),
      carbs: Number(meal.carbs || 0),
      fat: Number(meal.fat || 0),
      date: meal.date,
      time: meal.time,
    };
    onSubmit(prepared);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-200/60">
          <CardTitle className="text-2xl font-bold text-slate-900">Log Meal</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal_name">Meal Name</Label>
              <Input
                id="meal_name"
                value={meal.meal_name}
                onChange={(e) => setMeal({ ...meal, meal_name: e.target.value })}
                placeholder="e.g., Grilled Chicken Salad"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal Type</Label>
              <Select
                value={meal.meal_type}
                onValueChange={(value) => setMeal({ ...meal, meal_type: value as MealFormValues["meal_type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={meal.calories}
                onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
                placeholder="450"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={meal.protein}
                onChange={(e) => setMeal({ ...meal, protein: e.target.value })}
                placeholder="35"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={meal.carbs}
                onChange={(e) => setMeal({ ...meal, carbs: e.target.value })}
                placeholder="45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={meal.fat}
                onChange={(e) => setMeal({ ...meal, fat: e.target.value })}
                placeholder="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={meal.date}
                onChange={(e) => setMeal({ ...meal, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={meal.time}
                onChange={(e) => setMeal({ ...meal, time: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-200/60 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <Save className="w-4 h-4 mr-2" /> Save Meal
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default MealForm;
