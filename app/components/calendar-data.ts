// Zentrale Kalender-Konfiguration.
// Alle Daten als ISO-Strings "YYYY-MM-DD" — keine Zeitzonen-Überraschungen.
//
// Regel-Logik (wochentagsbasiert):
//   Mo–Do  → Berufsschule, ganztägig gesperrt (mit Label)
//   Fr     → Berufsschule vormittags: Tag wählbar, "Vormittags" gesperrt
//   Sa/So  → komplett frei
//
// Auswählbarer Zeitraum: RANGE_START..RANGE_END (inklusive).

export const RANGE_START = "2026-09-15"; // heute
export const RANGE_END = "2026-10-30";

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

// ISO-Wochentag: 1=Mo … 7=So
export function isoWeekday(iso: string): number {
  const { y, m, d } = parseISO(iso);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=So..6=Sa
  return wd === 0 ? 7 : wd;
}

export function isInRange(iso: string): boolean {
  return iso >= RANGE_START && iso <= RANGE_END;
}

// Mo–Do (1..4): Berufsschule ganztägig
export function isBerufsschule(iso: string): boolean {
  const wd = isoWeekday(iso);
  return wd >= 1 && wd <= 4;
}

// Tag komplett gesperrt (nicht anklickbar).
export function isFullyBlocked(iso: string): boolean {
  if (!isInRange(iso)) return true;
  if (isBerufsschule(iso)) return true;
  return false;
}

// Verfügbare Zeit-Slots an einem (bereits wählbaren) Tag.
// Freitag (5): Vormittags gesperrt.
export function availableSlots(iso: string): TimeSlot[] {
  const wd = isoWeekday(iso);
  if (wd === 5) return ["Nachmittags", "Abends"];
  return [...TIME_SLOTS];
}

// Monats-Grid inkl. führender/anschließender Leerslots. Woche beginnt Montag.
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
