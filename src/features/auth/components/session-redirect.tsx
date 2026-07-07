"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api/auth-api";
import { clearAuthSession, getAccessToken, persistAuthSession } from "@/shared/auth/session";
import type { Locale } from "@/i18n/types";

export function SessionRedirect({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAccessToken()) return;

      try {
        const user = await getCurrentUser();
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
