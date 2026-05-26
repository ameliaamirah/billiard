import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClock, faCalendarAlt, faUser, faCheck, 
  faTimes, faSpinner 
} from "@fortawesome/free-solid-svg-icons";

export default function MonitorKasir() {
  const [pesanan, setPesanan] = useState([]);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const SEMUA_MEJA = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Meja 9", "Meja 10", "Meja VIP 1", "Meja VIP 2"];

  const getValue = (obj, possibleKeys, defaultValue = "") => {
    for (let key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return defaultValue;
  };

  const getStatusMeja = (nomorMeja) => {
    const mejaDipesan = pesanan.find((item) => {
      const nomorMejaItem = getValue(item, ["nomor_meja", "nomorMeja", "nomorneja"]);
      const statusItem = getValue(item, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]);
      return nomorMejaItem === nomorMeja && statusItem === "Disetujui";
    });
    
    if (mejaDipesan) {
      const durasi = getValue(mejaDipesan, ["durasi_bermain", "durasiBermain", "durakiberman"], 1);
      const jamMulai = getValue(mejaDipesan, ["jam_mulai", "jamMulai", "jamulai"], "00:00");
      return { status: "Bermain", durasi, jamMulai };
    }
    
    const mejaPending = pesanan.find((item) => {
      const nomorMejaItem = getValue(item, ["nomor_meja", "nomorMeja", "nomorneja"]);
      const statusItem = getValue(item, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]);
      return nomorMejaItem === nomorMeja && statusItem === "Pending";
    });
    
    if (mejaPending) return { status: "Menunggu", durasi: null, jamMulai: null };
    return { status: "Tersedia", durasi: null, jamMulai: null };
  };

  const fetchReservasi = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservasi_billiard")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPesanan(data || []);
    } catch (error) {
      console.error("Error Fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasi();
    const channel = supabase.channel('realtime_reservasi')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservasi_billiard' }, () => fetchReservasi())
      .subscribe();
    
    const interval = setInterval(() => setWaktuSekarang(new Date()), 60000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, []);

  const ubahStatus = async (id, statusBaru, namaPelanggan, nomorMeja) => {
    if (statusBaru === "Ditolak") {
      if (window.confirm(`Hapus pesanan "${namaPelanggan}" untuk ${nomorMeja}?`)) {
        await supabase.from("reservasi_billiard").delete().eq("id", id);
        fetchReservasi();
      }
    } else if (statusBaru === "Disetujui") {
      if (window.confirm(`Setujui reservasi untuk "${namaPelanggan}" di ${nomorMeja}?`)) {
        await supabase.from("reservasi_billiard").update({ status_pemesanan: statusBaru }).eq("id", id);
        fetchReservasi();
      }
    }
  };

  const getNamaPelanggan = (item) => getValue(item, ["nama_pelanggan", "namaPelanggan", "namepalanggan"], "-");
  const getNomorMeja = (item) => getValue(item, ["nomor_meja", "nomorMeja", "nomorneja"], "-");
  const getJamMulai = (item) => getValue(item, ["jam_mulai", "jamMulai", "jamulai"], "-");
  const getDurasi = (item) => getValue(item, ["durasi_bermain", "durasiBermain", "durakiberman"], 1);
  const getWaktuSelesai = (jamMulai, durasi) => {
    if (!jamMulai || jamMulai === "-") return "-";
    const [hours, minutes] = jamMulai.split(":").map(Number);
    let endHours = hours + durasi;
    let daySuffix = "";
    if (endHours >= 24) { endHours -= 24; daySuffix = " (esok)"; }
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}${daySuffix}`;
  };

  const getMejaTersediaCount = () => SEMUA_MEJA.length - pesanan.filter(i => getValue(i, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]) === "Disetujui").length;
  const getPendingCount = () => pesanan.filter(i => getValue(i, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]) === "Pending").length;

  const pendingOrders = pesanan.filter(i => getValue(i, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]) === "Pending");
  const approvedOrders = pesanan.filter(i => getValue(i, ["status_pemesanan", "statusPemesanan", "statuspemesanan"]) === "Disetujui");

  if (loading && pesanan.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020a05] to-[#061010] flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#00ff99] text-4xl mx-auto mb-4" />
          <p className="text-slate-400">Memuat data reservasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a05] to-[#061010] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white">MONITOR <span className="text-[#00ff99]">ROYAL CUE</span></h1>
            <p className="text-slate-400 text-xs mt-1">Pemantauan Reservasi & Status Meja Real-time</p>
          </div>
          <div className="flex gap-3">
            {[ {label: "Meja Tersedia", val: getMejaTersediaCount(), col: "emerald"}, {label: "Menunggu", val: getPendingCount(), col: "amber"}, {label: "Bermain", val: approvedOrders.length, col: "rose"}].map((s, i) => (
              <div key={i} className="bg-slate-900/50 rounded-xl px-4 py-2 text-center">
                <p className="text-[9px] text-slate-400 uppercase">{s.label}</p>
                <p className={`text-2xl font-black text-${s.col}-400`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🗂️ STATUS MEJA</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SEMUA_MEJA.map((meja) => {
              const { status, durasi, jamMulai } = getStatusMeja(meja);
              const config = status === "Bermain" ? { c: "text-rose-400", t: "🔴 BERMAIN", b: "bg-rose-900/20 border-rose-500/30" } : status === "Menunggu" ? { c: "text-amber-400", t: "🟡 MENUNGGU", b: "bg-amber-900/20 border-amber-500/30" } : { c: "text-emerald-400", t: "🟢 TERSEDIA", b: "bg-slate-900/40 border-slate-700" };
              return (
                <div key={meja} className={`p-3 rounded-xl border ${config.b}`}>
                  <p className="text-slate-400 text-[9px] font-bold uppercase">{meja}</p>
                  <p className={`font-black text-sm ${config.c}`}>{config.t}</p>
                  {durasi && status === "Bermain" && <p className="text-[8px] text-slate-500 mt-1">{jamMulai} - {getWaktuSelesai(jamMulai, durasi)}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Reservasi */}
        {pendingOrders.length > 0 && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-900/50 border-b border-slate-800"><h3 className="text-xs font-bold text-amber-400">⏳ MENUNGGU PERSETUJUAN</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400">
                  <tr>{["Pelanggan", "Detail", "Meja", "Durasi", "Aksi"].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingOrders.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4 flex items-center gap-2"><FontAwesomeIcon icon={faUser} className="text-slate-500 text-xs" /> <span className="font-bold text-sm">{getNamaPelanggan(item)}</span></td>
                      <td className="p-4 text-[10px] text-slate-400"><p><FontAwesomeIcon icon={faCalendarAlt} /> {getValue(item, ["tanggal_main", "tanggal"])}</p><p><FontAwesomeIcon icon={faClock} /> {getJamMulai(item)}</p></td>
                      <td className="p-4 font-black text-emerald-400">{getNomorMeja(item)}</td>
                      <td className="p-4">{getDurasi(item)} Jam</td>
                      <td className="p-4 flex gap-2 justify-center">
                        <button onClick={() => ubahStatus(item.id, "Disetujui", getNamaPelanggan(item), getNomorMeja(item))} className="p-2 bg-emerald-600 rounded-lg"><FontAwesomeIcon icon={faCheck} /></button>
                        <button onClick={() => ubahStatus(item.id, "Ditolak", getNamaPelanggan(item), getNomorMeja(item))} className="p-2 bg-rose-600 rounded-lg"><FontAwesomeIcon icon={faTimes} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}