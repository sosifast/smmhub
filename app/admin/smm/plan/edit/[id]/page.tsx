"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Package
} from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function EditSmmPlanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState({
    nama_paket: "",
    durasi: 30,
    total_link: 10,
    backup_server: false,
    price: 0,
    curency: "IDR" as "IDR" | "USD",
    status: "Active" as "Active" | "Not-Active"
  });

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

    if (params.id) {
      fetchPlan();
    }
  }, [router, params.id]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("paket_smm")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nama_paket: data.nama_paket,
          durasi: data.durasi,
          total_link: data.total_link,
          backup_server: data.backup_server,
          price: data.price,
          curency: data.curency as "IDR" | "USD",
          status: data.status as "Active" | "Not-Active"
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch plan:", error);
      showToast(`Gagal memuat data paket: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("paket_smm")
        .update({
          nama_paket: formData.nama_paket,
          durasi: Number(formData.durasi),
          total_link: Number(formData.total_link),
          backup_server: formData.backup_server,
          price: Number(formData.price),
          curency: formData.curency,
          status: formData.status
        })
        .eq("id", params.id);

      if (error) throw error;

      showToast("Paket langganan berhasil diperbarui!", "success");
      
      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/admin/smm/plan");
      }, 1500);

    } catch (error: any) {
      console.error("Failed to update plan:", error);
      showToast(`Gagal memperbarui paket: ${error.message}`, "error");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memuat data paket...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl flex items-center gap-2">
            <Link 
              href="/admin/smm/plan"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            Edit Paket Langganan
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-9">Ubah informasi paket layanan pelanggan.</p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Detail Paket</h2>
              <p className="text-sm text-slate-500">Perbarui informasi paket langganan di bawah ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Nama Paket</label>
              <input
                type="text"
                required
                placeholder="Misal: Paket Pro Bulanan"
                value={formData.nama_paket}
                onChange={(e) => setFormData(prev => ({ ...prev, nama_paket: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Durasi (Hari)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.durasi}
                onChange={(e) => setFormData(prev => ({ ...prev, durasi: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Maksimal Link (Total Link)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.total_link}
                onChange={(e) => setFormData(prev => ({ ...prev, total_link: parseInt(e.target.value) || 0 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Mata Uang</label>
              <select
                value={formData.curency}
                onChange={(e) => setFormData(prev => ({ ...prev, curency: e.target.value as "IDR" | "USD" }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dolar)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Harga</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Not-Active" }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="Active">Aktif</option>
                <option value="Not-Active">Tidak Aktif</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.backup_server}
                    onChange={(e) => setFormData(prev => ({ ...prev, backup_server: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors shadow-inner"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="text-sm font-bold text-slate-700 select-none group-hover:text-slate-900 transition-colors">
                  Aktifkan Backup Server
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
          <Link
            href="/admin/smm/plan"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>

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
