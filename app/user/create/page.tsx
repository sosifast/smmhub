"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Plus, 
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State for user table fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState<"Admin" | "Member">("Member");
  const [status, setStatus] = useState<"Active" | "Not-Active">("Active");

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Authentication check
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
  }, [router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast("Nama Lengkap, Email, dan Password wajib diisi.", "error");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("user")
        .insert({
          full_name: fullName,
          email: email.trim(),
          password: password,
          level: level,
          status: status
        });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menyimpan User: ${message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Back link */}
      <div className="mb-6">
        <Link 
          href="/user"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Registered Users
        </Link>
      </div>

      {/* Header Title */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Tambah User Baru</h1>
        <p className="text-sm text-slate-500 mt-1">Buat profil user baru berdasarkan skema database.</p>
      </div>

      <div className="w-full max-w-full">
        {isSuccess ? (
          /* SUCCESS VIEW */
          <div className="w-full max-w-full p-6 md:p-8 rounded-2xl border border-emerald-250 bg-white shadow-md space-y-6 relative overflow-hidden">
            {/* Top decorative stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />

            <div className="flex gap-3.5 items-start">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">User Berhasil Disimpan!</h3>
                <p className="text-xs text-slate-500 mt-1">User baru "{fullName}" telah terdaftar ke dalam sistem.</p>
              </div>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden text-sm bg-slate-50/50">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-150">
                    <td className="px-4 py-2.5 font-bold text-slate-500 w-1/4">Nama Lengkap</td>
                    <td className="px-4 py-2.5 text-slate-800">{fullName}</td>
                  </tr>
                  <tr className="border-b border-slate-150">
                    <td className="px-4 py-2.5 font-bold text-slate-500">Email</td>
                    <td className="px-4 py-2.5 text-slate-800">{email}</td>
                  </tr>
                  <tr className="border-b border-slate-150">
                    <td className="px-4 py-2.5 font-bold text-slate-500">Level (Role)</td>
                    <td className="px-4 py-2.5 text-slate-800">{level === "Admin" ? "Admin" : "User (Member)"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-500">Status</td>
                    <td className="px-4 py-2.5 text-slate-800">{status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/user"
                className="w-full text-center py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 shadow-sm transition-colors text-xs cursor-pointer"
              >
                Selesai & Kembali ke Daftar
              </Link>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleCreateUser} className="w-full max-w-full p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
            
            {/* Form grid layout for 3-column inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="full-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nama Lengkap (full_name) *
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="full-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. john@smmhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kata Sandi (password) *
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Masukkan sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Level/Role */}
              <div className="space-y-2">
                <label htmlFor="level" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hak Akses (level) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Shield className="w-4 h-4" />
                  </span>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as "Admin" | "Member")}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  >
                    <option value="Member">User (Member)</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Active" | "Not-Active")}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Not-Active">Not-Active</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href="/user"
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
                    Memproses...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat User Baru
                  </>
                )}
              </button>
            </div>
          </form>
        )}
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
