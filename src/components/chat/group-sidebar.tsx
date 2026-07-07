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
  collapsed = false,
  onToggle,
}: {
  locale: Locale;
  groupId: number;
  collapsed?: boolean;
  onToggle?: () => void;
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

  if (collapsed) {
    return (
      <aside className="flex h-full min-h-0 w-[72px] flex-col overflow-hidden border-l border-white/10 bg-[#0b111c]">
        <div className="flex items-center justify-center border-b border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={locale === "vi" ? "Mở sidebar phải" : "Open right sidebar"}
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
            {locale === "vi" ? "Thông tin" : "Info"}
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label={locale === "vi" ? "Mở sidebar phải" : "Open right sidebar"}
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
              {locale === "vi" ? "Thông tin nhóm" : "Group info"}
            </p>
            <h2 className="mt-2 truncate text-2xl font-semibold text-white">
              {group?.groupName || (locale === "vi" ? "Đang tải nhóm" : "Loading group")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {locale === "vi" ? "Group ID" : "Group ID"}: {groupId}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label={locale === "vi" ? "Thu gọn sidebar phải" : "Collapse right sidebar"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            &gt;
          </button>
        </div>
        {group?.groupDescription ? (
          <p className="mt-4 text-sm leading-7 text-slate-400">{group.groupDescription}</p>
        ) : null}
      </div>

      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {locale === "vi" ? "Số thành viên" : "Members"}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">{group?.memberCount ?? 0}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
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
