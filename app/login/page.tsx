"use client";

import { Suspense, useState, useTransition } from "react";
import { switchRoleAction } from "@/app/actions/auth-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, UserCheck, Eye, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MEMBER" | "GUEST">("ADMIN");

  const handleQuickLogin = (role: "ADMIN" | "MEMBER" | "GUEST") => {
    setSelectedRole(role);
    startTransition(async () => {
      await switchRoleAction(role);
      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-md shadow-2xl">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white tracking-tight">Session Gateway</h1>
        <p className="mt-1 text-xs text-slate-400">
          Select an evaluation persona to sign in and test Edge Middleware Proxy Gates
        </p>
      </div>

      {/* 1-Click Evaluation Personas */}
      <div className="mt-6 space-y-3">
        {/* Admin Persona */}
        <button
          onClick={() => handleQuickLogin("ADMIN")}
          disabled={isPending}
          className="w-full text-left p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Dr. Evelyn Vance (Admin)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">admin@enterprise.internal</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
        </button>

        {/* Member Persona */}
        <button
          onClick={() => handleQuickLogin("MEMBER")}
          disabled={isPending}
          className="w-full text-left p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Alexander Chen (Member)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">member@enterprise.internal</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
        </button>

        {/* Guest Persona */}
        <button
          onClick={() => handleQuickLogin("GUEST")}
          disabled={isPending}
          className="w-full text-left p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Jordan Taylor (Guest)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">guest@enterprise.internal</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>

      {isPending && (
        <div className="mt-4 text-center text-xs text-indigo-400 font-mono flex items-center justify-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></span>
          Issuing signed JWT session cookie for {selectedRole}...
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Return to Control Hub
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading gateway...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
