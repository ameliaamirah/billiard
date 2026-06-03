// src/components/AdminSidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, faChartLine, faClock, faUtensils, 
  faUserPlus, faSignOutAlt 
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: faChartLine, path: "/admin-dashboard" },
    { label: "Monitor Kasir", icon: faClock, path: "/monitor" },
    { label: "Manajemen Menu", icon: faUtensils, path: "/menu-management" },
    { label: "Kelola Kasir", icon: faUserPlus, path: "/manage-kasir" },
  ];

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

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 p-5">
          <div className="w-10 h-10 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faCrown} className="text-[#00ff99] text-lg" />
          </div>
          <div>
            <h2 className="font-black text-white text-lg">Royal Cue</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin System</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                isActive(item.path) 
                  ? "bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-base" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-slate-800 mx-4 my-2"></div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-xl font-medium transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}