# NOVA — Full-Stack Project Management Platform

NOVA is a collaborative project management platform built with Next.js 15 (App Router), React 19, TypeScript, PostgreSQL, and Prisma.

It structures team work into **Workspaces → Projects → Tasks**, with server-enforced role-based access control, rotating refresh tokens, and an activity trail that records every change.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Request Lifecycle](#request-lifecycle)
- [Database & Migrations](#database--migrations)
- [Authentication & Security](#authentication--security)
- [Authorization & RBAC](#authorization--rbac)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Setup & Seed](#local-setup--seed)
- [Docker Setup](#docker-setup)
- [Available Scripts](#available-scripts)
- [Automated Testing](#automated-testing)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

NOVA is a portfolio project covering the full vertical of a real application: authentication, multi-tenant authorization, a relational data model, transactional writes, and a typed API client. It deliberately runs as a single deployable Next.js unit with no separate backend service.

---

## Features

- **Auth lifecycle** — short-lived access token held in JavaScript memory, refresh token in an `HttpOnly` cookie, transparent single-flight refresh and 401 replay.
- **Workspace tenancy** — every read and write resolves the full `User → Workspace → Project → Task` chain on the server.
- **Roles** — three ordered roles (`OWNER` > `ADMIN` > `MEMBER`) with a single rank table driving every check.
- **Projects** — create, edit, search, and archive. Archiving is a status change, so history is never destroyed.
- **Kanban board** — four task columns with native HTML5 drag-and-drop, plus a list view.
- **Tasks** — status, priority, due date, assignee, labels, and free-text search/filtering.
- **URL-synchronized state** — filters and the open task are reflected in the query string, so a board view is linkable and survives a reload.
- **Comments** — per-task threads; authors edit their own, workspace admins can moderate any.
- **Activity timeline** — an audit log of project, task, membership, and comment events.
- **In-app notifications** — generated for assignments, comments, and completions, with an unread count and deep links.
- **Theme modes** — dark, light, and system.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 15 (App Router) | Route Handlers and middleware in one deployable |
| UI | React 19, TypeScript, Tailwind CSS 3 | Typed components, utility styling with no runtime CSS |
| Motion & icons | Framer Motion, Lucide React | Transitions and consistent iconography |
| Data | PostgreSQL 16, Prisma 5 | Relational integrity, cascades, migrations |
| Auth | `jsonwebtoken`, `bcryptjs` | Asymmetric signing secrets, slow password hashing |
| Validation | Zod | Runtime validation of every request body and query |
| Testing & linting | Jest, ts-jest, Oxlint, `tsc` | 92 tests, strict types, fast lint |

---

## Architecture

```text
Browser (React 19, typed API client in lib/api/client.ts)
   │  same-origin fetch, cookies attached, Bearer access token
   ▼
Next.js middleware (Edge)          ← cookie presence only, no JWT verification
   ▼
Route Handlers (app/api/**)       ← Zod validation, HTTP status mapping
   ▼
Services + permission guards      ← all business rules and authorization
   ▼
Prisma client
   ▼
PostgreSQL
```

### Design decisions

1. **One deployable.** No Express server, no microservice, no separate realtime daemon. The App Router covers the whole backend surface, which keeps the local and production topologies identical.

2. **Access token in memory, refresh token in a cookie.** The access token is never written to `localStorage` or `sessionStorage`, so an XSS payload cannot read it from persistent storage. The refresh token is `HttpOnly`, so JavaScript cannot read it at all. This narrows the blast radius; it is not a guarantee against XSS.

3. **Single-flight refresh.** When an access token expires during several concurrent requests, the client issues *one* refresh call and replays the waiting requests against the fresh token, rather than rotating the refresh token N times and invalidating each other.

4. **Authorization is never client-side.** Every service resolves the ownership chain itself. A resource belonging to another workspace returns `404`, not `403`, so response codes cannot be used to enumerate valid ids.

5. **Collaborations write atomically.** A task update and its activity entries and notifications are committed in one Prisma transaction, so the timeline can never disagree with the state it describes.

---

## Request Lifecycle

Each route is deliberately thin. A representative task update:

```text
app/api/tasks/[taskId]/route.ts
  ├─ Zod parse body                      → 422 on invalid input
  ├─ getCurrentUser(req)                 → 401 on a bad/expired access token
  └─ updateTask(taskId, user.id, data)   lib/tasks/task.service.ts
       ├─ requireTaskAccess()            → 404 if the task is out of reach
       ├─ requireValidAssignee()         → 422 if the assignee is not a project member
       └─ prisma.$transaction(...)
            ├─ update the task row
            ├─ logActivity()             → timeline entry
            └─ createNotification()      → in-app notification
```

Services own the rules; routes only translate HTTP to a service call and back.

---

## Database & Migrations

The schema lives in `prisma/schema.prisma` and uses the `citext` extension for case-insensitive email matching.

Migrations are committed under `prisma/migrations/`.

```bash
npx prisma migrate dev    # development
npx prisma migrate deploy # CI / production — never migrate dev in production
```

Key relations: a `Workspace` owns `Project`s and `WorkspaceMember` rows; a `Project` owns `Task`s, `ProjectMember` rows, and `Activity`; a `Task` owns `TaskComment`, `TaskLabel`, and `Notification` rows. Deleting a task or project cascades to its dependants.

---

## Authentication & Security

| Concern | Implementation |
|---------|----------------|
| Passwords | `bcryptjs`, 12 salt rounds |
| Access token | 15m default, `JWT_ACCESS_SECRET`, payload carries `type: 'access'` |
| Refresh token | 7d default, `JWT_REFRESH_SECRET`, unique `jti` per token |
| Token storage | Only the SHA-256 hash of the refresh token is stored, in `RefreshToken` |
| Rotation | A single conditional `updateMany` claims the old row and issues a new one in one transaction, so a replayed token finds nothing to claim |
| Cookie | `HttpOnly; SameSite=Lax; Path=/`, plus `Secure` when `NODE_ENV=production` |
| Logout | The stored hash is deleted, so the token is dead server-side and not merely cleared from the browser |
| Timing | Login compares against a real bcrypt hash even when the email is unknown, so response time does not reveal account existence |
| Rate limiting | Per-IP fixed-window limits on login, register, and refresh |
| Validation | Zod on every body and query parameter, with trimming and length bounds |
| Errors | Only `AppError` messages reach the client; anything unexpected returns a generic message |

Access and refresh tokens are signed with **different secrets** and carry a `type` claim, so a refresh token cannot be replayed as an access token and vice versa.

---

## Authorization & RBAC

Roles are ordered by one table, `roleRank()` in `lib/workspaces/permissions.ts`.

| Capability | OWNER | ADMIN | MEMBER |
|------------|:-----:|:-----:|:------:|
| View workspace, projects, and tasks | Yes | Yes | Yes |
| Create projects and tasks | Yes | Yes | Yes |
| Update and move tasks | Yes | Yes | Yes |
| Post comments | Yes | Yes | Yes |
| Edit own comments | Yes | Yes | Yes |
| Delete any comment | Yes | Yes | No |
| Manage project settings and members | Yes | Yes | No |
| Change member roles | Yes | Yes | No |
| Grant or revoke the OWNER role | Yes | No | No |

Workspace membership and project membership are separate. A project member must also be a workspace member, and an assignee must be a member of the specific project.

---

## Project Structure

```text
app/
  api/            Route Handlers: auth, workspaces, projects, tasks, comments, notifications, health
  dashboard/      Workspace overview
  projects/[id]/  Board, list view, task inspector
  login/  register/
components/
  auth/           AuthProvider, login and register forms
  board/          Board shell and columns
  tasks/          Task card, board, detail panel, dialogs
  projects/       Project cards and dialogs
  comments/  notifications/  workspace/  layout/  ui/  sections/  home/
data/             Static marketing content
docs/screenshots/ Screenshot guidelines and images
lib/
  activity/       Audit trail writer
  api/            Browser API client (token store, refresh, retry)
  auth/           JWT, passwords, cookies, refresh rotation, session
  comments/  labels/  notifications/
  db/             Prisma singleton
  projects/       Project service and project permission guards
  tasks/          Task service and task permission guards
  workspaces/     Workspace permission guards and member management
  validations/    Zod schemas
  errors.ts       AppError and the client-safe error envelope
  rate-limit.ts   Per-instance fixed-window limiter
prisma/           schema.prisma, migrations, seed.ts
tests/            Jest suites
types/            Shared serialised API types
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://nova:...@localhost:5433/nova?schema=public` |
| `JWT_ACCESS_SECRET` | Access token signing secret (≥ 32 chars) | required |
| `JWT_REFRESH_SECRET` | Refresh token signing secret, must differ from the access secret | required |
| `JWT_ACCESS_TTL` | Access token lifetime | `15m` |
| `JWT_REFRESH_TTL` | Refresh token lifetime | `7d` |
| `NEXT_PUBLIC_SITE_URL` | Canonical application URL | `http://localhost:3000` |

The app fails fast with a named error if either secret is missing, rather than signing tokens with an empty key.

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Local Setup & Seed

**Prerequisites:** Node.js 24, and Docker (for PostgreSQL only).

```bash
npm install
docker compose up -d postgres
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000.

The seed uses deterministic ids and upserts, so running it repeatedly updates records instead of duplicating them.

| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@nova.demo` | `NovaDemo123!` |
| Admin | `admin@nova.demo` | `NovaDemo123!` |
| Member | `member@nova.demo` | `NovaDemo123!` |

These accounts exist only in the development seed.

---

## Docker Setup

`docker-compose.yml` defines three services: `postgres`, a one-shot `migrate` runner, and `web`.

```bash
cp .env.docker.example .env.docker   # add both JWT secrets
docker compose up -d --build
```

- `localhost:3000` — the application
- `localhost:5433` — PostgreSQL (container port 5432)

`web` waits for `migrate` to exit successfully, so the app never starts against an un-migrated database. The `runner` stage executes the Next.js standalone build as a non-root user.

Data lives in the `nova_postgres_data` volume. `docker compose down` preserves it; `docker compose down -v` deletes it.

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm test` | Full Jest suite |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run test:smoke` | Smoke suite only |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Oxlint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:validate` | Validate the schema |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run db:seed` | Run the seed |
| `npm run docker:up` / `docker:down` / `docker:logs` | Container lifecycle |

---

## Automated Testing

92 tests across 7 suites, run in CI on every push and pull request to `main`.

```bash
npm test
```

| Suite | Covers |
|-------|--------|
| `auth.test.ts` | Password hashing, JWT signing and verification, token type and secret separation, SHA-256 hashing, atomic refresh claim, rejection of tampered and cross-type tokens |
| `auth-subscriber.test.ts` | API client in-memory token handling and the auth-failure listener pub/sub |
| `permissions.test.ts` | Role ranking and the project/owner permission predicates |
| `validations.test.ts` | Zod schemas for auth, projects, tasks, comments, and workspace members |
| `labels.test.ts` | Zod schemas for workspace labels |
| `errors.test.ts` | `getErrorMessage` across errors, plain objects, and browser events |
| `smoke/smoke.test.ts` | End-to-end logic paths that must not regress |

There is no browser E2E suite.

---

## Deployment

Targets any platform that runs Next.js with a managed PostgreSQL instance.

1. Run `npx prisma migrate deploy` as a release step.
2. Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to distinct random values.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.

`Secure` is added to the refresh cookie automatically when `NODE_ENV=production`, so the app must be served over HTTPS.

---

## Screenshots

See [docs/screenshots/README.md](docs/screenshots/README.md) for the landing page, dashboard, board, task inspector, member roster, and notifications.

---

## Known Limitations

- **No realtime.** There are no WebSockets or server-sent events. Notifications and activity are read on demand; a change made by another user appears after the next fetch or reload.
- **Rate limiting is per process.** Counters live in the memory of a single Node instance, so they do not coordinate across replicas. A shared store such as Redis would be required to scale horizontally.
- **No file attachments.** Tasks support text descriptions, labels, and comments only.
- **No full-text search.** Filtering uses case-insensitive substring matching (`ILIKE`), not a PostgreSQL full-text index or trigram index.
- **Task ordering.** A task moved into a new column is appended to the end of that column. There is no fractional position reordering within a column.
- **No workspace deletion.** Workspaces are created at registration and cannot currently be removed from the UI.
- **No email delivery.** Invitations add an existing account by email address; no message is sent.

---

## License

MIT — see [LICENSE](LICENSE).
