import React from 'react';
import { BusinessItem } from '../../../types/business';
import { Card } from '../../ui/Card';
import { Building2, CheckCircle2 } from 'lucide-react';

export const OverviewSection: React.FC<{ business: BusinessItem }> = ({ business }) => {
  return (
    <div className="space-y-4">
      {/* Description Card */}
      {business.description && (
        <Card className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
            <Building2 size={16} strokeWidth={2} />
            <span>نبذة عن {business.name}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A1A1AA] leading-relaxed">
            {business.description}
          </p>
        </Card>
      )}

      {/* Services List if available */}
      {business.services && business.services.length > 0 && (
        <Card className="p-4 sm:p-5 space-y-3">
          <h3 className="font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white pb-1 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
            الخدمات الأساسية والمزايا
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {business.services.map((srv, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-xs font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-[#16A34A] dark:text-[#22C55E] shrink-0" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
