"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Package,
  Server,
  Link as LinkIcon
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface PaketSmm {
  id: string;
  nama_paket: string;
  durasi: number;
  total_link: number;
  backup_server: boolean;
  status: "Active" | "Not-Active";
  price: number;
  curency: "IDR" | "USD";
  create_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function SmmPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PaketSmm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    fetchPlans();
  }, [router]);

  async function fetchPlans() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("paket_smm")
        .select("*")
        .order("create_at", { ascending: false });

      if (error) throw error;

      const mapped: PaketSmm[] = (data || []).map((p: any) => ({
        id: p.id,
        nama_paket: p.nama_paket,
        durasi: p.durasi,
        total_link: p.total_link,
        backup_server: p.backup_server,
        status: p.status,
        price: p.price,
        curency: p.curency,
        create_at: p.create_at,
      }));

      setPlans(mapped);
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesStatus = statusFilter === "All" || plan.status === statusFilter;
      return matchesStatus;
    });
  }, [plans, statusFilter]);

  const columnHelper = createColumnHelper<PaketSmm>();

  const columns = useMemo(() => [
    columnHelper.accessor("nama_paket", {
      header: "Paket Langganan",
      cell: (info) => {
        const plan = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center border border-violet-200">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-slate-800 text-sm">{plan.nama_paket}</p>
              <p className="text-xs text-slate-500">{plan.durasi} Hari Durasi</p>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("price", {
      header: "Harga",
      cell: (info) => {
        const plan = info.row.original;
        return (
          <span className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            {plan.curency} {Number(plan.price).toLocaleString('id-ID')}
          </span>
        );
      }
    }),
    columnHelper.accessor("total_link", {
      header: "Fasilitas",
      cell: (info) => {
        const plan = info.row.original;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span><b className="text-slate-800">{plan.total_link}</b> Links Max</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Server className={`w-3.5 h-3.5 ${plan.backup_server ? "text-emerald-500" : "text-slate-400"}`} />
              <span>Backup Server: <b className={plan.backup_server ? "text-emerald-600" : "text-slate-500"}>{plan.backup_server ? "Yes" : "No"}</b></span>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
          info.getValue() === "Active"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-50 text-slate-500 border border-slate-200"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${info.getValue() === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
          {info.getValue() === "Active" ? "Aktif" : "Tidak Aktif"}
        </span>
      )
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const plan = info.row.original;

        const handleDelete = async (e: React.MouseEvent) => {
          e.preventDefault();
          if (!confirm(`Apakah Anda yakin ingin menghapus paket "${plan.nama_paket}"?`)) return;
          
          try {
            const { error } = await supabase
              .from("paket_smm")
              .delete()
              .eq("id", plan.id);
              
            if (error) throw error;
            showToast(`Paket "${plan.nama_paket}" berhasil dihapus.`, "success");
            fetchPlans();
          } catch (error: any) {
            showToast(`Gagal menghapus paket: ${error.message}`, "error");
          }
        };

        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/smm/plan/edit/${plan.id}`}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-600 transition-colors tooltip-trigger relative group border border-transparent hover:border-slate-200"
            >
              <Edit className="w-4 h-4" />
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Edit Paket
              </span>
            </Link>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors tooltip-trigger relative group border border-transparent hover:border-rose-100"
            >
              <Trash2 className="w-4 h-4" />
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Hapus Paket
              </span>
            </button>
          </div>
        );
      }
    })
  ], []);

  return (
    <div className="space-y-6">
      <DataTable 
        title="Paket Langganan SMM"
        description="Kelola paket langganan (subscription plans) yang tersedia untuk pengguna."
        searchPlaceholder="Cari nama paket..."
        data={filteredPlans}
        columns={columns}
        isLoading={isLoading}
        actionSlot={
          <>
            <button
              type="button"
              onClick={fetchPlans}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-slate-400" : ""}`} />
              Refresh
            </button>
            <Link
              href="/admin/smm/plan/add"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Paket
            </Link>
          </>
        }
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 py-2 pl-3 pr-8 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
            >
              <option value="All">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Not-Active">Tidak Aktif</option>
            </select>
          </div>
        }
      />

      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-xl backdrop-blur-xl transition-all duration-300 animate-toast-slide ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : toast.type === "error"
                ? "bg-rose-50/90 border-rose-200 text-rose-800"
                : "bg-slate-900/90 border-slate-800 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
            )}
            <span className="flex-1 whitespace-pre-wrap">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-toast-slide {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
