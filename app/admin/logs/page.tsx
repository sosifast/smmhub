"use client";

import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Monitor,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Globe,
  ArrowRight,
  ShieldAlert,
  Zap,
  User as UserIcon
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface ApiLog {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  statusCode: number;
  latencyMs: number;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  userName?: string | null;
  userEmail?: string | null;
}

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select(`
          id,
          endpoint,
          method,
          status_code,
          latency_ms,
          ip_address,
          user_agent,
          create_at,
          user:id_user (full_name, email)
        `)
        .order('create_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const mappedData: ApiLog[] = (data || []).map((t: any) => ({
        id: t.id,
        endpoint: t.endpoint,
        method: t.method,
        statusCode: t.status_code,
        latencyMs: t.latency_ms,
        ipAddress: t.ip_address || "Unknown",
        userAgent: t.user_agent || "Unknown",
        timestamp: t.create_at,
        userName: t.user?.full_name || null,
        userEmail: t.user?.email || null,
      }));
      
      setLogs(mappedData);
    } catch (error: any) {
      console.error("Failed to load API logs. Details:", error.message || JSON.stringify(error));
      alert(`Gagal memuat log API: ${error.message || 'Tabel api_logs mungkin belum dibuat di database.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchMethod = methodFilter === "All" || log.method === methodFilter;
      
      let matchStatus = true;
      if (statusFilter === "Success") matchStatus = log.statusCode >= 200 && log.statusCode < 300;
      if (statusFilter === "ClientError") matchStatus = log.statusCode >= 400 && log.statusCode < 500;
      if (statusFilter === "ServerError") matchStatus = log.statusCode >= 500;

      return matchMethod && matchStatus;
    });
  }, [logs, methodFilter, statusFilter]);

  const columnHelper = createColumnHelper<ApiLog>();

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POST': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PUT': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-600 bg-emerald-50';
    if (code >= 400 && code < 500) return 'text-amber-600 bg-amber-50';
    if (code >= 500) return 'text-rose-600 bg-rose-50';
    return 'text-gray-600 bg-gray-50';
  };

  const columns = useMemo(() => [
    columnHelper.accessor("endpoint", {
      header: "Endpoint",
      cell: (info) => {
        const log = info.row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(log.method)}`}>
                {log.method}
              </span>
              <span className="font-semibold text-gray-900 text-sm truncate max-w-[200px]" title={log.endpoint}>{log.endpoint}</span>
            </div>
            {log.userName && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                <UserIcon className="w-3 h-3 text-indigo-500" />
                <span className="truncate max-w-[200px]" title={log.userEmail || ""}>{log.userName}</span>
              </div>
            )}
          </div>
        );
      }
    }),
    columnHelper.accessor("statusCode", {
      header: "Status",
      cell: (info) => {
        const code = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold font-mono ${getStatusColor(code)}`}>
            {code >= 200 && code < 300 && <CheckCircle2 className="w-3.5 h-3.5" />}
            {code >= 400 && code < 500 && <AlertCircle className="w-3.5 h-3.5" />}
            {code >= 500 && <ShieldAlert className="w-3.5 h-3.5" />}
            {code}
          </span>
        );
      }
    }),
    columnHelper.accessor("latencyMs", {
      header: "Latency",
      cell: (info) => {
        const ms = info.getValue();
        let colorClass = "text-emerald-600";
        if (ms > 200) colorClass = "text-amber-600";
        if (ms > 1000) colorClass = "text-rose-600";
        
        return (
          <span className={`flex items-center gap-1.5 text-xs font-mono font-bold ${colorClass}`}>
            <Clock className="w-3.5 h-3.5" />
            {ms} ms
          </span>
        );
      }
    }),
    columnHelper.accessor("ipAddress", {
      header: "Client IP",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-gray-600">{info.getValue()}</span>
          <span className="text-[10px] text-gray-400 truncate max-w-[150px]" title={info.row.original.userAgent}>
            {info.row.original.userAgent}
          </span>
        </div>
      )
    }),
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (info) => (
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {new Date(info.getValue()).toLocaleString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit"
          })}
        </span>
      )
    })
  ], []);

  // Calculate Metrics
  const totalRequests = logs.length;
  const errorRate = totalRequests === 0 ? 0 : Math.round((logs.filter(l => l.statusCode >= 400).length / totalRequests) * 100);
  const avgLatency = totalRequests === 0 ? 0 : Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalRequests);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Monitor className="w-6 h-6" />
          </div>
          Monitoring API Mobile
        </h1>
        <p className="text-sm text-gray-500 mt-2">Lacak performa, error, dan request dari aplikasi mobile secara real-time.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Request</p>
            <p className="text-2xl font-black text-gray-800">{totalRequests}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className={`p-4 rounded-xl ${errorRate > 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {errorRate > 10 ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Error Rate (4xx & 5xx)</p>
            <p className="text-2xl font-black text-gray-800">{errorRate}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className={`p-4 rounded-xl ${avgLatency > 500 ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Rata-rata Latency</p>
            <p className="text-2xl font-black text-gray-800">{avgLatency} ms</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        title="Log Aktivitas API"
        description="Detail request masuk ke endpoint /api-mobile/*"
        searchPlaceholder="Cari endpoint atau IP..."
        data={filteredLogs}
        columns={columns}
        isLoading={isLoading}
        actionSlot={
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
        }
        filterSlot={
          <>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-3 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">Semua Method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-3 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">Semua Status</option>
              <option value="Success">Success (2xx)</option>
              <option value="ClientError">Client Error (4xx)</option>
              <option value="ServerError">Server Error (5xx)</option>
            </select>
          </>
        }
      />
    </div>
  );
}
