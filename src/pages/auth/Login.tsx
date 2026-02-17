import React, { useState } from "react";
import { Link, useNavigate, useLocation, type Location } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiConfigured) {
      setError("API URL is not configured. Please set VITE_API_URL in your environment.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-6">
      <div className="w-full max-w-md space-y-6 bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-2xl">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-slate-200 text-sm">
            Sign in to continue your FitFlow journey
          </p>
        </div>

        {!apiConfigured && (
          <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-400/40 rounded-xl px-3 py-2">
            Configure <code className="font-mono">VITE_API_URL</code> in your <code className="font-mono">.env</code> so FitFlow can reach the backend API.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-slate-200">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase text-slate-200">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-300">
          Need an account? {" "}
          <Link to="/register" className="text-indigo-200 font-semibold hover:underline">
            Create one
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
