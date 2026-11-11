import React, { useState } from 'react';

interface XImagePlayerProps {
  src: string;
  tweet: any;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  currentUserAvatar?: string;
  onClose: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onReply?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export const XImagePlayer: React.FC<XImagePlayerProps> = ({
  src,
  tweet,
  authorName,
  authorUsername,
  authorAvatar,
  currentUserAvatar,
  onClose,
  onLike,
  onRepost,
  onReply,
  onBookmark,
  onShare,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(
    tweet?.likedBy?.includes(tweet?.currentUserId) || tweet?.isLiked || false
  );
  const [likesCount, setLikesCount] = useState<number>(tweet?.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(tweet?.isBookmarked || false);

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `x-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = src;
      link.target = '_blank';
      link.download = `image-${Date.now()}.jpg`;
      link.click();
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    if (onLike) onLike();
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between select-none overflow-hidden"
      dir="rtl"
      onClick={() => {
        setShowControls(prev => !prev);
        if (showMenu) setShowMenu(false);
      }}
    >
      {/* 🔝 1. الشريط العلوي: لون #192227 مع سهم يشير لليمين -> */}
      <div 
        className={`w-full pt-4 pb-2 px-4 flex items-center justify-between z-50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* سهم الرجوع يشير لليمين (→) كما رسمت بالسهم الأحمر تماماً */}
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center text-white border border-white/5 shadow-md"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"></path>
          </svg>
        </button>

        {/* زر الثلاث نقاط في اليسار بلون #192227 */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="w-11 h-11 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center text-white border border-white/5 shadow-md"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white">
              <path d="M12 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z"></path>
            </svg>
          </button>

          {/* قائمة حفظ الصورة */}
          {showMenu && (
            <div 
              className="absolute left-0 top-13 bg-[#192227] text-white rounded-[14px] p-2 shadow-2xl border border-white/10 min-w-[125px] flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDownloadImage}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-[10px] transition"
              >
                <span>حفظ</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-white">
                  <path d="M12 16.5l-5-5h3V4h4v7.5h3l-5 5zm-8 2h16v2H4v-2z"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🖼️ 2. منطقة الصورة الكاملة */}
      <div className="absolute inset-0 flex items-center justify-center w-full h-full p-0 z-0 bg-black">
        <img
          src={src}
          alt=""
          className="w-full h-auto max-h-screen object-contain"
          style={{ maxHeight: '100vh' }}
        />
      </div>

      {/* 🔻 3. الشريط السفلي: لون #192227 والأيقونات الحقيقية بالملي */}
      <div 
        className={`w-full px-4 pt-6 pb-4 flex flex-col gap-3.5 z-50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* معلومات الناشر (الأفاتار، الاسم، الشارة، المعرف) */}
        <div className="flex items-center gap-2.5">
          <img
            src={authorAvatar || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
            alt=""
            className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
          />
          <div className="flex flex-col text-right overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-[15px] truncate">{authorName || 'مستخدم'}</span>
              <svg className="w-4 h-4 text-[#1D9BF0] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.7 3.7l-3.3-3.3 1.4-1.4 1.9 1.9 5.3-5.3 1.4 1.4-6.7 6.7z" />
              </svg>
            </div>
            <span className="text-[13px] text-[#71767B]" dir="ltr">@{authorUsername || 'user'}</span>
          </div>
        </div>

        {/* نص المنشور */}
        {tweet?.text && (
          <p className="text-white text-[14.5px] leading-snug max-h-24 overflow-y-auto whitespace-pre-line text-right">
            {tweet.text}
          </p>
        )}

        {/* 🔘 أزرار التفاعل الحقيقية بلون خلفية #192227 بدقة */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* كبسولة الرد */}
          <button 
            onClick={(e) => { e.stopPropagation(); if (onReply) onReply(); }}
            className="flex-1 py-1.5 px-3 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center gap-1.5 text-white"
          >
            <span className="text-[13px] font-bold">{tweet?.comments?.length || tweet?.replies_count || 0}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-white">
              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-1.144.63v3.46c0 .41-.336.75-.75.75-.15 0-.297-.05-.422-.14l-4.52-3.36h-1.66c-4.421 0-8.005-3.58-8.005-8zm8.005-6c-3.317 0-6.005 2.69-6.005 6s2.688 6 6.005 6h2.094c.2 0 .391.07.54.2l3.356 2.5v-2.07c0-.41.336-.75.75-.75h.211c2.474 0 4.484-2.01 4.484-4.48 0-3.38-2.748-6.13-6.129-6.13H9.756z"></path>
            </svg>
          </button>

          {/* كبسولة إعادة النشر */}
          <button 
            onClick={(e) => { e.stopPropagation(); if (onRepost) onRepost(); }}
            className="flex-1 py-1.5 px-3 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center gap-1.5 text-white"
          >
            <span className="text-[13px] font-bold">{tweet?.reposts || 0}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-white">
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
            </svg>
          </button>

          {/* كبسولة الإعجاب الحقيقية (قلب X) */}
          <button 
            onClick={handleLikeClick}
            className={`flex-1 py-1.5 px-3 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center gap-1.5 ${
              isLiked ? 'text-[#F91880]' : 'text-white'
            }`}
          >
            <span className="text-[13px] font-bold">{likesCount}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`w-[18px] h-[18px] ${isLiked ? 'fill-[#F91880]' : 'fill-none stroke-white stroke-[2]'}`}>
              <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.511 6.67z"></path>
            </svg>
          </button>

          {/* دائرة الحفظ الحقيقية (Bookmark) */}
          <button 
            onClick={handleBookmarkClick}
            className={`w-10 h-10 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center shrink-0 ${
              isBookmarked ? 'text-[#1D9BF0]' : 'text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-[#1D9BF0]' : 'fill-none stroke-white stroke-[2]'}`}>
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v17.27l-8-4.57-8 4.57V4.5z"></path>
            </svg>
          </button>

          {/* دائرة المشاركة الحقيقية كما رسمت بالضبط */}
          <button 
            onClick={(e) => { e.stopPropagation(); if (onShare) onShare(); }}
            className="w-10 h-10 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center shrink-0 text-white"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-none stroke-white stroke-[2]">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13"></path>
            </svg>
          </button>
        </div>

        {/* شريط نشر ردّك السفلي */}
        <div 
          onClick={(e) => { e.stopPropagation(); if (onReply) onReply(); }}
          className="flex items-center justify-between bg-[#111417]/95 border border-white/10 rounded-full px-3.5 py-2 cursor-pointer hover:border-white/25 transition mt-1 shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <img 
              src={currentUserAvatar || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'} 
              alt="" 
              className="w-6 h-6 rounded-full object-cover shrink-0" 
            />
            <span className="text-[13px] text-[#71767B]">نشر ردّك</span>
          </div>

          <div className="flex items-center gap-3 text-white/60">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
              <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13z"></path>
            </svg>
            <span className="text-[10px] font-bold border border-white/40 px-1 py-0.5 rounded leading-none">GIF</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
              <path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 4h-4v2h6v-6h-2v4z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
