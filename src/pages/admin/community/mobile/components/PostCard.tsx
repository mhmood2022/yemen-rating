import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, Heart, MessageCircle, Repeat, Maximize2, X } from 'lucide-react';
import type { PostItem } from '../../shared/types';
import { timeAgo, formatNumber } from '../../shared/types';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';

interface Props {
  post: PostItem;
  onToggleHide: (p: PostItem) => void;
  onDelete: (p: PostItem) => void;
}

export const PostCard: React.FC<Props> = ({ post, onToggleHide, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          backgroundColor: '#000000',
          border: post.is_hidden ? '1px solid #FFC50060' : '1px solid #2A2B30',
        }}
      >
        {/* رأس البطاقة */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden" style={{ background: '#111111', color: '#FFFFFF' }}>
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              post.authorName?.[0] || '؟'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{post.authorName}</span>
              {post.authorBadge && post.authorBadge !== 'none' && <VerifiedBadge type={post.authorBadge as any} size={16} />}
              <span className="text-xs" style={{ color: '#9CA3AF' }} dir="ltr">@{post.authorUsername}</span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>· {timeAgo(post.created_at)}</span>
            </div>
          </div>
          {post.is_hidden && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: '#FFC500', background: '#FFC50015', border: '1px solid #FFC50040' }}>مخفية</span>
          )}
        </div>

        {/* المحتوى (مصغر) */}
        {post.content && post.content.trim() ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed line-clamp-4" style={{ color: '#FFFFFF' }}>
            {post.content}
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: '#9CA3AF' }}>(تغريدة بدون نص)</p>
        )}

        {/* الصورة أو الفيديو (مصغر) */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden cursor-pointer relative group" onClick={() => setShowModal(true)}>
            <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        {post.video_url && (
          <div className="rounded-xl overflow-hidden cursor-pointer relative group" onClick={() => setShowModal(true)}>
            <video src={post.video_url} className="w-full max-h-64 object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-4 text-xs pt-2" style={{ color: '#9CA3AF', borderTop: '1px solid #2A2B30' }}>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {formatNumber(post.likes_count || 0)}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {formatNumber(post.comments_count || 0)}</span>
          <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" /> {formatNumber(post.reposts_count || 0)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onToggleHide(post)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#111111', border: '1px solid #2A2B30', color: post.is_hidden ? '#22C55E' : '#FFC500' }}>
            {post.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {post.is_hidden ? 'استعادة' : 'إخفاء'}
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#111111', border: '1px solid #2A2B30', color: '#FFFFFF' }}>
            <Maximize2 className="w-3.5 h-3.5" /> عرض
          </button>
          <button onClick={() => onDelete(post)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#EF444415', border: '1px solid #EF444440', color: '#EF4444' }}>
            <Trash2 className="w-3.5 h-3.5" /> حذف
          </button>
        </div>
      </div>

      {/* النافذة المنبثقة (Modal) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ background: '#000000', border: '1px solid #2A2B30' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-[#FFC500] flex items-center justify-center text-black font-bold">{post.authorName?.[0]}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white">{post.authorName}</span>
                    {post.authorBadge && <VerifiedBadge type={post.authorBadge as any} size={16} />}
                  </div>
                  <span className="text-xs text-zinc-500">@{post.authorUsername}</span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1F2024]">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <p className="text-base text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
            {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-xl" style={{ border: '1px solid #2A2B30' }} />}
            {post.video_url && <video src={post.video_url} controls className="w-full rounded-xl" style={{ border: '1px solid #2A2B30' }} />}
          </div>
        </div>
      )}
    </>
  );
};
