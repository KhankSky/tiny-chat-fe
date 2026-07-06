const features = [
  {
    title: "Separation of concerns",
    description:
      "Landing, auth, and app screens live as distinct modules, so future pages do not leak into each other.",
  },
  {
    title: "Reusable UI blocks",
    description:
      "Header, hero, and feature cards are isolated into components that can be reused or replaced independently.",
  },
  {
    title: "Auth-ready navigation",
    description:
      "The top bar already points to login and register routes, making the next integration step straightforward.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
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
            Foundation
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Ready for login, register, and the main chat app.
          </h2>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          The structure is intentionally boring in the best way. A small set of
          focused components now makes it much easier to add routes like auth,
          profile setup, onboarding, and the actual chat workspace later.
        </p>
      </div>
    </section>
  );
}
