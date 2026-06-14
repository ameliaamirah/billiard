// src/hooks/useCountdown.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useCountdown = (endTime, options = {}) => {
  const {
    onExpire,        // Callback saat waktu habis
    onExpiring,      // Callback saat waktu hampir habis (30 menit)
    warningTime = 30 * 60 * 1000, // 30 menit default
    intervalMs = 1000, // Interval update (ms)
  } = options;

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endTime) return 0;
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  const [isActive, setIsActive] = useState(true);
  const expiredTriggeredRef = useRef(false);
  const expiringTriggeredRef = useRef(false);

  // Validasi endTime
  const isValidEndTime = useCallback(() => {
    if (!endTime) return false;
    if (typeof endTime !== 'number') return false;
    if (isNaN(endTime)) return false;
    if (endTime < 0) return false;
    return true;
  }, [endTime]);

  // Update timer
  const updateTimer = useCallback(() => {
    if (!isActive) return;
    if (!isValidEndTime()) {
      setTimeLeft(0);
      return;
    }

    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      setTimeLeft(0);
      
      // Trigger onExpire callback (hanya sekali)
      if (!expiredTriggeredRef.current && onExpire) {
        expiredTriggeredRef.current = true;
        onExpire();
      }
    } else {
      setTimeLeft(remaining);
      
      // Trigger onExpiring callback (hanya sekali, saat warning time)
      if (!expiringTriggeredRef.current && remaining <= warningTime && onExpiring) {
        expiringTriggeredRef.current = true;
        onExpiring(remaining);
      }
    }
  }, [endTime, isActive, isValidEndTime, onExpire, onExpiring, warningTime]);

  // Main interval
  useEffect(() => {
    if (!endTime || !isActive) return;
    
    // Update immediately
    updateTimer();
    
    const interval = setInterval(updateTimer, intervalMs);
    
    return () => {
      clearInterval(interval);
    };
  }, [endTime, isActive, intervalMs, updateTimer]);

  // Reset expired trigger when endTime changes
  useEffect(() => {
    expiredTriggeredRef.current = false;
    expiringTriggeredRef.current = false;
  }, [endTime]);

  // Pause / Resume timer
  const pause = useCallback(() => setIsActive(false), []);
  const resume = useCallback(() => setIsActive(true), []);
  const reset = useCallback(() => {
    if (!endTime) return;
    const remaining = endTime - Date.now();
    setTimeLeft(remaining > 0 ? remaining : 0);
    expiredTriggeredRef.current = false;
    expiringTriggeredRef.current = false;
    setIsActive(true);
  }, [endTime]);

  // Format waktu
  const hours = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((timeLeft / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((timeLeft / 1000) % 60));

  // Berbagai format output
  const formatted = !endTime ? "00:00:00" : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const formattedShort = !endTime ? "0:00" : `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const formattedHours = hours;
  const formattedMinutes = minutes;
  const formattedSeconds = seconds;
  
  // Status flags
  const isExpired = timeLeft <= 0 && endTime !== null && endTime !== undefined;
  const isExpiring = !isExpired && timeLeft < warningTime && timeLeft > 0;
  const isWarning = isExpiring && timeLeft < 10 * 60 * 1000; // 10 menit terakhir
  const isActiveTimer = isActive && !isExpired && timeLeft > 0;
  
  // Persentase waktu tersisa
  const initialTime = endTime ? Math.max(0, endTime - Date.now() + timeLeft) : 0;
  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return {
    // Raw values
    timeLeft,
    hours,
    minutes,
    seconds,
    percentage,
    
    // Formatted strings
    formatted,
    formattedShort,
    formattedHours,
    formattedMinutes,
    formattedSeconds,
    
    // Status flags
    isExpired,
    isExpiring,
    isWarning,
    isActive: isActiveTimer,
    
    // Controls
    pause,
    resume,
    reset,
  };
};