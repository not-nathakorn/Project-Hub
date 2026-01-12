import React from 'react';

export const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Layer 1: Seamless Base Gradient Background */}
      <div className="absolute inset-0 bg-[#EBF4FF] dark:bg-black transition-colors duration-500 ease-in-out" />
      
      {/* Layer 2: Soft Ambient Glow (Light Mode - positioned away from edges) */}
      <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-500" 
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 40%, rgba(147, 197, 253, 0.4) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 75% 60%, rgba(196, 181, 253, 0.3) 0%, transparent 60%), radial-gradient(ellipse 45% 30% at 25% 55%, rgba(165, 243, 252, 0.25) 0%, transparent 55%)'
        }} 
      />
      
      {/* Layer 3: Animated Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-blue-300/40 dark:bg-blue-500/20 blur-[80px] animate-blob mix-blend-multiply dark:mix-blend-screen will-change-transform" />
        <div className="absolute top-[30%] right-[5%] w-[40%] h-[40%] rounded-full bg-sky-300/35 dark:bg-cyan-500/20 blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen will-change-transform" />
        <div className="absolute bottom-[20%] left-[25%] w-[45%] h-[40%] rounded-full bg-violet-300/35 dark:bg-purple-500/20 blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen will-change-transform" />
        <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-[70px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen will-change-transform" />
      </div>
      
      {/* Layer 4: Edge Fade Overlay - Top (Theme Colored) */}
      {/* Light Mode Top Fade */}
      <div 
        className="absolute inset-x-0 top-0 h-[180px] pointer-events-none dark:hidden"
        style={{
          background: 'linear-gradient(to bottom, #EBF4FF 0%, #EBF4FF 20%, transparent 100%)'
        }}
      />
      {/* Dark Mode Top Fade */}
      <div 
        className="absolute inset-x-0 top-0 h-[180px] pointer-events-none hidden dark:block"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, #000000 20%, transparent 100%)'
        }}
      />
      
      {/* Layer 5: Edge Fade Overlay - Bottom (Theme Colored) */}
      {/* Light Mode Bottom Fade */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[180px] pointer-events-none dark:hidden"
        style={{
          background: 'linear-gradient(to top, #EBF4FF 0%, #EBF4FF 20%, transparent 100%)'
        }}
      />
      {/* Dark Mode Bottom Fade */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[180px] pointer-events-none hidden dark:block"
        style={{
          background: 'linear-gradient(to top, #000000 0%, #000000 20%, transparent 100%)'
        }}
      />
      
      {/* Layer 6: Subtle noise texture overlay for premium feel */}
      <div className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
};
