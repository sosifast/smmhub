"use client";

export default function MemberTopbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
      <div className="flex items-center">
          {/* Tombol Toggle Sidebar Mobile */}
          <button className="text-gray-500 hover:text-gray-700 mr-4 focus:outline-none md:hidden" onClick={toggleSidebar}>
              <i className="fa-solid fa-bars text-xl"></i>
          </button>
      </div>

      {/* Header Right */}
      <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors">
              <i className="fa-regular fa-bell text-xl"></i>
          </button>
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer">
              <img className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100" src="https://placehold.co/100x100/10b981/ffffff?text=U" alt="User Profile" />
              <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-700">Member User</p>
                  <p className="text-xs text-gray-500">Standard Member</p>
              </div>
          </div>
      </div>
    </header>
  );
}
