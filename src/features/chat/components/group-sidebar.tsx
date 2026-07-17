"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { AuthUserResponse } from "@/features/auth/types";
import { getGroupStreakCached } from "@/features/chat/api/chat-api";
import { GROUP_STREAK_CHANGED_EVENT } from "@/features/chat/hooks/use-chat-room";
import type { PresenceEvent } from "@/features/chat/types";
import type { GroupStreakResponse } from "@/features/chat/types";
import { MemberProfileModal } from "@/features/friends/components/member-profile-modal";
import { getGroupDetail, leaveGroup, updateGroupDetail, uploadGroupAvatar } from "@/features/groups/api/groups-api";
import type { GroupDetailResponse, GroupMemberResponse } from "@/features/groups/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { getAccessToken } from "@/shared/auth/session";
import { StompClient } from "@/shared/realtime/stomp";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

function nameColor(index: number, offline: boolean) {
  const colors = [
    offline ? "text-slate-500" : "text-sky-400",
    offline ? "text-emerald-800" : "text-emerald-400",
    offline ? "text-cyan-800" : "text-cyan-400",
    offline ? "text-violet-800" : "text-violet-400",
    offline ? "text-amber-800" : "text-amber-300",
  ];
  return colors[index % colors.length];
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" style={{ display: "block", height: 20, width: 20 }} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8.75 4.5a1 1 0 0 0-.8.4L6.38 7H4.5A2.5 2.5 0 0 0 2 9.5v7A2.5 2.5 0 0 0 4.5 19h15a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 19.5 7h-1.88l-1.57-2.1a1 1 0 0 0-.8-.4h-6.5ZM12 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" style={{ display: "block", height: 20, width: 20 }} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.86 3.64a2.2 2.2 0 0 1 3.11 3.11L8.87 17.85a1 1 0 0 1-.46.26l-4.13 1.1a1 1 0 0 1-1.22-1.22l1.1-4.13a1 1 0 0 1 .26-.46L16.86 3.64Zm1.7 1.41a.2.2 0 0 0-.29 0L6.03 17.29l-.36 1.34 1.34-.36L19.25 6.03a.2.2 0 0 0 0-.29l-.69-.69ZM12 20a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2h-7a1 1 0 0 1-1-1Z"
      />
    </svg>
  );
}

function MemberRow({
  member,
  index,
  offline = false,
  onOpenProfile,
}: {
  member: GroupMemberResponse;
  index: number;
  offline?: boolean;
  onOpenProfile: (memberUserId: number) => void;
}) {
  const displayName = member.displayName || `User ${member.userId}`;
  const active = !offline && index === 1;

  return (
    <button
      type="button"
      onClick={() => onOpenProfile(member.userId)}
      className={`flex h-13 w-full items-center gap-3 px-5 text-left transition ${active ? "bg-[#111a35]" : "hover:bg-white/[0.04]"
        } ${offline ? "opacity-45" : ""}`}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-visible">
        <Avatar className="h-11 w-11 ring-1 ring-white/10" src={member.avatarUrl} alt={displayName} />
        <span
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b111c] ${offline ? "bg-slate-600" : index % 3 === 1 ? "bg-amber-400" : "bg-emerald-400"
            }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className={`truncate text-[15px] font-semibold leading-5 ${nameColor(index, offline)}`}>
            {displayName}
          </p>
          {member.role === "OWNER" ? (
            <span className="shrink-0 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              OWNER
            </span>
          ) : null}
        </div>
        {active ? (
          <p className="mt-0.5 truncate text-xs italic text-slate-300">hello world~</p>
        ) : null}
      </div>
    </button>
  );
}

function GroupStreakCard({
  streak,
  streakError,
  t,
}: {
  streak: GroupStreakResponse | null;
  streakError: string | null;
  t: Dictionary["chat"]["groupSidebar"];
}) {
  const currentStreak = streak?.currentStreak ?? 0;
  const activeMemberCount = streak?.todayActiveMemberCount ?? 0;
  const activeProgress = Math.min(activeMemberCount / 2, 1) * 100;
  const countedToday = Boolean(streak?.todayStreakCounted);

  return (
    <div className="tc-streak-card mx-5 mb-5 overflow-hidden rounded-2xl border border-amber-300/20 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(145deg,rgba(34,211,238,0.12),rgba(15,23,42,0.95))] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10">
          <span className="absolute inset-1 animate-streak-glow rounded-2xl bg-amber-300/20 blur-md" />
          <span className="streak-flame relative" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
            {t.groupStreakTitle}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-3xl font-bold leading-none text-white">{currentStreak}</p>
            <p className="pb-1 text-xs font-medium text-slate-300">{t.currentStreak}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span>{t.activeToday}</span>
          <span className={countedToday ? "text-amber-200" : "text-slate-400"}>
            {activeMemberCount}/2
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-cyan-300 transition-[width] duration-500"
            style={{ width: `${activeProgress}%` }}
          />
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-slate-300">
        {countedToday ? t.groupStreakCounted : t.groupStreakNeedsMembers}
      </p>
      {streakError ? (
        <p className="mt-2 text-xs text-amber-200">{t.streakUnavailable}</p>
      ) : null}
    </div>
  );
}

export function GroupSidebar({
  dictionary,
  groupId,
  locale,
  currentUser,
  onClose,
}: {
  dictionary: Dictionary;
  groupId: number;
  locale: Locale;
  currentUser?: AuthUserResponse | null;
  onClose?: () => void;
}) {
  const router = useRouter();
  const t = dictionary.chat.groupSidebar;
  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [groupStreak, setGroupStreak] = useState<GroupStreakResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streakError, setStreakError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreviewUrl, setGroupAvatarPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<number | null>(null);
  const [presenceByUser, setPresenceByUser] = useState<Record<number, boolean>>(() =>
    currentUser?.userId ? { [currentUser.userId]: true } : {},
  );

  useEffect(() => {
    let active = true;

    async function loadGroup() {
      try {
        const data = await getGroupDetail(groupId);
        if (active) {
          setGroup(data);
          setGroupName(data.groupName ?? "");
          setGroupDescription(data.groupDescription ?? "");
          setPresenceByUser(
            Object.fromEntries(data.members.map((member) => [member.userId, member.online])),
          );
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t.loadGroupError);
        }
      }
    }

    void loadGroup();
    return () => {
      active = false;
    };
  }, [groupId, t.loadGroupError]);

  useEffect(() => {
    let active = true;

    async function loadGroupStreak({ force = false }: { force?: boolean } = {}) {
      try {
        const data = await getGroupStreakCached(groupId, { force });
        if (active) {
          setGroupStreak(data);
          setStreakError(null);
        }
      } catch (err) {
        if (active) {
          setStreakError(err instanceof Error ? err.message : t.loadStreakError);
        }
      }
    }

    function handleGroupStreakChanged(event: Event) {
      const detail = (event as CustomEvent<{ groupId?: number }>).detail;
      if (detail?.groupId === groupId) {
        void loadGroupStreak({ force: true });
      }
    }

    void loadGroupStreak();
    window.addEventListener(GROUP_STREAK_CHANGED_EVENT, handleGroupStreakChanged);

    return () => {
      active = false;
      window.removeEventListener(GROUP_STREAK_CHANGED_EVENT, handleGroupStreakChanged);
    };
  }, [groupId, t.loadStreakError]);

  useEffect(() => {
    return () => {
      if (groupAvatarPreviewUrl) URL.revokeObjectURL(groupAvatarPreviewUrl);
    };
  }, [groupAvatarPreviewUrl]);

  useEffect(() => {
    let active = true;
    const accessToken = getAccessToken();
    const client = accessToken ? new StompClient(accessToken) : null;
    let unsubscribe: (() => void) | null = null;

    async function connectPresence() {
      if (!client) return;

      try {
        await client.connect();
        if (!active) return;
        unsubscribe = client.subscribe(`/topic/groups/${groupId}/presence`, (body) => {
          const payload = JSON.parse(body) as PresenceEvent;
          setPresenceByUser((previous) => ({
            ...previous,
            [payload.userId]: payload.online,
          }));
        });
      } catch {
        // Presence is decorative metadata; sidebar can still render without it.
      }
    }

    void connectPresence();

    return () => {
      active = false;
      unsubscribe?.();
      client?.disconnect();
    };
  }, [groupId]);

  const members = group?.members ?? [];
  const effectivePresenceByUser = currentUser?.userId
    ? {
        ...presenceByUser,
        [currentUser.userId]: true,
      }
    : presenceByUser;
  const onlineMembers = members.filter((member) => effectivePresenceByUser[member.userId]);
  const offlineMembers = members.filter((member) => !effectivePresenceByUser[member.userId]);

  function handleGroupAvatarChange(file: File | null) {
    if (groupAvatarPreviewUrl) URL.revokeObjectURL(groupAvatarPreviewUrl);
    setGroupAvatarFile(file);
    setGroupAvatarPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSaveError(null);
    setGroupName(group?.groupName ?? "");
    setGroupDescription(group?.groupDescription ?? "");
    handleGroupAvatarChange(null);
  }

  async function handleLeaveGroup() {
    setIsLeaving(true);
    setLeaveError(null);
    try {
      await leaveGroup(groupId);
      setLeaveConfirmOpen(false);
      router.push(`/${locale}/conversations`);
      router.refresh();
    } catch (err) {
      setLeaveError(err instanceof Error ? err.message : t.leaveError);
    } finally {
      setIsLeaving(false);
    }
  }

  async function saveGroupDetail() {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (groupAvatarFile) {
        const formData = new FormData();
        formData.append("file", groupAvatarFile);
        await uploadGroupAvatar(groupId, formData);
      }

      const nextGroup = await updateGroupDetail(groupId, {
        groupName: groupName.trim() || null,
        groupDescription: groupDescription.trim() || null,
      });
      setGroup(nextGroup);
      setGroupName(nextGroup.groupName ?? "");
      setGroupDescription(nextGroup.groupDescription ?? "");
      handleGroupAvatarChange(null);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t.saveGroupError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <aside className="tc-sidebar flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-4 lg:px-5">
        <div className="flex w-full items-center gap-3">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={dictionary.common.close}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              ‹
            </button>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group/avatar relative h-12 w-12 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b111c]"
              aria-label={t.editGroup}
            >
              <Avatar
                className="h-12 w-12 shrink-0 ring-1 ring-cyan-400/30 transition-opacity group-hover/avatar:opacity-75"
                src={group?.groupAvatarUrl}
                alt={group?.groupName || t.loadingGroup}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/55 text-cyan-100 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100">
                <CameraIcon />
              </div>
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white lg:text-xl">
                {group?.groupName || t.loadingGroup}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={t.editGroup}
              className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#0b111c]"
          >
            <PencilIcon />
          </button>
        </div>
      </div>

      {isEditing ? (
        <Modal ariaLabel={t.editGroup} onClose={cancelEdit} className="max-w-md rounded-3xl p-5">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                {t.membersEyebrow}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{t.editGroup}</h3>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Avatar className="h-16 w-16 shrink-0 ring-1 ring-cyan-400/30" src={groupAvatarPreviewUrl || group?.groupAvatarUrl} alt={group?.groupName || t.loadingGroup} />
              <span className="min-w-0 text-sm text-slate-300">
                <span className="block font-medium text-white">{t.groupAvatarLabel}</span>
                <span className="block truncate text-xs text-slate-400">
                  {groupAvatarFile ? groupAvatarFile.name : t.groupAvatarUploadHint}
                </span>
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => handleGroupAvatarChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <Input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder={t.groupNamePlaceholder}
            />
            <Input
              value={groupDescription}
              onChange={(event) => setGroupDescription(event.target.value)}
              placeholder={t.groupDescriptionPlaceholder}
            />
            {saveError ? <ErrorMessage>{saveError}</ErrorMessage> : null}
            <div className="flex gap-2">
              <Button type="button" onClick={saveGroupDetail} disabled={isSaving}>
                {isSaving ? dictionary.common.saving : dictionary.common.saveChanges}
              </Button>
              <Button type="button" onClick={cancelEdit} disabled={isSaving} variant="secondary">
                {dictionary.common.cancel}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {error ? (
          <ErrorMessage className="mx-5">{error}</ErrorMessage>
        ) : null}

        {group && !group.directChat ? (
          <GroupStreakCard streak={groupStreak} streakError={streakError} t={t} />
        ) : null}

        <div className="mb-3 px-5 text-sm font-medium tracking-wide text-slate-400">
          {t.online} - {onlineMembers.length}
        </div>
        <div>
          {onlineMembers.map((member, index) => (
            <MemberRow
              key={member.userId}
              member={member}
              index={index}
              onOpenProfile={setSelectedProfileUserId}
            />
          ))}
        </div>

        {offlineMembers.length > 0 ? (
          <>
            <div className="mb-3 mt-7 px-5 text-sm font-medium tracking-wide text-slate-400">
              {t.offline} - {offlineMembers.length}
            </div>
            <div>
              {offlineMembers.map((member, index) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  index={index + onlineMembers.length}
                  offline
                  onOpenProfile={setSelectedProfileUserId}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex h-16 shrink-0 items-center border-t border-white/10 p-3 lg:h-20 lg:p-4">
        {leaveError ? <ErrorMessage className="mb-3">{leaveError}</ErrorMessage> : null}
        <button type="button" onClick={() => setLeaveConfirmOpen(true)} disabled={isLeaving} className="mx-auto flex h-12 items-center gap-2 rounded-full px-3 text-xs font-medium text-slate-500 transition hover:bg-red-400/10 hover:text-red-200 disabled:opacity-60">
          <LogOut aria-hidden="true" size={15} />
          {t.leaveGroup}
        </button>
      </div>

      {leaveConfirmOpen ? (
        <Modal ariaLabel={t.leaveConfirmTitle} onClose={() => { if (!isLeaving) setLeaveConfirmOpen(false); }} className="max-w-md rounded-[1.75rem] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-200">
            <LogOut aria-hidden="true" size={23} />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-white">{t.leaveConfirmTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t.leaveConfirm}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setLeaveConfirmOpen(false)} disabled={isLeaving}>{dictionary.common.cancel}</Button>
            <Button type="button" onClick={() => void handleLeaveGroup()} disabled={isLeaving} className="bg-red-400 text-slate-950 hover:bg-red-300">
              <LogOut aria-hidden="true" size={16} className="mr-2" />
              {isLeaving ? dictionary.common.loading : t.leaveGroup}
            </Button>
          </div>
        </Modal>
      ) : null}

      {selectedProfileUserId ? (
        <MemberProfileModal
          dictionary={dictionary}
          groupId={groupId}
          locale={locale}
          memberUserId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
        />
      ) : null}
    </aside>
  );
}
