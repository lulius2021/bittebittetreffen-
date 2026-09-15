// Zentrale Kalender-Konfiguration.
// Alle Daten liegen im Jahr 2026 und werden als ISO-Strings "YYYY-MM-DD" verwendet,
// damit keine Zeitzonen-Überraschungen auftreten.

export const RANGE_START = "2026-09-15"; // heute
export const RANGE_END = "2026-10-30";

// Diese Tage sind stumm gesperrt (kein Grund sichtbar, wirken einfach nicht anklickbar).
export const SILENT_BLOCKED = new Set<string>([
  "2026-09-25",
  "2026-09-26",
  "2026-09-27",
  "2026-10-31", // liegt bereits außerhalb der Range, aus Sicherheitsgründen trotzdem geblockt
]);

// Berufsschul-Tage: ganztägig gesperrt, kleine Notiz sichtbar.
export const BERUFSSCHULE = new Set<string>([
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-22",
  "2026-09-23",
  "2026-09-24",
  "2026-09-29",
  "2026-09-30",
  "2026-10-01",
  "2026-10-02",
]);

// Freitage mit Berufsschule vormittags: Tag selbst wählbar, nur "Vormittags" gesperrt.
export const FRIDAY_MORNING_BLOCKED = new Set<string>([
  "2026-09-19",
  "2026-10-03",
]);

export type TimeSlot = "Vormittags" | "Nachmittags" | "Abends";
export const TIME_SLOTS: TimeSlot[] = ["Vormittags", "Nachmittags", "Abends"];

export function toISO(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

// Wochentags-Nummer nach ISO (Mo=1..So=7) für ein Datum "YYYY-MM-DD".
// Wir konstruieren das Date als UTC, damit die lokale Zeitzone nichts verzerrt.
export function isoWeekday(iso: string): number {
  const { y, m, d } = parseISO(iso);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=So..6=Sa
  return wd === 0 ? 7 : wd;
}

export function isInRange(iso: string): boolean {
  return iso >= RANGE_START && iso <= RANGE_END;
}

// Ein Tag ist "voll gesperrt" (nicht anklickbar), wenn er außerhalb der Range,
// stumm gesperrt oder Berufsschul-Tag ist.
export function isFullyBlocked(iso: string): boolean {
  if (!isInRange(iso)) return true;
  if (SILENT_BLOCKED.has(iso)) return true;
  if (BERUFSSCHULE.has(iso)) return true;
  return false;
}

export function isBerufsschule(iso: string): boolean {
  return BERUFSSCHULE.has(iso);
}

// Welche Zeit-Slots sind an einem (bereits als "auswählbar" bestätigten) Tag frei?
export function availableSlots(iso: string): TimeSlot[] {
  if (FRIDAY_MORNING_BLOCKED.has(iso)) {
    return ["Nachmittags", "Abends"];
  }
  return [...TIME_SLOTS];
}

// Alle Tage die im Monat angezeigt werden, inklusive führender/anschließender Blank-Slots
// damit das Grid schön ausgerichtet ist. Woche beginnt Montag.
export function buildMonthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = first.getUTCDay() === 0 ? 7 : first.getUTCDay(); // 1..7
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const grid: (string | null)[] = [];
  for (let i = 1; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(toISO(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export function formatHuman(iso: string): string {
  const { y, m, d } = parseISO(iso);
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${d}. ${monthNames[m - 1]} ${y}`;
}
