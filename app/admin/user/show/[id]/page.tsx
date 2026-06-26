"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  Database,
  Link2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Lock
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  level: string;
  status: string;
  password?: string;
  create_at?: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  code: string;
  url: string;
  balance: number;
  status: string;
  create_at?: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function ShowUserPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    fetchUserDetails();
  }, [id, router]);

  async function fetchUserDetails() {
    try {
      setIsLoading(true);
      
      // Fetch user profile info
      const { data: user, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("id", id)
        .single();

      if (userError) throw userError;
      setUserData(user);

      // Fetch user related api keys
      const { data: keys, error: keysError } = await supabase
        .from("api_key")
        .select("*")
        .eq("id_user", id)
        .order("create_at", { ascending: false });

      if (keysError) throw keysError;
      setApiKeys(keys || []);

    } catch (e) {
      console.error("Failed to load user details:", e);
      showToast("User tidak ditemukan atau gagal memuat data.", "error");
      router.push("/admin/user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Back link */}
      <div className="mb-6">
        <Link 
          href="/admin/user"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Registered Users
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Detail Akun User</h1>
        <p className="text-sm text-slate-500 mt-1">Informasi detail profil user beserta daftar kunci API SMM yang terasosiasi.</p>
      </div>

      {isLoading ? (
        <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-sm text-slate-400 shadow-sm">
          Memuat rincian user...
        </div>
      ) : userData ? (
        <div className="w-full space-y-6">
          
          {/* Main Info Card */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-violet-600" />
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex gap-3.5 items-center">
                <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  {userData.full_name ? userData.full_name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{userData.full_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {userData.id}</p>
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  userData.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-slate-50 text-slate-400 border border-slate-200"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${userData.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                  {userData.status}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column - General Profile Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil Akun</h4>
                
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      Nama Lengkap
                    </span>
                    <span className="text-slate-800 font-semibold">{userData.full_name}</span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Email Address
                    </span>
                    <span className="text-slate-800 font-medium select-all">{userData.email}</span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      Tingkat Akses (level)
                    </span>
                    <span className={`px-2 py-0.5 font-bold text-xs rounded-lg ${
                      userData.level === "Admin"
                        ? "bg-violet-50 text-violet-700 border border-violet-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {userData.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Dates & Password */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistem & Keamanan</h4>
                
                <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/30">
                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Terdaftar Sejak
                    </span>
                    <span className="text-slate-800 font-medium">
                      {userData.create_at ? new Date(userData.create_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : "-"}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Status Akun
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      userData.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {userData.status === "Active" ? "Aktif" : "Dinonaktifkan"}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      Kata Sandi (password)
                    </span>
                    <span className="text-slate-800 font-mono select-all">
                      {userData.password || "-"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href={`/admin/user/edit/${userData.id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-colors text-center"
              >
                Ubah Profil User
              </Link>
            </div>
          </div>

          {/* SMM API Keys Linked Card */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <Key className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-bold text-slate-800">Kunci API Terasosiasi</h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 rounded-full">
                {apiKeys.length} Kunci
              </span>
            </div>

            {apiKeys.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider animate-fade-in">
                        <th className="px-4 py-3">Nama Label</th>
                        <th className="px-4 py-3">Kode</th>
                        <th className="px-4 py-3">API URL</th>
                        <th className="px-4 py-3 text-right">Saldo ($)</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-slate-800">{key.name}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-1.5 py-0.5 rounded font-bold bg-violet-50 text-violet-600 border border-violet-100">
                              {key.code || "SMM"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-400 select-all truncate max-w-xs">{key.url}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-semibold">
                            ${Number(key.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                              key.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-50 text-slate-400 border border-slate-200"
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${key.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                              {key.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link 
                              href={`/admin/data-apikey/show/${key.id}`}
                              className="inline-flex px-2.5 py-1 rounded-lg border border-slate-250 bg-white hover:bg-slate-50 font-semibold text-slate-600 transition-colors"
                            >
                              Detail Kunci
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 flex flex-col items-center justify-center gap-2">
                <Info className="w-5 h-5 text-slate-300" />
                <p className="text-sm">Tidak ada Kunci API SMM terintegrasi untuk akun user ini.</p>
                <Link
                  href="/admin/data-apikey/create"
                  className="mt-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm transition-all"
                >
                  Hubungkan Kunci Baru
                </Link>
              </div>
            )}
          </div>
          
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center text-sm text-rose-600 shadow-sm">
          Gagal memuat detail user. Silakan coba kembali.
        </div>
      )}

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
    </>
  );
}
