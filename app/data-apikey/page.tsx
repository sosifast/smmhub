"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  Key, 
  Plus,
  Copy, 
  Check, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  X,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  owner: string;
  level: "Read" | "Read/Write" | "Full Access";
  usage: number; // mapped to balance in db
  status: "Active" | "Inactive";
  created: string;
}

export default function ApiKeyPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usersList, setUsersList] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Sort State
  const [sortField, setSortField] = useState<keyof ApiKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Copy State
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Reveal Token State
  const [revealedKeyIds, setRevealedKeyIds] = useState<string[]>([]);

  // Create Key Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyUserId, setNewKeyUserId] = useState("");
  const [newKeyLevel, setNewKeyLevel] = useState<ApiKey["level"]>("Read/Write");
  
  // Newly generated key screen in modal
  const [newlyCreatedKeyToken, setNewlyCreatedKeyToken] = useState<string | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Authentication check and load data
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    fetchApiKeys();
    fetchUsers();
  }, [router]);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("api_key")
        .select("*, user:id_user(email, full_name)")
        .order("create_at", { ascending: false });

      if (error) throw error;

      // Map Supabase API Key database records to table expectations
      // We map the DB column secret_key to store and display the key level
      // and display the balance as usage limits
      const mapped: ApiKey[] = (data || []).map((k: any) => ({
        id: k.id,
        name: k.name,
        token: k.api_key || "",
        owner: k.user?.email || "Unknown Owner",
        level: (k.secret_key as any) || "Read/Write",
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
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("id, email, full_name")
        .eq("status", "Active");
      if (error) throw error;
      setUsersList(data || []);
      if (data && data.length > 0) {
        setNewKeyUserId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load user dropdown list:", e);
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

  // Toggle reveal handler
  const handleToggleReveal = (id: string) => {
    if (revealedKeyIds.includes(id)) {
      setRevealedKeyIds(revealedKeyIds.filter(x => x !== id));
    } else {
      setRevealedKeyIds([...revealedKeyIds, id]);
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
          key.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === "All" || key.level === levelFilter;
        const matchesStatus = statusFilter === "All" || key.status === statusFilter;
        return matchesSearch && matchesLevel && matchesStatus;
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
  }, [keys, searchQuery, levelFilter, statusFilter, sortField, sortDirection]);

  // Paginated slice
  const paginatedKeys = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredKeys.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredKeys, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredKeys.length / rowsPerPage) || 1;

  // Database operations
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyUserId) return;

    try {
      // Generate a cryptographically random-looking token
      const randomHex = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const generatedToken = `smm_live_${randomHex}`;

      const { error } = await supabase
        .from("api_key")
        .insert({
          id_user: newKeyUserId,
          name: newKeyName,
          api_key: generatedToken,
          secret_key: newKeyLevel, // Save the visual level inside secret_key column
          balance: 100.00, // Default opening balance
          status: "Active",
          code: "SMM",
          api_id: "api_" + Math.floor(Math.random() * 10000),
          url: "https://api.smmhub.com/v1"
        });

      if (error) throw error;

      setNewlyCreatedKeyToken(generatedToken);
      fetchApiKeys();
    } catch (err: any) {
      alert(`Failed to generate key: ${err.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewKeyName("");
    if (usersList.length > 0) {
      setNewKeyUserId(usersList[0].id);
    }
    setNewKeyLevel("Read/Write");
    setNewlyCreatedKeyToken(null);
  };

  const handleToggleStatus = async (id: string) => {
    const keyItem = keys.find(k => k.id === id);
    if (!keyItem) return;

    try {
      // Database CHECK constraints are ('Active', 'Not-Active')
      const nextDbStatus = keyItem.status === "Active" ? "Not-Active" : "Active";
      
      const { error } = await supabase
        .from("api_key")
        .update({ status: nextDbStatus })
        .eq("id", id);

      if (error) throw error;

      fetchApiKeys();
    } catch (err: any) {
      alert(`Failed to update key status: ${err.message}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API Key? Any requests utilizing it will fail immediately.")) {
      setActiveMenuId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("api_key")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchApiKeys();
    } catch (err: any) {
      alert(`Failed to revoke key: ${err.message}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  const formatToken = (token: string, revealed: boolean) => {
    if (revealed) return token;
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Generate API Key
        </button>
      </div>

      {/* Filter Options */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search key name, token, owner..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Access</span>
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-1.5 pl-2.5 pr-8 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Levels</option>
              <option value="Read">Read Only</option>
              <option value="Read/Write">Read/Write</option>
              <option value="Full Access">Full Access</option>
            </select>
          </div>

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
                <th 
                  onClick={() => handleSort("level")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Access Level
                    {getSortIcon("level")}
                  </div>
                </th>
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
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Retrieving API Key records...
                  </td>
                </tr>
              ) : paginatedKeys.length > 0 ? (
                paginatedKeys.map((keyItem) => {
                  const isRevealed = revealedKeyIds.includes(keyItem.id);
                  const isCopied = copiedKeyId === keyItem.id;
                  return (
                    <tr key={keyItem.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Owner */}
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="font-semibold text-slate-800">{keyItem.name}</p>
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

                      {/* Access Level */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          keyItem.level === "Full Access"
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                            : keyItem.level === "Read/Write"
                            ? "bg-violet-50 text-violet-600 border border-violet-100"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}>
                          <Lock className="w-3 h-3 shrink-0" />
                          {keyItem.level}
                        </span>
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

                      {/* Actions Trigger */}
                      <td className="px-6 py-4.5 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === keyItem.id ? null : keyItem.id)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === keyItem.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                              <div className="absolute right-0 mt-1.5 w-40 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                                <button
                                  onClick={() => handleToggleStatus(keyItem.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  <Key className="w-3.5 h-3.5 text-slate-400" />
                                  {keyItem.status === "Active" ? "Deactivate Key" : "Activate Key"}
                                </button>
                                <button
                                  onClick={() => handleRevokeKey(keyItem.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  Revoke Key
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
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

      {/* Generate API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-xl z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {newlyCreatedKeyToken ? "API Key Generated" : "Generate API Key"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newlyCreatedKeyToken ? (
              // Success generated view
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs flex gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Copy this key now!</p>
                    <p className="mt-0.5">For security reasons, you won't be able to see this token again after closing this window.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Token</span>
                  <div className="flex gap-2">
                    <code className="flex-1 text-xs font-mono bg-slate-50 border border-slate-150 p-3 rounded-xl text-slate-700 select-all break-all leading-normal">
                      {newlyCreatedKeyToken}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy("newly-created", newlyCreatedKeyToken)}
                      className={`px-4 rounded-xl border flex items-center justify-center transition-all ${
                        copiedKeyId === "newly-created"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "hover:bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      {copiedKeyId === "newly-created" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 shadow-sm transition-colors text-xs mt-4"
                >
                  I've Saved the Key
                </button>
              </div>
            ) : (
              // Generation Form View
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Android App Client"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Owner Account</label>
                  {usersList.length > 0 ? (
                    <select
                      value={newKeyUserId}
                      onChange={(e) => setNewKeyUserId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-rose-500">
                      No active users available in the system database. Please create a user account first.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Permissions Access</label>
                  <select
                    value={newKeyLevel}
                    onChange={(e) => setNewKeyLevel(e.target.value as ApiKey["level"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                  >
                    <option value="Read">Read Only (Restricted Access)</option>
                    <option value="Read/Write">Read/Write (Standard Access)</option>
                    <option value="Full Access">Full Access (Super Administrative)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newKeyUserId}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
