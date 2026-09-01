import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, Clock, ArrowRight, Plus, MapPin, 
  CheckCircle2, User, X, ShieldCheck, 
  MessageSquare, Send, ShoppingCart
} from 'lucide-react';
import { AuctionEntity } from '../../types/schema.types';
import { AuctionService } from '../../services/platformServices';
import { AdBanner } from '../../components/common/AdBanner';

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const AuctionDetailsPage: React.FC<{
  auctionData?: AuctionEntity;
  onBack?: () => void;
}> = ({
  auctionData = AuctionService.getDemoRecord(),
  onBack = () => window.history.back()
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [bidInput, setBidInput] = useState<number>((auctionData.current_bid || 0) + (auctionData.minimum_bid_increment || 500000));
  const [consentBidder, setConsentBidder] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(auctionData.time_left_seconds || 15000);

  const gallery = auctionData.media.filter(m => m.media_type === 'image');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentBidder) return;
    setToastMessage('تم تسجيل وتوثيق مزايدتك بنجاح');
    setConsentBidder(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="6" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للمزادات</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl">
        <div 
          className="relative h-56 sm:h-80 w-full bg-[#161619] overflow-hidden cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={gallery[activeImageIndex]?.file_url} alt={auctionData.title} className="w-full h-full object-cover" />
          <span className="absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-black bg-[#DC2626] text-white shadow-md">
            🔴 مزاد مباشر
          </span>
          <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/85 text-white text-xs font-mono border border-white/10 backdrop-blur-md">
            ⏳ الوقت المتبقي: {formatTimer(timeLeft)}
          </span>
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-1.5 p-2 bg-[#121215] border-t border-[#1F2937] overflow-x-auto no-scrollbar">
            {gallery.map((img, idx) => (
              <button key={img.id || idx} onClick={() => setActiveImageIndex(idx)} className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[#FFC500]' : 'border-transparent opacity-60'}`}>
                <img src={img.file_url} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">{auctionData.category_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-[#FFC500]" /> {auctionData.city_name}</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white leading-snug">{auctionData.title}</h1>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{auctionData.description}</p>
          </div>

          {/* صندوق السعر والمزايدة الحية */}
          <div className="bg-[#161619] p-4 rounded-2xl border border-[#27272A] space-y-3">
            <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
              <div>
                <span className="text-[11px] text-zinc-400 block font-bold">أعلى مزايدة حالية:</span>
                <div className="text-2xl font-mono font-black text-[#FFC500]">
                  {auctionData.current_bid?.toLocaleString()} <span className="text-xs">{auctionData.currency}</span>
                </div>
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-zinc-400 block font-['Cairo']">الابتدائي:</span>
                <b className="text-sm text-zinc-200">{auctionData.starting_price?.toLocaleString()} {auctionData.currency}</b>
              </div>
            </div>

            <form onSubmit={handlePlaceBid} className="space-y-2.5">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-bold">
                  مبلغ المزايدة القادمة ({auctionData.currency}) — الحد الأدنى للزيادة: +{auctionData.minimum_bid_increment?.toLocaleString()}
                </label>
                <input
                  type="number"
                  min={(auctionData.current_bid || 0) + (auctionData.minimum_bid_increment || 500000)}
                  value={bidInput}
                  onChange={(e) => setBidInput(Number(e.target.value))}
                  className="w-full bg-[#0F0F12] border border-[#27272A] focus:border-[#FFC500] rounded-xl p-2.5 text-base font-mono font-bold text-white outline-none"
                />
              </div>

              {/* الإقرار الإلزامي المعتمد بالخلفية الخضراء الشفافة */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-1.5 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs"><ShieldCheck size={15} /><span>تنبيه إلزامي:</span></div>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  بتأكيد المزايدة، يقرّ المزايد بموافقته على شروط المزاد، ويقرّ بأن المزايدة التي يقدمها ملزمة له في حال فوزه، ويلتزم بالسعر النهائي الذي ترسو عليه المزايدة وإتمام عملية الشراء.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={consentBidder} onChange={(e) => setConsentBidder(e.target.checked)} className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أوافق وأؤكد المزايدة</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!consentBidder}
                className="w-full py-3.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Gavel size={15} />
                <span>تأكيد المزايدة</span>
              </button>
            </form>
          </div>

          {/* سجل المزايدات اللحظي */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <User size={13} className="text-[#FFC500]" /> سجل المزايدات الحية
            </h3>
            <div className="space-y-1">
              {auctionData.bids_history.map((bid, i) => (
                <div key={bid.id || i} className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-[#FFC500] text-black font-black' : 'bg-[#0F0F12] text-zinc-400'}`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-white">{bid.bidder_code}</span>
                  </div>
                  <div className="text-left font-mono">
                    <b className={`text-xs ${i === 0 ? 'text-[#16A34A]' : 'text-zinc-300'}`}>{bid.amount.toLocaleString()} {auctionData.currency}</b>
                    <span className="text-[8.5px] text-zinc-500 block">{bid.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
