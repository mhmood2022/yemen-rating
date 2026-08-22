import React from 'react';
import { BusinessItem } from '../../types/business';
import { BusinessCard } from '../business/BusinessCard';
import { EmptyState } from '../ui/EmptyState';

interface DirectoryResultsProps {
  items: BusinessItem[];
  onNavigate?: (id: string) => void;
  onResetFilters?: () => void;
}

export const DirectoryResults: React.FC<DirectoryResultsProps> = ({
  items,
  onNavigate,
  onResetFilters,
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="لم يتم العثور على نتائج تطابق بحثك"
        description="جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر لعرض الأنشطة المتاحة."
        actionLabel="إعادة ضبط الفلاتر"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((biz) => (
        <BusinessCard key={biz.id} business={biz} onNavigate={onNavigate} />
      ))}
    </div>
  );
};
