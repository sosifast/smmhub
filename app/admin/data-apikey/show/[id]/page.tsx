"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowLeft,
  Key,
  User,
  Database,
  Link2,
  DollarSign,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Calendar,
  Lock
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ShowApiKeyPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [keyData, setKeyData] = useState<any>(null);
  
  // Copy and Reveal states
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    fetchKeyDetails();
  }, [id, router]);

  async function fetchKeyDetails() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("api_key")
        .select("*, user:id_user(email, full_name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setKeyData(data);
    } catch (e) {
      console.error("Failed to load key details:", e);
      alert("Kunci API tidak ditemukan atau gagal memuat data.");
      router.push("/admin/data-apikey");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMaskedToken = (token: string, revealed: boolean) => {
    if (!token) return "-";
    if (revealed) return token;
    if (token.length <= 13) return token;
    const prefix = token.substring(0, 9);
    const suffix = token.substring(token.length - 4);
    return `${prefix}••••••••••••••••••••${suffix}`;
  };

  return (
    <DashboardLayout>
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
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Detail Kunci API</h1>
        <p className="text-sm text-slate-500 mt-1">Detail kredensial integrasi provider SMM untuk koneksi sistem eksternal.</p>
      </div>

      {isLoading ? (
        <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-sm text-slate-400 shadow-sm">
          Memuat detail Kunci API...
        </div>
      ) : keyData ? (
        <div className="w-full space-y-6">
          
          {/* Main Info Card */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-violet-600" />
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex gap-3.5 items-center">
                <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{keyData.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {keyData.id}</p>
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  keyData.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-slate-50 text-slate-400 border border-slate-200"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${keyData.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                  {keyData.status}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column - General & Owner Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Kunci & Pemilik</h4>
                
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      Pemilik (Owner)
                    </span>
                    <span className="text-slate-800 text-right">
                      <p className="font-semibold">{keyData.user?.full_name || "Unknown"}</p>
                      <p className="text-xs text-slate-400">{keyData.user?.email || "-"}</p>
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      Kode Layanan (Code)
                    </span>
                    <span className="px-2 py-0.5 font-bold text-xs bg-slate-100 border border-slate-200 text-slate-700 rounded-lg">
                      {keyData.code || "SMM"}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      Saldo Terakhir (Balance)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ${Number(keyData.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Timestamps & Operations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jejak Waktu & Keaktifan</h4>
                
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Dibuat Pada (Created At)
                    </span>
                    <span className="text-slate-800 font-medium">
                      {keyData.create_at ? new Date(keyData.create_at).toLocaleString("id-ID", { timeZone: "UTC" }) : "-"}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Diperbarui Pada (Updated At)
                    </span>
                    <span className="text-slate-800 font-medium">
                      {keyData.update_at ? new Date(keyData.update_at).toLocaleString("id-ID", { timeZone: "UTC" }) : "-"}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      Status Integrasi
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      keyData.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {keyData.status === "Active" ? "Kredensial Aktif" : "Dinonaktifkan"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Credentials Card Section */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kredensial SMM Provider</h4>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* Integration API URL */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      Endpoint URL Integrasi
                    </p>
                    <code className="text-sm font-mono text-slate-700 select-all">{keyData.url || "-"}</code>
                  </div>
                  <button
                    onClick={() => handleCopyText(keyData.url, setCopiedId)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      copiedId ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId ? "Tersalin!" : "Salin URL"}
                  </button>
                </div>

                {/* API Key (api_key) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      API Key (Token)
                    </p>
                    <code className="text-sm font-mono text-slate-700 truncate block select-all">
                      {formatMaskedToken(keyData.api_key, revealKey)}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRevealKey(!revealKey)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                    >
                      {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopyText(keyData.api_key, setCopiedKey)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        copiedKey ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "hover:bg-slate-100 text-slate-500"
                      }`}
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? "Tersalin!" : "Salin Key"}
                    </button>
                  </div>
                </div>

                {/* API ID (api_id) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      API ID
                    </p>
                    <code className="text-sm font-mono text-slate-700 truncate block select-all">
                      {keyData.api_id || "-"}
                    </code>
                  </div>
                  {keyData.api_id && (
                    <button
                      onClick={() => handleCopyText(keyData.api_id, setCopiedId)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        copiedId ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "hover:bg-slate-100 text-slate-500"
                      }`}
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId ? "Tersalin!" : "Salin ID"}
                    </button>
                  )}
                </div>

                {/* Secret Key (secret_key) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Secret Key
                    </p>
                    <code className="text-sm font-mono text-slate-700 truncate block select-all">
                      {formatMaskedToken(keyData.secret_key, revealSecret)}
                    </code>
                  </div>
                  {keyData.secret_key && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRevealSecret(!revealSecret)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                      >
                        {revealSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopyText(keyData.secret_key, setCopiedSecret)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          copiedSecret ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "hover:bg-slate-100 text-slate-500"
                        }`}
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSecret ? "Tersalin!" : "Salin Secret"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href={`/admin/data-apikey/edit/${keyData.id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-colors text-center"
              >
                Edit Kunci API
              </Link>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center text-sm text-rose-600 shadow-sm">
          Gagal mengambil data Kunci API. Silakan coba lagi.
        </div>
      )}
    </DashboardLayout>
  );
}
