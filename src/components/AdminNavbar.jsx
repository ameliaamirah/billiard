// src/components/AdminNavbar.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faBars } from "@fortawesome/free-solid-svg-icons";
import NotificationBell from "./NotificationBell";

export default function AdminNavbar({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#0b0e14] border-b border-slate-800 px-3 sm:px-4 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-all min-h-[44px] min-w-[44px]"
        >
          <FontAwesomeIcon icon={faBars} size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00ff99] to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faCrown} className="text-white text-xs sm:text-sm" />
          </div>
          <div className="hidden xs:block">
            <h1 className="font-black text-white text-xs sm:text-sm">Royal Cue Billiard</h1>
            <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/50 px-2 sm:px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#00ff99] rounded-full animate-pulse" />
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xs:inline">
            System Online
          </span>
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider xs:hidden">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}