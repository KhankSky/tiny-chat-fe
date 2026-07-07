import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-white/10 bg-white/5 text-slate-300",
  info: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  danger: "border-red-400/30 bg-red-400/10 text-red-200",
};

export function StatusBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: StatusTone;
}) {
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
