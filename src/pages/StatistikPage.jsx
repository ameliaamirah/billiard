import React from "react";
import { FaFire, FaBullseye, FaHistory, FaTv, FaAward } from "react-icons/fa";

export default function StatistikPage() {
  // Simulasi Data Stat Member Dinamis
  const memberData = {
    nama: "Anggy Mutydinata",
    level: "Grandmaster",
    winStreak: "12 Games",
    avgBreak: "4.5 Balls",
    winRate: "88%",
    totalMatch: "142",
    riwayatMatch: [
      { id: 1, lawan: "Ahmad Rivaldi", hasil: "Menang", skor: "7 - 4", tanggal: "17 Mei 2026", meja: "VIP Room" },
      { id: 2, lawan: "Siska Putri", hasil: "Menang", skor: "7 - 2", tanggal: "15 Mei 2026", meja: "Championship" },
      { id: 3, lawan: "Kevin Wijaya", hasil: "Kalah", skor: "5 - 7", tanggal: "12 Mei 2026", meja: "Reguler Table" },
    ]
  };

  // Membuat inisial nama otomatis untuk avatar
  const getInisial = (nama) => {
    return nama.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 relative overflow-hidden flex flex-col items-center">
      
      {/* AKSEN EMERALD GLOW (Sama seperti Beranda, Reservasi, & Leaderboard) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC7A]/10 rounded-full blur-[180px] pointer-events-none z-0" />

      <div className="max-w-3xl w-full relative z-10 space-y-8">
        
        {/* HEADER PROFIL MEMBER */}
        <section className="p-6 sm:p-8 border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-[#00CC7A]/2">
          
          {/* Avatar Ring Glowing */}
          <div className="w-20 h-20 rounded-full border-2 border-[#00ff99]/30 p-1 flex-shrink-0 bg-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,153,0.1)]">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-black text-base tracking-widest text-[#00ff99]">
              {getInisial(memberData.nama)}
            </div>
          </div>

          {/* Info Utama */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{memberData.nama}</h2>
            <div className="inline-flex items-center gap-1.5 bg-[#00CC7A]/20 px-3 py-1 rounded-full border border-[#00ff99]/20 text-[10px] font-black uppercase tracking-wider text-[#00ff99]">
              <FaAward className="text-amber-400 text-xs" /> {memberData.level}
            </div>
          </div>

          {/* Ringkasan Angka di Kanan */}
          <div className="sm:ml-auto grid grid-cols-2 gap-4 text-center w-full sm:w-auto">
            <div className="bg-slate-900/60 p-4 border border-slate-800/60 rounded-xl min-w-[100px]">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Win Rate</p>
              <p className="text-xl font-black text-[#00ff99] italic">{memberData.winRate}</p>
            </div>
            <div className="bg-slate-900/60 p-4 border border-slate-800/60 rounded-xl min-w-[100px]">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Match</p>
              <p className="text-xl font-black text-white italic">{memberData.totalMatch}</p>
            </div>
          </div>
        </section>

        {/* DATA KARTU STATISTIK UTAMA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-slate-950/40 border border-slate-800/60 rounded-xl flex justify-between items-center backdrop-blur-md hover:border-[#00ff99]/20 transition-all duration-300">
            <span className="text-slate-400 flex items-center gap-3 font-medium text-sm">
              <FaFire className="text-orange-500 text-base" /> 
              <span>Win Streak</span>
            </span>
            <span className="font-black text-base text-[#00ff99] tracking-wide">{memberData.winStreak}</span>
          </div>
          
          <div className="p-6 bg-slate-950/40 border border-slate-800/60 rounded-xl flex justify-between items-center backdrop-blur-md hover:border-[#00ff99]/20 transition-all duration-300">
            <span className="text-slate-400 flex items-center gap-3 font-medium text-sm">
              <FaBullseye className="text-red-500 text-base" /> 
              <span>Avg Break</span>
            </span>
            <span className="font-black text-base text-[#00ff99] tracking-wide">{memberData.avgBreak}</span>
          </div>
        </div>

        {/* TABEL BARU: RIWAYAT PERTANDINGAN TERAKHIR */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 mb-6 border-b border-slate-900 pb-4">
            <FaHistory className="text-[#00ff99] text-sm" />
            <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Riwayat Match Terakhir</h3>
          </div>
          
          <div className="space-y-3">
            {memberData.riwayatMatch.map((match) => (
              <div 
                key={match.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-900 bg-slate-950/20 hover:border-[#00ff99]/10 transition-all duration-300 rounded-xl px-5"
              >
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                    {match.tanggal} • {match.meja}
                  </p>
                  <p className="font-black text-sm tracking-wide text-white uppercase italic">
                    vs {match.lawan}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start border-t border-slate-900/50 sm:border-0 pt-2 sm:pt-0">
                  <span className="text-base font-black italic tracking-wider text-white">
                    {match.skor}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 tracking-widest rounded-lg ${
                    match.hasil === "Menang" 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {match.hasil}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}