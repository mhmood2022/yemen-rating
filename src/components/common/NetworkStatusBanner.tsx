import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const wasOfflineRef = useRef<boolean>(false);
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
        timerRef.current = window.setTimeout(() => setJustReconnected(false), 3500);
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

  return (
    <div dir="rtl" className="fixed bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 z-[99990] pointer-events-none px-3 w-full max-w-md flex justify-center">
      {!isOnline ? (
        <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#16181C]/95 border border-[#2F3336] backdrop-blur-md shadow-2xl text-xs text-white">
          <WifiOff size={14} className="text-[#FFC500] shrink-0" />
          <span className="font-bold">لا يوجد اتصال بالإنترنت</span>
        </div>
      ) : (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0A1F14]/95 border border-emerald-500/35 backdrop-blur-md shadow-2xl text-xs text-white">
          <Wifi size={14} className="text-emerald-400 shrink-0" />
          <span className="font-bold text-emerald-300">عاد الاتصال بالإنترنت</span>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition cursor-pointer">
            <RefreshCw size={11} /><span>تحديث</span>
          </button>
        </div>
      )}
    </div>
  );
};
