import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share2 } from 'lucide-react';

interface XActionBarProps {
  tweet: any;
  onReply?: (tweet: any) => void;
  onRepost?: (tweet: any) => void;
  onLike?: (tweet: any) => void;
  onBookmark?: (tweet: any) => void;
  onShare?: (tweet: any) => void;
  currentUserId?: string;
}

export const XActionBar: React.FC<XActionBarProps> = ({ tweet, onReply, onRepost, onLike, onBookmark, onShare, currentUserId }) => {
  const isLiked = tweet.likedBy?.includes(currentUserId);
  
  return (
    <div className="flex items-center justify-between text-[#71767B] w-full max-w-md mt-2.5 px-1 select-none" dir="ltr">
      {/* 💬 الردود */}
      <button onClick={(e) => { e.stopPropagation(); onReply && onReply(tweet); }} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
          <MessageCircle size={15} />
        </div>
        <span className="text-[11px]">{tweet.repliesCount || tweet.replies || 0}</span>
      </button>

      {/* 🔁 إعادة النشر */}
      <button onClick={(e) => { e.stopPropagation(); onRepost && onRepost(tweet); }} className="flex items-center gap-1.5 hover:text-[#00BA7C] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10">
          <Repeat2 size={15} />
        </div>
        <span className="text-[11px]">{tweet.retweetsCount || tweet.reposts || 0}</span>
      </button>

      {/* ❤️ الإعجاب */}
      <button onClick={(e) => { e.stopPropagation(); onLike && onLike(tweet); }} className={`flex items-center gap-1.5 transition group ${isLiked ? 'text-[#F91880]' : 'hover:text-[#F91880]'}`}>
        <div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10">
          <Heart size={15} className={isLiked ? 'fill-current text-[#F91880]' : ''} />
        </div>
        <span className="text-[11px]">{tweet.likesCount || tweet.likes || 0}</span>
      </button>

      {/* 📊 المشاهدات */}
      <button className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
          <BarChart2 size={15} />
        </div>
        <span className="text-[11px]">{tweet.viewsCount || tweet.views || 1}</span>
      </button>

      {/* 🔖 حفظ */}
      <button onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(tweet); }} className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group" title="حفظ">
        <Bookmark size={15} />
      </button>

      {/* 📤 مشاركة */}
      <button onClick={(e) => { e.stopPropagation(); onShare && onShare(tweet); }} className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group" title="مشاركة">
        <Share2 size={15} />
      </button>
    </div>
  );
};
