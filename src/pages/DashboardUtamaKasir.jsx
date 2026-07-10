// src/pages/DashboardUtamaKasir.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faCalculator, faSignOutAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

import MonitorKasirKasir from "./MonitorKasirKasir";
import KasirDashboard from "./KasirDashboard"; 

export default function DashboardUtamaKasir() {
  const navigate = useNavigate();
  const [tabAktif, setTabAktif] = useState("monitor");
  const [loading, setLoading] = useState(false);
  const [kasirInfo, setKasirInfo] = useState({ nama: "", shift: "" });

  // Ambil info kasir dari localStorage
  useEffect(() => {
    const namaKasir = localStorage.getItem("nama_kasir") || "Kasir";
    const shiftKasir = localStorage.getItem("shift") || "Pagi";
    setKasirInfo({ nama: namaKasir, shift: shiftKasir });
  }, []);

  // --- FUNGSI LOGOUT YANG BENAR ---
  const handleLogout = async () => {
    // Konfirmasi logout
    if (!window.confirm("Apakah Anda yakin ingin logout?")) {
      return;
    }

    try {
      setLoading(true);
      
      // 1. Set flag logout di sessionStorage untuk mencegah redirect balik
      sessionStorage.setItem('isLoggingOut', 'true');
      
      // 2. Hapus semua data dari localStorage
      localStorage.clear();
      
      // 3. Hapus sessionStorage (selain flag yang sudah di-set)
      const logoutFlag = sessionStorage.getItem('isLoggingOut');
      sessionStorage.clear();
      if (logoutFlag) {
        sessionStorage.setItem('isLoggingOut', 'true');
      }
      
      // 4. Hapus cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 5. Sign out dari Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase logout error:", error);
      }
      
      // 6. Redirect ke halaman login kasir menggunakan window.location
      //    untuk force reload dan clear semua state React
      window.location.href = '/kasir';
      
    } catch (error) {
      console.error("Logout error:", error);
      // Jika ada error, tetap redirect ke login
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/kasir';
    }
  };

  // Fungsi untuk kembali ke halaman sebelumnya jika perlu
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      
      {/* NAVBAR TOP KASIR */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 fixed top-0 w-full z-50 shadow-lg">
        <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap gap-2 sm:gap-3 justify-between items-center">
          
          {/* Title - Responsive */}
          <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white">
                ROYAL CUE <span className="text-[#00ff99]">KASIR</span>
              </h1>
              {/* Tampilkan info kasir */}
              <span className="hidden sm:inline-block text-[8px] sm:text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {kasirInfo.nama} • Shift {kasirInfo.shift}
              </span>
            </div>

            {/* Tabs - Responsive Grid untuk HP */}
            <div className="flex gap-1.5 sm:gap-2 bg-slate-800/30 p-1 rounded-xl">
              <button
                onClick={() => setTabAktif("monitor")}
                disabled={loading}
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-w-[70px] sm:min-w-[90px] ${
                  tabAktif === "monitor"
                    ? "bg-[#00ff99] text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FontAwesomeIcon icon={faTv} className="text-[10px] sm:text-xs" />
                <span>Monitor</span>
              </button>
              <button
                onClick={() => setTabAktif("billing")}
                disabled={loading}
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-w-[70px] sm:min-w-[90px] ${
                  tabAktif === "billing"
                    ? "bg-[#00ff99] text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FontAwesomeIcon icon={faCalculator} className="text-[10px] sm:text-xs" />
                <span>Billing</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[80px] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span>Logout...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div className="flex-1 pt-28 sm:pt-24 md:pt-20 px-3 sm:px-4 md:px-6 pb-6 bg-slate-950">
        {tabAktif === "monitor" ? <MonitorKasirKasir /> : <KasirDashboard />}
      </div>

      {/* Loading Overlay saat logout */}
      {loading && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-bold text-sm">Logging out...</p>
          </div>
        </div>
      )}
    </div>
  );
}