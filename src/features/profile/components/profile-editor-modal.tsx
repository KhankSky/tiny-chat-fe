"use client";

import { useState } from "react";
import { FeedbackModal } from "@/features/feedback/components/feedback-modal";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/types";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Input } from "@/shared/ui/input";
import { LoadingState } from "@/shared/ui/loading-state";
import { Modal } from "@/shared/ui/modal";
import type { ProfileEditorState } from "@/features/profile/hooks/use-profile-editor";
import type { ThemeMode } from "@/theme/use-theme-preference";

export function ProfileEditorModal({
  dictionary,
  editor,
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  dictionary: Dictionary;
  editor: ProfileEditorState;
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}) {
  const profileCopy = dictionary.chat.profileModal;
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (!editor.profileOpen) return null;

  return (
    <>
    <Modal ariaLabel={profileCopy.ariaLabel} onClose={editor.closeProfileEditor}>
      <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
            {dictionary.appName}
          </p>
          <h3 className="mt-2 text-2xl font-semibold">{profileCopy.title}</h3>
        </div>
        <Button
          type="button"
          onClick={editor.closeProfileEditor}
          variant="icon"
          aria-label={dictionary.common.close}
        >
          x
        </Button>
      </div>

      <div className="space-y-5 px-6 py-6">
        {editor.profileLoading ? (
          <LoadingState label={dictionary.common.loading} />
        ) : null}

        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={editor.profileAvatarSrc}
              alt={profileCopy.avatarAlt}
              className="h-full w-full object-cover"
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => editor.handleAvatarFileChange(event.target.files?.[0])}
            />
          </label>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {editor.profileDraft.displayName ||
                editor.currentUser?.displayName ||
                editor.currentUser?.email ||
                dictionary.common.userFallback}
            </p>
            <p className="mt-1 truncate text-sm text-slate-400">
              {editor.currentUser?.email || ""}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {editor.avatarFile ? editor.avatarFile.name : profileCopy.avatarUploadHint}
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">
            {profileCopy.displayNameLabel}
          </span>
          <Input
            value={editor.profileDraft.displayName}
            onChange={(event) =>
              editor.setProfileDraft((prev) => ({ ...prev, displayName: event.target.value }))
            }
            placeholder={profileCopy.displayNamePlaceholder}
          />
        </label>

        {locale && onLocaleChange ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">
              {profileCopy.languageLabel}
            </span>
            <select
              value={locale}
              onChange={(event) => onLocaleChange(event.target.value as Locale)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="en">{profileCopy.languageEnglish}</option>
              <option value="vi">{profileCopy.languageVietnamese}</option>
            </select>
          </label>
        ) : null}

        {theme && onThemeChange ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">
              {profileCopy.themeLabel}
            </span>
            <select
              value={theme}
              onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="dark">{profileCopy.themeDark}</option>
              <option value="light">{profileCopy.themeLight}</option>
            </select>
          </label>
        ) : null}

        {editor.profileError ? <ErrorMessage>{editor.profileError}</ErrorMessage> : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" onClick={() => setFeedbackOpen(true)} variant="ghost">
          {dictionary.feedback.entryLabel}
        </Button>
        <div className="flex items-center justify-end gap-3">
        <Button type="button" onClick={editor.closeProfileEditor} variant="ghost">
          {dictionary.common.cancel}
        </Button>
        <Button
          type="button"
          onClick={() => void editor.saveProfile()}
          disabled={editor.profileSaving || editor.profileLoading}
        >
          {editor.profileSaving ? dictionary.common.saving : dictionary.common.saveChanges}
        </Button>
        </div>
      </div>
    </Modal>
    <FeedbackModal
      dictionary={dictionary}
      locale={locale}
      onClose={() => setFeedbackOpen(false)}
      open={feedbackOpen}
      theme={theme}
    />
    </>
  );
}
