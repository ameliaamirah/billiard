import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faHome, faCalendarAlt, faTachometerAlt, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Cek apakah user sudah login
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("role");

  // Halaman publik (HomePage & Reservasi) - tidak perlu dashboard link & notification bell
  const isPublicPage = location.pathname === "/" || location.pathname === "/reservasi";

  // Notification bell HANYA tampil jika user login DAN bukan di halaman publik
  const showNotificationBell = isLoggedIn && !isPublicPage;

  // Lock scroll when sidebar open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleDirectNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  // NavLink untuk halaman publik (selalu tampil)
  const publicNavLinks = [
    { name: "Beranda", path: "/", icon: faHome },
    { name: "Reservasi Meja", path: "/reservasi", icon: faCalendarAlt },
  ];

  // Dashboard link HANYA tampil jika user login DAN bukan di halaman publik
  const dashboardLinks = [];
  if (isLoggedIn && !isPublicPage) {
    if (userRole === "admin") {
      dashboardLinks.push({ name: "Dashboard Admin", path: "/admin-dashboard", icon: faTachometerAlt });
    } else if (userRole === "kasir") {
      dashboardLinks.push({ name: "Dashboard Kasir", path: "/kasir-dashboard", icon: faTachometerAlt });
    }
  }

  // Gabungkan link
  const navLinks = [...publicNavLinks, ...dashboardLinks];

  const isNavbarSolid = scrolled || menuOpen || location.pathname !== "/";

  // Get user info for sidebar
  const getUserName = () => {
    if (!isLoggedIn) return null;
    return localStorage.getItem("username") || localStorage.getItem("nama_kasir") || "User";
  };

  const userName = getUserName();

  return (
    <header className={`
      fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b
      ${isNavbarSolid 
        ? "bg-[#070a13]/95 backdrop-blur-md border-slate-800/40 shadow-lg py-2.5 sm:py-3" 
        : "bg-transparent border-transparent py-3 sm:py-4 md:py-5"
      }
    `}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 flex justify-between items-center">
        
        {/* LOGO BRAND - Touch Friendly */}
        <div 
          className="flex items-center cursor-pointer select-none py-1.5 px-1 -ml-1 rounded-lg hover:bg-white/5 transition-all duration-300" 
          onClick={() => handleDirectNavigate("/")}
        >
          <img 
            src="/images/logo.png" 
            alt="Royal Cue Logo" 
            className="h-7 sm:h-8 md:h-9 w-auto filter brightness-110"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 className="font-black text-sm sm:text-base md:text-lg tracking-wide -ml-0.5 text-white">
            Royal Cue <span className="text-[#00ff99]">Studio</span>
          </h1>
        </div>

        {/* NAVIGATION MENU (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((item) => (
            <button 
              key={item.path} 
              onClick={() => handleDirectNavigate(item.path)}
              className={`
                font-bold text-[11px] lg:text-xs uppercase tracking-wider transition-all 
                py-2 px-1 rounded-lg hover:bg-white/5
                ${location.pathname === item.path 
                  ? "text-[#00ff99] border-b-2 border-[#00ff99]" 
                  : "text-slate-300 hover:text-white"
                }
              `}
            >
              {item.name}
            </button>
          ))}
          
          {/* Notification Bell - Desktop */}
          {showNotificationBell && (
            <div className="ml-1">
              <NotificationBell />
            </div>
          )}
        </nav>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3 md:hidden">
          {/* Notification Bell untuk mobile */}
          {showNotificationBell && <NotificationBell />}
          
          {/* Menu Toggle Button - Touch Friendly */}
          <button 
            className="text-white cursor-pointer z-[110] p-2 -m-1 rounded-lg hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size={18} />
          </button>
        </div>
      </div>

      {/* BACKDROP OVERLAY - Mobile */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden animate-fadeIn" 
          onClick={() => setMenuOpen(false)} 
        />
      )}

      {/* 📱 MENU MOBILE (SIDEBAR) - Enhanced */}
      <div className={`
        md:hidden fixed top-0 left-0 h-screen 
        w-[280px] sm:w-[320px] 
        bg-gradient-to-b from-[#070a13] to-[#0a0f18] 
        border-r border-slate-800/60 text-white 
        transition-transform duration-500 ease-in-out z-[95]
        rounded-r-2xl shadow-2xl
        flex flex-col justify-between
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* AREA ATAS: LOGO & CLOSE BUTTON + NAVIGASI */}
        <div className="flex flex-col pt-4 sm:pt-5">
          
          {/* Header Sidebar dengan Close Button */}
          <div className="flex items-center justify-between px-5 sm:px-6 pb-3 sm:pb-4 border-b border-slate-800/60 mb-2">
            <div className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="Royal Cue Logo" 
                className="h-7 w-auto filter brightness-110"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="font-black text-sm tracking-wide text-white">
                Royal Cue <span className="text-[#00ff99]">Studio</span>
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 -m-1 rounded-lg hover:bg-slate-800 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faTimes} size={16} />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {isLoggedIn && userName && (
            <div className="mx-4 sm:mx-5 mb-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00ff99]/20 to-emerald-700/20 rounded-full flex items-center justify-center border border-[#00ff99]/30">
                  <span className="text-xs font-bold text-[#00ff99]">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{userName}</p>
                  <p className="text-[9px] text-slate-400 capitalize">{userRole || "User"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links - Touch Friendly */}
          <div className="px-4 sm:px-5 space-y-1">
            {navLinks.map((item) => (
              <button 
                key={item.name}
                onClick={() => handleDirectNavigate(item.path)}
                className={`
                  w-full text-left flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 
                  rounded-xl transition-all duration-200 cursor-pointer
                  min-h-[48px] group
                  ${location.pathname === item.path 
                    ? "bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/20" 
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }
                `}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-base ${location.pathname === item.path ? "text-[#00ff99]" : "text-slate-500 group-hover:text-white"}`} 
                />
                <span className="text-sm font-medium">{item.name}</span>
                {location.pathname === item.path && (
                  <div className="ml-auto w-1.5 h-1.5 bg-[#00ff99] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AREA BAWAH - Footer Sidebar */}
        <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-slate-800/60 bg-[#070a13]/50">
          <p className="text-[9px] sm:text-[10px] tracking-widest text-slate-500 font-bold uppercase text-center">
            © {new Date().getFullYear()} ROYAL CUE STUDIO
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;