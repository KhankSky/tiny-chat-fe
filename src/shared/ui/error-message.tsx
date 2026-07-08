import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function ErrorMessage({
  children,
  className,
  tone = "danger",
}: {
  children: ReactNode;
  className?: string;
  tone?: "danger" | "warning";
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "warning"
          ? "tc-alert-warning border-amber-500/30 bg-amber-500/10 text-amber-100"
          : "tc-alert-danger border-red-500/30 bg-red-500/10 text-red-200",
        className,
      )}
    >
      {children}
    </p>
  );
}
