# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 (App Router), TypeScript, Prisma ORM, PostgreSQL, React Email (@react-email/components), Resend API, Jose (Edge JWT), TailwindCSS

## Users

- Primary: Academic evaluators assessing CO3 & CO4 course outcomes (Relational Schema Modeling, Automated Mock Data Pipelines, Authenticated Session Enforcement, Edge Middleware RBAC, Transactional Email Dispatch, and Webhook Ingestion).
- Secondary: End-users acting under defined RBAC personas (Administrator, Member, Guest).

## Product Purpose

A robust enterprise-grade relational data management, access-control proxy, and transactional messaging system demonstrating:
1. Multi-entity schema design in PostgreSQL with strict foreign keys and automated mock data generation via `@faker-js/faker`.
2. Edge middleware session enforcement with role-based routing (Admin, Member, Guest) and header-based proxy gating.
3. Post-mutation transactional email dispatch via React Email and Resend, backed by database webhook ingestion for delivery and bounce auditing.

## Positioning

Unlike basic CRUD demonstrators, this system integrates an automated CLI database migration and seeding pipeline with real-time edge proxy role verification, live in-app role switching, and end-to-end webhook event ingestion logging.

## Operating Context

- Evaluated in local and staged cloud environments.
- Relies on PostgreSQL (Docker container `nextjs_postgres_db` on port 5432).
- Edge middleware executing on Next.js runtime.
- Resend transactional dispatch with dual-mode operational support (live Resend API credentials or graceful simulation with direct database persistence).

## Capabilities and Constraints

- Capabilities:
  - CLI command `npm run db:pipeline` to reset, migrate, and seed data idempotently.
  - Normalized schema: `Role`, `User`, `Session`, `Transaction`, `AuditLog`, `EmailLog`.
  - Edge middleware RBAC proxy verifying JWT sessions and passing `x-user-id`, `x-user-role`, `x-user-email` headers.
  - Protected API Route Handlers (`/api/admin/*`, `/api/transactions/*`) and Server Actions.
  - Transactional alert email rendered with `@react-email/components`.
  - Resend webhook endpoint (`/api/webhooks/resend`) ingesting delivery and bounce events into PostgreSQL.
  - Live interactive dashboard with role switcher, transaction tester, and webhook simulator.
- Constraints:
  - Node.js v24.x environment on Windows.
  - Edge middleware must run without native Node.js libraries (using `jose` for session validation).

## Brand Commitments

- Aesthetic: Deep obsidian dark mode, refined slate borders, electric emerald and indigo accents, glassmorphic cards, crisp monospaced telemetry badges.
- Tone: Professional, developer-first, transparent, enterprise-grade.

## Evidence on Hand

- Active PostgreSQL container `nextjs_postgres_db` on localhost:5432.
- Localized mock data seeds generated via `@faker-js/faker`.
- Verified Prisma ORM models with referential integrity.

## Product Principles

1. Zero-Friction Reproducibility: One CLI command boots, migrates, and seeds the entire database pipeline.
2. Defense in Depth: Edge middleware proxy gates validate roles before requests reach backend route handlers, while route handlers and server actions re-verify permissions.
3. Observability & Auditability: Every critical mutation triggers an audit log and transactional email event with full webhook traceability.
