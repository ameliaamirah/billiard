// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClock, faCheckCircle, faTimesCircle, 
  faCalendarAlt, faMoneyBillWave,
  faClipboardList, faSpinner, faHourglassHalf,
  faPlayCircle, faUserPlus, faArrowRight, faUsers
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { useRealtimeNotification } from "../hooks/useRealtimeNotification";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statistik, setStatistik] = useState({
    totalReservasi: 0,
    reservasiHariIni: 0,
    totalUsers: 0, // Mengubah totalMember menjadi totalUsers
    totalKasir: 0,
    pendapatanHariIni: 0,
  });
  const [dataReservasi, setDataReservasi] = useState([]);
  const [error, setError] = useState(null);
  const [targetOmsetHarian, setTargetOmsetHarian] = useState(1000000);
  const [isTargetNotified, setIsTargetNotified] = useState(false);

  const { notifyStokMenipis, notifyTargetTercapai } = useRealtimeNotification();

  const checkStokMenu = async () => {
    try {
      const { data: menu, error } = await supabase
        .from("menu_fb")
        .select("id, nama, stok, kategori")
        .lt("stok", 6)
        .gt("stok", 0);

      if (error) throw error;

      if (menu && menu.length > 0) {
        menu.forEach(item => {
          notifyStokMenipis(item);
        });
      }

      const { data: habis, error: habisError } = await supabase
        .from("menu_fb")
        .select("id, nama, stok, kategori")
        .eq("stok", 0);

      if (habisError) throw habisError;

      if (habis && habis.length > 0) {
        habis.forEach(item => {
          notifyStokMenipis({ ...item, stok: 0 });
        });
      }
    } catch (error) {
      console.error("Error checking stok:", error);
    }
  };

  const checkTargetOmset = (omset) => {
    if (!isTargetNotified && omset >= targetOmsetHarian) {
      notifyTargetTercapai(targetOmsetHarian, omset);
      setIsTargetNotified(true);
    }
    if (omset < targetOmsetHarian) {
      setIsTargetNotified(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkStokMenu();
    const stokInterval = setInterval(checkStokMenu, 5 * 60 * 1000);
    return () => clearInterval(stokInterval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });

      if (reservasiError) throw reservasiError;

      let usersData = [];
      try {
        // Mengambil semua user tanpa filter role agar mendapatkan 'Total Users' yang utuh
        const { data, error } = await supabase
          .from("users")
          .select("*");
        if (!error) usersData = data || [];
      } catch (e) {
        console.warn("Tabel users gagal diakses:", e.message);
        usersData = [];
      }

      // Menghitung jumlah kasir secara spesifik dari data users
      const totalKasir = usersData.filter(u => u.role === "kasir").length;

      const { data: riwayat, error: riwayatError } = await supabase
        .from("riwayat_transaksi")
        .select("*");

      if (riwayatError) throw riwayatError;

      const today = new Date().toISOString().split('T')[0];
      const reservasiHariIni = reservasi.filter(r => r.tanggal_main === today);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const pendapatanHariIni = riwayat
        .filter(r => new Date(r.created_at) >= todayDate)
        .reduce((sum, r) => sum + (r.total_akhir || 0), 0);

      checkTargetOmset(pendapatanHariIni);

      setStatistik({
        totalReservasi: reservasi.length,
        reservasiHariIni: reservasiHariIni.length,
        totalUsers: usersData.length, // Berisi total keseluruhan user (6)
        totalKasir: totalKasir,
        pendapatanHariIni: pendapatanHariIni,
      });

      const formattedReservasi = reservasi.slice(0, 10).map(r => ({
        id: r.id_booking || `RC-${String(r.id).slice(-6)}`,
        pelanggan: r.nama_pelanggan || "-",
        meja: r.nomor_meja || "-",
        jam: r.jam_mulai || "-",
        status: r.status_pemesanan || "Pending",
        tanggal: r.tanggal_main || "-",
        durasi: r.durasi_bermain || 1
      }));

      setDataReservasi(formattedReservasi);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Disetujui":
        return { icon: faCheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Disetujui" };
      case "Playing":
        return { icon: faPlayCircle, color: "text-sky-400", bg: "bg-sky-500/10", label: "Playing" };
      case "Sudah Dibayar":
        return { icon: faCheckCircle, color: "text-blue-400", bg: "bg-blue-500/10", label: "Sudah Dibayar" };
      case "Pending":
        return { icon: faHourglassHalf, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" };
      case "Selesai":
        return { icon: faCheckCircle, color: "text-slate-400", bg: "bg-slate-500/10", label: "Selesai" };
      default:
        return { icon: faTimesCircle, color: "text-red-400", bg: "bg-red-500/10", label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a05] flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#00ff99]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020a05] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 sm:p-6 max-w-md text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="text-3xl sm:text-4xl text-red-400 mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Error Memuat Data</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-4">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="px-4 py-2.5 sm:py-2 bg-[#00aa66] hover:bg-[#00cc7a] rounded-xl text-white text-xs sm:text-sm font-bold min-h-[44px]"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020a05]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <p className="text-[#00ff99] text-[10px] sm:text-xs font-black uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">
              Overview
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Dashboard <span className="text-[#00ff99]">Admin</span>
            </h1>
          </div>

          {/* CARD STATISTIK - Diubah kembali menjadi 5 Grid agar muat untuk Total Users */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8 sm:mb-10">
            {/* Card Total Reservasi */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                    Total Reservasi
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1">
                    {statistik.totalReservasi}
                  </h2>
                </div>
                <FontAwesomeIcon icon={faClipboardList} className="text-slate-700 text-lg sm:text-2xl group-hover:text-[#00ff99]/30 transition-colors" />
              </div>
            </div>

            {/* Card Reservasi Hari Ini */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                    Reservasi Hari Ini
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-400 mt-1">
                    {statistik.reservasiHariIni}
                  </h2>
                </div>
                <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-700 text-lg sm:text-2xl group-hover:text-blue-400/30 transition-colors" />
              </div>
            </div>

            {/* Card Total Users (Pengganti Total Member) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                    Total Users
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-400 mt-1">
                    {statistik.totalUsers}
                  </h2>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-slate-700 text-lg sm:text-2xl group-hover:text-purple-400/30 transition-colors" />
              </div>
            </div>

            {/* Card Total Kasir */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                    Total Kasir
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 mt-1">
                    {statistik.totalKasir}
                  </h2>
                </div>
                <FontAwesomeIcon icon={faUserPlus} className="text-slate-700 text-lg sm:text-2xl group-hover:text-amber-400/30 transition-colors" />
              </div>
            </div>

            {/* Card Pendapatan Hari Ini */}
            <div className="xs:col-span-2 lg:col-span-1 bg-gradient-to-r from-[#00ff99]/10 to-transparent border border-[#00ff99]/30 rounded-xl sm:rounded-2xl p-5 hover:border-[#00ff99]/50 transition-all group">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <p className="text-[#00ff99] text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                    Pendapatan Hari Ini
                  </p>
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-[#00ff99] mt-1 break-words">
                    Rp {statistik.pendapatanHariIni.toLocaleString("id-ID")}
                  </h2>
                </div>
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-[#00ff99]/40 text-lg sm:text-2xl" />
              </div>
            </div>
          </div>

          {/* TABLE RESERVASI */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base sm:text-lg font-black text-white">Data Reservasi Terbaru</h2>
              <button 
                onClick={() => navigate("/monitor")} 
                className="text-xs text-[#00ff99] hover:underline flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg hover:bg-[#00ff99]/10 transition-all"
              >
                Lihat semua <FontAwesomeIcon icon={faArrowRight} size={10} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">ID</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Pelanggan</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Meja</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Tanggal</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Jam</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Durasi</th>
                    <th className="p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataReservasi.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 sm:p-10 text-center text-slate-500 text-sm">
                        Belum ada data reservasi
                      </td>
                    </tr>
                  ) : (
                    dataReservasi.map((item) => {
                      const statusBadge = getStatusBadge(item.status);
                      return (
                        <tr key={item.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-all">
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300">{item.id}</td>
                          <td className="p-3 sm:p-4 font-medium text-white text-xs sm:text-sm">{item.pelanggan}</td>
                          <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm">{item.meja}</td>
                          <td className="p-3 sm:p-4 text-slate-400 text-xs sm:text-sm">{item.tanggal}</td>
                          <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                            <FontAwesomeIcon icon={faClock} className="mr-1 sm:mr-2 text-slate-500 text-[10px] sm:text-xs" />
                            {item.jam}
                          </td>
                          <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm">{item.durasi} Jam</td>
                          <td className="p-3 sm:p-4">
                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold ${statusBadge.bg} ${statusBadge.color} whitespace-nowrap`}>
                              <FontAwesomeIcon icon={statusBadge.icon} size={8} className="sm:text-[10px]" />
                              <span className="hidden xs:inline">{statusBadge.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}