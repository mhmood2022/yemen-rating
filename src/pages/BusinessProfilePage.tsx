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
      <div className="space-y-4 p-4 max-w-lg mx-auto">
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
    <div className="space-y-3 pb-12">
      {/* Top Profile Header (Cover, Centered Logo, Action Buttons) */}
      <BusinessHeader business={business} onNavigate={onNavigate} />

      {/* Tabs & Detailed Sections matching the Wireframe */}
      <BusinessTabs business={business} onNavigate={onNavigate} />
    </div>
  );
};
