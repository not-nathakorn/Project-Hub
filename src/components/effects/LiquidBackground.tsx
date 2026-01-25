// LiquidBackground - Clean edges without blocking content
export const LiquidBackground = () => {
  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* Base Background Layer - Pure white */}
        <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-300" />

        {/* Colorful Blob Layer - Positioned to avoid edge areas */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1: Blue - Moved down from top edge */}
          <div className="absolute top-[5%] left-[-15%] md:top-[5%] md:left-[-5%] w-[100vw] h-[100vw] md:w-[45vw] md:h-[45vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse blob-1 blur-[60px] md:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.12) 40%, transparent 70%)",
              }}
            />
          </div>

          {/* Blob 2: Pink - Moved up from bottom edge */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[100vw] h-[100vw] md:w-[50vw] md:h-[50vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse animation-delay-2000 blob-2 blur-[80px] md:blur-[130px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(236, 72, 153, 0.18) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%)",
              }}
            />
          </div>

          {/* Blob 3: Green/Cyan - Center right */}
          <div className="absolute top-[25%] right-[-30%] md:top-[15%] md:right-[-5%] w-[90vw] h-[90vw] md:w-[40vw] md:h-[40vw]">
            <div
              className="w-full h-full rounded-full animate-blob-pulse animation-delay-4000 blob-3 blur-[60px] md:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0.08) 40%, transparent 70%)",
              }}
            />
          </div>
        </div>

        {/* Edge Cleanup - Solid white at top/bottom edges */}
        <div 
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: '60px',
            background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 70%, transparent 100%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '50px',
            background: 'linear-gradient(to top, #ffffff 0%, #ffffff 70%, transparent 100%)'
          }}
        />
      </div>

      <style>{`
        .dark .blob-1 {
          background: radial-gradient(circle at center, rgba(56, 189, 248, 0.20) 0%, rgba(56, 189, 248, 0.08) 40%, transparent 70%) !important;
        }
        .dark .blob-2 {
          background: radial-gradient(circle at center, rgba(168, 85, 247, 0.20) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%) !important;
        }
        .dark .blob-3 {
          background: radial-gradient(circle at center, rgba(20, 184, 166, 0.20) 0%, rgba(20, 184, 166, 0.08) 40%, transparent 70%) !important;
        }
      `}</style>
    </>
  );
};


