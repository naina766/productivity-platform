# NOVA — Productivity Platform

A full-stack collaborative project management platform for teams. NOVA lets you
organize work into **workspaces → projects → tasks** with role-based access,
shared boards, live-style collaboration (comments + activity feeds), and
in-app notifications — wrapped in a clean, accessible dark-first UI.

## Features

- **Workspaces & roles** — every workspace has `OWNER`, `ADMIN`, and `MEMBER`
  roles that gate what each member can see and do.
- **Projects** — full lifecycle (`PLANNING` → `ACTIVE` / `ON_HOLD` →
  `COMPLETED` / `ARCHIVED`), priorities, member management, and search.
- **Tasks** — board & list views, drag-reorder, filtering, search, assignees,
  labels, due dates, priorities, and statuses (`TODO`, `IN_PROGRESS`,
  `IN_REVIEW`, `DONE`).
- **Collaboration** — comments on tasks, an activity timeline for every
  project, and in-app notifications for assignments and new comments.
- **Authentication** — email + password with bcrypt hashing, a signed JWT
  access token held in memory, and an HttpOnly rotating refresh cookie.
- **Sharing** — filter/URL state (`?status=&priority=&assignee=&search=` and
  task deep links `?task=`) so views are shareable between teammates.
- **Theming** — dark/light/system themes with a green/lime/teal palette.

## Architecture

| Layer     | Technology |
|-----------|------------|
| App       | Next.js 15 (App Router), React 19, TypeScript |
| API       | Next.js Route Handlers (`app/api/**`) |
| Data      | PostgreSQL via Prisma ORM |
| Auth      | JWT access token (in memory) + HttpOnly refresh cookie with rotation |
| Validation | Zod |
| Styling   | Tailwind CSS 3, Framer Motion, Lucide icons |
| Linting   | Oxlint (`oxlint`) |

The app is intentionally a single Next.js deployable — no separate API server,
no realtime socket service, no external notification provider. Everything runs
through authenticated Route Handlers with server-side authorization checks on
every read and write.

### Authorization model

```
Authenticated user
  └─ Workspace member ──► PROJECT —► TASK ──► comment / activity / notification
```

- Page routes are guarded in `middleware.ts`; every API route independently
  verifies the session via `getCurrentUser(req)`.
- Project/task reads verify workspace **and** project membership, so ID
  manipulation never leaks another workspace's data (IDOR-safe).
- Notifications are always scoped to the session user.
- Comments: any project member can post; only the author can edit; the author
  or a workspace `ADMIN`/`OWNER` can delete.
- Passwords are bcrypt-hashed; JWT secrets never reach the client.

## Getting Started

Requirements: **Node.js ≥ 20** and a running **PostgreSQL** instance.

```bash
cp .env.example .env.local      # then fill in real values (see below)
npm install
npm run prisma:generate         # generate the Prisma client
npm run prisma:migrate -- --name init   # create & apply the baseline migration
npm run db:seed                 # optional: demo data
npm run dev                     # http://localhost:3000
```

> **Note on migrations:** this repository does not commit `prisma/migrations/`
> — the baseline is created by your first `prisma:migrate`. Point
> `DATABASE_URL` at a fresh database before running it.

### Environment variables (`.env.local`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://USER:PASS@localhost:5432/nova?schema=public` |
| `JWT_ACCESS_SECRET` | ≥ 32-char random secret for access tokens |
| `JWT_REFRESH_SECRET` | ≥ 32-char random secret for refresh tokens |
| `JWT_ACCESS_TTL` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_TTL` | Refresh token lifetime (default `7d`) |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for metadata (`http://localhost:3000`) |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | Oxlint |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:migrate` | Create/apply DB migrations (`migrate dev`) |
| `npm run db:seed` | Seed demo data (`tsx prisma/seed.ts`) |

## Project Structure

```
app/
  api/            Route handlers: auth, workspaces, projects, tasks,
                  members, comments, notifications, activity
  login|register  Auth pages
  dashboard/      Workspace dashboard (projects + search + notifications)
  projects/[id]/  Project page (board/list, filters, members, details panel)
components/       Auth, projects, tasks, comments, activity, notifications
lib/
  auth/           Session + JWT logic
  projects|tasks|comments|activity|notifications   Service layers + perms
  api/client.ts   Typed fetch wrapper used by the UI
prisma/           Schema + seed
public/           Static assets
```