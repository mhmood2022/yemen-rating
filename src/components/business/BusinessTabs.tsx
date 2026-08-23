import React, { useState } from 'react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Building2,
  Coins,
  Wrench,
  MapPin,
  Star,
  MoreHorizontal,
  ArrowLeftRight,
  CheckCircle2,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { yrToast } from '../ui/Toast';

interface BusinessTabsProps {
  business: BusinessItem;
  onNavigate?: (path: string) => void;
}

export const BusinessTabs: React.FC<BusinessTabsProps> = ({ business, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const isFinancial =
    business.category === 'البنوك' ||
    business.category === 'المحافظ الإلكترونية' ||
    business.category === 'الصرافة';

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Building2 },
    { id: 'services', label: 'الخدمات', icon: Wrench },
    ...(business.branches && business.branches.length > 0 ? [{ id: 'branches', label: 'الفروع', icon: MapPin }] : []),
    ...(isFinancial ? [{ id: 'rates', label: 'الأسعار', icon: Coins }] : []),
    { id: 'reviews', label: 'التقييمات', icon: Star },
  ];

  const handleAddReview = () => {
    yrToast.info('تم فتح نموذج التقييم المعتمد');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-3 sm:px-4">
      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] dark:border-[#222222] pb-2 overflow-x-auto no-scrollbar pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-extrabold transition-all whitespace-nowrap select-none',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black shadow-sm'
                  : 'text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <Icon size={14} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="space-y-4 pt-1">
        {/* 1. نظرة عامة (Overview) */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <div className="space-y-4">
            {/* عن النشاط / البنك */}
            <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-2">
              <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
                <Building2 size={16} strokeWidth={2} />
                <span>عن {business.name}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A1A1AA] leading-relaxed">
                {business.description || 'المؤسسة تقدم خدماتها المعتمدة في عموم الجمهورية اليمنية.'}
              </p>
            </Card>

            {/* أسعار الصرف إذا كان بنكاً أو صرافة */}
            {isFinancial && business.exchangeRates && (
              <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
                  <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
                    <Coins size={16} strokeWidth={2} />
                    <span>أسعار الصرف المعتمدة</span>
                  </div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#71717A]">سوق صنعاء</span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-center text-[10px] font-bold text-[#64748B] dark:text-[#71717A] px-2">
                    <span className="text-right">العملة</span>
                    <span>شراء</span>
                    <span>بيع</span>
                  </div>

                  {business.exchangeRates.map((r, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 items-center text-center p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] text-xs"
                    >
                      <span className="text-right font-bold text-[#0B1F3A] dark:text-white">
                        {r.code}
                      </span>
                      <span className="font-black text-[#16A34A] dark:text-[#22C55E]">
                        {r.buy.toLocaleString()}
                      </span>
                      <span className="font-black text-[#0B1F3A] dark:text-white">
                        {r.sell.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/prices')}
                  className="w-full py-2 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-[#F7F8FA] dark:bg-[#141414] text-[#0B1F3A] dark:text-[#F5C400] text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#F5C400]/50 transition-colors"
                >
                  <ArrowLeftRight size={13} strokeWidth={2} />
                  <span>مقارنة الأسعار بين صنعاء وعدن</span>
                </button>
              </Card>
            )}
          </div>
        )}

        {/* 2. الخدمات (Services) */}
        {(activeTab === 'services' || activeTab === 'overview') && business.services && (
          <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3">
            <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm pb-1 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
              <Wrench size={16} strokeWidth={2} />
              <span>الخدمات والمنتجات المقدمة</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {business.services.map((srv, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] text-xs font-bold text-[#0B1F3A] dark:text-white flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} className="text-[#16A34A] dark:text-[#22C55E]" />
                  <span>{srv}</span>
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* 3. الفروع والانتشار (Branches) */}
        {(activeTab === 'branches' || activeTab === 'overview') && business.branches && (
          <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
              <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
                <MapPin size={16} strokeWidth={2} />
                <span>الفروع والانتشار</span>
              </div>
            </div>

            <div className="space-y-2">
              {business.branches.map((b, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] flex items-start gap-2 text-xs"
                >
                  <span className="font-extrabold text-[#F5C400] shrink-0">{b.city}:</span>
                  <span className="text-[#475569] dark:text-[#A1A1AA] leading-relaxed">{b.address}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => yrToast.info('شبكة الفروع معتمدة في كافة المحافظات')}
              className="w-full py-2 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-[#F7F8FA] dark:bg-[#141414] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1 hover:border-[#F5C400]/50 transition-colors"
            >
              <span>عرض جميع الفروع ونقاط الخدمة</span>
            </button>
          </Card>
        )}

        {/* 4. تقييمات العملاء (Reviews) */}
        {(activeTab === 'reviews' || activeTab === 'overview') && (
          <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
              <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
                <Star size={16} strokeWidth={2} className="fill-[#F5C400]" />
                <span>تقييمات العملاء</span>
              </div>

              {/* Stars Score summary */}
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#0B1F3A] dark:text-white">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11} className="text-[#F5C400] fill-[#F5C400]" />
                  ))}
                </div>
                <span>{business.rating.toFixed(1)} / 5</span>
              </div>
            </div>

            {/* Reviews List */}
            {business.reviews && business.reviews.length > 0 && (
              <div className="space-y-2.5">
                {business.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#0B1F3A]/5 dark:bg-[#1A1A1A] flex items-center justify-center text-[#71717A]">
                          <User size={12} />
                        </div>
                        <span className="font-bold text-xs text-[#0B1F3A] dark:text-white">
                          {rev.authorName}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] dark:text-[#71717A]">{rev.date}</span>
                    </div>

                    <p className="text-xs text-[#475569] dark:text-[#A1A1AA] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review Button */}
            <button
              type="button"
              onClick={handleAddReview}
              className="w-full py-2.5 rounded-[10px] bg-[#F5C400] text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>كتابة تقييم جديد</span>
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};
