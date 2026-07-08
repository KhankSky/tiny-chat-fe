"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/api/auth-api";
import { clearAuthSession, getAccessToken, persistAuthSession } from "@/shared/auth/session";
import type { Locale } from "@/i18n/types";

export function SessionRedirect(_props: { locale?: Locale } = {}) {
  void _props;
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
            ? "/conversations"
            : "/auth/complete-profile",
        );
      } catch {
        clearAuthSession();
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
