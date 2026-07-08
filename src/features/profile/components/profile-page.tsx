"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeProfile, updateMeProfile, uploadMeAvatar } from "@/features/profile/api/profile-api";
import type { MeProfileResponse, UpdateMeProfileRequest } from "@/features/profile/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";

export function ProfilePage({
  dictionary,
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  dictionary: Dictionary;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const router = useRouter();
  const t = dictionary.profile;
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const data = await getMeProfile();
        if (!active) return;
        setProfile(data);
        setDisplayName(data.displayName ?? "");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadError);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [t.loadError]);

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

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let avatarUrl = profile?.avatarUrl ?? null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploaded = await uploadMeAvatar(formData);
        avatarUrl = uploaded.avatarUrl;
      }

      const payload: UpdateMeProfileRequest = {
        displayName: displayName.trim(),
        avatarUrl,
      };
      const updated = await updateMeProfile(payload);
      setProfile(updated);
      setDisplayName(updated.displayName ?? "");
      handleAvatarFileChange(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 text-white lg:px-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          {dictionary.appName}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-400">{t.description}</p>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
        {loading ? (
          <p className="text-sm text-slate-400">{dictionary.common.loading}</p>
        ) : null}

        {profile ? (
          <div className="grid gap-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-14 w-14 ring-1 ring-white/10"
                  src={avatarPreviewUrl || profile.avatarUrl}
                  alt={profile.displayName || profile.email}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {profile.displayName || profile.email}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.userIdLabel}: {profile.id}
                  </p>
                </div>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">
                {t.displayNameLabel}
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                placeholder={t.displayNamePlaceholder}
              />
            </label>

            {onLocaleChange ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  {dictionary.chat.profileModal.languageLabel}
                </span>
                <select
                  value={locale}
                  onChange={(event) => onLocaleChange(event.target.value as Locale)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="en">{dictionary.chat.profileModal.languageEnglish}</option>
                  <option value="vi">{dictionary.chat.profileModal.languageVietnamese}</option>
                </select>
              </label>
            ) : null}

            <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <Avatar
                className="h-16 w-16 ring-1 ring-cyan-400/30"
                src={avatarPreviewUrl || profile.avatarUrl}
                alt={profile.displayName || profile.email}
              />
              <span className="min-w-0 text-sm text-slate-300">
                <span className="block font-medium text-white">{t.avatarLabel}</span>
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

            {error ? (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? dictionary.common.saving : t.saveButton}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
