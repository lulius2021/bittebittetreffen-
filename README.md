# Für Eva 💌

Eine kleine, einseitige "Date-Anfrage"-Website als Überraschung.
Next.js (App Router) + Tailwind CSS, deploybar auf Vercel.
Der Mailversand läuft über [Resend](https://resend.com) in einer Serverless API-Route.

---

## Ablauf der Seite

1. **Lock-Screen** im iPhone-Stil – Passcode ist die Antwort auf die Frage (aktuell `3`).
2. **Begrüßung** nach dem Entsperren.
3. **Formular in 4 Schritten**: Aktivität → Termin → Ausweichtermin → Anmerkungen.
4. **Bestätigungs-Ansicht** (absichtlich trocken-förmlich als Gag).
5. Beim Absenden geht **eine E-Mail an dich** (nicht an Eva).

---

## Texte anpassen

- **Lock-Screen-Frage & Antwort**: `app/components/LockScreen.tsx` (`CORRECT_ANSWER`) und der Fragen-Text ebenda.
- **Begrüßung, Schritt-Titel, Bestätigungs-Text**: `app/components/DateFlow.tsx` → das `TEXT`-Objekt oben.
- **Aktivitäten**: `ACTIVITIES` in `app/components/DateFlow.tsx`.
- **Kalender-Regeln / gesperrte Tage**: `app/components/calendar-data.ts`.
- **E-Mail-Text/Layout an dich**: `app/api/send/route.ts` — dort sind Betreff, Text-Fallback und die `renderHtml`-Funktion.

---

## 1. Resend-Konto einrichten

1. Auf [resend.com](https://resend.com) **mit `juliusdeusch@gmail.com` registrieren** — genau diese Adresse musst du nehmen, weil der Absender `onboarding@resend.dev` im Testmodus nur an die Anmelde-Adresse deines Kontos zustellt.
2. Unter **API Keys** einen Key erstellen (Rechte: "Sending access").
3. Key kopieren (er wird nur einmal angezeigt).

## 2. Environment Variables lokal setzen

```bash
cp .env.example .env.local
```

Und in `.env.local` eintragen:

```env
RESEND_API_KEY=re_dein_echter_key
RECIPIENT_EMAIL=juliusdeusch@gmail.com
```

> Der echte Key gehört **nie** in den Code oder ins Git-Repo. `.env.local` ist bereits in `.gitignore`.

## 3. Lokal testen

```bash
npm install
npm run dev
```

- [http://localhost:3000](http://localhost:3000) öffnen.
- Passcode `3` eingeben → Formular durchklicken → "Date bestätigen".
- Innerhalb weniger Sekunden sollte die Mail in deinem Gmail-Postfach landen.
- Falls nichts ankommt:
  - Terminal-Output prüfen — Fehler von Resend werden dort geloggt.
  - Sicherstellen, dass das Resend-Konto tatsächlich mit `juliusdeusch@gmail.com` erstellt wurde (im Testmodus geht sonst keine Mail durch).
  - `.env.local` speichern und `npm run dev` neu starten (Env-Variablen werden nur beim Start gelesen).

## 4. Build-Check

Vor dem Deploy stellst du sicher, dass alles compiliert:

```bash
npm run build
```

Muss ohne Fehler durchlaufen (getestet ✅).

## 5. Deploy auf Vercel

1. Repo initialisieren + auf GitHub pushen:
   ```bash
   git init && git add . && git commit -m "initial"
   # dann in GitHub ein neues Repo anlegen und pushen
   ```
2. Auf [vercel.com](https://vercel.com) → **Add New… → Project** → das GitHub-Repo importieren.
3. Framework wird als **Next.js** erkannt; Build-Settings unverändert lassen.
4. Im Import-Screen unter **Environment Variables** eintragen:
   - Key: `RESEND_API_KEY`    · Value: dein echter Resend-Key
   - Key: `RECIPIENT_EMAIL`   · Value: `juliusdeusch@gmail.com`
   (Environments: mindestens "Production" ankreuzen; "Preview" schadet nicht.)
5. **Deploy** klicken.

> Env-Variablen später ändern: Vercel → Projekt → **Settings → Environment Variables**. Nach einer Änderung einmal neu deployen (Deployments → ⋯ → Redeploy).

Die Seite läuft dann unter `https://<projekt>.vercel.app`. Custom-Domain optional in **Settings → Domains**.

---

## Tech-Notizen

- **Kein Backend-Storage**: Es wird nichts gespeichert – die Antwort geht direkt per Mail.
- **Fehlerhandling beim Mailversand**: Schlägt der Versand fehl, sieht Eva trotzdem die Bestätigungs-Ansicht. Der Fehler wird nur serverseitig geloggt (Vercel-Logs unter Deployments → ⋯ → Runtime Logs).
- **Doppel-Absenden**: Der "Date bestätigen"-Button wird nach dem Klick deaktiviert.
- **Passcode-Prüfung**: bewusst rein clientseitig – kein echter Sicherheitsanspruch.

---

## Kalender-Regeln (Stand 15.09.2026)

Alles konfigurierbar in `app/components/calendar-data.ts`:

- Auswählbarer Zeitraum: **15.09.2026 – 30.10.2026**
- Stumm gesperrt: 25./26./27.09 sowie 31.10
- Berufsschul-Tage (mit Label, gesperrt): 15.–18.09, 22.–24.09, 29./30.09, 01./02.10
- Freitage mit BS vormittags (nur "Vormittags" gesperrt): 19.09, 03.10
