import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaClock, FaCalendarAlt, FaWhatsapp, FaUser, FaCheck, FaTimes } from "react-icons/fa";

export default function MonitorKasir() {
  const [pesanan, setPesanan] = useState([]);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  // Fungsi helper untuk mengambil nilai dari berbagai kemungkinan nama kolom
  const getValue = (obj, possibleKeys, defaultValue = "") => {
    for (let key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return defaultValue;
  };

  // 1. FUNGSI AMBIL DATA SUPABASE
  const fetchReservasi = async () => {
    try {
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Data reservasi:", data);
      setPesanan(data || []);
    } catch (error) {
      console.error("Error Fetch:", error);
    }
  };

  // 2. REALTIME & INTERVAL
  useEffect(() => {
    fetchReservasi();
    
    const channel = supabase
      .channel('realtime_reservasi')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservasi_billiard' }, 
        () => fetchReservasi()
      )
      .subscribe();
    
    const interval = setInterval(() => setWaktuSekarang(new Date()), 60000);
    
    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(interval); 
    };
  }, []);

  // 3. FUNGSI UPDATE/DELETE (SESUAIKAN DENGAN NAMA KOLOM DATABASE)
  const ubahStatus = async (id, statusBaru, namaPelanggan) => {
    if (statusBaru === "Ditolak") {
      if (window.confirm(`Hapus pesanan "${namaPelanggan}"?`)) {
        const { error } = await supabase
          .from("reservasi_billiard")
          .delete()
          .eq("id", id);
        
        if (error) console.error("Error delete:", error);
        else fetchReservasi();
      }
    } else {
      // PERBAIKAN: gunakan 'status_pemesanan' (snake_case) sesuai database
      const { error } = await supabase
        .from("reservasi_billiard")
        .update({ status_pemesanan: statusBaru })
        .eq("id", id);
      
      if (error) console.error("Error update:", error);
      else fetchReservasi();
    }
  };

  // 4. LOGIKA STATUS MEJA (SESUAIKAN DENGAN NAMA KOLOM)
  const getStatusMeja = (nomorMeja) => {
    const mejaDipesan = pesanan.find((item) => {
      const nomorMejaItem = getValue(item, ["nomor_meja", "nomorMeja", "nomorneja"]);
      const statusItem = getValue(item, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]);
      return nomorMejaItem === nomorMeja && statusItem === "Disetujui";
    });
    return mejaDipesan ? "Bermain" : "Tersedia";
  };

  // Helper untuk mendapatkan nilai dari pesanan
  const getNamaPelanggan = (item) => getValue(item, ["nama_pelanggan", "namaPelanggan", "namepalanggan"], "-");
  const getNomorMeja = (item) => getValue(item, ["nomor_meja", "nomorMeja", "nomorneja"], "-");
  const getStatus = (item) => getValue(item, ["status_pemesanan", "statusPemesanan", "statuspemesanan"], "Pending");
  const getTanggal = (item) => getValue(item, ["tanggal_main", "tanggalMain", "tanggal"], "-");
  const getJamMulai = (item) => getValue(item, ["jam_mulai", "jamMulai", "jamulai"], "-");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a05] to-[#061010] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & MONITOR MEJA */}
        <div className="flex flex-col gap-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white">
              MONITOR <span className="text-[#00ff99]">ROYAL CUE</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Pemantauan Reservasi & Status Meja Real-time</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5"].map((meja) => {
              const status = getStatusMeja(meja);
              return (
                <div key={meja} 
                  className={`p-4 rounded-xl border transition-all ${
                    status === "Bermain" 
                      ? "bg-rose-900/20 border-rose-500/50 shadow-lg shadow-rose-500/10" 
                      : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{meja}</p>
                  <p className={`font-black text-lg ${status === "Bermain" ? "text-rose-400" : "text-emerald-400"}`}>
                    {status}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* DATA RESERVASI */}
        {pesanan.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-slate-900/20 rounded-2xl">
            🎱 Belum ada reservasi masuk.
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Pelanggan</th>
                    <th className="p-4">Detail</th>
                    <th className="p-4">Meja</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pesanan.map((item) => {
                    const namaPelanggan = getNamaPelanggan(item);
                    const nomorMeja = getNomorMeja(item);
                    const status = getStatus(item);
                    const tanggal = getTanggal(item);
                    const jamMulai = getJamMulai(item);
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-slate-500 text-xs" />
                            <span className="text-white font-bold text-sm">{namaPelanggan}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <FaCalendarAlt size={8} /> {tanggal}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <FaClock size={8} /> {jamMulai}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-emerald-400 text-sm">{nomorMeja}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                            status === 'Disetujui' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => ubahStatus(item.id, "Disetujui", namaPelanggan)} 
                              className="p-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-lg text-white transition-all cursor-pointer"
                              title="Setujui"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button 
                              onClick={() => ubahStatus(item.id, "Ditolak", namaPelanggan)} 
                              className="p-2 bg-rose-600/80 hover:bg-rose-500 rounded-lg text-white transition-all cursor-pointer"
                              title="Tolak"
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
          </div>
        )}

        {/* JAM SEKARANG */}
        <div className="text-right text-[10px] text-slate-500 pt-4 border-t border-slate-800/50">
          Terakhir diperbarui: {waktuSekarang.toLocaleTimeString("id-ID")}
        </div>
      </div>
    </div>
  );
}