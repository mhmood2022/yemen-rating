import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [hasBottomNav, setHasBottomNav] = useState(false);
  const wasOfflineRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const syncNav = () => {
      const nav = document.querySelector('nav.fixed.bottom-0');
      const hidden = document.body.classList.contains('hide-bottom-nav');
      setHasBottomNav(Boolean(nav) && !hidden);
    };
    syncNav();
    const obs = new MutationObserver(syncNav);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

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

  if (isOnline && !justReconnected) return null;

  const bottomClass = hasBottomNav ? 'bottom-16' : 'bottom-0';

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 ${bottomClass} z-[60] w-full transition-all duration-300 ${
        !isOnline
          ? 'bg-[#202327] border-t border-[#2F3336] text-white'
          : 'bg-[#00BA7C] border-t border-[#00BA7C] text-white shadow-[0_-4px_20px_rgba(0,186,124,0.35)]'
      }`}
    >
      <div className="w-full max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-xs sm:text-sm">
        {!isOnline ? (
          <>
            <WifiOff size={15} className="text-[#FFC500] shrink-0" />
            <span className="font-bold">لا يوجد اتصال بالإنترنت</span>
          </>
        ) : (
          <>
            <Wifi size={15} className="text-white shrink-0" />
            <span className="font-extrabold">عاد الاتصال بالإنترنت</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold transition cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>تحديث</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
