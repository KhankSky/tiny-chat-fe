"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api/client";
import type { AuthUserResponse } from "@/lib/api/types";
import { persistAuthSession } from "@/lib/auth/session";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await apiPost<AuthUserResponse, { email: string; password: string }>(
        isLogin ? "/api/auth/login" : "/api/auth/register",
        {
          email,
          password,
        },
      );

      persistAuthSession(user);
      router.push(user.profileCompleted ? "/app" : "/auth/complete-profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
      </button>
    </form>
  );
}
