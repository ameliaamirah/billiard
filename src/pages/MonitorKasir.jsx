import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaClock, FaCalendarAlt, FaWhatsapp, FaUser, FaCheck, FaTimes } from "react-icons/fa";

export default function MonitorKasir() {
  const [pesanan, setPesanan] = useState([]);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  // 1. FUNGSI AMBIL DATA SUPABASE
  const fetchReservasi = async () => {
    const { data, error } = await supabase
      .from("reservasi_billiard")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error Fetch:", error);
    else setPesanan(data || []);
  };

  // 2. REALTIME & INTERVAL
  useEffect(() => {
    fetchReservasi();
    const channel = supabase
      .channel('realtime_reservasi')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservasi_billiard' }, () => fetchReservasi())
      .subscribe();
    
    const interval = setInterval(() => setWaktuSekarang(new Date()), 60000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, []);

  // 3. FUNGSI UPDATE/DELETE
  const ubahStatus = async (id, statusBaru, namaPelanggan) => {
    if (statusBaru === "Ditolak") {
      if (window.confirm(`Hapus pesanan "${namaPelanggan}"?`)) {
        await supabase.from("reservasi_billiard").delete().eq("id", id);
        fetchReservasi();
      }
    } else {
      await supabase.from("reservasi_billiard").update({ statusPemesanan: statusBaru }).eq("id", id);
      fetchReservasi();
    }
  };

  // 4. LOGIKA STATUS MEJA
  const getStatusMeja = (nomorMeja) => {
    return pesanan.find((item) => item.nomorMeja === nomorMeja && item.statusPemesanan === "Disetujui") 
      ? "Bermain" : "Tersedia";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* HEADER & MONITOR MEJA */}
      <div className="flex flex-col gap-6 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-white">MONITOR <span className="text-[#00ff99]">ROYAL CUE</span></h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Meja 1", "Meja 2", "Meja 3", "Meja 4"].map((meja) => {
            const status = getStatusMeja(meja);
            return (
              <div key={meja} className={`p-4 rounded-xl border ${status === "Bermain" ? "bg-rose-900/20 border-rose-500/50" : "bg-slate-900 border-slate-800"}`}>
                <p className="text-slate-400 text-[10px] font-bold uppercase">{meja}</p>
                <p className={`font-black ${status === "Bermain" ? "text-rose-400" : "text-emerald-400"}`}>{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DATA RESERVASI */}
      {pesanan.length === 0 ? (
        <div className="text-center text-slate-500 p-12">Belum ada reservasi.</div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Detail</th>
                <th className="p-4">Meja</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pesanan.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/30">
                  <td className="p-4 text-white font-bold">{item.namaPelanggan}</td>
                  <td className="p-4 text-xs text-slate-300">{item.tanggalMain} | {item.jamMulai}</td>
                  <td className="p-4 text-white font-bold">{item.nomorMeja}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${item.statusPemesanan === 'Disetujui' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {item.statusPemesanan}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    <button onClick={() => ubahStatus(item.id, "Disetujui", item.namaPelanggan)} className="p-2 bg-emerald-600 rounded-lg text-white"><FaCheck size={12}/></button>
                    <button onClick={() => ubahStatus(item.id, "Ditolak", item.namaPelanggan)} className="p-2 bg-rose-600 rounded-lg text-white"><FaTimes size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}