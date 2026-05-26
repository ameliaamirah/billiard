import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
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
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDirectNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Reservasi Meja", path: "/reservasi" },
  ];

  const isNavbarSolid = scrolled || menuOpen || location.pathname !== "/";

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${
      isNavbarSolid 
        ? "bg-[#070a13]/90 backdrop-blur-md border-slate-800/40 shadow-lg py-3" 
        : "bg-transparent border-transparent py-4 md:py-5"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-5 flex justify-between items-center">
        
        {/* LOGO BRAND */}
        <div 
          className="flex items-center cursor-pointer select-none pb-0.5 border-b-[0.5px] border-[#00ff99]/10 hover:border-[#00ff99]/40 transition-colors duration-300" 
          onClick={() => handleDirectNavigate("/")}
        >
          <img src="/images/logo.png" alt="Royal Cue Logo" className="h-[30px] md:h-[36px] w-auto filter brightness-110" />
          <h1 className="font-black text-base md:text-lg tracking-wide -ml-1 text-white">
            Royal Cue <span className="text-[#00ff99]">Studio</span>
          </h1>
        </div>

        {/* NAVIGATION MENU (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <button 
              key={item.path} 
              onClick={() => handleDirectNavigate(item.path)}
              className={`font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                location.pathname === item.path ? "text-[#00ff99]" : "text-slate-300 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* MOBILE TOGGLE BUTTON */}
        <button 
          className="md:hidden text-xl text-white cursor-pointer z-[110] p-1" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* BACKGROUND BLUR OVERLAY */}
      {menuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85] md:hidden" onClick={() => setMenuOpen(false)} />}

      {/* 📱 MENU MOBILE (SIDEBAR FIXED POSITION) */} 
      <div className={`md:hidden fixed top-0 left-0 w-[260px] sm:w-[300px] h-screen bg-[#070a13] border-r border-slate-800/60 text-white transition-transform duration-500 z-[90] rounded-tr-[24px] rounded-br-[24px] shadow-2xl flex flex-col justify-between ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* AREA ATAS: LOGO & LINK NAVIGASI */}
        <div className="flex flex-col pt-16 px-6 gap-5 overflow-y-auto">
          
          {/* LOGO BRAND (MOBILE SIDEBAR) */}
          <div className="flex items-center pb-3 border-b-[0.5px] border-slate-800/40 mb-1">
            <img src="/images/logo.png" alt="Royal Cue Logo" className="h-[28px] w-auto filter brightness-110" />
            <span className="font-black text-sm tracking-wide text-white -ml-0.5">
              Royal Cue <span className="text-[#00ff99]">Studio</span>
            </span>
          </div>

          {navLinks.map((item) => (
            <button 
              key={item.name}
              onClick={() => handleDirectNavigate(item.path)}
              className={`text-left text-base font-bold tracking-wide py-1.5 transition-all cursor-pointer ${
                location.pathname === item.path ? "text-[#00ff99]" : "text-slate-300 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* AREA BAWAH */}
        <div className="px-6 pb-15 pt-4 border-t border-slate-800/40 bg-[#070a13]">
          <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase">
            © 2026 ROYAL CUE STUDIO
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;