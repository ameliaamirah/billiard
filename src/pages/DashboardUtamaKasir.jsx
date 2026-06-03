// src/pages/DashboardUtamaKasir.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faCalculator, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

// IMPORT YANG BENAR - gunakan MonitorKasirKasir (bukan MonitorKasir)
import MonitorKasirKasir from "./MonitorKasirKasir";  // ← GANTI
import KasirDashboard from "./KasirDashboard"; 

export default function DashboardUtamaKasir() {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState("monitor");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/kasir"); 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      
      {/* NAVBAR TOP KASIR (tetap seperti ini) */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3.5 md:py-4 fixed top-0 w-full z-50 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-8 w-full sm:w-auto">
          <h1 className="text-base md:text-xl font-black tracking-tight text-white text-center sm:text-left">
            ROYAL CUE <span className="text-[#00ff99]">KASIR HUB</span>
          </h1>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
            <button
              onClick={() => setTabAktif("monitor")}
              className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-grow sm:flex-grow-0 ${
                tabAktif === "monitor"
                  ? "bg-[#00ff99] text-black shadow-lg shadow-[#00ff99]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faTv} /> Monitor
            </button>
            <button
              onClick={() => setTabAktif("billing")}
              className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-grow sm:flex-grow-0 ${
                tabAktif === "billing"
                  ? "bg-[#00ff99] text-black shadow-lg shadow-[#00ff99]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faCalculator} /> Billing Meja
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Keluar
        </button>
      </nav>

      {/* KONTEN UTAMA - SEKARANG PAKAI MonitorKasirKasir (tanpa navbar admin) */}
      <div className="flex-1 pt-40 sm:pt-24 px-4 md:px-6 pb-6 bg-slate-950">
        {tabAktif === "monitor" ? <MonitorKasirKasir /> : <KasirDashboard />}
      </div>
    </div>
  );
}