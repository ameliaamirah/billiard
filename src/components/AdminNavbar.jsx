// src/components/AdminNavbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function AdminNavbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("nama_kasir");
    localStorage.removeItem("shift");
    localStorage.removeItem("userId");
    window.location.href = "/admin";
  };

  // Mendapatkan judul halaman berdasarkan path
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin-dashboard":
        return "Dashboard Admin";
      case "/monitor":
        return "Monitor Kasir";
      case "/menu-management":
        return "Manajemen Menu";
      case "/manage-kasir":
        return "Kelola Kasir";
      default:
        return "Admin Panel";
    }
  };

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#0b0e14] border-b border-slate-800 px-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle button (mobile only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-all"
        >
          <FontAwesomeIcon icon={faBars} size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00ff99] to-emerald-700 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faCrown} className="text-white text-sm" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-white text-sm">Royal Cue</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Page Title (Desktop) */}
        <div className="hidden md:block text-sm font-medium text-slate-300">
          {getPageTitle()}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">System Online</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider sm:hidden">Online</span>
        </div>
        
        {/* Logout Button (Mobile) */}
        <button
          onClick={handleLogout}
          className="lg:hidden text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <FontAwesomeIcon icon={faSignOutAlt} size={18} />
        </button>
      </div>
    </div>
  );
}