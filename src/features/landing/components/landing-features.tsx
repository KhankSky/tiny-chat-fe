import type { Dictionary } from "@/i18n/types";

export function LandingFeatures({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {dictionary.landing.features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 sm:rounded-3xl sm:p-6"
          >
            <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {feature.description}
            </p>
          </article>
        ))}
      </div>

      <div
        id="how-it-works"
        className="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:mt-8 sm:rounded-3xl sm:p-6 md:grid-cols-2"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300 sm:text-sm sm:tracking-[0.3em]">
            {dictionary.landing.foundationLabel}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
            {dictionary.landing.foundationTitle}
          </h2>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          {dictionary.landing.foundationDescription}
        </p>
      </div>
    </section>
  );
}
