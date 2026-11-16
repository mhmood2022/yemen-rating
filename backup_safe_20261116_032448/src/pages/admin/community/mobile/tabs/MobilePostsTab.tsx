import React, { useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { FilterChips } from '../../shared/FilterChips';
import { EmptyState } from '../../shared/EmptyState';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { useToast } from '../../shared/Toast';
import type { PostItem } from '../../shared/types';

interface Props {
  searchQuery?: string;
}

type F = 'all' | 'active' | 'hidden' | 'pinned';

export const MobilePostsTab: React.FC<Props> = ({ searchQuery = '' }) => {
  const { posts, loading, error, reload, toggleHide, togglePin, deletePost } = usePosts();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<F>('all');

  const filtered = useMemo(() => {
    let list = posts;
    if (filter === 'active') list = list.filter(p => !p.is_hidden);
    else if (filter === 'hidden') list = list.filter(p => p.is_hidden);
    else if (filter === 'pinned') list = list.filter(p => p.is_pinned);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q) ||
        p.authorUsername?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, filter, searchQuery]);

  const handleToggleHide = async (p: PostItem) => {
    try {
      await toggleHide(p);
      showToast(p.is_hidden ? 'تم استعادة التغريدة' : 'تم إخفاء التغريدة', 'success');
    } catch {
      showToast('تعذر التحديث', 'error');
    }
  };

  const handleTogglePin = async (p: PostItem) => {
    try {
      await togglePin(p);
      showToast(p.is_pinned ? 'تم إلغاء التثبيت' : 'تم تثبيت التغريدة', 'success');
    } catch {
      showToast('تعذر التحديث', 'error');
    }
  };

  const handleDelete = async (p: PostItem) => {
    if (!confirm('هل أنت متأكد من حذف هذه التغريدة نهائياً؟')) return;
    try {
      await deletePost(p.id);
      showToast('تم الحذف نهائياً', 'success');
    } catch {
      showToast('تعذر الحذف', 'error');
    }
  };

  return (
    <div className="space-y-3">
      <FilterChips
        chips={[
          { id: 'all', label: 'الكل', count: posts.length },
          { id: 'pinned', label: 'مثبتة' },
          { id: 'active', label: 'نشطة' },
          { id: 'hidden', label: 'مخفية' },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as F)}
      />

      {loading ? (
        <SkeletonCard variant="post" count={3} />
      ) : error ? (
        <EmptyState
          icon={MessageSquare}
          title="تعذر التحميل"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={reload}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="لا توجد تغريدات" description="جرّب تغيير الفلتر" />
      ) : (
        filtered.map((p) => (
          <PostCard key={p.id} post={p} onToggleHide={handleToggleHide} onTogglePin={handleTogglePin} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};
