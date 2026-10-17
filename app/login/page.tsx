"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/explore";
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      await refreshUser();
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test credentials for judges/reviewers
  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sunset-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-6 h-6 text-amber-200" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500">
          Sign in to vote, confirm visits, bookmark spots and earn badges.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full text-xs rounded-xl pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs rounded-xl pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-700 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In to HiddenGems"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Demo Fast-Login For Judges */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
          Demo Credentials (1-Click Fill)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo("admin@hiddengems.local", "AdminPass123!")}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-left bg-slate-50 dark:bg-slate-800/60"
          >
            <div className="font-bold text-[11px] text-slate-900 dark:text-white">Admin Demo</div>
            <div className="text-[10px] text-slate-400">admin@hiddengems.local</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("priya.explorer@gmail.com", "Password123!")}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-left bg-slate-50 dark:bg-slate-800/60"
          >
            <div className="font-bold text-[11px] text-slate-900 dark:text-white">Student Demo</div>
            <div className="text-[10px] text-slate-400">priya.explorer@...</div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Don't have an account yet?{" "}
        <Link href="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
