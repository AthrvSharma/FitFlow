import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44, type DemoUser } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, User as UserIcon, Target, Award } from "lucide-react";
import { useAuth } from "@/modules/auth/AuthContext";

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    age: "",
    fitness_goal: "",
    experience_level: "",
    dietary_preference: "",
    daily_calorie_target: "",
    daily_protein_target: "",
    daily_carbs_target: "",
    daily_fat_target: "",
    daily_water_target_ml: "",
    sleep_target_hours: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      age: user.age ? String(user.age) : "",
      fitness_goal: user.fitness_goal ?? "",
      experience_level: user.experience_level ?? "",
      dietary_preference: user.dietary_preference ?? "",
      daily_calorie_target: user.daily_calorie_target ? String(user.daily_calorie_target) : "",
      daily_protein_target: user.daily_protein_target ? String(user.daily_protein_target) : "",
      daily_carbs_target: user.daily_carbs_target ? String(user.daily_carbs_target) : "",
      daily_fat_target: user.daily_fat_target ? String(user.daily_fat_target) : "",
      daily_water_target_ml: user.daily_water_target_ml ? String(user.daily_water_target_ml) : "",
      sleep_target_hours: user.sleep_target_hours ? String(user.sleep_target_hours) : "",
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates: Partial<DemoUser> = {
        age: profile.age ? Number(profile.age) : undefined,
        fitness_goal: profile.fitness_goal,
        experience_level: profile.experience_level,
        dietary_preference: profile.dietary_preference,
        daily_calorie_target: profile.daily_calorie_target ? Number(profile.daily_calorie_target) : undefined,
        daily_protein_target: profile.daily_protein_target ? Number(profile.daily_protein_target) : undefined,
        daily_carbs_target: profile.daily_carbs_target ? Number(profile.daily_carbs_target) : undefined,
        daily_fat_target: profile.daily_fat_target ? Number(profile.daily_fat_target) : undefined,
        daily_water_target_ml: profile.daily_water_target_ml ? Number(profile.daily_water_target_ml) : undefined,
        sleep_target_hours: profile.sleep_target_hours ? Number(profile.sleep_target_hours) : undefined,
      };
      await base44.auth.updateProfile(updates);
      await refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage your fitness profile and goals</p>
      </div>

      <Card className="border-slate-200/60 shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader className="border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">{user?.full_name}</CardTitle>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fitness_goal">Fitness Goal</Label>
                  <Select
                    value={profile.fitness_goal}
                    onValueChange={(value) => setProfile({...profile, fitness_goal: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="build_muscle">Build Muscle</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                      <SelectItem value="general_health">General Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select
                    value={profile.experience_level}
                    onValueChange={(value) => setProfile({...profile, experience_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary_preference">Dietary Preference</Label>
                  <Select
                    value={profile.dietary_preference}
                    onValueChange={(value) => setProfile({...profile, dietary_preference: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Daily Targets
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_calorie_target">Calories Target</Label>
                  <Input
                    id="daily_calorie_target"
                    type="number"
                    value={profile.daily_calorie_target}
                    onChange={(e) => setProfile({ ...profile, daily_calorie_target: e.target.value })}
                    placeholder="2000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_protein_target">Protein Target (g)</Label>
                  <Input
                    id="daily_protein_target"
                    type="number"
                    value={profile.daily_protein_target}
                    onChange={(e) => setProfile({ ...profile, daily_protein_target: e.target.value })}
                    placeholder="150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_carbs_target">Carbs Target (g)</Label>
                  <Input
                    id="daily_carbs_target"
                    type="number"
                    value={profile.daily_carbs_target}
                    onChange={(e) => setProfile({ ...profile, daily_carbs_target: e.target.value })}
                    placeholder="200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_fat_target">Fat Target (g)</Label>
                  <Input
                    id="daily_fat_target"
                    type="number"
                    value={profile.daily_fat_target}
                    onChange={(e) => setProfile({ ...profile, daily_fat_target: e.target.value })}
                    placeholder="65"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_water_target_ml">Water Target (ml)</Label>
                  <Input
                    id="daily_water_target_ml"
                    type="number"
                    value={profile.daily_water_target_ml}
                    onChange={(e) => setProfile({ ...profile, daily_water_target_ml: e.target.value })}
                    placeholder="2000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep_target_hours">Sleep Target (hours)</Label>
                  <Input
                    id="sleep_target_hours"
                    type="number"
                    value={profile.sleep_target_hours}
                    onChange={(e) => setProfile({ ...profile, sleep_target_hours: e.target.value })}
                    placeholder="8"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200/60">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="p-6">
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
