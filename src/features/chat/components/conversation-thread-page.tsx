"use client";

import { useEffect, useState } from "react";
import { getConversations } from "@/features/chat/api/chat-api";
import type { ConversationResponse } from "@/features/chat/types";
import type { AuthUserResponse } from "@/features/auth/types";
import {
  getMeProfile,
  updateMeProfile,
  uploadMeAvatar,
} from "@/features/profile/api/profile-api";
import type { MeProfileResponse, UpdateMeProfileRequest } from "@/features/profile/types";
import { apiAssetUrl } from "@/shared/api/client";
import type { Locale } from "@/i18n/types";
import { getStoredAuthUser, updateStoredAuthUser } from "@/shared/auth/session";
import { ChatRoom } from "./chat-room";
import { ConversationSidebar, type ConversationItem } from "./conversation-sidebar";
import { GroupSidebar } from "./group-sidebar";

function toConversationItem(conversation: ConversationResponse): ConversationItem {
  return {
    conversationId: conversation.conversationId,
    groupId: conversation.groupId,
    title: conversation.title,
    preview: conversation.lastMessage || conversation.description || "No messages yet.",
    updatedAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt).toLocaleString()
      : "",
  };
}

function readStoredUser() {
  return (getStoredAuthUser() as AuthUserResponse | null) ?? null;
}

export function ConversationThreadPage({
  locale,
  conversationId,
}: {
  locale: Locale;
  conversationId: number;
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUserResponse | null>(() => readStoredUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState({ displayName: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<MeProfileResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      try {
        const data = await getConversations();
        if (active) {
          setConversations(data.map(toConversationItem));
        }
      } catch {
        if (active) {
          setConversations([]);
        }
      }
    }

    void loadConversations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    let active = true;

    async function loadProfile() {
      try {
        const data = await getMeProfile();
        if (!active) return;
        setLoadedProfile(data);
        setProfileDraft({ displayName: data.displayName ?? "" });
      } catch (err) {
        if (active) {
          setProfileError(err instanceof Error ? err.message : "Could not load profile");
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [profileOpen]);

  function syncCurrentUser(updated: MeProfileResponse) {
    setCurrentUser(
      updateStoredAuthUser((stored) => {
        if (!stored) return stored;
        return {
          ...stored,
          displayName: updated.displayName,
          avatarUrl: updated.avatarUrl,
        };
      }),
    );
  }

  async function handleSaveProfile() {
    if (!loadedProfile) return;

    setProfileSaving(true);
    setProfileError(null);

    try {
      let avatarUrl = loadedProfile.avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploaded = await uploadMeAvatar(formData);
        avatarUrl = uploaded.avatarUrl;
      }

      const payload: UpdateMeProfileRequest = {
        displayName: profileDraft.displayName.trim(),
        avatarUrl,
      };
      const updated = await updateMeProfile(payload);

      setLoadedProfile(updated);
      syncCurrentUser(updated);
      closeProfileEditor();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  function openProfileEditor() {
    setProfileLoading(true);
    setProfileError(null);
    setAvatarFile(null);
    setAvatarPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setProfileOpen(true);
  }

  function closeProfileEditor() {
    setProfileOpen(false);
    setAvatarFile(null);
    setAvatarPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  }

  function handleAvatarFileChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  }

  const profileAvatarSrc = avatarPreviewUrl || apiAssetUrl(loadedProfile?.avatarUrl || currentUser?.avatarUrl);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#070d18] text-white">
      <div
        className={`grid h-full min-h-0 w-full ${
          detailsOpen
            ? "lg:grid-cols-[340px_minmax(0,1fr)_360px]"
            : "lg:grid-cols-[340px_minmax(0,1fr)_72px]"
        }`}
      >
        <ConversationSidebar
          locale={locale}
          appName="Tiny Chat"
          conversations={conversations}
          activeGroupId={conversationId}
          currentUser={currentUser}
          onEditProfile={openProfileEditor}
        />
        <ChatRoom
          locale={locale}
          groupId={conversationId}
          currentUser={currentUser}
          sidebarOpen={detailsOpen}
          onToggleSidebar={() => setDetailsOpen((value) => !value)}
        />
        <GroupSidebar
          locale={locale}
          groupId={conversationId}
          collapsed={!detailsOpen}
          onToggle={() => setDetailsOpen((value) => !value)}
        />
      </div>

      {profileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm"
          onClick={closeProfileEditor}
        >
          <div className="flex h-full items-center justify-center p-4 sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={locale === "vi" ? "Chỉnh sửa thông tin cá nhân" : "Edit profile"}
              className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0b111c] shadow-2xl shadow-black/40"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
                    Tiny Chat
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    {locale === "vi" ? "Sửa thông tin cá nhân" : "Edit profile"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeProfileEditor}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  aria-label={locale === "vi" ? "Đóng" : "Close"}
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 px-6 py-6">
                {profileLoading ? (
                  <p className="text-sm text-slate-400">
                    {locale === "vi" ? "Đang tải..." : "Loading..."}
                  </p>
                ) : null}

                <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileAvatarSrc}
                      alt={locale === "vi" ? "Avatar cá nhân" : "Profile avatar"}
                      className="h-full w-full object-cover"
                    />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) => handleAvatarFileChange(event.target.files?.[0])}
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {profileDraft.displayName || currentUser?.displayName || currentUser?.email || "User"}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-400">
                      {currentUser?.email || ""}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {avatarFile
                        ? avatarFile.name
                        : locale === "vi"
                          ? "Bấm avatar để tải ảnh lên"
                          : "Click avatar to upload"}
                    </p>
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    {locale === "vi" ? "Tên hiển thị" : "Display name"}
                  </span>
                  <input
                    value={profileDraft.displayName}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, displayName: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50"
                    placeholder={locale === "vi" ? "Ví dụ: Sky" : "Example: Sky"}
                  />
                </label>

                {profileError ? (
                  <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {profileError}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-5">
                <button
                  type="button"
                  onClick={closeProfileEditor}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  {locale === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveProfile()}
                  disabled={profileSaving || profileLoading}
                  className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {profileSaving
                    ? locale === "vi"
                      ? "Đang lưu..."
                      : "Saving..."
                    : locale === "vi"
                      ? "Lưu thay đổi"
                      : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
