import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faInstagram, 
  faWhatsapp, 
  faFacebook,
  faTiktok,
  faYoutube
} from "@fortawesome/free-brands-svg-icons";
import { 
  faMapMarkerAlt, 
  faPhoneAlt, 
  faEnvelope,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Beranda", path: "/" },
    { label: "Reservasi Meja", path: "/reservasi" },
    { label: "Leaderboard Player", path: "/leaderboard" },
    { label: "Statistik Member", path: "/statistik" },
  ];

  const socialLinks = [
    { icon: faInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: faWhatsapp, href: "https://wa.me/6281234567890", label: "WhatsApp" },
    { icon: faFacebook, href: "https://facebook.com", label: "Facebook" },
    { icon: faTiktok, href: "https://tiktok.com", label: "TikTok" },
    { icon: faYoutube, href: "https://youtube.com", label: "YouTube" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (path) => {
    navigate(path);
    scrollToTop();
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070a13] text-slate-300 border-t border-slate-900 pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-5 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-8 md:mb-12">
          
          {/* KOLOM 1: BRAND & SOCIAL */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00ff99] to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm sm:text-base">RC</span>
              </div>
              <h2 className="text-white font-black text-base sm:text-lg md:text-xl tracking-tight">
                Royal Cue <span className="text-[#00ff99]">Studio</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 mb-4 md:mb-6">
              Arena billiard premium dengan standar turnamen internasional. 
              Tempat terbaik untuk mengasah skill dan bersantai bersama komunitas.
            </p>
            
            {/* Social Media Icons - Responsive Grid */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#00aa66] hover:border-[#00aa66] hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <FontAwesomeIcon icon={social.icon} className="text-xs sm:text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: NAVIGASI CEPAT */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 uppercase text-[10px] sm:text-xs tracking-wider">
              Navigasi
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className={`text-xs sm:text-sm text-slate-400 hover:text-[#00ff99] transition-colors cursor-pointer w-full text-left py-1.5 sm:py-2 px-0 rounded-lg hover:translate-x-1 transform transition-all ${
                      location.pathname === item.path ? "text-[#00ff99]" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 3: JAM OPERASIONAL */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 uppercase text-[10px] sm:text-xs tracking-wider">
              Jam Operasional
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 border-b border-slate-800/50 pb-2">
                <span className="text-xs sm:text-sm text-slate-400">Senin - Kamis</span>
                <span className="text-white text-xs sm:text-sm font-medium">10:00 - 00:00</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 border-b border-slate-800/50 pb-2">
                <span className="text-xs sm:text-sm text-slate-400">Jumat - Minggu</span>
                <span className="text-[#00ff99] text-xs sm:text-sm font-bold">10:00 - 03:00</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <FontAwesomeIcon icon={faClock} className="text-[#00ff99] text-[10px] sm:text-xs mt-0.5 shrink-0" />
                <p className="text-[9px] sm:text-[10px] text-slate-500 italic">
                  *Buka di hari libur nasional (jadwal khusus)
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM 4: KONTAK & ALAMAT */}
          <div>
            <h3 className="text-white font-bold mb-4 md:mb-6 uppercase text-[10px] sm:text-xs tracking-wider">
              Kontak & Alamat
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex gap-2 sm:gap-3 items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#00ff99] text-xs sm:text-sm mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Jl. Jawa No. 10, Banyuwangi, Jawa Timur
                </span>
              </li>
              <li className="flex gap-2 sm:gap-3 items-center">
                <FontAwesomeIcon icon={faPhoneAlt} className="text-[#00ff99] text-xs sm:text-sm shrink-0" />
                <a href="tel:+6281234567890" className="text-xs sm:text-sm text-slate-400 hover:text-[#00ff99] transition-colors">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex gap-2 sm:gap-3 items-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-[#00ff99] text-xs sm:text-sm shrink-0" />
                <a href="mailto:hello@royalcue.com" className="text-xs sm:text-sm text-slate-400 hover:text-[#00ff99] transition-colors break-all">
                  hello@royalcue.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT SECTION - Fully Responsive */}
        <div className="border-t border-slate-900 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-medium tracking-wider text-slate-500 uppercase">
          <p className="text-center sm:text-left">
            © {currentYear} Royal Cue Studio. All Rights Reserved.
          </p>
          
          {/* Back to Top Button - Mobile Friendly */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-slate-500 hover:text-[#00ff99] transition-colors group"
          >
            <span>Back to Top</span>
            <svg className="w-3 h-3 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
          
          <p className="text-center sm:text-right">
            Built with <span className="text-red-500">❤️</span> for Billiard Community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;