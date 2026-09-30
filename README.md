# NOVA — Premium Full-Stack Project Management Platform

NOVA is a high-performance, full-stack collaborative project management platform built with Next.js 15, React 19, TypeScript, PostgreSQL, and Prisma.

Designed for high-velocity teams, NOVA structures collaboration into **Workspaces → Projects → Tasks**, backed by enterprise-grade role-based access control (RBAC), atomic database operations, secure JWT authentication with refresh token rotation, project activity timelines, in-app notifications, and a refined dark-first aesthetic.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Database & Migrations](#database--migrations)
- [Authentication & Security](#authentication--security)
- [Authorization & RBAC](#authorization--rbac)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Local Setup & Seed](#local-setup--seed)
- [Available Scripts](#available-scripts)
- [Automated Testing](#automated-testing)
- [Deployment Readiness](#deployment-readiness)
- [Screenshots](#screenshots)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)
- [License](#license)

---

## Overview

NOVA delivers a focused, distraction-free productivity platform that mirrors the responsiveness and polish of modern developer tools. It provides complete workspace isolation, deterministic role hierarchies, real-time board interactivity, and comprehensive task lifecycle tracking without unnecessary third-party backend bloat.

---

## Features

- **Authentication Lifecycle**: In-memory JWT access tokens combined with secure, HttpOnly refresh cookies. Automated 401 retry handling ensures uninterrupted sessions with single in-flight refresh deduplication.
- **Workspace RBAC**: Tenancy isolation with three deterministic roles (`OWNER` > `ADMIN` > `MEMBER`) strictly validated on the server.
- **Member Management**: Invite team members by email, update permissions, and transfer roles while safeguarding workspace owner privileges.
- **Project Workflows**: Manage complete project lifecycles (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), set priority flags, assign members, and search instantaneously.
- **Interactive Kanban Board & List Views**: Drag-and-drop task boards and structured list views with optimistic UI updates and immediate status synchronization (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- **URL-Synchronized Filtering & Search**: Deep-linkable state preservation for status, priority, assignee, and search queries (`?status=`, `?priority=`, `?assignee=`, `?search=`) and direct task modal permalinks (`?task=`).
- **Task Detail Inspector**: Full task metadata editing, assignee selection from project members, date pickers, labels, comments feed, and audit timeline.
- **Task Comments**: Threaded task discussions with validated author-only editing and workspace admin moderation.
- **Project Activity Timeline**: Audit log recording project creation, task creation, status transitions, member assignments, and comments.
- **In-App Notifications**: Targeted notification feed for task assignments with unread counters, bulk mark-as-read controls, and deep-link routing.
- **Workspace Dashboard**: Centralized dashboard showcasing active project cards, quick metrics, due-date tracking, and team roster.
- **Design System & Theme Modes**: Dark, light, and system theme options powered by a tailored dark-mode palette (#050505 background, #111111 cards, emerald/lime/teal accents).

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 15 (App Router) | Unified React Server Components, Route Handlers, and client transitions |
| **Frontend** | React 19, TypeScript, Tailwind CSS 3 | Type safety, composable UI, and zero-runtime CSS styling |
| **Animations & Icons** | Framer Motion, Lucide React | Micro-interactions, smooth layout animations, clean iconography |
| **Database & ORM** | PostgreSQL 14+, Prisma ORM | Relational integrity, Citext case-insensitive indexing, cascade deletions |
| **Authentication** | In-memory JWT, HttpOnly Cookies, bcryptjs | Maximum XSS protection with CSRF-safe SameSite cookies |
| **Validation** | Zod | Runtime type validation for every API request body and form |
| **Testing & Quality** | `tsx --test` (Node test runner), Oxlint, TypeScript strict | Fast automated test execution and strict type safety |

---

## Architecture & Design Decisions

```text
Browser Client
   │
   ▼ (Same-Origin HTTPS Requests + HttpOnly Cookies)
Next.js 15 App Router (Middleware + Route Handlers: /api/*)
   │
   ▼
Server-Side Authorization & Services (lib/auth, lib/projects, lib/tasks, lib/comments)
   │
   ▼
Prisma ORM Client
   │
   ▼
PostgreSQL Database (Workspaces, Projects, Tasks, Comments, Activities, Notifications)
```

### Core Architecture Decisions

1. **Single Deployable Next.js Unit**: No separate Express server, no microservices, and no external websocket daemons. Everything runs reliably inside Next.js App Router route handlers, drastically reducing operational overhead and deployment complexity.
2. **Zero LocalStorage Tokens**: Access tokens are stored exclusively in JavaScript memory and cleared on tab closure. Refresh tokens are stored in `HttpOnly; SameSite=Lax; Path=/api/auth` cookies. Even in the event of an XSS vulnerability, tokens cannot be extracted from `localStorage` or `sessionStorage`.
3. **In-Flight Refresh Deduplication & 401 Replay**: If an access token expires while multiple API requests are in flight, the client catches the first 401, triggers a single refresh request, deduplicates subsequent calls against the active promise, and transparently replays the original request with the fresh token.
4. **Complete Server-Side Tenancy & IDOR Defenses**: The client is never trusted. Every mutation and query resolves the full hierarchy:
   `User → Workspace Membership → Project Access → Task Access`.
   Accessing an entity from a different workspace returns a clean `404 Not Found` rather than `403 Forbidden` to prevent object enumeration.

---

## Database & Migrations

The database schema is defined in `prisma/schema.prisma` with extensions including `citext` for case-insensitive email matching.

### Migration State

Committed migrations exist in `prisma/migrations/20260911003712_init`.

- **Development**: Apply existing migrations with `npx prisma migrate dev`.
- **Production / CI**: Apply migrations deterministically using:
  ```bash
  npx prisma migrate deploy
  ```
  *(Do NOT run `migrate dev` or create a new "init" migration in production).*

---

## Authentication & Security

- **Password Storage**: Passwords are hashed using `bcryptjs` with 12 salt rounds.
- **Access Tokens**: Short-lived (15 minutes default) signed with `JWT_ACCESS_SECRET`.
- **Refresh Tokens**: Long-lived (7 days default) signed with `JWT_REFRESH_SECRET` and assigned a unique JTI per rotation. The SHA-256 hash of the token is persisted in the PostgreSQL `RefreshToken` table to support immediate revocation upon logout.
- **Rate Limiting**: Authentication endpoints (`/api/auth/login`, `/api/auth/register`) feature rate-limiting protection to mitigate brute-force credential stuffing.
- **Input Sanitization**: All inputs are validated with Zod, enforcing string trimming, email normalization, and strict length bounds before database queries execute.

---

## Authorization & RBAC

| Capability | OWNER | ADMIN | MEMBER |
|------------|:-----:|:-----:|:------:|
| View Workspace & Projects | Yes | Yes | Yes |
| Create Projects & Tasks | Yes | Yes | Yes |
| Move / Update Tasks | Yes | Yes | Yes |
| Post Task Comments | Yes | Yes | Yes |
| Edit Own Comments | Yes | Yes | Yes |
| Delete / Moderate Any Comment | Yes | Yes | No |
| Manage Project Settings | Yes | Yes | No |
| Invite / Remove Workspace Members | Yes | Yes | No |
| Delete Workspace | Yes | No | No |

---

## Project Structure

```text
├── app/                  # Next.js 15 App Router pages & API route handlers
│   ├── api/              # Route Handlers: auth, workspaces, projects, tasks, comments, notifications
│   ├── dashboard/        # Main workspace overview page
│   ├── projects/[id]/    # Project board, list view, and task detail page
│   ├── login/            # Authentication login
│   ├── register/         # User registration
│   ├── layout.tsx        # Root layout with theme provider
│   ├── page.tsx          # Marketing landing page
│   ├── error.tsx         # App error boundary
│   └── global-error.tsx  # Root global error boundary
├── components/           # Reusable UI components
│   ├── auth/             # AuthContext and login/register forms
│   ├── board/            # Kanban board and task columns
│   ├── home/             # Landing page composition
│   ├── layout/           # Navbar, footer, sidebar navigation
│   ├── notifications/    # Notifications panel
│   ├── projects/         # Project cards, creation dialogs, list views
│   ├── sections/         # Landing page sections (Hero, Features, Stats, FAQ, etc.)
│   ├── tasks/            # Task card, TaskDetail modal, task edit dialog
│   ├── ui/               # Base UI elements (buttons, inputs, modals, toasts)
│   └── workspace/        # Workspace switcher, member management modal
├── data/                 # Static content (FAQ, solutions, testimonials)
├── docs/                 # Documentation and screenshot specifications
│   └── screenshots/      # UI screenshot guidelines
├── lib/                  # Backend services and business logic
│   ├── activity/         # Audit activity logging
│   ├── api/              # In-memory API client with 401 retry
│   ├── auth/             # JWT, password hashing, token rotation
│   ├── comments/         # Comment service and permissions
│   ├── db/               # Prisma singleton client
│   ├── errors/           # Normalized error formatting and AppError classes
│   ├── notifications/    # Notification dispatch and status service
│   ├── projects/         # Project service and RBAC authorization
│   ├── tasks/            # Task service, status updates, and positioning
│   ├── validations/      # Zod validation schemas
│   └── workspaces/       # Workspace service and member management
├── prisma/               # Schema definition, committed migrations, seed script
│   ├── migrations/       # Committed migrations (20260911003712_init)
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Idempotent development seed script
├── tests/                # Automated unit and flow test suite
└── types/                # Shared TypeScript interfaces and enums
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local execution:

```bash
cp .env.example .env.local
```

| Variable | Description | Example / Default |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string (Docker on port 5433) | `postgresql://nova:changeme@localhost:5433/nova?schema=public` |
| `JWT_ACCESS_SECRET` | Secret key for access token signing (≥ 32 chars) | Random 48-byte hex string |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing (≥ 32 chars) | Random 48-byte hex string |
| `JWT_ACCESS_TTL` | Lifespan of access token | `15m` |
| `JWT_REFRESH_TTL` | Lifespan of refresh token | `7d` |
| `NEXT_PUBLIC_SITE_URL` | Canonical application URL | `http://localhost:3000` |
| `NODE_ENV` | Node runtime environment | `development` / `production` |

Generate cryptographic secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Docker Setup

NOVA is fully containerized with Docker Compose. You can run the entire stack — including PostgreSQL, Prisma database migrations, and the Next.js 15 production server — using a single command without needing PostgreSQL or Node.js installed locally on your Windows machine.

### Architecture

```text
Browser Client
   │ (http://localhost:3000)
   ▼
[web container: Next.js 15 Standalone] (Port 3000)
   │
   │ (Internal Docker Network: postgres:5432)
   ▼
[postgres container: PostgreSQL 16] (Host Port: 5433 -> Container: 5432)
   ▲
   │ (Pre-start migration execution)
[migrate container: Prisma Migrator] (npx prisma migrate deploy)
```

- **`web`**: Production Next.js 15 application runtime running in standalone mode (`node server.js`).
- **`migrate`**: Transient migrator container that executes `npx prisma migrate deploy` once PostgreSQL becomes healthy, ensuring all database tables are up to date before `web` launches.
- **`postgres`**: Official PostgreSQL 16 image with healthchecks and persistent data storage.

### Port Mappings
- **`localhost:3000`** -> Next.js 15 Web Application
- **`localhost:5433`** -> PostgreSQL 16 (mapped to host for database inspection with tools like TablePlus or psql; PostgreSQL does not need to be installed directly on Windows)

### 1. Prerequisites
- Install and launch [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### 2. Configure Environment Variables
Copy `.env.docker.example` to `.env.docker`:
```bash
cp .env.docker.example .env.docker
```

Generate secure random JWT secrets for `.env.docker`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Place the generated secrets in `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` inside `.env.docker`.

### 3. Start the Complete Application
Build and launch all services in detached mode:
```bash
docker compose up -d --build
```
*(Or use npm shorthand: `npm run docker:up`)*

This command automatically:
1. Provisions PostgreSQL and waits for the health check to pass.
2. Runs Prisma migrations (`npx prisma migrate deploy`) in the `migrate` container.
3. Starts the production Next.js application in the `web` container.

### 4. Access NOVA
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Check Container Status
Verify that all services are healthy and running:
```bash
docker compose ps
```

### 6. View Application Logs
Inspect real-time logs from the Next.js web application:
```bash
docker compose logs -f web
```
*(Or inspect migrations / database: `docker compose logs migrate` or `docker compose logs postgres`)*

### 7. (Optional) Seed Demo Data
To populate the database with demo users, workspaces, and projects:
```bash
docker compose run --rm migrate npx prisma db seed
```

### 8. Stop Containers
To stop the services while preserving all database data:
```bash
docker compose down
```
*(Or use npm shorthand: `npm run docker:down`)*

> [!IMPORTANT]
> **Database Persistence**: The database volume `nova_postgres_data` persists across container stops and restarts. Running `docker compose down` will safely preserve all project and task data. Do NOT use `docker compose down -v` during standard shutdowns, as `-v` permanently removes the named volume and erases all database data.

---

## Local Setup & Seed

### Prerequisites
- **Node.js**: v20 or v24
- **Docker & Docker Desktop**: Installed and running

### Port Mapping & Architecture
- **Host Port**: `5433` (accessible on Windows host via `localhost:5433`)
- **Container Port**: `5432` (internal PostgreSQL daemon port)
- **Named Volume**: `nova_postgres_data` (ensures database persistence across restarts)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL via Docker Compose
```bash
docker compose up -d postgres
```

Verify the container is healthy:
```bash
docker compose ps
```
*(Optionally test readiness: `docker exec nova-postgres pg_isready -U nova -d nova`)*

### 3. Generate Prisma Client & Apply Migrations
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Run Idempotent Database Seed
```bash
npm run db:seed
```
*Note: The seed script uses deterministic UUIDs and upserts. Running `npm run db:seed` multiple times will update records without creating duplicate rows.*

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Owner** | `owner@nova.demo` | `NovaDemo123!` |
| **Admin** | `admin@nova.demo` | `NovaDemo123!` |
| **Member** | `member@nova.demo` | `NovaDemo123!` |

*(These demo credentials are for local development and portfolio demonstration).*

### 5. Start Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Launches Next.js development server at `localhost:3000` |
| `npm run build` | Produces an optimized production build |
| `npm run start` | Starts Next.js in production mode |
| `npm test` | Runs unit & validation tests via `tsx --test tests/**/*.test.ts` |
| `npm run test:e2e` | Runs Playwright automated browser E2E smoke suite (`playwright test`) |
| `npm run typecheck` | Validates TypeScript with strict mode (`tsc --noEmit`) |
| `npm run lint` | Runs code quality linter (`oxlint`) |
| `npm run prisma:generate` | Generates the Prisma Client |
| `npm run prisma:validate` | Validates `schema.prisma` syntax |
| `npm run prisma:migrate` | Applies development migrations (`prisma migrate dev`) |
| `npm run db:seed` | Populates database with idempotent demo data |
| `npm run docker:up` | Builds and starts full stack via `docker compose up -d --build` |
| `npm run docker:down` | Gracefully stops containers via `docker compose down` |
| `npm run docker:logs` | Streams live logs from Next.js web container |

---

## Automated Testing

Automated testing is built with the native Node.js test runner via `tsx --test`, ensuring rapid execution without heavy runtime dependencies.

Run all tests:
```bash
npm test
```

### Test Coverage Highlights
- **Authentication Lifecycle**: Bcrypt password hashing, verification, access token signing and verification, refresh token unique JTI rotation, SHA-256 hash determinism.
- **Authorization & RBAC**: Hierarchy ranks, permission functions (`canCreateProject`, `canManageProject`, `canOwnerAction`).
- **Validation Schemas**: Zod validation rules across projects, tasks, comments, and workspace invitations (enforcing string trimming and bounds).
- **Error Normalization**: Verification that `getErrorMessage` safely unwraps complex error objects, AppErrors, and browser events without ever emitting raw `[object Event]` or `[object Object]` strings.
- **API Client Contracts**: In-memory token management and auth failure listener subscriptions.

---

## Deployment Readiness

NOVA is architected for deployment on modern cloud platforms such as **Vercel**, **Render**, or **Railway** with any managed PostgreSQL service (**Neon**, **Supabase**, **Railway**, or **AWS RDS**).

### Production Checklist
1. **Database Deployment**: Run `npx prisma migrate deploy` in your build/release phase to apply the committed migrations to your production database.
2. **Environment Configuration**: Set strong cryptographic secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
3. **Secure Cookies**: In production (`NODE_ENV=production`), refresh cookies automatically enforce the `Secure` flag.
4. **Site URL**: Configure `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://nova.yourdomain.com`).

---

## Screenshots

High-resolution screenshots are documented in [docs/screenshots/README.md](docs/screenshots/README.md):
- `landing.png`: Hero section, responsive navigation, feature breakdown.
- `dashboard.png`: Active project cards, status indicators, and member summary.
- `project-board.png`: Kanban board with drag-and-drop columns and task cards.
- `task-detail.png`: Task inspector modal with threaded comments and status controls.
- `members.png`: Workspace member roster and RBAC invitation dialog.
- `notifications.png`: In-app notification drawer with task links.

---

## Known Limitations & Future Improvements

- **WebSockets / Realtime**: Activity and notification synchronization currently rely on client-initiated actions and polling. Adding real-time WebSocket subscriptions via Server-Sent Events (SSE) or WebSockets is a viable future improvement if infrastructure permits.
- **Intra-column Task Reordering**: Drag-and-drop moves tasks between status columns seamlessly. Intra-column custom position sorting is supported via a position integer field, but full fractional drag-reordering can be enhanced further.
- **File Attachments**: Tasks currently support markdown descriptions and text comments. S3/R2 direct file uploads can be added as a storage provider integration.

---

## License

This project is licensed under the [MIT License](LICENSE).