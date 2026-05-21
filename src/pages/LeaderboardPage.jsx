import React from "react";
import { FaCrown, FaMedal, FaTrophy, FaSearch } from "react-icons/fa";

export default function LeaderboardPage() {
  // Data Pemain (Diurutkan berdasarkan rank)
  const players = [
    { rank: 1, nama: "Anggy Mutydinata", poin: "12,450", winRate: "88%" },
    { rank: 2, nama: "Ahmad Rivaldi", poin: "10,200", winRate: "82%" },
    { rank: 3, nama: "Siska Putri", poin: "9,850", winRate: "79%" },
    { rank: 4, nama: "Kevin Wijaya", poin: "8,400", winRate: "75%" },
    { rank: 5, nama: "Budi Santoso", poin: "6,200", winRate: "68%" }
  ];

  // Mengambil 3 pemain teratas untuk podium
  const top1 = players.find(p => p.rank === 1);
  const top2 = players.find(p => p.rank === 2);
  const top3 = players.find(p => p.rank === 3);
  // Pemain sisanya (rank 4 ke bawah)
  const regularPlayers = players.filter(p => p.rank > 3);

  return (
    <div className="min-h-screen bg-[#020a05] text-white pt-28 pb-16 px-6 relative overflow-hidden flex flex-col items-center">
      
      {/* AKSEN EMERALD GLOW (Sama seperti Beranda & Reservasi) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC7A]/10 rounded-full blur-[180px] pointer-events-none z-0" />

      <div className="max-w-3xl w-full relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#00CC7A]/20 px-4 py-2 rounded-full border border-[#00ff99]/30 backdrop-blur-sm mb-3">
            <FaTrophy className="text-amber-400 text-xs animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff99]">Season Tournament</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Hall of <span className="bg-gradient-to-r from-[#00ff99] to-[#66ffa6] bg-clip-text text-transparent">Fame</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Daftar master biliar dan member dengan poin tertinggi musim ini
          </p>
        </div>

        {/* 1. PODIUM TOP 3 (VISUAL MEWAH) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end text-center mb-12 font-sans px-2">
          
          {/* PERINGKAT 2 (KIRI) */}
          {top2 && (
            <div className="bg-slate-950/40 border border-slate-800/60 p-4 sm:p-6 rounded-2xl flex flex-col items-center backdrop-blur-md h-[180px] justify-end relative shadow-lg">
              <FaMedal className="text-zinc-400 text-2xl mb-2 absolute top-4" />
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-black text-zinc-400 mb-2 border border-zinc-500/30 shadow-md">
                2
              </div>
              <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-wide text-white line-clamp-1 w-full px-1">{top2.nama}</h3>
              <p className="text-[11px] sm:text-xs font-black text-[#00ff99] mt-1">{top2.poin} <span className="text-[9px] font-normal text-slate-400">PTS</span></p>
            </div>
          )}

          {/* PERINGKAT 1 (TENGAH - LEBIH TINGGI & GLOWING) */}
          {top1 && (
            <div className="bg-gradient-to-b from-[#00CC7A]/10 to-slate-950/60 border-2 border-[#00ff99]/40 p-5 sm:p-8 rounded-2xl flex flex-col items-center backdrop-blur-md h-[220px] justify-end relative scale-105 shadow-[0_0_30px_rgba(0,255,153,0.05)]">
              <FaCrown className="text-amber-400 text-3xl mb-1 absolute top-4 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)] animate-pulse" />
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-sm font-black text-slate-950 mb-3 border-2 border-white shadow-lg shadow-amber-400/20">
                1
              </div>
              <h3 className="text-xs sm:text-base font-black uppercase tracking-widest text-white line-clamp-1 w-full px-1">{top1.nama}</h3>
              <p className="text-xs sm:text-sm font-black text-[#00ff99] mt-1">{top1.poin} <span className="text-[10px] font-bold text-[#66ffa6]">PTS</span></p>
              <span className="absolute -top-3 px-3 py-0.5 bg-[#00ff99] text-slate-950 font-black text-[8px] uppercase tracking-widest rounded-full shadow">Leader</span>
            </div>
          )}

          {/* PERINGKAT 3 (KANAN) */}
          {top3 && (
            <div className="bg-slate-950/40 border border-slate-800/60 p-4 sm:p-6 rounded-2xl flex flex-col items-center backdrop-blur-md h-[160px] justify-end relative shadow-lg">
              <FaMedal className="text-amber-700 text-2xl mb-2 absolute top-4" />
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-black text-amber-700 mb-2 border border-amber-700/30 shadow-md">
                3
              </div>
              <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-wide text-white line-clamp-1 w-full px-1">{top3.nama}</h3>
              <p className="text-[11px] sm:text-xs font-black text-[#00ff99] mt-1">{top3.poin} <span className="text-[9px] font-normal text-slate-400">PTS</span></p>
            </div>
          )}

        </div>

        {/* 2. TABEL DAFTAR PERINGKAT (RANK 4 KE BAWAH) */}
        <div className="space-y-3 font-sans">
          
          {/* Render Podium 1-3 dalam bentuk list tipis untuk mobile jika layar terlalu kecil */}
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">
            Peringkat Klasemen
          </div>

          {/* Tampilkan Top 3 di list dengan desain khusus */}
          {players.slice(0, 3).map(p => (
            <div key={p.rank} className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-900 rounded-xl px-5 backdrop-blur-sm opacity-90">
              <div className="flex items-center gap-4">
                <span className={`w-6 text-center font-black text-xs ${p.rank === 1 ? "text-amber-400" : p.rank === 2 ? "text-zinc-400" : "text-amber-700"}`}>
                  #{p.rank}
                </span>
                <span className="font-bold text-sm tracking-wide text-slate-200 uppercase">{p.nama}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">WR {p.winRate}</span>
                <span className="font-black text-sm text-[#00ff99] tracking-wider">{p.poin} <span className="text-[9px] font-normal text-slate-500">PTS</span></span>
              </div>
            </div>
          ))}

          {/* Tampilkan sisa pemain (Rank 4+) */}
          {regularPlayers.map(p => (
            <div key={p.rank} className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800/50 hover:border-[#00ff99]/20 transition-all duration-300 rounded-xl px-5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-bold text-xs text-slate-500">
                  #{p.rank}
                </span>
                <span className="font-bold text-sm tracking-wide text-white uppercase">{p.nama}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500">WR {p.winRate}</span>
                <span className="font-black text-sm text-slate-300 tracking-wider">{p.poin} <span className="text-[9px] font-normal text-slate-500">PTS</span></span>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}