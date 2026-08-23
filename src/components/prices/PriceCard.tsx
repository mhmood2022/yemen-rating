import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, ShieldCheck, Coins, Sparkles, Fuel, Utensils } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface PriceCardProps {
  title: string;
  subtitle?: string;
  market: 'sanaa' | 'aden';
  buyPrice?: number;
  sellPrice?: number;
  unitPrice?: number;
  unit?: string;
  change: 'up' | 'down' | 'stable';
  changeAmount?: string;
  source: string;
  lastUpdated: string;
  type: 'currency' | 'gold' | 'commodity';
}

export const PriceCard: React.FC<PriceCardProps> = ({
  title,
  subtitle,
  market,
  buyPrice,
  sellPrice,
  unitPrice,
  unit,
  change,
  changeAmount,
  source,
  lastUpdated,
  type,
}) => {
  const isSanaa = market === 'sanaa';

  const renderIcon = () => {
    if (type === 'currency') return <Coins size={20} strokeWidth={1.75} className="text-[#F5C400]" />;
    if (type === 'gold') return <Sparkles size={20} strokeWidth={1.75} className="text-[#F5C400]" />;
    return <Utensils size={20} strokeWidth={1.75} className="text-[#F59E0B]" />;
  };

  const renderChangeBadge = () => {
    if (change === 'up') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EF4444] bg-[#EF4444]/10 dark:bg-[#EF4444]/15 px-2 py-0.5 rounded-[6px]">
          <TrendingUp size={12} strokeWidth={2.2} />
          <span>{changeAmount || 'صاعد'}</span>
        </span>
      );
    }
    if (change === 'down') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 dark:bg-[#22C55E]/15 px-2 py-0.5 rounded-[6px]">
          <TrendingDown size={12} strokeWidth={2.2} />
          <span>{changeAmount || 'هابط'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A1A1AA] bg-[#F1F5F9] dark:bg-[#1A1A1A] px-2 py-0.5 rounded-[6px]">
        <Minus size={12} strokeWidth={2} />
        <span>{changeAmount || 'مستقر'}</span>
      </span>
    );
  };

  return (
    <Card hoverable className="p-4 sm:p-5 flex flex-col justify-between transition-all duration-200">
      <div>
        {/* Top Header: Market Badge & Change Indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant={isSanaa ? 'primary' : 'yellow'}
            size="sm"
            className="font-bold select-none"
          >
            {isSanaa ? 'سوق صنعاء' : 'سوق عدن'}
          </Badge>

          {renderChangeBadge()}
        </div>

        {/* Title and Icon */}
        <div className="flex items-start gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A]/5 dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#0B1F3A] dark:text-white leading-snug line-clamp-1">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#71717A] block mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Prices Box */}
        {buyPrice !== undefined && sellPrice !== undefined ? (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] mb-3.5 text-center">
            <div className="border-l border-[#E2E8F0] dark:border-[#1E1E1E] pl-2">
              <span className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] block mb-0.5">سعر الشراء</span>
              <span className="text-sm sm:text-base font-black text-[#16A34A] dark:text-[#22C55E]">
                {buyPrice.toLocaleString()} <small className="text-[10px] font-normal text-[#64748B] dark:text-[#71717A]">ريال</small>
              </span>
            </div>

            <div className="pr-2">
              <span className="text-[11px] text-[#64748B] dark:text-[#A1A1AA] block mb-0.5">سعر البيع</span>
              <span className="text-sm sm:text-base font-black text-[#0B1F3A] dark:text-[#F5C400]">
                {sellPrice.toLocaleString()} <small className="text-[10px] font-normal text-[#64748B] dark:text-[#71717A]">ريال</small>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] mb-3.5 flex items-center justify-between">
            <span className="text-xs text-[#64748B] dark:text-[#A1A1AA]">السعر الرسمي ({unit || 'للوحدة'}):</span>
            <span className="text-base font-black text-[#0B1F3A] dark:text-[#F5C400]">
              {unitPrice?.toLocaleString()} <small className="text-[10px] font-normal text-[#64748B] dark:text-[#71717A]">ريال</small>
            </span>
          </div>
        )}
      </div>

      {/* Footer: Source & Last Updated Time */}
      <div className="pt-2.5 border-t border-[#F1F5F9] dark:border-[#1E1E1E] flex items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-[#71717A] mt-auto">
        <span className="flex items-center gap-1 truncate" title={source}>
          <ShieldCheck size={13} className="text-[#16A34A] dark:text-[#22C55E] shrink-0" />
          <span className="truncate">{source}</span>
        </span>

        <span className="flex items-center gap-1 shrink-0">
          <Clock size={12} className="shrink-0 text-[#94A3B8] dark:text-[#71717A]" />
          <span>{lastUpdated}</span>
        </span>
      </div>
    </Card>
  );
};
