import React from 'react';

export const LiquidBackground = () => {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Base Background Layer */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-300" />
      
      {/* Colorful Blob Layer */}
      <div className="absolute inset-0">
        {/* Blob 1: Blue - Top Left Corner */}
        <div 
          className="absolute"
          style={{
            top: '-10%',
            left: '-10%',
            width: '45vw',
            height: '45vw',
          }}
        >
          <div 
            className="w-full h-full rounded-full animate-blob-pulse blob-1"
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
        </div>
        
        {/* Blob 2: Pink - Bottom Center */}
        <div 
          className="absolute"
          style={{
            bottom: '-15%',
            left: '50%',
            transform: 'translateX(-50%) translateY(40%)',
            width: '55vw',
            height: '55vw',
          }}
        >
          <div 
            className="w-full h-full rounded-full animate-blob-pulse animation-delay-2000 blob-2"
            style={{
              background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.04) 0%, rgba(236, 72, 153, 0.01) 40%, transparent 70%)',
              filter: 'blur(130px)',
            }}
          />
        </div>
        
        {/* Blob 3: Green/Cyan - Right edge, upper area */}
        <div 
          className="absolute"
          style={{
            top: '5%',
            right: '-10%',
            width: '45vw',
            height: '45vw',
          }}
        >
          <div 
            className="w-full h-full rounded-full animate-blob-pulse animation-delay-4000 blob-3"
            style={{
              background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 40%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
        </div>
      </div>
      
      {/* Dark Mode Override Styles */}
      <style>{`
        .dark .blob-1 {
          background: radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0.04) 40%, transparent 70%) !important;
        }
        .dark .blob-2 {
          background: radial-gradient(circle at center, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.04) 40%, transparent 70%) !important;
        }
        .dark .blob-3 {
          background: radial-gradient(circle at center, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0.04) 40%, transparent 70%) !important;
        }
      `}</style>
    </div>
  );
};
