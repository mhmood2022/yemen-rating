import React, { useState } from 'react';
import { Landmark, Wallet, MapPin, CheckCircle2, Phone, Globe, ShieldCheck, DollarSign, Wrench, Layers } from 'lucide-react';
import { BankWalletItem } from '../../types/banksWallets';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BusinessScore } from '../business/BusinessScore';
import { cn } from '../../lib/utils';

interface BankWalletModalProps {
  item: BankWalletItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BankWalletModal: React.FC<BankWalletModalProps> = ({ item, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'fees' | 'services' | 'features'>('fees');

  if (!item) return null;
  const isBank = item.type === 'bank';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBank ? 'بيانات البنك والرسوم' : 'بيانات المحفظة والرسوم'}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#222222]">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-[12px] bg-[#0B1F3A]/5 dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-center text-[#0B1F3A] dark:text-[#F5C400] shrink-0">
              {isBank ? <Landmark size={28} strokeWidth={1.75} /> : <Wallet size={28} strokeWidth={1.75} />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={isBank ? 'primary' : 'yellow'} size="sm">
                  {item.entityCategory}
                </Badge>
                {item.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] dark:text-[#22C55E]">
                    <CheckCircle2 size={13} />
                    موثق رسمياً
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">
                {item.name}
              </h2>

              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] flex items-center gap-1">
                <MapPin size={13} className="text-[#94A3B8] dark:text-[#71717A]" />
                <span>المقر: {item.headquartersCity}</span>
              </p>
            </div>
          </div>

          <BusinessScore score={item.yrScore} size="md" showLabel={true} />
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A1A1AA] leading-relaxed">
          {item.description}
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#222222] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all',
              activeTab === 'fees'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#000000]'
                : 'text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414]'
            )}
          >
            <DollarSign size={14} />
            <span>جدول الرسوم وسقوف التحويل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all',
              activeTab === 'services'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#000000]'
                : 'text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414]'
            )}
          >
            <Wrench size={14} />
            <span>الخدمات المتاحة ({item.services.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all',
              activeTab === 'features'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#000000]'
                : 'text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414]'
            )}
          >
            <ShieldCheck size={14} />
            <span>الميزات والانتشار</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'fees' && (
            <div className="space-y-2.5">
              {item.fees.map((fee, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#0B1F3A] dark:text-white block">{fee.serviceName}</span>
                    {fee.notes && <span className="text-[#64748B] dark:text-[#71717A] text-[11px]">{fee.notes}</span>}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-extrabold text-[#16A34A] dark:text-[#22C55E] text-sm block">{fee.feeAmount}</span>
                    {fee.limits && <span className="text-[#F59E0B] text-[11px] font-semibold">{fee.limits}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-xs font-semibold text-[#0B1F3A] dark:text-white flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-[#F5C400]/20 text-[#0B1F3A] dark:text-[#F5C400] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <span>{srv}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5">
              {item.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-xs font-semibold text-[#0B1F3A] dark:text-white flex items-center gap-2"
                >
                  <CheckCircle2 size={16} className="text-[#16A34A] dark:text-[#22C55E] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex flex-wrap items-center gap-2 text-xs">
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-[#0B1F3A] dark:text-white font-semibold"
            >
              <Phone size={13} className="text-[#16A34A] dark:text-[#22C55E]" />
              <span dir="ltr">{item.phone}</span>
            </a>
          )}
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-[#0B1F3A] dark:text-white font-semibold"
            >
              <Globe size={13} className="text-[#F5C400]" />
              <span>الموقع الإلكتروني الرسمي</span>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};
