import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Dumbbell,
  Apple,
  TrendingUp,
  User,
  Zap,
  Trophy,
  BookOpen,
  Users,
  ChefHat,
  Battery,
  Menu,
  Code2,
  Sparkles,
  ArrowRight,
  Compass,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { useAuth } from "@/modules/auth/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type PageGuide = {
  title: string;
  summary: string;
  steps: string[];
  action: {
    label: string;
    url: string;
  };
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = useMemo<NavigationItem[]>(() => {
    const baseItems: NavigationItem[] = [
      { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
      { title: "Blueprint", url: createPageUrl("Plan"), icon: Sparkles },
      { title: "Workouts", url: createPageUrl("Workouts"), icon: Dumbbell },
      { title: "AI Trainer", url: createPageUrl("AITrainer"), icon: Zap },
      { title: "Exercises", url: createPageUrl("Exercises"), icon: BookOpen },
      { title: "Nutrition", url: createPageUrl("Nutrition"), icon: Apple },
      { title: "Meal Planner", url: createPageUrl("MealPlanner"), icon: ChefHat },
      { title: "Recovery", url: createPageUrl("Recovery"), icon: Battery },
      { title: "Analytics", url: createPageUrl("Analytics"), icon: TrendingUp },
      { title: "Social", url: createPageUrl("Social"), icon: Users },
      { title: "Achievements", url: createPageUrl("Achievements"), icon: Trophy },
      { title: "Profile", url: createPageUrl("Profile"), icon: User },
      { title: "Dev Tools", url: createPageUrl("DevTools"), icon: Code2 },
    ];

    if (user?.role === "admin") {
      baseItems.splice(1, 0, { title: "Admin", url: createPageUrl("Admin"), icon: Users });
    }

    return baseItems;
  }, [user?.role]);

  const activeGuide = useMemo<PageGuide>(() => {
    const guides: Array<{ match: (pathname: string) => boolean; guide: PageGuide }> = [
      {
        match: (pathname) => pathname === createPageUrl("Dashboard"),
        guide: {
          title: "Daily Command Center",
          summary: "Check progress rings, review your next action, then execute one high-impact task.",
          steps: ["Review readiness", "Pick one action", "Log completion"],
          action: { label: "Open Blueprint", url: createPageUrl("Plan") },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("Plan"),
        guide: {
          title: "Adaptive Blueprint",
          summary: "This is your source of truth for training, nutrition, mood, and lifestyle adjustments.",
          steps: ["Read readiness", "Follow today’s actions", "Update mood + food feedback"],
          action: { label: "Jump to Mood", url: `${createPageUrl("Plan")}#mood` },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("Workouts"),
        guide: {
          title: "Workout Execution",
          summary: "Log the exact session you complete so the AI can adapt intensity and recovery.",
          steps: ["Start session", "Track effort", "Save workout log"],
          action: { label: "View Blueprint", url: createPageUrl("Plan") },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("Nutrition"),
        guide: {
          title: "Nutrition Tracking",
          summary: "Use meal scanner or manual logs to keep calorie and macro targets accurate.",
          steps: ["Scan or add meal", "Verify macros", "Track hydration"],
          action: { label: "Open Meal Planner", url: createPageUrl("MealPlanner") },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("AITrainer"),
        guide: {
          title: "AI Trainer Chat",
          summary: "Ask specific questions using your recent logs to get actionable coaching.",
          steps: ["Ask one focused question", "Apply 1-2 tips", "Track outcome tomorrow"],
          action: { label: "Update Blueprint", url: createPageUrl("Plan") },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("Recovery"),
        guide: {
          title: "Recovery Intelligence",
          summary: "Monitor sleep, stress, and load to stay in a high-readiness zone.",
          steps: ["Check score", "Adjust today intensity", "Follow recovery cue"],
          action: { label: "Log Mood", url: `${createPageUrl("Plan")}#mood` },
        },
      },
      {
        match: (pathname) => pathname === createPageUrl("Analytics"),
        guide: {
          title: "Performance Analytics",
          summary: "Use trends to identify what is working and what should be adjusted next week.",
          steps: ["Review trend", "Find one bottleneck", "Set one improvement target"],
          action: { label: "Regenerate Blueprint", url: createPageUrl("Plan") },
        },
      },
    ];

    const matched = guides.find((entry) => entry.match(location.pathname));
    if (matched) {
      return matched.guide;
    }

    return {
      title: "FitFlow Workspace",
      summary: "Track your activity and keep your personalized plan in sync.",
      steps: ["Review context", "Take one action", "Log feedback"],
      action: { label: "Go to Dashboard", url: createPageUrl("Dashboard") },
    };
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 239 84% 67%;
          --primary-foreground: 0 0% 100%;
          --accent: 25 95% 53%;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 animate-gradient">
        <Sidebar className="border-r border-white/60 glass-effect">
          <SidebarHeader className="border-b border-white/40 p-6">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                <Dumbbell className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FitFlow AI
                </h2>
                <p className="text-xs text-slate-600 font-semibold">Elite Training Platform</p>
              </div>
            </motion.div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {navigationItems.map((item, idx) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <SidebarMenuButton
                            asChild
                            className={`
                              transition-all duration-300 rounded-xl px-4 py-3 group relative overflow-hidden
                              ${isActive 
                                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30" 
                                : "hover:bg-white/60 text-slate-700 hover:text-slate-900"
                              }
                            `}
                          >
                            <Link to={item.url} className="flex items-center gap-3 relative z-10">
                              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-600"} transition-colors`} />
                              <span className="font-bold text-sm">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </motion.div>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="glass-effect border-b border-white/40 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-white/60 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FitFlow AI</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
          <div className="sticky bottom-0 z-10 border-t border-white/50 bg-white/75 backdrop-blur-xl px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-indigo-500 font-semibold">{activeGuide.title}</p>
                  <p className="text-sm text-slate-700">{activeGuide.summary}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeGuide.steps.map((step) => (
                      <span
                        key={step}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                to={activeGuide.action.url}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition-all"
              >
                {activeGuide.action.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
