"use client";

import { useState } from "react";

// iPhone-Style Passcode-Gate. Richtige Antwort: 3.
// Die Prüfung ist absichtlich rein clientseitig – kein echter Sicherheitsanspruch.
const CORRECT_ANSWER = "3";
const CODE_LENGTH = 1;

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  function press(n: string) {
    if (code.length >= CODE_LENGTH) return;
    const next = code + n;
    setCode(next);
    if (next.length === CODE_LENGTH) {
      // kurze Denkpause, damit der User den gefüllten Punkt sieht
      setTimeout(() => {
        if (next === CORRECT_ANSWER) {
          onUnlock();
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setCode("");
          }, 500);
        }
      }, 180);
    }
  }

  function backspace() {
    setCode((c) => c.slice(0, -1));
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div
        className={
          "w-full max-w-sm rounded-[2.25rem] bg-white/70 p-8 shadow-soft backdrop-blur-xl " +
          (shake ? "animate-shake" : "")
        }
      >
        <h1 className="text-center font-display text-3xl font-semibold text-rose-700">
          Hallo Eva
        </h1>
        <p className="mt-3 text-center text-rose-800/80">
          Wie oft haben wir uns schon in echt gesehen?
        </p>

        {/* Punkte-Anzeige */}
        <div className="mt-6 flex justify-center gap-3">
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={
                "h-4 w-4 rounded-full border-2 border-rose-400 transition-colors " +
                (i < code.length ? "bg-rose-400" : "bg-transparent")
              }
            />
          ))}
        </div>

        {/* Ziffernblock */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {["1","2","3","4","5","6","7","8","9"].map((n) => (
            <KeyButton key={n} label={n} onClick={() => press(n)} />
          ))}
          <div />
          <KeyButton label="0" onClick={() => press("0")} />
          <button
            type="button"
            onClick={backspace}
            className="h-16 rounded-2xl text-sm font-semibold text-rose-700/70 transition hover:bg-white/50"
            aria-label="Löschen"
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
}

function KeyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-16 rounded-2xl bg-white/80 text-2xl font-semibold text-rose-800 shadow-sm transition
                 hover:bg-white active:scale-95"
    >
      {label}
    </button>
  );
}
