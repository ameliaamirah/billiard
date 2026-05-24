import React, { useState, useEffect } from "react";
import { FaPlay, FaStop, FaPrint, FaCoffee, FaClock, FaCheckCircle, FaCircle } from "react-icons/fa";

export default function KasirDashboard() {
  // 1. DATA MOCK UTAMA MEJA BILIAR (MURNI FRONTEND)
  const [mejaList, setMejaList] = useState([
    { id: 1, nomor: "Meja 01", tipe: "Regular", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 2, nomor: "Meja 02", tipe: "Regular", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 3, nomor: "Meja 03", tipe: "Regular", status: "Digunakan", billingMulai: new Date(Date.now() - 45 * 60000).toISOString(), totalWaktu: 45, totalBiaya: 37500, fAndB: 15000 }, // Simulasi jalan 45 menit
    { id: 4, nomor: "Meja 04", tipe: "Regular", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 5, nomor: "Meja 05", tipe: "VIP", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 6, nomor: "Meja 06", tipe: "VIP", status: "Digunakan", billingMulai: new Date(Date.now() - 120 * 60000).toISOString(), totalWaktu: 120, totalBiaya: 160000, fAndB: 45000 }, // Simulasi jalan 2 jam
    { id: 7, nomor: "Meja 07", tipe: "VVIP", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 8, nomor: "Meja 08", tipe: "VVIP", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
    { id: 9, nomor: "Meja 09", tipe: "VVIP", status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 },
  ]);

  // Harga sewa per jam berdasarkan tipe meja
  const hargaPerJam = { Regular: 50000, VIP: 80000, VVIP: 120000 };

  // 2. LIVE TRACKER REAL-TIME (Simulasi penghitung billing otomatis tiap 1 menit)
  useEffect(() => {
    const interval = setInterval(() => {
      setMejaList((prevMeja) =>
        prevMeja.map((meja) => {
          if (meja.status === "Digunakan" && meja.billingMulai) {
            const menitJalan = Math.floor((new Date() - new Date(meja.billingMulai)) / 60000);
            const biayaBiliar = Math.floor((menitJalan / 60) * hargaPerJam[meja.tipe]);
            return {
              ...meja,
              totalWaktu: menitJalan,
              totalBiaya: biayaBiliar,
            };
          }
          return meja;
        })
      );
    }, 60000); // Update otomatis setiap menit

    return () => clearInterval(interval);
  }, []);

  /* ==========================================================
     FUNGSI AKSI BILLING (START, STOP, TAMBAH F&B, CETAK STRUK)
     ========================================================== */
  
  // Menyalakan Meja (Mulai Main)
  const handleStartMeja = (id) => {
    setMejaList(mejaList.map(meja => 
      meja.id === id 
        ? { ...meja, status: "Digunakan", billingMulai: new Date().toISOString(), totalWaktu: 0, totalBiaya: 0 }
        : meja
    ));
  };

  // Mematikan Meja (Stop Main)
  const handleStopMeja = (id) => {
    setMejaList(mejaList.map(meja => 
      meja.id === id ? { ...meja, status: "Selesai" } : meja
    ));
  };

  // Menambahkan Simulasi Pesanan Makanan/Minuman (F&B)
  const handleTambahFnB = (id) => {
    setMejaList(mejaList.map(meja => 
      meja.id === id ? { ...meja, fAndB: meja.fAndB + 15000 } : meja
    ));
  };

  // Cetak Nota & Reset Meja Kembali Kosong
  const handleCetakStruk = (meja) => {
    alert(`
      ===================================
             ROYAL CUE BILLIARD
      ===================================
      Meja      : ${meja.nomor} (${meja.tipe})
      Durasi    : ${meja.totalWaktu} Menit
      -----------------------------------
      Biaya Meja: Rp ${(meja.totalBiaya).toLocaleString('id-ID')}
      Biaya F&B : Rp ${(meja.fAndB).toLocaleString('id-ID')}
      -----------------------------------
      TOTAL     : Rp ${(meja.totalBiaya + meja.fAndB).toLocaleString('id-ID')}
      ===================================
          Terima Kasih & Selamat Datang Kembali!
    `);

    // Reset meja menjadi kosong kembali
    setMejaList(mejaList.map(m => 
      m.id === meja.id 
        ? { ...m, status: "Kosong", billingMulai: null, totalWaktu: 0, totalBiaya: 0, fAndB: 0 }
        : m
    ));
  };

  // Penghitung Ringkasan Data Atas
  const mejaTerisi = mejaList.filter(m => m.status === "Digunakan").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 📊 RINGKASAN MONITOR KASIR (RESPONSIF KARTU ATAS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Meja</p>
          <p className="text-xl md:text-2xl font-black mt-1 text-white">{mejaList.length} Meja</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-[#00ff99] font-bold uppercase tracking-wider">Meja Aktif</p>
          <p className="text-xl md:text-2xl font-black mt-1 text-[#00ff99]">{mejaTerisi} Aktif</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Meja Kosong</p>
          <p className="text-xl md:text-2xl font-black mt-1 text-amber-400">{mejaList.length - mejaTerisi} Meja</p>
        </div>
      </div>

      {/* 🎱 GRID UTAMA KARTU KONTROL MEJA: 1 Kolom di HP, 2 di Tablet, 3/4 di PC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {mejaList.map((meja) => (
          <div 
            key={meja.id} 
            className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-5 transition-all ${
              meja.status === "Digunakan" 
                ? "border-[#00ff99]/30 shadow-lg shadow-[#00ff99]/5" 
                : meja.status === "Selesai"
                ? "border-amber-500/40 animate-pulse"
                : "border-slate-800/80"
            }`}
          >
            {/* Bagian Atas Kartu */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base md:text-lg font-black tracking-wide text-white uppercase">{meja.nomor}</h3>
                <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                  {meja.tipe} Lounge
                </span>
              </div>
              
              {/* Badge Status */}
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                meja.status === "Digunakan" 
                  ? "bg-[#00ff99]/10 text-[#00ff99]" 
                  : meja.status === "Selesai"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-slate-950 text-slate-500"
              }`}>
                <FaCircle className="text-[6px]" /> {meja.status}
              </span>
            </div>

            {/* Bagian Tengah: Info Durasi & Biaya Berjalan */}
            <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800/40">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1"><FaClock /> Waktu</span>
                <span className="font-bold text-slate-300">{meja.totalWaktu} Menit</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1"><FaCoffee /> Menu F&B</span>
                <span className="font-bold text-rose-400">Rp {(meja.fAndB).toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Biaya Meja</span>
                <span className="text-sm font-black text-[#00ff99]">
                  Rp {(meja.totalBiaya).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Bagian Bawah: Tombol Aksi Kontrol (Dibuat lebar & pas di jempol layar HP) */}
            <div className="space-y-2">
              {meja.status === "Kosong" && (
                <button
                  onClick={() => handleStartMeja(meja.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00ff99] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#00e68a] transition-all cursor-pointer active:scale-95"
                >
                  <FaPlay className="text-[10px]" /> Buka Billing
                </button>
              )}

              {meja.status === "Digunakan" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTambahFnB(meja.id)}
                    className="flex items-center justify-center gap-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    + F&B
                  </button>
                  <button
                    onClick={() => handleStopMeja(meja.id)}
                    className="flex items-center justify-center gap-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <FaStop className="text-[9px]" /> Stop
                  </button>
                </div>
              )}

              {meja.status === "Selesai" && (
                <button
                  onClick={() => handleCetakStruk(meja)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <FaPrint /> Cetak Nota & Kosongkan
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}