import React, { useRef, useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, ArrowRight, MoreHorizontal, Heart, 
  MessageCircle, Repeat2, Bookmark, Share2, Image as ImageIcon, Maximize2 
} from 'lucide-react';

export interface XVideoPlayerProps {
  src?: string | null;
  className?: string;
  tweet?: any;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  content?: string;
  likesCount?: number;
  repostsCount?: number;
  commentsCount?: number;
  currentUserAvatar?: string;
  onLike?: () => void;
  onRepost?: () => void;
  onReply?: () => void;
  onShare?: () => void;
}

export const XVideoPlayer: React.FC<XVideoPlayerProps> = ({ 
  src, 
  className = '',
  tweet,
  authorName: propAuthorName,
  authorUsername: propAuthorUsername,
  authorAvatar: propAuthorAvatar,
  content: propContent,
  likesCount: propLikesCount,
  repostsCount: propRepostsCount,
  commentsCount: propCommentsCount,
  currentUserAvatar,
  onLike,
  onRepost,
  onReply,
  onShare
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalPlaying, setIsModalPlaying] = useState<boolean>(false);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  if (!src) return null;

  const finalAuthorName = propAuthorName || tweet?.authorName || tweet?.userName || tweet?.original?.authorName || 'مستخدم';
  const finalAuthorUsername = propAuthorUsername || tweet?.authorUsername || tweet?.userUsername || tweet?.original?.authorUsername || 'user';
  const finalAuthorAvatar = propAuthorAvatar || tweet?.authorAvatar || tweet?.userAvatar || tweet?.original?.authorAvatar || '';
  const finalContent = propContent || tweet?.content || tweet?.text || tweet?.original?.text || '';
  const finalLikes = propLikesCount ?? tweet?.likes_count ?? tweet?.likes ?? 0;
  const finalReposts = propRepostsCount ?? tweet?.reposts_count ?? tweet?.reposts ?? 0;
  const finalComments = propCommentsCount ?? tweet?.comments_count ?? tweet?.comments ?? 0;

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setIsModalOpen(true);
    setIsModalMuted(isMuted);
    setShowControls(true);

    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.currentTime = currentTime;
        modalVideoRef.current
          .play()
          .then(() => setIsModalPlaying(true))
          .catch(() => setIsModalPlaying(false));
      }
    }, 50);
  };

  const closeModal = () => {
    const currentTime = modalVideoRef.current ? modalVideoRef.current.currentTime : 0;
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setIsModalPlaying(false);
    setIsModalOpen(false);
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const toggleModalPlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!modalVideoRef.current) return;
    if (isModalPlaying) {
      modalVideoRef.current.pause();
      setIsModalPlaying(false);
    } else {
      modalVideoRef.current
        .play()
        .then(() => setIsModalPlaying(true))
        .catch((err) => console.error('Modal play error:', err));
    }
  };

  const toggleModalMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !isModalMuted;
    setIsModalMuted(!isModalMuted);
  };

  const handleToggleControls = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowControls((prev) => !prev);
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeModal();
    if (onReply) {
      onReply();
    }
  };

  return (
    <>
      {/* 1. حاوية الفيديو في التغذية */}
      <div
        onClick={openModal}
        className={`relative w-full max-h-[520px] bg-black rounded-[14px] overflow-hidden cursor-pointer select-none border border-[#2F3336]/30 group shadow-sm ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          muted={isMuted}
          playsInline
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
          className="w-full max-h-[520px] object-contain mx-auto block rounded-[14px]"
        />

        {!isPlaying && (
          <div
            onClick={openModal}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <button
              type="button"
              onClick={openModal}
              className="w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 hover:scale-105 select-none"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.62)', boxShadow: '0 4px 14px rgba(0,0,0,0.45)' }}
              title="تشغيل"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full block">
                <polygon points="35,23.5 78,50 35,76.5" fill="#ffffff" />
              </svg>
            </button>
          </div>
        )}

        {isPlaying && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/65 hover:bg-black/80 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition z-10"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        )}
      </div>

      {/* 2. مشغل وسائط X الكامل */}
      {isModalOpen && (
        <div
          ref={modalContainerRef}
          onClick={handleToggleControls}
          className="fixed inset-0 z-[300] bg-black select-none overflow-hidden flex flex-col justify-between"
          dir="rtl"
        >
          {/* الهيدر العلوي */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-0 left-0 right-0 z-40 p-3 sm:p-4 flex items-center justify-between transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* زر الرجوع على اليمين */}
            <button
              type="button"
              onClick={closeModal}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            {/* زر الخيارات على اليسار */}
            <button
              type="button"
              onClick={() => {}}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md"
              title="خيارات"
            >
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* مساحة الفيديو بكامل عرض الشاشة (Edge-to-Edge) */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <video
              ref={modalVideoRef}
              src={src}
              muted={isModalMuted}
              playsInline
              preload="metadata"
              onEnded={() => setIsModalPlaying(false)}
              className="w-full h-full object-contain mx-auto block cursor-pointer"
            />

            {/* زر التشغيل في المنتصف عند الإيقاف */}
            {!isModalPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModalPlay(e);
                }}
                className="absolute inset-auto w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 hover:scale-105 select-none z-30"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.62)", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}
                title="تشغيل"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full block">
                  <polygon points="35,23.5 78,50 35,76.5" fill="#ffffff" />
                </svg>
              </button>
            )}

            {/* زر كتم الصوت */}
            {isModalPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModalMute(e);
                }}
                className={`absolute bottom-40 left-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title={isModalMuted ? 'تشغيل الصوت' : 'كتم'}
              >
                {isModalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* الطبقة السفلية: بيانات الناشر + النص + كبسولات التفاعل من اليمين لليسار */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-3 px-3 flex flex-col gap-2.5 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* شريط الكاتب فوق النص مباشرة بدون أي تداخل */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/20 overflow-hidden shrink-0 shadow-md">
                {finalAuthorAvatar ? (
                  <img src={finalAuthorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {finalAuthorName?.[0] || '؟'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-[14.5px] leading-tight">
                    {finalAuthorName}
                  </span>
                  <svg viewBox="0 0 22 22" className="w-[15px] h-[15px] fill-[#1D9BF0] shrink-0">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.136 5.378-5.379 1.302 1.293-6.68 6.68z" />
                  </svg>
                </div>
                <span className="text-[#8B98A5] text-[12px] font-normal" dir="ltr">
                  @{finalAuthorUsername}
                </span>
              </div>
            </div>

            {/* نص التغريدة */}
            {finalContent && (
              <div className="px-2">
                <p className="text-white text-[13.5px] leading-relaxed line-clamp-2 select-text font-normal drop-shadow">
                  {finalContent}
                </p>
              </div>
            )}

            {/* أزرار التفاعل مرتبة من اليمين إلى اليسار بنمط تويتر العربي الأصلي */}
            <div className="flex items-center justify-between px-1 text-[#71767B]">
              {/* 1. أقصى اليمين: زر التعليق */}
              <button 
                type="button" 
                onClick={handleReplyClick}
                className="h-9 px-3.5 rounded-full bg-[#16181C]/90 hover:bg-[#202327] flex items-center gap-1.5 text-white/90 hover:text-sky-500 transition text-xs font-bold border border-white/5"
                title="الردود"
              >
                <MessageCircle className="w-4 h-4 text-white/80" />
                <span>{finalComments > 0 ? (finalComments >= 1000 ? (finalComments/1000).toFixed(1) + 'K' : finalComments) : ''}</span>
              </button>

              {/* 2. إعادة النشر */}
              <button 
                type="button" 
                onClick={onRepost}
                className="h-9 px-3.5 rounded-full bg-[#16181C]/90 hover:bg-[#202327] flex items-center gap-1.5 text-white/90 hover:text-emerald-500 transition text-xs font-bold border border-white/5"
                title="إعادة النشر"
              >
                <Repeat2 className="w-4 h-4 text-white/80" />
                <span>{finalReposts > 0 ? (finalReposts >= 1000 ? (finalReposts/1000).toFixed(1) + 'K' : finalReposts) : ''}</span>
              </button>

              {/* 3. الإعجاب */}
              <button 
                type="button" 
                onClick={onLike}
                className="h-9 px-3.5 rounded-full bg-[#16181C]/90 hover:bg-[#202327] flex items-center gap-1.5 text-white/90 hover:text-rose-500 transition text-xs font-bold border border-white/5"
                title="الإعجاب"
              >
                <Heart className="w-4 h-4 text-white/80" />
                <span>{finalLikes > 0 ? (finalLikes >= 1000 ? (finalLikes/1000).toFixed(1) + 'K' : finalLikes) : ''}</span>
              </button>

              {/* 4. الحفظ */}
              <button 
                type="button" 
                className="w-10 h-10 rounded-full bg-[#16181C]/90 hover:bg-[#202327] flex items-center justify-center text-white/80 hover:text-white transition border border-white/5"
                title="حفظ"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* 5. أقصى اليسار: المشاركة */}
              <button 
                type="button" 
                onClick={onShare}
                className="w-10 h-10 rounded-full bg-[#16181C]/90 hover:bg-[#202327] flex items-center justify-center text-white/80 hover:text-white transition border border-white/5"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* شريط الرد السفلي "نشر ردّك" */}
            <div 
              onClick={handleReplyClick}
              className="bg-[#16181C] rounded-full border border-[#2F3336] px-3.5 py-2 flex items-center justify-between shadow-lg cursor-pointer hover:border-white/30 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden border border-white/20 shrink-0">
                  {currentUserAvatar ? (
                    <img src={currentUserAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white text-[11px]">👤</span>
                  )}
                </div>
                <span className="text-[#71767B] text-xs">نشر ردّك</span>
              </div>

              <div className="flex items-center gap-3 text-white/60">
                <button type="button" className="hover:text-white transition"><ImageIcon className="w-4 h-4" /></button>
                <button type="button" className="hover:text-white transition text-[10px] font-bold border border-white/40 rounded px-1">GIF</button>
                <button type="button" className="hover:text-white transition"><Maximize2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
