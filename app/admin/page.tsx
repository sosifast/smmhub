"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
import TrafficChart from "@/components/admin/TrafficChart";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface DashboardActivity {
  id: string;
  type: string;
  user: string;
  target: string;
  time: string;
  desc: string;
}

const columnHelper = createColumnHelper<any>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor('customer', {
    header: 'Pelanggan',
  }),
  columnHelper.accessor('date', {
    header: 'Tanggal',
    cell: info => <span className="text-gray-500">{info.getValue()}</span>,
  }),
  columnHelper.accessor('amount', {
    header: 'Jumlah',
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const val = info.getValue();
      let colorClass = 'bg-gray-100 text-gray-700';
      if (val === 'Selesai') colorClass = 'bg-emerald-100 text-emerald-700';
      if (val === 'Proses') colorClass = 'bg-amber-100 text-amber-700';
      return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>{val}</span>;
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <div className="text-right w-full">Aksi</div>,
    cell: () => (
      <div className="text-right">
        <button className="text-gray-400 hover:text-brand-600 transition-colors cursor-pointer">
          <i className="fa-solid fa-ellipsis-vertical px-2"></i>
        </button>
      </div>
    ),
  }),
];

const transactions = [
  { id: "#TRX-1042", customer: "Budi Santoso", date: "25 Jun 2026", amount: "Rp 1.250.000", status: "Selesai" },
  { id: "#TRX-1043", customer: "Siti Aminah", date: "24 Jun 2026", amount: "Rp 850.000", status: "Proses" },
  { id: "#TRX-1044", customer: "Ahmad Dahlan", date: "24 Jun 2026", amount: "Rp 450.000", status: "Selesai" },
  { id: "#TRX-1045", customer: "Rina Marlina", date: "23 Jun 2026", amount: "Rp 2.150.000", status: "Selesai" },
  { id: "#TRX-1046", customer: "Joko Anwar", date: "23 Jun 2026", amount: "Rp 150.000", status: "Proses" },
  { id: "#TRX-1047", customer: "Nadia Vega", date: "22 Jun 2026", amount: "Rp 3.500.000", status: "Selesai" },
];

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
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {sessionUser.full_name || "Admin"}! 👋</h1>
              <p className="text-sm text-gray-500 mt-1">Pantau performa bisnis Anda secara real-time.</p>
          </div>
          <button onClick={handleExportLogs} className="inline-flex items-center justify-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 shadow-sm transition-colors w-full sm:w-auto cursor-pointer">
              <i className="fa-solid fa-download mr-2"></i> Unduh Backup DB
          </button>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {isLoading ? "..." : `$${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </h3>
                  </div>
                  <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                      <i className="fa-solid fa-wallet text-xl"></i>
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-600 font-medium flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                      <i className="fa-solid fa-arrow-trend-up mr-1 text-xs"></i> 12.5%
                  </span>
                  <span className="text-gray-400 ml-2">vs bulan lalu</span>
              </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-gray-500">Pengguna Aktif</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats.totalUsers}</h3>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <i className="fa-solid fa-users text-xl"></i>
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-600 font-medium flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                      <i className="fa-solid fa-arrow-trend-up mr-1 text-xs"></i> 5.2%
                  </span>
                  <span className="text-gray-400 ml-2">vs bulan lalu</span>
              </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "..." : stats.activeKeys}</h3>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <i className="fa-solid fa-box-open text-xl"></i>
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-500 font-medium flex items-center bg-red-50 px-1.5 py-0.5 rounded">
                      <i className="fa-solid fa-arrow-trend-down mr-1 text-xs"></i> 1.4%
                  </span>
                  <span className="text-gray-400 ml-2">vs bulan lalu</span>
              </div>
          </div>

          {/* Card 4 (Solid Color) */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl shadow-md p-5 text-white relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-sm font-medium text-brand-100">Saldo Tersedia</p>
                  <h3 className="text-2xl font-bold mt-1 mb-4">{stats.successRate}</h3>
                  <button className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors w-full sm:w-auto">
                      Tarik Dana
                  </button>
              </div>
              <i className="fa-solid fa-building-columns absolute -bottom-4 -right-2 text-8xl text-white opacity-10 -rotate-12"></i>
          </div>
      </div>

      {/* MAIN LAYOUT (GRAFIK & INFO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Grafik Area (2 Kolom di lg) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <div>
                      <h2 className="text-lg font-bold text-gray-900">Traffic Permintaan API Mingguan</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Volume traffic diukur dalam ribuan (K) calls</p>
                  </div>
                  <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 p-2 outline-none">
                      <option>Minggu Ini</option>
                      <option>Minggu Lalu</option>
                  </select>
              </div>
              
              <TrafficChart />
          </div>

          {/* Aktivitas Terbaru (1 Kolom) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h2>
                  <button onClick={fetchDashboardStats} className="text-[10px] font-semibold bg-brand-50 hover:bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full transition-colors cursor-pointer">
                      Refresh
                  </button>
              </div>
              
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[250px] pr-1">
                  {isLoading ? (
                    <div className="text-center py-10 text-xs text-gray-400">Memuat log aktivitas...</div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((act) => {
                      let iconClass = "fa-shield text-gray-600";
                      let bgClass = "bg-gray-100";
                      
                      if (act.type === "key_created") {
                        iconClass = "fa-key text-brand-600";
                        bgClass = "bg-brand-100";
                      } else if (act.type === "user_created") {
                        iconClass = "fa-user-plus text-emerald-600";
                        bgClass = "bg-emerald-100";
                      } else if (act.type === "key_revoked" || act.type === "user_suspended") {
                        iconClass = "fa-triangle-exclamation text-red-600";
                        bgClass = "bg-red-100";
                      }

                      return (
                        <div key={act.id} className="flex items-start">
                            <div className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center shrink-0 mt-0.5`}>
                                <i className={`fa-solid ${iconClass} text-sm`}></i>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{act.desc}</p>
                                <p className="text-xs text-gray-500 mt-0.5 break-all">{act.target} • {act.time}</p>
                            </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-xs text-gray-400">Tidak ada log aktivitas.</div>
                  )}
              </div>
              
              <Link href="/admin/user" className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-center text-gray-700 hover:bg-gray-50 transition-colors block">
                  Kelola Pengguna
              </Link>
          </div>
      </div>

      {/* TABEL TRANSAKSI MENGGUNAKAN DATA TABLE (TanStack) */}
      <DataTable data={transactions} columns={columns} />
    </>
  );
}
