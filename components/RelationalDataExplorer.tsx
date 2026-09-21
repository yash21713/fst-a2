"use client";

import { useState } from "react";
import { Users, Shield, Receipt, FileText, Mail, ChevronRight, Activity } from "lucide-react";

interface RelationalDataProps {
  roles: Array<{ id: string; name: string; description: string | null; _count: { users: number } }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    avatarUrl: string | null;
    role: { name: string };
    _count: { transactions: number; emailLogs: number; auditLogs: number };
  }>;
  transactions: Array<{
    id: string;
    reference: string;
    amount: string | number;
    currency: string;
    type: string;
    status: string;
    recipientEmail: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    ipAddress: string | null;
    createdAt: string;
    user: { name: string; email: string } | null;
    details: unknown;
  }>;
  emailLogs: Array<{
    id: string;
    resendEmailId: string | null;
    toEmail: string;
    templateName: string;
    subject: string;
    status: string;
    errorMessage: string | null;
    createdAt: string;
  }>;
}

export function RelationalDataExplorer({
  roles,
  users,
  transactions,
  auditLogs,
  emailLogs,
}: RelationalDataProps) {
  const [activeTab, setActiveTab] = useState<"users" | "transactions" | "auditLogs" | "emailLogs" | "roles">(
    "users"
  );

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Normalized Multi-Entity Schema Explorer (Part A)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Relational integrity backed by PostgreSQL with strict foreign keys and automated Faker seed records
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "transactions" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("auditLogs")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "auditLogs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("emailLogs")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "emailLogs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email Logs ({emailLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "roles" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Roles ({roles.length})
          </button>
        </div>
      </div>

      {/* Tables Content */}
      <div className="mt-5 overflow-x-auto">
        {/* Users Tab */}
        {activeTab === "users" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Identity</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Txns</th>
                <th className="pb-3 text-center">Emails</th>
                <th className="pb-3 text-center">Audits</th>
                <th className="pb-3 text-right">User ID (UUID)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
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
                    <span className="text-emerald-400 text-[11px] font-medium">● ACTIVE</span>
                  </td>
                  <td className="py-2.5 text-center text-slate-300">{u._count.transactions}</td>
                  <td className="py-2.5 text-center text-slate-300">{u._count.emailLogs}</td>
                  <td className="py-2.5 text-center text-slate-300">{u._count.auditLogs}</td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {u.id.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Sender (User)</th>
                <th className="pb-3">Recipient</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 font-bold text-indigo-400">{t.reference}</td>
                  <td className="py-2.5 font-sans">
                    <div className="font-medium text-slate-200">{t.user.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.user.email}</div>
                  </td>
                  <td className="py-2.5 text-slate-300 text-[11px]">{t.recipientEmail}</td>
                  <td className="py-2.5 font-bold text-slate-200">
                    {t.currency} {Number(t.amount).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : t.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "auditLogs" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {auditLogs.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5">
                    <span
                      className={`font-bold text-[11px] ${
                        a.action.includes("BOUNCE") || a.action.includes("CRITICAL")
                          ? "text-rose-400"
                          : a.action.includes("ROLE")
                          ? "text-amber-400"
                          : "text-indigo-400"
                      }`}
                    >
                      {a.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{a.entity}</td>
                  <td className="py-2.5 text-slate-400 text-[11px]">
                    {a.user ? a.user.email : "System / Edge"}
                  </td>
                  <td className="py-2.5 text-slate-400">{a.ipAddress || "127.0.0.1"}</td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Email Logs Tab */}
        {activeTab === "emailLogs" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Resend ID</th>
                <th className="pb-3">Recipient</th>
                <th className="pb-3">Template</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Delivery Notes / Error</th>
                <th className="pb-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {emailLogs.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 text-indigo-400 font-bold">{e.resendEmailId || e.id.substring(0, 12)}</td>
                  <td className="py-2.5 text-slate-200">{e.toEmail}</td>
                  <td className="py-2.5 text-slate-400">{e.templateName}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : e.status === "SENT"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : e.status === "BOUNCED"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 text-[11px] max-w-xs truncate">
                    {e.errorMessage || "Delivered via Resend Dispatcher"}
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Role Name</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Assigned Users</th>
                <th className="pb-3 text-right">Role ID (UUID)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-bold text-white">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        r.name === "ADMIN"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : r.name === "MEMBER"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {r.name}
                    </span>
                  </td>
                  <td className="py-3 font-sans text-slate-300 max-w-md">{r.description}</td>
                  <td className="py-3 text-center font-bold text-emerald-400">{r._count.users}</td>
                  <td className="py-3 text-right text-slate-400 text-[11px]">{r.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
