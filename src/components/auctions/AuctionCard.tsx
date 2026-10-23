import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, MapPin, Heart, Tag, User, ShieldCheck, Clock } from 'lucide-react';

export const AuctionCard: React.FC<{ auction: any }> = ({ auction }) => {
  const isDirectSale = auction.sale_type === 'fixed_price';
  const isAuctionExpired = Boolean(
    auction.status === 'completed' ||
    auction.status === 'ended' ||
    auction.status === 'sold' ||
    (auction.end_date && new Date(auction.end_date).getTime() <= Date.now()) ||
    (auction.end_time && new Date(auction.end_time).getTime() <= Date.now())
  );
  const isCompleted = isAuctionExpired;
  const currentBid = Number(auction.current_bid || auction.starting_price || auction.final_price || 0);
  const startPrice = Number(auction.starting_price || 0);
  const currencyCode = auction.currency || 'SAR';
  const auctionNumber = auction.id ? auction.id.replace(/\D/g, '').slice(0, 5) || '10294' : '10294';

  const getImages = (auc: any): string[] => {
    if (!auc) return [];
    if (Array.isArray(auc.images) && auc.images.length > 0) return auc.images;
    if (typeof auc.images === 'string') {
      try {
        const parsed = JSON.parse(auc.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
      if (auc.images.startsWith('http') || auc.images.startsWith('data:')) {
        return auc.images.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (auc.image_url) return [auc.image_url];
    return [];
  };

  const images = getImages(auction);
  const mainImage = images[0] || null;

  let descriptionText = auction.description || '';
  if (descriptionText.startsWith('{')) {
    try {
      const p = JSON.parse(descriptionText);
      descriptionText = p.notes || p.description || Object.values(p).join(' - ');
    } catch {}
  }

  const calculateTimer = () => {
    const target = auction.end_date 
      ? new Date(auction.end_date).getTime() 
      : (new Date(auction.created_at || Date.now()).getTime() + (3 * 24 * 60 * 60 * 1000));
    const diff = target - Date.now();
    if (diff <= 0 || isCompleted) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isEnded: false
    };
  };

  const [timer, setTimer] = useState(calculateTimer);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTimer(calculateTimer()), 1000);
    return () => clearInterval(t);
  }, [auction.end_date, auction.created_at, isCompleted]);

  return (
    <div className={`flex flex-col bg-black border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 font-['Cairo'] text-white ${
      isCompleted ? 'border-[#2F3336] opacity-80' : 'border-[#2F3336] hover:border-[#F5C400]'
    }`}>
      <div className="relative w-full h-52 bg-[#111111] overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <Gavel size={36} className="text-[#F5C400]/30" />
            <span className="text-[11px] text-slate-500 font-bold">لا توجد صور مرفوعة</span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setIsFav(!isFav); }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black hover:bg-black  flex items-center justify-center text-white transition-colors z-10"
        >
          <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-white'} />
        </button>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black text-white border border-[#2F3336] text-[10px] font-mono font-bold ">
            رقم المزاد: #{auctionNumber}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            isCompleted ? 'bg-rose-950/90 text-rose-400 border border-rose-500/40' 
              : isDirectSale 
                ? 'bg-blue-900/90 text-blue-300 border border-blue-500/40' 
                : 'bg-[#F5C400] text-black font-black'
          }`}>
            {isCompleted ? 'منتهي' : isDirectSale ? 'بيع مباشر' : 'مزاد علني'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-[#111111] text-[#F5C400] border border-[#F5C400]/30">
                {auction.category || 'عام'}
              </span>
              {auction.seller_name && (
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  · {auction.seller_name}
                </span>
              )}
            </div>
            {auction.city && (
              <span className="inline-flex items-center gap-1 text-slate-300">
                <MapPin size={11} className="text-[#F5C400]" />
                <span>{auction.city}</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-black text-white line-clamp-1 leading-snug">
            {auction.title}
          </h3>

          {descriptionText && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-normal">
              {descriptionText}
            </p>
          )}

          {/* بيان شرط التأمين المتفق عليه في البطاقة */}
          {!isDirectSale && (
            <div className="mt-2 text-[11px] font-bold">
              {auction.deposit_required ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>تأمين الدخول: {Number(auction.deposit_amount).toLocaleString()} {currencyCode}</span>
                </span>
              ) : (
                <span className="text-slate-500">دخول المزاد: بدون تأمين مسبق</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#2F3336]/80 flex items-baseline justify-between">
          <span className="text-[11px] text-slate-400 font-bold">
            {isCompleted 
              ? 'السعر النهائي للرسو:' 
              : isDirectSale 
                ? 'السعر المطلوب للشراء:' 
                : (currentBid > startPrice ? 'أعلى مزايدة مسجلة:' : 'يبدأ المزاد من:')}
          </span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-[#F5C400]">
              {currentBid.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-sans font-bold">{currencyCode}</span>
          </div>
        </div>

        {!isDirectSale && (
          isCompleted ? (
            <div className="py-2 px-3 rounded-xl bg-[#111111] border border-[#2F3336] text-center text-xs font-bold text-slate-400">
              تم إغلاق المزاد وانتهاء فترة المزايدة
            </div>
          ) : (
            <div className="py-2 px-2 rounded-xl bg-[#111111] border border-[#2F3336] text-white grid grid-cols-4 gap-1 text-center font-mono">
              <div className="flex flex-col">
                <span className="font-black text-sm text-emerald-400">{timer.seconds}</span>
                <span className="text-[9px] font-sans text-slate-700 font-bold">ثانية</span>
              </div>
              <div className="flex flex-col border-r border-amber-300/80">
                <span className="font-black text-sm text-emerald-400">{timer.minutes}</span>
                <span className="text-[9px] font-sans text-slate-700 font-bold">دقيقة</span>
              </div>
              <div className="flex flex-col border-r border-amber-300/80">
                <span className="font-black text-sm text-emerald-400">{timer.hours}</span>
                <span className="text-[9px] font-sans text-slate-700 font-bold">ساعة</span>
              </div>
              <div className="flex flex-col border-r border-amber-300/80">
                <span className="font-black text-sm text-emerald-400">{timer.days}</span>
                <span className="text-[9px] font-sans text-slate-700 font-bold">يوم</span>
              </div>
            </div>
          )
        )}

        <Link
          to={`/auctions/${auction.id}`}
          className="w-full py-2.5 bg-[#111111] hover:bg-[#1E293B] border border-[#2F3336] hover:border-[#F5C400] text-white hover:text-[#F5C400] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{isDirectSale ? 'معاينة وشراء السلعة' : (isCompleted ? 'عرض تفاصيل المزاد المنتهي' : 'المعاينة والمشاركة بالمزاد')}</span>
        </Link>
      </div>
    </div>
  );
};
