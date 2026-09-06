'use client';
import { useState, useEffect } from 'react';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const handleVideoEnd = () => {
    setIsFading(true);
    // Remove from DOM after transition completes (500ms duration)
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  // Hold the brand mark briefly, then fade out
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isFading) {
        handleVideoEnd();
      }
    }, 1800);

    return () => clearTimeout(fallbackTimer);
  }, [isFading]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Prashiv Holiday"
          className="w-64 h-64 md:w-80 md:h-80 object-contain animate-fade-in"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
