import { NextResponse } from "next/server";
import { Resend } from "resend";

// -----------------------------------------------------------------------------
// Serverless-Route: verschickt EINE E-Mail an den Ersteller (nicht an Eva).
// API-Key und Empfänger kommen ausschließlich aus Env-Variables.
// -----------------------------------------------------------------------------
// Diese Datei ist der einzige Ort für den Mail-Text/das Mail-Layout.
// Betreff, HTML-Struktur und Text-Fallback lassen sich hier unten anpassen.
// -----------------------------------------------------------------------------

export const runtime = "nodejs";

type Payload = {
  activity?: string;
  customActivity?: string;
  date1?: string | null;
  slot1?: string | null;
  date2?: string | null;
  slot2?: string | null;
  notes?: string;
};

// ISO "YYYY-MM-DD"  →  "TT.MM.JJJJ"
function formatDateDE(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}

function fallback(v: string | null | undefined, alt = "—") {
  return v && String(v).trim() ? String(v) : alt;
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Payload;

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.RECIPIENT_EMAIL;

    if (!apiKey || !to) {
      console.error("Missing RESEND_API_KEY or RECIPIENT_EMAIL env var");
      // Bewusst 200 zurückgeben – Eva soll die Bestätigung sehen.
      return NextResponse.json({ ok: false, reason: "env" }, { status: 200 });
    }

    // Aktivität aufbereiten (inkl. eigenem Vorschlag).
    const activityDisplay =
      data.activity === "Eigener Vorschlag"
        ? `Eigener Vorschlag: ${fallback(data.customActivity)}`
        : fallback(data.activity);

    const wunsch = `${formatDateDE(data.date1)} · ${fallback(data.slot1)}`;
    const ausweich = `${formatDateDE(data.date2)} · ${fallback(data.slot2)}`;
    const anmerkungen = fallback(data.notes, "keine");

    // ---------------- E-Mail-Inhalt ----------------
    const subject = "Eva hat euer Date bestätigt";

    const text = [
      "Eva hat das Formular abgeschickt.",
      "",
      `Aktivität:       ${activityDisplay}`,
      `Wunschtermin:    ${wunsch}`,
      `Ausweichtermin:  ${ausweich}`,
      `Anmerkungen:     ${anmerkungen}`,
    ].join("\n");

    const html = renderHtml({
      activity: activityDisplay,
      wunsch,
      ausweich,
      anmerkungen,
    });

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Date <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Resend error", error);
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send route failed", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

// -----------------------------------------------------------------------------
// HTML-Template – hier kannst du Farben/Wording anpassen.
// -----------------------------------------------------------------------------
function renderHtml(v: {
  activity: string;
  wunsch: string;
  ausweich: string;
  anmerkungen: string;
}) {
  const row = (label: string, value: string, preLine = false) => `
    <tr>
      <td style="padding:10px 0; color:#dc3b76; font-size:13px; letter-spacing:0.02em; text-transform:uppercase; vertical-align:top; width:38%;">${label}</td>
      <td style="padding:10px 0; font-size:16px; color:#4a1030; ${preLine ? "white-space:pre-wrap;" : ""}"><strong>${escapeHtml(value)}</strong></td>
    </tr>
    <tr><td colspan="2" style="border-bottom:1px solid #ffd6e6;"></td></tr>
  `;

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; background:#fff5f7; padding:32px 16px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; box-shadow:0 10px 40px rgba(246,85,139,0.18);">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:32px; margin-bottom:4px;">💌</div>
        <h1 style="margin:0; color:#dc3b76; font-size:22px; font-weight:600;">Eva hat euer Date bestätigt</h1>
      </div>
      <table style="width:100%; border-collapse:collapse;">
        ${row("Aktivität", v.activity)}
        ${row("Wunschtermin", v.wunsch)}
        ${row("Ausweichtermin", v.ausweich)}
        ${row("Anmerkungen", v.anmerkungen, true)}
      </table>
      <p style="margin-top:24px; font-size:12px; color:#a56680; text-align:center;">
        Automatisch generiert von deiner Date-Seite.
      </p>
    </div>
  </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
