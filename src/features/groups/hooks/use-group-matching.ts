"use client";

import { useMemo, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import { matchGroup } from "@/features/groups/api/groups-api";
import type { MatchGroupResponse } from "@/features/groups/types";
import { formatGroupLabel } from "@/features/groups/utils/group-format";
import type { Dictionary } from "@/i18n/types";
import { getStoredAuthUser } from "@/shared/auth/session";

type CurrentUser = Pick<
  AuthUserResponse,
  "displayName" | "englishLevel" | "practiceGoal" | "interests" | "profileCompleted" | "email"
>;

export function useGroupMatching(dictionary: Dictionary) {
  const copy = dictionary.groups;
  const [matchResult, setMatchResult] = useState<MatchGroupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    return getStoredAuthUser() as CurrentUser | null;
  }, []);

  async function findGroup() {
    setError(null);
    setLoading(true);

    try {
      const result = await matchGroup();
      setMatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.matchErrorFallback);
    } finally {
      setLoading(false);
    }
  }

  const profileSignals = {
    currentGoal: currentUser?.practiceGoal
      ? formatGroupLabel(currentUser.practiceGoal, dictionary)
      : copy.goalUnknown,
    currentInterests: currentUser?.interests?.length
      ? `${currentUser.interests.length} ${copy.interestsCount}`
      : copy.noInterests,
    currentLevel: currentUser?.englishLevel
      ? formatGroupLabel(currentUser.englishLevel, dictionary)
      : copy.levelUnknown,
  };

  return {
    currentUser,
    error,
    findGroup,
    loading,
    matchResult,
    profileSignals,
  };
}
