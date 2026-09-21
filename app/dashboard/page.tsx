import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UserCheck, Receipt, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function MemberDashboardPage() {
  const session = await getCurrentSession();

  // Defense-in-depth: In addition to Edge Middleware, verify in Server Component
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (session.role === "GUEST") {
    redirect(`/unauthorized?role=GUEST&required=MEMBER,ADMIN`);
  }

  // Fetch transactions for this member (or all if admin)
  const transactions = await prisma.transaction.findMany({
    where: session.role === "ADMIN" ? {} : { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const emailLogs = await prisma.emailLog.findMany({
    where: session.role === "ADMIN" ? {} : { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

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
              <UserCheck className="h-6 w-6 text-emerald-400" />
              <h1 className="text-xl font-bold text-white">Member Ledger & Telemetry</h1>
            </div>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-mono font-semibold border border-emerald-500/30">
              Clearance: {session.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-6">
            Authenticated Member: <strong className="text-white">{session.name}</strong> ({session.email})
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ← Back to Control Hub
        </Link>
      </div>

      {/* Transactions List */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Your Recent Transactions</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Recipient</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-bold text-indigo-400">{t.reference}</td>
                  <td className="py-2.5 text-slate-300">{t.recipientEmail}</td>
                  <td className="py-2.5 font-bold text-slate-200">
                    {t.currency} {Number(t.amount).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-400 text-[11px]">
                    {new Date(t.createdAt).toLocaleString()}
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
