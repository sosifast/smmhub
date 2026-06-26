"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  UserPlus, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { createColumnHelper } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  status: "Active" | "Inactive";
  created: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: User["status"]) => {
    try {
      const nextDbStatus = currentStatus === "Active" ? "Not-Active" : "Active";
      
      const { error } = await supabase
        .from("user")
        .update({ status: nextDbStatus })
        .eq("id", id);

      if (error) throw error;

      showToast(`Status user berhasil diubah menjadi ${nextDbStatus === "Active" ? "Aktif" : "Tidak Aktif"}.`, "success");
      fetchUsers();
    } catch (err: any) {
      showToast(`Gagal mengubah status: ${err.message}`, "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? All corresponding API keys will be deleted immediately.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showToast("User berhasil dihapus.", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(`Gagal menghapus user: ${err.message}`, "error");
    }
  };

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "User Details",
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.name || "Unnamed User"}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
          info.getValue() === "Admin"
            ? "bg-violet-50 text-violet-700 border border-violet-200"
            : "bg-slate-50 text-slate-600 border border-slate-200"
        }`}>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
          info.getValue() === "Active"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-50 text-slate-500 border border-slate-200"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${info.getValue() === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor("created", {
      header: "Created Date",
      cell: (info) => (
        <span className="text-sm font-medium text-slate-500">
          {info.getValue() ? new Date(info.getValue()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) : "-"}
        </span>
      )
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/user/show/${user.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
            >
              Show
            </Link>
            <Link
              href={`/admin/user/edit/${user.id}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleToggleStatus(user.id, user.status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors shadow-sm ${
                user.status === "Active"
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {user.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              onClick={() => handleDeleteUser(user.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        );
      }
    })
  ], []);

  return (
    <div className="space-y-6">
      <DataTable 
        title="Registered Users"
        description="Manage user profiles, permissions, and security status."
        searchPlaceholder="Search by name or email..."
        data={filteredUsers}
        columns={columns}
        isLoading={isLoading}
        actionSlot={
          <Link
            href="/admin/user/create"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </Link>
        }
        filterSlot={
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 py-2 pl-3 pr-8 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 py-2 pl-3 pr-8 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        }
      />

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
