import type { CSSProperties } from "react";
import { apiAssetUrl } from "@/shared/api/client";
import { cn } from "@/shared/lib/cn";

function avatarFallback(name: string | null | undefined) {
  return (name?.trim()?.charAt(0) || "U").toUpperCase();
}

export function Avatar({
  alt,
  className,
  src,
  style,
}: {
  alt: string;
  className?: string;
  src?: string | null;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10",
        className,
      )}
      style={style}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={apiAssetUrl(src)} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-100">
          {avatarFallback(alt)}
        </span>
      )}
    </span>
  );
}
