"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck,
  User as UserIcon,
  ChevronDown
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/user", icon: Users },
    { name: "API Key Management", href: "/data-apikey", icon: Key },
  ];

  // Helper to determine active link
  const isActive = (href: string) => pathname === href;

  // Get dynamic page title
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/user":
        return "User Management";
      case "/data-apikey":
        return "API Key Management";
      default:
        return "SMMHub";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-20">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Branding */}
          <div className="flex items-center h-16 px-6 border-b border-slate-100 gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-600/20 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">SMMHub</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100">PRO</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active 
                      ? "bg-violet-50 text-violet-600 shadow-sm shadow-violet-500/5" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors mb-2">
              <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Admin Demo</p>
                <p className="text-[10px] text-slate-400 truncate">admin@smmhub.com</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWERS */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden animate-fade-in" role="dialog" aria-modal="true">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 pt-5 pb-4">
            {/* Close drawer button */}
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900/60 text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center px-6 gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800">SMMHub</span>
            </div>

            <div className="mt-8 flex-1 h-0 overflow-y-auto px-4 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active 
                        ? "bg-violet-50 text-violet-600" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-violet-600" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  AD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Admin Demo</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@smmhub.com</p>
                </div>
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE MAIN PAGE WRAPPER */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              className="text-slate-500 hover:text-slate-600 md:hidden p-1.5 rounded-lg hover:bg-slate-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 md:text-lg">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button 
              type="button" 
              className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
              onClick={() => alert("No new notifications")}
            >
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">Admin Demo</p>
                      <p className="text-[10px] text-slate-400">admin@smmhub.com</p>
                    </div>
                    <button
                      onClick={() => { setIsProfileDropdownOpen(false); alert("Settings Placeholder"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      My Profile
                    </button>
                    <Link
                      href="/"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Sign Out
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 py-8 px-4 md:px-8">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
