"use client";

import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Server,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DataServer {
  id: string;
  name: string;
  supabase_link: string;
  supabase_anonkey: string;
  supabase_other: any;
  status: "Active" | "Not-Active";
  create_at: string;
}

export default function ServerListPage() {
  const router = useRouter();
  const [servers, setServers] = useState<DataServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_server')
        .select('*')
        .order('create_at', { ascending: false });

      if (error) throw error;
      setServers(data || []);
    } catch (error: any) {
      console.error("Failed to fetch servers:", error);
      alert(`Gagal memuat data server: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus server ini? Data yang dihapus tidak dapat dikembalikan.")) return;
    
    try {
      const { error } = await supabase
        .from('data_server')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update state locally
      setServers(prev => prev.filter(s => s.id !== id));
      alert("Server berhasil dihapus!");
    } catch (error: any) {
      console.error("Failed to delete server:", error);
      alert(`Gagal menghapus server: ${error.message}`);
    }
  };

  const filteredServers = useMemo(() => {
    if (statusFilter === "All") return servers;
    return servers.filter(s => s.status === statusFilter);
  }, [servers, statusFilter]);

  const columnHelper = createColumnHelper<DataServer>();

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Nama Server",
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      )
    }),
    columnHelper.accessor("supabase_link", {
      header: "URL Supabase",
      cell: (info) => (
        <span className="text-xs font-mono text-gray-500 truncate max-w-[200px] block" title={info.getValue()}>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            val === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {val === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {val}
          </span>
        );
      }
    }),
    columnHelper.accessor("create_at", {
      header: "Dibuat",
      cell: (info) => (
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {new Date(info.getValue()).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric"
          })}
        </span>
      )
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      cell: (info) => {
        const srv = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/server/edit/${srv.id}`)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors tooltip-trigger relative group"
            >
              <Pencil className="w-4 h-4" />
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Edit
              </span>
            </button>
            <button
              onClick={() => handleDelete(srv.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors tooltip-trigger relative group"
            >
              <Trash2 className="w-4 h-4" />
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Hapus
              </span>
            </button>
          </div>
        );
      }
    })
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            Data Server Supabase
          </h1>
          <p className="text-sm text-gray-500 mt-2">Kelola daftar koneksi ke server Supabase lainnya.</p>
        </div>
        
        <Link
          href="/admin/server/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Server
        </Link>
      </div>

      {/* Data Table */}
      <DataTable 
        searchPlaceholder="Cari nama server..."
        data={filteredServers}
        columns={columns}
        isLoading={isLoading}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-3 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">Semua</option>
              <option value="Active">Active</option>
              <option value="Not-Active">Not-Active</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
