// src/pages/MonitorKasir.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, faSearch, faClock, faEye, faTimes,
  faUsers, faSpinner, faCrown, faPhoneAlt, 
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
// Import WhatsApp dari brands icons
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "../supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function MonitorKasir() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservasi, setReservasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tanggalFilter, setTanggalFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeja, setSelectedMeja] = useState(null);
  const [detailMeja, setDetailMeja] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchNama, setSearchNama] = useState("");

  const daftarMeja = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];

  const jamOperasional = [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
    "00:00", "01:00", "02:00", "03:00"
  ];

  const timeToMinutes = (time) => {
    if (!time || time === "-") return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const isJamTerisi = (jam, reservasiMeja) => {
    const jamMenit = timeToMinutes(jam);
    
    for (const res of reservasiMeja) {
      const mulaiMenit = timeToMinutes(res.jam_mulai);
      const selesaiMenit = mulaiMenit + ((res.durasi_bermain || 1) * 60);
      
      if (jamMenit >= mulaiMenit && jamMenit < selesaiMenit) {
        return true;
      }
    }
    return false;
  };

  const fetchReservasi = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .eq("tanggal_main", tanggalFilter)
        .in("status_pemesanan", ["Pending", "Sudah Dibayar", "Playing", "Disetujui"]);
      
      if (error) throw error;
      setReservasi(data || []);
    } catch (error) {
      console.error("Error fetching reservasi:", error);
      alert("Gagal memuat data reservasi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasi();
  }, [tanggalFilter]);

  const getReservasiByMeja = (meja) => {
    return reservasi.filter(r => r.nomor_meja === meja);
  };

  const getStatusMeja = (meja) => {
    const reservasiMeja = getReservasiByMeja(meja);
    if (reservasiMeja.length === 0) return "Kosong";
    
    const now = new Date();
    const nowMenit = now.getHours() * 60 + now.getMinutes();
    const tanggalSekarang = now.toISOString().split('T')[0];
    
    if (tanggalFilter !== tanggalSekarang) {
      return reservasiMeja.length > 0 ? "Ada Reservasi" : "Kosong";
    }
    
    const isPlaying = reservasiMeja.some(r => {
      const mulaiMenit = timeToMinutes(r.jam_mulai);
      const selesaiMenit = mulaiMenit + ((r.durasi_bermain || 1) * 60);
      return nowMenit >= mulaiMenit && nowMenit < selesaiMenit && r.status_pemesanan === "Playing";
    });
    
    if (isPlaying) return "Sedang Digunakan";
    if (reservasiMeja.length > 0) return "Ada Reservasi";
    return "Kosong";
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleDetailMeja = (meja) => {
    const reservasiMeja = getReservasiByMeja(meja);
    setSelectedMeja(meja);
    setDetailMeja(reservasiMeja);
    setShowModal(true);
  };

  const reservasiFiltered = reservasi.filter(r => 
    r.nama_pelanggan?.toLowerCase().includes(searchNama.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Kosong": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Ada Reservasi": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Sedang Digunakan": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-slate-700 text-slate-400";
    }
  };

  const getJamSelesai = (jamMulai, durasi) => {
    if (!jamMulai || jamMulai === "-") return "-";
    const [h, m] = jamMulai.split(":").map(Number);
    const endHour = (h || 0) + (durasi || 1);
    return `${(endHour || 0).toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
  };

  const totalReservasi = reservasi.length;
  const mejaTerisi = daftarMeja.filter(meja => getReservasiByMeja(meja).length > 0).length;
  const mejaPlaying = daftarMeja.filter(meja => getStatusMeja(meja) === "Sedang Digunakan").length;

  return (
    <div className="flex min-h-screen bg-[#020a05]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <p className="text-[#00ff99] text-[10px] sm:text-xs font-black uppercase tracking-[3px] sm:tracking-[4px] mb-1 sm:mb-2">Monitoring</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Monitor <span className="text-[#00ff99]">Kasir</span></h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Pantau reservasi meja billiard secara real-time</p>
          </div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Total</p>
              <p className="text-xl sm:text-2xl font-black text-white">{totalReservasi}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500">Reservasi</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Terisi</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{mejaTerisi}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500">Meja</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-wider">Playing</p>
              <p className="text-xl sm:text-2xl font-black text-red-400">{mejaPlaying}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500">Aktif</p>
            </div>
          </div>

          {/* Filter Bar - SAMA KAYAK VERSI KASIR */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs sm:text-sm" />
              <input
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-white text-xs sm:text-sm focus:border-[#00ff99] outline-none transition-all"
              />
            </div>
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs sm:text-sm" />
              <input
                type="text"
                placeholder="Cari nama pelanggan..."
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-white text-xs sm:text-sm focus:border-[#00ff99] outline-none transition-all"
              />
            </div>
          </div>

          {/* Info Tanggal */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#00ff99] rounded-full animate-pulse"></div>
              <p className="text-[11px] sm:text-sm text-slate-300">
                Menampilkan reservasi untuk tanggal: 
                <span className="font-bold text-[#00ff99] ml-1 sm:ml-2">{formatTanggal(tanggalFilter)}</span>
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <FontAwesomeIcon icon={faSpinner} spin className="text-2xl sm:text-3xl text-[#00ff99] mb-3 sm:mb-4" />
              <p className="text-slate-400 text-xs sm:text-sm">Memuat data reservasi...</p>
            </div>
          ) : (
            <>
              {/* Grid Meja - Responsive (SAMA KAYAK VERSI KASIR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                {daftarMeja.map((meja) => {
                  const status = getStatusMeja(meja);
                  const statusColor = getStatusColor(status);
                  const reservasiCount = getReservasiByMeja(meja).length;
                  const isVip = meja.includes("VIP");
                  
                  return (
                    <div
                      key={meja}
                      className={`
                        bg-slate-900/60 border rounded-xl sm:rounded-2xl p-4 sm:p-5 
                        transition-all hover:border-[#00ff99]/50 hover:scale-[1.01] sm:hover:scale-[1.02]
                        ${status === "Sedang Digunakan" ? "border-red-500/50" : "border-slate-800"}
                        ${isVip ? "border-t-2 border-t-amber-500/50" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start mb-3 sm:mb-4 flex-wrap gap-2">
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-black text-white flex items-center gap-1.5">
                            🎱 {meja}
                            {isVip && <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">VIP</span>}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-slate-500">
                            {reservasiCount} reservasi
                          </p>
                        </div>
                        <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold border ${statusColor}`}>
                          {status}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 sm:mb-4 max-h-28 sm:max-h-32 overflow-y-auto">
                        {getReservasiByMeja(meja).slice(0, 2).map((res, idx) => (
                          <div key={idx} className="bg-slate-800/30 rounded-lg p-1.5 sm:p-2 text-[10px] sm:text-xs">
                            <div className="flex flex-wrap justify-between gap-1">
                              <span className="font-medium text-slate-300 truncate max-w-[120px] sm:max-w-none">
                                {res.nama_pelanggan}
                              </span>
                              <span className="text-[#00ff99] font-mono text-[9px] sm:text-[10px]">
                                {res.jam_mulai || "-"} - {getJamSelesai(res.jam_mulai, res.durasi_bermain)}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500 mt-0.5 text-[9px] sm:text-[10px]">
                              <span>{res.durasi_bermain || 1} jam</span>
                              <span className="capitalize">{res.status_pemesanan || "Pending"}</span>
                            </div>
                          </div>
                        ))}
                        {getReservasiByMeja(meja).length === 0 && (
                          <p className="text-[10px] sm:text-xs text-slate-500 text-center py-3 sm:py-4">✨ Tidak ada reservasi</p>
                        )}
                        {getReservasiByMeja(meja).length > 2 && (
                          <p className="text-[8px] sm:text-[9px] text-slate-500 text-center">
                            +{getReservasiByMeja(meja).length - 2} lainnya
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDetailMeja(meja)}
                        className="w-full py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-white"
                      >
                        <FontAwesomeIcon icon={faEye} size={10} className="sm:text-xs" />
                        <span className="hidden xs:inline">Lihat Detail Jadwal</span>
                        <span className="xs:hidden">Detail</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Ringkasan Semua Reservasi (SAMA KAYAK VERSI KASIR) */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-slate-800">
                  <h3 className="font-bold flex items-center gap-2 text-white text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faUsers} className="text-[#00ff99]" />
                    Semua Reservasi ({reservasiFiltered.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-[10px] sm:text-xs">
                    <thead className="bg-slate-800/50 text-slate-400 text-[9px] sm:text-[10px]">
                      <tr>
                        <th className="p-2 sm:p-4">Meja</th>
                        <th className="p-2 sm:p-4">Pelanggan</th>
                        <th className="p-2 sm:p-4">Jam Mulai</th>
                        <th className="p-2 sm:p-4 hidden sm:table-cell">Selesai</th>
                        <th className="p-2 sm:p-4">Durasi</th>
                        <th className="p-2 sm:p-4">Status</th>
                        <th className="p-2 sm:p-4 hidden md:table-cell">WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasiFiltered.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-6 sm:p-8 text-center text-slate-500 text-xs sm:text-sm">
                            Tidak ada reservasi untuk tanggal ini
                          </td>
                        </tr>
                      ) : (
                        reservasiFiltered.map((res) => {
                          let statusColor = "text-yellow-400 bg-yellow-400/10";
                          if (res.status_pemesanan === "Playing") statusColor = "text-green-400 bg-green-400/10";
                          if (res.status_pemesanan === "Sudah Dibayar") statusColor = "text-blue-400 bg-blue-400/10";
                          if (res.status_pemesanan === "Selesai") statusColor = "text-slate-400 bg-slate-400/10";
                          
                          return (
                            <tr key={res.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-all">
                              <td className="p-2 sm:p-4 font-bold text-[#00ff99] text-xs sm:text-sm">{res.nomor_meja || "-"}</td>
                              <td className="p-2 sm:p-4 text-white text-[10px] sm:text-xs">{res.nama_pelanggan || "-"}</td>
                              <td className="p-2 sm:p-4 font-mono text-slate-300 text-[10px] sm:text-xs">{res.jam_mulai || "-"}</td>
                              <td className="p-2 sm:p-4 font-mono text-slate-300 text-[10px] sm:text-xs hidden sm:table-cell">{getJamSelesai(res.jam_mulai, res.durasi_bermain)}</td>
                              <td className="p-2 sm:p-4 text-slate-300 text-[10px] sm:text-xs">{res.durasi_bermain || 1} jam</td>
                              <td className="p-2 sm:p-4">
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold ${statusColor}`}>
                                  {res.status_pemesanan || "Pending"}
                                </span>
                              </td>
                              <td className="p-2 sm:p-4 text-slate-400 text-[10px] sm:text-xs hidden md:table-cell">
                                {res.no_whatsapp ? (
                                  <a href={`https://wa.me/${res.no_whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00ff99] transition-colors flex items-center gap-1">
                                    <FontAwesomeIcon icon={faWhatsapp} size={10} className="text-green-500" />
                                    {res.no_whatsapp}
                                  </a>
                                ) : "-"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Detail Jadwal Meja - Responsive (SAMA KAYAK VERSI KASIR) */}
      {showModal && selectedMeja && detailMeja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-start gap-3">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-white">📋 Jadwal Reservasi</h3>
                <p className="text-slate-400 text-xs sm:text-sm">{selectedMeja}</p>
                <p className="text-[#00ff99] text-[10px] sm:text-xs mt-1">{formatTanggal(tanggalFilter)}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all text-white"
              >
                <FontAwesomeIcon icon={faTimes} size={14} className="sm:text-base" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">
              {/* Jam Grid - Responsive */}
              <div className="text-xs sm:text-sm text-slate-400 mb-2 flex items-center gap-2 flex-wrap">
                <FontAwesomeIcon icon={faClock} size={10} />
                <span>Ketersediaan Waktu</span>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500/50 rounded"></div><span className="text-[8px] sm:text-[9px]">Terisi</span></span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-700 rounded"></div><span className="text-[8px] sm:text-[9px]">Tersedia</span></span>
                </div>
              </div>
              <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {jamOperasional.map((jam) => {
                  const isTerisi = isJamTerisi(jam, detailMeja);
                  const reservasiJam = detailMeja.find(r => {
                    const mulaiMenit = timeToMinutes(r.jam_mulai);
                    const selesaiMenit = mulaiMenit + ((r.durasi_bermain || 1) * 60);
                    const jamMenit = timeToMinutes(jam);
                    return jamMenit >= mulaiMenit && jamMenit < selesaiMenit;
                  });
                  
                  let bgColor = "bg-slate-800/50 border-slate-700";
                  let textColor = "text-slate-400";
                  let label = jam;
                  
                  if (isTerisi) {
                    bgColor = "bg-red-500/20 border-red-500/50";
                    textColor = "text-red-400";
                    label = jam;
                  } else if (jam === "00:00" || jam === "01:00" || jam === "02:00" || jam === "03:00") {
                    bgColor = "bg-slate-800/30 border-slate-700/50";
                    textColor = "text-slate-500";
                  }
                  
                  return (
                    <div
                      key={jam}
                      className={`relative ${bgColor} border rounded-lg p-1 sm:p-2 text-center transition-all group min-h-[36px] sm:min-h-[40px] flex items-center justify-center`}
                      title={reservasiJam ? `${reservasiJam.nama_pelanggan} - ${reservasiJam.durasi_bermain || 1} jam` : jam}
                    >
                      <div className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold ${textColor}`}>
                        {label}
                      </div>
                      {reservasiJam && isTerisi && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-slate-800 text-white text-[9px] sm:text-[10px] rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
                          {reservasiJam.nama_pelanggan}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Daftar Reservasi Detail */}
              {detailMeja.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 mb-2 sm:mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} size={10} className="sm:text-xs" />
                    Daftar Reservasi
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {detailMeja.map((res, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-xl p-2.5 sm:p-3 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{res.nama_pelanggan || "-"}</p>
                          <p className="text-[9px] sm:text-xs text-slate-400">
                            🕐 {res.jam_mulai || "-"} - {getJamSelesai(res.jam_mulai, res.durasi_bermain)} ({res.durasi_bermain || 1} jam)
                          </p>
                          {res.no_whatsapp && (
                            <a href={`https://wa.me/${res.no_whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-[8px] sm:text-[9px] text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-1 mt-0.5">
                              <FontAwesomeIcon icon={faWhatsapp} size={8} /> {res.no_whatsapp}
                            </a>
                          )}
                        </div>
                        <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold whitespace-nowrap ${
                          res.status_pemesanan === "Playing" ? "bg-green-500/20 text-green-400" :
                          res.status_pemesanan === "Sudah Dibayar" ? "bg-blue-500/20 text-blue-400" :
                          res.status_pemesanan === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>
                          {res.status_pemesanan || "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#00ff99] text-black font-bold rounded-xl hover:bg-[#00cc7a] transition-all text-xs sm:text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}