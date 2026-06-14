// src/pages/DashboardUtamaKasir.jsx (Versi Manual)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faCalculator, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import MonitorKasirKasir from "./MonitorKasirKasir";
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
      
      {/* NAVBAR TOP KASIR */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 fixed top-0 w-full z-50 shadow-lg">
        <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap gap-2 sm:gap-3 justify-between items-center">
          
          {/* Title - Responsive */}
          <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-4">
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white">
              ROYAL CUE <span className="text-[#00ff99]">KASIR</span>
            </h1>

            {/* Tabs - Responsive Grid untuk HP */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-800/30 p-1 rounded-xl">
              <button
                onClick={() => setTabAktif("monitor")}
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-w-[70px] sm:min-w-[90px] ${
                  tabAktif === "monitor"
                    ? "bg-[#00ff99] text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <FontAwesomeIcon icon={faTv} className="text-[10px] sm:text-xs" />
                <span>Monitor</span>
              </button>
              <button
                onClick={() => setTabAktif("billing")}
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-w-[70px] sm:min-w-[90px] ${
                  tabAktif === "billing"
                    ? "bg-[#00ff99] text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <FontAwesomeIcon icon={faCalculator} className="text-[10px] sm:text-xs" />
                <span>Billing</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[80px]"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div className="flex-1 pt-28 sm:pt-24 md:pt-20 px-3 sm:px-4 md:px-6 pb-6 bg-slate-950">
        {tabAktif === "monitor" ? <MonitorKasirKasir /> : <KasirDashboard />}
      </div>
    </div>
  );
}