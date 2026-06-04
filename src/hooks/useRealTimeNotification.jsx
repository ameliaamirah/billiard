// src/hooks/useRealtimeNotification.jsx
import { useCallback, useRef } from "react";
import { useNotification } from "../contexts/NotificationContext";

export const useRealtimeNotification = () => {
  const { addNotification, NOTIFICATION_TYPES } = useNotification();
  const lastNotifTime = useRef({});

  const canNotify = useCallback((key, interval = 5000) => {
    const now = Date.now();
    const last = lastNotifTime.current[key] || 0;
    if (now - last < interval) return false;
    lastNotifTime.current[key] = now;
    return true;
  }, []);

  const notifyWaktuHampirHabis = useCallback((meja) => {
    if (canNotify(`warning_${meja.id}`)) {
      addNotification(
        `⏰ Peringatan!`,
        `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) tersisa 15 menit lagi!`,
        "waktu_hampir_habis",
        null,
        true
      );
    }
  }, [addNotification, canNotify]);

  const notifyWaktuHabis = useCallback((meja) => {
    if (canNotify(`expired_${meja.id}`)) {
      addNotification(
        `❌ Waktu Habis!`,
        `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) telah melebihi waktu bermain.`,
        "waktu_habis",
        null,
        true
      );
    }
  }, [addNotification, canNotify]);

  const notifyStokMenipis = useCallback((menu) => {
    const stokText = menu.stok === 0 ? "HABIS!" : `tersisa ${menu.stok} porsi lagi!`;
    if (canNotify(`stok_${menu.id}`, 10 * 60 * 1000)) {
      addNotification(
        `⚠️ Stok ${menu.stok === 0 ? "Habis" : "Menipis"}!`,
        `${menu.nama} ${stokText} Segera restock.`,
        "stok_menipis",
        '/menu-management',
        true
      );
    }
  }, [addNotification, canNotify]);

  const notifyTargetTercapai = useCallback((target, omset) => {
    if (canNotify(`target_${new Date().toISOString().split('T')[0]}`, 60 * 60 * 1000)) {
      addNotification(
        `🎉 Target Tercapai!`,
        `Omset hari ini: Rp ${omset.toLocaleString("id-ID")} (Target: Rp ${target.toLocaleString("id-ID")})`,
        "target_tercapai",
        '/admin-dashboard',
        true
      );
    }
  }, [addNotification, canNotify]);

  return {
    notifyWaktuHampirHabis,
    notifyWaktuHabis,
    notifyStokMenipis,
    notifyTargetTercapai
  };
};