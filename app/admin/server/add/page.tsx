"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Server,
  ArrowLeft,
  Save,
  RefreshCw,
  Link as LinkIcon,
  Key
} from "lucide-react";
import Link from "next/link";

export default function AddServerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    supabase_link: "",
    supabase_anonkey: "",
    supabase_other: "", // String to be parsed to JSON
    status: "Active"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let parsedOther = null;
      if (formData.supabase_other.trim()) {
        try {
          parsedOther = JSON.parse(formData.supabase_other);
        } catch (err) {
          throw new Error("Format JSON pada kolom Supabase Other tidak valid.");
        }
      }

      const { error: insertError } = await supabase
        .from("data_server")
        .insert({
          name: formData.name,
          supabase_link: formData.supabase_link,
          supabase_anonkey: formData.supabase_anonkey,
          supabase_other: parsedOther,
          status: formData.status
        });

      if (insertError) throw insertError;

      alert("Server berhasil ditambahkan!");
      router.push("/admin/server");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/server"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl flex items-center gap-3">
              Tambah Server Supabase
            </h1>
            <p className="text-sm text-gray-500 mt-1">Masukkan detail koneksi server baru.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Nama Server</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Misal: SMM Server Utama"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400" /> Supabase URL (Link)
              </label>
              <input
                type="url"
                name="supabase_link"
                required
                value={formData.supabase_link}
                onChange={handleChange}
                placeholder="https://xxxxxx.supabase.co"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" /> Supabase Anon Key
              </label>
              <input
                type="text"
                name="supabase_anonkey"
                required
                value={formData.supabase_anonkey}
                onChange={handleChange}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                <span>Supabase Other Config (Opsional)</span>
                <span className="text-[10px] text-gray-400 font-normal">Format: JSON</span>
              </label>
              <textarea
                name="supabase_other"
                value={formData.supabase_other}
                onChange={handleChange}
                placeholder='{"service_role": "...", "region": "ap-southeast-1"}'
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Not-Active">Not-Active</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <Link
            href="/admin/server"
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Server
          </button>
        </div>
      </form>
    </div>
  );
}
