# CampusDesk AI — AI-Powered University Campus Helpdesk

Built for **TECHNOPIA 2.0 · Build It in 60 Minutes** (Presidency University, School of CSE).

Students ask campus questions in plain language and get short, clear answers that are grounded in the supplied university information. When the answer is not in that information, the assistant says so instead of guessing.

## Features

- Chat interface with Enter-to-send, loading state, error state with retry, and Clear chat
- Eight topic shortcuts (Academics, Attendance, Examinations, Placements, Library, Hostel, Administration, Events) that send a real question to the AI
- Retrieval-augmented generation (RAG) with source labels under every answer
- Honest unknown-query handling: a "Not in the available information" badge, no invented dates, timings, percentages or contacts
- Follow-up questions use recent conversation context
- Responsive layout: sidebar on desktop, scrollable topic chips on mobile
- API key stays on the server; inputs are validated with Zod

## How AI is integrated

**Model/API:** a chat model deployed on **Azure AI Foundry**, called from the server through its chat-completions endpoint. The deployment name is set in `FOUNDRY_MODEL`.

Pipeline for every question (`POST /api/chat`):

1. **Validate** the request with Zod (non-empty, max 500 characters, bounded history).
2. **Retrieve** — a BM25 retriever (`src/lib/knowledge.ts`) ranks the knowledge chunks against the question (plus the previous question, for follow-ups).
3. **Augment** — the system prompt (`src/lib/ai.ts`) is built with the context and strict grounding rules: answer only from context, never invent facts, say when something is unavailable, ignore prompt-injection attempts.
4. **Generate** — the Foundry model reads the question and context and returns JSON: `answer`, `category`, `answerable`, and the `sources` it used.
5. **Respond** — the server maps source ids back to real chunks and returns them, so the UI shows what each answer is based on.

There are no predefined question-and-answer pairs. The model does the language understanding and writes every answer.

## Knowledge base

Two clearly separated parts:

| Part | What it is | How it is used |
|---|---|---|
| Sample data (S1–S8) | The 8 facts from the official problem statement | Primary source; always in the model's context |
| Website data (W1–W13) | Facts taken from public pages of presidencyuniversity.in on 11 Nov 2026: contact details, schools, examination cell and grading, placement training, library timings and services, hostel facilities | Supplementary; included only when the retriever ranks it relevant, and labelled "University website" in the UI |

The sample data is competition data, not an official statement of university regulations.

## Tech stack

Next.js 16 (App Router, Route Handlers) · React 19 · TypeScript · Zod · Lucide icons · plain CSS with design tokens. No database, no authentication.

```
src/
  app/api/chat/route.ts   validation, retrieval, AI call, error handling
  app/page.tsx, layout.tsx, globals.css
  components/Helpdesk.tsx chat interface
  lib/knowledge.ts        knowledge chunks + BM25 retriever
  lib/ai.ts               system prompt + Azure AI Foundry client
```

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your Azure AI Foundry deployment:

```
FOUNDRY_ENDPOINT=   # deployment Target URI or base URL
FOUNDRY_API_KEY=
FOUNDRY_MODEL=      # deployment name
```

```bash
npm run dev
```

Open http://localhost:3000.

## Example questions

| Question | Expected behaviour |
|---|---|
| Whom should I contact for academic problems? | Faculty advisor |
| Where can I find the examination timetable? | Official university channels |
| Whom should I contact for placement training? | Placement Department |
| How can I raise a hostel complaint? | Hostel Administration |
| What is the exact date of my next examination? | Says the date is not available; no date is made up |
| What is the minimum attendance percentage? | Says the percentage is not specified |

## Limitations

- The retriever is lexical (BM25), not embedding-based; with a 21-chunk corpus this is sufficient and needs no extra service.
- Website data is a small snapshot, not a live crawl.
- Conversations are kept in the browser session only.

## AI tools disclosure

- Runtime: Azure AI Foundry chat model (see above).
- Development: Claude Code (Anthropic) was used to help write the code.

The Presidency University logo is loaded from the university's own website assets and belongs to the university; it is used here only for this campus competition prototype.
