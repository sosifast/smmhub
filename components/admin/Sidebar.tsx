"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`} 
        onClick={toggleSidebar}
      ></div>

      {/* SIDEBAR */}
      <aside 
        className={`bg-white w-64 h-full border-r border-gray-200 flex flex-col absolute md:relative z-50 transform sidebar-transition ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
            <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center mr-3">
                <i className="fa-solid fa-chart-pie"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Analytix</span>
            
            {/* Tombol Tutup Sidebar Mobile */}
            <button className="ml-auto text-gray-500 hover:text-gray-700 md:hidden" onClick={toggleSidebar}>
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
            <Link 
              href="/admin" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-house w-5 text-center mr-3 transition-colors ${isActive('/admin') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Dashboard
            </Link>
            <Link 
              href="/admin/user" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/user') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-users w-5 text-center mr-3 transition-colors ${isActive('/admin/user') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Pengguna
            </Link>
            <Link 
              href="/admin/data-apikey" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/data-apikey') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-key w-5 text-center mr-3 transition-colors ${isActive('/admin/data-apikey') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Data API Key
            </Link>
            <Link 
              href="/admin/payment-gateway" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/payment-gateway') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-file-invoice-dollar w-5 text-center mr-3 transition-colors ${isActive('/admin/payment-gateway') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Payment Gateway
            </Link>
            
            <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">SMM Management</p>
            </div>
            
            <Link 
              href="/admin/smm/trx" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/smm/trx') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-cart-shopping w-5 text-center mr-3 transition-colors ${isActive('/admin/smm/trx') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                SMM Transactions
            </Link>
            
            <Link 
              href="/admin/smm/plan" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/smm/plan') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-list-check w-5 text-center mr-3 transition-colors ${isActive('/admin/smm/plan') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                SMM Plans
            </Link>

            <Link 
              href="/admin/server" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/server') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-server w-5 text-center mr-3 transition-colors ${isActive('/admin/server') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Data Server
            </Link>
            
            <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lainnya</p>
            </div>
            
            <Link 
              href="/admin/logs" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/logs') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-desktop w-5 text-center mr-3 transition-colors ${isActive('/admin/logs') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Monitoring API
            </Link>
            
            <Link 
              href="/admin/settings" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/admin/settings') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-gear w-5 text-center mr-3 transition-colors ${isActive('/admin/settings') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Pengaturan
            </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200 shrink-0">
            <button className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg group font-medium transition-colors">
                <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center mr-3"></i>
                Keluar
            </button>
        </div>
      </aside>
    </>
  );
}
