import React, { useState } from 'react';
import { Sparkles, Eye } from 'lucide-react';

export const AdGeneratorStudio: React.FC = () => {
  const [headline, setHeadline] = useState('عرض خاص عبر منصة يمن ريتنغ');
  const [color, setColor] = useState('#FFC500');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="text-[#FFC500]" /> YR Ads Studio — مولد الإعلانات
        </h2>
        <p className="text-[#9CA3AF] text-xs">تجهيز الحملات الإعلانية وملاءمتها للمواضع الـ 10</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0B0F17] p-5 rounded-xl border border-[#1F2937] space-y-4">
          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">عنوان الإعلان</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#161D2B] border border-[#1F2937] rounded-lg p-2.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">لون الإبراز</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-[#0B0F17] p-5 rounded-xl border border-[#1F2937] flex items-center justify-center">
          <div 
            style={{ borderColor: color }}
            className="p-6 rounded-xl border-2 bg-[#070A10] w-full text-center space-y-3"
          >
            <span style={{ color }} className="text-xs font-bold">إعلان ممول — YR Ads</span>
            <h3 className="text-xl font-bold text-white">{headline}</h3>
            <button style={{ backgroundColor: color }} className="px-4 py-1.5 rounded-lg text-black font-bold text-xs">
              زيارة الرابط
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
