import Link from "next/link";

export function LandingHero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Build meaningful conversations faster
        </div>

        <div className="space-y-5">
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            A clean chat experience for language practice, communities, and support.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Tiny Chat is set up as a simple, scalable front-end foundation. We keep
            marketing pages separate from auth and product flows so every feature stays
            easy to grow.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Get started
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            See how it works
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            Preview
          </p>
          <div className="mt-5 space-y-4">
            <MessageBubble align="left" label="Teacher" text="Welcome back. What topic do you want to practice today?" />
            <MessageBubble align="right" label="You" text="I want to practice speaking about travel and daily routines." />
            <MessageBubble align="left" label="AI Tutor" text="Perfect. We can start with simple prompts and level up gradually." />
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
