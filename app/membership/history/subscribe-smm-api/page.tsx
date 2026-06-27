"use client";

import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  History,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface SubscribeTrx {
  id: string;
  id_users: string;
  detail_transaction: any;
  status_payment: "Pending" | "Success" | "Error" | "Expired";
  create_at: string;
  paket_smm: { name: string } | null;
  payment_gateway: { name: string } | null;
  user: { full_name: string } | null;
}

// TODO: Ganti dengan ID User sesungguhnya yang diambil dari sistem autentikasi / session.
// Untuk saat ini (testing), kita tidak mem-filter agar datanya bisa muncul.
// Nanti gunakan .eq('id_users', loggedInUserId)
const LOGGED_IN_USER_ID = null; 

export default function SubscribeHistoryPage() {
  const [transactions, setTransactions] = useState<SubscribeTrx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('langganan_smm')
        .select(`
          id,
          id_users,
          detail_transaction,
          status_payment,
          create_at,
          paket_smm:id_paket_smm(nama_paket),
          payment_gateway:id_payment_gateway(type),
          user:id_users(full_name)
        `)
        .order('create_at', { ascending: false });

      if (LOGGED_IN_USER_ID) {
        query = query.eq('id_users', LOGGED_IN_USER_ID);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      alert(`Failed to load transaction history: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (statusFilter === "All") return transactions;
    return transactions.filter(t => t.status_payment === statusFilter);
  }, [transactions, statusFilter]);

  const columnHelper = createColumnHelper<SubscribeTrx>();

  const columns = useMemo(() => [
    columnHelper.accessor("paket_smm.nama_paket", {
      header: "Plan",
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue() || "N/A"}</span>
      )
    }),
    columnHelper.accessor("payment_gateway.type", {
      header: "Payment Method",
      cell: (info) => (
        <span className="text-sm font-medium text-gray-600">{info.getValue() || "N/A"}</span>
      )
    }),
    columnHelper.accessor("status_payment", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        let colorClass = "";
        let Icon = AlertCircle;

        switch(val) {
          case 'Success':
            colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
            Icon = CheckCircle2;
            break;
          case 'Pending':
            colorClass = "bg-amber-50 text-amber-600 border-amber-200";
            Icon = Clock;
            break;
          case 'Error':
            colorClass = "bg-rose-50 text-rose-600 border-rose-200";
            Icon = XCircle;
            break;
          case 'Expired':
            colorClass = "bg-gray-100 text-gray-600 border-gray-300";
            Icon = AlertCircle;
            break;
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {val}
          </span>
        );
      }
    }),
    columnHelper.accessor("create_at", {
      header: "Transaction Date",
      cell: (info) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(info.getValue()).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}
        </span>
      )
    })
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            SMM API Subscription History
          </h1>
          <p className="text-sm text-gray-500 mt-2">List of your SMM API subscription transactions.</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        searchPlaceholder="Search plans or status..."
        data={filteredTransactions}
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
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
