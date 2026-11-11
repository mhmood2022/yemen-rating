import React from 'react';

interface XActionBarProps {
  tweet: any;
  onReply?: (tweet: any) => void;
  onRepost?: (tweet: any) => void;
  onLike?: (tweet: any) => void;
  onBookmark?: (tweet: any) => void;
  onShare?: (tweet: any) => void;
  currentUserId?: string;
}

// تحويل الأرقام إلى العربية ونقطة ناعمة عند الصفر
const formatCountArabic = (count?: number) => {
  if (!count || count <= 0) return '·';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let str = count.toString();
  if (count >= 1000000) {
    str = (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'م';
  } else if (count >= 1000) {
    str = (count / 1000).toFixed(1).replace(/\.0$/, '') + 'ألف';
  }
  return str.replace(/[0-9]/g, (w) => arabicDigits[+w]);
};

// الحجم الرقيق الصغير الموحد لمنصة X
const iconStyle: React.CSSProperties = {
  width: '13.5px',
  height: '13.5px',
  minWidth: '13.5px',
  minHeight: '13.5px',
  display: 'block'
};

// 💬 فقاعة الرد الأصلية لتويتر (رقيقة وصغيرة 13.5px)
const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="currentColor">
    <path d="M1.751 10c0-4.42 3.584-8 8.001-8h4.496c4.417 0 8.001 3.58 8.001 8 0 3.297-1.988 6.16-4.887 7.382l.534 2.85c.08.43-.16.85-.56 1-.16.06-.33.09-.5.09-.27 0-.54-.11-.74-.31l-3.498-3.504c-.768.164-1.566.252-2.386.252-4.417 0-8.001-3.58-8.001-8zm8.001-6c-3.314 0-6 2.69-6 6 0 3.31 2.686 6 6 6 .802 0 1.58-.158 2.295-.457.406-.17.872-.07 1.176.244l2.039 2.043-.32-1.708c-.066-.352.062-.713.334-.949C17.279 13.568 18.25 11.87 18.25 10c0-3.31-2.69-6-6-6H9.752z" />
  </svg>
);

// 🔁 إعادة النشر الأصلية لتويتر (رقيقة وصغيرة 13.5px)
const RepostIcon = () => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="currentColor">
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
  </svg>
);

// ❤️ القلب الرقيق الأصلي لتويتر (رقيق وصغير 13.5px)
const HeartIcon = ({ isLiked }: { isLiked?: boolean }) => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="currentColor">
    {isLiked ? (
      <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
    ) : (
      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-2.415.11-4.3 2.11-4.3 4.6 0 2.23 1.25 4.3 3.393 6.08C8.38 17.84 10.74 19.38 12 20c1.26-.62 3.62-2.16 5.603-3.82 2.143-1.78 3.397-3.85 3.397-6.08 0-2.49-1.885-4.49-4.303-4.6zM2 10.1c0-3.53 2.76-6.4 6.27-6.57 1.84-.09 3.69.75 4.73 2.14 1.04-1.39 2.89-2.23 4.73-2.14 3.51.17 6.27 3.04 6.27 6.57 0 3.36-1.89 6.22-4.82 8.65-2.4 1.99-5.18 3.67-6.18 4.25-.33.19-.74.19-1.07 0-.99-.58-3.77-2.26-6.17-4.25C3.89 16.32 2 13.46 2 10.1z" />
    )}
  </svg>
);

// 📊 المشاهدات الأصلية لتويتر (رقيقة وصغيرة 13.5px)
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="currentColor">
    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10H6V21H4zm9.248 0v-7H15.25v7h-2.002z" />
  </svg>
);

// 🔖 الحفظ الأصلي لتويتر (رقيق وصغير 13.5px)
const BookmarkIcon = ({ isBookmarked }: { isBookmarked?: boolean }) => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="currentColor">
    {isBookmarked ? (
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z" />
    ) : (
      <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
    )}
  </svg>
);

// 📤 المشاركة الرسمية لتويتر (رقيقة وصغيرة 13.5px)
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="13.5" height="13.5" style={iconStyle} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
    <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
  </svg>
);

export const XActionBar: React.FC<XActionBarProps> = ({
  tweet,
  onReply,
  onRepost,
  onViewEngagements,
  onLike,
  onBookmark,
  onShare,
  currentUserId,
}) => {
  const isLiked = tweet.isLiked || tweet.liked || (tweet.likedBy && currentUserId && tweet.likedBy.includes(currentUserId));
  const isReposted = tweet.isReposted || tweet.retweeted || (tweet.repostedBy && currentUserId && tweet.repostedBy.includes(currentUserId));
  const isBookmarked = tweet.isBookmarked || tweet.bookmarked || (tweet.bookmarkedBy && currentUserId && tweet.bookmarkedBy.includes(currentUserId));

  const repliesCount = tweet.repliesCount ?? tweet.replies ?? 0;
  const repostsCount = tweet.retweetsCount ?? tweet.repostsCount ?? tweet.reposts ?? tweet.retweets ?? 0;
  const likesCount = tweet.likesCount ?? tweet.likes ?? 0;
  const viewsCount = tweet.viewsCount ?? tweet.views ?? 3;

  return (
    <div
      className="flex items-center justify-between text-[#71767B] w-full mt-2 mb-0 pb-0.5 px-0 select-none leading-none"
      dir="rtl"
    >
      {/* 💬 الرد */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReply && onReply(tweet);
        }}
        className="flex items-center gap-[1.5px] hover:text-[#1D9BF0] transition-colors group cursor-pointer p-0"
        title="رد"
      >
        <ReplyIcon />
        <span className="text-[10px] font-normal leading-none transition-colors group-hover:text-[#1D9BF0]">
          {formatCountArabic(repliesCount)}
        </span>
      </button>

      {/* 🔁 إعادة النشر */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRepost && onRepost(tweet);
        }}
        className={`flex items-center gap-[1.5px] transition-colors group cursor-pointer p-0 ${
          isReposted ? 'text-[#00BA7C]' : 'hover:text-[#00BA7C]'
        }`}
        title="إعادة نشر"
      >
        <RepostIcon />
        <span className="text-[10px] font-normal leading-none transition-colors group-hover:text-[#00BA7C]">
          {formatCountArabic(repostsCount)}
        </span>
      </button>

      {/* ❤️ الإعجاب */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike && onLike(tweet);
        }}
        className={`flex items-center gap-[1.5px] transition-colors group cursor-pointer p-0 ${
          isLiked ? 'text-[#F91880]' : 'hover:text-[#F91880]'
        }`}
        title="إعجاب"
      >
        <HeartIcon isLiked={isLiked} />
        <span className="text-[10px] font-normal leading-none transition-colors group-hover:text-[#F91880]">
          {formatCountArabic(likesCount)}
        </span>
      </button>

      {/* 📊 المشاهدات */}
      <button
        className="flex items-center gap-[1.5px] hover:text-[#1D9BF0] transition-colors group cursor-pointer p-0"
        title="المشاهدات"
      >
        <AnalyticsIcon />
        <span className="text-[10px] font-normal leading-none transition-colors group-hover:text-[#1D9BF0]">
          {formatCountArabic(viewsCount)}
        </span>
      </button>

      {/* 🔖 الحفظ و 📤 المشاركة متناسقة في أقصى اليسار */}
      <div className="flex items-center gap-3 p-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark && onBookmark(tweet);
          }}
          className={`hover:text-[#1D9BF0] transition-colors group cursor-pointer p-0 ${
            isBookmarked ? 'text-[#1D9BF0]' : ''
          }`}
          title="حفظ"
        >
          <BookmarkIcon isBookmarked={isBookmarked} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare && onShare(tweet);
          }}
          className="hover:text-[#1D9BF0] transition-colors group cursor-pointer p-0"
          title="مشاركة"
        >
          <ShareIcon />
        </button>
      </div>
    </div>
  );
};
