"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  QrCode,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Sparkles,
  Lock,
  PhoneCall,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Upload,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-500/30">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">
              Addis Ababa University
            </span>
            <p className="text-[10px] text-slate-400 font-medium">
              Department of Software Engineering • Attendance System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
          >
            Admin Console
          </Link>
          <Link
            href="/mini-app"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl shadow-sm transition-all"
          >
            Student App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-14 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Institutional Grade • Anti-Proxy Verification • Power-Outage Resilient
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Smart University Attendance & Cohort Oversight
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminating proxy attendance through single-device Telegram contact binding, 15-second dynamic visual tokens, and an offline classroom fallback for lecture halls without internet or electricity.
          </p>
        </div>

        {/* 3 Core Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left">
          {/* 1. Department Head Portal */}
          <Link
            href="/dashboard"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                Department Head Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Academic Year & Semester tracking across 5 Batches, direct Telegram at-risk warnings, one-click phone calls, drag-and-drop CSV/Excel roster whitelisting, and excuse reconciliation.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              Open Admin Console <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. Instructor Presenter */}
          <Link
            href="/instructor"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Instructor Presenter
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                15-second dynamic QR code projector screen, high-contrast rolling passcode mode for power outages, and in-class manual check-in for students without smartphones or internet.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
              Launch Presenter <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 3. Student Mini App */}
          <Link
            href="/mini-app"
            className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Student Telegram Mini App
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless Telegram integration. Point camera at projector QR or enter rolling passcode with tactile haptic confirmation and live personal attendance health metrics.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Open Student App <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Feature Pillars */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <Lock className="w-4 h-4 text-emerald-400 mb-1.5" />
            <p className="text-xs font-bold text-white">Single-Device Anchor</p>
            <p className="text-[10px] text-slate-400">Telegram contact handshake</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <UserCheck className="w-4 h-4 text-blue-400 mb-1.5" />
            <p className="text-xs font-bold text-white">In-Class Manual Entry</p>
            <p className="text-[10px] text-slate-400">For students without smartphones</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <PhoneCall className="w-4 h-4 text-rose-400 mb-1.5" />
            <p className="text-xs font-bold text-white">At-Risk Intervention</p>
            <p className="text-[10px] text-slate-400">Telegram warnings & direct call</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
            <Upload className="w-4 h-4 text-sky-400 mb-1.5" />
            <p className="text-xs font-bold text-white">Drag & Drop Upload</p>
            <p className="text-[10px] text-slate-400">CSV & Excel automatic whitelist</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>Department of Software Engineering • Addis Ababa University</p>
        <p>Production Next.js 15 • Serverless Architecture</p>
      </footer>
    </div>
  );
}
