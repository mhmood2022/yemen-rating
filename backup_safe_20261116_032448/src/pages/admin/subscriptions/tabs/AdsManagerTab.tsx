import React from 'react';
import { Megaphone } from 'lucide-react';

export const AdsManagerTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-[#FFC500]" /> إدارة الإعلانات
      </h2>
      <div 
        className="text-center py-10 text-zinc-500 rounded-xl"
        style={{ background: '#000000', border: '1px solid #2A2B30' }}
      >
        إدارة الإعلانات (قيد التطوير)
      </div>
    </div>
  );
};
