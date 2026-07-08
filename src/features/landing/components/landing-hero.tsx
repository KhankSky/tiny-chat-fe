import Link from "next/link";
import type { Dictionary, Locale } from "@/i18n/types";

export function LandingHero({
  dictionary,
}: {
  dictionary: Dictionary;
  locale?: Locale;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
      <div className="space-y-6 sm:space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 sm:px-4">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          {dictionary.landing.badge}
        </div>

        <div className="space-y-5">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {dictionary.landing.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {dictionary.landing.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {dictionary.landing.primaryCta}
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            {dictionary.landing.secondaryCta}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:rounded-[2rem] sm:p-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:rounded-[1.5rem] sm:p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300 sm:text-xs sm:tracking-[0.35em]">
            {dictionary.landing.previewTitle}
          </p>
          <div className="mt-5 space-y-4">
            {dictionary.landing.bubbles.map((bubble, index) => (
              <MessageBubble
                key={bubble.label}
                align={index % 2 === 1 ? "right" : "left"}
                label={bubble.label}
                text={bubble.text}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({
  align,
  label,
  text,
}: {
  align: "left" | "right";
  label: string;
  text: string;
}) {
  const isRight = align === "right";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isRight
            ? "bg-cyan-400 text-slate-950"
            : "bg-white/8 border border-white/10 text-slate-100"
        }`}
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
          {label}
        </p>
        <p>{text}</p>
      </div>
    </div>
  );
}
