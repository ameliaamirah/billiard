import React, { useEffect, useState } from "react";
import { FaClock, FaCalendarAlt, FaWhatsapp, FaUser, FaCheck, FaTimes, FaExchangeAlt } from "react-icons/fa";

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
      if (window.confirm(`Apakah Anda yakin ingin menolak & menghapus pesanan atas nama "${namaPelanggan}"?`)) {
        const dataSisa = pesanan.filter((item) => item.id !== id);
        setPesanan(dataSisa);
        localStorage.setItem("reservasi_billiard", JSON.stringify(dataSisa));
      }
    } else {
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 📱 HEADER PANEL MONITOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
            MONITOR RESERVASI <span className="text-[#00ff99]">ROYAL CUE</span>
          </h1>
          <p className="text-xs text-slate-400">Sistem Pemantauan Pemesanan Masuk Real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-[#00ff99]/10 border border-[#00ff99]/20 px-3 py-1.5 rounded-xl">
          <div className="w-1.5 h-1.5 bg-[#00ff99] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-[#00ff99] uppercase tracking-wider">Sync Local Active</span>
        </div>
      </div>

      {/* 📳 KONDISI JIKA DATA KOSONG (BERLAKU DI SEMUA LAYAR) */}
      {pesanan.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-medium">
          Belum ada data reservasi masuk dari pelanggan hari ini.
        </div>
      ) : (
        <>
          {/* ==========================================================
              1. TAMPILAN KHUSUS HP / MOBILE (CARD STACK MODE)
             ========================================================== */}
          <div className="block md:hidden space-y-4">
            {pesanan.map((item) => {
              const sudahSelesaiMain = item.statusPemesanan === "Disetujui" && 
                cekApakahSelesai(item.tanggalMain, item.jamMulai, item.durasiBermain);

              return (
                <div 
                  key={item.id} 
                  className={`bg-slate-900 border rounded-2xl p-4 space-y-4 transition-all ${
                    item.statusPemesanan === "Disetujui" ? "border-emerald-500/20" : "border-slate-800"
                  }`}
                >
                  {/* Atas Kartu: ID & Status */}
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {item.idBooking || "RC-" + String(item.id).slice(-5)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      item.statusPemesanan === "Disetujui" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      item.statusPemesanan === "Ditolak" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-400/20"
                    }`}>
                      {item.statusPemesanan === "Pending" ? "Menunggu" : item.statusPemesanan}
                    </span>
                  </div>

                  {/* Tengah Kartu: Info Profil Pelanggan & Jadwal */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
                        <FaUser className="text-slate-400 text-xs" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{item.namaPelanggan}</h4>
                        <a href={`https://wa.me/${item.nomorWhatsApp}`} target="_blank" rel="noreferrer" className="text-[11px] text-[#00ff99] flex items-center gap-1 hover:underline">
                          <FaWhatsapp /> {item.nomorWhatsApp}
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/40">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Jadwal Main</p>
                        <p className="text-slate-300 font-medium flex items-center gap-1"><FaCalendarAlt size={10}/> {item.tanggalMain}</p>
                        <p className="text-slate-300 font-medium flex items-center gap-1"><FaClock size={10}/> {item.jamMulai} ({item.durasiBermain} Jam)</p>
                      </div>
                      <div className="space-y-0.5 flex flex-col justify-between items-end">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Alokasi Meja</p>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-black text-white border border-slate-700">
                          {item.nomorMeja}
                        </span>
                        {sudahSelesaiMain ? (
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">🛑 Selesai</span>
                        ) : item.statusPemesanan === "Disetujui" ? (
                          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] px-1.5 py-0.5 rounded font-black uppercase animate-pulse">🎱 Bermain</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Bawah Kartu: Tombol Aksi Sentuh Jari */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => ubahStatus(item.id, "Disetujui", item.namaPelanggan)}
                      disabled={item.statusPemesanan === "Disetujui"}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FaCheck size={10} /> Setujui
                    </button>
                    <button
                      onClick={() => ubahStatus(item.id, "Ditolak", item.namaPelanggan)}
                      disabled={item.statusPemesanan === "Ditolak"}
                      className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white disabled:opacity-20 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FaTimes size={10} /> Tolak / Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==========================================================
              2. TAMPILAN KHUSUS LAPTOP / DESKTOP (TABLE GRID PREVIEW)
             ========================================================== */}
          <div className="hidden md:block bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
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
                {pesanan.map((item) => {
                  const sudahSelesaiMain = item.statusPemesanan === "Disetujui" && 
                    cekApakahSelesai(item.tanggalMain, item.jamMulai, item.durasiBermain);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">
                        {item.idBooking || "RC-" + String(item.id).slice(-5)}
                      </td>
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
                          <button 
                            onClick={() => ubahStatus(item.id, "Disetujui", item.namaPelanggan)} 
                            disabled={item.statusPemesanan === "Disetujui"} 
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer" 
                            title="Setujui Booking"
                          >
                            <FaCheck size={12} />
                          </button>
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
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}