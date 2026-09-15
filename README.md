# NOVA — Premium Full-Stack Project Management Platform

NOVA is a high-performance, full-stack collaborative project management platform built with Next.js 15, React 19, TypeScript, PostgreSQL, and Prisma.

Designed for high-velocity teams, NOVA structures collaboration into **Workspaces → Projects → Tasks**, backed by enterprise-grade role-based access control (RBAC), atomic database transactions, secure JWT authentication with refresh token rotation, real-time activity timelines, in-app notifications, and a dark-first aesthetic.

---

## Features

- **JWT Authentication with HttpOnly Rotation**: Short-lived in-memory access tokens paired with secure, rotating, HttpOnly refresh cookies stored as SHA-256 hashes in PostgreSQL. Constant-time password verification with bcrypt.
- **Workspace RBAC**: Hierarchical permissions (`OWNER` > `ADMIN` > `MEMBER`) enforced at both database and API service layers.
- **Workspace Member Management**: Invite existing users by email, update permissions, or remove members with guaranteed workspace owner protection.
- **Project Management**: Full project lifecycle tracking (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), priority management, member assignments, and live search.
- **Interactive Kanban Board**: Dynamic drag-and-drop task boards and list views with optimistic UI updates and instant status transitions (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- **Task Filtering & Deep Linking**: URL-synchronized query state (`?status=`, `?priority=`, `?assignee=`, `?search=`) and direct task modal permalinks (`?task=`) for seamless team sharing.
- **Task Collaboration & Comments**: Real-time discussion feeds scoped to tasks with verified author authorization and Markdown rendering.
- **Project Activity Timeline**: Audit log capturing project milestones, task creation, status changes, assignments, and comment additions.
- **In-App Notifications**: Targeted notification feed for task assignments, comment mentions, and workspace invitations with one-click read receipts.
- **Responsive Dashboard**: Unified view of active projects, due-date alerts, team roster, and global metrics.
- **Multi-Theme System**: Dark, light, and system theme support tailored with a high-contrast emerald/lime/teal palette.

---

## Demo Accounts

The database seed provides three pre-configured accounts for local evaluation and testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Owner** | `owner@nova.demo` | `NovaDemo123!` | Full workspace ownership, member invitations, role management, project deletion |
| **Admin** | `admin@nova.demo` | `NovaDemo123!` | Manage projects, invite members, modify non-owner roles, moderate comments |
| **Member** | `member@nova.demo` | `NovaDemo123!` | Create/view projects, create/update assigned tasks, post comments |

> **Note:** These credentials are for local development and demonstration purposes only. They are not real customer credentials.

---

## Architecture

```text
Browser
   │
   ▼
Next.js 15 App Router (Edge Middleware + React Server / Client Components)
   │
   ▼
Next.js Route Handlers (`/api/*`)
   │
   ▼
Service Layer (`lib/*`: auth, workspaces, projects, tasks, comments, activity)
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL (Relations, Indexes, Citext, Cascades)
```

### Security & Authorization Highlights

- **Single Deployable Architecture**: No separate Express server, microservices, or complex external dependencies. Everything runs natively within Next.js Route Handlers.
- **Zero LocalStorage Tokens**: Access tokens are held strictly in memory; refresh tokens reside in `HttpOnly; SameSite=Lax; Path=/api/auth` cookies.
- **In-Memory Token Refresh with Concurrent Deduping**: API requests that encounter an expired token automatically trigger a single deduped `/api/auth/refresh` cycle and seamlessly replay the original request.
- **IDOR Protection**: Every project, task, comment, and activity operation resolves and validates the complete tenancy path:
  `User → Workspace Membership → Project Access → Task Belongs to Project`. Cross-workspace resource lookups return `404 Not Found` to prevent entity enumeration.
- **Data Protection**: API responses selectively omit sensitive fields (such as `passwordHash` and `tokenHash`).

---

## Quick Start

### Prerequisites
- **Node.js ≥ 20**
- **PostgreSQL 14+**

### 1. Clone & Install
```bash
git clone https://github.com/naina766/productivity-platform.git
cd productivity-platform
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection URI | `postgresql://nova:changeme@localhost:5432/nova?schema=public` |
| `JWT_SECRET` / `JWT_ACCESS_SECRET` | Secret key for signing short-lived access tokens (≥ 32 chars) | Random 48-byte hex string |
| `JWT_REFRESH_SECRET` | Secret key for signing rotating refresh tokens (≥ 32 chars) | Random 48-byte hex string |
| `JWT_ACCESS_TTL` | Access token lifespan | `15m` |
| `JWT_REFRESH_TTL` | Refresh token lifespan | `7d` |
| `NEXT_PUBLIC_SITE_URL` | Application base URL | `http://localhost:3000` |

*Tip: Generate secure secrets quickly with:*
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Initialize Database & Seed
Apply committed Prisma migrations and populate demo accounts:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to explore NOVA.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts Next.js development server at `localhost:3000` |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs code quality & lint checks (`oxlint`) |
| `npm run typecheck` | Validates TypeScript types (`tsc --noEmit`) |
| `npm run prisma:generate` | Generates Prisma client types |
| `npm run prisma:validate` | Validates `prisma/schema.prisma` syntax |
| `npm run prisma:migrate` | Applies database migrations (`prisma migrate dev`) |
| `npm run db:seed` | Seeds demo users, workspace, project, and tasks |

---

## Screenshots

To showcase the platform in your portfolio, capture real screenshots and store them under `public/screenshots/`:

### Landing Page
<!-- ![Landing Page](/screenshots/landing.png) -->
*High-converting hero section with dynamic particle backgrounds, feature grids, and interactive previews.*

### Dashboard
<!-- ![Dashboard](/screenshots/dashboard.png) -->
*Workspace overview showcasing active project cards, quick filters, team members, and health indicators.*

### Project Board
<!-- ![Project Board](/screenshots/project-board.png) -->
*Interactive Kanban board with drag-and-drop columns, priority tags, and assignee avatars.*

### Task Details
<!-- ![Task Details](/screenshots/task-details.png) -->
*Modal inspector featuring full task editing, status workflow, and threaded discussion comments.*

### Workspace Members
<!-- ![Workspace Members](/screenshots/workspace-members.png) -->
*RBAC management modal with member directory, role assignment dropdowns, and invite controls.*

### Notifications
<!-- ![Notifications](/screenshots/notifications.png) -->
*In-app notification drawer showing assignments, mentions, and bulk mark-as-read controls.*

---

## Health Check

A lightweight health check route is available for uptime monitors:
```http
GET /api/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-15T23:00:00.000Z"
}
```

---

## License

This project is open source and available under the [MIT License](LICENSE).