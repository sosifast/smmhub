"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  UserPlus, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  X,
  Trash2,
  UserX,
  UserCheck
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  status: "Active" | "Inactive";
  created: string;
}

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Sort State
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"Admin" | "User">("User");

  // Actions menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Authentication check and load users
  useEffect(() => {
    const session = localStorage.getItem("smmhub_session");
    if (!session) {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [router]);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .order("create_at", { ascending: false });

      if (error) throw error;

      // Map Supabase User database records to table structures
      // Supabase uses 'Admin' | 'Member' for level, and 'Active' | 'Not-Active' for status
      const mapped: User[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: u.level === "Admin" ? "Admin" : "User",
        status: u.status === "Active" ? "Active" : "Inactive",
        created: u.create_at ? u.create_at.split("T")[0] : ""
      }));

      setUsers(mapped);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting Handler
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "All" || user.role === roleFilter;
        const matchesStatus = statusFilter === "All" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortField].toString().toLowerCase();
        const bVal = b[sortField].toString().toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // Paginated data slice
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;

  // Database operations
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    try {
      const { error } = await supabase
        .from("user")
        .insert({
          full_name: newUserName,
          email: newUserEmail,
          password: "password123", // Default plain password
          level: newUserRole === "Admin" ? "Admin" : "Member",
          status: "Active"
        });

      if (error) throw error;

      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("User");
      setIsAddModalOpen(false);
      
      // Reload table
      fetchUsers();
    } catch (err: any) {
      alert(`Failed to add user: ${err.message}`);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: User["status"]) => {
    try {
      // Toggle status matching CHECK constraints in schema.sql: ('Active', 'Not-Active')
      const nextDbStatus = currentStatus === "Active" ? "Not-Active" : "Active";
      
      const { error } = await supabase
        .from("user")
        .update({ status: nextDbStatus })
        .eq("id", id);

      if (error) throw error;

      fetchUsers();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? All corresponding API keys will be deleted immediately.")) {
      setActiveMenuId(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("user")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchUsers();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setActiveMenuId(null);
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    return sortDirection === "asc" 
      ? <ChevronUp className="w-3.5 h-3.5 text-violet-600" />
      : <ChevronDown className="w-3.5 h-3.5 text-violet-600" />;
  };

  return (
    <DashboardLayout>
      {/* Title Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Registered Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user profiles, permissions, and security status.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Datatable Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-1.5 pl-2.5 pr-8 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-1.5 pl-2.5 pr-8 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="border border-slate-250 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th 
                  onClick={() => handleSort("name")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    User Details
                    {getSortIcon("name")}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("role")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Role
                    {getSortIcon("role")}
                  </div>
                </th>
                <th className="px-6 py-4">Status</th>
                <th 
                  onClick={() => handleSort("created")}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Created Date
                    {getSortIcon("created")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Retrieving database records...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User Profile column */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {user.name ? user.name.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name || "Unnamed User"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role column */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === "Admin"
                          ? "bg-violet-50 text-violet-600 border border-violet-100"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status column */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        {user.status}
                      </span>
                    </td>

                    {/* Date column */}
                    <td className="px-6 py-4.5 text-xs font-medium text-slate-400">
                      {user.created ? new Date(user.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "-"}
                    </td>

                    {/* Actions column */}
                    <td className="px-6 py-4.5 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Interactive Dropdown */}
                        {activeMenuId === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                            <div className="absolute right-0 mt-1.5 w-40 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                              <button
                                onClick={() => handleToggleStatus(user.id, user.status)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                {user.status === "Active" ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5 text-slate-400" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                    Activate User
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Footer (Pagination Controls) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(currentPage * rowsPerPage, filteredUsers.length)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{filteredUsers.length}</span> results
            </span>

            {/* Rows Per Page selector */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-medium px-2">
              Page <span className="font-bold text-slate-800">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New User Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-xl z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">Add New User</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@smmhub.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "Admin" | "User")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                >
                  <option value="User">User (Standard Account)</option>
                  <option value="Admin">Admin (Full System Privilege)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/10 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
