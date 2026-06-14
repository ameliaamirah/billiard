// src/hooks/useRealtimeNotification.jsx
import { useCallback, useRef, useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";

export const useRealtimeNotification = (options = {}) => {
  const {
    enableSound = false,      // Apakah memainkan suara
    enableVibration = false,   // Apakah vibrate (mobile)
    debug = false,             // Mode debug
    globalCooldown = 1000,     // Cooldown global (ms)
  } = options;

  const { addNotification } = useNotification();
  const lastNotifTime = useRef({});
  const globalLastTime = useRef(0);

  // Debug log
  const logDebug = useCallback((message, data) => {
    if (debug) {
      console.log(`[Notification Debug] ${message}`, data || '');
    }
  }, [debug]);

  // Cek cooldown global
  const canNotifyGlobal = useCallback(() => {
    const now = Date.now();
    if (now - globalLastTime.current < globalCooldown) {
      logDebug('Global cooldown active');
      return false;
    }
    globalLastTime.current = now;
    return true;
  }, [globalCooldown, logDebug]);

  // Cek cooldown per key
  const canNotify = useCallback((key, interval = 5000) => {
    const now = Date.now();
    const last = lastNotifTime.current[key] || 0;
    
    if (now - last < interval) {
      logDebug(`Cooldown active for ${key}, remaining ${Math.ceil((interval - (now - last)) / 1000)}s`);
      return false;
    }
    
    lastNotifTime.current[key] = now;
    logDebug(`Notifikasi allowed for ${key}`);
    return true;
  }, [logDebug]);

  // Play notifikasi suara
  const playNotificationSound = useCallback(() => {
    if (!enableSound) return;
    
    try {
      // Gunakan Web Audio API atau Audio element
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => logDebug('Audio play failed:', e));
    } catch (error) {
      logDebug('Sound error:', error);
    }
  }, [enableSound, logDebug]);

  // Vibrate untuk mobile
  const vibrateDevice = useCallback(() => {
    if (!enableVibration) return;
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200);
      logDebug('Vibration triggered');
    }
  }, [enableVibration, logDebug]);

  const notifyWaktuHampirHabis = useCallback((meja, remainingMinutes = 15) => {
    if (!canNotifyGlobal()) return;
    if (!canNotify(`warning_${meja.id}`, 30 * 60 * 1000)) return; // 30 menit cooldown
    
    playNotificationSound();
    vibrateDevice();
    
    addNotification(
      `⏰ Peringatan! Waktu Hampir Habis`,
      `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) tersisa ${remainingMinutes} menit lagi!`,
      "waktu_hampir_habis",
      "/monitor",
      { duration: 8000, priority: "high" }
    );
    
    logDebug(`Waktu hampir habis notifikasi untuk meja ${meja.nomor_meja}`);
  }, [addNotification, canNotify, canNotifyGlobal, playNotificationSound, vibrateDevice, logDebug]);

  const notifyWaktuHabis = useCallback((meja) => {
    if (!canNotifyGlobal()) return;
    if (!canNotify(`expired_${meja.id}`, 60 * 60 * 1000)) return; // 1 jam cooldown
    
    playNotificationSound();
    vibrateDevice();
    
    addNotification(
      `❌ Waktu Habis!`,
      `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) telah melebihi waktu bermain. Segera konfirmasi ke pelanggan.`,
      "waktu_habis",
      "/monitor",
      { duration: 10000, priority: "high" }
    );
    
    logDebug(`Waktu habis notifikasi untuk meja ${meja.nomor_meja}`);
  }, [addNotification, canNotify, canNotifyGlobal, playNotificationSound, vibrateDevice, logDebug]);

  const notifyStokMenipis = useCallback((menu) => {
    const isHabis = menu.stok === 0;
    const cooldownKey = `stok_${menu.id}`;
    const interval = isHabis ? 30 * 60 * 1000 : 15 * 60 * 1000; // 30 menit (habis) / 15 menit (menipis)
    
    if (!canNotifyGlobal()) return;
    if (!canNotify(cooldownKey, interval)) return;
    
    const stokText = isHabis ? "HABIS!" : `tersisa ${menu.stok} porsi lagi!`;
    const title = isHabis ? `⚠️ Stok Habis: ${menu.nama}` : `⚠️ Stok Menipis: ${menu.nama}`;
    const priority = isHabis ? "high" : "medium";
    
    playNotificationSound();
    if (isHabis) vibrateDevice();
    
    addNotification(
      title,
      `${menu.nama} ${stokText} Segera restock.`,
      "stok_menipis",
      "/menu-management",
      { duration: isHabis ? 10000 : 7000, priority }
    );
    
    logDebug(`Stok notifikasi untuk ${menu.nama}: ${menu.stok} tersisa`);
  }, [addNotification, canNotify, canNotifyGlobal, playNotificationSound, vibrateDevice, logDebug]);

  const notifyTargetTercapai = useCallback((target, omset) => {
    const today = new Date().toISOString().split('T')[0];
    if (!canNotify(`target_${today}`, 12 * 60 * 60 * 1000)) return; // 12 jam cooldown
    
    playNotificationSound();
    vibrateDevice();
    
    const persentase = (omset / target) * 100;
    const message = `Omset hari ini: Rp ${omset.toLocaleString("id-ID")}\nTarget: Rp ${target.toLocaleString("id-ID")} (${persentase.toFixed(1)}%)`;
    
    addNotification(
      `🎉 Target Omset Tercapai! 🎉`,
      message,
      "target_tercapai",
      "/admin-dashboard",
      { duration: 15000, priority: "high" }
    );
    
    logDebug(`Target tercapai: ${persentase.toFixed(1)}% dari target`);
  }, [addNotification, canNotify, playNotificationSound, vibrateDevice, logDebug]);

  // Notifikasi pesanan baru
  const notifyPesananBaru = useCallback((meja, items) => {
    const itemCount = items?.length || 0;
    const key = `pesanan_${meja.id}_${Date.now()}`;
    
    if (!canNotify(key, 5000)) return;
    
    playNotificationSound();
    vibrateDevice();
    
    addNotification(
      `🍽️ Pesanan Baru!`,
      `Meja ${meja.nomor_meja} (${meja.nama_pelanggan}) memesan ${itemCount} item.`,
      "pesanan_baru",
      "/monitor",
      { duration: 7000, priority: "normal" }
    );
    
    logDebug(`Pesanan baru untuk meja ${meja.nomor_meja}, ${itemCount} item`);
  }, [addNotification, canNotify, playNotificationSound, vibrateDevice, logDebug]);

  // Notifikasi transaksi baru
  const notifyTransaksiBaru = useCallback((transaksi) => {
    const key = `transaksi_${transaksi.id}`;
    if (!canNotify(key, 5000)) return;
    
    addNotification(
      `💰 Transaksi Baru`,
      `Total: Rp ${transaksi.total?.toLocaleString("id-ID")} dari meja ${transaksi.nomor_meja}`,
      "transaksi_baru",
      "/monitor",
      { duration: 5000, priority: "normal" }
    );
    
    logDebug(`Transaksi baru: Rp ${transaksi.total?.toLocaleString("id-ID")}`);
  }, [addNotification, canNotify, logDebug]);

  // Reset all cooldowns (untuk testing atau logout)
  const resetCooldowns = useCallback(() => {
    lastNotifTime.current = {};
    globalLastTime.current = 0;
    logDebug('All notification cooldowns reset');
  }, [logDebug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logDebug('Notification hook unmounted');
    };
  }, [logDebug]);

  return {
    notifyWaktuHampirHabis,
    notifyWaktuHabis,
    notifyStokMenipis,
    notifyTargetTercapai,
    notifyPesananBaru,
    notifyTransaksiBaru,
    resetCooldowns,
  };
};