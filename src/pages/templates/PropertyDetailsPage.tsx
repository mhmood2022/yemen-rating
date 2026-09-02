import React, { useState } from 'react';
import { Building, MapPin, ArrowRight, Lock, Unlock, Phone, MessageCircle } from 'lucide-react';
import { PropertyService } from '../../services/platformServices';
import { AdBanner } from '../../components/common/AdBanner';

export const PropertyDetailsPage: React.FC = () => {
  const propertyData = PropertyService.getDemoRecord();
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="5" className="mb-1" />
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={() => window.history.back()} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للعقارات</span>
        </button>
      </div>
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl p-4 sm:p-5 space-y-3">
        <h1 className="text-base sm:text-xl font-black text-white">{propertyData.title}</h1>
        <p className="text-xs text-zinc-300">{propertyData.description}</p>
        <div className="bg-[#161619] p-3 rounded-xl border border-[#27272A] text-xs">
          {isRevealed ? (
            <div className="flex items-center gap-2"><Unlock size={14} className="text-[#16A34A]" /><span>{propertyData.publisher_phone}</span></div>
          ) : (
            <button onClick={() => setIsRevealed(true)} className="w-full py-2.5 bg-[#FFC500] text-black font-bold rounded-xl">طلب كشف الرقم والمعاينة</button>
          )}
        </div>
      </div>
    </div>
  );
};
