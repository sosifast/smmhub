"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Plus,
  Copy, 
  Check, 
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  owner: string;
  code: string;
  apiId: string;
  secretKey: string;
  usage: number; // mapped to balance in db
  status: "Active" | "Inactive";
  created: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function ApiKeyPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // Copy States
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  // Reveal States
  const [revealedKeyIds, setRevealedKeyIds] = useState<string[]>([]);
  const [revealedSecretIds, setRevealedSecretIds] = useState<string[]>([]);

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
    fetchApiKeys();
  }, [router]);

  async function fetchApiKeys() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("api_key")
        .select("*, user:id_user(email, full_name)")
        .order("create_at", { ascending: false });

      if (error) throw error;

      const mapped: ApiKey[] = (data || []).map((k: any) => ({
        id: k.id,
        name: k.name,
        token: k.api_key || "",
        owner: k.user?.email || "Unknown Owner",
        code: k.code || "",
        apiId: k.api_id || "",
        secretKey: k.secret_key || "",
        usage: Number(k.balance || 0),
        status: k.status === "Active" ? "Active" : "Inactive",
        created: k.create_at ? k.create_at.split("T")[0] : ""
      }));

      setKeys(mapped);
    } catch (e) {
      console.error("Failed to fetch api keys:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSyncAllBalances = async () => {
    if (keys.length === 0) return;
    try {
      setIsSyncing(true);
      showToast("Memulai sinkronisasi saldo seluruh provider...", "info");
      
      const promises = keys.map(async (keyItem) => {
        try {
          const res = await fetch("/api/sync-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: keyItem.id })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
          }
          return { name: keyItem.name, success: true };
        } catch (err: any) {
          console.error(`Error syncing key ${keyItem.id}:`, err);
          return { name: keyItem.name, success: false, error: err.message || String(err) };
        }
      });

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        const failedNames = failed.map(f => f.name).join(", ");
        showToast(`Sinkronisasi selesai. Gagal pada: ${failedNames}`, "error");
      } else {
        showToast("Semua saldo provider berhasil disinkronkan!", "success");
      }
      
      fetchApiKeys();
    } catch (err: any) {
      showToast(`Gagal sinkronisasi saldo: ${err.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 2000);
  };

  const handleCopySecret = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecretId(id);
    setTimeout(() => {
      setCopiedSecretId(null);
    }, 2000);
  };

  const handleToggleReveal = (id: string) => {
    if (revealedKeyIds.includes(id)) {
      setRevealedKeyIds(revealedKeyIds.filter(x => x !== id));
    } else {
      setRevealedKeyIds([...revealedKeyIds, id]);
    }
  };

  const handleToggleRevealSecret = (id: string) => {
    if (revealedSecretIds.includes(id)) {
      setRevealedSecretIds(revealedSecretIds.filter(x => x !== id));
    } else {
      setRevealedSecretIds([...revealedSecretIds, id]);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const keyItem = keys.find(k => k.id === id);
    if (!keyItem) return;

    try {
      const nextDbStatus = keyItem.status === "Active" ? "Not-Active" : "Active";
      
      const { error } = await supabase
        .from("api_key")
        .update({ status: nextDbStatus })
        .eq("id", id);

      if (error) throw error;

      showToast(`Status kunci "${keyItem.name}" berhasil diperbarui!`, "success");
      fetchApiKeys();
    } catch (err: any) {
      showToast(`Gagal memperbarui status kunci: ${err.message}`, "error");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API Key? Any requests utilizing it will fail immediately.")) {
      return;
    }

    try {
      const keyItem = keys.find(k => k.id === id);
      const { error } = await supabase
        .from("api_key")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showToast(`Kunci "${keyItem?.name || ""}" berhasil dihapus!`, "success");
      fetchApiKeys();
    } catch (err: any) {
      showToast(`Gagal menghapus kunci: ${err.message}`, "error");
    }
  };

  const formatToken = (token: string, revealed: boolean) => {
    if (revealed) return token;
    if (token.length <= 13) return token;
    const prefix = token.substring(0, 9);
    const suffix = token.substring(token.length - 4);
    return `${prefix}••••••••••••••••••••${suffix}`;
  };

  const filteredKeys = useMemo(() => {
    return keys.filter((key) => {
      const matchesStatus = statusFilter === "All" || key.status === statusFilter;
      return matchesStatus;
    });
  }, [keys, statusFilter]);

  const columnHelper = createColumnHelper<ApiKey>();

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Key Details",
      cell: (info) => {
        const keyItem = info.row.original;
        return (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">{keyItem.name}</p>
              {keyItem.code && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100">
                  {keyItem.code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Created by {keyItem.owner}</p>
          </div>
        );
      }
    }),
    columnHelper.accessor("token", {
      header: "Token Key",
      enableSorting: false,
      cell: (info) => {
        const keyItem = info.row.original;
        const isRevealed = revealedKeyIds.includes(keyItem.id);
        const isCopied = copiedKeyId === keyItem.id;
        return (
          <div className="flex items-center gap-2 max-w-xs">
            <code className="text-xs font-mono bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg text-slate-600 truncate flex-1 select-all">
              {formatToken(keyItem.token, isRevealed)}
            </code>
            <button
              type="button"
              onClick={() => handleToggleReveal(keyItem.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title={isRevealed ? "Mask Key" : "Reveal Key"}
            >
              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => handleCopy(keyItem.id, keyItem.token)}
                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                    isCopied 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                      : "hover:bg-slate-100 border-transparent text-slate-400 hover:text-slate-600"
                }`}
                title="Copy Token to Clipboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isCopied && (
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10 pointer-events-none whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("apiId", {
      header: "API ID",
      cell: (info) => <span className="font-mono text-xs text-slate-600">{info.getValue() || "-"}</span>
    }),
    columnHelper.accessor("secretKey", {
      header: "Secret Key",
      enableSorting: false,
      cell: (info) => {
        const keyItem = info.row.original;
        const isSecretRevealed = revealedSecretIds.includes(keyItem.id);
        const isSecretCopied = copiedSecretId === keyItem.id;
        
        if (!keyItem.secretKey) {
          return <span className="text-slate-400">-</span>;
        }

        return (
          <div className="flex items-center gap-2 max-w-xs">
            <code className="text-xs font-mono bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg text-slate-600 truncate flex-1 select-all">
              {formatToken(keyItem.secretKey, isSecretRevealed)}
            </code>
            <button
              type="button"
              onClick={() => handleToggleRevealSecret(keyItem.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title={isSecretRevealed ? "Mask Secret" : "Reveal Secret"}
            >
              {isSecretRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => handleCopySecret(keyItem.id, keyItem.secretKey)}
                className={`p-1.5 rounded-lg border transition-all duration-200 ${
                  isSecretCopied 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                    : "hover:bg-slate-100 border-transparent text-slate-400 hover:text-slate-600"
                }`}
                title="Copy Secret to Clipboard"
              >
                {isSecretCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isSecretCopied && (
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10 pointer-events-none whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("usage", {
      header: "Balance ($)",
      cell: (info) => (
        <span className="font-mono text-xs font-semibold text-slate-600">
          ${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          info.getValue() === "Active"
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
            : "bg-slate-50 text-slate-500 border border-slate-200/50"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${info.getValue() === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const keyItem = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/data-apikey/show/${keyItem.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
            >
              Show
            </Link>
            <Link
              href={`/admin/data-apikey/edit/${keyItem.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleToggleStatus(keyItem.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shadow-sm ${
                keyItem.status === "Active"
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {keyItem.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              onClick={() => handleRevokeKey(keyItem.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
            >
              Revoke
            </button>
          </div>
        );
      }
    })
  ], [revealedKeyIds, copiedKeyId, revealedSecretIds, copiedSecretId]);

  return (
    <div className="space-y-6">
      <DataTable 
        title="API Keys"
        description="Generate and manage secure API keys for external SMM integration."
        searchPlaceholder="Search by name, token, or owner..."
        data={filteredKeys}
        columns={columns}
        isLoading={isLoading}
        actionSlot={
          <>
            <button
              type="button"
              onClick={handleSyncAllBalances}
              disabled={isSyncing || isLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Balance
                </>
              )}
            </button>
            <Link
              href="/admin/data-apikey/create"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Baru
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
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
