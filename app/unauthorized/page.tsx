import { ShieldAlert, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";

interface UnauthorizedPageProps {
  searchParams: Promise<{
    role?: string;
    required?: string;
  }>;
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const params = await searchParams;
  const session = await getCurrentSession();

  const activeRole = params.role || session?.role || "GUEST";
  const requiredRole = params.required || "ADMIN";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-rose-500/20 bg-slate-900/80 p-8 text-center backdrop-blur-md shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h1 className="mt-5 text-xl font-bold tracking-tight text-white">
          403 Forbidden: Proxy Gate Rejection
        </h1>

        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          The Next.js Edge Middleware Proxy Gate (<code>middleware.ts</code>) evaluated your session claims
          and intercepted the request before reaching backend route segments.
        </p>

        {/* Diagnostic Box */}
        <div className="mt-6 rounded-xl border border-white/10 bg-slate-950 p-4 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400">Active Persona:</span>
            <span className="text-rose-400 font-bold">{activeRole}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/5">
            <span className="text-slate-400">Required Clearance:</span>
            <span className="text-emerald-400 font-bold">{requiredRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Proxy Interception:</span>
            <span className="text-indigo-400">Edge RBAC Policy Matrix</span>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-left flex items-start gap-2">
          <KeyRound className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Evaluator Tip:</strong> Use the role switcher in the top navigation bar to elevate your persona to <strong>ADMIN</strong>, then retry accessing the protected resource.
          </span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/50 hover:bg-indigo-500 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Control Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
