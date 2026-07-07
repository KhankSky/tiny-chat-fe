"use client";

import { useEffect, useState } from "react";
import { getGroupDetail, updateGroupDetail, uploadGroupAvatar } from "@/features/groups/api/groups-api";
import type { GroupDetailResponse, GroupMemberResponse } from "@/features/groups/types";
import type { Dictionary } from "@/i18n/types";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Input } from "@/shared/ui/input";

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
  collapsed = false,
  onToggle,
}: {
  dictionary: Dictionary;
  groupId: number;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const t = dictionary.chat.groupSidebar;
  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatarUrl, setGroupAvatarUrl] = useState("");
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
          setGroupAvatarUrl(data.groupAvatarUrl ?? "");
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
    setGroupAvatarUrl(group?.groupAvatarUrl ?? "");
    handleGroupAvatarChange(null);
  }

  async function saveGroupDetail() {
    setIsSaving(true);
    setSaveError(null);

    try {
      let updated = group;
      if (groupAvatarFile) {
        const formData = new FormData();
        formData.append("file", groupAvatarFile);
        updated = await uploadGroupAvatar(groupId, formData);
      } else {
        updated = await updateGroupDetail(groupId, {
          groupAvatarUrl: groupAvatarUrl.trim() || null,
        });
      }

      const nextGroup = await updateGroupDetail(groupId, {
        groupName: groupName.trim() || null,
        groupDescription: groupDescription.trim() || null,
        groupAvatarUrl: updated?.groupAvatarUrl ?? (groupAvatarUrl.trim() || null),
      });
      setGroup(nextGroup);
      setGroupName(nextGroup.groupName ?? "");
      setGroupDescription(nextGroup.groupDescription ?? "");
      setGroupAvatarUrl(nextGroup.groupAvatarUrl ?? "");
      handleGroupAvatarChange(null);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t.saveGroupError);
    } finally {
      setIsSaving(false);
    }
  }

  if (collapsed) {
    return (
      <aside className="flex h-full min-h-0 w-[72px] flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
        <div className="flex items-center justify-center border-b border-white/10 px-2 py-3">
          <Button
            type="button"
            onClick={onToggle}
            aria-label={t.openRightSidebar}
            variant="icon"
          >
            &lt;
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-4 px-2 py-4">
          <Avatar className="h-12 w-12 ring-1 ring-cyan-400/30" src={group?.groupAvatarUrl} alt={group?.groupName || t.loadingGroup} />
          <div
            className="text-[10px] uppercase tracking-[0.45em] text-slate-500"
            style={{ writingMode: "vertical-rl" }}
          >
            {t.collapsedLabel}
          </div>
          <Button
            type="button"
            onClick={onToggle}
            aria-label={t.openRightSidebar}
            className="mt-auto"
            variant="icon"
          >
            &gt;
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <Avatar
              className="h-13 w-13 shrink-0 ring-1 ring-cyan-400/30"
              src={group?.groupAvatarUrl}
              alt={group?.groupName || t.loadingGroup}
            />
            <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              {t.membersEyebrow}
            </p>
            <h2 className="mt-2 truncate text-xl font-semibold text-white">
              {group?.groupName || t.loadingGroup}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {t.groupIdLabel}: {groupId}
            </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            aria-label={t.editGroup}
            className="shrink-0"
            variant="secondary"
          >
            {t.editGroup}
          </Button>
          <Button
            type="button"
            onClick={onToggle}
            aria-label={t.collapseRightSidebar}
            className="shrink-0"
            variant="icon"
          >
            &gt;
          </Button>
        </div>
        {isEditing ? (
          <div className="mt-4 space-y-3 rounded border border-white/10 bg-white/[0.03] p-3">
            <label className="flex cursor-pointer items-center gap-3">
              <Avatar className="h-14 w-14 shrink-0 ring-1 ring-cyan-400/30" src={groupAvatarPreviewUrl || group?.groupAvatarUrl} alt={group?.groupName || t.loadingGroup} />
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
            <Input
              value={groupAvatarUrl}
              onChange={(event) => setGroupAvatarUrl(event.target.value)}
              placeholder={t.groupAvatarUrlPlaceholder}
              disabled={Boolean(groupAvatarFile)}
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
        ) : null}
      </div>

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
