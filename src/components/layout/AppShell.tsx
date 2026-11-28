import React from 'react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div dir="rtl" className="min-h-screen bg-black text-zinc-100 flex flex-col font-['Cairo',sans-serif]">
      <main className="flex-1 pb-16 bg-black min-h-screen">
        {children}
      </main>
    </div>
  );
};
