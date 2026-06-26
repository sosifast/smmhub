"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings as SettingsIcon,
  Globe,
  Mail,
  Phone,
  Image as ImageIcon
} from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface SettingsForm {
  id?: string;
  site_name: string;
  favicon: string;
  logo: string;
  email: string;
  phone: string;
  telegram: string;
  instagram: string;
  facebook: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [formData, setFormData] = useState<SettingsForm>({
    site_name: "",
    favicon: "",
    logo: "",
    email: "",
    phone: "",
    telegram: "",
    instagram: "",
    facebook: ""
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          id: data.id,
          site_name: data.site_name || "",
          favicon: data.favicon || "",
          logo: data.logo || "",
          email: data.email || "",
          phone: data.phone || "",
          telegram: data.telegram || "",
          instagram: data.instagram || "",
          facebook: data.facebook || ""
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
      showToast(`Gagal memuat pengaturan: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let query;
      if (formData.id) {
        query = supabase
          .from("settings")
          .update({
            site_name: formData.site_name,
            favicon: formData.favicon,
            logo: formData.logo,
            email: formData.email,
            phone: formData.phone,
            telegram: formData.telegram,
            instagram: formData.instagram,
            facebook: formData.facebook
          })
          .eq("id", formData.id);
      } else {
        query = supabase
          .from("settings")
          .insert({
            site_name: formData.site_name,
            favicon: formData.favicon,
            logo: formData.logo,
            email: formData.email,
            phone: formData.phone,
            telegram: formData.telegram,
            instagram: formData.instagram,
            facebook: formData.facebook
          });
      }

      const { error } = await query;
      if (error) throw error;

      showToast("Pengaturan berhasil disimpan!", "success");
      
      // Re-fetch to get the ID if it was an insert
      if (!formData.id) {
        fetchSettings();
      }

    } catch (error: any) {
      console.error("Failed to save settings:", error);
      showToast(`Gagal menyimpan pengaturan: ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl flex items-center gap-3">
          <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <SettingsIcon className="w-6 h-6" />
          </div>
          Pengaturan Aplikasi
        </h1>
        <p className="text-sm text-gray-500 mt-2">Kelola identitas merek, kontak, dan tautan sosial media platform Anda.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identitas Website */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Identitas Website</h2>
                <p className="text-xs text-gray-500 mt-0.5">Nama situs dan aset logo</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nama Situs (Site Name)</label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  placeholder="Misal: SMM Hub Indonesia"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" /> URL Favicon
                  </label>
                  <input
                    type="url"
                    name="favicon"
                    value={formData.favicon}
                    onChange={handleChange}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                  {formData.favicon && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Preview:</span>
                      <img src={formData.favicon} alt="Favicon preview" className="w-6 h-6 rounded bg-gray-100 object-contain border border-gray-200" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" /> URL Logo
                  </label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                  {formData.logo && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Preview:</span>
                      <img src={formData.logo} alt="Logo preview" className="h-8 rounded bg-gray-100 object-contain border border-gray-200 p-1" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kontak & Informasi */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Kontak & Dukungan</h2>
                <p className="text-xs text-gray-500 mt-0.5">Informasi yang akan ditampilkan ke pelanggan</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Email Utama</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@domain.com"
                    className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nomor Telepon / WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+62 812 3456 7890"
                    className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sosial Media */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Sosial Media</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tautan profil sosial media</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <i className="fa-brands fa-telegram text-[#0088cc] w-4 text-center"></i> Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="https://t.me/username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <i className="fa-brands fa-instagram text-[#E1306C] w-4 text-center"></i> Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <i className="fa-brands fa-facebook text-[#1877F2] w-4 text-center"></i> Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Pengaturan
              </button>
            </div>
          </div>
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
                : "bg-gray-900/90 border-gray-800 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
            )}
            <span className="flex-1 whitespace-pre-wrap">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
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
