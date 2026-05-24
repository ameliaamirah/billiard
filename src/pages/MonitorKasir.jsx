import React, { useEffect, useState } from "react";
import { FaClock, FaCalendarAlt, FaWhatsapp, FaUser, FaCheck, FaTimes } from "react-icons/fa";

export default function MonitorKasir() {
  const [pesanan, setPesanan] = useState([]);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  // 1. FUNGSI CEK APAKAH WAKTU MAIN SUDAH HABIS
  const cekApakahSelesai = (tanggalMain, jamMulai, durasiBermain) => {
    try {
      if (!tanggalMain || !jamMulai) return false;
      const [tahun, bulan, tgl] = tanggalMain.split("-");
      const [jam, menit] = jamMulai.split(":");

      const waktuMulaiObjek = new Date(tahun, bulan - 1, tgl, jam, menit, 0);
      const waktuSelesaiObjek = new Date(waktuMulaiObjek.getTime() + parseInt(durasiBermain) * 60 * 60 * 1000);

      return waktuSekarang >= waktuSelesaiObjek;
    } catch (e) {
      return false;
    }
  };

  // 🔄 2. FUNGSI MEMUAT DATA DARI LOCAL STORAGE
  const ambilDataLokal = () => {
    const dataBokingan = JSON.parse(localStorage.getItem("reservasi_billiard")) || [];
    setPesanan(dataBokingan);
  };

  useEffect(() => {
    ambilDataLokal();

    // Auto-refresh data setiap 2 detik agar sinkron saat ada data baru dari halaman reservasi
    const intervalData = setInterval(ambilDataLokal, 2000);

    // Update waktu sekarang setiap 1 menit untuk cek status meja otomatis
    const intervalWaktu = setInterval(() => {
      setWaktuSekarang(new Date());
    }, 60000);

    return () => {
      clearInterval(intervalData);
      clearInterval(intervalWaktu);
    };
  }, []);

  // ⚡ 3. FUNGSI MENGUBAH STATUS PESANAN (Setujui / Otomatis Hapus jika Ditolak)
  const ubahStatus = (id, statusBaru, namaPelanggan) => {
    if (statusBaru === "Ditolak") {
      // 🧹 Jika ditolak (salah input/ghosting), langsung otomatis terhapus dari system lokal
      if (window.confirm(`Apakah Anda yakin ingin menolak & menghapus pesanan atas nama "${namaPelanggan}"?`)) {
        const dataSisa = pesanan.filter((item) => item.id !== id);
        setPesanan(dataSisa);
        localStorage.setItem("reservasi_billiard", JSON.stringify(dataSisa));
      }
    } else {
      // 🟢 Jika disetujui (Status boking masuk ke kontrol meja)
      const dataDiupdate = pesanan.map((item) => {
        if (item.id === id) {
          return { 
            ...item, 
            statusPemesanan: statusBaru,
            status: statusBaru 
          };
        }
        return item;
      });

      setPesanan(dataDiupdate);
      localStorage.setItem("reservasi_billiard", JSON.stringify(dataDiupdate));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              MONITOR KASIR <span className="text-[#00ff99]">ROYAL CUE</span>
            </h1>
            <p className="text-xs text-slate-400">Sistem Pemantauan Reservasi Meja Biliar Real-time</p>
          </div>
          <div className="flex items-center gap-2 bg-[#00ff99]/10 border border-[#00ff99]/20 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-[#00ff99] rounded-full" />
            <span className="text-xs font-bold text-[#00ff99] uppercase tracking-wider">Local Storage System Active</span>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="p-4">ID Booking</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Detail Main</th>
                <th className="p-4">Meja / Status Meja</th>
                <th className="p-4">Status Pesanan</th>
                <th className="p-4 text-center">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {pesanan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">
                    Belum ada data reservasi masuk hari ini.
                  </td>
                </tr>
              ) : (
                pesanan.map((item) => {
                  const sudahSelesaiMain = item.statusPemesanan === "Disetujui" && 
                    cekApakahSelesai(item.tanggalMain, item.jamMulai, item.durasiBermain);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">{item.idBooking || "RC-" + String(item.id).slice(-5)}</td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <FaUser className="text-slate-500 text-xs" /> {item.namaPelanggan}
                        </div>
                        <a href={`https://wa.me/${item.nomorWhatsApp}`} target="_blank" rel="noreferrer" className="text-xs text-[#00ff99] flex items-center gap-1 mt-1 hover:underline">
                          <FaWhatsapp /> {item.nomorWhatsApp}
                        </a>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <FaCalendarAlt className="text-slate-500" /> {item.tanggalMain}
                        </div>
                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <FaClock className="text-slate-500" /> {item.jamMulai || "Belum Mulai"} ({item.durasiBermain} Jam)
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="bg-slate-800 px-3 py-1 rounded-md text-xs font-bold text-white border border-slate-700">
                            {item.nomorMeja}
                          </span>
                          {sudahSelesaiMain ? (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">
                              🛑 Selesai Main
                            </span>
                          ) : item.statusPemesanan === "Disetujui" ? (
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              🎱 Sedang Main
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.statusPemesanan === "Disetujui" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          item.statusPemesanan === "Ditolak" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-400/20"
                        }`}>
                          {item.statusPemesanan === "Pending" ? "Menunggu" : item.statusPemesanan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Setujui (✔) */}
                          <button 
                            onClick={() => ubahStatus(item.id, "Disetujui", item.namaPelanggan)} 
                            disabled={item.statusPemesanan === "Disetujui"} 
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer" 
                            title="Setujui Booking"
                          >
                            <FaCheck size={12} />
                          </button>
                          
                          {/* Tombol Tolak/Hapus (✖) */}
                          <button 
                            onClick={() => ubahStatus(item.id, "Ditolak", item.namaPelanggan)} 
                            disabled={item.statusPemesanan === "Ditolak"} 
                            className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer" 
                            title="Tolak & Hapus Booking"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
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
  );
}