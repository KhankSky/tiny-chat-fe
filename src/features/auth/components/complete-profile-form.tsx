"use client";

import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfile } from "@/features/auth/api/auth-api";
import type { CompleteProfileRequest } from "@/features/auth/types";
import { uploadMeAvatar } from "@/features/profile/api/profile-api";
import { Avatar } from "@/shared/ui/avatar";
import { getStoredAuthUser, persistAuthSession, updateStoredAuthUser } from "@/shared/auth/session";
import type { Dictionary, Locale } from "@/i18n/types";

type Availability = "MORNING" | "AFTERNOON" | "EVENING" | "LATE_NIGHT" | "WEEKEND";
type Frequency = "CASUAL" | "FEW_TIMES_A_WEEK" | "ALMOST_DAILY";
type Draft = { version: 1; currentStep: number; values: Partial<CompleteProfileRequest> };

const DRAFT_KEY = "conyva:onboarding:draft:v2";
const steps = ["practiceGoal", "englishLevel", "interests", "profile", "review"] as const;
const levels = ["LEVEL_A", "LEVEL_B", "LEVEL_C"] as const;
const goals = ["DAILY_CHAT", "IMPROVE_WRITING", "MAKE_FRIENDS", "TOEIC_BASIC", "IELTS_BASIC"] as const;
const interests = ["FOOD", "TRAVEL", "STUDY", "WORK", "MUSIC", "MOVIES", "DAILY_LIFE", "SPORT", "TECHNOLOGY", "BOOKS", "GAMES"] as const;
const availability: Availability[] = ["MORNING", "AFTERNOON", "EVENING", "LATE_NIGHT", "WEEKEND"];
const frequencies: Frequency[] = ["CASUAL", "FEW_TIMES_A_WEEK", "ALMOST_DAILY"];

export function CompleteProfileForm({ dictionary }: { dictionary: Dictionary; locale?: Locale }) {
  const router = useRouter();
  const t = dictionary.auth;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [englishLevel, setEnglishLevel] = useState<CompleteProfileRequest["englishLevel"] | "">("");
  const [practiceGoal, setPracticeGoal] = useState<CompleteProfileRequest["practiceGoal"] | "">("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability[]>([]);
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [frequency, setFrequency] = useState<Frequency>("CASUAL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (getStoredAuthUser()?.profileCompleted) router.replace("/conversations");
  }, [router]);

  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null;
      if (!draft || draft.version !== 1) return;
      const values = draft.values;
      setStep(Math.min(Math.max(draft.currentStep, 0), steps.length - 1));
      setDisplayName(values.displayName ?? "");
      setBio(values.bio ?? "");
      setEnglishLevel(values.englishLevel ?? "");
      setPracticeGoal(values.practiceGoal ?? "");
      setSelectedInterests(values.interests ?? []);
      setSelectedAvailability(values.availability ?? []);
      setTimezone(values.timezone ?? "Asia/Ho_Chi_Minh");
      setFrequency(values.practiceFrequency ?? "CASUAL");
    } catch { sessionStorage.removeItem(DRAFT_KEY); }
  }, []);

  useEffect(() => {
    const values: Partial<CompleteProfileRequest> = { displayName, bio, englishLevel: englishLevel || undefined, practiceGoal: practiceGoal || undefined, interests: selectedInterests, availability: selectedAvailability, timezone, practiceFrequency: frequency };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, currentStep: step, values } satisfies Draft));
  }, [step, displayName, bio, englishLevel, practiceGoal, selectedInterests, selectedAvailability, timezone, frequency]);

  useEffect(() => { headingRef.current?.focus(); }, [step]);
  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  function validateCurrentStep() {
    if (step === 0 && !practiceGoal) return t.practiceGoalRequired;
    if (step === 1 && !englishLevel) return t.englishLevelRequired;
    if (step === 2 && selectedInterests.length < 3) return t.interestsMinError;
    if (step === 3 && (displayName.trim().length < 2 || displayName.trim().length > 50)) return t.displayNameRequired;
    return null;
  }

  function goNext(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    const validationError = validateCurrentStep();
    setError(validationError);
    if (!validationError) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function selectAvatar(file: File | null) {
    setAvatarError(null);
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setAvatarError(t.avatarTypeError); return; }
    if (file && file.size > 5 * 1024 * 1024) { setAvatarError(t.avatarSizeError); return; }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateCurrentStep();
    setError(validationError);
    if (validationError || loading) return;
    setLoading(true);
    try {
      const user = await completeProfile({ displayName: displayName.trim(), avatarUrl: null, englishLevel: englishLevel as CompleteProfileRequest["englishLevel"], practiceGoal: practiceGoal as CompleteProfileRequest["practiceGoal"], interests: selectedInterests, bio: bio.trim() || null, timezone, availability: selectedAvailability, practiceFrequency: frequency });
      persistAuthSession(user);
      if (avatarFile) {
        const data = new FormData(); data.append("file", avatarFile);
        const uploaded = await uploadMeAvatar(data);
        persistAuthSession(updateStoredAuthUser((stored) => stored ? { ...stored, avatarUrl: uploaded.avatarUrl, displayName: uploaded.displayName } : stored) ?? user);
      }
      sessionStorage.removeItem(DRAFT_KEY);
      setCompleted(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : t.saveProfileError); } finally { setLoading(false); }
  }

  if (completed) return <CompletionFinal t={t} onFindGroup={() => router.push("/groups/match")} />;

  const stepKey = steps[step];
  const title = dictionary.auth[`${stepKey}StepTitle` as keyof typeof dictionary.auth] as string;
  const description = dictionary.auth[`${stepKey}StepDescription` as keyof typeof dictionary.auth] as string;

  return <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (step === steps.length - 1) void submit(event); }}>
    <div aria-label={t.progressLabel} className="space-y-2"><div className="flex justify-between text-sm text-slate-300"><span>{t.stepLabel} {step + 1}/{steps.length}</span><span>{title}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
    <section aria-labelledby="onboarding-step-title"><h2 id="onboarding-step-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">{title}</h2><p className="mt-2 text-sm text-slate-400">{description}</p><div className="mt-6">{step === 0 && <ChoiceCards values={goals} selected={practiceGoal} labels={dictionary.enums.practiceGoal} descriptions={dictionary.enums.practiceGoalDescription} onSelect={(value) => { setPracticeGoal(value as typeof practiceGoal); setError(null); }} />}{step === 1 && <ChoiceCards values={levels} selected={englishLevel} labels={dictionary.enums.englishLevel} descriptions={dictionary.enums.englishLevelDescription} onSelect={(value) => { setEnglishLevel(value as typeof englishLevel); setError(null); }} />}{step === 2 && <MatchingFields t={t} dictionary={dictionary} selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} selectedAvailability={selectedAvailability} setSelectedAvailability={setSelectedAvailability} timezone={timezone} setTimezone={setTimezone} frequency={frequency} setFrequency={setFrequency} />}{step === 3 && <ProfileFields t={t} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} avatarPreview={avatarPreview} avatarError={avatarError} onAvatarSelect={selectAvatar} />}</div></section>
    {step === 4 && <Review dictionary={dictionary} displayName={displayName} englishLevel={englishLevel} practiceGoal={practiceGoal} interests={selectedInterests} bio={bio} />}
    {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
    <div className="flex gap-3"><button type="button" disabled={loading || step === 0} onClick={() => { setError(null); setStep((current) => current - 1); }} className="min-h-11 flex-1 rounded-full border border-white/15 px-5 text-sm font-semibold text-white disabled:opacity-40">{t.backButton}</button>{step < steps.length - 1 ? <button type="button" onClick={goNext} className="min-h-11 flex-1 rounded-full bg-cyan-400 px-5 text-sm font-semibold text-slate-950">{t.continueButton}</button> : <button type="submit" disabled={loading} className="min-h-11 flex-1 rounded-full bg-cyan-400 px-5 text-sm font-semibold text-slate-950 disabled:opacity-60">{loading ? dictionary.common.saving : t.completeProfileButton}</button>}</div>
  </form>;
}

function ProfileFields({ t, displayName, setDisplayName, bio, setBio, avatarPreview, avatarError, onAvatarSelect }: { t: Dictionary["auth"]; displayName: string; setDisplayName: (value: string) => void; bio: string; setBio: (value: string) => void; avatarPreview: string | null; avatarError: string | null; onAvatarSelect: (file: File | null) => void }) {
  const initials = (displayName.trim() || t.displayNamePlaceholder).split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  return <div className="mx-auto max-w-md space-y-5"><div className="text-center"><label className="group relative mx-auto flex h-28 w-28 cursor-pointer items-center justify-center overflow-visible rounded-full border border-cyan-300/20 bg-slate-900 text-3xl font-medium text-slate-500 ring-8 ring-slate-950 transition hover:border-cyan-300/60">{avatarPreview ? <Avatar className="h-full w-full" src={avatarPreview} alt={t.avatarUrlLabel} /> : initials}<span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-950 bg-cyan-400 text-lg text-slate-950">⌁</span><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onAvatarSelect(event.target.files?.[0] ?? null)} /></label><p className="mt-4 text-sm text-slate-300"><span className="font-semibold text-cyan-300">{t.avatarUploadHint}</span><span className="text-slate-500"> · JPG, PNG, WebP · 5 MB</span></p>{avatarPreview && <button type="button" onClick={() => onAvatarSelect(null)} className="mt-2 text-xs font-medium text-slate-400 hover:text-red-300">{t.avatarRemove}</button>}{avatarError && <p className="mt-2 text-sm text-red-300">{avatarError}</p>}</div><Field label={t.displayNameLabel}><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t.displayNamePlaceholder} maxLength={50} className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60" /></Field><Field label={t.shortBioLabel}><textarea value={bio} maxLength={200} onChange={(event) => setBio(event.target.value)} placeholder={t.bioPlaceholder} className="min-h-28 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60" /><span className="block text-right text-xs text-slate-500">{bio.length}/200</span></Field></div>;
}

function MatchingFields({ t, dictionary, selectedInterests, setSelectedInterests, selectedAvailability, setSelectedAvailability, timezone, setTimezone, frequency, setFrequency }: { t: Dictionary["auth"]; dictionary: Dictionary; selectedInterests: string[]; setSelectedInterests: (value: string[]) => void; selectedAvailability: Availability[]; setSelectedAvailability: (value: Availability[]) => void; timezone: string; setTimezone: (value: string) => void; frequency: Frequency; setFrequency: (value: Frequency) => void }) { return <div className="space-y-6"><div><p className="mb-3 text-sm text-slate-300">{t.interestsCountLabel}: {selectedInterests.length}/5</p><div className="flex flex-wrap gap-2">{interests.map((interest) => <button type="button" key={interest} disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5} onClick={() => setSelectedInterests(selectedInterests.includes(interest) ? selectedInterests.filter((value) => value !== interest) : [...selectedInterests, interest])} className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40 ${selectedInterests.includes(interest) ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/10 bg-white/5 text-slate-300"}`}>{dictionary.enums.interest[interest]}</button>)}</div></div><div><p className="mb-3 text-sm font-medium text-slate-200">{t.availabilityLabel}</p><div className="flex flex-wrap gap-2">{availability.map((value) => <button type="button" key={value} onClick={() => setSelectedAvailability(selectedAvailability.includes(value) ? selectedAvailability.filter((item) => item !== value) : [...selectedAvailability, value])} className={`min-h-11 rounded-full border px-4 py-2 text-sm ${selectedAvailability.includes(value) ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/10 bg-white/5 text-slate-300"}`}>{dictionary.enums.availability[value]}</button>)}</div><label className="mt-3 block text-xs text-slate-400">{t.timezoneLabel}<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white"><option value="UTC">UTC</option><option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option><option value="Asia/Tokyo">Asia/Tokyo</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option></select></label></div><div><p className="mb-3 text-sm font-medium text-slate-200">{t.frequencyLabel}</p><ChoiceCards values={frequencies} selected={frequency} labels={dictionary.enums.frequency} descriptions={dictionary.enums.frequencyDescription} onSelect={(value) => setFrequency(value as Frequency)} /></div></div>; }

function ChoiceCards({ values, selected, labels, descriptions, onSelect }: { values: readonly string[]; selected: string; labels: Record<string, string>; descriptions: Record<string, string>; onSelect: (value: string) => void }) { return <div className="grid gap-3 sm:grid-cols-2">{values.map((value, index) => <button type="button" key={value} aria-pressed={selected === value} onClick={() => onSelect(value)} className={`group min-h-28 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${selected === value ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/50"}`}><span className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">{["◎", "✦", "◈", "◉", "◇"][index]}</span><span><span className="block text-sm font-semibold">{labels[value]}</span><span className="mt-1 block text-xs font-normal leading-5 text-slate-400">{descriptions[value]}</span></span></span></button>)}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200">{label}</span>{children}</label>; }
function CompletionFinal({ t, onFindGroup }: { t: Dictionary["auth"]; onFindGroup: () => void }) { return <section className="space-y-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-3xl text-slate-950">✓</div><h2 className="text-2xl font-semibold">{t.profileReadyTitle}</h2><p className="text-slate-300">{t.profileReadyDescription}</p><button type="button" onClick={onFindGroup} className="min-h-11 w-full rounded-full bg-cyan-400 px-5 font-semibold text-slate-950">{t.findMatchingGroupButton}</button></section>; }
function Review({ dictionary, displayName, englishLevel, practiceGoal, interests, bio }: { dictionary: Dictionary; displayName: string; englishLevel: string; practiceGoal: string; interests: string[]; bio: string }) { const t = dictionary.auth; const englishLevelLabels = dictionary.enums.englishLevel as Record<string, string>; const practiceGoalLabels = dictionary.enums.practiceGoal as Record<string, string>; const interestLabels = dictionary.enums.interest as Record<string, string>; return <section className="grid gap-3 sm:grid-cols-2">{[[t.displayNameLabel, displayName], [t.englishLevelLabel, englishLevelLabels[englishLevel]], [t.practiceGoalLabel, practiceGoalLabels[practiceGoal]], [t.interestsLabel, interests.map((value) => interestLabels[value]).join(", ")], [t.shortBioLabel, bio || t.noBioLabel]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm text-white">{value}</p></div>)}</section>; }
