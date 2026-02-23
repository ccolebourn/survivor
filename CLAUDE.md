# Survivor 50 — Claude Code Instructions

## Project Overview
Fantasy draft game for Survivor Season 50. Players join groups, rank all 24 castaways before a snake draft, then track survivors throughout the season.

## Commands

```bash
# Dev server (Turbopack)
/c/Users/coleb/.bun/bin/bun run dev

# Run tests
/c/Users/coleb/.bun/bin/bun run test

# Build
/c/Users/coleb/.bun/bin/bun run build
```

> **Important:** `bun` is NOT in the system PATH. Always use the full path `/c/Users/coleb/.bun/bin/bun`.

## Architecture

### Framework
- **Next.js 16.1.6** with App Router and Turbopack
- **React 19** — server components by default; add `"use client"` only when needed
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (not v3 config style)

### Route Groups
- `src/app/(auth)/` — public routes (`/login`, `/signup`)
- `src/app/(app)/` — protected routes (all require session); layout at `src/app/(app)/layout.tsx`
- `src/app/api/auth/[...all]/` — BetterAuth API handler

### Route Protection
`src/proxy.ts` is the Next.js 16 replacement for `middleware.ts`. It exports a `proxy()` function (not a default export named `middleware`). Do **not** create or edit `middleware.ts`.

### Authentication
BetterAuth 1.4.18 configured in `src/lib/auth.ts`:
- Email/password only — no social providers
- All BetterAuth table columns mapped to `snake_case` via `fields` config
- Client helpers (signIn, signUp, signOut, useSession) exported from `src/lib/auth-client.ts`

### Database
- Raw SQL via `pg` Pool — **no ORM**
- All table and column names must be `snake_case`
- **Never run SQL directly.** Create `.sql` files in `db/` and the user will execute them
- Connection pool exported from `src/lib/db.ts`

### Email
Brevo API via `src/lib/email.ts`. API key in `.env.local` as `BREVO_API_KEY`.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | BetterAuth server config |
| `src/lib/auth-client.ts` | BetterAuth React client |
| `src/lib/db.ts` | pg Pool |
| `src/lib/types.ts` | Shared TypeScript types |
| `src/lib/group-context.tsx` | React context for active group |
| `src/lib/group-actions.ts` | Group CRUD & membership queries |
| `src/lib/group-status-actions.ts` | Group status transitions |
| `src/lib/draft-algorithms.ts` | Snake draft order algorithm |
| `src/lib/draft-actions.ts` | Draft execution logic |
| `src/lib/survivor-actions.ts` | Survivor ranking/draft queries |
| `src/lib/invite-utils.ts` | Invitation token logic |
| `src/lib/email.ts` | Brevo email sending |
| `src/lib/admin-actions.ts` | Admin-only operations |
| `src/proxy.ts` | Route protection (replaces middleware.ts) |
| `src/components/navbar.tsx` | Top navigation bar with group selector |
| `src/components/group-selector-modal.tsx` | Group switcher modal |
| `src/components/survivor-card.tsx` | Survivor card component |

## Database Schema

### BetterAuth tables (managed by BetterAuth)
`user`, `session`, `account`, `verification`

### App tables (`db/002_app_tables.sql`)
- **`survivors`** — id, season, name, age, home_town, previous_seasons, image_path, week_eliminated, eliminated_at, created_at
- **`groups`** — id, name, admin_user_id, status (enum), draft_scheduled_at, created_at
- **`group_members`** — group_id, user_id, role (player|admin), joined_at — PK: (group_id, user_id)
- **`invitations`** — id, group_id, email, token (unique), status (pending|accepted|expired), created_at
- **`ranked_survivors`** — group_id, player_id, survivor_id, rank — PK: (group_id, player_id, survivor_id)
- **`draft_order`** — group_id, player_id, rank — PK: (group_id, player_id)
- **`drafted`** — group_id, player_id, survivor_id, round_drafted, rank_drafted, is_free_agent_pick — PK: (group_id, player_id, survivor_id); UNIQUE: (group_id, survivor_id)

### Group status enum
`signup` → `draft_order_posted` → `draft_complete` → `in_progress` → `complete`

## Conventions

- **snake_case** for all DB identifiers
- **No ORM** — write raw SQL queries
- **Server components by default** — only use `"use client"` when React hooks or browser APIs are needed
- **`useSearchParams()`** must be wrapped in a `<Suspense>` boundary or the build fails
- **Survivor images** hosted locally in `public/survivors/` (not fetched from external URLs)
- **Tests** go in `tests/` folder, use Jest + ts-jest, test algorithms only (not UI)
- **No direct DB access** — create SQL migration files in `db/` with sequential numeric prefix (e.g. `006_...sql`)

## Environment Variables (.env.local)
```
DATABASE_URL=postgresql://postgres:admin@localhost:5432/survivor50
BETTER_AUTH_SECRET=<min 32 chars>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BREVO_API_KEY=<brevo key>
EMAIL_FROM=noreply@vividcal.com
```

## Game Rules (for context)
1. **Signup phase:** Admin creates a group, invites players by email. Players rank all 24 survivors.
2. **Draft order:** Admin posts draft order — algorithm assigns rank 1–N to each player.
3. **Snake draft:** Round 1 picks rank 1→N; Round 2 picks N→1; alternating. Each pick selects the player's highest-ranked available survivor (random fallback if none ranked).
4. **Game phase:** Weekly survivor eliminations. Players whose survivors are all eliminated are out.
5. **Free agent picks:** When a player loses a survivor mid-game and un-drafted survivors remain, they may claim one.
6. **Winner:** Last player with a non-eliminated survivor.
