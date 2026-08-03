"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfile } from "@/features/auth/api/auth-api";
import { uploadMeAvatar } from "@/features/profile/api/profile-api";
import type { CompleteProfileRequest } from "@/features/auth/types";
import { Avatar } from "@/shared/ui/avatar";
import { persistAuthSession, updateStoredAuthUser } from "@/shared/auth/session";
import type { Dictionary } from "@/i18n/types";

type Draft = { version: 1; currentStep: number; values: Partial<CompleteProfileRequest> & { bio: string } };
const DRAFT_KEY = "conyva:onboarding:draft:v1";
const steps = ["practiceGoal", "englishLevel", "interests", "profile"] as const;
const levels = ["LEVEL_A", "LEVEL_B", "LEVEL_C"] as const;
const goals = ["DAILY_CHAT", "IMPROVE_WRITING", "MAKE_FRIENDS", "TOEIC_BASIC", "IELTS_BASIC"] as const;
const interests = ["FOOD", "TRAVEL", "STUDY", "WORK", "MUSIC", "MOVIES", "DAILY_LIFE", "SPORT", "TECHNOLOGY", "BOOKS", "GAMES"] as const;

export function CompleteProfileForm({ dictionary }: { dictionary: Dictionary }) {
  const router = useRouter();
  const t = dictionary.auth;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [englishLevel, setEnglishLevel] = useState<CompleteProfileRequest["englishLevel"] | "">("");
  const [practiceGoal, setPracticeGoal] = useState<CompleteProfileRequest["practiceGoal"] | "">("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null;
      if (saved?.version !== 1) return;
      const values = saved.values;
      setStep(Math.min(Math.max(saved.currentStep, 0), steps.length - 1));
      setDisplayName(values.displayName ?? ""); setBio(values.bio ?? "");
      setEnglishLevel(values.englishLevel ?? ""); setPracticeGoal(values.practiceGoal ?? "");
      setSelectedInterests(values.interests ?? []);
    } catch { sessionStorage.removeItem(DRAFT_KEY); }
  }, []);

  useEffect(() => {
    const draft: Draft = { version: 1, currentStep: step, values: { displayName, bio, avatarUrl: null, englishLevel: englishLevel || undefined, practiceGoal: practiceGoal || undefined, interests: selectedInterests } };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    headingRef.current?.focus();
  }, [step, displayName, bio, englishLevel, practiceGoal, selectedInterests]);

  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  function validateStep() {
    if (step === 0 && !practiceGoal) return t.practiceGoalRequired;
    if (step === 1 && !englishLevel) return t.englishLevelRequired;
    if (step === 2 && selectedInterests.length === 0) return t.pickInterestError;
    if (step === 3 && displayName.trim().length < 2) return t.displayNameRequired;
    return null;
  }

  function next() {
    const validation = validateStep(); setError(validation);
    if (!validation) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function toggleInterest(value: string) {
    setSelectedInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setError(null);
  }

  function handleAvatar(file: File | null) {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file); setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const validation = validateStep(); setError(validation); if (validation) return;
    setLoading(true);
    try {
      const user = await completeProfile({ displayName: displayName.trim(), avatarUrl: null, englishLevel: englishLevel as CompleteProfileRequest["englishLevel"], practiceGoal: practiceGoal as CompleteProfileRequest["practiceGoal"], interests: selectedInterests, bio: bio.trim() || null });
      persistAuthSession(user);
      if (avatarFile) { const data = new FormData(); data.append("file", avatarFile); const uploaded = await uploadMeAvatar(data); persistAuthSession(updateStoredAuthUser((stored) => stored ? { ...stored, avatarUrl: uploaded.avatarUrl, displayName: uploaded.displayName } : stored) ?? user); }
      sessionStorage.removeItem(DRAFT_KEY); router.replace("/conversations"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : t.saveProfileError); } finally { setLoading(false); }
  }

  return <form className="space-y-6" onSubmit={submit}>
    <div aria-label={t.progressLabel} className="space-y-2">
      <div className="flex justify-between text-sm text-slate-300"><span>{t.stepLabel} {step + 1}/{steps.length}</span><span>{dictionary.auth[`${steps[step]}StepTitle` as keyof typeof dictionary.auth] as string}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
    </div>
    <section aria-labelledby="onboarding-step-title">
      <h2 id="onboarding-step-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">{dictionary.auth[`${steps[step]}StepTitle` as keyof typeof dictionary.auth] as string}</h2>
      <p className="mt-2 text-sm text-slate-400">{dictionary.auth[`${steps[step]}StepDescription` as keyof typeof dictionary.auth] as string}</p>
      <div className="mt-6">{step === 0 && <Options values={goals} selected={practiceGoal} onSelect={(value) => { setPracticeGoal(value as typeof practiceGoal); setError(null); }} labels={dictionary.enums.practiceGoal} />}{step === 1 && <Options values={levels} selected={englishLevel} onSelect={(value) => { setEnglishLevel(value as typeof englishLevel); setError(null); }} labels={dictionary.enums.englishLevel} />}{step === 2 && <div className="flex flex-wrap gap-2">{interests.map((interest) => <button type="button" key={interest} aria-pressed={selectedInterests.includes(interest)} onClick={() => toggleInterest(interest)} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${selectedInterests.includes(interest) ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/10 bg-white/5 text-slate-300"}`}>{dictionary.enums.interest[interest]}</button>)}</div>}{step === 3 && <div className="space-y-4"><Field label={t.displayNameLabel}><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t.displayNamePlaceholder} className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white" /></Field><Field label={t.avatarUrlLabel}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-300" />{avatarPreview && <Avatar className="mt-3 h-16 w-16" src={avatarPreview} alt={displayName || t.displayNameLabel} />}</Field><Field label={t.shortBioLabel}><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t.bioPlaceholder} className="min-h-28 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white" /></Field></div>}</div>
    </section>
    {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
    <div className="flex gap-3"><button type="button" disabled={loading || step === 0} onClick={() => { setError(null); setStep((current) => current - 1); }} className="min-h-11 flex-1 rounded-full border border-white/15 px-5 text-sm font-semibold text-white disabled:opacity-40">{t.backButton}</button>{step < steps.length - 1 ? <button type="button" onClick={next} className="min-h-11 flex-1 rounded-full bg-cyan-400 px-5 text-sm font-semibold text-slate-950">{t.continueButton}</button> : <button type="submit" disabled={loading} className="min-h-11 flex-1 rounded-full bg-cyan-400 px-5 text-sm font-semibold text-slate-950 disabled:opacity-60">{loading ? dictionary.common.saving : t.completeProfileButton}</button>}</div>
  </form>;
}

function Options({ values, selected, onSelect, labels }: { values: readonly string[]; selected: string; onSelect: (value: string) => void; labels: Record<string, string> }) { return <div className="grid gap-3 sm:grid-cols-2">{values.map((value) => <button type="button" key={value} aria-pressed={selected === value} onClick={() => onSelect(value)} className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${selected === value ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-white/10 bg-white/5 text-slate-300"}`}>{labels[value]}</button>)}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-medium text-slate-200">{label}</span>{children}</label>; }
