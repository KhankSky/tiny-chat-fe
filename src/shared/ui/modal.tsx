import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Modal({
  ariaLabel,
  children,
  className,
  onClose,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex h-full items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn(
            "w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0b111c] shadow-2xl shadow-black/40",
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
