import type { Metadata } from "next";
import "./globals.css";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FST Assignment 2: Relational Pipeline, RBAC Proxy & Resend Dispatch",
  description:
    "Normalized PostgreSQL schema, automated faker seed pipeline, Next.js Edge Middleware RBAC proxy, and post-mutation Resend transactional email lifecycle.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar currentSession={session} />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-400 bg-[#090d16]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>FST Assignment 2 · Relational Schema Modeling & Transactional Lifecycle</span>
            <span className="font-mono text-[11px] text-slate-400">
              Docker PostgreSQL :5432 · Next.js 15 · Edge RBAC · Resend API
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
