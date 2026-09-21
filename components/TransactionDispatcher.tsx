"use client";

import { useState, useTransition } from "react";
import { createTransactionAction } from "@/app/actions/transaction-actions";
import { Send, CheckCircle, AlertCircle, Mail, DollarSign, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { TransactionType } from "@prisma/client";

interface TransactionDispatcherProps {
  currentSession: {
    userId: string;
    email: string;
    name: string;
    role: "ADMIN" | "MEMBER" | "GUEST";
  } | null;
}

export function TransactionDispatcher({ currentSession }: TransactionDispatcherProps) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>("450.00");
  const [currency, setCurrency] = useState<string>("USD");
  const [recipientEmail, setRecipientEmail] = useState<string>("auditor@resend.dev");
  const [recipientName, setRecipientName] = useState<string>("Enterprise Auditor");
  const [type, setType] = useState<TransactionType>(TransactionType.TRANSFER);
  const [description, setDescription] = useState<string>("Cloud Infrastructure Allocation");

  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    transaction?: {
      id: string;
      reference: string;
      amount: number;
      currency: string;
      status: string;
      recipientEmail: string;
      createdAt: Date | string;
    };
    emailDispatch?: {
      success: boolean;
      resendId: string;
      simulated: boolean;
      emailLogId: string;
    };
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await createTransactionAction({
        amount: parseFloat(amount),
        currency,
        recipientEmail,
        recipientName,
        type,
        description,
      });

      setResult(res as typeof result);
    });
  };

  const isGuest = currentSession?.role === "GUEST" || !currentSession;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Transactional Lifecycle Dispatch (Part C)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Atomic Prisma Mutation → Post-Mutation Resend Email Trigger → Database Webhook Traceability
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-indigo-500/10 px-2.5 py-1 text-indigo-400 font-mono font-medium border border-indigo-500/20">
            @react-email/components
          </span>
        </div>
      </div>

      {isGuest && (
        <div className="mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            You are currently browsing as a <strong>GUEST</strong>. Guest personas have read-only access.
            Switch to <strong>Member</strong> or <strong>Admin</strong> using the top bar to execute mutations.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-7 pr-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Transaction Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={TransactionType.TRANSFER}>TRANSFER</option>
              <option value={TransactionType.PAYMENT}>PAYMENT</option>
              <option value={TransactionType.DEPOSIT}>DEPOSIT</option>
              <option value={TransactionType.WITHDRAWAL}>WITHDRAWAL</option>
            </select>
          </div>

          {/* Recipient Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Recipient Email (Notification Target)
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Memo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || isGuest}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/50 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Executing Database Mutation & Email Dispatch...
              </span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Commit Mutation & Dispatch Email
              </>
            )}
          </button>
        </div>
      </form>

      {/* Execution Result Banner */}
      {result && (
        <div className="mt-5 rounded-lg border p-4 font-mono text-xs animate-in fade-in duration-200">
          {result.success ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold text-sm">
                <CheckCircle className="h-4 w-4" />
                Transaction Committed & Lifecycle Email Triggered!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* DB Transaction Telemetry */}
                <div className="rounded bg-slate-950 p-3 border border-white/5 space-y-1.5">
                  <div className="text-slate-400 font-semibold font-sans text-xs">
                    📦 Prisma PostgreSQL Mutation
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <span className="text-indigo-400 font-bold">{result.transaction?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-slate-200">
                      {result.transaction?.currency} {result.transaction?.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">{result.transaction?.status}</span>
                  </div>
                </div>

                {/* Resend Dispatch Telemetry */}
                <div className="rounded bg-slate-950 p-3 border border-white/5 space-y-1.5">
                  <div className="text-slate-400 font-semibold font-sans text-xs">
                    📨 Resend API Lifecycle Event
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resend ID:</span>
                    <span className="text-indigo-400 font-bold">{result.emailDispatch?.resendId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode:</span>
                    <span className="text-amber-400 font-bold">
                      {result.emailDispatch?.simulated ? "Dev Simulation" : "Live Resend API"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EmailLog ID:</span>
                    <span className="text-slate-200 text-[10px]">{result.emailDispatch?.emailLogId}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-sans font-bold">
              <AlertCircle className="h-4 w-4" />
              {result.error || "Mutation Failed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
