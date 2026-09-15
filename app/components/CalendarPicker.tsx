"use client";

import { useMemo, useState } from "react";
import {
  RANGE_END,
  RANGE_START,
  availableSlots,
  buildMonthGrid,
  formatHuman,
  isBerufsschule,
  isFullyBlocked,
  isInRange,
  parseISO,
  TIME_SLOTS,
  TimeSlot,
} from "./calendar-data";

type Props = {
  date: string | null;
  slot: TimeSlot | null;
  onChange: (date: string | null, slot: TimeSlot | null) => void;
};

// Kleiner Kalender-Picker mit Monats-Navigation.
// Zeigt Berufsschul-Tage mit Label an, sperrt sie aber (nicht anklickbar).
// Nach Datumsauswahl erscheint die Uhrzeit-Auswahl.
export default function CalendarPicker({ date, slot, onChange }: Props) {
  const start = parseISO(RANGE_START);
  const end = parseISO(RANGE_END);

  // Aktueller Monat im Picker – standardmäßig der Monat der Range-Start.
  const [view, setView] = useState<{ y: number; m: number }>(
    date ? { y: parseISO(date).y, m: parseISO(date).m } : { y: start.y, m: start.m }
  );

  const grid = useMemo(() => buildMonthGrid(view.y, view.m), [view]);

  function canGoPrev() {
    // Nicht vor den Startmonat.
    return view.y > start.y || (view.y === start.y && view.m > start.m);
  }
  function canGoNext() {
    return view.y < end.y || (view.y === end.y && view.m < end.m);
  }
  function prevMonth() {
    setView((v) => (v.m === 1 ? { y: v.y - 1, m: 12 } : { y: v.y, m: v.m - 1 }));
  }
  function nextMonth() {
    setView((v) => (v.m === 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m: v.m + 1 }));
  }

  const monthLabel = new Date(Date.UTC(view.y, view.m - 1, 1)).toLocaleDateString(
    "de-DE",
    { month: "long", year: "numeric" }
  );

  const slotsForDate = date ? availableSlots(date) : [];

  return (
    <div>
      <div className="rounded-3xl bg-white/80 p-4 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            disabled={!canGoPrev()}
            onClick={prevMonth}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-700 shadow-sm transition hover:bg-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Vorheriger Monat"
          >
            ‹
          </button>
          <div className="font-display text-lg font-semibold capitalize text-rose-800">
            {monthLabel}
          </div>
          <button
            type="button"
            disabled={!canGoNext()}
            onClick={nextMonth}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-700 shadow-sm transition hover:bg-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Nächster Monat"
          >
            ›
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-rose-500">
          {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((iso, idx) => {
            if (!iso) return <div key={idx} className="h-14" />;

            const outOfRange = !isInRange(iso);
            const berufsschule = isBerufsschule(iso);
            const blocked = isFullyBlocked(iso);
            const selected = date === iso;

            const day = parseISO(iso).d;

            return (
              <button
                key={iso}
                type="button"
                disabled={blocked}
                onClick={() => onChange(iso, null)}
                className={[
                  "relative flex h-14 flex-col items-center justify-center rounded-xl text-sm transition",
                  selected
                    ? "bg-rose-500 text-white shadow-glow"
                    : blocked
                    ? "cursor-not-allowed text-rose-300"
                    : "bg-white/70 text-rose-800 hover:bg-rose-100",
                  outOfRange && !berufsschule ? "opacity-30" : "",
                ].join(" ")}
                aria-label={iso}
              >
                <span className="font-semibold leading-none">{day}</span>
                {berufsschule && (
                  <span className="mt-0.5 text-[9px] leading-none tracking-wide text-rose-400">
                    Berufsschule
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Uhrzeit-Auswahl erscheint erst nach Datumsauswahl */}
      {date && (
        <div className="mt-5 animate-pop rounded-3xl bg-white/80 p-4 shadow-soft backdrop-blur">
          <p className="text-sm text-rose-700/80">
            Gewählt: <span className="font-semibold text-rose-800">{formatHuman(date)}</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((s) => {
              const disabled = !slotsForDate.includes(s);
              const active = slot === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(date, s)}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-rose-500 text-white shadow-glow"
                      : disabled
                      ? "cursor-not-allowed bg-rose-50 text-rose-300"
                      : "bg-white text-rose-700 hover:bg-rose-100",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
