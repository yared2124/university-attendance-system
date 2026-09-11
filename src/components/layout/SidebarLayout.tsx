"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Layers,
  Users,
  AlertTriangle,
  FileCheck,
  Upload,
  Clock,
  BookOpen,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Home,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  portalTitle: string;
  portalSubtitle: string;
  userRoleLabel: string;
  userName: string;
  navItems: NavItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  topHeaderActions?: React.ReactNode;
  academicTerm?: string;
  children: React.ReactNode;
}

export default function SidebarLayout({
  portalTitle,
  portalSubtitle,
  userRoleLabel,
  userName,
  navItems,
  activeItemId,
  onSelectItem,
  topHeaderActions,
  academicTerm,
  children,
}: SidebarProps) {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => item.id === activeItemId);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C221E] flex flex-col md:flex-row">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-[#FFFFFF] border-r border-[#EADBCE] flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto shadow-sm">
        <div className="p-5 space-y-6">
          {/* Institutional Branding */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#EADBCE]">
            <div className="w-11 h-11 rounded-2xl bg-[#FBF2DE] border border-[#B8860B]/30 flex items-center justify-center text-[#B8860B] shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#FBF2DE] text-[#B8860B] px-1.5 py-0.2 rounded border border-[#B8860B]/30">
                Injibara Univ
              </span>
              <h1 className="text-sm font-black text-[#2C221E] tracking-tight truncate mt-0.5">
                {portalTitle}
              </h1>
              <p className="text-[11px] text-[#706259] truncate font-medium">
                {portalSubtitle}
              </p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#EADBCE] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B8860B]">
                {userRoleLabel}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#1E7E53] animate-pulse" />
            </div>
            <p className="text-xs font-bold text-[#2C221E] truncate">{userName}</p>
            <p className="text-[11px] text-[#706259] truncate">Department of Software Engineering</p>
          </div>

          {/* Navigation Action Buttons (Left Side) */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#706259] px-2">
              Navigation Menu
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeItemId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left group ${
                      isActive
                        ? "bg-[#B8860B] text-white shadow-md shadow-[#B8860B]/20 translate-x-1"
                        : "bg-[#FFFFFF] hover:bg-[#FBF2DE] text-[#706259] hover:text-[#2C221E] border border-transparent hover:border-[#EADBCE]"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={isActive ? "text-white" : "text-[#B8860B]"}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isActive
                            ? "bg-white text-[#B8860B]"
                            : item.badgeColor || "bg-[#FAEAE9] text-[#B83833]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-[#EADBCE] space-y-2 bg-[#FAF7F2]">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#706259] hover:text-[#2C221E] hover:bg-[#FFFFFF] transition-all"
          >
            <Home className="w-4 h-4 text-[#B8860B]" />
            <span>University Gateway</span>
          </Link>
          <Link
            href="/logout"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#FAEAE9] hover:bg-[#F8D7DA] text-[#B83833] font-bold text-xs transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-[#B83833]" />
              <span>Sign Out (Logout)</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </Link>
        </div>
      </aside>
 
      {/* RIGHT MAIN CONTENT AREA WITH TOPBAR */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sleek Institutional Topbar */}
        <header className="bg-[#FFFFFF] border-b border-[#EADBCE] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-[#706259]">
              {portalTitle}
            </span>
            <span className="text-[#EADBCE]">/</span>
            <span className="text-xs font-black text-[#2C221E] uppercase tracking-wide flex items-center gap-2">
              {currentItem?.icon && (
                <span className="text-[#B8860B]">{currentItem.icon}</span>
              )}
              {currentItem?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {academicTerm && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FBF2DE] text-[#B8860B] border border-[#B8860B]/30">
                {academicTerm}
              </span>
            )}
            {topHeaderActions}
          </div>
        </header>

        {/* Content Container */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
