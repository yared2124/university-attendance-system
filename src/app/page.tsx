"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Radio,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-slate-800/80 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight">
              UniAttendance <span className="text-sky-400">TMA</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Department of Software Engineering</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/mini-app"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            Launch TMA
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Production IEEE 830 Architecture • Unbreakable Single-Device Verification
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Smart University <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Attendance System
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            Eliminate proxy attendance completely. Powered by Telegram Mini Apps, 15-second dynamic visual tokens, and power-outage resilient in-app rolling codes.
          </p>
        </div>

        {/* 3 Core Portals Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          {/* 1. Student Mini App Card */}
          <Link
            href="/mini-app"
            className="group glass-panel p-6 rounded-3xl border border-slate-800/90 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md shadow-blue-500/10">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Student Telegram Mini App
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native Telegram experience. Point camera at projector QR or enter rolling passcode with tactile haptics.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              Open Mini App <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. Instructor Presenter Card */}
          <Link
            href="/instructor"
            className="group glass-panel p-6 rounded-3xl border border-slate-800/90 hover:border-sky-500/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-md shadow-sky-500/10">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                Instructor Presenter
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic 15-second QR rotation for classroom projectors + high-contrast rolling passcode mode for power outages.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
              Launch Presenter <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 3. Department Head Dashboard Card */}
          <Link
            href="/dashboard"
            className="group glass-panel p-6 rounded-3xl border border-slate-800/90 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Dept Head Executive Panel
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Oversight across 5 batches (Years 1-5), critical risk alerts (&lt;75%), excuse reconciliation, and one-click Excel exports.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Open Executive Panel <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Security & Resilience Pillar Badges */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="glass-card p-4 rounded-2xl border border-slate-800/60">
            <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">Hardware Lock</p>
            <p className="text-[10px] text-slate-400">Telegram Contact Handshake</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800/60">
            <Zap className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">15s Token Rotation</p>
            <p className="text-[10px] text-slate-400">Screenshots rendered useless</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800/60">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">Outage Resilient</p>
            <p className="text-[10px] text-slate-400">Mobile 6-digit rolling code</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800/60">
            <FileSpreadsheet className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">Instant Excel (.xlsx)</p>
            <p className="text-[10px] text-slate-400">One-click formatted rosters</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>Department of Software Engineering • University Attendance Platform</p>
        <p>Serverless Architecture on Vercel • Neon PostgreSQL • Upstash Redis</p>
      </footer>
    </div>
  );
}
