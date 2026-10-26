import { XVideoPlayer } from './XVideoPlayer';
import React from 'react';
import { MessageCircle, Repeat2, Heart, Share, MoreHorizontal, BarChart } from 'lucide-react';

interface TweetCardProps {
  tweet: any;
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (tweet: any) => void;
  onComment: (tweet: any) => void;
  onMenu: (tweet: any) => void;
  onOpenProfile: (authorId: string, data: any) => void;
  onOpenDetail: (tweet: any) => void;
  formatTimeAgo: (date: string) => any;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  currentUserId,
  onLike,
  onRepost,
  onComment,
  onMenu,
  onOpenProfile,
  onOpenDetail,
  formatTimeAgo,
}) => {
  const hasUserLiked = tweet.likedBy?.includes(currentUserId) || tweet.isLiked;
  const hasUserReposted = tweet.repostedBy?.includes(currentUserId);

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(tweet);
        }
      }}
      className="p-4 hover:bg-white/[0.02] cursor-pointer transition select-none border-b border-[#2F3336]"
    >
      {/* رأس الاقتباس أو إعادة النشر */}
      {tweet.isRepost && (
        <div className="flex items-center gap-2 text-xs font-bold text-[#71767B] mb-2 mr-12">
          {tweet.quote_text ? (
            <><MessageCircle size={14} className="text-[#1D9BF0]" /><span>{tweet.reposterName} اقتبس</span></>
          ) : (
            <><Repeat2 size={14} className="text-emerald-400" /><span>{tweet.reposterName} أعاد النشر</span></>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {/* الصورة الشخصية */}
        <button onClick={() => onOpenProfile(tweet.authorId || tweet.user_id, tweet)} className="shrink-0 self-start">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold">
            {tweet.authorAvatar ? (
              <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white">{tweet.authorName?.[0] || '؟'}</span>
            )}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          {/* الاسم والوقت */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span onClick={() => onOpenProfile(tweet.authorId || tweet.user_id, tweet)} className="font-bold text-white text-[15px] hover:underline cursor-pointer truncate">
                {tweet.authorName}
              </span>
              <span className="text-[#71767B] text-[14px] truncate">@{tweet.authorUsername}</span>
              <span className="text-[#71767B] text-[14px]">·</span>
              <span className="text-[#71767B] text-[13px]" title={tweet.createdAtDisplay || tweet.createdAt}>
                {formatTimeAgo(tweet.createdAt || tweet.created_at).relative}
              </span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onMenu(tweet); }} className="text-[#71767B] hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition shrink-0">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* النص والاقتباس */}
          {tweet.isRepost && tweet.quote_text ? (
            <div className="mt-1">
              <p className="text-[15px] leading-5 text-[#E7E9EA] whitespace-pre-wrap">{tweet.quote_text}</p>
              {tweet.original && (
                <div className="mt-2 border border-[#1a2331] rounded-xl p-3 hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                      {tweet.original.authorAvatar ? <img src={tweet.original.authorAvatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">{tweet.original.authorName?.[0]}</span>}
                    </div>
                    <span className="font-bold text-white text-xs">{tweet.original.authorName}</span>
                    <span className="text-[#71767B] text-[11px]">@{tweet.original.authorUsername}</span>
                  </div>
                  <p className="text-white text-sm whitespace-pre-wrap">{tweet.original.text}</p>
                  {tweet.original.image && <img src={tweet.original.image} alt="" className="w-full rounded-lg mt-2 max-h-48 object-cover" />}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 text-[15px] leading-5 text-[#E7E9EA] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{tweet.text}</p>
          )}

          {/* فيديو التغريدة العادية */}
          {!tweet.isRepost && (tweet.video_url || tweet.video) && (
            <div className="mt-3">
              <XVideoPlayer src={tweet.video_url || tweet.video} />
            </div>
          )}

          {/* صورة التغريدة العادية */}
          {!tweet.isRepost && tweet.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336]/30 max-h-96">
              <img src={tweet.image} alt="الصورة" className="w-full h-full object-cover" />
            </div>
          )}

          {/* الأزرار */}
          <div className="flex items-center justify-between mt-3 max-w-md text-[#71767B]">
            <button onClick={(e) => { e.stopPropagation(); onComment(tweet); }} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group">
              <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><MessageCircle size={16} /></div>
              <span className="text-[13px]">{tweet.replies || tweet.comments?.length || 0}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRepost(tweet); }} className={`flex items-center gap-1.5 transition group ${hasUserReposted ? 'text-emerald-400' : 'hover:text-emerald-400'}`}>
              <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10"><Repeat2 size={17} /></div>
              <span className="text-[13px]">{tweet.reposts || 0}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onLike(tweet.id); }} className={`flex items-center gap-1.5 transition group ${hasUserLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}>
              <div className="p-1.5 rounded-full group-hover:bg-rose-500/10"><Heart size={16} className={hasUserLiked ? 'fill-current' : ''} /></div>
              <span className="text-[13px]">{tweet.likes || 0}</span>
            </button>
            <button className="hover:text-[#1D9BF0] p-1.5 rounded-full transition hover:bg-[#1D9BF0]/10"><Share size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  );
};
