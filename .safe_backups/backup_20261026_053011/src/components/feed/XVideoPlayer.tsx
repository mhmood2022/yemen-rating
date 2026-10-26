import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, X, Maximize } from 'lucide-react';

interface XVideoPlayerProps {
  src?: string | null;
  className?: string;
}

export const XVideoPlayer: React.FC<XVideoPlayerProps> = ({ src, className = '' }) => {
  // مشغل التغذية (Feed)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // مشغل النافذة المنبثقة (Modal)
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalPlaying, setIsModalPlaying] = useState<boolean>(false);
  const [isModalMuted, setIsModalMuted] = useState<boolean>(false);
  const [modalProgress, setModalProgress] = useState<number>(0);

  if (!src) return null;

  // -------------------------------------------------------------
  // منطق مشغل التغذية (Feed Video)
  // -------------------------------------------------------------
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Video play error:', err));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // -------------------------------------------------------------
  // منطق النافذة المنبثقة (Modal)
  // -------------------------------------------------------------
  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setIsModalOpen(true);
    setIsModalMuted(isMuted);

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

  const closeModal = useCallback(() => {
    const currentTime = modalVideoRef.current ? modalVideoRef.current.currentTime : 0;
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setIsModalPlaying(false);
    setIsModalOpen(false);

    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, []);

  // الاستماع لزر Escape لإغلاق النافذة وتنظيف المستمع عند الخروج
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const toggleModalPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleModalTimeUpdate = () => {
    if (!modalVideoRef.current) return;
    const current = modalVideoRef.current.currentTime;
    const total = modalVideoRef.current.duration || 1;
    setModalProgress((current / total) * 100);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalContainerRef.current) return;

    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen?.().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  return (
    <>
      {/* حاوية الفيديو داخل التغريدة */}
      <div
        onClick={openModal}
        className={`relative w-full max-h-[520px] bg-black rounded-[12px] overflow-hidden cursor-pointer select-none border border-[#2F3336] group shadow-sm ${className}`}
      >
        <video
          ref={videoRef}
          src={src}
          muted={isMuted}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="w-full max-h-[520px] object-contain mx-auto block rounded-[12px]"
        />

        {/* زر التشغيل الأوسط */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 backdrop-blur-[2px] border border-white/20 flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="تشغيل"
            >
              <Play className="w-[18px] h-[18px] fill-white text-white translate-x-0.5" />
            </button>
          </div>
        )}

        {/* زر الصوت أسفل اليمين */}
        {isPlaying && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/65 hover:bg-black/80 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition z-10"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* شريط التقدم السفلي */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30">
          <div
            className="h-full bg-[#1D9BF0] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* نافذة العرض الكبيرة المستقلة داخل الموقع (Modal) */}
      {isModalOpen && (
        <div
          ref={modalContainerRef}
          onClick={closeModal}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none"
          dir="rtl"
        >
          {/* شريط الأدوات العلوي */}
          <div className="flex items-center justify-between z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 flex items-center justify-center transition backdrop-blur-sm"
              title="إغلاق (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {document.fullscreenEnabled && (
              <button
                type="button"
                onClick={handleFullscreen}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 flex items-center justify-center transition backdrop-blur-sm"
                title="ملء الشاشة"
              >
                <Maximize className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* مساحة الفيديو المعروض مع الحفاظ على نسبته الأصلية */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center my-auto overflow-hidden max-h-[82vh]"
          >
            <video
              ref={modalVideoRef}
              src={src}
              muted={isModalMuted}
              playsInline
              preload="metadata"
              onTimeUpdate={handleModalTimeUpdate}
              onEnded={() => setIsModalPlaying(false)}
              onClick={toggleModalPlay}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain mx-auto block rounded-[12px] cursor-pointer"
            />

            {!isModalPlaying && (
              <button
                type="button"
                onClick={toggleModalPlay}
                className="absolute inset-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-2xl transition transform hover:scale-105 active:scale-95"
                title="تشغيل"
              >
                <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
              </button>
            )}
          </div>

          {/* شريط التحكم السفلي داخل النافذة المنبثقة */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-auto flex flex-col gap-2 p-2 bg-black/60 backdrop-blur-md rounded-[12px] border border-white/10 z-10"
          >
            {/* شريط التقدم */}
            <div className="w-full h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D9BF0] transition-all duration-100 ease-linear"
                style={{ width: `${modalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-white">
              <button
                type="button"
                onClick={toggleModalPlay}
                className="p-1.5 hover:text-[#1D9BF0] transition"
                title={isModalPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isModalPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleModalMute}
                className="p-1.5 hover:text-[#1D9BF0] transition"
                title={isModalMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isModalMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
