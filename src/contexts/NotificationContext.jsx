// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

// Fungsi untuk menampilkan notifikasi dari mana saja
export const showNotification = (title, message, type) => {
  window.dispatchEvent(new CustomEvent("show-notification", { 
    detail: { title, message, type } 
  }));
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((title, message, type, link = null) => {
    // Tampilkan toast
    showNotification(title, message, type);
    
    // Simpan ke history
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      link,
      timestamp: new Date(),
      isRead: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
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
        setUnreadCount(prevCount => prevCount - 1);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};