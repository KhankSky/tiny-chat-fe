import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70",
  secondary:
    "border border-white/15 text-white hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70",
  ghost:
    "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70",
  icon:
    "h-10 w-10 border border-white/10 bg-white/5 text-white hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-70",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        variantClasses[variant],
        variant === "icon" && "rounded-2xl p-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
