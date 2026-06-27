"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MemberSidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/membership') {
      return pathname === '/membership';
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
                <i className="fa-solid fa-user-astronaut"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Member Hub</span>
            
            {/* Tombol Tutup Sidebar Mobile */}
            <button className="ml-auto text-gray-500 hover:text-gray-700 md:hidden" onClick={toggleSidebar}>
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
            <Link 
              href="/membership" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/membership') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-house w-5 text-center mr-3 transition-colors ${isActive('/membership') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Dashboard
            </Link>
            
            <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">API Subscriptions</p>
            </div>
            
            <Link 
              href="/membership/history/subscribe-smm-api" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/membership/history/subscribe-smm-api') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-clock-rotate-left w-5 text-center mr-3 transition-colors ${isActive('/membership/history/subscribe-smm-api') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Subscription History
            </Link>

            <Link 
              href="/membership/plan/smm-api" 
              className={`flex items-center px-3 py-2.5 rounded-lg group font-medium transition-colors ${
                isActive('/membership/plan/smm-api') 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
              }`}
            >
                <i className={`fa-solid fa-cart-plus w-5 text-center mr-3 transition-colors ${isActive('/membership/plan/smm-api') ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}></i>
                Buy API Plan
            </Link>
        </nav>

        {/* Footer Sidebar / Info User Singkat */}
        <div className="p-4 border-t border-gray-200">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-rose-600 group font-medium transition-colors">
                <i className="fa-solid fa-right-from-bracket w-5 text-center text-gray-400 group-hover:text-rose-500 transition-colors"></i>
                Back to Home
            </Link>
        </div>
      </aside>
    </>
  );
}
