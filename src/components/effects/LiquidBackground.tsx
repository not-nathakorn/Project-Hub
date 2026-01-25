// LiquidBackground - Restored full blobs with separate edge overlay

export const LiquidBackground = () => {
  return (
    <>
      {/* Main Background Container */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* Base Background Layer */}
        <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300" />

        {/* Colorful Blob Layer - Original Full Coverage */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1: Blue - Top Left (Original Position) */}
          <div className="absolute top-[-20%] left-[-20%] md:top-[-10%] md:left-[-10%] w-[120vw] h-[120vw] md:w-[45vw] md:h-[45vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse blob-1 blur-[60px] md:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(59, 130, 246, 0.30) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)",
              }}
            />
          </div>

          {/* Blob 2: Pink - Bottom Center (Original Position) */}
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 translate-y-[20%] md:translate-y-[40%] w-[120vw] h-[120vw] md:w-[55vw] md:h-[55vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse animation-delay-2000 blob-2 blur-[80px] md:blur-[130px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(236, 72, 153, 0.20) 0%, rgba(236, 72, 153, 0.10) 40%, transparent 70%)",
              }}
            />
          </div>

          {/* Blob 3: Green/Cyan - Right Edge (Original Position) */}
          <div className="absolute top-[20%] right-[-40%] md:top-[5%] md:right-[-10%] w-[100vw] h-[100vw] md:w-[45vw] md:h-[45vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse animation-delay-4000 blob-3 blur-[60px] md:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(34, 197, 94, 0.20) 0%, rgba(34, 197, 94, 0.10) 40%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* SEPARATE Edge Overlays - z-index 5 (between bg:0 and content:10) */}
      {/* These are OUTSIDE the main container for proper stacking */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white dark:bg-[#0a0a0a] pointer-events-none"
        style={{ 
          height: '60px',
          zIndex: 5
        }}
      />
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0a] pointer-events-none"
        style={{ 
          height: '40px',
          zIndex: 5
        }}
      />

      <style>{`
        .dark .blob-1 {
          background: radial-gradient(circle at center, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.10) 40%, transparent 70%) !important;
        }
        .dark .blob-2 {
          background: radial-gradient(circle at center, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.10) 40%, transparent 70%) !important;
        }
        .dark .blob-3 {
          background: radial-gradient(circle at center, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.10) 40%, transparent 70%) !important;
        }
      `}</style>
    </>
  );
};
