import React, { useState } from 'react';
import { Crop, Palette, Move, Eye, Sparkles, Download, Layers } from 'lucide-react';
import { YR_AD_PLACEMENTS } from '../../../utils/adGeneratorEngine';

export const AdGeneratorStudio: React.FC = () => {
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [adHeadline, setAdHeadline] = useState('عرض خاص وحصري عبر يمن ريتنغ');
  const [adSubtext, setAdSubtext] = useState('أفضل الأسعار والخدمات المعتمدة');
  const [accentColor, setAccentColor] = useState('#FFC500');
  const [bgColor, setBgColor] = useState('#0B0F17');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-[#FFC500]" />
            YR Ads Studio — مولد الإعلانات
          </h2>
          <p className="text-[#9CA3AF] text-xs">أداة مصغرة لإنشاء وتجهيز الحملات الإعلانية وملاءمتها للمواضع الـ 10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* أداة التحكم والخيارات */}
        <div className="space-y-4 bg-[#0B0F17] p-5 rounded-xl border border-[#1F2937]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1F2937] pb-3">
            <Layers size={16} className="text-[#FFC500]" /> أدوات التصميم
          </h3>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">موضع الإعلان المستهدف (10 مواضع)</label>
            <select
              className="w-full bg-[#161D2B] border border-[#1F2937] rounded-lg p-2.5 text-xs text-white"
              value={selectedPlacement.id}
              onChange={(e) => {
                const found = YR_AD_PLACEMENTS.find(p => p.id === e.target.value);
                if (found) setSelectedPlacement(found);
              }}
            >
              {YR_AD_PLACEMENTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.width}x{p.height}px)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">العنوان الرئيسي</label>
            <input
              type="text"
              value={adHeadline}
              onChange={(e) => setAdHeadline(e.target.value)}
              className="w-full bg-[#161D2B] border border-[#1F2937] rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] block mb-1">الوصف الفرعي</label>
            <input
              type="text"
              value={adSubtext}
              onChange={(e) => setAdSubtext(e.target.value)}
              className="w-full bg-[#161D2B] border border-[#1F2937] rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1">لون التمييز</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                />
                <span className="text-[11px] text-[#9CA3AF]">{accentColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1">خلفية الإعلان</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                />
                <span className="text-[11px] text-[#9CA3AF]">{bgColor}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#FFC500] text-black font-bold text-xs hover:bg-[#FFC500]/90">
              <Eye size={15} /> معاينة فورية
            </button>
          </div>
        </div>

        {/* مساحة المعاينة الحية Canvas Preview */}
        <div className="lg:col-span-2 bg-[#0B0F17] p-5 rounded-xl border border-[#1F2937] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-4">
            <span className="text-xs font-bold text-[#9CA3AF]">
              المعاينة: {selectedPlacement.name} ({selectedPlacement.width} × {selectedPlacement.height}px)
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] text-[10px] font-bold">
                YR Ads Ready
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 bg-[#070A10] rounded-lg border border-dashed border-[#1F2937] overflow-auto">
            <div 
              style={{ backgroundColor: bgColor, borderColor: accentColor }}
              className="p-6 rounded-xl border-2 shadow-2xl relative flex flex-col justify-between max-w-full min-w-[300px]"
            >
              <div>
                <span 
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                  className="px-2.5 py-1 rounded text-[10px] font-black inline-block mb-3"
                >
                  إعلان ممول — Yemen Rating
                </span>
                <h4 style={{ color: '#FFFFFF' }} className="text-lg font-black">{adHeadline}</h4>
                <p style={{ color: '#9CA3AF' }} className="text-xs mt-1">{adSubtext}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button 
                  style={{ backgroundColor: accentColor }}
                  className="px-4 py-2 rounded-lg text-black font-black text-xs shadow-md"
                >
                  زيارة الرابط
                </button>
                <div className="text-[10px] text-[#6B7280]">YR Verified Ad</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
