"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { GroupDetailResponse } from "@/lib/api/types";
import type { Locale } from "@/i18n/types";

function avatarFallback(name: string | null | undefined) {
  return (name?.trim()?.charAt(0) || "G").toUpperCase();
}

export function GroupSidebar({
  locale,
  groupId,
}: {
  locale: Locale;
  groupId: number;
}) {
  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadGroup() {
      try {
        const data = await apiGet<GroupDetailResponse>(`/api/groups/${groupId}/detail`);
        if (active) setGroup(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load group");
        }
      }
    }

    void loadGroup();
    return () => {
      active = false;
    };
  }, [groupId]);

  return (
    <aside className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/85">
      <div className="border-b border-white/10 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          {locale === "vi" ? "Thông tin nhóm" : "Group info"}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-lg font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-400/30">
            {avatarFallback(group?.groupName)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-white">
              {group?.groupName || (locale === "vi" ? "Đang tải nhóm" : "Loading group")}
            </h2>
            <p className="text-sm text-slate-400">
              {locale === "vi" ? "Group ID" : "Group ID"}: {groupId}
            </p>
          </div>
        </div>
        {group?.groupDescription ? (
          <p className="mt-4 text-sm leading-7 text-slate-400">{group.groupDescription}</p>
        ) : null}
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {locale === "vi" ? "Số thành viên" : "Members"}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {group?.memberCount ?? 0}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {error ? (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          {group?.members?.map((member) => (
            <div
              key={member.userId}
              className="rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                  {avatarFallback(member.displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {member.displayName || member.userId}
                    </p>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                      {member.role}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">ID: {member.userId}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {member.avatarUrl || (locale === "vi" ? "Chưa có avatar" : "No avatar")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
