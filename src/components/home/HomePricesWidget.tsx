import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';

export const HomePricesWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-bold text-[#0B1F3A] dark:text-white">
          أسعار العملات والذهب
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/prices')}
          className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-[#F5C400] transition-colors flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <ArrowLeft size={12} strokeWidth={1.75} />
        </button>
      </div>

      {/* Financial Board Card */}
      <Card
        hoverable
        onClick={() => onNavigate('/prices')}
        className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] cursor-pointer"
      >
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-x-reverse divide-[#E2E8F0] dark:divide-[#222222]">
          {/* 1. Saudi Riyal */}
          <div className="px-1 space-y-1">
            <span className="text-xs font-bold text-[#0B1F3A] dark:text-white block">
              ريال سعودي
            </span>
            <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold text-[#0B1F3A] dark:text-white">
              <div>
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">بيع</span>
                <span>418</span>
              </div>
              <div className="text-[#16A34A] dark:text-[#22C55E]">
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">شراء</span>
                <span>410</span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">ريال يمني</span>
          </div>

          {/* 2. US Dollar */}
          <div className="px-1 space-y-1">
            <span className="text-xs font-bold text-[#0B1F3A] dark:text-white block">
              دولار أمريكي
            </span>
            <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold text-[#0B1F3A] dark:text-white">
              <div>
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">بيع</span>
                <span>1,540</span>
              </div>
              <div className="text-[#16A34A] dark:text-[#22C55E]">
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">شراء</span>
                <span>1,530</span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">ريال يمني</span>
          </div>

          {/* 3. Gold 21K */}
          <div className="px-1 space-y-1">
            <span className="text-xs font-bold text-[#0B1F3A] dark:text-white block">
              الذهب عيار 21
            </span>
            <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold text-[#0B1F3A] dark:text-white">
              <div>
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">بيع</span>
                <span>43,500</span>
              </div>
              <div className="text-[#16A34A] dark:text-[#22C55E]">
                <span className="text-[#64748B] dark:text-[#71717A] text-[9px] block">شراء</span>
                <span>42,500</span>
              </div>
            </div>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">ريال يمني / جرام</span>
          </div>
        </div>

        {/* Footer Timestamp */}
        <div className="pt-3 mt-3 border-t border-[#F1F5F9] dark:border-[#1E1E1E] flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#71717A]">
          <Clock size={12} strokeWidth={1.75} />
          <span>آخر تحديث: منذ 5 دقائق</span>
        </div>
      </Card>
    </div>
  );
};
