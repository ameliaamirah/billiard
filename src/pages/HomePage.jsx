// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faCrown, faChevronRight, faUserCheck, faUserShield } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSecretButtons, setShowSecretButtons] = useState(false); // State untuk kontrol tombol bulat gaib

  useEffect(() => {
    setIsLoaded(true);

    // MENDENGARKAN COMBINASI TOMBOL RAHASIA (Ctrl + Shift + A) UNTUK MEMUNCUKKAN TOMBOL BULAT
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault(); 
        setShowSecretButtons((prev) => !prev); // Munculkan / sembunyikan kedua tombol bulat
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-950 select-none box-border m-0 p-0">
      
      {/* BACKGROUND IMAGE & OVERLAYS */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: "url('/images/home.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/90" />
        <div className="absolute inset-0 bg-slate-950/40" />
      </div>

      {/* AMBIENT GREEN GLOW EFFECT */}
      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-[#00CC7A]/10 rounded-full blur-[180px] pointer-events-none
          transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}
          w-[250px] h-[250px] xs:w-[350px] xs:h-[350px]
          sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px]
        `}
      />

      {/* KONTEN UTAMA */}
      <div
        className={`
          absolute inset-0 z-10 flex flex-col items-center justify-center
          h-full w-full px-4 sm:px-8 lg:px-12 text-center box-border
          transition-all duration-700 transform
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center max-h-full overflow-hidden gap-y-4 sm:gap-y-6 md:gap-y-8 py-2">
          
          {/* BADGE */}
          <div className="flex justify-center animate-fadeInDown flex-shrink-0">
            <span className="
              flex items-center gap-1.5 sm:gap-2
              text-[#00ff99] font-black tracking-widest
              text-[8px] xs:text-[9px] sm:text-[10px]
              uppercase bg-[#00CC7A]/20
              px-2.5 sm:px-3 md:px-4
              py-1 sm:py-1.5 md:py-2
              rounded-full border border-[#00CC7A]/40
              backdrop-blur-sm shadow-inner
            ">
              <FontAwesomeIcon icon={faCrown} className="text-[10px] xs:text-xs text-amber-400 animate-pulse" />
              <span className="hidden xs:inline">Premium Sport Lounge</span>
              <span className="xs:hidden">Premium Lounge</span>
            </span>
          </div>

          {/* JUDUL */}
          <h1 className="
            font-black leading-[1.2] tracking-tight flex-shrink-0
            text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl
            max-w-2xl mx-auto text-white drop-shadow-2xl
          ">
            Sistem Manajemen
            <br />
            <span className="bg-gradient-to-r from-[#00ff99] via-[#66ffa6] to-[#00ff99] bg-clip-text text-transparent">
              Royal Cue Studio
            </span>
          </h1>

          {/* DESKRIPSI */}
          <p className="
            text-slate-200
            text-xs xs:text-sm sm:text-base md:text-lg
            max-w-lg mx-auto leading-relaxed
            font-medium opacity-90 box-border flex-shrink
            px-2 sm:px-0
          ">
            Kelola ketersediaan meja biliar premium, perhitungan billing otomatis real-time,
            dan pemesanan layanan F&B terintegrasi dalam satu sistem modern.
          </p>

          {/* TOMBOL PUBLIC RESERVASI */}
          <div className="flex justify-center animate-fadeInUp flex-shrink-0">
            <button
              onClick={() => navigate("/reservasi")}
              className="
                group flex items-center gap-2 sm:gap-3
                bg-[#00aa66] hover:bg-[#00cc7a]
                text-white font-black
                text-xs xs:text-sm sm:text-base
                px-4 sm:px-6 md:px-8
                py-2.5 sm:py-3 md:py-4
                rounded-xl transition-all duration-300
                shadow-xl shadow-[#00aa66]/30 hover:shadow-[#00aa66]/50
                border border-white/5 hover:border-white/10
                active:scale-95 cursor-pointer
                min-h-[48px] sm:min-h-[56px]
              "
            >
              <FontAwesomeIcon icon={faTv} className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Reservasi Meja</span>
              <span className="xs:hidden">Reservasi</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-[10px] sm:text-xs transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>

        </div>
      </div>

      {/* TOMBOL BULAT YANG MUNCUL SETELAH TEKAN CTRL+SHIFT+A */}
      <div 
        className={`
          absolute bottom-6 left-6 z-20 flex gap-4 box-border transition-all duration-500 transform
          ${showSecretButtons ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
        `}
      >
        {/* Bulatan Portal Kasir (Menebas ke /kasir sesuai App.jsx) */}
        <button
          onClick={() => navigate("/kasir")}
          className="
            w-12 h-12 flex items-center justify-center rounded-full
            bg-slate-900/30 hover:bg-slate-900/80 text-slate-400 hover:text-[#00ff99] 
            backdrop-blur-md border border-white/5 hover:border-[#00CC7A]/60
            hover:shadow-[0_0_15px_rgba(0,204,122,0.4)]
            transition-all duration-300 active:scale-90 cursor-pointer
          "
          aria-label="Portal Kasir"
          title="Login Kasir"
        >
          <FontAwesomeIcon icon={faUserCheck} className="text-base" />
        </button>

        {/* Bulatan Portal Admin (Menebas ke /admin sesuai App.jsx) */}
        <button
          onClick={() => navigate("/admin")} 
          className="
            w-12 h-12 flex items-center justify-center rounded-full
            bg-slate-900/30 hover:bg-slate-900/80 text-slate-400 hover:text-amber-400 
            backdrop-blur-md border border-white/5 hover:border-amber-500/60
            hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]
            transition-all duration-300 active:scale-90 cursor-pointer
          "
          aria-label="Portal Admin"
          title="Login Admin"
        >
          <FontAwesomeIcon icon={faUserShield} className="text-base" />
        </button>
      </div>

    </div>
  );
};

export default HomePage;