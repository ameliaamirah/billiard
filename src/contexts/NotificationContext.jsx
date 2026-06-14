// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

// Fungsi untuk menampilkan notifikasi dari mana saja
export const showNotification = (title, message, type, duration = 5000) => {
  window.dispatchEvent(new CustomEvent("show-notification", { 
    detail: { title, message, type, duration } 
  }));
};

// Fungsi untuk notifikasi stok (pre-configured)
export const showStokNotification = (item) => {
  const isHabis = item.stok === 0;
  const title = isHabis ? `⚠️ Stok Habis: ${item.nama}` : `⚠️ Stok Menipis: ${item.nama}`;
  const message = isHabis 
    ? `${item.nama} sudah habis. Segera restock!`
    : `Stok ${item.nama} tersisa ${item.stok} lagi.`;
  
  showNotification(title, message, "stok_menipis", 8000);
};

// Fungsi untuk notifikasi target tercapai
export const showTargetNotification = (target, omset) => {
  showNotification(
    "🎉 Target Omset Tercapai!",
    `Target Rp ${target.toLocaleString("id-ID")} tercapai dengan omset Rp ${omset.toLocaleString("id-ID")}`,
    "target_tercapai",
    10000
  );
};

const MAX_NOTIFICATIONS = 50; // Batas maksimal notifikasi
const NOTIFICATION_COOLDOWN = 5000; // Cooldown 5 detik untuk notifikasi yang sama

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNotificationRef = useRef({}); // Untuk mencegah duplicate

  // Load notifikasi dari localStorage saat startup
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Hanya load notifikasi dari 7 hari terakhir
          const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const recent = parsed.filter(n => new Date(n.timestamp).getTime() > oneWeekAgo);
          setNotifications(recent);
          setUnreadCount(recent.filter(n => !n.isRead).length);
        }
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    }
  }, []);

  // Simpan ke localStorage saat ada perubahan
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((title, message, type, link = null, duration = 5000) => {
    // Cek cooldown untuk notifikasi yang sama
    const key = `${title}|${message}`;
    const lastTime = lastNotificationRef.current[key];
    if (lastTime && Date.now() - lastTime < NOTIFICATION_COOLDOWN) {
      return null; // Skip duplicate notifikasi
    }
    lastNotificationRef.current[key] = Date.now();

    // Tampilkan toast
    showNotification(title, message, type, duration);
    
    // Simpan ke history
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      link,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setNotifications(prev => {
      const newList = [newNotification, ...prev];
      // Batasi jumlah notifikasi
      if (newList.length > MAX_NOTIFICATIONS) {
        return newList.slice(0, MAX_NOTIFICATIONS);
      }
      return newList;
    });
    setUnreadCount(prev => prev + 1);
    
    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const newNotifs = prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      const newUnreadCount = newNotifs.filter(n => !n.isRead).length;
      setUnreadCount(newUnreadCount);
      return newNotifs;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const removed = prev.find(n => n.id === id);
      if (removed && !removed.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("notifications");
  }, []);

  // Hapus notifikasi lama (lebih dari 7 hari)
  const cleanOldNotifications = useCallback(() => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    setNotifications(prev => {
      const newNotifs = prev.filter(n => new Date(n.timestamp).getTime() > oneWeekAgo);
      if (newNotifs.length !== prev.length) {
        setUnreadCount(newNotifs.filter(n => !n.isRead).length);
        return newNotifs;
      }
      return prev;
    });
  }, []);

  // Clean old notifications setiap 1 jam
  useEffect(() => {
    const interval = setInterval(cleanOldNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanOldNotifications]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    cleanOldNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};