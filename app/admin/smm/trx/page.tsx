"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Check,
  X,
  AlertTriangle,
  User,
  Package
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface Transaction {
  id: string;
  user_name: string;
  user_email: string;
  paket_nama: string;
  price: number;
  curency: string;
  gateway: string;
  status: "Pending" | "Error" | "Expired" | "Success";
  date: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function SmmTrxPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    fetchTransactions();
  }, [router]);

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('langganan_smm')
        .select(`
          id,
          status_payment,
          create_at,
          user:id_users (full_name, email),
          paket_smm:id_paket_smm (nama_paket, price, curency),
          payment_gateway:id_payment_gateway (type)
        `)
        .order('create_at', { ascending: false });

      if (error) throw error;

      const mappedData: Transaction[] = (data || []).map((t: any) => ({
        id: t.id,
        user_name: t.user?.full_name || "Unknown User",
        user_email: t.user?.email || "No Email",
        paket_nama: t.paket_smm?.nama_paket || "Unknown Paket",
        price: t.paket_smm?.price || 0,
        curency: t.paket_smm?.curency || "IDR",
        gateway: t.payment_gateway?.type || "Unknown",
        status: t.status_payment,
        date: t.create_at
      }));
      
      setTransactions(mappedData);
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
      showToast("Gagal mengambil data transaksi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchesStatus = statusFilter === "All" || trx.status === statusFilter;
      return matchesStatus;
    });
  }, [transactions, statusFilter]);

  const columnHelper = createColumnHelper<Transaction>();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success": return <Check className="w-3.5 h-3.5" />;
      case "Pending": return <Clock className="w-3.5 h-3.5" />;
      case "Error": return <X className="w-3.5 h-3.5" />;
      case "Expired": return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Error": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Expired": return "bg-slate-100 text-slate-500 border-slate-300";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "TRX ID",
      cell: (info) => (
        <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200" title={info.getValue()}>
          {info.getValue().substring(0, 8)}...
        </span>
      )
    }),
    columnHelper.accessor("user_name", {
      header: "User",
      cell: (info) => {
        const trx = info.row.original;
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <p className="font-semibold text-slate-800 text-xs truncate" title={trx.user_name}>
                {trx.user_name}
              </p>
              <p className="text-[10px] text-slate-500 truncate" title={trx.user_email}>
                {trx.user_email}
              </p>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("paket_nama", {
      header: "Paket Langganan",
      cell: (info) => {
        const trx = info.row.original;
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <div className="flex flex-col truncate">
              <p className="font-bold text-violet-700 text-xs truncate" title={trx.paket_nama}>
                {trx.paket_nama}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">
                Via {trx.gateway}
              </p>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("price", {
      header: "Tagihan",
      cell: (info) => {
        const trx = info.row.original;
        return (
          <span className="font-mono text-sm font-bold text-slate-700">
            {trx.curency} {Number(trx.price).toLocaleString("id-ID")}
          </span>
        );
      }
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            {status}
          </span>
        );
      }
    }),
    columnHelper.accessor("date", {
      header: "Tanggal",
      cell: (info) => (
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {info.getValue() ? new Date(info.getValue()).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "-"}
        </span>
      )
    })
  ], []);

  return (
    <div className="space-y-6">
      <DataTable 
        title="Transaksi Langganan SMM"
        description="Monitor status pembayaran dan langganan paket pengguna."
        searchPlaceholder="Cari ID transaksi atau pengguna..."
        data={filteredTransactions}
        columns={columns}
        isLoading={isLoading}
        filterSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 py-2 pl-3 pr-8 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Expired">Expired</option>
              <option value="Error">Error</option>
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
