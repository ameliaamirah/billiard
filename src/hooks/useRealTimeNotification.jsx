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
        `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) tersisa ${meja.remainingMinutes || 15} menit lagi!`,
        NOTIFICATION_TYPES.WAKTU_HAMPIR_HABIS,
        null,
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  const notifyWaktuHabis = useCallback((meja) => {
    if (canNotify(`expired_${meja.id}`)) {
      addNotification(
        `❌ Waktu Habis!`,
        `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) telah melebihi waktu bermain.`,
        NOTIFICATION_TYPES.WAKTU_HABIS,
        null,
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  const notifyStokMenipis = useCallback((menu) => {
    const stokText = menu.stok === 0 ? "HABIS!" : `tersisa ${menu.stok} porsi lagi!`;
    if (canNotify(`stok_${menu.id}`, 10 * 60 * 1000)) { // 10 menit cooldown
      addNotification(
        `⚠️ Stok ${menu.stok === 0 ? "Habis" : "Menipis"}!`,
        `${menu.nama} ${stokText} Segera restock.`,
        NOTIFICATION_TYPES.STOK_MENIPIS,
        '/menu-management',
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  const notifyTargetTercapai = useCallback((target, omset) => {
    if (canNotify(`target_${new Date().toISOString().split('T')[0]}`, 60 * 60 * 1000)) {
      addNotification(
        `🎉 Target Tercapai!`,
        `Omset hari ini: Rp ${omset.toLocaleString("id-ID")} (Target: Rp ${target.toLocaleString("id-ID")})`,
        NOTIFICATION_TYPES.TARGET_TERCAPAI,
        '/admin-dashboard',
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  const notifyReservasiBaru = useCallback((reservasi) => {
    if (canNotify(`reservasi_${reservasi.id}`)) {
      addNotification(
        `Reservasi Baru!`,
        `${reservasi.nomor_meja} - ${reservasi.nama_pelanggan}`,
        NOTIFICATION_TYPES.RESERVASI_BARU,
        null,
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  const notifyTransaksiBaru = useCallback((transaksi) => {
    if (canNotify(`transaksi_${transaksi.id}`)) {
      addNotification(
        `Transaksi Baru!`,
        `${transaksi.nomor_meja} - Rp ${(transaksi.total_akhir || 0).toLocaleString("id-ID")}`,
        NOTIFICATION_TYPES.TRANSAKSI_BARU,
        null,
        true
      );
    }
  }, [addNotification, NOTIFICATION_TYPES, canNotify]);

  return {
    notifyWaktuHampirHabis,
    notifyWaktuHabis,
    notifyStokMenipis,
    notifyTargetTercapai,
    notifyReservasiBaru,
    notifyTransaksiBaru
  };
};