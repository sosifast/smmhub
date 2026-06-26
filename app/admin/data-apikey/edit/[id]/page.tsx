"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft,
  Key,
  User,
  Database,
  Link2,
  DollarSign,
  Shield,
  Save,
  CheckCircle,
  Info,
  Lock
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditApiKeyPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [usersList, setUsersList] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states matching api_key table
  const [keyName, setKeyName] = useState("");
  const [keyUserId, setKeyUserId] = useState("");
  const [keyCode, setKeyCode] = useState("");
  const [keyApiKey, setKeyApiKey] = useState("");
  const [keyApiId, setKeyApiId] = useState("");
  const [keySecretKey, setKeySecretKey] = useState("");
  const [keyUrl, setKeyUrl] = useState("");
  const [keyBalance, setKeyBalance] = useState("");
  const [keyStatus, setKeyStatus] = useState<"Active" | "Not-Active">("Active");

  // Fetch users and current key data
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    
    async function loadData() {
      try {
        setIsPageLoading(true);
        // Load active users
        const { data: usersData, error: usersError } = await supabase
          .from("user")
          .select("id, email, full_name")
          .eq("status", "Active");

        if (usersError) throw usersError;
        setUsersList(usersData || []);

        // Load specific api key data
        const { data: keyData, error: keyError } = await supabase
          .from("api_key")
          .select("*")
          .eq("id", id)
          .single();

        if (keyError) throw keyError;

        if (keyData) {
          setKeyName(keyData.name || "");
          setKeyUserId(keyData.id_user || "");
          setKeyCode(keyData.code || "");
          setKeyApiKey(keyData.api_key || "");
          setKeyApiId(keyData.api_id || "");
          setKeySecretKey(keyData.secret_key || "");
          setKeyUrl(keyData.url || "");
          setKeyBalance(String(keyData.balance ?? 0));
          setKeyStatus(keyData.status === "Active" ? "Active" : "Not-Active");
        }
      } catch (err) {
        console.error("Error loading key data for edit:", err);
        alert("Gagal memuat data Kunci API.");
        router.push("/admin/data-apikey");
      } finally {
        setIsPageLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName || !keyUserId) {
      alert("Nama Kunci dan Pemilik wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("api_key")
        .update({
          id_user: keyUserId,
          name: keyName,
          api_key: keyApiKey.trim() || null,
          code: keyCode.trim() || "SMM",
          api_id: keyApiId.trim() || null,
          secret_key: keySecretKey.trim() || null,
          url: keyUrl.trim() || "https://api.smmhub.com/v1",
          balance: Number(keyBalance || 0),
          status: keyStatus,
          update_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Gagal memperbarui Kunci API: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Back link */}
      <div className="mb-6">
        <Link 
          href="/admin/data-apikey"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Kunci API
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Ubah Kunci API</h1>
        <p className="text-sm text-slate-500 mt-1">Ubah detail dan konfigurasi kredensial integrasi provider SMM.</p>
      </div>

      <div className="w-full max-w-full">
        {isPageLoading ? (
          <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-sm text-slate-400 shadow-sm">
            Memuat data kunci...
          </div>
        ) : isSuccess ? (
          /* SUCCESS VIEW */
          <div className="w-full max-w-full p-6 md:p-8 rounded-2xl border border-emerald-250 bg-white shadow-md space-y-6 relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />

            <div className="flex gap-3.5 items-start">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Kunci API Berhasil Diperbarui!</h3>
                <p className="text-xs text-slate-500 mt-1">Perubahan kredensial "{keyName}" telah tersimpan ke sistem.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/admin/data-apikey"
                className="w-full text-center py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 shadow-sm transition-colors text-xs cursor-pointer"
              >
                Kembali ke Daftar Kunci
              </Link>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleUpdateKey} className="w-full max-w-full p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
            
            {/* Form grid layout for 3-column inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Key Name (name) */}
              <div className="space-y-2">
                <label htmlFor="key-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nama Label Kunci API (name) *
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    id="key-name"
                    type="text"
                    required
                    placeholder="e.g. Ternak Follower"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Key Owner (id_user) */}
              <div className="space-y-2">
                <label htmlFor="key-user" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Akun Pemilik Kunci (id_user) *
                </label>
                {usersList.length > 0 ? (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <select
                      id="key-user"
                      value={keyUserId}
                      onChange={(e) => setKeyUserId(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex gap-2">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Tidak ada user aktif tersedia di database.</span>
                  </div>
                )}
              </div>

              {/* Code (code) */}
              <div className="space-y-2">
                <label htmlFor="key-code" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kode Layanan (code)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Database className="w-4 h-4" />
                  </span>
                  <input
                    id="key-code"
                    type="text"
                    placeholder="e.g. SMM"
                    value={keyCode}
                    onChange={(e) => setKeyCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* API Key (api_key) */}
              <div className="space-y-2">
                <label htmlFor="key-api-key" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kunci API (api_key)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="key-api-key"
                    type="text"
                    placeholder="e.g. smm_live_xxxxx"
                    value={keyApiKey}
                    onChange={(e) => setKeyApiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* API ID (api_id) */}
              <div className="space-y-2">
                <label htmlFor="key-api-id" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  API ID (api_id)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Info className="w-4 h-4" />
                  </span>
                  <input
                    id="key-api-id"
                    type="text"
                    placeholder="e.g. api_9910"
                    value={keyApiId}
                    onChange={(e) => setKeyApiId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Secret Key (secret_key) */}
              <div className="space-y-2">
                <label htmlFor="key-secret" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kunci Rahasia (secret_key)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="key-secret"
                    type="text"
                    placeholder="e.g. secret_xxxx"
                    value={keySecretKey}
                    onChange={(e) => setKeySecretKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* URL (url) */}
              <div className="space-y-2">
                <label htmlFor="key-url" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Endpoint URL Integrasi (url)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Link2 className="w-4 h-4" />
                  </span>
                  <input
                    id="key-url"
                    type="url"
                    placeholder="e.g. https://api.smmhub.com/v1"
                    value={keyUrl}
                    onChange={(e) => setKeyUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Balance (balance) */}
              <div className="space-y-2">
                <label htmlFor="key-balance" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Saldo Awal (balance)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    id="key-balance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={keyBalance}
                    onChange={(e) => setKeyBalance(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Status (status) */}
              <div className="space-y-2">
                <label htmlFor="key-status" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status Keaktifan (status)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                  <select
                    id="key-status"
                    value={keyStatus}
                    onChange={(e) => setKeyStatus(e.target.value as "Active" | "Not-Active")}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  >
                    <option value="Active">Active (Aktif)</option>
                    <option value="Not-Active">Not-Active (Tidak Aktif)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href="/admin/data-apikey"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
