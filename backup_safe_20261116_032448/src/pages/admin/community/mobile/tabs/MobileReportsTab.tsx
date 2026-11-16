import React, { useMemo, useState } from 'react';
import { ShieldCheck, Filter } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/ReportCard';
import { FilterChips } from '../../shared/FilterChips';
import { EmptyState } from '../../shared/EmptyState';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { useToast } from '../../shared/Toast';
import type { ReportItem } from '../../shared/types';

interface Props { searchQuery?: string; }
type TabFilter = 'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export const MobileReportsTab: React.FC<Props> = ({ searchQuery = '' }) => {
  const { reports, reportersMap, loading, error, reload, updateStatus, deletePost, blockUser } = useReports();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<TabFilter>('pending');

  const counts = useMemo(() => ({
    all: reports.length,
    pending: reports.filter(r => (r.status || '').toLowerCase() === 'pending').length,
    reviewing: reports.filter(r => (r.status || '').toLowerCase() === 'reviewing').length,
    resolved: reports.filter(r => (r.status || '').toLowerCase() === 'resolved').length,
    dismissed: reports.filter(r => (r.status || '').toLowerCase() === 'dismissed').length,
  }), [reports]);

  const filtered = useMemo(() => {
    let list = reports;
    if (filter !== 'all') list = list.filter(r => (r.status || 'pending').toLowerCase() === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.reason?.toLowerCase().includes(q) || r.details?.toLowerCase().includes(q) || r.targetPost?.content?.toLowerCase().includes(q) || r.targetUser?.full_name?.toLowerCase().includes(q) || r.reporter_name?.toLowerCase().includes(q));
    }
    return list;
  }, [reports, filter, searchQuery]);

  const handleDismiss = async (r: ReportItem) => {
    try { await updateStatus(r.id, 'dismissed'); showToast('تم تجاهل البلاغ', 'success'); } catch { showToast('تعذر التحديث', 'error'); }
  };
  const handleResolve = async (r: ReportItem) => {
    try { await updateStatus(r.id, 'resolved'); showToast('تم حل البلاغ', 'success'); } catch { showToast('تعذر التحديث', 'error'); }
  };
  const handleDeletePost = async (r: ReportItem) => {
    if (!r.targetPost) return;
    try { await deletePost(r.targetPost.id); await updateStatus(r.id, 'resolved'); showToast('تم الحذف والحل', 'success'); } catch { showToast('تعذر الحذف', 'error'); }
  };
  const handleBlockUser = async (r: ReportItem) => {
    const userId = r.targetUser?.id || r.reported_item_id;
    if (!userId) return;
    try { await blockUser(userId); await updateStatus(r.id, 'resolved'); showToast('تم الحظر والحل', 'success'); } catch { showToast('تعذر الحظر', 'error'); }
  };

  return (
    <div className="space-y-3">
      <FilterChips chips={[
        { id: 'pending', label: 'جديد', count: counts.pending },
        { id: 'reviewing', label: 'قيد المراجعة', count: counts.reviewing },
        { id: 'resolved', label: 'تم الحل', count: counts.resolved },
        { id: 'dismissed', label: 'مرفوض', count: counts.dismissed },
        { id: 'all', label: 'الكل', count: counts.all },
      ]} active={filter} onChange={(id) => setFilter(id as TabFilter)} />
      {loading ? <SkeletonCard variant="report" count={3} /> : error ? (
        <EmptyState icon={Filter} title="تعذر التحميل" description={error} actionLabel="إعادة المحاولة" onAction={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={filter === 'pending' ? 'لا توجد بلاغات جديدة' : 'لا توجد بلاغات'} description={filter === 'pending' ? 'كل شيء تحت السيطرة' : 'جرّب تغيير الفلتر'} />
      ) : (
        filtered.map(r => (
          <ReportCard key={r.id} report={r} reporter={r.reporter_id ? reportersMap.get(r.reporter_id) : undefined} onDismiss={handleDismiss} onResolve={handleResolve} onDeletePost={handleDeletePost} onBlockUser={handleBlockUser} />
        ))
      )}
    </div>
  );
};
