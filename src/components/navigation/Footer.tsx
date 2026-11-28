import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export const Footer: React.FC = () => {
  const { openAdminLogin } = useModal();
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const wasOfflineRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
      setJustReconnected(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    const onOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setJustReconnected(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setJustReconnected(false), 4000);
      }
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const footerBgClass = justReconnected
    ? 'bg-[#00BA7C] border-[#00BA7C] text-white'
    : !isOnline
      ? 'bg-[#202327] border-[#2F3336] text-white'
      : 'bg-black border-[#2F3336] text-[#A1A1AA]';

  return (
    <footer className={`w-full border-t py-6 px-4 lg:px-8 text-center text-xs mt-auto transition-colors duration-300 ${footerBgClass}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
        {justReconnected ? (
          <div className="flex items-center justify-center gap-2.5 font-extrabold text-sm text-white">
            <Wifi size={16} />
            <span>عاد الاتصال بالإنترنت</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>تحديث</span>
            </button>
          </div>
        ) : !isOnline ? (
          <div className="flex items-center justify-center gap-2 font-bold text-sm text-white">
            <WifiOff size={16} className="text-[#FFC500]" />
            <span>لا يوجد اتصال بالإنترنت</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <span>يمن ريتنج</span>
          <span className={justReconnected ? 'text-white/80' : 'text-[#71717A]'}>—</span>
          <span>Yemen Rating</span>
        </div>

        <p className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={openAdminLogin}
            className={`transition-colors font-bold cursor-pointer inline-flex items-center px-1 text-sm select-none ${
              justReconnected ? 'text-white hover:text-black' : 'hover:text-[#F5C400] text-[#A1A1AA]'
            }`}
            title="دخول الإدارة"
            aria-label="دخول الإدارة"
          >
            ©
          </button>
          <span>2026 يمن ريتنج — جميع الحقوق محفوظة</span>
        </p>
      </div>
    </footer>
  );
};
