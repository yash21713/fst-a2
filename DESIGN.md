# Design System & Visual Contract

<!-- impeccable:design-schema 1 -->

## Design Language

A high-density, enterprise-grade dark telemetry interface inspired by modern developer infrastructure (Vercel, Linear, Stripe Dashboard).

### Typography
- Primary UI: Geist Sans / Inter (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- Telemetry, Code & Hashes: Geist Mono / JetBrains Mono (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)

### Color System
- **Canvas / Background**: `#090d16` (Deep Obsidian / Midnight Void)
- **Surface Elevation 1**: `#0f172a` (Slate 900)
- **Surface Elevation 2**: `#1e293b` (Slate 800)
- **Border Subtle**: `rgba(255, 255, 255, 0.08)`
- **Border Medium**: `rgba(255, 255, 255, 0.16)`
- **Border Highlight**: `rgba(99, 102, 241, 0.4)` (Indigo glow)

### Accents & Status Indicators
- **Admin Accent**: Indigo / Violet (`#6366f1` / `#8b5cf6`)
- **Member Accent**: Emerald / Cyan (`#10b981` / `#06b6d4`)
- **Guest Accent**: Amber / Orange (`#f59e0b` / `#ea580c`)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error / Bounce**: `#ef4444` (Crimson Rose)
- **Neutral Muted**: `#94a3b8` (Slate 400)

### Motion & Micro-Interactions
- Smooth state transitions (150ms-250ms ease-out).
- Subtle glow upon focus and hover on action cards.
- Pulse telemetry indicator for active database & webhook listener.

### Components
1. **RBAC Proxy Bar**: Role switcher pills with active badges indicating route clearance (Admin, Member, Guest).
2. **Telemetry Cards**: Metric cards displaying normalized table counts, migration status, and database health.
3. **Transaction Dispatcher**: Precision form with validation, real-time feedback, and React Email preview.
4. **Resend Webhook Simulator**: Interactive payload builder with one-click delivery & bounce test triggers.
5. **Relational Schema Data Tables**: Tabular explorer with foreign key tags, timestamp formatting, and payload inspector.
