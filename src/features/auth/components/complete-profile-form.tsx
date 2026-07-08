"use client";

import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfile } from "@/features/auth/api/auth-api";
import { uploadMeAvatar } from "@/features/profile/api/profile-api";
import type { CompleteProfileRequest } from "@/features/auth/types";
import { Avatar } from "@/shared/ui/avatar";
import { persistAuthSession, updateStoredAuthUser } from "@/shared/auth/session";
import type { Dictionary, Locale } from "@/i18n/types";

type ProfileRequest = CompleteProfileRequest;

const englishLevels = [
  { value: "LEVEL_A", label: "Beginner" },
  { value: "LEVEL_B", label: "Intermediate" },
  { value: "LEVEL_C", label: "Advanced" },
] as const;

const practiceGoals = [
  { value: "DAILY_CHAT", label: "Daily chat" },
  { value: "IMPROVE_WRITING", label: "Improve writing" },
  { value: "MAKE_FRIENDS", label: "Make friends" },
  { value: "TOEIC_BASIC", label: "TOEIC basic" },
  { value: "IELTS_BASIC", label: "IELTS basic" },
] as const;

const interests = [
  "FOOD",
  "TRAVEL",
  "STUDY",
  "WORK",
  "MUSIC",
  "MOVIES",
  "DAILY_LIFE",
  "SPORT",
  "TECHNOLOGY",
  "BOOKS",
  "GAMES",
];

export function CompleteProfileForm({
  dictionary,
}: {
  locale?: Locale;
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const t = dictionary.auth;
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [englishLevel, setEnglishLevel] = useState<ProfileRequest["englishLevel"]>("LEVEL_A");
  const [practiceGoal, setPracticeGoal] =
    useState<ProfileRequest["practiceGoal"]>("DAILY_CHAT");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["DAILY_LIFE"]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleInterest(value: string) {
    setSelectedInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  function handleAvatarFileChange(file: File | null) {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(file);
    setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedInterests.length) {
      setError(t.pickInterestError);
      return;
    }

    setLoading(true);
    try {
      const user = await completeProfile({
        displayName,
        avatarUrl: null,
        englishLevel,
        practiceGoal,
        interests: selectedInterests,
        bio: bio.trim() || null,
      });

      persistAuthSession(user);
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploaded = await uploadMeAvatar(formData);
        persistAuthSession(
          updateStoredAuthUser((stored) =>
            stored
              ? {
                  ...stored,
                  avatarUrl: uploaded.avatarUrl,
                  displayName: uploaded.displayName,
                }
              : stored,
          ) ?? user,
        );
      }
      router.replace("/conversations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveProfileError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.displayNameLabel}>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
            placeholder={t.displayNamePlaceholder}
            required
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <Avatar
            className="h-11 w-11 ring-1 ring-cyan-400/30"
            src={avatarPreviewUrl}
            alt={displayName || t.displayNameLabel}
          />
          <span className="min-w-0 text-sm text-slate-300">
            <span className="block font-medium text-white">{t.avatarUrlLabel}</span>
            <span className="block truncate text-xs text-slate-400">
              {avatarFile ? avatarFile.name : t.avatarUploadHint}
            </span>
          </span>
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => handleAvatarFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <Field label={t.englishLevelLabel}>
          <select
            value={englishLevel}
            onChange={(event) =>
              setEnglishLevel(event.target.value as ProfileRequest["englishLevel"])
            }
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            {englishLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.practiceGoalLabel}>
          <select
            value={practiceGoal}
            onChange={(event) =>
              setPracticeGoal(event.target.value as ProfileRequest["practiceGoal"])
            }
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            {practiceGoals.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t.interestsLabel}>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}
              >
                {interest.replaceAll("_", " ")}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t.shortBioLabel}>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          placeholder={t.bioPlaceholder}
        />
      </Field>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? dictionary.common.saving : t.completeProfileButton}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}
