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
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] flex flex-col justify-between selection:bg-[#B8860B]/20">
      {/* Top Navbar */}
      <nav className="border-b border-[#EADBCE] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-30 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#B8860B]" />
          </div>
          <div>
            <span className="font-black text-sm text-[#2C221E] tracking-tight font-ethiopic">
              አዲስ አበባ ዩኒቨርሲቲ • Addis Ababa University
            </span>
            <p className="text-[11px] text-[#706259] font-medium font-ethiopic">
              የሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት • Smart Attendance System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-xs font-bold text-[#2C221E] rounded-xl shadow-sm transition-all"
          >
            🏛️ Dept Head Portal
          </Link>
          <Link
            href="/instructor"
            className="px-4 py-2 bg-[#FFFFFF] border border-[#EADBCE] hover:border-[#B8860B] text-xs font-bold text-[#2C221E] rounded-xl shadow-sm transition-all"
          >
            👨‍🏫 Instructor Portal
          </Link>
          <Link
            href="/mini-app"
            className="px-4 py-2 btn-ochre text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            📱 Student App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF2DE] border border-[#B8860B]/30 text-xs font-bold text-[#B8860B]">
          <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
          Institutional Grade • Anti-Proxy Verification • Power-Outage Resilient
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2C221E] leading-tight font-ethiopic">
            Smart University Attendance & Cohort Oversight
          </h1>
          <p className="text-sm sm:text-base text-[#706259] max-w-2xl mx-auto leading-relaxed">
            Eliminating proxy attendance through single-device Telegram contact binding, 15-second dynamic visual tokens, and an offline classroom fallback for lecture halls without internet or electricity.
          </p>
        </div>

        {/* 3 Core Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left">
          {/* 1. Department Head Portal */}
          <Link
            href="/dashboard"
            className="warm-card p-6 flex flex-col justify-between space-y-5 group hover:border-[#B8860B]"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF2DE] text-[#B8860B] flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#2C221E] group-hover:text-[#B8860B] transition-colors">
                Department Head Portal
              </h3>
              <p className="text-xs text-[#706259] leading-relaxed">
                Academic Year & Semester tracking across 5 Batches, direct Telegram at-risk warnings, one-click phone calls, drag-and-drop CSV/Excel roster whitelisting, and excuse reconciliation.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B8860B] group-hover:translate-x-1 transition-transform">
              Open Admin Console <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. Instructor Presenter */}
          <Link
            href="/instructor"
            className="warm-card p-6 flex flex-col justify-between space-y-5 group hover:border-[#B8860B]"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#1E7E53] flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#2C221E] group-hover:text-[#B8860B] transition-colors">
                Instructor Presenter
              </h3>
              <p className="text-xs text-[#706259] leading-relaxed">
                15-second dynamic QR code projector screen, high-contrast rolling passcode mode for power outages, and in-class manual check-in for students without smartphones or internet.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E7E53] group-hover:translate-x-1 transition-transform">
              Launch Presenter <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 3. Student Mini App */}
          <Link
            href="/mini-app"
            className="warm-card p-6 flex flex-col justify-between space-y-5 group hover:border-[#B8860B]"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAEAE9] text-[#B83833] flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#2C221E] group-hover:text-[#B8860B] transition-colors">
                Student Telegram Mini App
              </h3>
              <p className="text-xs text-[#706259] leading-relaxed">
                Seamless Telegram integration. Point camera at projector QR or enter rolling passcode with tactile haptic confirmation and live personal attendance health metrics.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B83833] group-hover:translate-x-1 transition-transform">
              Open Student App <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Feature Pillars */}
        <div className="pt-8 border-t border-[#EADBCE] grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm">
            <Lock className="w-4 h-4 text-[#1E7E53] mb-1.5" />
            <p className="text-xs font-bold text-[#2C221E]">Single-Device Anchor</p>
            <p className="text-[10px] text-[#706259]">Telegram contact handshake</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm">
            <UserCheck className="w-4 h-4 text-[#B8860B] mb-1.5" />
            <p className="text-xs font-bold text-[#2C221E]">In-Class Manual Entry</p>
            <p className="text-[10px] text-[#706259]">For students without smartphones</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm">
            <PhoneCall className="w-4 h-4 text-[#B83833] mb-1.5" />
            <p className="text-xs font-bold text-[#2C221E]">At-Risk Intervention</p>
            <p className="text-[10px] text-[#706259]">Telegram warnings & direct call</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADBCE] shadow-sm">
            <Upload className="w-4 h-4 text-[#1E7E53] mb-1.5" />
            <p className="text-xs font-bold text-[#2C221E]">Drag & Drop Upload</p>
            <p className="text-[10px] text-[#706259]">CSV & Excel automatic whitelist</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EADBCE] max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#706259]">
        <p className="font-medium font-ethiopic">የሶፍትዌር ኢንጂነሪንግ ዲፓርትመንት • Addis Ababa University</p>
        <p className="font-semibold text-[#B8860B]">Smart Attendance Integrity System</p>
      </footer>
    </div>
  );
}
