// src/components/ToastNotification.jsx (dengan swipe to dismiss)
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ToastNotification() {
  const [toasts, setToasts] = useState([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const addToast = useCallback(({ title, message, type, duration = 4500 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    const handleNotification = (event) => {
      const { title, message, type, duration } = event.detail;
      addToast({ title, message, type, duration });
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, [addToast]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Swipe handlers
  const handleTouchStart = (e, id) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, id) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    // Swipe right to dismiss (jarak minimal 50px)
    if (swipeDistance > 50) {
      removeToast(id);
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "reservasi_baru": return "bg-blue-600";
      case "waktu_hampir_habis": return "bg-amber-600";
      case "waktu_habis": return "bg-red-600";
      case "pesanan_baru": return "bg-orange-600";
      case "stok_menipis": return "bg-yellow-600";
      case "target_tercapai": return "bg-emerald-600";
      case "transaksi_baru": return "bg-green-600";
      default: return "bg-slate-700";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "reservasi_baru": return "🔴";
      case "waktu_hampir_habis": return "⏰";
      case "waktu_habis": return "❌";
      case "pesanan_baru": return "🍽️";
      case "stok_menipis": return "⚠️";
      case "target_tercapai": return "🎉";
      case "transaksi_baru": return "💰";
      default: return "🔔";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-[300] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getBgColor(toast.type)} 
            rounded-xl shadow-2xl 
            w-[calc(100vw-1rem)] sm:w-80 md:w-96 
            max-w-[calc(100vw-1rem)] sm:max-w-sm
            border border-white/20
            animate-in slide-in-from-right-5 duration-300
            cursor-pointer
          `}
          onTouchStart={(e) => handleTouchStart(e, toast.id)}
          onTouchEnd={(e) => handleTouchEnd(e, toast.id)}
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Icon */}
              <div className="text-xl sm:text-2xl flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-xs sm:text-sm truncate">
                  {toast.title}
                </h4>
                <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 break-words">
                  {toast.message}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-all p-1.5 -m-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Tutup notifikasi"
              >
                <FontAwesomeIcon icon={faTimes} size={10} className="sm:text-xs" />
              </button>
            </div>
            
            {/* Swipe Hint (Mobile only) */}
            <p className="text-white/40 text-[8px] text-center mt-2 block sm:hidden">
              ← Geser ke kanan untuk tutup
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}