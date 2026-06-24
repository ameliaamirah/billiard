// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faCrown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/home.png')" }}
      >
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/90" />
        <div className="absolute inset-0 bg-slate-950/40" />
      </div>

      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-[#00CC7A]/10 rounded-full blur-[180px] pointer-events-none
          transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}
          w-[250px] h-[250px] xs:w-[350px] xs:h-[350px]
          sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px]
        `}
      />

      {/* KONTEN UTAMA - di atas background */}
      <div
        className={`
          relative z-10 flex flex-col items-center justify-center
          h-full w-full px-4 sm:px-8 lg:px-12 text-center
          transition-all duration-700 transform
          ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}
      >
        <div className="max-w-4xl mx-auto w-full">
          {/* BADGE */}
          <div className="flex justify-center animate-fadeInDown">
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
            font-black mt-4 sm:mt-6 mb-3 sm:mb-4 md:mb-6
            leading-[1.2] tracking-tight
            text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl
            max-w-2xl mx-auto text-white
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
            mb-6 sm:mb-8 md:mb-10
            font-medium opacity-90
            px-2 sm:px-0
          ">
            Kelola ketersediaan meja biliar premium, perhitungan billing otomatis real-time,
            dan pemesanan layanan F&B terintegrasi dalam satu sistem modern.
          </p>

          {/* TOMBOL */}
          <div className="flex justify-center animate-fadeInUp">
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
    </div>
  );
};

export default HomePage;