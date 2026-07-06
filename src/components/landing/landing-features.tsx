import type { Dictionary } from "@/i18n/types";

export function LandingFeatures({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {dictionary.landing.features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
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
        className="mt-8 grid gap-6 rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:grid-cols-2"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {dictionary.landing.foundationLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
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
