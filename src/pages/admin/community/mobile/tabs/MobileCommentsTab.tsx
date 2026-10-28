import React, { useState } from 'react';
import { MessageCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { EmptyState } from '../../shared/EmptyState';
import { useToast } from '../../shared/Toast';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';
import { timeAgo } from '../../shared/types';

interface Props {
  searchQuery?: string;
}

export const MobileCommentsTab: React.FC<Props> = ({ searchQuery = '' }) => {
  const { comments, loading, error, reload, deleteComment } = useComments();
  const { showToast } = useToast();

  const filtered = comments.filter(c => 
    c.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    try {
      await deleteComment(id);
      showToast('تم حذف التعليق', 'success');
    } catch {
      showToast('تعذر حذف التعليق', 'error');
    }
  };

  if (loading) return <SkeletonCard variant="simple" count={4} />;
  if (error) return <EmptyState icon={ShieldAlert} title="تعذر التحميل" description={error} onAction={reload} actionLabel="إعادة المحاولة" />;

  return (
    <div className="space-y-3">
      {filtered.length === 0 ? (
        <EmptyState icon={MessageCircle} title="لا توجد تعليقات" description="لم يتم العثور على تعليقات مطابقة" />
      ) : (
        filtered.map((comment) => (
          <div key={comment.id} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold overflow-hidden" style={{ background: '#111111', color: '#FFF' }}>
              {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full object-cover" alt="" /> : comment.authorName?.[0] || '؟'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate" style={{ color: '#FFF' }}>{comment.authorName}</span>
                {comment.authorBadge && comment.authorBadge !== 'none' && <VerifiedBadge type={comment.authorBadge as any} size={16} />}
                <span className="text-xs text-zinc-500">@{comment.authorUsername}</span>
                <span className="text-xs text-zinc-600">· {timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#D1D5DB' }}>{comment.content}</p>
            </div>
            <button onClick={() => handleDelete(comment.id)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10 text-red-500 active:opacity-60">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};
