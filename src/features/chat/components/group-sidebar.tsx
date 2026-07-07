"use client";

import { useEffect, useState } from "react";
import { getGroupDetail } from "@/features/groups/api/groups-api";
import type { GroupDetailResponse, GroupMemberResponse } from "@/features/groups/types";
import { apiAssetUrl } from "@/shared/api/client";
import type { Dictionary } from "@/i18n/types";

function avatarFallback(name: string | null | undefined) {
  return (name?.trim()?.charAt(0) || "G").toUpperCase();
}

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
        <div className="h-11 w-11 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
          {member.avatarUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={apiAssetUrl(member.avatarUrl)}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-100">
              {avatarFallback(displayName)}
            </div>
          )}
        </div>
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

  useEffect(() => {
    let active = true;

    async function loadGroup() {
      try {
        const data = await getGroupDetail(groupId);
        if (active) setGroup(data);
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

  const members = group?.members ?? [];
  const onlineCount = members.length <= 2 ? members.length : Math.ceil(members.length * 0.65);
  const onlineMembers = members.slice(0, onlineCount);
  const offlineMembers = members.slice(onlineCount);

  if (collapsed) {
    return (
      <aside className="flex h-full min-h-0 w-[72px] flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
        <div className="flex items-center justify-center border-b border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={t.openRightSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            &lt;
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-4 px-2 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-lg font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-400/30">
            {avatarFallback(group?.groupName)}
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.45em] text-slate-500"
            style={{ writingMode: "vertical-rl" }}
          >
            {t.collapsedLabel}
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label={t.openRightSidebar}
            className="mt-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            &gt;
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
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
          <button
            type="button"
            onClick={onToggle}
            aria-label={t.collapseRightSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {error ? (
          <p className="mx-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
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
