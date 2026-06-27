"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, 
  ArrowLeft,
  RefreshCw,
  Wallet,
  Smartphone,
  Building,
  QrCode
} from "lucide-react";

interface PaketSMM {
  id: string;
  nama_paket: string;
  durasi: number;
  price: number;
  curency: string;
}

// Struktur response dari Tripay API
interface TripayChannel {
  group: string;
  code: string;
  name: string;
  type: string;
  icon_url: string;
  active: boolean;
  total_fee: {
    flat: number;
    percent: number;
  };
}

interface GroupedChannels {
  category: string;
  icon: any; // Lucide icon
  methods: TripayChannel[];
}

// Fungsi bantu untuk memetakan nama grup ke ikon yang sesuai
const getGroupIcon = (groupName: string) => {
  const name = groupName.toLowerCase();
  if (name.includes("virtual account") || name.includes("bank")) return Building;
  if (name.includes("e-wallet") || name.includes("qris")) return Smartphone;
  if (name.includes("retail") || name.includes("store")) return Wallet;
  return CreditCard;
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");

  const [plan, setPlan] = useState<PaketSMM | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentChannels, setPaymentChannels] = useState<GroupedChannels[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<TripayChannel | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      fetchPlanDetailsAndChannels(planId);
    } else {
      setIsLoading(false);
    }
  }, [planId]);

  const fetchPlanDetailsAndChannels = async (id: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch Supabase Plan
      const { data: planData, error: planError } = await supabase
        .from('paket_smm')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) throw new Error(`Gagal memuat detail paket: ${planError.message}`);
      setPlan(planData);

      // 2. Fetch Tripay Channels from Internal API
      const res = await fetch('/api/tripay/channels');
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Gagal mengambil data saluran pembayaran Tripay.");
      }

      // 3. Kelompokkan Data (Grouping) berdasarkan "group"
      const channels: TripayChannel[] = resData.data;
      const groupedMap = new Map<string, TripayChannel[]>();
      
      channels.forEach(ch => {
        if (!ch.active) return; // Hanya ambil yang aktif
        if (!groupedMap.has(ch.group)) {
          groupedMap.set(ch.group, []);
        }
        groupedMap.get(ch.group)!.push(ch);
      });

      const groupedArray: GroupedChannels[] = [];
      groupedMap.forEach((methods, groupName) => {
        groupedArray.push({
          category: groupName,
          icon: getGroupIcon(groupName),
          methods: methods
        });
      });

      setPaymentChannels(groupedArray);

    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedMethod || !plan) {
      alert("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/tripay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          method: selectedMethod.code,
          userId: null // Akan di-handle oleh backend dengan dummy user untuk sementara
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Terjadi kesalahan saat memproses pembayaran.");
      }

      // Redirect browser langsung ke halaman pembayaran Tripay
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error("Checkout URL tidak ditemukan dari respon server.");
      }

    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert(`Gagal membuat tagihan: ${error.message}`);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat rincian pembayaran...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-rose-200">
        <h2 className="text-xl font-bold text-rose-600 mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">{errorMessage}</p>
        <button 
          onClick={() => router.push('/membership/plan/smm-api')}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors"
        >
          Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  if (!planId || !plan) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Paket Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Paket yang Anda pilih tidak valid atau sudah tidak tersedia.</p>
        <button 
          onClick={() => router.push('/membership/plan/smm-api')}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors"
        >
          Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pilih Metode Pembayaran</h1>
          <p className="text-sm text-gray-500">Selesaikan pembayaran Anda menggunakan Tripay secara aman.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {paymentChannels.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
              <p className="text-gray-500 font-medium">Tidak ada metode pembayaran Tripay yang aktif saat ini.</p>
            </div>
          ) : (
            paymentChannels.map((category, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.methods.map((method) => (
                    <label 
                      key={method.code}
                      className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedMethod?.code === method.code 
                          ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="payment_method" 
                        value={method.code}
                        checked={selectedMethod?.code === method.code}
                        onChange={() => setSelectedMethod(method)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Placeholder Kotak Putih jika Logo Gagal Muat */}
                          <div className="w-12 h-8 bg-white border border-gray-100 rounded-md flex-shrink-0 p-1 flex items-center justify-center overflow-hidden">
                            <img src={method.icon_url} alt={method.name} className="max-h-full max-w-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate">{method.name}</span>
                        </div>
                        
                        {/* Check Icon / Radio Button Indicator */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          selectedMethod?.code === method.code ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300'
                        }`}>
                          {selectedMethod?.code === method.code && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Pesanan</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{plan.nama_paket}</p>
                  <p className="text-xs text-gray-500 mt-1">SMM API Subscription - {plan.durasi} Hari</p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  Rp {plan.price.toLocaleString("id-ID")}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Biaya Layanan</span>
                <span className="text-gray-900 font-medium">
                  {selectedMethod ? `Rp ${(selectedMethod.total_fee.flat || 0).toLocaleString("id-ID")}` : "Rp 0"}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Tagihan</span>
                <span className="text-xl font-extrabold text-brand-600">
                  Rp {(plan.price + (selectedMethod?.total_fee.flat || 0)).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedMethod || isProcessing}
              className={`w-full flex justify-center items-center gap-2 mt-8 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${
                !selectedMethod || isProcessing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Bayar Sekarang
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
              <span>Secured by</span>
              <img src="/payment/tripay.webp" alt="Tripay" className="h-4 w-auto object-contain" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TriPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-medium">Memuat form pembayaran...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
