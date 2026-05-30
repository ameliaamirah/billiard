import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCrown, faUsers, faClock, faCheckCircle, faTimesCircle, 
  faSignOutAlt, faCalendarAlt, faChartLine, faMoneyBillWave,
  faClipboardList, faUtensils, faSpinner, faHourglassHalf,
  faPlayCircle, faUserPlus, faBars, faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statistik, setStatistik] = useState({
    totalReservasi: 0,
    reservasiHariIni: 0,
    totalMember: 0,
    totalKasir: 0,
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
      const { data: reservasi, error: reservasiError } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });

      if (reservasiError) throw reservasiError;

      let usersData = [];
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*");
        if (!error) usersData = data || [];
      } catch (e) {
        console.warn("Tabel users belum ada, skip:", e.message);
        usersData = [];
      }

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

      setStatistik({
        totalReservasi: reservasi.length,
        reservasiHariIni: reservasiHariIni.length,
        totalMember: usersData.length,
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

  const menuItems = [
    { label: "Dashboard", icon: faChartLine, path: "/admin-dashboard", active: true },
    { label: "Monitor Kasir", icon: faClock, path: "/monitor" },
    { label: "Manajemen Menu", icon: faUtensils, path: "/menu-management" },
    { label: "Kelola Kasir", icon: faUserPlus, path: "/manage-kasir" },
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
    <div className="flex min-h-screen bg-[#020a05]">
      {/* SIDEBAR - Desktop selalu terbuka, mobile bisa di-toggle */}
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
                item.active 
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
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
          
          <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">System Online</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider sm:hidden">Online</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <p className="text-[#00ff99] text-xs font-black uppercase tracking-[4px] mb-2">Overview</p>
            <h1 className="text-3xl lg:text-4xl font-black text-white">Dashboard <span className="text-[#00ff99]">Admin</span></h1>
          </div>

          {/* CARD STATISTIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Reservasi</p>
                  <h2 className="text-3xl font-black text-white mt-1">{statistik.totalReservasi}</h2>
                </div>
                <FontAwesomeIcon icon={faClipboardList} className="text-slate-700 text-2xl" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Reservasi Hari Ini</p>
                  <h2 className="text-3xl font-black text-blue-400 mt-1">{statistik.reservasiHariIni}</h2>
                </div>
                <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-700 text-2xl" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total User</p>
                  <h2 className="text-3xl font-black text-purple-400 mt-1">{statistik.totalMember}</h2>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-slate-700 text-2xl" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Kasir</p>
                  <h2 className="text-3xl font-black text-amber-400 mt-1">{statistik.totalKasir}</h2>
                </div>
                <FontAwesomeIcon icon={faUserPlus} className="text-slate-700 text-2xl" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-[#00ff99]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Pendapatan Hari Ini</p>
                  <h2 className="text-xl font-black text-[#00ff99] mt-1">Rp {statistik.pendapatanHariIni.toLocaleString("id-ID")}</h2>
                </div>
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-slate-700 text-2xl" />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-white">Data Reservasi Terbaru</h2>
              <button onClick={() => navigate("/monitor")} className="text-xs text-[#00ff99] hover:underline flex items-center gap-1">
                Lihat semua <FontAwesomeIcon icon={faArrowRight} size={10} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 text-left">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">ID</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Pelanggan</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Meja</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Tanggal</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Jam</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Durasi</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataReservasi.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-slate-500">Belum ada data reservasi</td>
                    </tr>
                  ) : (
                    dataReservasi.map((item) => {
                      const statusBadge = getStatusBadge(item.status);
                      return (
                        <tr key={item.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-all">
                          <td className="p-4 text-sm text-slate-300">{item.id}</td>
                          <td className="p-4 font-medium text-white">{item.pelanggan}</td>
                          <td className="p-4 text-slate-300">{item.meja}</td>
                          <td className="p-4 text-slate-400">{item.tanggal}</td>
                          <td className="p-4 text-slate-300">
                            <FontAwesomeIcon icon={faClock} className="mr-2 text-slate-500" size={12} />
                            {item.jam}
                          </td>
                          <td className="p-4 text-slate-300">{item.durasi} Jam</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${statusBadge.bg} ${statusBadge.color}`}>
                              <FontAwesomeIcon icon={statusBadge.icon} size={10} />
                              {statusBadge.label}
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