import React from 'react';
import { Landmark, Wallet, MapPin, Star, CheckCircle2, Flame, ArrowLeft, Layers, Users } from 'lucide-react';
import { BankWalletItem } from '../../types/banksWallets';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BusinessScore } from '../business/BusinessScore';

interface BankWalletCardProps {
  item: BankWalletItem;
  onNavigate: (path: string) => void;
}

export const BankWalletCard: React.FC<BankWalletCardProps> = ({ item, onNavigate }) => {
  const isBank = item.type === 'bank';
  const targetUrl = `/business/${item.id}`;

  return (
    <Card
      hoverable
      className="flex flex-col justify-between p-4 sm:p-5 transition-all duration-200 cursor-pointer group"
      onClick={() => onNavigate(targetUrl)}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={isBank ? 'primary' : 'yellow'} size="sm" className="gap-1">
              {isBank ? <Landmark size={12} strokeWidth={2} /> : <Wallet size={12} strokeWidth={2} />}
              <span>{isBank ? 'بنك رسمي' : 'محفظة إلكترونية'}</span>
            </Badge>

            {item.isTrending && (
              <Badge variant="warning" size="sm" className="gap-1 text-[#F59E0B]">
                <Flame size={12} strokeWidth={2} />
                <span>ترند</span>
              </Badge>
            )}
          </div>

          <BusinessScore score={item.yrScore} size="sm" showLabel={false} />
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#0B1F3A]/5 dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-center text-[#0B1F3A] dark:text-[#F5C400] font-bold shrink-0 group-hover:border-[#0B1F3A]/30 dark:group-hover:border-[#F5C400]/40 transition-colors">
            {isBank ? (
              <Landmark size={22} strokeWidth={1.75} />
            ) : (
              <Wallet size={22} strokeWidth={1.75} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#0B1F3A] dark:text-white leading-snug line-clamp-1 group-hover:text-[#162F52] dark:group-hover:text-[#F5C400] transition-colors flex items-center gap-1.5">
              <span className="truncate">{item.name}</span>
              {item.isVerified && (
                <CheckCircle2
                  size={16}
                  className="text-[#16A34A] dark:text-[#22C55E] shrink-0"
                  strokeWidth={2}
                  title="مؤسسة مالية موثقة"
                />
              )}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] flex items-center gap-1 mt-1">
              <MapPin size={13} strokeWidth={1.75} className="shrink-0 text-[#94A3B8] dark:text-[#71717A]" />
              <span>المقر الرئيسي: {item.headquartersCity}</span>
              {item.commercialName && <span className="truncate opacity-75">· {item.commercialName}</span>}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#475569] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3.5">
          {item.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs bg-[#F7F8FA] dark:bg-[#0A0A0A] p-2.5 rounded-[8px] border border-[#E2E8F0] dark:border-[#222222]">
          {item.branchCount !== undefined && (
            <div className="flex items-center gap-1.5 text-[#0B1F3A] dark:text-white font-semibold">
              <Layers size={13} strokeWidth={1.75} className="text-[#F5C400]" />
              <span>{item.branchCount} فرع معتمد</span>
            </div>
          )}
          {item.agentCount !== undefined && (
            <div className="flex items-center gap-1.5 text-[#0B1F3A] dark:text-white font-semibold">
              <Users size={13} strokeWidth={1.75} className="text-[#F59E0B]" />
              <span>+{item.agentCount.toLocaleString()} نقطة خدمة</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#222222] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-[#0B1F3A] dark:text-white">
            <Star size={14} strokeWidth={1.75} className="text-[#F5C400] fill-[#F5C400]" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-[#94A3B8] dark:text-[#71717A]">({item.reviewCount} تقييم)</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[#0B1F3A] dark:text-white group-hover:bg-[#0B1F3A] group-hover:text-white dark:group-hover:bg-[#F5C400] dark:group-hover:text-[#000000] transition-all h-[32px] px-2.5"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(targetUrl);
          }}
        >
          <span>عرض النشاط والرسوم</span>
          <ArrowLeft size={13} strokeWidth={1.75} />
        </Button>
      </div>
    </Card>
  );
};
