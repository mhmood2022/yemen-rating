import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X,  
  ArrowRight, MapPin, Gavel, FileText, Shield, 
  CheckCircle2, AlertCircle, Phone, MessageCircle,
  Tag, ShieldCheck, Scale, Award, Clock, User
 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminAuctionsService } from '../../services/adminService';

export const AuctionDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params.id || window.location.pathname.split('/').filter(Boolean).pop();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<any>(null);
  
;
  const [loading, setLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!images || images.length <= 1) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      setActiveImgIdx((prev: number) => (prev + 1) % images.length);
    } else if (diff < -45) {
      setActiveImgIdx((prev: number) => (prev - 1 + images.length) % images.length);
    }
  };


  // سجل المزايدات الحية
  const [bids, setBids] = useState<any[]>([]);

  // حقول المزايد والمشتري الحقيقية
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [bidderName, setBidderName] = useState('');
  const [bidderPhone, setBidderPhone] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  // تجميد تمرير الصفحة بنسبة 100% ومنع حركة اللمس خلف الصورة
  useEffect(() => {
    if (isZoomOpen) {
      const preventTouch = (e: TouchEvent) => {
        // منع التمرير في الخلفية تماماً
        e.preventDefault();
      };

      document.body.classList.add('modal-freeze-lock');
      document.documentElement.classList.add('modal-freeze-lock');
      window.addEventListener('touchmove', preventTouch, { passive: false });

      return () => {
        document.body.classList.remove('modal-freeze-lock');
        document.documentElement.classList.remove('modal-freeze-lock');
        window.removeEventListener('touchmove', preventTouch);
      };
    }
  }, [isZoomOpen]);

  const [showAllBids, setShowAllBids] = useState(false);
  const [showCommissionInfo, setShowCommissionInfo] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          let uPhone = user.phone || user.user_metadata?.phone || '';
          try {
            const { data: prof } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle();
            if (prof?.full_name) setBidderName(prof.full_name);
            else if (metaName) setBidderName(metaName);
            if (prof?.phone) uPhone = prof.phone;
          } catch(e) {
            if (metaName) setBidderName(metaName);
          }
          if (uPhone) setBidderPhone(uPhone.replace(/\D/g, '').slice(-9));
        }
      } catch(e) {}
    };
    fetchUserData();
  }, []);
  const [bidderEmail, setBidderEmail] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidInlineMsg, setBidInlineMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [buyerConsented, setBuyerConsented] = useState(false);
  const [buyerCommissionRate, setBuyerCommissionRate] = useState(5);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('auctions').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      setAuction(data);
      const cur = Number(data?.current_bid || data?.starting_price || 0);
      const step = Number(data?.min_increment || 500);
      setBidAmount(cur + step);

      // جلب سجل المزايدات الحقيقي من Supabase
      const { data: bidsData } = await supabase
        .from('auction_bids')
        .select('*')
        .eq('auction_id', String(id))
        .order('created_at', { ascending: false });
      if (bidsData) setBids(bidsData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  
  // جلب إيميل وهاتف واسم المستخدم المسجل تلقائياً
  useEffect(() => {
    const loadLoggedInUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.email) setBidderEmail(user.email);
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          if (fullName) setBidderName(fullName);

          let phone = user.phone || user.user_metadata?.phone || '';
          try {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (prof) {
              if (prof.full_name && !fullName) setBidderName(prof.full_name);
              if (prof.phone || prof.phone_number) phone = prof.phone || prof.phone_number;
            }
          } catch {}

          if (phone) setBidderPhone(phone.replace(/\D/g, '').slice(-9));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadLoggedInUser();
  }, []);

  useEffect(() => {
    fetchDetails();
    // جلب نسبة عمولة المشتري الحقيقية من Supabase
    supabase.from('platform_commission_settings').select('buyer_commission_rate').limit(1).maybeSingle().then(({ data }) => {
      if (data?.buyer_commission_rate) {
        setBuyerCommissionRate(Number(data.buyer_commission_rate));
      }
    });
  }, [id]);

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
  const isDirectSale = auction?.sale_type === 'fixed_price';
  const isAuctionExpired = Boolean(
    auction?.status === 'completed' ||
    auction?.status === 'ended' ||
    auction?.status === 'sold' ||
    (auction?.end_date && new Date(auction.end_date).getTime() <= Date.now()) ||
    (auction?.end_time && new Date(auction.end_time).getTime() <= Date.now())
  );
  const isCompleted = isAuctionExpired;

  
  // دالة تشفير هوية المزايد لحفظ الخصوصية في الموقع العام
  const getMaskedBidderCode = (bid: any) => {
    if (bid.bidder_code) return bid.bidder_code;
    if (bid.bidder_phone) {
      const clean = bid.bidder_phone.replace(/\D/g, '');
      return `مزايد #***${clean.slice(-4)}`;
    }
    if (bid.id) {
      return `مزايد #${String(bid.id).slice(0, 4).toUpperCase()}`;
    }
    return 'مزايد معتمد';
  };

  // التحقق إن كانت السومة تخص المتصفح الحالي لتمييزها له فقط
  const isMyOwnBid = (bid: any) => {
    if (!bidderPhone && !bidderEmail) return false;
    if (bidderPhone && bid.bidder_phone && bid.bidder_phone.replace(/\D/g, '') === bidderPhone.replace(/\D/g, '')) return true;
    if (bidderEmail && bid.bidder_email && bid.bidder_email === bidderEmail) return true;
    return false;
  };

  const getDescriptionText = (auc: any): string => {
    if (!auc?.description) return 'لا توجد تفاصيل إضافية مسجلة.';
    let desc = auc.description;
    if (desc.startsWith('{')) {
      try {
        const p = JSON.parse(desc);
        return p.notes || p.description || Object.entries(p).map(([k, v]) => `${k}: ${v}`).join('\n');
      } catch {}
    }
    return desc;
  };

  const calculateTimer = () => {
    const target = auction?.end_date 
      ? new Date(auction.end_date).getTime() 
      : (new Date(auction?.created_at || Date.now()).getTime() + (3 * 24 * 60 * 60 * 1000));
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

  useEffect(() => {
    const t = setInterval(() => setTimer(calculateTimer()), 1000);
    return () => clearInterval(t);
  }, [auction, isCompleted]);

  // إرسال المزايدة أو الشراء المباشر مع تسجيل الاسم ورقم الهاتف في Supabase
  const handlePlaceBidOrBuy = async (e: React.FormEvent, isBuyDirect: boolean = false) => {
    e.preventDefault();
    if (!auction || isCompleted) return;

    if (!bidderName.trim() || bidderPhone.replace(/\D/g, '').length !== 9) {
      setBidInlineMsg({ type: 'error', text: 'يرجى إدخال اسمك ورقم هاتفك (9 أرقام بالضبط) للتواصل وتأكيد المعاملة' });
      setTimeout(() => setBidInlineMsg(null), 4000);
      return;
    }

    if (!buyerConsented) {
      setBidInlineMsg({ type: 'error', text: 'يرجى الموافقة على إقرار المزاد وتكاليف عمولة المنصة أولاً' });
      setTimeout(() => setBidInlineMsg(null), 4000);
      return;
    }

    const current = Number(auction.current_bid || auction.starting_price || 0);
    const amountToRegister = isBuyDirect ? current : Number(bidAmount);
    const minRequired = current + Number(auction.min_increment || 500);

    if (!isBuyDirect && amountToRegister < minRequired) {
      setBidInlineMsg({ type: 'error', text: `يجب أن تكون السومة أعلى بمقدار الحد الأدنى للزيادة (${minRequired.toLocaleString()} ${currencyCode})` });
      setTimeout(() => setBidInlineMsg(null), 4000);
      return;
    }

    try {
      setSubmittingBid(true);

      // 1. تسجيل السومة في جدول auction_bids بالاسم ورقم الهاتف
      const { data: { user } } = await supabase.auth.getUser();

      const bidRecord: any = {
        auction_id: String(auction.id),
        bidder_id: user?.id || null,
        bidder_name: bidderName.trim() || 'مزايد معتمد',
        bidder_phone: bidderPhone.trim(),
        bidder_code: `مزايد #${(bidderPhone.slice(-4) || '1029')}`,
        bid_amount: amountToRegister,
        bid_type: isBuyDirect ? 'direct_buy' : 'bid',
        status: 'valid',
        created_at: new Date().toISOString()
      };

      // إضافة الإيميل إن وجد
      if (bidderEmail && bidderEmail.trim() && bidderEmail !== 'غير مسجل') {
        bidRecord.bidder_email = bidderEmail.trim();
      }

      let { error: insertErr } = await supabase.from('auction_bids').insert([bidRecord]);

      // حزام أمان ذكي: إذا كان خادم Supabase لم يحدّث كاش الـ bidder_email بعد، نعيد الإدراج فوراً بدونه لضمان نجاح السومة وعدم ظهور أي خطأ
      if (insertErr && (insertErr.message?.includes('bidder_email') || insertErr.message?.includes('schema cache'))) {
        delete bidRecord.bidder_email;
        const retry = await supabase.from('auction_bids').insert([bidRecord]);
        insertErr = retry.error;
      }

      if (insertErr) throw insertErr;

      // 2. تحديث السعر الحالي في جدول auctions إن كانت مزايدة
      if (!isBuyDirect) {
        await supabase.from('auctions').update({ current_bid: amountToRegister }).eq('id', auction.id);
        setAuction((prev: any) => ({ ...prev, current_bid: amountToRegister }));
        const nextStep = Number(auction.min_increment || 500);
        setBidAmount(amountToRegister + nextStep);
      }

      setBids((prev) => [bidRecord, ...prev]);
      setBidInlineMsg({
        type: 'success',
        text: isBuyDirect 
          ? 'تم تأكيد وتسجيل طلب الشراء بنجاح! سيتم التواصل معك فوراً من الإدارة لإتمام التسليم.'
          : 'تم تسجيل مزايدتك بنجاح برمز مشفر لحفظ خصوصيتك، وحفظ بيانات التواصل للإدارة فقط.'
      });
      setTimeout(() => setBidInlineMsg(null), 5000);

    } catch (err: any) {
      setBidInlineMsg({ type: 'error', text: err.message || 'خطأ أثناء تسجيل المعاملة' });
    } finally {
      setSubmittingBid(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 font-['Cairo'] text-white">
        <div className="w-10 h-10 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-300">جاري تحميل بيانات المزاد...</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div dir="rtl" className="max-w-md mx-auto my-12 p-6 text-center bg-black border border-[#2F3336] rounded-2xl text-white">
        <AlertCircle size={40} className="text-[#F5C400] mx-auto mb-2" />
        <p className="font-bold">المعروض غير موجود أو تم إغلاقه</p>
        <button onClick={() => navigate('/auctions')} className="mt-3 px-4 py-2 bg-[#F5C400] text-black font-black text-xs rounded-xl cursor-pointer">
          العودة للمزادات
        </button>
      </div>
    );
  }

  const auctionNumber = auction.id ? auction.id.replace(/\D/g, '').slice(0, 5) || '37492' : '37492';
  const currentBid = Number(auction.current_bid || auction.starting_price || auction.final_price || 0);
  const minIncrement = Number(auction.min_increment || 500);
  const minNextBid = currentBid + minIncrement;
  const currencyCode = auction.currency || 'SAR';
  const descriptionText = getDescriptionText(auction);

  const directItemPrice = Number(currentBid);
  const directCommAmount = Math.round(directItemPrice * (buyerCommissionRate / 100));
  const directTotalRequired = directItemPrice + directCommAmount;

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white bg-black min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-[#2F3336] text-[#F5C400] text-xs font-bold cursor-pointer"
      >
        <ArrowRight size={14} />
        <span>الرجوع إلى قائمة المزادات</span>
      </button>

      {/* معرض الصور */}
      <div className="bg-black border border-[#2F3336] rounded-2xl p-3.5 space-y-3">
        <div onClick={() => setIsZoomOpen(true)} className="relative w-full h-72 sm:h-96 bg-[#111111] rounded-xl overflow-hidden border border-[#2F3336] cursor-pointer group shadow-xl">
          {images.length > 0 ? (
            <>
              <img src={images[activeImgIdx] || images[0]} alt={auction.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <button
  type="button"
  onClick={(e) => { e.stopPropagation(); setIsZoomOpen(true); }}
  className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-[#F5C400] hover:bg-[#DDAF00] text-black flex items-center justify-center font-black shadow-lg cursor-pointer transition-transform hover:scale-110 z-10"
  title="تكبير الصورة"
>
  <Plus size={18} strokeWidth={3} />
</button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
              <Gavel size={44} className="text-[#F5C400]/25" />
              <span className="text-xs text-slate-500">لا توجد صور مرفوعة</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`h-16 rounded-xl overflow-hidden border cursor-pointer ${activeImgIdx === idx ? 'border-[#F5C400] ring-2 ring-[#F5C400]/40' : 'border-[#2F3336]'}`}
              >
                <img src={img} alt={`t-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* تفاصيل المزاد */}
      <div className="bg-black border border-[#2F3336] rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-white">{auction.title}</h1>
          <span className="px-2.5 py-1 bg-[#1A1A1A] text-[#F5C400] border border-[#F5C400]/40 rounded-lg text-xs font-mono font-bold">
            #{auctionNumber}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2F3336] text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">المدينة:</span>
            <span className="font-bold text-white">{auction.city || 'صنعاء'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">حالة العرض:</span>
            <span className={`font-bold ${isCompleted ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isCompleted ? 'منتهي' : (isDirectSale ? 'بيع مباشر بسعر ثابت' : 'مزاد علني مباشر')}
                </span>
          </div>
        </div>
      </div>

      {/* العداد التنازلي للمزاد */}
      {!isDirectSale && (
        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 space-y-2.5 shadow-lg">
          <span className="text-xs font-bold text-slate-300 block text-center">
            {isCompleted ? 'حالة وقت المزاد: انتهى المزاد' : 'الوقت المتبقي حتى إغلاق المزاد'}
          </span>
          <div className="py-3 px-4 rounded-xl bg-black border border-[#2F3336] grid grid-cols-4 gap-2 text-center font-mono">
            <div className="flex flex-col items-center">
              <span className={`font-black text-xl sm:text-2xl ${isCompleted ? 'text-rose-500' : 'text-emerald-400'}`}>
                {timer.seconds}
              </span>
              <span className="text-[10px] font-sans text-slate-400 font-bold mt-0.5">ثانية</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-black text-xl sm:text-2xl ${isCompleted ? 'text-rose-500' : 'text-emerald-400'}`}>
                {timer.minutes}
              </span>
              <span className="text-[10px] font-sans text-slate-400 font-bold mt-0.5">دقيقة</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-black text-xl sm:text-2xl ${isCompleted ? 'text-rose-500' : 'text-emerald-400'}`}>
                {timer.hours}
              </span>
              <span className="text-[10px] font-sans text-slate-400 font-bold mt-0.5">ساعة</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-black text-xl sm:text-2xl ${isCompleted ? 'text-rose-500' : 'text-emerald-400'}`}>
                {timer.days}
              </span>
              <span className="text-[10px] font-sans text-slate-400 font-bold mt-0.5">يوم</span>
            </div>
          </div>
        </div>
      )}

      {/* قسم الشراء المباشر أو المزايدة */}
      {isDirectSale ? (
        <div className="bg-[#111111] border-2 border-blue-500/80 rounded-2xl p-5 space-y-4 shadow-xl text-right">
          <div className="border-b border-[#2F3336] pb-3">
            <span className="text-xs text-slate-400 block font-bold">معروض متاح للشراء المباشر</span>
            <div className="text-2xl font-black text-[#F5C400] font-mono">
              سعر السلعة: {directItemPrice.toLocaleString()} {currencyCode}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-[#2F3336] space-y-2 text-xs">
            <span className="font-bold text-[#F5C400] block">المبلغ الإجمالي مع العمولة:</span>
            <div className="flex justify-between text-slate-300">
              <span>سعر السلعة:</span>
              <span className="font-mono">{directItemPrice.toLocaleString()} {currencyCode}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>عمولة يمن ريتنج للمشتري ({buyerCommissionRate}%):</span>
              <span className="font-mono text-emerald-400">+{directCommAmount.toLocaleString()} {currencyCode}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#2F3336] text-sm font-black text-white">
              <span>الإجمالي المطلوب:</span>
              <span className="font-mono text-[#F5C400] text-base">{directTotalRequired.toLocaleString()} {currencyCode}</span>
            </div>
          </div>

          <form onSubmit={(e) => handlePlaceBidOrBuy(e, true)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">اسم المشتري الكريم *</label>
                <input
                  required
                  type="text"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="الاسم الرباعي أو التجاري"
                  className="w-full bg-black border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">رقم هاتفك (واتساب) * (9 أرقام)</label>
                <input
                  required
                  type="tel"
                  maxLength={9}
                  value={bidderPhone}
                  onChange={(e) => setBidderPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="77XXXXXXX"
                  className="w-full bg-black border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* إقرار الشراء بالخلفية الخضراء الشفافة */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5 text-right">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ShieldCheck size={16} />
                <span>إقرار المشتري وعمولة المنصة المعتمدة:</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                يقر المشتري بجدية الشراء والالتزام بسداد قيمة السلعة وعمولة المنصة بنسبة (<span className="text-[#F5C400] font-black font-mono text-xs">{buyerCommissionRate}%</span>) عند إتمام الصفقة.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={buyerConsented}
                  onChange={(e) => setBuyerConsented(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span className="text-[11px] font-bold text-white">أوافق على الشروط وعمولة المنصة المحددة ({buyerCommissionRate}%)</span>
              </label>
            </div>

            {bidInlineMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                bidInlineMsg.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950 text-rose-300 border border-rose-500/50'
              }`}>
                {bidInlineMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{bidInlineMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingBid || !buyerConsented}
              className="w-full py-3.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-40"
            >
              {submittingBid ? 'جاري تسجيل طلب الشراء...' : 'تأكيد طلب الشراء المباشر وتثبيت حجز السلعة'}
            </button>
          </form>
        </div>
      ) : isCompleted ? (
        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-5 space-y-2 shadow-xl text-center">
          <span className="text-xs text-slate-400 block font-bold">السعر النهائي الذي رسا عليه المزاد</span>
          <div className="text-2xl font-black text-slate-300 font-mono">
            {currentBid.toLocaleString()} {currencyCode}
          </div>
          <span className="text-xs text-slate-500 block">المزاد مغلق ورسى على أعلى مزايد.</span>
        </div>
      ) : (
        /* قاعة المزايدة الحية مع حقول اسم ورقم المزايد */
        <div className="bg-[#111111] border-2 border-[#F5C400] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2F3336] pb-3">
            <div>
              <span className="text-xs text-slate-400 block font-bold">أعلى مزايدة مسجلة حالياً</span>
              <div className="text-xl font-black text-[#F5C400] font-mono">
                {currentBid.toLocaleString()} {currencyCode}
              </div>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-bold">أدنى سومة مقبولة تالياً</span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {minNextBid.toLocaleString()} {currencyCode}
              </div>
            </div>
          </div>

          <form onSubmit={(e) => handlePlaceBidOrBuy(e, false)} className="space-y-3.5">
            {bidderName && bidderPhone ? (
              <div className="p-3 bg-[#111111] border border-[#2F3336] rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">المزايدة بحساب:</span>
                <div className="font-bold text-white font-sans flex items-center gap-1.5">
                  <span>{bidderName}</span>
                  <span className="font-mono text-[#F5C400] dir-ltr">({bidderPhone})</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">اسم المزايد الكريم *</label>
                  <input
                    required
                    type="text"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    placeholder="اسمك الكريم..."
                    className="w-full bg-black border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">رقم هاتفك (واتساب) * (9 أرقام)</label>
                  <input
                    required
                    type="tel"
                    value={bidderPhone}
                    onChange={(e) => setBidderPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="770000000"
                    className="w-full bg-black border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none text-left dir-ltr"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                مبلغ مزايدتك المقترح ({currencyCode}) *
              </label>
              <input
                required
                type="number"
                min={minNextBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-black border border-[#2F3336] focus:border-[#F5C400] rounded-xl py-3 px-4 text-center font-mono text-lg font-black text-white outline-none"
              />
            </div>

            {/* إقرار المزايد وسياسة عمولة المنصة المعتمدة بخلفية خضراء */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5 text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>إقرار المزايد وسياسة عمولة المنصة:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBuyerConsented(!buyerConsented)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    buyerConsented
                      ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                      : 'bg-[#111111] text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  }`}
                >
                  {buyerConsented ? '✓ تمت الموافقة' : 'اضغط للموافقة على الشروط'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                بتقديم هذه السومة، يقر المزايد بجدية المزايدة والالتزام بالشراء عند رسو المزاد، ويوافق على سداد عمولة منصة يمن ريتنج المقررة على المشتري بنسبة (<span className="text-[#F5C400] font-black font-mono text-xs">{buyerCommissionRate}%</span>) المضافة إلى إجمالي قيمة الرسو، وإتمام سداد المبلغ كاملاً خلال 48 ساعة من انتهاء المزاد.
              </p>
            </div>

            {bidInlineMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                bidInlineMsg.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950 text-rose-300 border border-rose-500/50'
              }`}>
                {bidInlineMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{bidInlineMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingBid || !buyerConsented}
              className="w-full py-3.5 bg-[#F5C400] hover:bg-[#DDAF00] disabled:opacity-40 text-black font-black text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              {submittingBid ? 'جاري تثبيت السومة...' : 'الموافقة على التكاليف وتأكيد المزايدة الآن'}
            </button>
          </form>
        </div>
      )}

      {/* سجل المزايدات الحية بالأسماء والتوقيت */}
      {!isDirectSale && (
        <div className="bg-black border border-[#2F3336] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2F3336] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#F5C400]" />
              <h3 className="text-sm font-black text-white">سجل المزايدات الحية المعتمد</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold font-mono">({bids.length} مزايدة)</span>
          </div>

          {bids.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1 bg-[#111111] rounded-xl border border-[#2F3336] p-4">
              <span className="font-bold text-slate-300 block">لا توجد مزايدات مسجلة حتى الآن</span>
              <span className="text-[11px] text-slate-500 block">كن أول من يفتتح السوم ويضع مزايدة على هذا المعروض!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {(showAllBids ? bids : bids.slice(0, 2)).map((b, idx) => {
                const isLeading = idx === 0;
                return (
                  <div
                    key={b.id || idx}
                    className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                      isLeading
                        ? 'bg-[#111111] border-2 border-[#F5C400] shadow-md shadow-[#F5C400]/10'
                        : 'bg-[#111111] border border-[#2F3336] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isLeading ? 'bg-[#F5C400] text-black' : 'bg-[#111111] text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className={`text-xs font-bold block ${isLeading ? 'text-white' : 'text-slate-300'}`}>
                          {isMyOwnBid(b) ? (
                            <span className="text-emerald-400 font-black">أنت ({getMaskedBidderCode(b)})</span>
                          ) : (
                            <span>{getMaskedBidderCode(b)}</span>
                          )}
                          {isLeading && (
                            <span className="text-[10px] text-[#F5C400] font-normal mr-1.5">
                              (المتصدر حالياً)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {b.created_at ? new Date(b.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <span className={`text-sm font-black block ${isLeading ? 'text-[#F5C400]' : 'text-slate-300'}`}>
                        {Number(b.bid_amount).toLocaleString()} {currencyCode}
                      </span>
                    </div>
                  </div>
                );
              })}
              {bids.length > 2 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllBids(!showAllBids)}
                    className="px-5 py-2 rounded-xl bg-[#111111] border border-[#2F3336] hover:border-[#F5C400] text-slate-200 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {showAllBids ? 'عرض أقل' : 'عرض الكل'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* تفاصيل ووصف السلعة */}
      <div className="bg-black border border-[#2F3336] rounded-2xl p-4 sm:p-5 space-y-2">
        <h3 className="text-sm font-black text-white border-b border-[#2F3336] pb-2">تفاصيل ومواصفات السلعة</h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-[#111111] p-3 rounded-xl border border-[#2F3336] whitespace-pre-line">
          {descriptionText}
        </p>
      </div>

      {/* نافذة تكبير الصورة بملء الشاشة */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)} 
          className="fixed inset-0 z-[9999999] bg-black/50  w-screen h-screen flex items-center justify-center p-2 sm:p-4 select-none touch-none overscroll-none"
        >
          <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
            <button
    type="button"
    onClick={() => setIsZoomOpen(false)}
    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#F5C400] hover:bg-[#DDAF00] text-black flex items-center justify-center font-black shadow-lg cursor-pointer transition-transform hover:scale-110 z-50"
    title="إغلاق"
  >
    <X size={18} strokeWidth={3} />
  </button>
            <img
              src={images[activeImgIdx] || images[0] || '/placeholder.png'}
              alt={auction?.title || 'معاينة'}
              className="max-w-full max-h-[85vh] object-contain max-h-[85vh] w-auto max-w-full drop-shadow-2xl rounded-2xl rounded-2xl shadow-2xl border border-[#2F3336]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetailsPage;
