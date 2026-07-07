"use client";

import { useEffect, useState } from "react";
import type { AuthUserResponse } from "@/features/auth/types";
import {
  getMeProfile,
  updateMeProfile,
  uploadMeAvatar,
} from "@/features/profile/api/profile-api";
import type { MeProfileResponse, UpdateMeProfileRequest } from "@/features/profile/types";
import type { Dictionary } from "@/i18n/types";
import { apiAssetUrl } from "@/shared/api/client";
import { getStoredAuthUser, updateStoredAuthUser } from "@/shared/auth/session";

function readStoredUser() {
  return (getStoredAuthUser() as AuthUserResponse | null) ?? null;
}

export function useProfileEditor(dictionary: Dictionary) {
  const profileCopy = dictionary.chat.profileModal;
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
          setProfileError(err instanceof Error ? err.message : profileCopy.loadError);
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
  }, [profileCopy.loadError, profileOpen]);

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

  async function saveProfile() {
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
      setProfileError(err instanceof Error ? err.message : profileCopy.saveError);
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

  return {
    avatarFile,
    closeProfileEditor,
    currentUser,
    handleAvatarFileChange,
    openProfileEditor,
    profileAvatarSrc: avatarPreviewUrl || apiAssetUrl(loadedProfile?.avatarUrl || currentUser?.avatarUrl),
    profileDraft,
    profileError,
    profileLoading,
    profileOpen,
    profileSaving,
    saveProfile,
    setProfileDraft,
  };
}

export type ProfileEditorState = ReturnType<typeof useProfileEditor>;
