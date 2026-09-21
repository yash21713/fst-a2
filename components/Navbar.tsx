"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchRoleAction, logoutAction } from "@/app/actions/auth-actions";
import { useState, useTransition } from "react";
import { Shield, UserCheck, Eye, LogOut, Database, Layers, Mail, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  currentSession: {
    userId: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER" | "GUEST";
  } | null;
}

export function Navbar({ currentSession }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRoleSwitch = (role: "ADMIN" | "MEMBER" | "GUEST") => {
    startTransition(async () => {
      try {
        await switchRoleAction(role);
        setFeedback(`Switched to ${role}`);
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: unknown) {
        setFeedback(err instanceof Error ? err.message : "Switch failed");
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setFeedback("Logged out");
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const activeRole = currentSession?.role || "GUEST";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand and Course Badges */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold group-hover:bg-indigo-600/30 transition-all">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">FST A2 LEDGER</span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  CO3 · CO4
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block font-mono">
                Prisma · Edge Proxy · Resend
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
            <Link
              href="/"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === "/"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Control Hub
            </Link>
            <Link
              href="/dashboard"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Member Ledger
            </Link>
            <Link
              href="/admin"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Admin Portal
            </Link>
          </nav>
        </div>

        {/* Right: Quick Role Switcher for Evaluators */}
        <div className="flex items-center gap-3">
          {feedback && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              {feedback}
            </span>
          )}

          <div className="flex items-center rounded-lg border border-white/10 bg-slate-900/80 p-1">
            <span className="px-2 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Persona:
            </span>

            {/* Admin Pill */}
            <button
              onClick={() => handleRoleSwitch("ADMIN")}
              disabled={isPending}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                activeRole === "ADMIN"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Full Administrative Clearance (Users, Audits, Transactions)"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </button>

            {/* Member Pill */}
            <button
              onClick={() => handleRoleSwitch("MEMBER")}
              disabled={isPending}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                activeRole === "MEMBER"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Standard Member (Transactions, Balances, Own Emails)"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Member
            </button>

            {/* Guest Pill */}
            <button
              onClick={() => handleRoleSwitch("GUEST")}
              disabled={isPending}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                activeRole === "GUEST"
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-500/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Guest / Preview Mode (Read-only, Restricted from Financial Actions)"
            >
              <Eye className="h-3.5 w-3.5" />
              Guest
            </button>
          </div>

          {currentSession && (
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout Session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
