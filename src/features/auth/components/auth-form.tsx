"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { googleLogin, login, register } from "@/features/auth/api/auth-api";
import { persistAuthSession } from "@/shared/auth/session";
import type { Dictionary, Locale } from "@/i18n/types";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  dictionary,
}: {
  mode: Mode;
  dictionary: Dictionary;
  locale?: Locale;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleGoogleCredential(response: { credential: string }) {
    setError(null);
    setLoading(true);
    try {
      const user = await googleLogin({ idToken: response.credential });
      persistAuthSession(user);
      router.push(user.profileCompleted ? "/conversations" : "/auth/complete-profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.auth.errorFallback);
    } finally {
      setLoading(false);
    }
  }

  function initializeGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
    const button = document.getElementById("google-sign-in-button");
    if (button && !button.dataset.googleRendered) {
      window.google.accounts.id.renderButton(button, { theme: "outline", size: "large", width: 400 });
      button.dataset.googleRendered = "true";
    }
  }

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      initializeGoogle();
      attempts += 1;
      if (document.querySelector("#google-sign-in-button iframe") || attempts >= 30) {
        window.clearInterval(timer);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [dictionary.auth.errorFallback]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await (isLogin ? login : register)({ email, password });

      persistAuthSession(user);
      router.push(
        user.profileCompleted ? "/conversations" : "/auth/complete-profile",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.auth.errorFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer onLoad={initializeGoogle} />
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          {dictionary.auth.emailLabel}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.08]"
          placeholder={dictionary.auth.emailPlaceholder}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          {dictionary.auth.passwordLabel}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.08]"
          placeholder={dictionary.auth.passwordPlaceholder}
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />
      </div>

      {error ? (
        <p className="tc-alert-danger rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading
          ? dictionary.auth.loading
          : isLogin
            ? dictionary.auth.loginButton
            : dictionary.auth.registerButton}
      </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"><span className="h-px flex-1 bg-white/10" />{dictionary.auth.authDivider}<span className="h-px flex-1 bg-white/10" /></div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">{dictionary.auth.googleAuthTitle}</p>
        <p className="text-xs text-slate-500">{dictionary.auth.googleAuthDescription}</p>
      </div>
      <div className="mt-3 flex min-h-10 w-full justify-center overflow-hidden rounded-xl [&>div]:overflow-hidden [&>div]:rounded-xl">
        <div id="google-sign-in-button" className="flex min-h-10 justify-center" />
      </div>
    </>
  );
}
