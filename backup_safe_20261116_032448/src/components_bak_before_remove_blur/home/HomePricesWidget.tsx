import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '../ui/Card';

export const HomePricesWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-2.5">
      {/* Header with Yellow "عرض الكل" */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-black text-white">
          أسعار العملات والذهب
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/prices')}
          className="text-xs font-black text-[#F5C400] hover:underline transition-colors"
        >
          عرض الكل
        </button>
      </div>

      {/* 3-Column Financial Board Card */}
      <Card
        hoverable
        onClick={() => onNavigate('/prices')}
        className="p-3.5 bg-[#111111] border border-[#222222] rounded-[14px] cursor-pointer"
      >
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-x-reverse divide-[#1E1E1E]">
          {/* 1. ريال سعودي */}
          <div className="px-1 space-y-1">
            <span className="text-[11px] font-black text-white block">
              ريال سعودي
            </span>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-white">
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">شراء</span>
                <span className="text-[#F5C400]">410</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">بيع</span>
                <span>418</span>
              </div>
            </div>
            <span className="text-[9px] text-[#71717A] block">ريال يمني</span>
          </div>

          {/* 2. دولار أمريكي */}
          <div className="px-1 space-y-1">
            <span className="text-[11px] font-black text-white block">
              دولار أمريكي
            </span>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-white">
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">شراء</span>
                <span className="text-[#F5C400]">1,540</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">بيع</span>
                <span>1,530</span>
              </div>
            </div>
            <span className="text-[9px] text-[#71717A] block">ريال يمني</span>
          </div>

          {/* 3. الذهب عيار 21 */}
          <div className="px-1 space-y-1">
            <span className="text-[11px] font-black text-white block">
              الذهب عيار 21
            </span>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-white">
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">شراء</span>
                <span className="text-[#F5C400]">43,500</span>
              </div>
              <div>
                <span className="text-[#71717A] text-[8px] block font-semibold">بيع</span>
                <span>42,500</span>
              </div>
            </div>
            <span className="text-[9px] text-[#71717A] block">ريال يمني / جرام</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 mt-2.5 border-t border-[#1C1C1C] flex items-center justify-center gap-1 text-[10px] text-[#71717A]">
          <Clock size={11} strokeWidth={2} />
          <span>آخر تحديث: منذ 5 دقائق</span>
        </div>
      </Card>
    </div>
  );
};
