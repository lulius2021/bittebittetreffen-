"use client";

import { useState } from "react";
import LockScreen from "./LockScreen";
import CalendarPicker from "./CalendarPicker";
import { formatHuman, TimeSlot } from "./calendar-data";

// -----------------------------------------------------------------------------
// Texte – hier lassen sich Formulierungen bequem anpassen.
// -----------------------------------------------------------------------------
const TEXT = {
  intro1:
    "Ich hoffe, du hast dich auf der Arbeit nicht gelangweilt — dafür hab ich dir hier was gebaut. Hat leider etwas länger gedauert…",
  intro2:
    "Also: damit du nicht mehr absagen kannst, machen wir jetzt hier unser Treffen aus.",
  step1Title: "Was machen wir?",
  step2Title: "Wann passt's dir?",
  step3Title: "Und ein Ausweichtermin?",
  step3Sub:
    "Falls wieder mal was dazwischenkommt (wir kennen das ja…).",
  step4Title: "Noch was?",
  submitLabel: "Treffen bestätigen",
  confirmationP1:
    "Somit hast du das Treffen bestätigt. Vielen Dank für Ihre Zeit. Bei Änderungen oder Nichtkönnen bitte frühzeitig Bescheid geben.",
  confirmationP2Before: "Bei Nichterscheinen wird eine Buße von ",
  confirmationHighlight: "10.000 €",
  confirmationP2After: " fällig und zieht rechtliche Konsequenzen nach sich.",
};

const ACTIVITIES = [
  "In die Berge gehen",
  "Essen gehen",
  "Laufen gehen",
  "Rennradfahren",
];

type Stage = "lock" | "intro" | "step1" | "step2" | "step3" | "step4" | "confirmed";

export default function DateFlow() {
  const [stage, setStage] = useState<Stage>("lock");

  // Formular-State
  const [activity, setActivity] = useState<string>("");
  const [customActivity, setCustomActivity] = useState<string>("");
  const [date1, setDate1] = useState<string | null>(null);
  const [slot1, setSlot1] = useState<TimeSlot | null>(null);
  const [date2, setDate2] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          customActivity,
          date1,
          slot1,
          date2,
          slot2,
          notes,
        }),
      });
    } catch (err) {
      // Fehler nur loggen, Eva sieht trotzdem die Bestätigung.
      console.error("send failed", err);
    } finally {
      setStage("confirmed");
    }
  }

  if (stage === "lock") {
    return <LockScreen onUnlock={() => setStage("intro")} />;
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-5 pb-12 pt-10">
      {stage === "intro" && (
        <Card>
          <p className="font-display text-2xl leading-snug text-rose-800">
            {TEXT.intro1}
          </p>
          <p className="mt-6 text-rose-700">{TEXT.intro2}</p>
          <PrimaryButton className="mt-8 w-full" onClick={() => setStage("step1")}>
            Los geht's
          </PrimaryButton>
        </Card>
      )}

      {stage === "step1" && (
        <StepShell title={TEXT.step1Title} progress={1}>
          <div className="space-y-3">
            {ACTIVITIES.map((a) => (
              <ChoiceRow
                key={a}
                label={a}
                selected={activity === a}
                onClick={() => setActivity(a)}
              />
            ))}
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-rose-700">
                Eigener Vorschlag
              </label>
              <input
                type="text"
                value={customActivity}
                onChange={(e) => {
                  setCustomActivity(e.target.value);
                  if (e.target.value) setActivity("Eigener Vorschlag");
                }}
                placeholder="…dein Vorschlag"
                className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 outline-none
                           focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
              />
            </div>
          </div>
          <div className="mt-8">
            <NextButton
              disabled={!activity || (activity === "Eigener Vorschlag" && !customActivity.trim())}
              onClick={() => setStage("step2")}
            />
          </div>
        </StepShell>
      )}

      {stage === "step2" && (
        <StepShell title={TEXT.step2Title} progress={2}>
          <CalendarPicker
            date={date1}
            slot={slot1}
            onChange={(d, s) => {
              setDate1(d);
              setSlot1(s);
            }}
          />
          <div className="mt-6 flex gap-3">
            <SecondaryButton onClick={() => setStage("step1")}>Zurück</SecondaryButton>
            <NextButton disabled={!date1 || !slot1} onClick={() => setStage("step3")} />
          </div>
        </StepShell>
      )}

      {stage === "step3" && (
        <StepShell title={TEXT.step3Title} progress={3}>
          <p className="mb-4 text-rose-700/80">{TEXT.step3Sub}</p>
          <CalendarPicker
            date={date2}
            slot={slot2}
            onChange={(d, s) => {
              setDate2(d);
              setSlot2(s);
            }}
          />
          <div className="mt-6 flex gap-3">
            <SecondaryButton onClick={() => setStage("step2")}>Zurück</SecondaryButton>
            <NextButton disabled={!date2 || !slot2} onClick={() => setStage("step4")} />
          </div>
        </StepShell>
      )}

      {stage === "step4" && (
        <StepShell title={TEXT.step4Title} progress={4}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Anmerkungen oder Fragen?"
            className="w-full rounded-2xl border border-rose-100 bg-white/90 p-4 outline-none
                       focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
          />
          <div className="mt-6 flex gap-3">
            <SecondaryButton onClick={() => setStage("step3")}>Zurück</SecondaryButton>
            <PrimaryButton
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Wird bestätigt…" : TEXT.submitLabel}
            </PrimaryButton>
          </div>
        </StepShell>
      )}

      {stage === "confirmed" && (
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-floaty text-4xl">💌</div>
            <h2 className="font-display text-2xl font-semibold text-rose-800">
              Treffen bestätigt
            </h2>
            <div className="mt-5 space-y-3 text-left text-sm leading-relaxed text-rose-800/80">
              <p>{TEXT.confirmationP1}</p>
              <p>
                {TEXT.confirmationP2Before}
                <span className="text-lg font-extrabold tracking-tight text-rose-600">
                  {TEXT.confirmationHighlight}
                </span>
                {TEXT.confirmationP2After}
              </p>
            </div>

            {/* Kleine Zusammenfassung als Ausklang */}
            <div className="mt-6 rounded-2xl bg-rose-50/80 p-4 text-left text-sm text-rose-700">
              <SummaryLine
                label="Aktivität"
                value={activity === "Eigener Vorschlag" ? customActivity : activity}
              />
              {date1 && slot1 && (
                <SummaryLine label="Termin" value={`${formatHuman(date1)} · ${slot1}`} />
              )}
              {date2 && slot2 && (
                <SummaryLine
                  label="Ausweich"
                  value={`${formatHuman(date2)} · ${slot2}`}
                />
              )}
            </div>
          </div>
        </Card>
      )}
    </main>
  );
}

// -----------------------------------------------------------------------------
// Kleine UI-Bausteine
// -----------------------------------------------------------------------------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pop rounded-[2rem] bg-white/80 p-7 shadow-soft backdrop-blur-xl">
      {children}
    </div>
  );
}

function StepShell({
  title,
  children,
  progress,
}: {
  title: string;
  children: React.ReactNode;
  progress: 1 | 2 | 3 | 4;
}) {
  return (
    <div className="animate-pop">
      <ProgressDots current={progress} />
      <h2 className="mt-4 font-display text-2xl font-semibold text-rose-800">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={
            "h-2 rounded-full transition-all " +
            (n === current
              ? "w-8 bg-rose-500"
              : n < current
              ? "w-2 bg-rose-400"
              : "w-2 bg-rose-200")
          }
        />
      ))}
    </div>
  );
}

function ChoiceRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold transition " +
        (selected
          ? "bg-rose-500 text-white shadow-glow"
          : "bg-white/85 text-rose-800 hover:bg-white")
      }
    >
      <span>{label}</span>
      <span
        className={
          "ml-3 h-5 w-5 rounded-full border-2 " +
          (selected ? "border-white bg-white/30" : "border-rose-300")
        }
      />
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white shadow-soft transition " +
        "hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-rose-300 " +
        className
      }
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-white/80 px-5 py-3 font-semibold text-rose-700 shadow-sm transition
                 hover:bg-white active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function NextButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <PrimaryButton className="flex-1" onClick={onClick} disabled={disabled}>
      Weiter
    </PrimaryButton>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-rose-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
