import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44, type AdminUserRecord, type AdminUserSummary } from "@/api/base44Client";
import { useAuth } from "@/modules/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, TrendingUp, Flame, Activity } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const usersQuery = useQuery<AdminUserRecord[]>({
    queryKey: ["admin", "users"],
    queryFn: () => base44.admin.listUsers(),
    enabled: user?.role === "admin",
    initialData: [],
  });

  const summaryQuery = useQuery<AdminUserSummary>({
    queryKey: ["admin", "summary", selectedUserId],
    queryFn: () => base44.admin.getUserSummary(selectedUserId!),
    enabled: user?.role === "admin" && Boolean(selectedUserId),
  });

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.role, loading, navigate]);

  useEffect(() => {
    if (!selectedUserId && usersQuery.data.length > 0) {
      setSelectedUserId(usersQuery.data[0]._id);
    }
  }, [selectedUserId, usersQuery.data]);

  if (loading || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900/5">
        <p className="text-slate-600 font-semibold">Loading admin tools…</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-10 h-10 text-indigo-600" />
            Admin Control Center
          </h1>
          <p className="text-slate-600 mt-2 font-semibold text-lg">
            Monitor user progress, engagement, and recovery across the platform
          </p>
        </div>
        <Badge variant="outline" className="text-indigo-600 font-semibold text-xs">
          <Shield className="w-3 h-3 mr-1" /> Administrator
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-effect border-white/60 shadow-xl lg:col-span-1">
          <CardHeader className="border-b border-white/40">
            <CardTitle className="text-lg font-bold text-slate-900">Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 max-h-[480px] overflow-y-auto">
            {usersQuery.data.length === 0 && (
              <p className="text-sm text-slate-500">No user records yet. Invite athletes to create accounts.</p>
            )}
            {usersQuery.data.map((u) => {
              const isActive = selectedUserId === u._id;
              return (
                <Button
                  key={u._id}
                  variant={isActive ? "default" : "outline"}
                  className={`w-full justify-between ${isActive ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "border-white/60"}`}
                  onClick={() => setSelectedUserId(u._id)}
                >
                  <span className="flex flex-col text-left">
                    <span className="font-semibold text-sm">{u.full_name}</span>
                    <span className="text-xs text-slate-200/80">{u.email}</span>
                  </span>
                  <Badge variant={u.role === "admin" ? "success" : "secondary"}>{u.role}</Badge>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/60 shadow-2xl lg:col-span-2 min-h-[320px]">
          <CardHeader className="border-b border-white/40 flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {usersQuery.data.find((u) => u._id === selectedUserId)?.full_name ?? "Select a user"}
              </CardTitle>
              <p className="text-xs text-slate-500">
                {usersQuery.data.find((u) => u._id === selectedUserId)?.fitness_goal || "No goal set"}
              </p>
            </div>
            {summaryQuery.isFetching && (
              <span className="text-xs text-slate-500">Refreshing metrics…</span>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {selectedUserId ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-white/70 shadow-inner border border-white/60">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <Activity className="w-4 h-4 text-indigo-600" /> Workouts Logged
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {summaryQuery.data?.metrics.workouts ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 shadow-inner border border-white/60">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <Flame className="w-4 h-4 text-orange-500" /> Meals Tracked
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {summaryQuery.data?.metrics.meals ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/70 shadow-inner border border-white/60">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Latest Recovery Score
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {summaryQuery.data?.metrics.latestRecovery?.overall_score ?? "--"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Readiness: {summaryQuery.data?.metrics.latestRecovery?.readiness ?? "n/a"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Select a user to view detailed metrics.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
