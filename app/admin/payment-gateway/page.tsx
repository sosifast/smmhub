"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard,
  Bitcoin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Shield,
  Server
} from "lucide-react";

interface GatewayConfig {
  id?: string;
  type: "Tripay" | "Cryptomus";
  mode: "Sandbox" | "Production";
  api_config: any;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function PaymentGatewayPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Tripay" | "Cryptomus">("Tripay");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Gateway states
  const [tripayConfig, setTripayConfig] = useState<GatewayConfig>({
    type: "Tripay",
    mode: "Sandbox",
    api_config: { apiKey: "", privateKey: "", merchantCode: "" }
  });

  const [cryptomusConfig, setCryptomusConfig] = useState<GatewayConfig>({
    type: "Cryptomus",
    mode: "Sandbox",
    api_config: { merchantId: "", paymentKey: "" }
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
    fetchGateways();
  }, [router]);

  async function fetchGateways() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_gateway")
        .select("*");

      if (error) throw error;

      if (data) {
        data.forEach((gateway: any) => {
          if (gateway.type === "Tripay") {
            setTripayConfig({
              id: gateway.id,
              type: "Tripay",
              mode: gateway.mode as "Sandbox" | "Production",
              api_config: gateway.api_config || { apiKey: "", privateKey: "", merchantCode: "" }
            });
          } else if (gateway.type === "Cryptomus") {
            setCryptomusConfig({
              id: gateway.id,
              type: "Cryptomus",
              mode: gateway.mode as "Sandbox" | "Production",
              api_config: gateway.api_config || { merchantId: "", paymentKey: "" }
            });
          }
        });
      }
    } catch (e: any) {
      console.error("Failed to fetch gateways:", e);
      showToast(`Gagal memuat data: ${e.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (type: "Tripay" | "Cryptomus") => {
    setIsSaving(true);
    try {
      const configToSave = type === "Tripay" ? tripayConfig : cryptomusConfig;
      
      let res;
      if (configToSave.id) {
        // Update existing
        res = await supabase
          .from("payment_gateway")
          .update({
            mode: configToSave.mode,
            api_config: configToSave.api_config
          })
          .eq("id", configToSave.id);
      } else {
        // Insert new
        res = await supabase
          .from("payment_gateway")
          .insert({
            type: configToSave.type,
            mode: configToSave.mode,
            api_config: configToSave.api_config
          })
          .select()
          .single();
      }

      if (res.error) throw res.error;

      // Update local state with ID if new insert
      if (!configToSave.id && res.data) {
        if (type === "Tripay") {
          setTripayConfig(prev => ({ ...prev, id: res.data.id }));
        } else {
          setCryptomusConfig(prev => ({ ...prev, id: res.data.id }));
        }
      }

      showToast(`Konfigurasi ${type} berhasil disimpan!`, "success");
    } catch (e: any) {
      console.error(`Failed to save ${type}:`, e);
      showToast(`Gagal menyimpan konfigurasi: ${e.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTripayChange = (field: string, value: string) => {
    if (field === "mode") {
      setTripayConfig(prev => ({ ...prev, mode: value as any }));
    } else {
      setTripayConfig(prev => ({
        ...prev,
        api_config: { ...prev.api_config, [field]: value }
      }));
    }
  };

  const handleCryptomusChange = (field: string, value: string) => {
    if (field === "mode") {
      setCryptomusConfig(prev => ({ ...prev, mode: value as any }));
    } else {
      setCryptomusConfig(prev => ({
        ...prev,
        api_config: { ...prev.api_config, [field]: value }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Payment Gateway</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your payment providers and API credentials.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200 w-full sm:w-fit shadow-inner">
        <button
          onClick={() => setActiveTab("Tripay")}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "Tripay"
              ? "bg-white text-violet-700 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Tripay
        </button>
        <button
          onClick={() => setActiveTab("Cryptomus")}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "Cryptomus"
              ? "bg-white text-violet-700 shadow-sm border border-slate-200/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Bitcoin className="w-4 h-4" />
          Cryptomus
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-violet-600 animate-spin" />
          </div>
        )}

        {/* Tripay Form */}
        <div className={`p-6 sm:p-8 space-y-8 ${activeTab === "Tripay" ? "block animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}`}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tripay Configuration</h2>
              <p className="text-sm text-slate-500">Local payment gateway for Indonesia.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> Environment Mode
              </label>
              <select
                value={tripayConfig.mode}
                onChange={(e) => handleTripayChange("mode", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="Sandbox">Sandbox (Testing)</option>
                <option value="Production">Production (Live)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Merchant Code
              </label>
              <input
                type="text"
                placeholder="T-XXXXX"
                value={tripayConfig.api_config.merchantCode || ""}
                onChange={(e) => handleTripayChange("merchantCode", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API Key"
                value={tripayConfig.api_config.apiKey || ""}
                onChange={(e) => handleTripayChange("apiKey", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> Private Key
              </label>
              <input
                type="password"
                placeholder="Enter your Private Key"
                value={tripayConfig.api_config.privateKey || ""}
                onChange={(e) => handleTripayChange("privateKey", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSave("Tripay")}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Tripay Config
            </button>
          </div>
        </div>

        {/* Cryptomus Form */}
        <div className={`p-6 sm:p-8 space-y-8 ${activeTab === "Cryptomus" ? "block animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}`}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Bitcoin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cryptomus Configuration</h2>
              <p className="text-sm text-slate-500">Global cryptocurrency payment gateway.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> Environment Mode
              </label>
              <select
                value={cryptomusConfig.mode}
                onChange={(e) => handleCryptomusChange("mode", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
              >
                <option value="Sandbox">Sandbox (Testing)</option>
                <option value="Production">Production (Live)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Merchant ID
              </label>
              <input
                type="text"
                placeholder="Enter Merchant ID"
                value={cryptomusConfig.api_config.merchantId || ""}
                onChange={(e) => handleCryptomusChange("merchantId", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> Payment Key
              </label>
              <input
                type="password"
                placeholder="Enter Payment Key"
                value={cryptomusConfig.api_config.paymentKey || ""}
                onChange={(e) => handleCryptomusChange("paymentKey", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => handleSave("Cryptomus")}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Cryptomus Config
            </button>
          </div>
        </div>
      </div>

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
