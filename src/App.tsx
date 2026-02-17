import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import AITrainer from "./pages/AITrainer";
import Exercises from "./pages/Exercises";
import Nutrition from "./pages/Nutrition";
import MealPlanner from "./pages/MealPlanner";
import Recovery from "./pages/Recovery";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import DevTools from "./pages/DevTools";
import Admin from "./pages/Admin";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/Onboarding";
import Plan from "./pages/Plan";
import { ProtectedRoute } from "./modules/auth/ProtectedRoute";

const AppLayout: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/aitrainer" element={<AITrainer />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/mealplanner" element={<MealPlanner />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/social" element={<Social />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/devtools" element={<DevTools />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
