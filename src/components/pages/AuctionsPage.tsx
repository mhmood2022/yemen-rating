import React, { useState, useEffect, useRef } from 'react';
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
  Copy, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

// دالة تحريك الأرقام التدريجية الانسيابية من الكود
function useAnimatedNumber(target: number, duration: number = 1200, initial: number = 0) {
  const [current, setCurrent] = useState(initial);
  const startTimeRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(initial + (target - initial) * ease));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, initial]);

  return current;
}

// تنسيق الوقت بالثواني
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
  timeLeft: string;
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
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // حالات العداد الحي والنبضات من الكود المرفق
  const [timer1, setTimer1] = useState(15738);
  const [timer2, setTimer2] = useState(8073);
  const [tickPulse, setTickPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer1((t) => (t > 0 ? t - 1 : 0));
      setTimer2((t) => (t > 0 ? t - 1 : 0));
      setTickPulse(true);
      setTimeout(() => setTickPulse(false), 180);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const animatedBids = useAnimatedNumber(1248);
  const animatedMaxPrice = useAnimatedNumber(2450);
  const animatedParticipants = useAnimatedNumber(86);
  const progressPercent = 65;
  const embedCodeString = `<div class="yemen-rate-auction-stats"></div>\n<script src="https://yemenrate.com/widget/auction-stats.js"></script>`;

  const currentUserId = 'user-current';
  const currentUserRole: 'visitor' | 'seller' | 'admin' = 'seller';

  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'سيارات ومحركات',
    description: '',
    startingPrice: '',
    minIncrement: '',
    currency: 'SAR',
    startDate: '',
    endDate: '',
    city: 'صنعاء',
    location: '',
    contactPhone: '',
    terms: '',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80'
    ]
  });

  const [createSuccessToast, setCreateSuccessToast] = useState(false);

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
      timeLeft: '04:18:22',
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
      timeLeft: '01:12:45',
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
      timeLeft: '00:00:00',
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

  const handleCreateAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAuction: AuctionItem = {
      id: `auc-${Date.now()}`,
      title: createForm.title,
      category: createForm.category,
      description: createForm.description,
      currency: createForm.currency,
      startingPrice: Number(createForm.startingPrice),
      minIncrement: Number(createForm.minIncrement),
      currentBid: Number(createForm.startingPrice),
      bidsCount: 0,
      startDate: createForm.startDate || '2026-09-01 10:00',
      endDate: createForm.endDate || '2026-09-07 20:00',
      timeLeft: 'بانتظار الموافقة',
      city: createForm.city,
      location: createForm.location,
      contactPhone: createForm.contactPhone,
      terms: createForm.terms || 'تطبق الشروط والأحكام العامة للمنصة.',
      sellerName: 'المستخدم الحالي',
      sellerId: currentUserId,
      isVerifiedSeller: true,
      status: 'pending_review',
      images: createForm.images,
      bidsHistory: []
    };

    setAuctionsList([newAuction, ...auctionsList]);
    setCreateSuccessToast(true);
    setTimeout(() => {
      setCreateSuccessToast(false);
      setIsCreateModalOpen(false);
      setActiveTab('my_requests');
    }, 2000);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      
      {/* ستايلات الـ CSS الحصرية لويدجت إحصائيات المزاد من الكود المرفق */}
      <style>{`
        @keyframes pulseGold {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.6; }
        }
        @keyframes pulseRed {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
        @keyframes shimmerTrack {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes tickPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .btn-gold-action {
          background-color: #FFC300 !important;
          color: #000000 !important;
          font-weight: 900 !important;
          font-size: 13px !important;
          min-height: 36px !important;
          text-shadow: none !important;
        }
      `}</style>

      {/* 1. Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC300] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#FFC300]/15">
            <Gavel className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">منصة المزادات الرسمية</h1>
              <span className="text-[11px] font-bold bg-[#FFC300]/10 text-[#FFC300] border border-[#FFC300]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                وساطة معتمدة
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              مزادات علنية منظمة بإشراف ومراجعة كاملة من إدارة Yemen Rating
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-[#FFC300] hover:brightness-110 active:brightness-95 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md shadow-[#FFC300]/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إنشاء مزاد جديد</span>
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-[#FFC300]" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* 2. ويدجت إحصائيات المزاد التفاعلي الحي المرفق بالكود (Auction Stats Live Widget) */}
      <div className="w-full max-w-[900px] mx-auto rounded-[16px] border border-[#1F1F1F] bg-[#000000] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_20px_80px_-40px_rgba(0,0,0,0.9)]">
        
        {/* شريط رأس الويدجت */}
        <div className="flex items-center justify-between px-4 md:px-5 h-[48px] bg-[#000000] border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-[22px] h-[22px] rounded-[6px] bg-[#000000] border border-[#1F1F1F] flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-[#FFC300]" style={{ animation: 'pulseGold 1.8s infinite' }} />
              </div>
              <h3 className="text-[13px] font-bold text-white tracking-tight">إحصائيات المزاد</h3>
            </div>
          </div>

          <div className="flex items-center gap-3" dir="ltr">
            <div className="hidden sm:flex items-center gap-2">
              <div 
                className="text-[12px] font-bold text-[#FFC300] tabular-nums tracking-widest bg-[#000000] border border-[#1F1F1F] rounded-full px-2.5 py-[3px]"
                style={{ animation: tickPulse ? 'tickPop 0.18s ease' : 'none' }}
              >
                {formatTime(timer2)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#EF4444]">مباشر</span>
              <span className="relative flex w-[8px] h-[8px]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-40" style={{ animation: 'pulseRed 1.6s infinite' }} />
                <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-[#EF4444]" />
              </span>
            </div>

            <div 
              className="sm:hidden text-[11px] font-bold text-[#FFC300] tabular-nums"
              style={{ animation: tickPulse ? 'tickPop 0.18s ease' : 'none' }}
            >
              {formatTime(timer2)}
            </div>
          </div>
        </div>

        {/* الكروت الأربعة لإحصائيات المزاد */}
        <div className="p-3 md:p-3.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 bg-[#000000]">
          
          {/* كارت 1: المزايدات */}
          <div className="group relative rounded-[12px] bg-[#000000] border border-[#1F1F1F] p-3 md:p-[14px] hover:border-[#2A2A2A] transition-colors duration-300">
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-[11px] text-[#999] font-semibold">المزايدات</span>
              <div className="w-6 h-6 rounded-[7px] bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center group-hover:border-[#2A2A2A] transition-colors">
                <Gavel className="w-[13px] h-[13px] text-[#FFC300]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] md:text-[20px] font-extrabold text-white leading-none tracking-tight font-mono">
                {animatedBids.toLocaleString('en-US')}
              </span>
              <span className="text-[10px] font-extrabold rounded-full px-1.5 py-[2px] leading-none bg-[#FFC300] text-black">
                +12%
              </span>
            </div>
            <div className="mt-2 h-[2px] w-full bg-[#111] rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-[#FFC300]/80 rounded-full" />
            </div>
          </div>

          {/* كارت 2: أعلى سعر */}
          <div className="group relative rounded-[12px] bg-[#000000] border border-[#1F1F1F] p-3 md:p-[14px] hover:border-[#EF4444]/30 transition-colors duration-300">
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-[11px] text-[#999] font-semibold">أعلى سعر</span>
              <div className="w-6 h-6 rounded-[7px] bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center group-hover:border-[#EF4444]/30 transition-colors">
                <TrendingUp className="w-[13px] h-[13px] text-[#EF4444]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1" dir="ltr">
              <span className="text-[11px] font-bold text-[#EF4444]/70">$</span>
              <span className="text-[18px] md:text-[20px] font-extrabold text-[#EF4444] leading-none tracking-tight font-mono">
                {animatedMaxPrice.toLocaleString('en-US')}
              </span>
              <span className="text-[10px] font-extrabold rounded-full px-1.5 py-[2px] leading-none ml-1 bg-[#FFC300] text-black font-mono">
                +4.2%
              </span>
            </div>
            <div className="mt-2 text-[10px] text-[#666] font-mono" dir="ltr">
              2,180 $ • احتياطي
            </div>
          </div>

          {/* كارت 3: المشاركون */}
          <div className="group relative rounded-[12px] bg-[#000000] border border-[#1F1F1F] p-3 md:p-[14px] hover:border-[#2A2A2A] transition-colors duration-300">
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-[11px] text-[#999] font-semibold">المشاركون</span>
              <div className="w-6 h-6 rounded-[7px] bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center group-hover:border-[#2A2A2A] transition-colors">
                <Users className="w-[13px] h-[13px] text-[#FFC300]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] md:text-[20px] font-extrabold text-white leading-none tracking-tight font-mono">
                {animatedParticipants.toLocaleString('en-US')}
              </span>
              <span className="text-[11px] text-[#666]">مُزايد</span>
            </div>
            <div className="mt-2 flex -space-x-1 rtl:space-x-reverse">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-5 h-5 rounded-full bg-[#111] border-[2px] border-[#000000] text-[8px] font-bold text-[#777] flex items-center justify-center font-mono"
                  style={{ zIndex: 4 - i }}
                >
                  {i === 3 ? `+${(82).toLocaleString('en-US')}` : String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </div>

          {/* كارت 4: الوقت المتبقي */}
          <div className="group relative rounded-[12px] bg-[#000000] border border-[#1F1F1F] p-3 md:p-[14px] hover:border-[#2A2A2A] transition-colors duration-300">
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-[11px] text-[#999] font-semibold flex items-center gap-1">
                <span>الوقت المتبقي</span>
                <span className="w-1 h-1 rounded-full bg-[#EF4444] animate-pulse" />
              </span>
              <div className="w-6 h-6 rounded-[7px] bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center">
                <Clock className="w-[14px] h-[14px] text-[#FFC300]" />
              </div>
            </div>
            <div 
              className="text-[18px] md:text-[20px] font-extrabold text-[#FFC300] leading-none tracking-widest tabular-nums font-mono"
              dir="ltr"
              style={{ animation: tickPulse ? 'tickPop 0.18s ease' : 'none' }}
            >
              {formatTime(timer1)}
            </div>
            <div className="mt-2 text-[10px] text-[#777]">
              ينتهي اليوم • <span className="font-mono" dir="ltr">18:30 KSA</span>
            </div>
          </div>

        </div>

        {/* شريط تقدم المزاد والأزرار */}
        <div className="px-3 md:px-3.5 pb-3 md:pb-3.5 bg-[#000000]">
          <div className="rounded-[12px] bg-[#000000] border border-[#1F1F1F] p-3 flex flex-col md:flex-row items-center gap-3">
            
            <div className="w-full md:flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[#999] font-medium">تقدم المزاد</span>
                <span className="text-[11px] font-bold text-[#00C950] font-mono">{progressPercent}%</span>
              </div>
              <div className="relative h-[6px] w-full bg-[#0A0A0A] rounded-full overflow-hidden border border-[#1F1F1F]">
                <div className="absolute inset-y-0 right-0 rounded-full bg-[#00C950] transition-all duration-700" style={{ width: `${progressPercent}%` }}>
                  <div className="absolute inset-0 w-[60px] bg-gradient-to-l from-transparent via-white/30 to-transparent" style={{ animation: 'shimmerTrack 2.2s infinite linear' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button 
                onClick={() => {
                  const live = auctionsList.find(a => a.status === 'live');
                  if (live) setSelectedAuction(live);
                }}
                className="btn-gold-action flex-1 md:flex-none px-5 rounded-full shadow-[0_0_20px_rgba(255,195,0,0.25)] hover:brightness-110 active:brightness-95 transition-all"
              >
                عرض التفاصيل
              </button>

              <button 
                onClick={() => {
                  const live = auctionsList.find(a => a.status === 'live');
                  if (live) setSelectedAuction(live);
                }}
                className="btn-gold-action flex-1 md:flex-none px-5 rounded-full flex items-center justify-center gap-1.5 hover:brightness-110 active:brightness-95 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#000000] animate-pulse" />
                <span>المزايدات الحية</span>
              </button>
            </div>

          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#555]">
            <span>يمن ريت • منصة المزادات اليمنية</span>
            <span className="font-mono" dir="ltr">ID: YR-88412 • 1,248 bids</span>
          </div>
        </div>

      </div>

      {/* 3. صندوق كود التضمين الرسمي الجديد (New Embed Code Box) */}
      <div className="w-full max-w-[900px] mx-auto rounded-[14px] border border-[#222] bg-[#111] p-4 md:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white text-[13px] font-bold">كود التضمين — Embed Code</h4>
          <button
            onClick={() => {
              navigator.clipboard.writeText(embedCodeString);
              setCopiedEmbed(true);
              setTimeout(() => setCopiedEmbed(false), 2000);
            }}
            className="flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#1A1A1A] border border-[#262626] text-[11px] font-bold text-[#999] hover:border-[#FFC300]/40 hover:text-white transition-colors"
          >
            {copiedEmbed ? <Check className="w-3.5 h-3.5 text-[#FFC300]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmbed ? 'تم النسخ' : 'نسخ الكود'}</span>
          </button>
        </div>

        <div className="rounded-[10px] bg-[#0A0A0A] border border-[#1E1E1E] p-3 overflow-auto">
          <pre className="text-[11px] leading-[1.6] text-[#888] font-mono text-left" dir="ltr">
            <code>{embedCodeString}</code>
          </pre>
        </div>

        <p className="mt-3 text-[11px] text-[#555] leading-relaxed">
          الصق هذا الكود داخل قسم المزاد. الويدجت متجاوب تلقائياً (900px كحد أقصى، شبكة 2×2 على الجوال)، الخط Cairo والأرقام إنجليزية، ولا يعتمد على مكتبات خارجية سوى Tailwind و Cairo. الأرقام تجري كل ثانية بالإنجليزية.
        </p>
      </div>

      {/* 4. Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2">
        <button
          onClick={() => { setActiveTab('live'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'live'
              ? 'bg-[#FFC300] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>المزادات المباشرة ({auctionsList.filter(a => a.status === 'live').length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('scheduled'); setSelectedAuction(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'scheduled'
              ? 'bg-[#FFC300] text-zinc-950 shadow-md font-black'
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
              ? 'bg-[#FFC300] text-zinc-950 shadow-md font-black'
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
              ? 'bg-[#FFC300] text-zinc-950 shadow-md font-black'
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white"
            >
              <ArrowRight className="w-4 h-4 text-[#FFC300]" />
              <span>الرجوع إلى قائمة المزادات</span>
            </button>

            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              selectedAuction.status === 'live' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : selectedAuction.status === 'ended'
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'bg-[#FFC300]/10 text-[#FFC300] border border-[#FFC300]/30'
            }`}>
              {selectedAuction.status === 'live' && '🔴 مزاد مباشر جاري الآن'}
              {selectedAuction.status === 'ended' && '🏁 انتهى المزاد'}
              {selectedAuction.status === 'pending_review' && '⏳ بانتظار مراجعة الإدارة'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* العمود الأيمن: معرض الـ 4 صور وتفاصيل السلعة */}
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
                  
                  <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-[#FFC300] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>الوقت المتبقي: {selectedAuction.timeLeft}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 text-xs text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FFC300]" />
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
                  <span className="text-[11px] bg-[#FFC300]/10 text-[#FFC300] border border-[#FFC300]/25 px-2.5 py-0.5 rounded-md font-bold">
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
                    <User className="w-4 h-4 text-[#FFC300]" />
                    <span>صاحب المزاد: <strong>{selectedAuction.sellerName}</strong></span>
                    {selectedAuction.isVerifiedSeller && <VerifiedBadge type="gold" size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 text-[#FFC300]" />
                    <span>الموقع: {selectedAuction.city} - {selectedAuction.location}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* العمود الأيسر: تقديم المزايدة وسجل المزايدات */}
            <div className="space-y-5">
              
              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-5 space-y-4 shadow-2xl">
                <div className="space-y-1 text-center bg-[#0d0d0d] p-4 rounded-2xl border border-[#222]">
                  <span className="text-xs text-zinc-400 block">السعر الحالي للأعلى مزايدة:</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFC300] font-mono tracking-tight">
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
                        className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#FFC300] focus:outline-none focus:border-[#FFC300]"
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
                      className="w-full py-3 bg-[#FFC300] hover:brightness-110 active:brightness-95 text-zinc-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-[#FFC300]/20 flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4 stroke-[2.5]" />
                      <span>تأكيد المزايدة</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-[#0d0d0d] border border-[#202020] rounded-2xl text-center space-y-2">
                    <span className="text-xs font-bold text-[#FFC300] block">
                      {selectedAuction.status === 'ended' ? '🏁 انتهى المزاد' : '⏳ المزاد غير مباشر حالياً'}
                    </span>
                    {selectedAuction.winnerName && (
                      <div className="text-xs text-zinc-300 pt-1 border-t border-[#202020]">
                        الفائز: <strong>{selectedAuction.winnerName}</strong> ({selectedAuction.winnerMaskedId})
                      </div>
                    )}
                  </div>
                )}

                {/* 🔒 معلومات عمولة المنصة */}
                {canViewCommission(selectedAuction) && (
                  <div className="bg-[#0c0c0c] p-3.5 rounded-2xl border border-[#2c2c2c] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300 border-b border-[#1f1f1f] pb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-[#FFC300]">
                        <Lock className="w-3.5 h-3.5" />
                        البيانات المالية للعمولة (خاص بصاحب المزاد والإدارة)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-0.5">
                      <div className="flex justify-between">
                        <span>السعر الحالي / النهائي:</span>
                        <span className="text-white font-bold">{selectedAuction.currentBid.toLocaleString()} {selectedAuction.currency}</span>
                      </div>
                      <div className="flex justify-between text-[#FFC300]">
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

              {/* سجل المزايدات */}
              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#FFC300]" />
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
                          ? 'bg-[#FFC300]/10 border-[#FFC300]/40 text-[#FFC300] font-bold'
                          : 'bg-[#0d0d0d] border-[#202020] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rec.rank === 1 ? 'bg-[#FFC300] text-zinc-950' : 'bg-zinc-800 text-zinc-400'
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

          {/* عارض صور المزاد المكبرة */}
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
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#FFC300] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
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
                          activeAuctionLightboxIndex === i ? 'bg-[#FFC300] w-6' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveAuctionLightboxIndex((prev) => (prev! < selectedAuction.images.length - 1 ? prev! + 1 : 0))}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-[#FFC300] hover:text-zinc-950 text-white border border-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold"
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
        /* قائمة بطاقات المزادات */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAuctions.map((item) => (
              <div
                key={item.id}
                className="bg-[#151515] border border-[#242424] hover:border-[#FFC300]/40 rounded-3xl overflow-hidden transition-all flex flex-col group shadow-xl"
              >
                <div className="relative h-48 w-full bg-[#1e1e1e] overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-[#FFC300] flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timeLeft}</span>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    {item.status === 'live' && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                        مباشر
                      </span>
                    )}
                    {item.status === 'pending_review' && (
                      <span className="bg-[#FFC300]/20 text-[#FFC300] border border-[#FFC300]/30 text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
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
                      <span className="text-[#FFC300] font-bold text-[11px] bg-[#FFC300]/10 px-2 py-0.5 rounded-md border border-[#FFC300]/20">
                        {item.category}
                      </span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FFC300]" />
                        {item.city}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FFC300] transition-colors line-clamp-2 leading-snug">
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
                    <div className="text-lg sm:text-xl font-black text-[#FFC300] tracking-tight">
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
                    className="w-full py-2.5 bg-[#1a1a1a] hover:bg-[#FFC300] hover:text-zinc-950 text-white font-bold text-xs rounded-xl border border-[#2a2a2a] transition-all flex items-center justify-center gap-1.5 group-hover:border-[#FFC300]"
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

      {/* نافذة إنشاء المزاد */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#151515] border border-[#282828] rounded-3xl p-5 sm:p-6 w-full max-w-2xl space-y-4 shadow-2xl my-6">
            
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-[#FFC300]" />
                  <span>طلب إنشاء مزاد جديد (مع 4 صور للسلعة)</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  تخضع جميع المزادات لمراجعة الإدارة قبل اعتمادها ونشرها للعامة
                </span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccessToast ? (
              <div className="p-5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">تم إرسال طلب المزاد للإدارة بنجاح!</h4>
                <p className="text-xs text-zinc-300">
                  حالة الطلب: <strong>بانتظار مراجعة الإدارة</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAuctionSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">عنوان / اسم السلعة *</label>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="مثال: سيارة تويوتا لاندكروزر V8"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">تصنيف المزاد *</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFC300]"
                    >
                      <option value="سيارات ومحركات">سيارات ومحركات</option>
                      <option value="عقارات ومخططات">عقارات ومخططات</option>
                      <option value="تحف وتراثيات">تحف وتراثيات</option>
                      <option value="إلكترونيات وأجهزة">إلكترونيات وأجهزة</option>
                      <option value="معدات ومكائن">معدات ومكائن</option>
                      <option value="أخرى">سلع أخرى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">عملة المزاد *</label>
                    <select
                      value={createForm.currency}
                      onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFC300] font-bold"
                    >
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="YER">ريال يمني (YER)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">السعر الابتدائي ({createForm.currency}) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.startingPrice}
                      onChange={(e) => setCreateForm({ ...createForm, startingPrice: e.target.value })}
                      placeholder="مثال: 50000"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">الحد الأدنى للزيادة ({createForm.currency}) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.minIncrement}
                      onChange={(e) => setCreateForm({ ...createForm, minIncrement: e.target.value })}
                      placeholder="مثال: 500"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">المدينة *</label>
                    <input
                      type="text"
                      required
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                      placeholder="صنعاء، عدن..."
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">الموقع / الحي</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="مثال: شارع حدة"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">رقم الهاتف للتواصل *</label>
                    <input
                      type="tel"
                      required
                      value={createForm.contactPhone}
                      onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                      placeholder="777000000"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FFC300]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">وصف السلعة بالتفصيل *</label>
                  <textarea
                    rows={3}
                    required
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="مواصفات السلعة وحالتها وفحصها..."
                    className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFC300]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#242424] flex-wrap gap-2">
                  <span className="text-[10px] text-zinc-500">
                    * سيتم إدراج 4 صور تفصيلية للمزاد بعد المراجعة
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#FFC300] hover:brightness-110 active:brightness-95 text-zinc-950 font-bold rounded-xl"
                    >
                      إرسال للإدارة للمراجعة
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AuctionsPage;
