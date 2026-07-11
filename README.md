# HR Work Tracker

A premium internal productivity platform for Alfalah Investments HR professionals to log daily work, analyze productivity, and generate intelligent reports.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** — dark, glassmorphism design system
- **Framer Motion** — page/component animation
- **Recharts** — analytics charts
- **Lucide React** — icons
- **Zustand** — client state (auth, UI)
- **Supabase** — auth + Postgres database with row-level security

## Quick start (local development)

```bash
npm install
cp .env.example .env   # then fill in your Supabase project values (see below)
npm run dev
```

Open http://localhost:5173. You'll see the splash screen, then the login page. You need a Supabase project connected (next section) before you can sign up and use the app.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough).
2. Open the **SQL Editor** in your Supabase dashboard, paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. This creates:
   - `profiles` — one row per user, auto-created by a trigger when someone signs up
   - `work_categories` — pre-seeded with 9 default HR categories (Recruitment, Onboarding, Employee Relations, etc.)
   - `work_logs` — the core work-entry table
   - `notifications`
   - Row-level security policies on every table, scoped to `auth.uid()`, so users only ever see their own data
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
4. (Optional) Under **Authentication → Providers → Email**, toggle "Confirm email" off if you want to skip email confirmation during internal testing.
5. Verify the migration worked: **Table Editor → work_categories** should show 9 rows.

## 2. Environment variables

Create a `.env` file (or set these in your hosting provider) with:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

Both are required — the app renders a warning banner on the login screen if either is missing, and all data operations will fail without them. No other environment variables are needed; there are no server-side secrets since Supabase's anon key is safe for client-side use (access is enforced by RLS policies, not by keeping the key secret).

## 3. Deploy to Vercel

1. Push this project to a GitHub repository (or import the folder directly in Vercel).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects **Vite**: build command `vite build` (via `npm run build`, which also type-checks), output directory `dist`. Leave the defaults.
4. Add the two environment variables from step 2 (Project Settings → Environment Variables — set them for **Production**, **Preview**, and **Development**).
5. Deploy. `vercel.json` in this repo adds the SPA rewrite rule Vercel needs so client-side routes (e.g. `/dashboard`, `/calendar`) don't 404 on refresh.
6. Once live, open the URL, sign up a user, and you're in — the Supabase trigger creates their profile automatically.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

## Project structure

```
src/
  components/
    ui/          reusable primitives (Button, Card, Modal, Input, ...)
    layout/      app shell (Sidebar, Topbar, routing guard)
    charts/      Recharts-based analytics visualizations
    dashboard/   dashboard-specific widgets
    work/        work-log specific components (Quick Add, timeline items)
    common/      Logo, animated counter, empty state
  pages/         one file per route (Dashboard, Calendar, Reports, ...)
  hooks/         Supabase data hooks (work logs, categories, notifications, timer)
  store/         Zustand stores (auth, UI)
  lib/           Supabase client, types, analytics + AI insight engine, chart colors, CSV export
supabase/
  migrations/    SQL schema + RLS policies
```

## Features

- Animated splash screen → glassmorphism login (Supabase email/password auth)
- Dashboard with live stats, productivity trend, category breakdown, recent activity, AI insight preview
- Quick Add modal, Daily Timeline, and a persistent Task Timer (start/stop survives refresh)
- Calendar with per-day drill-down
- Weekly & Monthly Analytics: time by category, week/month-over-week comparison, activity heatmap, most common/longest task, average duration
- AI Insights: rule-based recommendations generated from your own logged data (productive days, trends, overload detection, streaks, etc.)
- Reports with CSV export
- Global search, notifications center, profile, and settings (daily goal, timezone, sidebar preference)
