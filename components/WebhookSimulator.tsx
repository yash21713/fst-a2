"use client";

import { useState } from "react";
import { Webhook, CheckCircle2, AlertTriangle, Play, RefreshCw, Server } from "lucide-react";

interface WebhookSimResponse {
  status: number;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export function WebhookSimulator() {
  const [eventType, setEventType] = useState<string>("email.delivered");
  const [targetId, setTargetId] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("auditor@resend.dev");
  const [bounceReason, setBounceReason] = useState<string>("550 5.1.1: Mailbox not found");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<WebhookSimResponse | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setResponse(null);

    const payload = {
      type: eventType,
      created_at: new Date().toISOString(),
      data: {
        email_id: targetId || `re_mock_${Math.random().toString(36).substring(2, 12)}`,
        to: [recipient],
        from: "FST Ledger <onboarding@resend.dev>",
        subject: "Transaction Notification Webhook Test",
        status: eventType.replace("email.", ""),
        bounce:
          eventType === "email.bounced"
            ? { message: bounceReason, type: "hard" }
            : undefined,
      },
    };

    try {
      const res = await fetch("/api/webhooks/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse({ status: res.status, ok: res.ok, data });
    } catch (err: unknown) {
      setResponse({
        status: 500,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Resend Webhook Ingestion Gate (Part C)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest delivery and bounce payloads directly into PostgreSQL EmailLog and AuditLog tables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            POST /api/webhooks/resend
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Event Type */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Simulated Webhook Event
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="email.delivered">email.delivered (Delivery Success)</option>
            <option value="email.bounced">email.bounced (Critical Bounce Alert)</option>
            <option value="email.complained">email.complained (User Spam Flag)</option>
            <option value="email.opened">email.opened (Telemetry Read Event)</option>
            <option value="email.clicked">email.clicked (Telemetry Click Event)</option>
          </select>
        </div>

        {/* Target Resend Email ID */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Target Resend Email ID (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. re_mock_... (blank = auto-generate)"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Recipient Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Recipient Target
          </label>
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {eventType === "email.bounced" && (
        <div className="mt-4">
          <label className="block text-xs font-medium text-rose-300 mb-1">
            Simulated SMTP Bounce Reason
          </label>
          <input
            type="text"
            value={bounceReason}
            onChange={(e) => setBounceReason(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-rose-500/30 bg-slate-950 text-rose-200 focus:outline-none focus:border-rose-500"
          />
        </div>
      )}

      <div className="mt-5 flex items-center justify-end">
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-600/40 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Trigger Ingestion Event
        </button>
      </div>

      {/* Response Preview */}
      {Boolean(response) && (
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-slate-400 font-sans font-semibold">
              Webhook Ingestion Response:
            </span>
            <span
              className={`font-bold ${
                response?.ok ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {response?.status} {response?.ok ? "OK" : "Failed"}
            </span>
          </div>
          <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-40 scrollbar-thin">
            {JSON.stringify(response?.data || response?.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
