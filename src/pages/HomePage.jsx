import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTv, FaCrown, FaChevronRight } from "react-icons/fa"; // Mengimport ikon yang dibutuhkan

const HomePage = () => {
  const navigate = useNavigate();

  return (
    // Gambar penuh satu layar, konten diatur ke tengah secara vertikal & horizontal
    <div 
      className="h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center overflow-hidden text-white"
      style={{ backgroundImage: "url('/images/home.png')" }}
    >
      
      {/* OVERLAY SINETIK SIMETRIS: Efek gelap melingkar (vignette) agar fokus mata tetap ke tengah */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950/90 z-0" />
      <div className="absolute inset-0 bg-slate-950/50 z-0" />
      
      {/* AKSEN EMERALD GLOW: Pendaran lampu hijau biliar tepat di belakang teks utama */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00CC7A]/15 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* KONTEN UTAMA (RATA TENGAH) */}
      <div className="max-w-4xl mx-auto w-full px-6 sm:px-12 relative z-10 flex flex-col items-center text-center">
        
        {/* BADGE PRESTISIUS DENGAN IKON MAHKOTA */}
        <div className="flex justify-center">
          <span className="flex items-center gap-2 text-[#00ff99] font-black tracking-widest text-[10px] uppercase bg-[#00CC7A]/20 px-4 py-2 rounded-full border border-[#00CC7A]/40 backdrop-blur-sm shadow-inner">
            <FaCrown className="text-xs text-amber-400 animate-pulse" /> Premium Sport Lounge
          </span>
        </div>
        
        {/* JUDUL UTAMA */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mt-6 mb-6 leading-[1.2] tracking-tight max-w-2xl text-white">
          Sistem Manajemen <br />
          <span className="bg-gradient-to-r from-[#00ff99] via-[#66ffa6] to-[#00ff99] bg-clip-text text-transparent">
            Royal Cue Studio
          </span>
        </h1>
        
        {/* DESKRIPSI SINGKAT */}
        <p className="text-slate-200 text-sm md:text-base max-w-lg leading-relaxed mb-10 font-medium opacity-90">
          Kelola ketersediaan meja biliar premium, perhitungan billing otomatis real-time, dan pemesanan layanan F&B terintegrasi dalam satu sistem modern.
        </p>

        {/* TOMBOL AKSI UTAMA DENGAN IKON MONITOR & PANAH */}
        <div className="flex justify-center">
          <button 
            onClick={() => navigate("/monitoring-meja")}
            className="flex items-center gap-3 bg-[#00aa66] hover:bg-[#00cc7a] text-white font-black text-sm px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-[#00aa66]/30 hover:shadow-[#00aa66]/50 active:scale-95 cursor-pointer group"
          >
            <FaTv className="text-base" />
            <span>Buka Live Monitor</span>
            <FaChevronRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default HomePage;