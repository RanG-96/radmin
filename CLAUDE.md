# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Radmin is a reusable full-stack admin scaffold: Rust/Axum backend + React/Vite frontend + PostgreSQL. It provides JWT authentication with role-based access control (admin/user) and a user management CRUD out of the box.

## Commands

### Docker (full stack)
```bash
docker compose up --build        # Start all services (postgres + backend + frontend)
docker compose down              # Stop all services
```
- Frontend: http://localhost (Nginx serving SPA + reverse-proxying /api to backend)
- Backend API: http://localhost:3000

### Local development
```bash
docker compose up -d postgres    # Start PostgreSQL only (port 5433)
make dev                         # Start backend + frontend in parallel
make dev-backend                 # cd backend && cargo run
make dev-frontend                # cd frontend && npm run dev
```
- Frontend dev server: http://localhost:5173 (Vite proxies /api to localhost:3000)
- Backend: http://localhost:3000

### Build
```bash
make build                       # cargo build --release + npm run build
```

### Database
```bash
make db-migrate                  # sqlx migrate run
make db-reset                    # Drop + recreate DB + run migrations
```

### Backend only
```bash
cd backend && cargo run          # Run backend (reads .env for config)
cd backend && cargo check        # Type-check without building
```

### Frontend only
```bash
cd frontend && npm run dev       # Dev server with HMR
cd frontend && npm run build     # Production build
cd frontend && npx eslint src    # Lint
```

## Architecture

### Backend (Rust/Axum)

Layered architecture: **handler → service → database**

- `src/main.rs` — Entry point. Loads config, creates PgPool, runs migrations, seeds admin, registers routes, starts server.
- `src/config.rs` — `AppConfig` loaded from environment variables via `dotenvy`.
- `src/db.rs` — PostgreSQL connection pool (SQLx, max 5 connections, rustls TLS).
- `src/error.rs` — `AppError` enum (Database/Auth/NotFound/Validation/Internal) implementing `IntoResponse` with JSON error bodies.
- `src/handler/` — HTTP handlers grouped by domain:
  - `auth.rs` — POST `/api/auth/register`, `/api/auth/login` (public)
  - `user.rs` — GET/PUT `/api/users/me` (any authenticated user)
  - `user_admin.rs` — CRUD `/api/admin/users` (admin only)
- `src/middleware/` — Axum extractors and layers:
  - `jwt.rs` — `Claims` extractor via `FromRequestParts`; handlers accept `claims: Claims` as parameter
  - `role.rs` — `AdminRole` extractor (wraps Claims, checks role == "admin")
  - `cors.rs` — CORS layer (allow any origin)
- `src/model/user.rs` — `User` struct + DTOs (CreateUser, LoginUser, AdminCreateUser, UpdateUser, UpdateMe, UserResponse, AuthResponse, PaginatedUsers, PaginationParams).
- `src/service/auth.rs` — Register/login logic, bcrypt hashing, JWT generation.
- `src/service/seed.rs` — Seeds default admin on startup if not exists.

**State**: `AppState` (PgPool + AppConfig) passed via `Router::with_state()`.

**Auth pattern**: JWT claims contain `sub` (UUID), `username`, `role`, `exp`. Extracted automatically by Axum's extractor system — no middleware layer needed.

**Database**: PostgreSQL 16. Migrations in `backend/migrations/` (SQLx). Single `users` table with RBAC fields (role, is_active).

### Frontend (React/Vite/TailwindCSS v4)

- `src/App.tsx` — Wraps app in `QueryClientProvider` + `RouterProvider`.
- `src/router.tsx` — Routes: `/` (Dashboard), `/users` (Users admin), `/login`, `/register`.
- `src/hooks/useAuth.ts` — Auth state via `useState` + `localStorage`. On mount, validates token by calling `/api/users/me`.
- `src/lib/api.ts` — Axios instance (`baseURL: '/api'`). Request interceptor attaches Bearer token. Response interceptor redirects to `/login` on 401. Exports `authApi`, `userApi`, `adminApi`.
- `src/lib/query-client.ts` — TanStack Query config (5min stale time, 1 retry, no refetch on focus).
- `src/layouts/MainLayout.tsx` — Sidebar + content area. Route guard redirects unauthenticated users to `/login`.
- `src/pages/Users.tsx` — Full admin CRUD with TanStack Query mutations, paginated table, Radix Dialog/DropdownMenu.
- `src/components/ui/` — Reusable primitives: Button, Input, Select, Table, Dialog, DropdownMenu (Radix-based).
- `src/index.css` — TailwindCSS v4 with `@theme` directive for custom colors. No `tailwind.config.js`.

**State management**: Server state via TanStack Query. Auth state via `useAuth()` hook + localStorage. No global state library.

### Key Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/my_admin` | SQLx connection string |
| `JWT_SECRET` | `change-me-to-a-random-secret-key` | JWT signing secret |
| `JWT_EXPIRATION_HOURS` | 24 | Token lifetime |
| `SERVER_PORT` | 3000 | Backend listen port |
| `RUST_LOG` | debug | Tracing filter |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |

## Conventions

- **Backend errors**: Use `AppError` variants, not raw `anyhow`. Handlers return `Result<Json<T>, AppError>`.
- **Frontend API calls**: Always go through the `api.ts` Axios instance (auto-attaches auth, handles 401).
- **New pages**: Add route in `router.tsx`, wrap in `MainLayout` for authenticated pages.
- **New admin endpoints**: Use `_admin: AdminRole` extractor parameter. Add route in `main.rs` under the admin route group.
- **UI components**: Use Radix UI primitives wrapped in `components/ui/`. Style with TailwindCSS utility classes.
- **Database changes**: Add new migration file in `backend/migrations/` with sequential numbering (e.g., `003_description.sql`).
