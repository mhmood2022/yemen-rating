import React, { useState } from 'react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { BusinessReviews } from './BusinessReviews';
import { BarChart3, Package, Wrench, FileText, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BusinessTabs: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'products' | 'reviews' | 'stats'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: FileText },
    { id: 'services' as const, label: 'الخدمات', icon: Wrench, count: business.services?.length },
    { id: 'products' as const, label: 'المنتجات', icon: Package, count: business.products?.length },
    { id: 'reviews' as const, label: 'التقييمات', icon: Star, count: business.reviews?.length },
    { id: 'stats' as const, label: 'الإحصائيات', icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#263A52] pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#0B1F3A]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#162F52] hover:text-[#0B1F3A] dark:hover:text-[#F8FAFC]'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-extrabold',
                    isActive
                      ? 'bg-[#F5C400] text-[#0B1F3A] dark:bg-[#0B1F3A] dark:text-[#F5C400]'
                      : 'bg-[#E2E8F0] dark:bg-[#263A52] text-[#475569] dark:text-[#94A3B8]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-[#F8FAFC] mb-2">عن النشاط</h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {business.description || 'لا توجد بيانات متاحة حاليًا.'}
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-[#F8FAFC] mb-3">بيانات التوثيق والتصنيف</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] border border-[#E2E8F0] dark:border-[#263A52] rounded-[8px]">
                  <span className="text-[#94A3B8] dark:text-[#64748B] block mb-1">المدينة</span>
                  <span className="font-bold text-[#0B1F3A] dark:text-[#F8FAFC]">{business.city}</span>
                </div>
                <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] border border-[#E2E8F0] dark:border-[#263A52] rounded-[8px]">
                  <span className="text-[#94A3B8] dark:text-[#64748B] block mb-1">التصنيف الرسمي</span>
                  <span className="font-bold text-[#0B1F3A] dark:text-[#F8FAFC]">{business.category}</span>
                </div>
                <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] border border-[#E2E8F0] dark:border-[#263A52] rounded-[8px]">
                  <span className="text-[#94A3B8] dark:text-[#64748B] block mb-1">حالة التوثيق</span>
                  <span className={business.isVerified ? 'font-bold text-[#16A34A] dark:text-[#4ADE80]' : 'font-bold text-[#64748B] dark:text-[#94A3B8]'}>
                    {business.isVerified ? 'موثق رسمياً' : 'غير موثق'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            {!business.services || business.services.length === 0 ? (
              <EmptyState title="لا توجد بيانات متاحة حاليًا" description="لم يتم تسجيل قائمة الخدمات لهذا النشاط بعد." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.services.map((srv, idx) => (
                  <Card key={idx} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-[#0B1F3A]/5 dark:bg-[#0F2138] border border-[#E2E8F0] dark:border-[#263A52] text-[#0B1F3A] dark:text-[#F5C400] flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-[#F8FAFC]">{srv}</span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {!business.products || business.products.length === 0 ? (
              <EmptyState title="لا توجد بيانات متاحة حاليًا" description="لم يتم إدراج أي منتجات لهذا النشاط حاليًا." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.products.map((prd) => (
                  <Card key={prd.id} className="p-4">
                    <h4 className="font-bold text-sm text-[#0B1F3A] dark:text-[#F8FAFC] mb-1">{prd.name}</h4>
                    {prd.description && <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-2">{prd.description}</p>}
                    {prd.price && <span className="text-xs font-bold text-[#16A34A] dark:text-[#4ADE80]">{prd.price}</span>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <BusinessReviews reviews={business.reviews} />
        )}

        {activeTab === 'stats' && (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-[#F8FAFC] mb-1">تقرير تفاعل المنصة (YR Report Preview)</h3>
            <p className="text-xs text-[#94A3B8] dark:text-[#64748B] mb-4">يعرض فقط قياسات الزيارات والظهور المحسوبة داخل منصة يمن ريتغ</p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] rounded-[10px] border border-[#E2E8F0] dark:border-[#263A52]">
                <span className="block text-lg font-black text-[#0B1F3A] dark:text-[#F8FAFC]">{business.stats?.views7d || 0}</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">زيارات (7 أيام)</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] rounded-[10px] border border-[#E2E8F0] dark:border-[#263A52]">
                <span className="block text-lg font-black text-[#0B1F3A] dark:text-[#F8FAFC]">{business.stats?.views30d || 0}</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">ظهور (30 يومًا)</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#0F2138] rounded-[10px] border border-[#E2E8F0] dark:border-[#263A52]">
                <span className="block text-lg font-black text-[#0B1F3A] dark:text-[#F8FAFC]">{business.stats?.searches30d || 0}</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">بحث (30 يومًا)</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
