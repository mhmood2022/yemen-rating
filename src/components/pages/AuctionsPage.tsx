import { AdBanner } from "../common/AdBanner";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Gavel, 
  Clock, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Send, 
  FileText, 
  User, 
  Check, 
  Flame, 
  Calendar, 
  X, 
  Lock, 
  ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export type AuctionStatus = 
  | 'draft' | 'pending_review' | 'approved' | 'rejected' | 'scheduled' | 'live' | 'paused' | 'ended' | 'sold' | 'cancelled';

export interface BidRecord {
  id: string;
  bidderMaskedId: string;
  amount: number;
  time: string;
  rank: number;
}

export interface AuctionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  currency: string;
  startingPrice: number;
  minIncrement: number;
  currentBid: number;
  bidsCount: number;
  startDate: string;
  endDate: string;
  timeLeftSeconds: number;
  city: string;
  location: string;
  contactPhone: string;
  terms: string;
  sellerName: string;
  sellerId: string;
  isVerifiedSeller: boolean;
  status: AuctionStatus;
  images: string[];
  bidsHistory: BidRecord[];
  winnerName?: string;
  winnerMaskedId?: string;
}

export const AuctionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled' | 'ended' | 'my_requests'>('live');
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [bidSuccessToast, setBidSuccessToast] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [activeAuctionLightboxIndex, setActiveAuctionLightboxIndex] = useState<number | null>(null);

  const currentUserId = 'user-current';
  const currentUserRole: 'visitor' | 'seller' | 'admin' = 'seller';

  const [auctionsList, setAuctionsList] = useState<AuctionItem[]>([
    {
      id: 'auc-101',
      title: 'سيارة تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي',
      category: 'سيارات ومحركات',
      description: 'سيارة بحالة الوكالة، عداد 24,000 كم فقط، صيانة دورية منتظمة، طلاء المصنع بالكامل بدون أي خدوش، جلد بيج، كاميرات 360 درجة، فتحة سقف، بصمة دخول ذكي.',
      currency: 'SAR',
      startingPrice: 150000,
      minIncrement: 2000,
      currentBid: 182000,
      bidsCount: 17,
      startDate: '2026-08-25 10:00',
      endDate: '2026-08-30 20:00',
      timeLeftSeconds: 15502,
      city: 'صنعاء',
      location: 'حدة - جولة الرويشان',
      contactPhone: '777000111',
      terms: 'دفع عربون 5% عند الرسو، وإتمام المعاينة ونقل الملكية خلال 48 ساعة.',
      sellerName: 'معرض النخبة للسيارات',
      sellerId: 'user-881',
      isVerifiedSeller: true,
      status: 'live',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80'
      ],
      bidsHistory: [
        { id: 'b-1', bidderMaskedId: 'مزايد #8392', amount: 182000, time: 'قبل 12 دقيقة', rank: 1 },
        { id: 'b-2', bidderMaskedId: 'مزايد #4110', amount: 180000, time: 'قبل ساعة', rank: 2 },
        { id: 'b-3', bidderMaskedId: 'مزايد #1904', amount: 178000, time: 'قبل 3 ساعات', rank: 3 }
      ]
    },
    {
      id: 'auc-102',
      title: 'قطعة أرض تجارية ركنية 6 لبن حر شارع الستين الغربي',
      category: 'عقارات ومخططات',
      description: 'أرض تجارية استثمارية حرة موقع استراتيجي مميز على واجهتين، صالحة لبناء برج تجاري وسكني، وثائق ومخططات رسمية جاهزة ومعمدة.',
      currency: 'YER',
      startingPrice: 150000000,
      minIncrement: 1000000,
      currentBid: 185000000,
      bidsCount: 14,
      startDate: '2026-08-26 12:00',
      endDate: '2026-08-31 18:00',
      timeLeftSeconds: 4365,
      city: 'صنعاء',
      location: 'شارع الستين الغربي - جوار جسر مذبح',
      contactPhone: '771234567',
      terms: 'البيع حر مباشر، تخليص أوراق البصيرة والتنازل في المحكمة المختصة.',
      sellerName: 'مكتب الأمانة العقاري',
      sellerId: 'user-current',
      isVerifiedSeller: true,
      status: 'live',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80'
      ],
      bidsHistory: [
        { id: 'b-5', bidderMaskedId: 'مزايد #9021', amount: 185000000, time: 'قبل 20 دقيقة', rank: 1 },
        { id: 'b-6', bidderMaskedId: 'مزايد #3409', amount: 184000000, time: 'قبل ساعتين', rank: 2 }
      ]
    },
    {
      id: 'auc-103',
      title: 'جنبية صيفاني عسيب قديم فاخر مع حزام مذهب تراثي',
      category: 'تحف وتراثيات',
      description: 'جنبية صيفاني قديمة رأس طبيعي ممتاز من التراث الأصيل مع حزام مطرز بخيوط الفضة والمذهب بحالة ممتازة لهواة جمع التحف.',
      currency: 'USD',
      startingPrice: 8000,
      minIncrement: 200,
      currentBid: 12400,
      bidsCount: 22,
      startDate: '2026-08-20 09:00',
      endDate: '2026-08-28 22:00',
      timeLeftSeconds: 0,
      city: 'صنعاء',
      location: 'باب اليمن - سوق الجنابي',
      contactPhone: '733000999',
      terms: 'المعاينة والفحص في مقر المنصة المعتمد، التسليم يد بيد بعد استلام المبلغ.',
      sellerName: 'دار التراث اليمني',
      sellerId: 'user-119',
      isVerifiedSeller: true,
      status: 'ended',
      winnerName: 'المهندس عبدالله العنسي',
      winnerMaskedId: 'مزايد #7731',
      images: [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1567449303078-57ad995bd301?w=1000&auto=format&fit=crop&q=80'
      ],
      bidsHistory: [
        { id: 'b-7', bidderMaskedId: 'مزايد #7731 (الفائز)', amount: 12400, time: 'منتهٍ', rank: 1 },
        { id: 'b-8', bidderMaskedId: 'مزايد #5520', amount: 12200, time: 'قبل يوم', rank: 2 }
      ]
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAuctionsList(prev => prev.map(a => ({
        ...a,
        timeLeftSeconds: a.timeLeftSeconds > 0 ? a.timeLeftSeconds - 1 : 0
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveAuctions = auctionsList.filter(a => a.status === 'live');
  const totalBidsCount = auctionsList.reduce((acc, curr) => acc + curr.bidsCount, 0);
  const featuredLiveAuction = liveAuctions[0] || auctionsList[0];

  const fullAuctionTicker = useMemo(() => {
    const items = auctionsList.map(a => ({
      text: `${a.status === 'live' ? '🔴' : '🏁'} ${a.title}`,
      bid: `${a.currentBid.toLocaleString()} ${a.currency}`,
      time: a.status === 'live' ? formatTime(a.timeLeftSeconds) : 'منتهي'
    }));
    return [...items, ...items, ...items, ...items];
  }, [auctionsList]);

  const canViewCommission = (auction: AuctionItem): boolean => {
    return auction.sellerId === currentUserId || currentUserRole === 'admin';
  };

  const filteredAuctions = auctionsList.filter((item) => {
    if (activeTab === 'live') return item.status === 'live';
    if (activeTab === 'scheduled') return item.status === 'scheduled';
    if (activeTab === 'ended') return item.status === 'ended' || item.status === 'sold';
    if (activeTab === 'my_requests') return item.sellerId === currentUserId;
    return true;
  });

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;

    const minAllowedBid = selectedAuction.currentBid + selectedAuction.minIncrement;

    if (bidAmountInput < minAllowedBid) {
      setBidError(`المبلغ يجب أن يكون على الأقل ${minAllowedBid.toLocaleString()} ${selectedAuction.currency}`);
      return;
    }

    setBidError(null);

    const newRecord: BidRecord = {
      id: `bid-${Date.now()}`,
      bidderMaskedId: `مزايد #${Math.floor(1000 + Math.random() * 9000)} (أنت)`,
      amount: bidAmountInput,
      time: 'الآن',
      rank: 1
    };

    const updatedAuction: AuctionItem = {
      ...selectedAuction,
      currentBid: bidAmountInput,
      bidsCount: selectedAuction.bidsCount + 1,
      bidsHistory: [newRecord, ...selectedAuction.bidsHistory.map(b => ({ ...b, rank: b.rank + 1 }))]
    };

    setAuctionsList(prev => prev.map(a => a.id === updatedAuction.id ? updatedAuction : a));
    setSelectedAuction(updatedAuction);
    setBidSuccessToast(true);
    setTimeout(() => setBidSuccessToast(false), 3000);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      {/* مكوّن إعلانات YR Ads الموضع #6 */} 
      <AdBanner placementId="6" className="mb-4" />
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5b800] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#f5b800]/15">
            <Gavel className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">منصة المزادات الرسمية</h1>
              <span className="text-[11px] font-bold bg-[#f5b800]/10 text-yellow-400 border border-[#f5b800]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                وساطة معتمدة
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              إحصائيات ومزادات علنية مباشرة متطابقة الأرقام والأسعار والمؤقتات
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-yellow-400" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* 2. شريط المزادات المتحرك اللحظي - صلب 100% بدون زجاج وبدون كحلي */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#262626] bg-[#111111] shadow-xl">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-r from-[#111111] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-l from-[#111111] to-transparent" />
        
        <div className="ticker-track-smooth flex items-center gap-3 py-2.5 px-2">
          {fullAuctionTicker.map((item, idx) => (
            <div key={idx} className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#282828] bg-[#181818] px-3.5 py-1 text-xs">
              <span className="font-bold text-white/90">{item.text}</span>
              <span className="font-mono font-extrabold text-yellow-400">{item.bid}</span>
              <span className="text-[10px] text-zinc-400 font-mono bg-[#0d0d0d] px-2 py-0.2 rounded border border-[#262626]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ويدجت إحصائيات المزاد الحية */}
      <div className="w-full max-w-[900px] mx-auto rounded-[16px] border border-[#262626] bg-[#000000] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 md:px-5 h-[48px] bg-[#000000] border-b border-[#202020]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-[22px] h-[22px] rounded-[6px] bg-[#000000] border border-[#202020] flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-[#f5b800]" />
              </div>
              <h3 className="text-[13px] font-bold text-white tracking-tight">إحصائيات المزادات الحية</h3>
            </div>
          </div>

          <div className="flex items-center gap-3" dir="ltr">
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-bold text-yellow-400 tabular-nums tracking-widest bg-[#000000] border border-[#202020] rounded-full px-2.5 py-[3px] font-mono">
                {formatTime(featuredLiveAuction.timeLeftSeconds)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-red-500">مباشر</span>
              <span className="relative flex w-[8px] h-[8px]">
                <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-red-500 animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 bg-[#000000]">
          <div className="rounded-[12px] bg-[#000000] border border-[#202020] p-3 md:p-[14px]">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] text-[#999] font-semibold">إجمالي المزايدات</span>
              <Gavel className="w-[13px] h-[13px] text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] md:text-[20px] font-extrabold text-white font-mono">
                {totalBidsCount}
              </span>
              <span className="text-[10px] font-bold rounded-full px-1.5 py-[2px] bg-[#f5b800] text-black">
                عرض حي
              </span>
            </div>
          </div>

          <div className="rounded-[12px] bg-[#000000] border border-[#202020] p-3 md:p-[14px]">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] text-[#999] font-semibold">أعلى مزاد حالي</span>
              <TrendingUp className="w-[13px] h-[13px] text-emerald-400" />
            </div>
            <div className="text-[16px] md:text-[18px] font-extrabold text-emerald-400 font-mono tracking-tight">
              {featuredLiveAuction.currentBid.toLocaleString()} {featuredLiveAuction.currency}
            </div>
            <div className="text-[10px] text-zinc-500 truncate mt-1">
              {featuredLiveAuction.title}
            </div>
          </div>

          <div className="rounded-[12px] bg-[#000000] border border-[#202020] p-3 md:p-[14px]">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] text-[#999] font-semibold">المزادات المباشرة</span>
              <Users className="w-[13px] h-[13px] text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] md:text-[20px] font-extrabold text-white font-mono">
                {liveAuctions.length}
              </span>
              <span className="text-[11px] text-zinc-400">مزاد جاري</span>
            </div>
          </div>

          <div className="rounded-[12px] bg-[#000000] border border-[#202020] p-3 md:p-[14px]">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] text-[#999] font-semibold">الوقت المتبقي</span>
              <Clock className="w-[14px] h-[14px] text-yellow-400" />
            </div>
            <div className="text-[18px] md:text-[20px] font-extrabold text-yellow-400 font-mono tracking-widest" dir="ltr">
              {formatTime(featuredLiveAuction.timeLeftSeconds)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              متزامن مع السلعة الرئيسية
            </div>
          </div>
        </div>

        <div className="px-3 md:px-3.5 pb-3 md:pb-3.5 bg-[#000000]">
          <div className="rounded-[12px] bg-[#000000] border border-[#202020] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              جميع أرقام المزايدات ومبالغ الصفقات بالعملات المعتمدة من أصحاب المزادات
            </span>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setSelectedAuction(featuredLiveAuction)}
                className="px-5 py-2 rounded-full bg-[#f5b800] text-zinc-950 font-black text-xs hover:brightness-110 active:brightness-95 transition-all shadow-md flex-1 md:flex-none"
              >
                دخول المزاد المباشر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2">
        <button
          onClick={() => { setActiveTab('live'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'live'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>المزادات المباشرة ({liveAuctions.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('scheduled'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'scheduled'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>مزادات مجدولة</span>
        </button>

        <button
          onClick={() => { setActiveTab('ended'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ended'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>مزادات منتهية ومكتملة</span>
        </button>

        <button
          onClick={() => { setActiveTab('my_requests'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'my_requests'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>مزاداتي وطلباتي</span>
        </button>
      </div>

      {/* تفاصيل المزاد المحدد مع شبكة الـ 4 صور */}
      {selectedAuction ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedAuction(null)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-yellow-400 hover:text-yellow-300"
            >
              <ArrowRight className="w-4 h-4 text-yellow-400" />
              <span>الرجوع إلى قائمة المزادات</span>
            </button>

            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              selectedAuction.status === 'live' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : selectedAuction.status === 'ended'
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'bg-[#f5b800]/10 text-yellow-400 border border-[#f5b800]/30'
            }`}>
              {selectedAuction.status === 'live' && '🔴 مزاد مباشر جاري الآن'}
              {selectedAuction.status === 'ended' && '🏁 انتهى المزاد'}
              {selectedAuction.status === 'pending_review' && '⏳ بانتظار مراجعة الإدارة'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-3xl bg-[#151515] border border-[#242424] overflow-hidden p-3 space-y-3 shadow-2xl">
                <div 
                  onClick={() => setActiveAuctionLightboxIndex(0)}
                  className="relative h-64 sm:h-80 w-full bg-[#1e1e1e] rounded-2xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={selectedAuction.images[0]}
                    alt={selectedAuction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-yellow-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>الوقت المتبقي: {formatTime(selectedAuction.timeLeftSeconds)}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 text-xs text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span>انقر لتكبير ومعاينة الـ 4 صور للسلعة</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {selectedAuction.images.slice(1, 4).map((img, idx) => (
                    <div
                      key={idx + 1}
                      onClick={() => setActiveAuctionLightboxIndex(idx + 1)}
                      className="relative h-24 sm:h-28 rounded-xl bg-[#202020] overflow-hidden border border-[#2c2c2c] cursor-pointer group"
                    >
                      <img
                        src={img}
                        alt={`صورة المزاد ${idx + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute bottom-1.5 left-1.5 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono">
                        {idx + 2} / 4
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-5 sm:p-6 space-y-4 shadow-xl">
                <div>
                  <span className="text-[11px] bg-[#f5b800]/10 text-yellow-400 border border-[#f5b800]/25 px-2.5 py-0.5 rounded-md font-bold">
                    {selectedAuction.category}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white mt-2 leading-snug">
                    {selectedAuction.title}
                  </h2>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <h3 className="text-xs font-bold text-zinc-400">وصف السلعة المعروضة</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedAuction.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <h3 className="text-xs font-bold text-zinc-400">شروط البيع والتسليم المعتمدة</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-[#0d0d0d] p-3 rounded-xl border border-[#202020]">
                    {selectedAuction.terms}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#222] text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span>صاحب المزاد: <strong>{selectedAuction.sellerName}</strong></span>
                    {selectedAuction.isVerifiedSeller && <VerifiedBadge type="gold" size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <span>الموقع: {selectedAuction.city} - {selectedAuction.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-5 space-y-4 shadow-2xl">
                <div className="space-y-1 text-center bg-[#0d0d0d] p-4 rounded-2xl border border-[#222]">
                  <span className="text-xs text-zinc-400 block">السعر الحالي للأعلى مزايدة:</span>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono tracking-tight">
                    {selectedAuction.currentBid.toLocaleString()} {selectedAuction.currency}
                  </div>
                  <span className="text-[11px] text-zinc-500 block">
                    السعر الابتدائي: {selectedAuction.startingPrice.toLocaleString()} {selectedAuction.currency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 bg-[#111111] p-3 rounded-xl border border-[#202020]">
                  <div>
                    <span className="text-[10px] block text-zinc-500">الحد الأدنى للزيادة:</span>
                    <strong className="text-white font-mono">+{selectedAuction.minIncrement.toLocaleString()} {selectedAuction.currency}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] block text-zinc-500">إجمالي المزايدات:</span>
                    <strong className="text-white font-mono">{selectedAuction.bidsCount} مزايدة</strong>
                  </div>
                </div>

                {selectedAuction.status === 'live' ? (
                  <form onSubmit={handlePlaceBid} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        مبلغ مزايدتك ({selectedAuction.currency}):
                      </label>
                      <input
                        type="number"
                        required
                        min={selectedAuction.currentBid + selectedAuction.minIncrement}
                        step={selectedAuction.minIncrement}
                        value={bidAmountInput || ''}
                        onChange={(e) => setBidAmountInput(Number(e.target.value))}
                        placeholder={`أدخل ${(selectedAuction.currentBid + selectedAuction.minIncrement).toLocaleString()} أو أكثر`}
                        className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-yellow-400 focus:outline-none focus:border-[#f5b800]"
                      />
                    </div>

                    {bidError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{bidError}</span>
                      </div>
                    )}

                    {bidSuccessToast && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-1.5 font-bold">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>تم تسجيل مزايدتك بنجاح وتحديث أعلى سعر!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#f5b800] hover:bg-[#e5aa00] active:scale-95 text-zinc-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-[#f5b800]/20 flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4 stroke-[2.5]" />
                      <span>تأكيد المزايدة</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-[#0d0d0d] border border-[#202020] rounded-2xl text-center space-y-2">
                    <span className="text-xs font-bold text-yellow-400 block">
                      {selectedAuction.status === 'ended' ? '🏁 انتهى المزاد' : '⏳ المزاد غير مباشر حالياً'}
                    </span>
                    {selectedAuction.winnerName && (
                      <div className="text-xs text-zinc-300 pt-1 border-t border-[#202020]">
                        الفائز: <strong>{selectedAuction.winnerName}</strong> ({selectedAuction.winnerMaskedId})
                      </div>
                    )}
                  </div>
                )}

                {canViewCommission(selectedAuction) && (
                  <div className="bg-[#0c0c0c] p-3.5 rounded-2xl border border-[#2c2c2c] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300 border-b border-[#1f1f1f] pb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-yellow-400">
                        <Lock className="w-3.5 h-3.5" />
                        البيانات المالية للعمولة (خاص بصاحب المزاد والإدارة)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-0.5">
                      <div className="flex justify-between">
                        <span>السعر الحالي / النهائي:</span>
                        <span className="text-white font-bold">{selectedAuction.currentBid.toLocaleString()} {selectedAuction.currency}</span>
                      </div>
                      <div className="flex justify-between text-yellow-400">
                        <span>عمولة Yemen Rating (5%):</span>
                        <span>{((selectedAuction.currentBid * 5) / 100).toLocaleString()} {selectedAuction.currency}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 border-t border-[#1e1e1e] pt-1">
                        <span>صافي مستحق صاحب المزاد:</span>
                        <span className="font-bold">{(selectedAuction.currentBid - ((selectedAuction.currentBid * 5) / 100)).toLocaleString()} {selectedAuction.currency}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <History className="w-4 h-4 text-yellow-400" />
                    <span>سجل المزايدات الحية</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">({selectedAuction.bidsHistory.length} عرض)</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {selectedAuction.bidsHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-colors ${
                        rec.rank === 1
                          ? 'bg-[#f5b800]/10 border-[#f5b800]/40 text-yellow-400 font-bold'
                          : 'bg-[#0d0d0d] border-[#202020] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rec.rank === 1 ? 'bg-[#f5b800] text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {rec.rank}
                        </span>
                        <span className="text-[11px] font-sans">{rec.bidderMaskedId}</span>
                      </div>

                      <div className="text-left">
                        <span className="block font-bold">{rec.amount.toLocaleString()} {selectedAuction.currency}</span>
                        <span className="text-[9px] text-zinc-500 font-sans">{rec.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {activeAuctionLightboxIndex !== null && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 right-0 -mt-12 flex items-center justify-between px-2 text-white">
                  <span className="text-sm font-mono font-bold bg-zinc-900/80 px-3 py-1 rounded-xl border border-zinc-800">
                    صورة السلعة {activeAuctionLightboxIndex + 1} من {selectedAuction.images.length}
                  </span>
                  <button
                    onClick={() => setActiveAuctionLightboxIndex(null)}
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
                  <img
                    src={selectedAuction.images[activeAuctionLightboxIndex]}
                    alt={`سلعة ${activeAuctionLightboxIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => setActiveAuctionLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : selectedAuction.images.length - 1))}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#f5b800] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedAuction.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveAuctionLightboxIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          activeAuctionLightboxIndex === i ? 'bg-[#f5b800] w-6' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveAuctionLightboxIndex((prev) => (prev! < selectedAuction.images.length - 1 ? prev! + 1 : 0))}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#f5b800] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAuctions.map((item) => (
              <div
                key={item.id}
                className="bg-[#151515] border border-[#242424] hover:border-[#f5b800]/40 rounded-3xl overflow-hidden transition-all flex flex-col group shadow-xl"
              >
                <div className="relative h-48 w-full bg-[#1e1e1e] overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-yellow-400 flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(item.timeLeftSeconds)}</span>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    {item.status === 'live' && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                        مباشر
                      </span>
                    )}
                    {item.status === 'pending_review' && (
                      <span className="bg-[#f5b800]/20 text-yellow-400 border border-[#f5b800]/30 text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                        بانتظار المراجعة
                      </span>
                    )}
                    {item.status === 'ended' && (
                      <span className="bg-zinc-900/80 text-zinc-400 border border-zinc-700 text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                        منتهي
                      </span>
                    )}
                    <span className="text-[10px] bg-black/75 text-zinc-300 px-1.5 py-0.5 rounded-md border border-zinc-700 font-mono">
                      📸 4 صور
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-yellow-400 font-bold text-[11px] bg-[#f5b800]/10 px-2 py-0.5 rounded-md border border-[#f5b800]/20">
                        {item.category}
                      </span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-yellow-400" />
                        {item.city}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                      <span>المعلن: {item.sellerName}</span>
                      {item.isVerifiedSeller && <VerifiedBadge type="gold" size="sm" />}
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] p-3 rounded-2xl border border-[#202020] space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-sans">السعر الحالي:</span>
                      <span className="text-xs text-zinc-400 font-sans">({item.bidsCount} مزايدات)</span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-yellow-400 tracking-tight">
                      {item.currentBid.toLocaleString()} {item.currency}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-[#1a1a1a] font-sans">
                      <span>الحد الأدنى للزيادة:</span>
                      <span className="text-zinc-300 font-mono">+{item.minIncrement.toLocaleString()} {item.currency}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAuction(item);
                      setBidAmountInput(item.currentBid + item.minIncrement);
                      setBidError(null);
                    }}
                    className="w-full py-2.5 bg-[#1a1a1a] hover:bg-[#f5b800] hover:text-zinc-950 text-white font-bold text-xs rounded-xl border border-[#2a2a2a] transition-all flex items-center justify-center gap-1.5 group-hover:border-[#f5b800]"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>{item.status === 'live' ? 'دخول ومعاينة الـ 4 صور والمزايدة' : 'معاينة الـ 4 صور والتفاصيل'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AuctionsPage;
