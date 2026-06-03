// src/components/ToastNotification.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ToastNotification() {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  // Subscribe ke event notifikasi global
  useEffect(() => {
    const handleNotification = (event) => {
      const { title, message, type } = event.detail;
      setToast({ title, message, type });
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 4500);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);

  if (!toast || !visible) return null;

  const getBgColor = () => {
    switch (toast.type) {
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

  const getIcon = () => {
    switch (toast.type) {
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

  return (
    <div className="fixed top-20 right-4 z-[300] animate-in slide-in-from-right-5 duration-300">
      <div className={`${getBgColor()} rounded-xl shadow-2xl p-4 max-w-sm border border-white/20`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm">{toast.title}</h4>
            <p className="text-white/80 text-xs mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-white/60 hover:text-white transition-all"
          >
            <FontAwesomeIcon icon={faTimes} size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}