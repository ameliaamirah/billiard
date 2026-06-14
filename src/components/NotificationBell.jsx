// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTrash, faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useNotification } from "../contexts/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
    if (minutes < 43200) return `${Math.floor(minutes / 1440)} hari lalu`;
    return `${Math.floor(minutes / 43200)} bulan lalu`;
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reservasi_baru": return "🔴";
      case "waktu_hampir_habis": return "⏰";
      case "waktu_habis": return "❌";
      case "pesanan_baru": return "🍽️";
      case "stok_menipis": return "⚠️";
      case "target_tercapai": return "🎉";
      case "transaksi_baru": return "💰";
      default: return "📢";
    }
  };

  const getNotificationBgColor = (notif) => {
    if (notif.isRead) return "hover:bg-slate-800/50";
    switch (notif.type) {
      case "stok_menipis": return "bg-amber-500/10 hover:bg-amber-500/20";
      case "waktu_habis": return "bg-red-500/10 hover:bg-red-500/20";
      case "target_tercapai": return "bg-emerald-500/10 hover:bg-emerald-500/20";
      default: return "bg-slate-800/30 hover:bg-slate-800/50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button - Touch Friendly */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Notifikasi"
      >
        <FontAwesomeIcon icon={faBell} className="text-slate-300 text-base sm:text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - Responsive */}
      {isOpen && (
        <div className="
          absolute right-0 sm:right-0 mt-2 
          w-[calc(100vw-2rem)] sm:w-96 
          max-w-[95vw] sm:max-w-none
          bg-slate-900 border border-slate-800 
          rounded-xl sm:rounded-2xl 
          shadow-2xl z-50 overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">
                Notifikasi
                {unreadCount > 0 && (
                  <span className="ml-2 text-[9px] sm:text-[10px] text-red-400">
                    ({unreadCount} baru)
                  </span>
                )}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                Notifikasi terbaru dari sistem
              </p>
            </div>
            
            {/* Action Buttons - Touch Friendly */}
            {notifications.length > 0 && (
              <div className="flex gap-1 sm:gap-2">
                <button 
                  onClick={markAllAsRead} 
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-h-[32px]"
                  title="Tandai semua sebagai dibaca"
                >
                  <FontAwesomeIcon icon={faCheck} size={10} />
                  <span className="hidden xs:inline">Semua</span>
                </button>
                <button 
                  onClick={clearAllNotifications} 
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all min-h-[32px]"
                  title="Hapus semua notifikasi"
                >
                  <FontAwesomeIcon icon={faTrash} size={10} />
                  <span className="hidden xs:inline">Hapus</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500">
                <FontAwesomeIcon icon={faBell} className="text-3xl sm:text-4xl mb-2 opacity-30" />
                <p className="text-xs sm:text-sm">Tidak ada notifikasi</p>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1">
                  Notifikasi akan muncul di sini
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                  }}
                  className={`
                    p-3 sm:p-4 transition-all cursor-pointer
                    ${!notif.isRead ? "border-l-2 border-l-[#00ff99]" : ""}
                    ${getNotificationBgColor(notif)}
                  `}
                >
                  <div className="flex gap-2 sm:gap-3">
                    {/* Icon */}
                    <div className="text-xl sm:text-2xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${!notif.isRead ? "text-white" : "text-slate-300"}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[8px] sm:text-[9px] text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                    
                    {/* Delete Button - Touch Friendly */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="p-1.5 sm:p-2 -m-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
                      aria-label="Hapus notifikasi"
                    >
                      <FontAwesomeIcon icon={faTimes} size={10} className="sm:text-xs" />
                    </button>
                  </div>
                  
                  {/* Unread Indicator */}
                  {!notif.isRead && (
                    <div className="mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[8px] text-[#00ff99]">
                        <span className="w-1 h-1 bg-[#00ff99] rounded-full"></span>
                        Belum dibaca
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer (Optional) */}
          {notifications.length > 5 && (
            <div className="p-2 border-t border-slate-800 text-center bg-slate-950">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[9px] sm:text-[10px] text-slate-500 hover:text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}