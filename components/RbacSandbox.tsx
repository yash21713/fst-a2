"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, ArrowRight, RefreshCw, KeyRound, Lock, Unlock } from "lucide-react";
import Link from "next/link";

interface RbacSandboxProps {
  currentRole: "ADMIN" | "MEMBER" | "GUEST";
}

export function RbacSandbox({ currentRole }: RbacSandboxProps) {
  const [testing, setTesting] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<{
    endpoint: string;
    status: number;
    statusText: string;
    payload: unknown;
  } | null>(null);

  const testEndpoint = async (url: string) => {
    setTesting(url);
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({ raw: "Non-JSON response" }));
      setApiResult({
        endpoint: url,
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? "OK" : res.status === 403 ? "Forbidden" : "Unauthorized"),
        payload: data,
      });
    } catch (err: unknown) {
      setApiResult({
        endpoint: url,
        status: 500,
        statusText: "Network Exception",
        payload: { error: err instanceof Error ? err.message : String(err) },
      });
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Edge Middleware RBAC Proxy Gate</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test route clearance and proxy header propagation under your active persona:{" "}
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                currentRole === "ADMIN"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : currentRole === "MEMBER"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {currentRole}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Proxy Gate: <strong className="text-slate-200">Active</strong>
          </span>
        </div>
      </div>

      {/* Routes Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Route 1: /admin */}
        <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">/admin</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Protected web segment. Redirects non-admins to /unauthorized.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {currentRole === "ADMIN" ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Unlock className="h-3.5 w-3.5" /> Allowed
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <Lock className="h-3.5 w-3.5" /> Blocks (403)
                </span>
              )}
            </span>
            <Link
              href="/admin"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              Visit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Route 2: /dashboard */}
        <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">/dashboard</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                MEMBER + ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Member portal. Redirects unauthenticated / guests.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {currentRole !== "GUEST" ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Unlock className="h-3.5 w-3.5" /> Allowed
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <Lock className="h-3.5 w-3.5" /> Redirects
                </span>
              )}
            </span>
            <Link
              href="/dashboard"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              Visit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Route 3: /api/admin/users */}
        <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">/api/admin/users</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                API GATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Protected Route Handler. Returns JSON 403 unless role=ADMIN.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={() => testEndpoint("/api/admin/users")}
              disabled={testing !== null}
              className="w-full text-xs font-semibold py-1.5 px-2.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 flex items-center justify-center gap-1.5 transition-all"
            >
              {testing === "/api/admin/users" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Probe API Gate"
              )}
            </button>
          </div>
        </div>

        {/* Route 4: /api/transactions */}
        <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">/api/transactions</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                API GATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Session-checked endpoint. Filters query by session userId or role.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={() => testEndpoint("/api/transactions")}
              disabled={testing !== null}
              className="w-full text-xs font-semibold py-1.5 px-2.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 flex items-center justify-center gap-1.5 transition-all"
            >
              {testing === "/api/transactions" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Probe API Gate"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Probe Result Inspector */}
      {apiResult && (
        <div className="mt-5 rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans font-semibold">Probe Endpoint:</span>
              <span className="text-indigo-400 font-bold">{apiResult.endpoint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  apiResult.status === 200
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {apiResult.status} {apiResult.statusText}
              </span>
            </div>
          </div>
          <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48 scrollbar-thin">
            {JSON.stringify(apiResult.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
