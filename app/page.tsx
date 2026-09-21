import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { RbacSandbox } from "@/components/RbacSandbox";
import { TransactionDispatcher } from "@/components/TransactionDispatcher";
import { WebhookSimulator } from "@/components/WebhookSimulator";
import { RelationalDataExplorer } from "@/components/RelationalDataExplorer";
import { Database, Shield, Mail, CheckCircle2, Server, Terminal, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Fresh database data on request

export default async function HomePage() {
  const session = await getCurrentSession();

  // Query database metrics & relational data
  const [roles, users, transactions, auditLogs, emailLogs] = await Promise.all([
    prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      include: {
        role: true,
        _count: { select: { transactions: true, emailLogs: true, auditLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.transaction.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const activeRole = session?.role || "GUEST";
  const isResendLive = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_") && process.env.RESEND_API_KEY !== "re_123456789");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Banner: Assignment Overview & System Telemetry */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#090d16] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Terminal className="h-3.5 w-3.5" />
              <span>Full-Stack Assignment 2 · Architecture Demonstration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Relational Pipeline, RBAC Proxy & Resend Dispatch
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Fully automated PostgreSQL multi-entity schema with @faker-js/faker, Next.js Edge Middleware
              role-based proxy gates (Admin, Member, Guest), and post-mutation Resend transactional email
              lifecycle with webhook ingestion.
            </p>
          </div>

          {/* Quick CLI Pipeline Card */}
          <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 shrink-0 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>CLI Pipeline Command:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                1-Step Reset & Seed
              </span>
            </div>
            <div className="rounded bg-black/60 p-2.5 text-indigo-300 border border-white/5 select-all">
              npm run db:pipeline
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Database verified on PostgreSQL :5432
            </div>
          </div>
        </div>

        {/* Telemetry Metric Badges */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/5">
          <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
            <div className="text-[11px] text-slate-400">Database Connection</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL (Docker)
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
            <div className="text-[11px] text-slate-400">Edge Proxy Gate</div>
            <div className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 mt-0.5">
              <Shield className="h-3.5 w-3.5" />
              Active (Role: {activeRole})
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
            <div className="text-[11px] text-slate-400">Lifecycle Dispatcher</div>
            <div className="text-sm font-bold text-indigo-300 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {isResendLive ? "Live Resend API" : "Simulation Mode"}
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
            <div className="text-[11px] text-slate-400">Normalized Records</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Database className="h-3.5 w-3.5 text-slate-400" />
              {users.length + transactions.length + auditLogs.length + emailLogs.length} Records
            </div>
          </div>
        </div>
      </div>

      {/* Part B: Edge Middleware Proxy Gate & RBAC Sandbox */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 font-mono">
              PART B
            </span>
            <h2 className="text-lg font-bold text-white">
              Authenticated Session Enforcement & Middleware Proxy Gates (CO3)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">middleware.ts / proxy.ts</span>
        </div>
        <RbacSandbox currentRole={activeRole} />
      </section>

      {/* Part C: Transactional Dispatch & Webhook Ingestion */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 font-mono">
              PART C
            </span>
            <h2 className="text-lg font-bold text-white">
              Transactional Lifecycle Dispatch & Resend Webhook Ingestion (CO3, CO4)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">@react-email/components · Resend</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionDispatcher currentSession={session} />
          <WebhookSimulator />
        </div>
      </section>

      {/* Part A: Relational Schema Modeling & Seeding */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 font-mono">
              PART A
            </span>
            <h2 className="text-lg font-bold text-white">
              Relational Schema Modeling & Automated Mock Data Pipeline (CO4)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">prisma/schema.prisma · seed.ts</span>
        </div>

        <RelationalDataExplorer
          roles={roles}
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            avatarUrl: u.avatarUrl,
            role: { name: u.role.name },
            _count: u._count,
          }))}
          transactions={transactions.map((t) => ({
            id: t.id,
            reference: t.reference,
            amount: Number(t.amount),
            currency: t.currency,
            type: t.type,
            status: t.status,
            recipientEmail: t.recipientEmail,
            createdAt: t.createdAt.toISOString(),
            user: { name: t.user.name, email: t.user.email },
          }))}
          auditLogs={auditLogs.map((a) => ({
            id: a.id,
            action: a.action,
            entity: a.entity,
            ipAddress: a.ipAddress,
            createdAt: a.createdAt.toISOString(),
            user: a.user ? { name: a.user.name, email: a.user.email } : null,
            details: a.details,
          }))}
          emailLogs={emailLogs.map((e) => ({
            id: e.id,
            resendEmailId: e.resendEmailId,
            toEmail: e.toEmail,
            templateName: e.templateName,
            subject: e.subject,
            status: e.status,
            errorMessage: e.errorMessage,
            createdAt: e.createdAt.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
