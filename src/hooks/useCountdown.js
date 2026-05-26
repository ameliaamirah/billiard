import { useState, useEffect } from 'react';

/**
 * Custom hook untuk menghitung mundur waktu
 * @param {number} endTime - Timestamp selesai (Date.now() + durasi dalam milidetik)
 * @returns {object} - Mengembalikan sisa waktu dalam milidetik dan format string
 */
export const useCountdown = (endTime) => {
  // Hitung sisa waktu saat pertama kali dimuat
  const [timeLeft, setTimeLeft] = useState(() => {
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    // Jika waktu sudah habis, tidak perlu menjalankan interval
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Bersihkan interval saat komponen di-unmount atau endTime berubah
    return () => clearInterval(interval);
  }, [endTime, timeLeft]);

  // Kalkulasi format HH:MM:SS
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Format string untuk tampilan
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { timeLeft, formatted };
};