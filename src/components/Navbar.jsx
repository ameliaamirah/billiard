import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMobileOpen, setProfileMobileOpen] = useState(false);
  const [active, setActive] = useState("home");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };

    if (menuOpen) lockScroll();
    else unlockScroll();

    return () => unlockScroll();
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      if (location.pathname === "/") {
        const sections = document.querySelectorAll("section[id]");
        const scrollY = window.pageYOffset;
        sections.forEach((current) => {
          const sectionHeight = current.offsetHeight;
          const sectionTop = current.offsetTop - 100;
          const sectionId = current.getAttribute("id");
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            setActive(sectionId);
          }
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleScrollTo = (id) => {
    setMenuOpen(false);
    
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const target = document.querySelector(id);
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
      }, 300);
    } else {
      const target = document.querySelector(id);
      if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
    }
  };

  const handleDirectNavigate = (path) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate(path);
  };

  const navLinks = [{ name: "Beranda", id: "#home" }];

  const isActive = (path) => location.pathname === path;

  const isNavbarSolid = scrolled || menuOpen || location.pathname !== "/";

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${
      isNavbarSolid 
        ? "bg-[#070a13]/90 backdrop-blur-md border-slate-800/80 shadow-lg py-3" 
        : "bg-transparent border-transparent py-5"
    }`}>
      <div className="max-w-6xl mx-auto px-5 flex justify-between items-center">
        
        {/* LOGO BRAND (DESKTOP) */}
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={() => (location.pathname === "/" ? handleScrollTo("#home") : handleDirectNavigate("/"))}
        >
          <img src="/images/logo.png" alt="Royal Cue Logo" className="h-[36px] w-auto filter brightness-110" />
          {/* PERBAIKAN 1: Menggunakan margin negatif -ml-1 untuk menarik tulisan agar sangat dekat dengan logo */}
          <h1 className="font-black text-lg tracking-wide -ml-1 text-white">
            Royal Cue <span className="text-[#00ff99]">Studio</span>
          </h1>
        </div>

        {/* NAVIGATION MENU (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <button key={item.id} onClick={() => handleScrollTo(item.id)}
              className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                active === item.id.replace("#", "") && location.pathname === "/" ? "text-[#00ff99]" : "text-slate-300 hover:text-white"
              }`}>
              {item.name}
            </button>
          ))}
          
          {/* DROPDOWN PROFIL */}
          <div 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 py-2 cursor-pointer transition-colors ${
              (isActive("/tentang-kami") || isActive("/struktur-organisasi")) ? "text-[#00ff99]" : "text-slate-300 hover:text-white"
            }`}>
              Profil <FaChevronDown className={`text-[9px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-0 w-52 bg-[#0b1329] rounded-xl shadow-2xl border border-slate-800 py-2">
                <button onClick={() => handleDirectNavigate("/tentang-kami")}
                  className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-300 hover:bg-[#00ff99]/10 hover:text-[#00ff99] font-bold transition-colors cursor-pointer">
                  Tentang Kami
                </button>
                <button onClick={() => handleDirectNavigate("/struktur-organisasi")}
                  className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wide text-slate-300 hover:bg-[#00ff99]/10 hover:text-[#00ff99] font-bold transition-colors cursor-pointer">
                  Struktur Organisasi
                </button>
              </div>
            )}
          </div>

          <button onClick={() => handleDirectNavigate("/monitoring-meja")}
            className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${isActive("/monitoring-meja") ? "text-[#00ff99]" : "text-slate-300 hover:text-white"}`}>
            Monitoring Meja
          </button>

          <button onClick={() => handleDirectNavigate("/inventory-fnb")}
            className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${isActive("/inventory-fnb") ? "text-[#00ff99]" : "text-slate-300 hover:text-white"}`}>
            Inventaris F&B
          </button>

          <button onClick={() => handleDirectNavigate("/laporan-keuangan")}
            className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${isActive("/laporan-keuangan") ? "text-[#00ff99]" : "text-slate-300 hover:text-white"}`}>
            Laporan Keuangan
          </button>

          <button onClick={() => handleDirectNavigate("/kontak-kami")}
            className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${isActive("/kontak-kami") ? "text-[#00ff99]" : "text-slate-300 hover:text-white"}`}>
            Kontak Kami
          </button>
        </nav>

        {/* MOBILE TOGGLE BUTTON */}
        <button className="md:hidden text-xl text-white cursor-pointer z-[110]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes className="text-slate-800" /> : <FaBars />}
        </button>
      </div>

      {/* BACKGROUND BLUR OVERLAY */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[85] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MENU MOBILE - POSISI KIRI DENGAN TEKS HITAM */} 
      <div className={`md:hidden fixed top-0 left-0 w-[280px] sm:w-[320px] h-screen bg-white text-black transition-transform duration-500 z-[90] rounded-tr-[40px] rounded-br-[40px] shadow-2xl flex flex-col justify-between ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Bagian Atas Menu */}
        <div className="flex flex-col pt-16 px-8 gap-6 overflow-y-auto flex-grow">
          
          {/* Identitas Brand Mini */}
          <div className="flex items-center mb-4 border-b border-slate-100 pb-4">
            <img src="/images/logo1.png" alt="Royal Cue Logo" className="h-[28px] w-auto" />
            <span className="font-black text-sm tracking-wide text-black -ml-0.5">Royal Cue Studio</span>
          </div>

          {/* Navigasi Beranda */}
          <button 
            onClick={() => handleScrollTo("#home")} 
            className="text-left text-lg font-black tracking-wide text-black hover:opacity-70 transition-opacity"
          >
            Beranda
          </button>
          
          {/* Akordion Dropdown Profil */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setProfileMobileOpen(!profileMobileOpen)}
              className="flex justify-between items-center text-left text-lg font-black tracking-wide text-black"
            >
              Profile
              <FaChevronDown className={`text-xs text-black transition-transform duration-300 ${profileMobileOpen ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`flex flex-col gap-2 pl-4 border-l-2 border-slate-200 transition-all duration-300 overflow-hidden ${
              profileMobileOpen ? "max-h-24 opacity-100 mt-1" : "max-h-0 opacity-0 pointer-events-none"
            }`}>
              <button onClick={() => handleDirectNavigate("/tentang-kami")} className="text-left text-sm font-bold text-black hover:opacity-70 transition-opacity">
                Tentang Kami
              </button>
              <button onClick={() => handleDirectNavigate("/struktur-organisasi")} className="text-left text-sm font-bold text-black hover:opacity-70 transition-opacity">
                Struktur Organisasi
              </button>
            </div>
          </div>

          {/* Menu Lainnya */}
          <button onClick={() => handleDirectNavigate("/monitoring-meja")} className="text-left text-lg font-black tracking-wide text-black hover:opacity-70 transition-opacity">
            Monitoring Meja
          </button>
          
          <button onClick={() => handleDirectNavigate("/inventory-fnb")} className="text-left text-lg font-black tracking-wide text-black hover:opacity-70 transition-opacity">
            Inventaris F&B
          </button>
          
          <button onClick={() => handleDirectNavigate("/laporan-keuangan")} className="text-left text-lg font-black tracking-wide text-black hover:opacity-70 transition-opacity">
            Laporan Keuangan
          </button>
          
          <button onClick={() => handleDirectNavigate("/kontak-kami")} className="text-left text-lg font-black tracking-wide text-black hover:opacity-70 transition-opacity">
            Kontak Kami
          </button>
        </div>

        {/* Bagian Bawah Menu (Footer Hak Cipta) */}
        <div className="px-8 pb-8 pt-4 border-t border-slate-100">
          <p className="text-[9px] tracking-widest text-slate-400 font-bold uppercase">
            © 2026 ROYAL CUE STUDIO
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;