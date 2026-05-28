import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, faUsers, faClock, faCheckCircle, faTimesCircle, 
  faSignOutAlt, faCalendarAlt, faChartLine, faMoneyBillWave,
  faClipboardList, faUtensils, faSpinner, faHourglassHalf,
  faPlayCircle, faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";
import MenuManagement from "./MenuManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statistik, setStatistik] = useState({
    totalReservasi: 0,
    reservasiHariIni: 0,
    totalMember: 0,
    pendapatanHariIni: 0,
  });
  const [dataReservasi, setDataReservasi] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil semua reservasi
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });

      if (reservasiError) throw reservasiError;

      // Ambil semua user (member) - dengan error handling
      let usersData = [];
      let usersError = null;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*");
        usersData = data || [];
        usersError = error;
      } catch (e) {
        console.warn("Tabel users belum ada, skip:", e.message);
        usersData = [];
      }

      // Hitung pendapatan dari riwayat transaksi
      const { data: riwayat, error: riwayatError } = await supabase
        .from("riwayat_transaksi")
        .select("*");

      if (riwayatError) throw riwayatError;

      // Hitung statistik
      const today = new Date().toISOString().split('T')[0];
      const reservasiHariIni = reservasi.filter(r => r.tanggal_main === today);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const pendapatanHariIni = riwayat
        .filter(r => new Date(r.created_at) >= todayDate)
        .reduce((sum, r) => sum + (r.total_akhir || 0), 0);

      setStatistik({
        totalReservasi: reservasi.length,
        reservasiHariIni: reservasiHariIni.length,
        totalMember: usersData.length,
        pendapatanHariIni: pendapatanHariIni,
      });

      // Format data reservasi untuk tabel
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Disetujui":
        return { icon: faCheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Disetujui" };
      case "Playing":
        return { icon: faPlayCircle, color: "text-sky-400", bg: "bg-sky-500/10", label: "Playing" };
      case "Pending":
        return { icon: faHourglassHalf, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" };
      case "Selesai":
        return { icon: faCheckCircle, color: "text-slate-400", bg: "bg-slate-500/10", label: "Selesai" };
      default:
        return { icon: faTimesCircle, color: "text-red-400", bg: "bg-red-500/10", label: status };
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: faChartLine, path: "/admin-dashboard", active: true },
    { label: "Kasir Dashboard", icon: faClipboardList, path: "/kasir-dashboard" },
    { label: "Monitor Kasir", icon: faClock, path: "/monitor" },
    { label: "Manajemen Menu", icon: faUtensils, path: "/menu-management" },
    { label: "Manajemen User", icon: faUsers, path: "/user-management" },
  ];

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
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
          <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Memuat Data</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="px-4 py-2 bg-[#00aa66] hover:bg-[#00cc7a] rounded-xl text-white text-sm font-bold"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a05] text-white flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg"
      >
        <FontAwesomeIcon icon={faArrowRight} className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
      </button>

      {/* SIDEBAR */}
      <aside className={`fixed lg:static z-40 w-[280px] bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 h-screen ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div>
          <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
            <div className="w-12 h-12 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCrown} className="text-[#00ff99] text-xl" />
            </div>
            <div>
              <h1 className="font-black text-lg">Royal Cue</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Admin System</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  item.active 
                    ? "bg-[#00ff99]/10 border border-[#00ff99]/20 text-[#00ff99]" 
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-4 rounded-xl font-black transition-all cursor-pointer"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </aside>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* CONTENT */}
      <main className="flex-1 lg:ml-0 p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-[#00ff99] text-xs font-black uppercase tracking-[4px] mb-2">Royal Cue Studio</p>
            <h1 className="text-3xl lg:text-5xl font-black">Dashboard <span className="text-[#00ff99]">Admin</span></h1>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-5 py-4 rounded-2xl">
            <div className="w-3 h-3 bg-[#00ff99] rounded-full animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">System Status</p>
              <p className="text-sm font-black text-[#00ff99]">Server Connected</p>
            </div>
          </div>
        </div>

        {/* CARD STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
            <div><p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Total Reservasi</p><h2 className="text-2xl xl:text-4xl font-black text-white">{statistik.totalReservasi}</h2></div>
            <FontAwesomeIcon icon={faClipboardList} className="text-slate-700 text-3xl" />
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
            <div><p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Reservasi Hari Ini</p><h2 className="text-2xl xl:text-4xl font-black text-blue-400">{statistik.reservasiHariIni}</h2></div>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-700 text-3xl" />
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
            <div><p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Total Member</p><h2 className="text-2xl xl:text-4xl font-black text-purple-400">{statistik.totalMember}</h2></div>
            <FontAwesomeIcon icon={faUsers} className="text-slate-700 text-3xl" />
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
            <div><p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Pendapatan Hari Ini</p><h2 className="text-xl xl:text-3xl font-black text-[#00ff99]">Rp {statistik.pendapatanHariIni.toLocaleString("id-ID")}</h2></div>
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-slate-700 text-3xl" />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-black">Data Reservasi Terbaru</h2>
            <button onClick={() => navigate("/monitor")} className="text-xs text-[#00ff99] hover:underline flex items-center gap-1">Lihat semua <FontAwesomeIcon icon={faArrowRight} size={10} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400 text-xs uppercase">
                <tr><th className="p-5">ID</th><th className="p-5">Pelanggan</th><th className="p-5">Meja</th><th className="p-5">Tanggal</th><th className="p-5">Jam</th><th className="p-5">Durasi</th><th className="p-5">Status</th></tr>
              </thead>
              <tbody>
                {dataReservasi.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500">Belum ada data reservasi</td></tr>
                ) : (
                  dataReservasi.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    return (
                      <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-900/30 transition-colors">
                        <td className="p-5 text-sm">{item.id}</td>
                        <td className="p-5 font-medium">{item.pelanggan}</td>
                        <td className="p-5">{item.meja}</td>
                        <td className="p-5 text-slate-400">{item.tanggal}</td>
                        <td className="p-5"><FontAwesomeIcon icon={faClock} className="mr-2 text-slate-500" size={12} />{item.jam}</td>
                        <td className="p-5">{item.durasi} Jam</td>
                        <td className="p-5"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${statusBadge.bg} ${statusBadge.color}`}><FontAwesomeIcon icon={statusBadge.icon} size={10} />{statusBadge.label}</span></td>
                       </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}