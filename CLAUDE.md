# CLAUDE.md — cleaning-checklist

## Overview

Digital property cleaning checklists for oAZis vacation rentals. Cleaners select a property, work through a checklist with collapsible sections, check off items, add notes per section, and submit. On submit, an email summary is sent to admin@oazisproperties.com highlighting any incomplete items and notes.

## Live URLs

- **Vercel:** https://cleaning-checklist-orcin.vercel.app
- **Custom domain:** checklist.oazis.properties
- **GitHub:** https://github.com/oazisproperties/cleaning-checklist

## Tech Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Resend for email
- Slack Incoming Webhooks (Block Kit messages) for #cleaning channel notifications
- Vercel deployment
- oAZis brand theming (Teal #5FB8AD, Orange #D4874D, Cream #F5F1EB, Playfair Display headings)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for sending summary emails |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for #cleaning channel (optional — skipped if not set) |

## Properties & Checklists

All checklist data is hardcoded in `src/lib/checklists.ts` (transcribed from PDF cleaning lists).

| Property | Slug | Sections |
|----------|------|----------|
| Canyon View | canyon-view | Products/Methods, General, Kitchen, Bath 1, Bath 2, Vacuum, Re-set, Refill/Replenish, Additional Tasks |
| Diamond | diamond | Products/Methods, Kitchen, Miscellaneous, ½ Bath, Bath 1-5, Bedrooms, Quick Checks, Additional Tasks |
| Panorama | panorama | Products/Methods, Kitchen, Miscellaneous, Bath 1, Bath 2/3, Bath 4, Bath 5, Bedrooms, Quick Checks, Additional Tasks |

## Key Files

- `src/app/page.tsx` — Property selection with 3 big buttons (Canyon View, Diamond, Panorama)
- `src/app/[property]/page.tsx` — Checklist page (client component). Sections collapsed by default — cleaners expand the room they're working in. Checkboxes, per-section notes, completion counts, and fixed submit button at bottom.
- `src/app/api/submit/route.ts` — POST handler builds HTML email (incomplete sections first, completed sections last) and sends via Resend. Also posts a Block Kit summary to #cleaning Slack channel. Resend client initialized inside handler to avoid build-time crash.
- `src/lib/checklists.ts` — All checklist data. `getChecklist(slug)` returns the checklist for a property.

## Email Summary

- **To:** admin@oazisproperties.com
- **From:** oAZis Properties <onboarding@resend.dev>
- **Subject:** "Cleaning Complete — {Property} ({date})"
- **Content:** Per-section breakdown showing completion count, incomplete items (highlighted in orange), and any notes. Sections with incomplete items appear first; fully completed sections at the bottom.

## Slack Notification

On submit, a Block Kit message is posted to the #cleaning Slack channel with:
- Header: "Cleaning Complete — {Property}"
- Completion summary (X/Y items) and date/time
- List of incomplete items (if any, capped at 20)
- Notes from any section (if any)

Gracefully skipped if `SLACK_WEBHOOK_URL` is not configured.

## Commands

```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build
npm run lint     # ESLint
```
