# JanVaani — Voice of the People

A multilingual AI platform where citizens raise development issues (voice, text,
or photo, in English/Hindi/Telugu), and an MP's office sees them consolidated
into a ranked, explainable priority list — combining citizen demand with ward
demographics and infrastructure-gap data, and comparing citizen requests against
formal development-plan proposals side by side.

All ward names, demographics, and submissions in the seed data are **synthetic** —
invented for this demo, not a real constituency.

## Setup

```bash
npm install
```

Add your Gemini API key to `.env` (created for you already — just fill it in):

```
GEMINI_API_KEY="your-key-from-https://aistudio.google.com/apikey"
```

Without a key, the app still runs end-to-end using a small offline keyword-based
fallback analyzer instead of Gemini — useful for development, not for the real
demo.

Add a Postgres connection string to `.env` as `DATABASE_URL` — from a Vercel
Postgres/Neon database (Vercel dashboard → Storage tab) or any Postgres host —
then set up the database and load the demo dataset:

```bash
npx prisma migrate dev
npm run seed
```

`npm run seed` calls Gemini once per seed submission (48 of them) so the demo
data is genuinely AI-classified/translated, not hand-labeled. **Gemini's free
tier is rate-limited to a handful of requests/minute**, so the seed script
processes one at a time and automatically backs off on 429s using the delay the
API reports — expect it to take several minutes the first time. Re-running
`npm run seed` wipes and reloads all data.

Then:

```bash
npm run dev
```

- `/` — citizen submission portal
- `/dashboard` — MP dashboard

## How it works

**Intake.** Citizens submit via a chat-style portal in English, Hindi, or Telugu
— typed, voice-recorded (browser `MediaRecorder`), or a photo. Every submission
(whatever mix of text/audio/photo it contains) goes to Gemini in a single
multimodal call that returns structured JSON: detected language, an English
translation/transcript, a category (education, healthcare, roads, water,
electricity, employment & vocational, housing, agriculture, public safety,
other), an urgency score (1–5), sentiment, and a one-line summary.

**Clustering.** Analyzed submissions are grouped by `(category, ward)` — that
grouping *is* the "recurring theme in a location" the brief asks for. No
separate clustering model is needed because the AI-assigned category already
does the semantic grouping.

**Ranking.** Every cluster, and every formal development-plan proposal, is
scored the same way — a transparent, weighted sum, not a black-box model,
because an MP needs to be able to defend a priority order in public:

- **Demand** — recency-weighted count of citizen submissions (for a formal
  proposal, this is how many citizen submissions in the same category+ward
  actually back it)
- **Urgency** — average AI-assigned urgency of the submissions behind it
- **Need gap** — a category-specific formula over ward demographics/infra data
  (e.g. education: school enrollment vs. capacity + distance to nearest
  school; healthcare: distance to nearest hospital; water: % of households
  without piped water; employment: ward unemployment rate)

Cost is deliberately **not** baked into the score — it's shown alongside so
"priority" isn't quietly redefined as "cheapness." See `src/lib/ranking.ts` for
the exact formula and weights.

This is what lets the dashboard directly answer the brief's example: comparing
citizen requests for a school upgrade (high demand + real overcrowding data)
against a proposed vocational centre (however many citizens have actually
asked for it, plus the ward's unemployment rate) — both land on the same
ranked list with a visible score breakdown, not two disconnected lists.

**Compare.** Selecting two items on the dashboard opens a side-by-side view of
their score breakdowns plus an optional AI-generated briefing paragraph
(Gemini, given only the structured scores — not free-form opinion).

## Stack

Next.js (App Router) + TypeScript + Tailwind, Prisma + Postgres (via the
`@prisma/adapter-neon` driver adapter, works with Vercel Postgres/Neon or any
Postgres host), Gemini (`@google/generative-ai`) for all NLP,
Leaflet/OpenStreetMap for the hotspot map, Recharts-free hand-built meters
following a validated accessible color palette (see `src/lib/categories.ts`
and `src/app/globals.css`).

## Known limitations (hackathon scope)
- WhatsApp/SMS intake is represented by a `channel` field and a chat-style UI,
  not a live Twilio/WhatsApp Business API integration.
- Photos/voice clips are stored inline as base64 data URLs for demo
  simplicity — move to object storage (S3/Cloudinary/etc.) before scaling.
- No auth on `/dashboard` — add before exposing it beyond a demo.
