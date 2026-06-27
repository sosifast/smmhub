import React from 'react';
import { CreditCard, History, User } from 'lucide-react';
import Link from 'next/link';

export default function MembershipDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Member Hub!</h1>
          <p className="text-brand-100 max-w-xl">
            Manage your SMM API subscriptions, monitor transaction history, and buy new plans easily through our unified dashboard.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-brand-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Stats / Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Riwayat Langganan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Subscription History</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Monitor the status of your transactions and SMM API subscriptions.</p>
          <Link href="/membership/history/subscribe-smm-api" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
            View History &rarr;
          </Link>
        </div>

        {/* Beli Paket Baru */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Buy New Plan</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Select and activate the latest SMM API subscription plans.</p>
          <Link href="/membership/plan/smm-api" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
            View Plans &rarr;
          </Link>
        </div>
        
        {/* Pengaturan Akun */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Manage your account details and security preferences.</p>
          <span className="text-sm font-bold text-amber-600 flex items-center gap-1 cursor-pointer">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
