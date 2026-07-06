"use client";

import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api/client";
import type { AuthUserResponse } from "@/lib/api/types";
import { persistAuthSession } from "@/lib/auth/session";
import type { Locale } from "@/i18n/types";

type ProfileRequest = {
  displayName: string;
  avatarUrl: string | null;
  englishLevel: "LEVEL_A" | "LEVEL_B" | "LEVEL_C";
  practiceGoal:
    | "DAILY_CHAT"
    | "IMPROVE_WRITING"
    | "MAKE_FRIENDS"
    | "TOEIC_BASIC"
    | "IELTS_BASIC";
  interests: string[];
  bio: string | null;
};

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

export function CompleteProfileForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedInterests.length) {
      setError(locale === "vi" ? "Chọn ít nhất một sở thích." : "Pick at least one interest.");
      return;
    }

    setLoading(true);
    try {
      const user = await apiPost<AuthUserResponse, ProfileRequest>(
        "/api/auth/profile/complete",
        {
          displayName,
          avatarUrl: avatarUrl.trim() || null,
          englishLevel,
          practiceGoal,
          interests: selectedInterests,
          bio: bio.trim() || null,
        },
      );

      persistAuthSession(user);
      router.replace(`/${locale}/conversations`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={locale === "vi" ? "Tên hiển thị" : "Display name"}>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
            placeholder={locale === "vi" ? "Nguyễn An" : "Alex Nguyen"}
            required
          />
        </Field>

        <Field label={locale === "vi" ? "Ảnh đại diện URL" : "Avatar URL"}>
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
            placeholder="https://..."
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={locale === "vi" ? "Trình độ tiếng Anh" : "English level"}>
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

        <Field label={locale === "vi" ? "Mục tiêu luyện tập" : "Practice goal"}>
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

      <Field label={locale === "vi" ? "Sở thích" : "Interests"}>
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

      <Field label={locale === "vi" ? "Giới thiệu ngắn" : "Short bio"}>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          placeholder={
            locale === "vi"
              ? "Mình muốn luyện nói tiếng Anh mỗi ngày."
              : "I want to practice English every day."
          }
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
        {loading
          ? locale === "vi"
            ? "Đang lưu..."
            : "Saving..."
          : locale === "vi"
            ? "Hoàn tất hồ sơ"
            : "Complete profile"}
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
