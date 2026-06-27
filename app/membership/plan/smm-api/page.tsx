"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Check, 
  X, 
  CreditCard,
  RefreshCw,
  Server,
  Link as LinkIcon,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PaketSMM {
  id: string;
  nama_paket: string;
  durasi: number;
  desc: any;
  total_link: number;
  backup_server: boolean;
  price: number;
  curency: string;
}

export default function PlanSmmApiPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PaketSMM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('paket_smm')
        .select('*')
        .eq('status', 'Active')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error("Failed to fetch plans:", error);
      alert(`Failed to load plans: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (planId: string, planCurrency: string) => {
    if (planCurrency === "IDR") {
      router.push(`/membership/tri-payment?planId=${planId}`);
    } else {
      alert(`Redirecting to USD payment (e.g. Cryptomus) for plan ID: ${planId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading SMM plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Tabs */}
      <div className="text-center space-y-8 max-w-2xl mx-auto pt-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">SMM API</span> Plan
          </h1>
          <p className="text-lg text-gray-500">
            Boost your social media performance with high-speed, reliable, and affordable API access.
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
            <button
              onClick={() => setCurrency("IDR")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                currency === "IDR" 
                  ? "bg-white text-gray-900 shadow shadow-black/5" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              IDR
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                currency === "USD" 
                  ? "bg-white text-gray-900 shadow shadow-black/5" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              USD
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {plans.filter(p => p.curency === currency).map((plan, index, filteredPlans) => {
          // Buat highlight visual untuk paket di tengah jika jumlahnya 3, atau paket paling mahal dsb.
          const isHighlighted = index === 1 && filteredPlans.length >= 3;
          
          let features: string[] = [];
          if (Array.isArray(plan.desc)) {
            features = plan.desc;
          } else if (typeof plan.desc === 'string') {
            try {
              features = JSON.parse(plan.desc);
            } catch (e) {
              features = [plan.desc];
            }
          }

          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-white rounded-3xl transition-all duration-300 ${
                isHighlighted 
                  ? 'ring-2 ring-brand-500 shadow-xl shadow-brand-500/10 md:-translate-y-4' 
                  : 'border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {isHighlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-brand-500 to-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nama_paket}</h3>
                
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {plan.curency === 'IDR' ? 'Rp' : '$'}
                    {plan.price.toLocaleString("id-ID")}
                  </span>
                  <span className="ml-1 text-sm font-medium text-gray-500">/{plan.durasi} Days</span>
                </div>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-brand-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">Active for <span className="font-bold">{plan.durasi} days</span></p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <LinkIcon className="w-5 h-5 text-brand-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">Up to <span className="font-bold">{plan.total_link} links</span></p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      {plan.backup_server ? (
                        <Server className="w-5 h-5 text-brand-500" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <p className={`ml-3 text-sm ${plan.backup_server ? 'text-gray-700' : 'text-gray-400'}`}>
                      {plan.backup_server ? <span className="font-bold">Backup Server Access</span> : 'No Backup Server'}
                    </p>
                  </li>
                  
                  <div className="my-4 border-t border-gray-100"></div>
                  
                  {Array.isArray(features) && features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 pt-0 mt-auto bg-transparent">
                <button
                  onClick={() => handleSubscribe(plan.id, plan.curency)}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    isHighlighted
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {plans.filter(p => p.curency === currency).length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
          <p className="text-gray-500 font-medium">There are no active {currency} SMM API plans at the moment.</p>
        </div>
      )}
    </div>
  );
}
