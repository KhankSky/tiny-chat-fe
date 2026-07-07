import { cn } from "@/shared/lib/cn";

export function LoadingState({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  return <p className={cn("text-sm text-slate-400", className)}>{label}</p>;
}
