"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createFeedback } from "@/features/feedback/api/feedback-api";
import type { FeedbackSeverity, FeedbackType } from "@/features/feedback/types";
import type { Dictionary, Locale } from "@/i18n/types";
import { Button } from "@/shared/ui/button";
import { ErrorMessage } from "@/shared/ui/error-message";
import { Modal } from "@/shared/ui/modal";
import type { ThemeMode } from "@/theme/use-theme-preference";

const feedbackTypes: FeedbackType[] = [
  "BUG",
  "IMPROVEMENT",
  "UI_UX",
  "CHAT_GROUP",
  "ACCOUNT",
  "OTHER",
];

const severities: FeedbackSeverity[] = ["LOW", "MEDIUM", "BLOCKING"];

function parseContextId(pathname: string, segment: "conversations" | "groups") {
  const match = pathname.match(new RegExp(`/${segment}/(\\d+)`));
  return match ? Number(match[1]) : null;
}

export function FeedbackModal({
  dictionary,
  locale,
  onClose,
  open,
  theme,
}: {
  dictionary: Dictionary;
  locale?: Locale;
  onClose: () => void;
  open: boolean;
  theme?: ThemeMode;
}) {
  const pathname = usePathname();
  const t = dictionary.feedback;
  const [type, setType] = useState<FeedbackType>("BUG");
  const [severity, setSeverity] = useState<FeedbackSeverity>("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const context = useMemo(
    () => ({
      conversationId: parseContextId(pathname, "conversations"),
      groupId: parseContextId(pathname, "groups"),
      route: pathname,
    }),
    [pathname],
  );

  if (!open) return null;

  async function handleSubmit() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError(t.messageRequired);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createFeedback({
        type,
        severity,
        message: trimmedMessage,
        pageUrl: typeof window === "undefined" ? null : window.location.href,
        route: context.route,
        conversationId: context.conversationId,
        groupId: context.groupId,
        locale,
        theme,
        viewportWidth: typeof window === "undefined" ? null : window.innerWidth,
        viewportHeight: typeof window === "undefined" ? null : window.innerHeight,
        userAgent: typeof navigator === "undefined" ? null : navigator.userAgent,
      });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError(null);
    setSent(false);
    onClose();
  }

  return (
    <Modal ariaLabel={t.ariaLabel} onClose={handleClose} className="max-w-lg">
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
            {dictionary.appName}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            {t.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t.description}</p>
        </div>
        <Button type="button" onClick={handleClose} variant="icon" aria-label={dictionary.common.close}>
          x
        </Button>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        {sent ? (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100">
            {t.success}
          </div>
        ) : null}

        <section className="space-y-2">
          <p className="text-sm font-medium text-slate-200">{t.typeLabel}</p>
          <div className="flex flex-wrap gap-2">
            {feedbackTypes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={`min-h-10 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  type === item
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}
              >
                {t.types[item]}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-slate-200">{t.severityLabel}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {severities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSeverity(item)}
                className={`min-h-11 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  severity === item
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                }`}
              >
                {t.severities[item]}
              </button>
            ))}
          </div>
        </section>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">{t.messageLabel}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            maxLength={3000}
            placeholder={t.messagePlaceholder}
          />
          <span className="block text-right text-xs text-slate-500">
            {message.length}/3000
          </span>
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-slate-400">
          {t.contextHint}
          <span className="mt-1 block truncate text-slate-500">{context.route}</span>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
        <Button type="button" onClick={handleClose} variant="ghost">
          {dictionary.common.cancel}
        </Button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
          {submitting ? t.submitting : t.submit}
        </Button>
      </div>
    </Modal>
  );
}
