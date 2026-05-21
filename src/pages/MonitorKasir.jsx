import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaClock, FaCalendarAlt, FaWhatsapp, FaUser, FaCheck, FaTimes } from "react-icons/fa";

const SUPABASE_URL = "https://conhiaojhyalflkccsen.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbmhpYW9qaHlhbGZsa2Njc2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTg4NDksImV4cCI6MjA5NDczNDg0OX0.vTVJEuAR8Fq75lIPoTpTc_WoOmpyXs5lNB4O_vwogL8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function MonitorKasir() {
  const [pesanan, setPesanan] = useState([]);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  // 1. FUNGSI CEK APAKAH WAKTU MAIN SUDAH HABIS
  const cekApakahSelesai = (tanggalMain, jamMulai, durasiBermain) => {
    try {
      // Ambil komponen tanggal (Format input biasanya YYYY-MM-DD)
      const [tahun, bulan, tgl] = tanggalMain.split("-");
      // Ambil komponen jam mulai (Format biasanya HH:MM)
      const [jam, menit] = jamMulai.split(":");

      // Buat objek waktu saat pelanggan mulai main
      const waktuMulaiObjek = new Date(tahun, bulan - 1, tgl, jam, menit, 0);
      
      // Tambahkan durasi bermain (diubah ke milidetik: jam * 60 * 60 * 1000)
      const waktuSelesaiObjek = new Date(waktuMulaiObjek.getTime() + parseInt(durasiBermain) * 60 * 60 * 1000);

      // Bandingkan dengan waktu saat ini
      return waktuSekarang >= waktuSelesaiObjek;
    } catch (e) {
      return false;
    }
  };

  const ambilDataAwal = async () => {
    const { data, error } = await supabase
      .from("reservasi")
      .select("*")
      .order("waktuDibuat", { ascending: false });

    if (!error && data) {
      setPesanan(data);
    }
  };

  useEffect(() => {
    ambilDataAwal();

    // 2. TIMING: Update waktu sekarang setiap 1 menit untuk cek status meja otomatis
    const intervalWaktu = setInterval(() => {
      setWaktuSekarang(new Date());
    }, 60000);

    // 3. LOGIKA REAL-TIME SUPABASE
    const kanalRealtime = supabase
      .channel("perubahan-tabel-reservasi")
      .on(
        "postgres_changes",
        { event: "*", scheme: "public", table: "reservasi" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPesanan((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPesanan((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(kanalRealtime);
      clearInterval(intervalWaktu);
    };
  }, []);

  const ubahStatus = async (id, statusBaru) => {
    const { error } = await supabase
      .from("reservasi")
      .update({ statusPemesanan: statusBaru })
      .eq("id", id);

    if (error) {
      alert("Gagal memperbarui status!");
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
            <div className="w-2 h-2 bg-[#00ff99] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#00ff99] uppercase tracking-wider">Supabase Live Connected</span>
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
                  // Jalankan fungsi cek waktu habis jika pesanan disetujui
                  const sudahSelesaiMain = item.statusPemesanan === "Disetujui" && 
                    cekApakahSelesai(item.tanggalMain, item.jamMulai, item.durasiBermain);

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400">{item.id}</td>
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
                          <FaClock className="text-slate-500" /> {item.jamMulai} ({item.durasiBermain} Jam)
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="bg-slate-800 px-3 py-1 rounded-md text-xs font-bold text-white border border-slate-700">
                            {item.nomorMeja}
                          </span>
                          {/* 3. LOGIKA TULISAN SELESAI OTOMATIS */}
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
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {item.statusPemesanan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => ubahStatus(item.id, "Disetujui")} disabled={item.statusPemesanan === "Disetujui"} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer" title="Setujui Booking">
                            <FaCheck size={12} />
                          </button>
                          <button onClick={() => ubahStatus(item.id, "Ditolak")} disabled={item.statusPemesanan === "Ditolak"} className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all disabled:opacity-20 cursor-pointer" title="Tolak Booking">
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