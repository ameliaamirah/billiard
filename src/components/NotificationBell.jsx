// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
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
    return `${Math.floor(minutes / 1440)} hari lalu`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-800 transition-all"
      >
        <FontAwesomeIcon icon={faBell} className="text-slate-300 text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h3 className="text-white font-bold text-sm">
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-2 text-[10px] text-red-400">({unreadCount} baru)</span>
              )}
            </h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllAsRead} className="text-[10px] text-slate-400 hover:text-white">
                    <FontAwesomeIcon icon={faCheck} size={10} /> Semua
                  </button>
                  <button onClick={clearAllNotifications} className="text-[10px] text-slate-400 hover:text-red-400">
                    <FontAwesomeIcon icon={faTrash} size={10} /> Hapus
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FontAwesomeIcon icon={faBell} className="text-3xl mb-2 opacity-30" />
                <p className="text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-all ${
                    !notif.isRead ? "bg-slate-800/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl">
                      {notif.type === "reservasi_baru" && "🔴"}
                      {notif.type === "waktu_hampir_habis" && "⏰"}
                      {notif.type === "waktu_habis" && "❌"}
                      {notif.type === "pesanan_baru" && "🍽️"}
                      {notif.type === "stok_menipis" && "⚠️"}
                      {notif.type === "target_tercapai" && "🎉"}
                      {notif.type === "transaksi_baru" && "💰"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-bold ${!notif.isRead ? "text-white" : "text-slate-300"}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-500">{formatTime(notif.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                    </div>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <FontAwesomeIcon icon={faTimes} size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}