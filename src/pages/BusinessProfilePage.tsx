import React, { useState, useEffect } from 'react';
import { getBusinessBySlug } from '../services/businessService';
import { BusinessItem } from '../types/database.types';
import { BusinessHeader } from '../components/business/BusinessHeader';
import { BusinessProfileEngine } from '../components/business/BusinessProfileEngine';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const BusinessProfilePage: React.FC<{
  slug: string;
  onNavigate: (path: string) => void;
}> = ({ slug, onNavigate }) => {
  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBusinessBySlug(slug).then(data => {
      setBusiness(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#FFC107] mb-4"></i>
          <p className="text-neutral-400 text-sm">جاري تحميل النشاط...</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-0 pb-12 w-full">
      <BusinessHeader business={business} onNavigate={onNavigate} />
      <BusinessProfileEngine business={business} onNavigate={onNavigate} />
    </div>
  );
};
