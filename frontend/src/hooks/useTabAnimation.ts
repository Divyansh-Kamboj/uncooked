import { useEffect, useRef, useCallback } from 'react';

// Move messages outside component to make them stable
const funnyMessages = [
  "Are you ready to cook? 🍳",
  "Math problems are waiting! 📚", 
  "Time to get uncooked! 🔥",
  "Your equations miss you! ➕",
  "Come back and solve! 🧮",
  "Ready to level up? 🚀"
];

const useTabAnimation = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitle = useRef<string>('Uncooked');

  const startAnimation = useCallback(() => {
    if (intervalRef.current) return; // Already running
    
    let messageIndex = 0;
    
    intervalRef.current = setInterval(() => {
      document.title = funnyMessages[messageIndex];
      messageIndex = (messageIndex + 1) % funnyMessages.length;
    }, 3500); // Change message every 3.5 seconds
  }, []);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    document.title = originalTitle.current;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const handleFocus = () => {
      stopAnimation();
    };

    const handleBlur = () => {
      startAnimation();
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window focus/blur events as fallback
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      // Cleanup
      stopAnimation();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [startAnimation, stopAnimation]);

  return null; // This hook doesn't return anything, just manages side effects
};

export default useTabAnimation;
