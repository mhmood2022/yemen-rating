import React, { useState } from 'react';
import { Inbox, ListFilter } from 'lucide-react';
import { useInbox } from '../hooks/useInbox';
import { RequestCard } from '../components/RequestCard';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/SkeletonCard';
import type { AdminRequest, RequestType } from '../types';
import { TYPE_LABELS } from '../types';

interface Props {
  onRequestClick: (r: AdminRequest) => void;
}

const TYPE_FILTERS: { id: RequestType | 'all'; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'report', label: 'بلاغات' },
  { id: 'support', label: 'دعم' },
  { id: 'verification', label: 'توثيق' },
  { id: 'claim', label: 'ملكية' },
  { id: 'job_application', label: 'وظائف' },
  { id: 'property_inquiry', label: 'عقارات' },
];

export const InboxTab: React.FC<Props> = ({ onRequestClick }) => {
  const { requests, counts, loading, error, reload } = useInbox();
  const [activeFilter, setActiveFilter] = useState<RequestType | 'all'>('all');

  const filtered = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.type === activeFilter);

  return (
    <div className="h-full flex flex-col">
      {/* فلاتر النوع */}
      <div className="px-4 pt-3 pb-2 border-b border-[#2A2B30]/60 bg-black/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {TYPE_FILTERS.map(f => {
            const isActive = activeFilter === f.id;
            const count = f.id === 'all' ? counts.total : counts[f.id];
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:opacity-70"
                style={{
                  background: isActive ? '#FFC500' : '#111',
                  color: isActive ? '#000' : '#9CA3AF',
                  border: isActive ? '1px solid #FFC500' : '1px solid #2A2B30',
                }}
              >
                <span>{f.label}</span>
                {typeof count === 'number' && count > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: isActive ? '#00000030' : '#1F2024',
                      color: isActive ? '#000' : '#FFFFFF',
                    }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <SkeletonCard count={4} />
        ) : error ? (
          <EmptyState
            icon={Inbox}
            title="تعذر تحميل الطلبات"
            description={error}
            actionLabel="إعادة المحاولة"
            onAction={reload}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="لا توجد طلبات"
            description={
              activeFilter === 'all'
                ? 'صندوق الوارد فارغ حالياً'
                : `لا توجد طلبات من نوع "${TYPE_LABELS[activeFilter as RequestType]}"`
            }
          />
        ) : (
          filtered.map(r => (
            <RequestCard key={r.id} request={r} onClick={onRequestClick} />
          ))
        )}
      </div>
    </div>
  );
};
