import React from 'react';
import { BusinessItem } from '../../../types/business';
import { Card } from '../../ui/Card';
import { Users, DollarSign, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export const WalletFeesSection: React.FC<{ business: BusinessItem }> = ({ business }) => {
  return (
    <div className="space-y-4">
      {/* Agent Network Highlight Card */}
      {business.agentCount !== undefined && (
        <Card className="p-4 bg-gradient-to-l from-[#F5C400]/10 to-transparent border border-[#F5C400]/30 rounded-[14px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[10px] bg-[#F5C400] text-black flex items-center justify-center font-black shrink-0">
                <Users size={20} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-xs text-[#64748B] dark:text-[#A1A1AA] block">شبكة الوكلاء ونقاط السحب والإيداع</span>
                <span className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">
                  +{business.agentCount.toLocaleString()} نقطة معتمدة في اليمن
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Wallet Fees Table */}
      {business.walletFees && business.walletFees.length > 0 && (
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm pb-1 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
            <DollarSign size={16} strokeWidth={2} />
            <span>جدول رسوم الخدمات وسقوف التحويل</span>
          </div>

          <div className="space-y-2">
            {business.walletFees.map((fee, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-[#0B1F3A] dark:text-white block">{fee.serviceName}</span>
                  {fee.limits && <span className="text-[#64748B] dark:text-[#71717A] text-[11px]">{fee.limits}</span>}
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-black text-[#16A34A] dark:text-[#22C55E] text-sm block">
                    {fee.feeAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
