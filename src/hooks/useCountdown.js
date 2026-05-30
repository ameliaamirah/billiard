import { useState, useEffect } from 'react';

export const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endTime) return 0;
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (!endTime) return;
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formatted = !endTime ? "00:00:00" : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = timeLeft <= 0 && endTime !== null;
  const isExpiring = !isExpired && timeLeft < 1800000 && timeLeft > 0;

  return { formatted, isExpired, isExpiring, timeLeft };
};