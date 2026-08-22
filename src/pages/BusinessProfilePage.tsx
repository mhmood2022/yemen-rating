import React from 'react';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { BusinessHeader } from '../components/business/BusinessHeader';
import { BusinessTabs } from '../components/business/BusinessTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const BusinessProfilePage: React.FC<{
  businessId: string;
  onNavigate: (path: string) => void;
}> = ({ businessId, onNavigate }) => {
  const business = DEMO_BUSINESSES.find((b) => b.id === businessId);

  if (!business) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/directory')} icon={<ArrowRight size={14} strokeWidth={1.75} />}>
          العودة لدليل الأنشطة
        </Button>
        <EmptyState
          title="النشاط غير موجود"
          description="لم يتم العثور على النشاط المطلوب أو ربما تم حذفه."
          actionLabel="تصفح دليل الأنشطة"
          onAction={() => onNavigate('/directory')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/directory')}
          className="text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1F3A] dark:hover:text-[#F8FAFC]"
          icon={<ArrowRight size={14} strokeWidth={1.75} />}
        >
          العودة لدليل الأنشطة
        </Button>
        <span className="text-xs text-[#94A3B8] dark:text-[#64748B]">معرف النشاط: #{business.id}</span>
      </div>

      <BusinessHeader business={business} />
      <BusinessTabs business={business} />
    </div>
  );
};
