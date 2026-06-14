// src/components/AdminSidebar.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, faChartLine, faClock, faUtensils, 
  faUserPlus, faSignOutAlt, faTimes, faChevronRight,
  faHome, faStore
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: faChartLine, path: "/admin-dashboard", description: "Statistik & Overview" },
    { label: "Monitor Kasir", icon: faClock, path: "/monitor", description: "Pantau aktivitas kasir" },
    { label: "Manajemen Menu", icon: faUtensils, path: "/menu-management", description: "Kelola menu F&B" },
    { label: "Kelola Kasir", icon: faUserPlus, path: "/manage-kasir", description: "Tambah/Edit kasir" },
  ];

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen, setSidebarOpen]);

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

  const isActive = (path) => location.pathname === path;

  const getAdminName = () => {
    return localStorage.getItem("username") || "Administrator";
  };

  return (
    <>
      {/* Mobile sidebar backdrop dengan blur effect */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 
          w-64 sm:w-72 lg:w-64 xl:w-72 
          bg-gradient-to-b from-slate-950 to-slate-900 
          border-r border-slate-800
          flex flex-col 
          transition-all duration-300 ease-in-out
          shadow-2xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Admin Sidebar"
      >
        {/* Sidebar Header - dengan tombol close di mobile */}
        <div className="relative flex items-center justify-between gap-3 border-b border-slate-800 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00ff99]/20 rounded-xl blur-sm"></div>
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#00ff99]/10 to-emerald-700/10 border border-[#00ff99]/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faCrown} className="text-[#00ff99] text-base sm:text-lg" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-white text-sm sm:text-base lg:text-lg truncate">
                Royal Cue
              </h2>
              <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-wider">
                Admin System
              </p>
            </div>
          </div>
          
          {/* Close button - hanya di mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} size={16} />
          </button>
        </div>

        {/* User Profile Section - Tambahan */}
        <div className="mx-4 mt-4 p-3 bg-slate-800/30 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00ff99]/20 to-emerald-700/20 rounded-full flex items-center justify-center border border-[#00ff99]/30">
              <span className="text-sm font-black text-[#00ff99]">
                {getAdminName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{getAdminName()}</p>
              <p className="text-[9px] text-[#00ff99] uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Menu Items - dengan scroll untuk mobile */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl 
                font-medium transition-all duration-200 cursor-pointer
                min-h-[44px] sm:min-h-[48px] group
                ${isActive(item.path) 
                  ? "bg-gradient-to-r from-[#00ff99]/15 to-transparent text-[#00ff99] border-l-2 border-[#00ff99]" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }
              `}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <div className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all
                ${isActive(item.path) 
                  ? "bg-[#00ff99]/20 text-[#00ff99]" 
                  : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-700 group-hover:text-white"
                }
              `}>
                <FontAwesomeIcon icon={item.icon} className="text-sm sm:text-base" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs sm:text-sm font-medium">{item.label}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">
                  {item.description}
                </p>
              </div>
              {isActive(item.path) && (
                <FontAwesomeIcon icon={faChevronRight} size={10} className="text-[#00ff99] opacity-70" />
              )}
            </button>
          ))}
        </nav>

        {/* Divider dengan gradient */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 text-[8px] text-slate-600 bg-slate-950">MENU</span>
          </div>
        </div>

        {/* Logout Button dengan konfirmasi */}
        <div className="p-3 sm:p-4">
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin logout?")) {
                handleLogout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer group min-h-[44px]"
            aria-label="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-sm sm:text-base group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium">Logout</span>
          </button>
          
          {/* Version info */}
          <p className="text-center text-[8px] sm:text-[9px] text-slate-600 mt-3">
            Version 2.0.0 | © 2024 Royal Cue
          </p>
        </div>
      </aside>
    </>
  );
}