"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import type { AuthUserResponse } from "@/lib/api/types";
import { clearAuthSession, getAccessToken, persistAuthSession } from "@/lib/auth/session";
import type { Locale } from "@/i18n/types";

export function SessionRedirect({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAccessToken()) return;

      try {
        const user = await apiGet<AuthUserResponse>("/api/auth/me");
        if (!active) return;

        persistAuthSession(user);
        router.replace(
          user.profileCompleted
            ? `/${locale}/conversations`
            : `/${locale}/auth/complete-profile`,
        );
      } catch {
        clearAuthSession();
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [locale, router]);

  return null;
}

