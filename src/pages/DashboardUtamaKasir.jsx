import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTv, FaCalculator, FaSignOutAlt } from "react-icons/fa";

// 1. IMPORT KEDUA FITUR ANDA DI SINI
import MonitorKasir from "./MonitorKasir"; 
import KasirDashboard from "./KasirDashboard"; // 👈 File billing Anda yang berisi Start/Stop/Print

export default function DashboardUtamaKasir() {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState("monitor"); // State penanda tab aktif

  const handleLogout = () => {
    localStorage.removeItem("token"); // Hapus token login kasir
    navigate("/kasir"); // Tendang balik ke halaman login
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      
      {/* HEADER UTAMA DASHBOARD */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 fixed top-0 w-full z-50 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              ROYAL CUE <span className="text-[#00ff99]">KASIR HUB</span>
            </h1>
          </div>

          {/* SAKLAR TOMBOL PERPINDAHAN NAVIGATION (TABS) */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTabAktif("monitor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tabAktif === "monitor"
                  ? "bg-[#00ff99] text-black shadow-lg shadow-[#00ff99]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaTv /> Monitor Booking
            </button>
            <button
              onClick={() => setTabAktif("billing")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tabAktif === "billing"
                  ? "bg-[#00ff99] text-black shadow-lg shadow-[#00ff99]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FaCalculator /> Billing & Kontrol Meja
            </button>
          </div>
        </div>

        {/* TOMBOL LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <FaSignOutAlt /> Keluar Sistem
        </button>
      </nav>

      {/* KONTEN UTAMA - BERUBAH SECARA DINAMIS */}
      <div className="flex-1 pt-24 bg-slate-950">
        {tabAktif === "monitor" ? (
          <MonitorKasir />
        ) : (
          <KasirDashboard />
        )}
      </div>

    </div>
  );
}