import type { Dictionary } from "@/i18n/types";
import { CheckCircle2, MessageCircle, SlidersHorizontal, Sparkles, Users } from "lucide-react";

const featureIcons = [SlidersHorizontal, MessageCircle, Users] as const;

export function LandingFeatures({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-5 py-4 sm:rounded-3xl sm:px-6">
        <div>
          <p className="text-sm font-semibold text-white">{dictionary.landing.trustTitle}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            {dictionary.landing.trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
          {dictionary.landing.benefitsLabel}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {dictionary.landing.benefitsTitle}
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {dictionary.landing.features.map((feature, index) => {
          const Icon = featureIcons[index] ?? MessageCircle;
          return (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 sm:rounded-3xl sm:p-6"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {feature.description}
            </p>
          </article>
          );
        })}
      </div>

      <div
        id="how-it-works"
        className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:mt-8 sm:rounded-3xl sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
            {dictionary.landing.foundationLabel}
          </p>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
            {dictionary.landing.foundationTitle}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dictionary.landing.steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-slate-950">{index + 1}</span>
                <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:mt-8 sm:rounded-3xl sm:p-6">
        <div className="flex max-w-3xl gap-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
              {dictionary.landing.fitLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              {dictionary.landing.fitTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              {dictionary.landing.fitDescription}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
