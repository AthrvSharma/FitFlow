import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44, type DemoUser, type PersonalIntake } from "@/api/base44Client";

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterPayload = LoginCredentials & {
  full_name: string;
  profile: PersonalIntake;
};

type AuthContextValue = {
  user: DemoUser | null;
  loading: boolean;
  login: (credentials?: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "fitflow:auth";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { user?: DemoUser };
          if (parsed?.user) {
            setUser(parsed.user);
          }
        } catch (error) {
          console.error("Failed to parse stored auth state", error);
        }
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh auth state", error);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const initialise = async () => {
      await refresh();
      setLoading(false);
    };
    initialise();
  }, [refresh]);

  const login = useCallback(async (credentials?: LoginCredentials) => {
    const { user: loggedInUser, token } = await base44.auth.login(credentials);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: loggedInUser }));
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: registeredUser, token } = await base44.auth.register(payload);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user: registeredUser }));
    setUser(registeredUser);
  }, []);

  const logout = useCallback(async () => {
    await base44.auth.logout();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
