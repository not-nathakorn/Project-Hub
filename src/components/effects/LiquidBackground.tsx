import React from 'react';

export const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-[#EBF4FF] dark:bg-neutral-950 transition-colors duration-300" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 dark:bg-blue-500/20 blur-3xl animate-blob mix-blend-multiply dark:mix-blend-screen will-change-transform" />
      <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/40 dark:bg-cyan-500/20 blur-3xl animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen will-change-transform" />
      <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/40 dark:bg-purple-500/20 blur-3xl animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen will-change-transform" />
    </div>
  );
};
