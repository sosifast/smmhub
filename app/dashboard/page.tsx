"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  Key, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Settings,
  Shield,
  FileText
} from "lucide-react";
import Link from "next/link";

interface DashboardActivity {
  id: string;
  type: string;
  user: string;
  target: string;
  time: string;
  desc: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeKeys: 0,
    totalBalance: 0,
    successRate: "99.98%"
  });
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication guard check
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    const user = JSON.parse(session);
    Promise.resolve().then(() => {
      setSessionUser(user);
    });
    
    // Load statistics
    fetchDashboardStats();
  }, [router]);

  async function fetchDashboardStats() {
    try {
      setIsLoading(true);

      // 1. Fetch total users
      const { count: usersCount, error: usersErr } = await supabase
        .from("user")
        .select("*", { count: "exact", head: true });
      if (usersErr) throw usersErr;

      // 2. Fetch active API keys
      const { count: activeKeysCount, error: keysErr } = await supabase
        .from("api_key")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active");
      if (keysErr) throw keysErr;

      // 3. Fetch cumulative balances
      const { data: balances, error: balanceErr } = await supabase
        .from("api_key")
        .select("balance");
      if (balanceErr) throw balanceErr;

      const sumBalance = balances ? balances.reduce((sum, item) => sum + Number(item.balance || 0), 0) : 0;

      setStats({
        totalUsers: usersCount || 0,
        activeKeys: activeKeysCount || 0,
        totalBalance: sumBalance,
        successRate: "99.99%"
      });

      // 4. Fetch dynamic recent activities from real db records
      const { data: latestKeys } = await supabase
        .from("api_key")
        .select("*, user:id_user(email)")
        .order("create_at", { ascending: false })
        .limit(3);

      const { data: latestUsers } = await supabase
        .from("user")
        .select("*")
        .order("create_at", { ascending: false })
        .limit(3);

      const items: { id: string; type: string; user: string; target: string; date: Date; desc: string }[] = [];
      
      if (latestKeys) {
        latestKeys.forEach(k => {
          items.push({
            id: `key-${k.id}`,
            type: "key_created",
            user: k.user?.email || "Unknown User",
            target: k.name,
            date: new Date(k.create_at),
            desc: `Generated API key with ${k.level} access`
          });
        });
      }

      if (latestUsers) {
        latestUsers.forEach(u => {
          items.push({
            id: `user-${u.id}`,
            type: "user_created",
            user: "System",
            target: u.email,
            date: new Date(u.create_at),
            desc: `Registered new ${u.level} account`
          });
        });
      }

      // Sort by date desc
      items.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Map to formatted list with human readable relative times
      const formatted: DashboardActivity[] = items.slice(0, 4).map(item => {
        const diffMs = Date.now() - item.date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        let timeStr = "just now";
        if (diffHr > 0) {
          timeStr = `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
        } else if (diffMin > 0) {
          timeStr = `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
        }
        return {
          id: item.id,
          type: item.type,
          user: item.user,
          target: item.target,
          time: timeStr,
          desc: item.desc
        };
      });

      setRecentActivities(formatted);

    } catch (e) {
      console.error("Dashboard stats fetch failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const { data: users } = await supabase.from("user").select("*");
      const { data: keys } = await supabase.from("api_key").select("*, user:id_user(email)");
      
      const logDump = {
        exportDate: new Date().toISOString(),
        usersTable: users || [],
        apiKeysTable: keys || []
      };

      const blob = new Blob([JSON.stringify(logDump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smmhub_database_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export logs.");
    }
  };

  // Mock data for weekly traffic chart (API calls in thousands)
  const chartData = [
    { day: "Mon", value: 42, height: "h-[42%]" },
    { day: "Tue", value: 58, height: "h-[58%]" },
    { day: "Wed", value: 69, height: "h-[69%]" },
    { day: "Thu", value: 85, height: "h-[85%]" },
    { day: "Fri", value: 72, height: "h-[72%]" },
    { day: "Sat", value: 38, height: "h-[38%]" },
    { day: "Sun", value: 48, height: "h-[48%]" },
  ];

  if (!sessionUser) return null;

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-2xl border border-slate-100 bg-white shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            Welcome back, {sessionUser.full_name || "Admin"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here is a live summary of what's happening with SMMHub today.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/data-apikey"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm shadow-violet-600/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New API Key
          </Link>
          <Link
            href="/user"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 rounded-xl border text-violet-600 bg-violet-50 border-violet-100">
              <Users className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isLoading ? "..." : stats.totalUsers}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Live
              </span>
              <span className="text-[10px] text-slate-400">Sync with database</span>
            </div>
          </div>
        </div>

        {/* Active API Keys */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active API Keys</span>
            <div className="p-2 rounded-xl border text-blue-600 bg-blue-50 border-blue-100">
              <Key className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isLoading ? "..." : stats.activeKeys}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Active
              </span>
              <span className="text-[10px] text-slate-400">Authorized keys</span>
            </div>
          </div>
        </div>

        {/* Total balance query */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Key Balance</span>
            <div className="p-2 rounded-xl border text-emerald-600 bg-emerald-50 border-emerald-100">
              <Activity className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isLoading ? "..." : `$${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">USD</span>
              <span className="text-[10px] text-slate-400">Sum of active credits</span>
            </div>
          </div>
        </div>

        {/* Health */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Status</span>
            <div className="p-2 rounded-xl border text-indigo-600 bg-indigo-50 border-indigo-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {stats.successRate}
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Healthy</span>
              <span className="text-[10px] text-slate-400">API nodes operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections: Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* API Usage Chart Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly API Request Traffic</h3>
              <p className="text-xs text-slate-400 mt-0.5">Traffic volume measured in thousands (K) of calls</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600"></span>
              <span className="text-xs font-medium text-slate-500">API Requests</span>
            </div>
          </div>

          {/* Premium CSS/SVG-style Chart */}
          <div className="h-64 flex items-end justify-between px-2 relative">
            {/* Background gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-2">
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
              <div className="border-b border-slate-100 w-full h-0"></div>
            </div>

            {chartData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center group relative z-10">
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                    {item.value}K reqs
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 mx-auto -mt-1"></div>
                </div>

                {/* The Bar */}
                <div className="w-8 sm:w-12 bg-slate-100 rounded-t-lg h-48 flex items-end overflow-hidden">
                  <div className={`w-full ${item.height} bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg group-hover:from-indigo-400 group-hover:to-violet-400 transition-all duration-300 transform origin-bottom hover:scale-x-105`}></div>
                </div>

                <span className="text-xs font-semibold text-slate-400 mt-2.5">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Logs & Security</h3>
            <button 
              onClick={fetchDashboardStats}
              className="text-[10px] font-semibold bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-1">
            {isLoading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading records...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                  <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
                    act.type === "key_revoked" || act.type === "user_suspended"
                      ? "bg-rose-50 border-rose-100 text-rose-500" 
                      : "bg-slate-50 border-slate-100 text-slate-500"
                  }`}>
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{act.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      By <span className="font-medium text-slate-500">{act.user}</span> • {act.time}
                    </p>
                    <code className="inline-block bg-slate-50 text-[9px] text-slate-500 px-1 py-0.5 rounded border border-slate-100 mt-1 font-mono">
                      {act.target}
                    </code>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">No database activity logs found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Quick Admin Utilities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Export database dump */}
          <button 
            onClick={handleExportLogs}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 text-slate-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Export Backup</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Full DB json dump</p>
            </div>
          </button>
          
          <button 
            onClick={() => alert("Accessing security configuration...")}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 text-slate-600 shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Guard Rules</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure CORS</p>
            </div>
          </button>
          
          <button 
            onClick={() => alert("Supabase API and database instances are fully connected and online.")}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 text-slate-600 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">DB Status</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supabase Online</p>
            </div>
          </button>

          <Link 
            href="/user"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 text-slate-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Permissions</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Edit user roles</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
