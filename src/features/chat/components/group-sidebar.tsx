"use client";

import { useEffect, useState } from "react";
import { getGroupDetail, updateGroupDetail, uploadGroupAvatar } from "@/features/groups/api/groups-api";
import type { GroupDetailResponse, GroupMemberResponse } from "@/features/groups/types";
import type { Dictionary } from "@/i18n/types";
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

function MemberRow({
  member,
  index,
  offline = false,
}: {
  member: GroupMemberResponse;
  index: number;
  offline?: boolean;
}) {
  const displayName = member.displayName || `User ${member.userId}`;
  const active = !offline && index === 1;

  return (
    <div
      className={`flex h-13 items-center gap-3 px-5 transition ${
        active ? "bg-[#111a35]" : "hover:bg-white/[0.04]"
      } ${offline ? "opacity-45" : ""}`}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-visible">
        <Avatar className="h-11 w-11 ring-1 ring-white/10" src={member.avatarUrl} alt={displayName} />
        <span
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b111c] ${
            offline ? "bg-slate-600" : index % 3 === 1 ? "bg-amber-400" : "bg-emerald-400"
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
          {index % 4 === 2 ? (
            <span className="shrink-0 rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              APP
            </span>
          ) : null}
        </div>
        {active ? (
          <p className="mt-0.5 truncate text-xs italic text-slate-300">hello world~</p>
        ) : null}
      </div>
    </div>
  );
}

export function GroupSidebar({
  dictionary,
  groupId,
}: {
  dictionary: Dictionary;
  groupId: number;
}) {
  const t = dictionary.chat.groupSidebar;
  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreviewUrl, setGroupAvatarPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGroup() {
      try {
        const data = await getGroupDetail(groupId);
        if (active) {
          setGroup(data);
          setGroupName(data.groupName ?? "");
          setGroupDescription(data.groupDescription ?? "");
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
    return () => {
      if (groupAvatarPreviewUrl) URL.revokeObjectURL(groupAvatarPreviewUrl);
    };
  }, [groupAvatarPreviewUrl]);

  const members = group?.members ?? [];
  const onlineCount = members.length <= 2 ? members.length : Math.ceil(members.length * 0.65);
  const onlineMembers = members.slice(0, onlineCount);
  const offlineMembers = members.slice(onlineCount);

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
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group/avatar relative h-13 w-13 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b111c]"
              aria-label={t.editGroup}
            >
              <Avatar
                className="h-13 w-13 shrink-0 ring-1 ring-cyan-400/30 transition-all duration-200 group-hover/avatar:opacity-60"
                src={group?.groupAvatarUrl}
                alt={group?.groupName || t.loadingGroup}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316A2.192 2.192 0 0 0 14.502 4h-5.004c-.53 0-1.027.27-1.316.732l-.822 1.317a2.3 2.3 0 0 1-1.64 1.055L6.827 6.175ZM12 9.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z"
                  />
                </svg>
              </div>
            </button>
            <div className="min-w-0">
            {/*<p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">*/}
            {/*  {t.membersEyebrow}*/}
            {/*</p>*/}
            <h2 className="mt-2 truncate text-xl font-semibold text-white">
              {group?.groupName || t.loadingGroup}
            </h2>
            {/*<p className="mt-1 text-sm text-slate-400">*/}
            {/*  {t.groupIdLabel}: {groupId}*/}
            {/*</p>*/}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={t.editGroup}
            className="shrink-0"
            variant="icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-slate-200"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </Button>
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

        <div className="mb-3 px-5 text-sm font-medium tracking-wide text-slate-400">
          {t.online} - {onlineMembers.length}
        </div>
        <div>
          {onlineMembers.map((member, index) => (
            <MemberRow key={member.userId} member={member} index={index} />
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
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
