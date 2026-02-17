import {
  demoUser,
  sampleAchievements,
  sampleChallenges,
  sampleExercises,
  sampleInsights,
  sampleMealPlan,
  sampleNutritionLogs,
  sampleRecoveryScores,
  sampleSleepLogs,
  sampleMoodLogs,
  sampleWaterLogs,
  sampleWorkoutBuddies,
  sampleWorkoutSessions,
  samplePersonalizedPlan,
  type DemoUser,
  type AIInsight,
  type Achievement,
  type Challenge,
  type Exercise,
  type MealPlan,
  type MealPlanMeal,
  type MealPlanGroceryItem,
  type NutritionLog,
  type RecoveryScore,
  type SleepLog,
  type WaterLog,
  type WorkoutBuddy,
  type WorkoutSession,
  type PersonalizedPlan,
  type PlanDay,
  type PlanSession,
  type PlanExercise,
  type NutritionPlan,
  type LifestylePlan,
  type MoodLogEntry,
} from "./sampleData";

const STORAGE_PREFIX = "fitflow";
const getStorageKey = (entity: string) => `${STORAGE_PREFIX}:${entity}`;

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

const clone = <T>(value: T): T => {
  const sc = (globalThis as unknown as { structuredClone?: <K>(input: K) => K }).structuredClone;
  if (typeof sc === "function") {
    return sc(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const apiBaseFromEnv = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : undefined;
const API_BASE_URL = apiBaseFromEnv ? String(apiBaseFromEnv).replace(/\/$/, "") : "";
const isRemoteEnabled = Boolean(API_BASE_URL);

const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  if (!isRemoteEnabled) {
    throw new Error("API base URL is not configured");
  }

  const state = getAuthState();
  const headers = new Headers(init.headers ?? {});

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (state?.token) {
    headers.set("Authorization", `Bearer ${state.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const parsed = await response.json();
      if (parsed?.message) {
        message = parsed.message;
      }
    } catch (error) {
      // ignore json parsing errors
    }
    throw new Error(message);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error("Failed to parse response from server");
  }
};

class EntityStore<T extends { id: string }> {
  private cache: T[] | null = null;

  constructor(private readonly entityName: string, private readonly seed: T[]) {}

  private read(): T[] {
    if (this.cache) {
      return clone(this.cache);
    }

    if (isBrowser) {
      const raw = localStorage.getItem(getStorageKey(this.entityName));
      if (raw) {
        try {
          this.cache = JSON.parse(raw) as T[];
          return clone(this.cache);
        } catch (error) {
          console.warn(`Failed to parse ${this.entityName} from storage`, error);
        }
      }
    }

    this.cache = clone(this.seed);
    return clone(this.cache);
  }

  private write(data: T[]): void {
    this.cache = clone(data);
    if (isBrowser) {
      localStorage.setItem(getStorageKey(this.entityName), JSON.stringify(this.cache));
    }
  }

  private sort(data: T[], order?: string): T[] {
    if (!order) return data;

    const direction = order.startsWith("-") ? -1 : 1;
    const field = order.replace(/^[-+]/, "");

    return [...data].sort((a: Record<string, any>, b: Record<string, any>) => {
      const av = a[field];
      const bv = b[field];
      if (av === undefined || bv === undefined) return 0;
      if (av === bv) return 0;
      return av > bv ? direction : -direction;
    });
  }

  async list(order?: string, limit?: number): Promise<T[]> {
    let data = this.read();
    data = this.sort(data, order);
    if (typeof limit === "number") {
      data = data.slice(0, limit);
    }
    return data;
  }

  async filter(criteria: Partial<T>, order?: string, limit?: number): Promise<T[]> {
    let data = this.read();
    data = data.filter((item) =>
      Object.entries(criteria).every(([key, value]) => {
        return value === undefined ? true : (item as Record<string, unknown>)[key] === value;
      })
    );
    data = this.sort(data, order);
    if (typeof limit === "number") {
      data = data.slice(0, limit);
    }
    return data;
  }

  async create(input: Omit<T, "id"> & Partial<Pick<T, "id">>): Promise<T> {
    const data = this.read();
    const randomId =
      (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
    const id = input.id ?? `${this.entityName}-${randomId}`;
    const entity = { ...(input as T), id };
    const next = [entity, ...data];
    this.write(next);
    return entity;
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const data = this.read();
    let updated: T | null = null;
    const next = data.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch };
      return updated;
    });
    if (updated) {
      this.write(next);
    }
    return updated;
  }
}

const stores = {
  WorkoutSession: new EntityStore<WorkoutSession>("WorkoutSession", sampleWorkoutSessions),
  NutritionLog: new EntityStore<NutritionLog>("NutritionLog", sampleNutritionLogs),
  SleepLog: new EntityStore<SleepLog>("SleepLog", sampleSleepLogs),
  WaterLog: new EntityStore<WaterLog>("WaterLog", sampleWaterLogs),
  AIInsight: new EntityStore<AIInsight>("AIInsight", sampleInsights),
  Exercise: new EntityStore<Exercise>("Exercise", sampleExercises),
  WorkoutBuddy: new EntityStore<WorkoutBuddy>("WorkoutBuddy", sampleWorkoutBuddies),
  Challenge: new EntityStore<Challenge>("Challenge", sampleChallenges),
  Achievement: new EntityStore<Achievement>("Achievement", sampleAchievements),
  MealPlan: new EntityStore<MealPlan>("MealPlan", [sampleMealPlan]),
  RecoveryScore: new EntityStore<RecoveryScore>("RecoveryScore", sampleRecoveryScores),
  PersonalizedPlan: new EntityStore<PersonalizedPlan>("PersonalizedPlan", [samplePersonalizedPlan]),
  MoodLog: new EntityStore<MoodLogEntry>("MoodLog", sampleMoodLogs),
};

const authStorageKey = getStorageKey("auth");

type AuthState = {
  token: string;
  user: typeof demoUser;
};

const getAuthState = (): AuthState | null => {
  if (!isBrowser) return { token: "demo-token", user: demoUser };
  const raw = localStorage.getItem(authStorageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch (error) {
    console.warn("Failed to parse auth state", error);
    return null;
  }
};

const setAuthState = (state: AuthState | null) => {
  if (!isBrowser) return;
  if (!state) {
    localStorage.removeItem(authStorageKey);
  } else {
    localStorage.setItem(authStorageKey, JSON.stringify(state));
  }
};

type EntityAdapter<T extends { id?: string }> = {
  list: (order?: string, limit?: number) => Promise<T[]>;
  filter: (criteria: Partial<T>, order?: string, limit?: number) => Promise<T[]>;
  create?: (input: Omit<T, "id"> & Partial<Pick<T, "id">>) => Promise<T>;
  update?: (id: string, patch: Partial<T>) => Promise<T | null>;
};

export type AdminUserRecord = {
  _id: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  fitness_goal?: string;
  experience_level?: string;
  current_streak?: number;
  longest_streak?: number;
};

export type AdminUserSummary = {
  metrics: {
    workouts: number;
    meals: number;
    latestRecovery: RecoveryScore | null;
  };
};

type CoachExerciseRecommendation = {
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  category: "strength" | "cardio" | "flexibility" | "core" | "plyometric";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  why_this_exercise: string;
  instructions: string[];
  form_cues: string[];
  equipment: string[];
};

type CoachResponse = {
  answer: string;
  tips: string[];
  recommended_exercises?: CoachExerciseRecommendation[];
  follow_up_prompt?: string;
};

type MealPlanGeneration = {
  meals: MealPlanMeal[];
  grocery_list: MealPlanGroceryItem[];
  total_cost_estimate: number;
};

const encodeQuery = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const createLocalAdapter = <T extends { id: string }>(store: EntityStore<T>): EntityAdapter<T> => ({
  list: (order, limit) => store.list(order, limit),
  filter: (criteria, order, limit) => store.filter(criteria, order, limit),
  create: (input) => store.create(input),
  update: (id, patch) => store.update(id, patch),
});

const localAdapters = {
  WorkoutSession: createLocalAdapter(stores.WorkoutSession),
  NutritionLog: createLocalAdapter(stores.NutritionLog),
  SleepLog: createLocalAdapter(stores.SleepLog),
  WaterLog: createLocalAdapter(stores.WaterLog),
  AIInsight: createLocalAdapter(stores.AIInsight),
  Exercise: createLocalAdapter(stores.Exercise),
  WorkoutBuddy: createLocalAdapter(stores.WorkoutBuddy),
  Challenge: createLocalAdapter(stores.Challenge),
  Achievement: createLocalAdapter(stores.Achievement),
  MealPlan: createLocalAdapter(stores.MealPlan),
  RecoveryScore: createLocalAdapter(stores.RecoveryScore),
  PersonalizedPlan: createLocalAdapter(stores.PersonalizedPlan),
  MoodLog: createLocalAdapter(stores.MoodLog),
} as const;

const safeRemoteCall = async <T>(fallback: () => Promise<T>, attempt: () => Promise<T>) => {
  if (!isRemoteEnabled) {
    return fallback();
  }
  return attempt();
};

const normalizeDocument = <T extends Record<string, any>>(doc: T): T & { id: string } => {
  if (!doc) {
    return doc as T & { id: string };
  }
  const normalized = { ...doc } as Record<string, any>;
  const identifier = normalized.id ?? normalized._id;
  if (identifier) {
    normalized.id = String(identifier);
  }
  if (normalized._id !== undefined) {
    delete normalized._id;
  }
  if (normalized.user && typeof normalized.user === "object" && normalized.user !== null) {
    normalized.user = normalized.user._id ? String(normalized.user._id) : String(normalized.user);
  }
  return normalized as T & { id: string };
};

const normalizeArray = <T extends Record<string, any>>(collection: T[]): (T & { id: string })[] =>
  collection.map((item) => normalizeDocument(item));

const remoteAdapters = {
  WorkoutSession: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WorkoutSession.list(order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit });
          const { workouts } = await apiFetch<{ workouts: WorkoutSession[] }>(`/workouts${query}`);
          return normalizeArray(workouts);
        }
      ),
    filter: (criteria: Partial<WorkoutSession>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WorkoutSession.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit, date: (criteria as { date?: string }).date });
          const { workouts } = await apiFetch<{ workouts: WorkoutSession[] }>(`/workouts${query}`);
          return normalizeArray(workouts);
        }
      ),
    create: (input: Omit<WorkoutSession, "id"> & Partial<Pick<WorkoutSession, "id">>) =>
      safeRemoteCall(
        () => localAdapters.WorkoutSession.create!(input),
        async () => {
          const { workout } = await apiFetch<{ workout: WorkoutSession }>("/workouts", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(workout);
        }
      ),
    update: (id: string, patch: Partial<WorkoutSession>) =>
      safeRemoteCall(
        () => localAdapters.WorkoutSession.update!(id, patch),
        async () => {
          const { workout } = await apiFetch<{ workout: WorkoutSession }>(`/workouts/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
          });
          return normalizeDocument(workout);
        }
      ),
  } satisfies EntityAdapter<WorkoutSession>,
  NutritionLog: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.NutritionLog.list(order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit });
          const { meals } = await apiFetch<{ meals: NutritionLog[] }>(`/nutrition/logs${query}`);
          return normalizeArray(meals);
        }
      ),
    filter: (criteria: Partial<NutritionLog>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.NutritionLog.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit, date: (criteria as { date?: string }).date });
          const { meals } = await apiFetch<{ meals: NutritionLog[] }>(`/nutrition/logs${query}`);
          return normalizeArray(meals);
        }
      ),
    create: (input: Omit<NutritionLog, "id"> & Partial<Pick<NutritionLog, "id">>) =>
      safeRemoteCall(
        () => localAdapters.NutritionLog.create!(input),
        async () => {
          const { meal } = await apiFetch<{ meal: NutritionLog }>("/nutrition/logs", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(meal);
        }
      ),
  } satisfies EntityAdapter<NutritionLog>,
  WaterLog: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WaterLog.list(order, limit),
        async () => {
          const query = encodeQuery({ limit });
          const { logs } = await apiFetch<{ logs: WaterLog[] }>(`/nutrition/water${query}`);
          return normalizeArray(logs);
        }
      ),
    filter: (criteria: Partial<WaterLog>, _order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WaterLog.filter(criteria, _order, limit),
        async () => {
          const query = encodeQuery({ limit, date: (criteria as { date?: string }).date });
          const { logs } = await apiFetch<{ logs: WaterLog[] }>(`/nutrition/water${query}`);
          return normalizeArray(logs);
        }
      ),
    create: (input: Omit<WaterLog, "id"> & Partial<Pick<WaterLog, "id">>) =>
      safeRemoteCall(
        () => localAdapters.WaterLog.create!(input),
        async () => {
          const { log } = await apiFetch<{ log: WaterLog }>("/nutrition/water", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(log);
        }
      ),
  } satisfies EntityAdapter<WaterLog>,
  SleepLog: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.SleepLog.list(order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit });
          const { logs } = await apiFetch<{ logs: SleepLog[] }>(`/sleep${query}`);
          return normalizeArray(logs);
        }
      ),
    filter: (criteria: Partial<SleepLog>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.SleepLog.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit, date: (criteria as { date?: string }).date });
          const { logs } = await apiFetch<{ logs: SleepLog[] }>(`/sleep${query}`);
          return normalizeArray(logs);
        }
      ),
    create: (input: Omit<SleepLog, "id"> & Partial<Pick<SleepLog, "id">>) =>
      safeRemoteCall(
        () => localAdapters.SleepLog.create!(input),
        async () => {
          const { log } = await apiFetch<{ log: SleepLog }>("/sleep", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(log);
        }
      ),
  } satisfies EntityAdapter<SleepLog>,
  AIInsight: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.AIInsight.list(order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit });
          const { insights } = await apiFetch<{ insights: AIInsight[] }>(`/insights${query}`);
          return normalizeArray(insights);
        }
      ),
    filter: (criteria: Partial<AIInsight>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.AIInsight.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ sort: order, limit, unread: criteria.read === false ? "true" : undefined });
          const { insights } = await apiFetch<{ insights: AIInsight[] }>(`/insights${query}`);
          return normalizeArray(insights);
        }
      ),
    create: (input: Omit<AIInsight, "id"> & Partial<Pick<AIInsight, "id">>) =>
      safeRemoteCall(
        () => localAdapters.AIInsight.create!(input),
        async () => {
          const { insight } = await apiFetch<{ insight: AIInsight }>("/insights", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(insight);
        }
      ),
    update: (id: string, patch: Partial<AIInsight>) =>
      safeRemoteCall(
        () => localAdapters.AIInsight.update!(id, patch),
        async () => {
          if (patch.read === true) {
            const { insight } = await apiFetch<{ insight: AIInsight }>(`/insights/${id}/read`, {
              method: "PATCH",
            });
            return normalizeDocument(insight);
          }
          const { insight } = await apiFetch<{ insight: AIInsight }>(`/insights/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
          });
          return normalizeDocument(insight);
        }
      ),
  } satisfies EntityAdapter<AIInsight>,
  MealPlan: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.MealPlan.list(order, limit),
        async () => {
          const query = encodeQuery({ limit });
          const { plans } = await apiFetch<{ plans: MealPlan[] }>(`/meal-plans${query}`);
          return normalizeArray(plans);
        }
      ),
    filter: (criteria: Partial<MealPlan>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.MealPlan.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ week_start_date: (criteria as { week_start_date?: string }).week_start_date });
          const { plans } = await apiFetch<{ plans: MealPlan[] }>(`/meal-plans${query}`);
          return normalizeArray(plans);
        }
      ),
    create: (input: Omit<MealPlan, "id"> & Partial<Pick<MealPlan, "id">>) =>
      safeRemoteCall(
        () => localAdapters.MealPlan.create!(input),
        async () => {
          const { plan } = await apiFetch<{ plan: MealPlan }>("/meal-plans", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(plan);
        }
      ),
    update: (id: string, patch: Partial<MealPlan>) =>
      safeRemoteCall(
        () => localAdapters.MealPlan.update!(id, patch),
        async () => {
          const { plan } = await apiFetch<{ plan: MealPlan }>(`/meal-plans/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
          });
          return normalizeDocument(plan);
        }
      ),
  } satisfies EntityAdapter<MealPlan>,
  RecoveryScore: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.RecoveryScore.list(order, limit),
        async () => {
          const query = encodeQuery({ limit });
          const { scores } = await apiFetch<{ scores: RecoveryScore[] }>(`/recovery${query}`);
          return normalizeArray(scores);
        }
      ),
    filter: (criteria: Partial<RecoveryScore>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.RecoveryScore.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ date: (criteria as { date?: string }).date, limit });
          const { scores } = await apiFetch<{ scores: RecoveryScore[] }>(`/recovery${query}`);
          return normalizeArray(scores);
        }
      ),
    create: (input: Omit<RecoveryScore, "id"> & Partial<Pick<RecoveryScore, "id">>) =>
      safeRemoteCall(
        () => localAdapters.RecoveryScore.create!(input),
        async () => {
          const { score } = await apiFetch<{ score: RecoveryScore }>("/recovery", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(score);
        }
      ),
  } satisfies EntityAdapter<RecoveryScore>,
  WorkoutBuddy: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WorkoutBuddy.list(order, limit),
        async () => {
          const { buddies } = await apiFetch<{ buddies: WorkoutBuddy[] }>("/social/buddies");
          return normalizeArray(buddies);
        }
      ),
    filter: (criteria: Partial<WorkoutBuddy>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.WorkoutBuddy.filter(criteria, order, limit),
        async () => {
          const { buddies } = await apiFetch<{ buddies: WorkoutBuddy[] }>("/social/buddies");
          return normalizeArray(buddies);
        }
      ),
    create: (input: Omit<WorkoutBuddy, "id"> & Partial<Pick<WorkoutBuddy, "id">>) =>
      safeRemoteCall(
        () => localAdapters.WorkoutBuddy.create!(input),
        async () => {
          const { buddy } = await apiFetch<{ buddy: WorkoutBuddy }>("/social/buddies", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(buddy);
        }
      ),
  } satisfies EntityAdapter<WorkoutBuddy>,
  Challenge: {
    list: (order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.Challenge.list(order, limit),
        async () => {
          const { challenges } = await apiFetch<{ challenges: Challenge[] }>("/social/challenges");
          return normalizeArray(challenges);
        }
      ),
    filter: (criteria: Partial<Challenge>, order?: string, limit?: number) =>
      safeRemoteCall(
        () => localAdapters.Challenge.filter(criteria, order, limit),
        async () => {
          const query = encodeQuery({ is_community: (criteria as { is_community?: boolean }).is_community ?? undefined });
          const { challenges } = await apiFetch<{ challenges: Challenge[] }>(`/social/challenges${query}`);
          return normalizeArray(challenges);
        }
      ),
    create: (input: Omit<Challenge, "id"> & Partial<Pick<Challenge, "id">>) =>
      safeRemoteCall(
        () => localAdapters.Challenge.create!(input),
        async () => {
          const { challenge } = await apiFetch<{ challenge: Challenge }>("/social/challenges", {
            method: "POST",
            body: JSON.stringify(input),
          });
          return normalizeDocument(challenge);
        }
      ),
  } satisfies EntityAdapter<Challenge>,
} as const;

const getAdapter = <K extends keyof typeof localAdapters>(key: K): EntityAdapter<any> => {
  if (isRemoteEnabled) {
    const remoteAdapter = (remoteAdapters as Record<string, EntityAdapter<any> | undefined>)[key as string];
    if (remoteAdapter) {
      return remoteAdapter;
    }
  }
  return localAdapters[key];
};

const adminApi = {
  listUsers: async (): Promise<AdminUserRecord[]> => {
    if (!isRemoteEnabled) {
      return [];
    }
    const { users } = await apiFetch<{ users: AdminUserRecord[] }>("/admin/users");
    return normalizeArray(users);
  },
  getUserSummary: async (userId: string): Promise<AdminUserSummary> => {
    if (!isRemoteEnabled) {
      return {
        metrics: {
          workouts: sampleWorkoutSessions.length,
          meals: sampleNutritionLogs.length,
          latestRecovery: sampleRecoveryScores[0] ?? null,
        },
      };
    }
    const summary = await apiFetch<AdminUserSummary>(`/admin/users/${userId}/summary`);
    if (summary.metrics.latestRecovery) {
      summary.metrics.latestRecovery = normalizeDocument(summary.metrics.latestRecovery);
    }
    return summary;
  },
};

const aiApi = {
  askCoach: async (payload: { question: string }) => {
    const response = await apiFetch<CoachResponse>("/ai/coach", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  },
  generateMealPlan: async (payload: {
    dietaryPreference?: string;
    calorieTarget?: number;
    proteinTarget?: number;
    carbsTarget?: number;
    fatTarget?: number;
  }) => {
    const response = await apiFetch<MealPlanGeneration>("/ai/meal-plan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  },
};

type InvokeLLMOptions = {
  prompt: string;
  response_json_schema?: Record<string, unknown>;
  file_urls?: string[];
};

const mockLLMResponder = async (options: InvokeLLMOptions): Promise<any> => {
  const properties =
    (options.response_json_schema as { properties?: Record<string, { type?: string }> } | undefined)
      ?.properties ?? {};

  if ("answer" in properties) {
    return {
      answer:
        "Focus on progressive overload, adequate protein, and consistent sleep. Balance high-intensity days with purposeful recovery to keep performance climbing.",
      tips: [
        "Add 2.5-5lb to compound lifts every other week if form allows",
        "Keep post-workout meals rich in protein and slow carbs",
        "Perform 10 minutes of mobility work on non-lifting days",
      ],
    };
  }

  if ("overall_score" in properties) {
    return {
      id: `recovery-${Date.now()}`,
      date: todayISO(),
      overall_score: 78,
      sleep_score: 74,
      nutrition_score: 82,
      workout_load_score: 70,
      readiness: "moderate",
      recommendations: [
        "Keep hydration above 3L today and include electrolytes post-workout",
        "Schedule a light mobility or yoga session before bed",
        "Fuel tonight's dinner with 40g protein and complex carbohydrates",
      ],
      suggested_workout_intensity: "moderate",
    } satisfies RecoveryScore;
  }

  if ("title" in properties) {
    const templates: AIInsight[] = [
      {
        id: "generated-1",
        date: todayISO(),
        type: "workout",
        title: "Leverage Your Strength Momentum",
        message: "Your last 3 strength sessions show progressive increases. Keep bar speed controlled and stay within RPE 7-8 for longevity.",
        priority: "medium",
        action_items: [
          "Log bar speed or perceived explosiveness after each top set",
          "Add band pull-aparts between press sets to prime shoulders",
          "Finish with light mobility to maintain range of motion",
        ],
        read: false,
      },
      {
        id: "generated-2",
        date: todayISO(),
        type: "nutrition",
        title: "Dialed-In Fueling",
        message: "Your calorie intake is tracking 120 below target. Bump carbs slightly around workout windows to keep energy high.",
        priority: "high",
        action_items: [
          "Add 35g complex carbs to pre-workout meal",
          "Include a recovery shake with 25g protein and 30g carbs",
          "Prep overnight oats tonight to stay ahead",
        ],
        read: false,
      },
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  return { message: "No schema match" };
};

type LoginCredentials = { email: string; password: string };
export type PersonalIntake = Partial<
  Pick<
    DemoUser,
    | "first_name"
    | "last_name"
    | "gender"
    | "height_cm"
    | "weight_kg"
    | "body_type"
    | "primary_goal"
    | "secondary_goal"
    | "goal_reason"
    | "fitness_goal"
    | "experience_level"
    | "dietary_preference"
    | "dietary_restrictions"
    | "allergies"
    | "favorite_foods"
    | "avoid_foods"
    | "preferred_cuisines"
    | "activity_level"
    | "available_equipment"
    | "workout_environment"
    | "preferred_training_time"
    | "motivation_style"
    | "mood_tags"
    | "stress_level"
    | "injuries"
    | "medical_conditions"
    | "lifestyle_notes"
    | "hydration_focus"
    | "sleep_challenges"
    | "ai_persona"
    | "support_expectations"
    | "target_weight"
    | "daily_calorie_target"
    | "daily_protein_target"
    | "daily_carbs_target"
    | "daily_fat_target"
    | "daily_water_target_ml"
    | "sleep_target_hours"
    | "age"
  >
>;

type RegisterPayload = LoginCredentials & { full_name: string; profile: PersonalIntake };

const demoAuthState: AuthState = { token: "demo-token", user: demoUser };

const base44Auth = {
  async login(credentials?: LoginCredentials): Promise<{ user: DemoUser; token: string }> {
    if (isRemoteEnabled) {
      if (!credentials) {
        throw new Error("Email and password are required");
      }
      const data = await apiFetch<{ user: DemoUser; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setAuthState({ token: data.token, user: data.user });
      return data;
    }
    setAuthState(demoAuthState);
    return demoAuthState;
  },
  async register(payload?: RegisterPayload) {
    if (isRemoteEnabled) {
      if (!payload?.email || !payload?.password || !payload?.full_name) {
        throw new Error("Registration details are required");
      }
      const data = await apiFetch<{ user: DemoUser; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuthState({ token: data.token, user: data.user });
      return data;
    }

    const offlineUser: DemoUser = {
      ...demoUser,
      ...((payload?.profile ?? {}) as DemoUser),
      id: "user-offline",
      email: payload?.email ?? demoUser.email,
      full_name: payload?.full_name ?? demoUser.full_name,
      profile_completed: true,
    };
    const offlineState = { token: demoAuthState.token, user: offlineUser };
    setAuthState(offlineState);
    return offlineState;
  },
  async logout() {
    setAuthState(null);
  },
  async me() {
    if (isRemoteEnabled) {
      const state = getAuthState();
      if (!state?.token) {
        throw new Error("Not authenticated");
      }
      const data = await apiFetch<{ user: DemoUser }>("/auth/me");
      setAuthState({ token: state.token, user: data.user });
      return data.user;
    }
    const state = getAuthState();
    return state?.user ?? null;
  },
  async updateProfile(updates: Partial<DemoUser>) {
    if (isRemoteEnabled) {
      const data = await apiFetch<{ user: DemoUser }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const state = getAuthState();
      setAuthState({ token: state?.token ?? "", user: data.user });
      return data.user;
    }
    const existing = getAuthState() ?? demoAuthState;
    const updatedUser = { ...existing.user, ...updates } as DemoUser;
    setAuthState({ token: existing.token, user: updatedUser });
    return updatedUser;
  },
};

const getLatestLocalPlan = async (): Promise<PersonalizedPlan> => {
  const plans = await localAdapters.PersonalizedPlan.list("-updatedAt", 1);
  return clone(plans[0] ?? samplePersonalizedPlan);
};

const buildOfflinePlanFromSample = (reason?: string): PersonalizedPlan => {
  const timestamp = new Date().toISOString();
  const plan = clone(samplePersonalizedPlan);
  plan.id = `plan-${Date.now()}`;
  plan.generated_reason = reason ?? "demo-refresh";
  plan.updatedAt = timestamp;
  plan.createdAt = plan.createdAt ?? timestamp;
  plan.metadata = {
    ...(plan.metadata ?? {}),
    last_generated_reason: reason ?? "demo-refresh",
    demo: true,
  };
  return plan;
};

const base44Personalization = {
  async getLatest(): Promise<PersonalizedPlan> {
    const plan = await safeRemoteCall(
      async () => getLatestLocalPlan(),
      async () => {
        const { plan } = await apiFetch<{ plan: PersonalizedPlan }>("/personalization");
        const normalized = normalizeDocument(plan) as PersonalizedPlan;
        await localAdapters.PersonalizedPlan.create!(normalized);
        return normalized;
      }
    );
    return clone(plan);
  },
  async generate(reason?: string): Promise<PersonalizedPlan> {
    const plan = await safeRemoteCall(
      async () => {
        const offline = buildOfflinePlanFromSample(reason);
        await localAdapters.PersonalizedPlan.create!(offline);
        return offline;
      },
      async () => {
        const { plan } = await apiFetch<{ plan: PersonalizedPlan }>("/personalization/generate", {
          method: "POST",
          body: JSON.stringify({ reason }),
        });
        const normalized = normalizeDocument(plan) as PersonalizedPlan;
        await localAdapters.PersonalizedPlan.create!(normalized);
        return normalized;
      }
    );
    return clone(plan);
  },
  async adjustNutrition(input: { foods: string[]; purpose?: string }): Promise<PersonalizedPlan> {
    const plan = await safeRemoteCall(
      async () => {
        const latest = await getLatestLocalPlan();
        const additions = input.foods.map((food) => ({
          name: food,
          meal_type: "custom" as const,
          calories: 220,
          protein: 15,
          carbs: 20,
          fat: 7,
          fiber: 4,
          ingredients: [food],
          notes: `Added by user preference (${input.purpose ?? "custom"}).`,
        }));
        const updated: PersonalizedPlan = {
          ...latest,
          nutrition_plan: {
            ...latest.nutrition_plan,
            snacks: [...(latest.nutrition_plan.snacks ?? []), ...additions],
            guidance: [
              ...(latest.nutrition_plan.guidance ?? []),
              `Plan tuned with user foods: ${input.foods.join(", ")}.`,
            ],
            calories_target:
              latest.nutrition_plan.calories_target + additions.reduce((total, snack) => total + snack.calories, 0),
          },
          updatedAt: new Date().toISOString(),
        };
        await localAdapters.PersonalizedPlan.create!(updated);
        return updated;
      },
      async () => {
        const { plan } = await apiFetch<{ plan: PersonalizedPlan }>("/personalization/nutrition/adjust", {
          method: "POST",
          body: JSON.stringify(input),
        });
        const normalized = normalizeDocument(plan) as PersonalizedPlan;
        await localAdapters.PersonalizedPlan.create!(normalized);
        return normalized;
      }
    );
    return clone(plan);
  },
  async updateIntake(profile: PersonalIntake): Promise<DemoUser> {
    const user = await safeRemoteCall(
      async () => {
        const authState = getAuthState() ?? demoAuthState;
        const updatedUser = { ...authState.user, ...profile, profile_completed: true } as DemoUser;
        setAuthState({ token: authState.token, user: updatedUser });
        return updatedUser;
      },
      async () => {
        const { user } = await apiFetch<{ user: DemoUser }>("/personalization/intake", {
          method: "POST",
          body: JSON.stringify(profile),
        });
        const state = getAuthState();
        setAuthState({ token: state?.token ?? demoAuthState.token, user });
        return user;
      }
    );
    return clone(user);
  },
};

export type MoodLogPayload = Omit<MoodLogEntry, "id" | "createdAt"> & { createdAt?: string };

const base44Mood = {
  async list(limit = 21): Promise<MoodLogEntry[]> {
    const moods = await safeRemoteCall(
      () => localAdapters.MoodLog.list("-createdAt", limit),
      async () => {
        const query = encodeQuery({ limit });
        const { moods } = await apiFetch<{ moods: MoodLogEntry[] }>(`/mood${query}`);
        const normalized = normalizeArray(moods);
        for (const mood of normalized) {
          await localAdapters.MoodLog.create!(mood);
        }
        return normalized;
      }
    );
    return clone(moods);
  },
  async latest(): Promise<MoodLogEntry | null> {
    const moods = await base44Mood.list(1);
    return moods[0] ?? null;
  },
  async create(payload: MoodLogPayload): Promise<MoodLogEntry> {
    const entry = await safeRemoteCall(
      async () => {
        const mood: MoodLogEntry = {
          id: `mood-${Date.now()}`,
          createdAt: payload.createdAt ?? new Date().toISOString(),
          mood: payload.mood ?? "balanced",
          energy_level: payload.energy_level ?? "moderate",
          stress_level: payload.stress_level ?? "moderate",
          motivation_level: payload.motivation_level ?? "moderate",
          soreness_level: payload.soreness_level ?? "moderate",
          sleep_quality: payload.sleep_quality ?? "good",
          tags: payload.tags ?? [],
          note: payload.note,
          context: payload.context,
          custom_mood: payload.custom_mood,
        };
        await localAdapters.MoodLog.create!(mood);
        return mood;
      },
      async () => {
        const { mood } = await apiFetch<{ mood: MoodLogEntry }>("/mood", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const normalized = normalizeDocument(mood) as MoodLogEntry;
        await localAdapters.MoodLog.create!(normalized);
        return normalized;
      }
    );
    return clone(entry);
  },
};

export type FoodRecognitionResult = { id: string; name: string; confidence: number };
export type FoodRecognitionInput = { imageUrl?: string; base64Image?: string; mimeType?: string; topK?: number };
export type FoodScanAnalysis = {
  meal_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthy_alternatives: string[];
  nutrition_tips: string[];
};
export type FoodScanResponse = {
  foods: FoodRecognitionResult[];
  analysis?: FoodScanAnalysis;
};

const heuristicRecognizeFood = (description: string, topK = 4): FoodRecognitionResult[] => {
  const lower = description.toLowerCase();
  const library: Array<{ keywords: string[]; result: FoodRecognitionResult }> = [
    { keywords: ["salmon", "fish"], result: { id: "food-salmon", name: "Grilled Salmon", confidence: 0.91 } },
    { keywords: ["oat", "porridge"], result: { id: "food-oats", name: "Protein Oats Bowl", confidence: 0.87 } },
    { keywords: ["yogurt", "parfait"], result: { id: "food-yogurt", name: "Greek Yogurt Parfait", confidence: 0.84 } },
    { keywords: ["smoothie", "shake"], result: { id: "food-smoothie", name: "Recovery Smoothie", confidence: 0.83 } },
    { keywords: ["chicken", "bowl"], result: { id: "food-chicken", name: "Power Chicken Bowl", confidence: 0.86 } },
    { keywords: ["tofu", "plant"], result: { id: "food-tofu", name: "Tempeh Glow Bowl", confidence: 0.8 } },
    { keywords: ["avocado", "toast"], result: { id: "food-avocado", name: "Avocado Toast", confidence: 0.78 } },
  ];

  const matches = library.filter(({ keywords }) => keywords.some((keyword) => lower.includes(keyword))).map(({ result }) => result);
  if (matches.length) {
    return matches.slice(0, topK);
  }
  return [
    { id: "food-balanced-bowl", name: "Rainbow Macro Bowl", confidence: 0.75 },
    { id: "food-protein-shake", name: "Protein Shake", confidence: 0.7 },
  ].slice(0, topK);
};

const scanMeal = async (input: FoodRecognitionInput): Promise<FoodScanResponse> => {
  const topK = input.topK ?? 5;
  return safeRemoteCall(
    async () => {
      const description = input.imageUrl ?? "user meal";
      const foods = heuristicRecognizeFood(description, topK);
      const topNames = foods.slice(0, 3).map((food) => food.name);
      return {
        foods,
        analysis: {
          meal_name: `AI Scan: ${topNames.slice(0, 2).join(" + ") || "Detected Meal"}`,
          description: `Estimated from detected foods: ${topNames.join(", ") || "mixed ingredients"}`,
          calories: 420,
          protein: 28,
          carbs: 42,
          fat: 15,
          healthy_alternatives: [
            "Add a vegetable side for fiber and micronutrients",
            "Prefer grilled or baked prep methods when possible",
          ],
          nutrition_tips: [
            "Use AI scan values as estimates and adjust with manual logs",
            "Pair this meal with water to support digestion and satiety",
          ],
        },
      };
    },
    async () => {
      const payload = await apiFetch<{ foods: FoodRecognitionResult[]; analysis?: FoodScanAnalysis }>(
        "/nutrition/recognize",
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      const foods = (payload.foods ?? []).map((food) => {
        const confidenceRaw =
          (food as { confidence?: number; value?: number }).confidence ??
          (food as { value?: number }).value ??
          0;
        return { ...food, confidence: Number(confidenceRaw) };
      });

      return {
        foods,
        analysis: payload.analysis,
      };
    }
  );
};

const base44Nutrition = {
  scanMeal,
  async recognizeFood(input: FoodRecognitionInput): Promise<FoodRecognitionResult[]> {
    const result = await scanMeal(input);
    return result.foods;
  },
};

export const base44 = {
  auth: base44Auth,
  entities: {
    WorkoutSession: getAdapter("WorkoutSession"),
    NutritionLog: getAdapter("NutritionLog"),
    SleepLog: getAdapter("SleepLog"),
    WaterLog: getAdapter("WaterLog"),
    AIInsight: getAdapter("AIInsight"),
    Exercise: getAdapter("Exercise"),
    WorkoutBuddy: getAdapter("WorkoutBuddy"),
    Challenge: getAdapter("Challenge"),
    Achievement: getAdapter("Achievement"),
    MealPlan: getAdapter("MealPlan"),
    RecoveryScore: getAdapter("RecoveryScore"),
    PersonalizedPlan: getAdapter("PersonalizedPlan"),
    MoodLog: getAdapter("MoodLog"),
  },
  integrations: {
    Core: {
      InvokeLLM: mockLLMResponder,
    },
  },
  admin: adminApi,
  ai: aiApi,
  personalization: base44Personalization,
  mood: base44Mood,
  nutrition: base44Nutrition,
};

export type Base44Client = typeof base44;
export type {
  DemoUser,
  NutritionLog,
  WaterLog,
  WorkoutSession,
  MealPlan,
  MealPlanMeal,
  MealPlanGroceryItem,
  RecoveryScore,
  SleepLog,
  WorkoutBuddy,
  AIInsight,
  Exercise,
  Challenge,
  Achievement,
  PersonalizedPlan,
  PlanDay,
  PlanSession,
  PlanExercise,
  NutritionPlan,
  LifestylePlan,
  MoodLogEntry,
} from "./sampleData";

export type { CoachResponse, CoachExerciseRecommendation, MealPlanGeneration };
