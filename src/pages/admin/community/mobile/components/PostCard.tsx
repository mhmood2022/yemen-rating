import { BadgeIcon } from '../../../../../components/common/BadgeIcon';
import React from 'react';
import { Eye, EyeOff, Trash2, Heart, MessageCircle, Repeat } from 'lucide-react';
import type { PostItem } from '../../shared/types';
import { timeAgo, formatNumber } from '../../shared/types';

interface Props {
  post: PostItem;
  onToggleHide: (p: PostItem) => void;
  onDelete: (p: PostItem) => void;
}

export const PostCard: React.FC<Props> = ({ post, onToggleHide, onDelete }) => {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        backgroundColor: '#000000',
        border: post.is_hidden ? '1px solid #FFC50060' : '1px solid #2A2B30',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
        >
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            post.authorName?.[0] || '؟'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>
              {post.authorName}
            </span>
            {post.authorBadge && post.authorBadge !== 'none' && <BadgeIcon type={post.authorBadge as any} size={16} />}
            <span className="text-xs" style={{ color: '#9CA3AF' }} dir="ltr">
              @{post.authorUsername}
            </span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              · {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
        {post.is_hidden && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{
              color: '#FFC500',
              backgroundColor: '#FFC50015',
              border: '1px solid #FFC50040',
            }}
          >
            مخفية
          </span>
        )}
      </div>

      {post.content && post.content.trim() ? (
        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#FFFFFF' }}>
          {post.content}
        </p>
      ) : (
        <p className="text-sm italic" style={{ color: '#9CA3AF' }}>
          (تغريدة بدون نص)
        </p>
      )}

      {post.image_url && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2A2B30' }}>
          <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
        </div>
      )}

      {post.video_url && (
        <div
          className="rounded-xl p-3 flex items-center gap-2 text-xs"
          style={{
            backgroundColor: '#1D9BF015',
            border: '1px solid #1D9BF040',
            color: '#1D9BF0',
          }}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>يحتوي على فيديو</span>
        </div>
      )}

      <div
        className="flex items-center gap-4 text-xs pt-2"
        style={{ color: '#9CA3AF', borderTop: '1px solid #2A2B30' }}
      >
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" /> {formatNumber(post.likes_count || 0)}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(post.comments_count || 0)}
        </span>
        <span className="flex items-center gap-1">
          <Repeat className="w-3.5 h-3.5" /> {formatNumber(post.reposts_count || 0)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onToggleHide(post)}
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70"
          style={{
            backgroundColor: '#111111',
            border: '1px solid #2A2B30',
            color: post.is_hidden ? '#22C55E' : '#FFC500',
          }}
        >
          {post.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {post.is_hidden ? 'استعادة' : 'إخفاء'}
        </button>
        <button
          onClick={() => onDelete(post)}
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70"
          style={{
            backgroundColor: '#EF444415',
            border: '1px solid #EF444440',
            color: '#EF4444',
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          حذف
        </button>
      </div>
    </div>
  );
};
