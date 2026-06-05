"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { 
  Search, 
  Plus,
  Copy, 
  Check, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

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

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Sort State
  const [sortField, setSortField] = useState<keyof ApiKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Copy States
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  // Reveal States
  const [revealedKeyIds, setRevealedKeyIds] = useState<string[]>([]);
  const [revealedSecretIds, setRevealedSecretIds] = useState<string[]>([]);

  // Authentication check and load data
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

      // Map Supabase API Key database records to table expectations
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

  // Copy handler
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

  // Toggle reveal handler
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

  // Sorting Handler
  const handleSort = (field: keyof ApiKey) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filtering Logic
  const filteredKeys = useMemo(() => {
    return keys
      .filter((key) => {
        const matchesSearch = 
          key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          key.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
          key.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          key.apiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          key.secretKey.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || key.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aString = aVal.toString().toLowerCase();
        const bString = bVal.toString().toLowerCase();
        if (aString < bString) return sortDirection === "asc" ? -1 : 1;
        if (aString > bString) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [keys, searchQuery, statusFilter, sortField, sortDirection]);

  // Paginated slice
  const paginatedKeys = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredKeys.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredKeys, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredKeys.length / rowsPerPage) || 1;

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

  const getSortIcon = (field: keyof ApiKey) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    return sortDirection === "asc" 
      ? <ChevronUp className="w-3.5 h-3.5 text-violet-600" />
      : <ChevronDown className="w-3.5 h-3.5 text-violet-600" />;
  };

  return (
    <DashboardLayout>
      {/* Page Title with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">API Keys</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and manage secure API keys for external SMM integration.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncAllBalances}
            disabled={isSyncing || isLoading}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Balance
              </>
            )}
          </button>
          <Link
            href="/data-apikey/create"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Baru
          </Link>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search key name, token, owner, api_id, secret_key..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-1.5 pl-2.5 pr-8 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Datatable */}
      <div className="border border-slate-250 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th 
                  onClick={() => handleSort("name")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Key Details
                    {getSortIcon("name")}
                  </div>
                </th>
                <th className="px-6 py-4">Token Key</th>
                <th className="px-6 py-4">API ID</th>
                <th className="px-6 py-4">Secret Key</th>
                <th 
                  onClick={() => handleSort("usage")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Balance ($)
                    {getSortIcon("usage")}
                  </div>
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Retrieving API Key records...
                  </td>
                </tr>
              ) : paginatedKeys.length > 0 ? (
                paginatedKeys.map((keyItem) => {
                  const isRevealed = revealedKeyIds.includes(keyItem.id);
                  const isSecretRevealed = revealedSecretIds.includes(keyItem.id);
                  const isCopied = copiedKeyId === keyItem.id;
                  const isSecretCopied = copiedSecretId === keyItem.id;
                  return (
                    <tr key={keyItem.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name, Owner, and Service Code */}
                      <td className="px-6 py-4.5">
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
                      </td>

                      {/* Token Preview with Copy and Show controls */}
                      <td className="px-6 py-4.5">
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
                          
                          {/* Copy Tooltip */}
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
                      </td>

                      {/* API ID */}
                      <td className="px-6 py-4.5 font-mono text-xs text-slate-600">
                        {keyItem.apiId || "-"}
                      </td>

                      {/* Secret Key Preview with Copy and Show controls */}
                      <td className="px-6 py-4.5">
                        {keyItem.secretKey ? (
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
                            
                            {/* Copy Tooltip */}
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
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Usage (balance) */}
                      <td className="px-6 py-4.5 text-right font-mono text-xs font-semibold text-slate-600">
                        ${keyItem.usage.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          keyItem.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-slate-50 text-slate-400 border border-slate-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${keyItem.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          {keyItem.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/data-apikey/show/${keyItem.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            Show
                          </Link>
                          <Link
                            href={`/data-apikey/edit/${keyItem.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(keyItem.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                              keyItem.status === "Active"
                                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {keyItem.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(keyItem.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No API keys match the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Footer (Pagination Controls) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredKeys.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * rowsPerPage, filteredKeys.length)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{filteredKeys.length}</span> results
            </span>

            {/* Rows Per Page selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-medium px-2">
              Page <span className="font-bold text-slate-800">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold shadow-md backdrop-blur-md transition-all duration-300 animate-toast-slide ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-250 text-emerald-800"
                : toast.type === "error"
                ? "bg-rose-50/90 border-rose-250 text-rose-800"
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
              className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 text-xs"
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
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}
