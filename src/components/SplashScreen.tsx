import { useEffect, useState } from 'react';
import logo from '@/assets/sm-data-sub-logo.jpeg';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export function SplashScreen({ onFinish, minDuration = 2000 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500); // Wait for fade animation
    }, minDuration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDuration]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-primary to-primary/90 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Logo */}
      <div className="relative animate-scale-in">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 animate-pulse" />
        <img 
          src={logo} 
          alt="SM Data Sub" 
          className="w-32 h-32 rounded-full shadow-2xl border-4 border-white/30 relative z-10"
        />
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-white mt-8 animate-slide-up">
        SM Data Sub
      </h1>
      
      {/* Tagline */}
      <p className="text-white/80 text-sm mt-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Your trusted data partner
      </p>

      {/* Loading Indicator */}
      <div className="mt-12 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* RC Number */}
      <p className="absolute bottom-8 text-white/60 text-xs font-medium">RC: 9198148</p>
    </div>
  );
}
