import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ShieldCheck, Users, Activity, Mail, ArrowLeft, KeyRound, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminPortalPage() {
  const session = await getCurrentSession();

  // Defense-in-depth: In addition to Edge Middleware, verify in Server Component
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect(`/unauthorized?role=${session.role}&required=ADMIN`);
  }

  const [users, auditLogs, emailLogs, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: true, _count: { select: { transactions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.role.findMany(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Administrative Proxy Zone</h1>
            </div>
            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-xs font-mono font-semibold border border-indigo-500/30">
              Clearance: ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-6">
            Authenticated as: <strong className="text-white">{session.name}</strong> ({session.email})
            · Edge Proxy Gate Validated
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ← Back to Control Hub
          </Link>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total System Users</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Normalized in PostgreSQL</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Audit Logs Recorded</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{auditLogs.length}+</div>
          <div className="text-[11px] text-slate-400 mt-1">Compliance & observability</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resend Dispatches</span>
            <Mail className="h-4 w-4 text-indigo-300" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{emailLogs.length}+</div>
          <div className="text-[11px] text-slate-400 mt-1">Webhook delivery tracked</div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Enterprise User Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">User</th>
                <th className="pb-3">Current Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Transactions</th>
                <th className="pb-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-sans">
                    <div className="font-semibold text-slate-200">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role.name === "ADMIN"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : u.role.name === "MEMBER"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {u.role.name}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans">
                    <span className="text-emerald-400 text-[11px]">● ACTIVE</span>
                  </td>
                  <td className="py-2.5 text-center text-slate-300">{u._count.transactions}</td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
