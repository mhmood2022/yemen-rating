import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, Clock, ArrowRight, Plus, MapPin, 
  CheckCircle2, User, X, Flame, Sparkles
} from 'lucide-react';
import { AdBanner } from '../common/AdBanner';

export interface AuctionItem {
  id: string;
  title: string;
  category: 'سيارات' | 'عقارات' | 'معدات' | 'إلكترونيات' | 'مواشي' | 'نوادر';
  description: string;
  currency: string;
  startingPrice: number;
  minIncrement: number;
  currentBid: number;
  bidsCount: number;
  sellerName: string;
  sellerId: string;
  city: string;
  endsAt: string;
  timeLeftSeconds: number;
  status: 'active' | 'scheduled' | 'ended';
  images: string[];
  bidsHistory: { id: string; bidderCode: string; amount: number; time: string }[];
}

const INITIAL_AUCTIONS: AuctionItem[] = [
  {
    id: 'auc-101',
    title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي',
    category: 'سيارات',
    description: 'بحالة الوكالة، عداد 24,000 كم فقط، صيانة دورية منتظمة، طلاء المصنع بالكامل بدون أي خدوش، جلد بيج، كاميرات 360 درجة، فتحة سقف، بصمة دخول ذكي.',
    currency: 'SAR',
    startingPrice: 150000,
    minIncrement: 2000,
    currentBid: 184000,
    bidsCount: 18,
    sellerName: 'معرض النخبة للسيارات',
    sellerId: 'seller-1',
    city: 'صنعاء — حدة',
    endsAt: '2026-09-02',
    timeLeftSeconds: 15480,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c86629c983?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=900&auto=format&fit=crop&q=85'
    ],
    bidsHistory: [
      { id: 'b-1', bidderCode: 'مزايد #9700', amount: 184000, time: 'الآن' },
      { id: 'b-2', bidderCode: 'مزايد #8392', amount: 182000, time: 'منذ 15 دقيقة' },
      { id: 'b-3', bidderCode: 'مزايد #4110', amount: 180000, time: 'منذ ساعة' },
      { id: 'b-4', bidderCode: 'مزايد #1904', amount: 178000, time: 'منذ ساعتين' }
    ]
  },
  {
    id: 'auc-102',
    title: 'أرض تجارية ركنية 6 لبن شارع الستين',
    category: 'عقارات',
    description: 'أرض تجارية استثمارية واجهة عريضة على الشارع العام، مسورة وجاهزة للبناء والتطوير المباشر، موقع استراتيجي.',
    currency: 'YER',
    startingPrice: 160000000,
    minIncrement: 1000000,
    currentBid: 185000000,
    bidsCount: 14,
    sellerName: 'مكتب الأمانة العقاري',
    sellerId: 'seller-2',
    city: 'صنعاء — الستين',
    endsAt: '2026-09-03',
    timeLeftSeconds: 84300,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85'
    ],
    bidsHistory: [
      { id: 'b-5', bidderCode: 'مزايد #8812', amount: 185000000, time: 'منذ 20 دقيقة' },
      { id: 'b-6', bidderCode: 'مزايد #4421', amount: 184000000, time: 'منذ 3 ساعات' }
    ]
  },
  {
    id: 'auc-103',
    title: 'شاحنة مرسيدس أكتروس 2020',
    category: 'معدات',
    description: 'شاحنة نقل ثقيل بحالة ممتازة، محرك قوي، إطارات جديدة، مجمركة بالكامل وجاهزة للعمل المباشر.',
    currency: 'USD',
    startingPrice: 48000,
    minIncrement: 1000,
    currentBid: 58000,
    bidsCount: 9,
    sellerName: 'المتحدة للنقل الثقيل',
    sellerId: 'seller-3',
    city: 'عدن — المعلا',
    endsAt: '2026-09-04',
    timeLeftSeconds: 43200,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&auto=format&fit=crop&q=85'
    ],
    bidsHistory: [
      { id: 'b-7', bidderCode: 'مزايد #7011', amount: 58000, time: 'منذ 40 دقيقة' }
    ]
  }
];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const AuctionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'ended'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [auctionsList, setAuctionsList] = useState<AuctionItem[]>(INITIAL_AUCTIONS);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [bidToast, setBidToast] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // إحداثيات السحب باللمس للصور
  const touchStartX = useRef<number | null>(null);

  // نموذج إضافة مزاد جديد
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AuctionItem['category']>('سيارات');
  const [newCurrency, setNewCurrency] = useState('SAR');
  const [newStartPrice, setNewStartPrice] = useState<number>(10000);
  const [newIncrement, setNewIncrement] = useState<number>(1000);
  const [newCity, setNewCity] = useState('صنعاء');
  const [newDesc, setNewDesc] = useState('');

  // عداد المزادات اللحظي
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctionsList(prev => prev.map(auc => ({
        ...auc,
        timeLeftSeconds: Math.max(0, auc.timeLeftSeconds - 1)
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenAuction = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setActiveImageIndex(0);
    setBidAmountInput(auction.currentBid + auction.minIncrement);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // التحكم بالسحب باللمس للصور
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !selectedAuction) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveImageIndex(prev => (prev + 1) % selectedAuction.images.length);
      } else {
        setActiveImageIndex(prev => (prev - 1 + selectedAuction.images.length) % selectedAuction.images.length);
      }
    }
    touchStartX.current = null;
  };

  // تقديم مزايدة
  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;

    if (bidAmountInput < selectedAuction.currentBid + selectedAuction.minIncrement) {
      setBidToast(`الحد الأدنى هو ${(selectedAuction.currentBid + selectedAuction.minIncrement).toLocaleString()} ${selectedAuction.currency}`);
      setTimeout(() => setBidToast(null), 3000);
      return;
    }

    const newBid = {
      id: `b-${Date.now()}`,
      bidderCode: `مزايد #${Math.floor(1000 + Math.random() * 9000)}`,
      amount: bidAmountInput,
      time: 'الآن'
    };

    const updated: AuctionItem = {
      ...selectedAuction,
      currentBid: bidAmountInput,
      bidsCount: selectedAuction.bidsCount + 1,
      bidsHistory: [newBid, ...selectedAuction.bidsHistory]
    };

    setSelectedAuction(updated);
    setAuctionsList(prev => prev.map(a => a.id === updated.id ? updated : a));
    setBidAmountInput(bidAmountInput + selectedAuction.minIncrement);
    setBidToast('تم تسجيل مزايدتك بنجاح');
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry: AuctionItem = {
      id: `auc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: newDesc || 'سلعة معروضة للمزاد المباشر بحالة ممتازة وجاهزة للمعاينة.',
      currency: newCurrency,
      startingPrice: Number(newStartPrice),
      minIncrement: Number(newIncrement),
      currentBid: Number(newStartPrice),
      bidsCount: 0,
      sellerName: 'بائع معتمد',
      sellerId: 'user-current',
      city: newCity,
      endsAt: '2026-09-10',
      timeLeftSeconds: 86400 * 3,
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=85'
      ],
      bidsHistory: []
    };

    setAuctionsList(prev => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredAuctions = auctionsList.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchTab = activeTab === 'active' ? a.status === 'active' : activeTab === 'scheduled' ? a.status === 'scheduled' : a.status === 'ended';
    return matchCategory && matchTab;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص للمزادات #6 */}
      <AdBanner placementId="6" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي الأنيق */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Gavel size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              المزادات
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] block mt-0.5">
              مزادات حية ومباشرة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>إضافة مزاد</span>
          </button>
          
          <button
            onClick={selectedAuction ? () => setSelectedAuction(null) : onBack}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <span>{selectedAuction ? 'رجوع للمزادات' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* إشعار المزايدة */}
      {bidToast && (
        <div className="p-2.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
          <span>{bidToast}</span>
        </div>
      )}

      {/* 3. صندوق إحصائيات المزادات الحية (محفوظ بالكامل) */}
      {!selectedAuction && (
        <div className="bg-[#0F0F12] p-3 rounded-2xl border border-[#222226] shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold border-b border-[#1F2937] pb-2">
            <span className="flex items-center gap-1 text-white">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" /> إحصائيات المزادات الحية
            </span>
            <span className="text-[10px] text-[#FFC500] font-mono">تحديث فوري</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">المزادات النشطة</span>
              <b className="text-xs sm:text-sm text-white font-black">{auctionsList.filter(a => a.status === 'active').length} مزاد</b>
            </div>
            <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">أعلى مزاد حالي</span>
              <b className="text-xs sm:text-sm text-[#16A34A] font-black">185M YER</b>
            </div>
            <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">المزايدات المسجلة</span>
              <b className="text-xs sm:text-sm text-[#FFC500] font-black">41 مزايدة</b>
            </div>
            <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">حالة المزايدة</span>
              <b className="text-xs sm:text-sm text-emerald-400 font-['Cairo'] font-black">مباشرة</b>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل المزاد والمزايدة الحية التفاعلية
          ============================================================ */}
      {selectedAuction ? (
        <div className="space-y-3">
          
          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            
            {/* معرض الصور باللمس */}
            <div 
              className="relative h-56 sm:h-72 w-full bg-[#161619] overflow-hidden cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img 
                src={selectedAuction.images[activeImageIndex]} 
                alt={selectedAuction.title} 
                className="w-full h-full object-cover transition-all duration-300" 
              />
              
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-[#DC2626] text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                🔴 مباشر
              </span>

              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 text-white text-[10px] font-mono border border-white/10 backdrop-blur-md">
                ⏳ الوقت المتبقي: {formatTime(selectedAuction.timeLeftSeconds)}
              </span>

              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/85 text-[#FFC500] text-[9.5px] font-bold border border-white/10 backdrop-blur-md">
                📷 {activeImageIndex + 1} من {selectedAuction.images.length} (اسحب للتمرير)
              </span>
            </div>

            {/* صور مصغرة للتنقل السريع */}
            {selectedAuction.images.length > 1 && (
              <div className="flex gap-1.5 p-2 bg-[#121215] border-t border-[#1F2937] overflow-x-auto no-scrollbar">
                {selectedAuction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#FFC500] scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* التفاصيل والمعلومات */}
            <div className="p-3.5 sm:p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedAuction.category}
                  </span>
                  <span className="text-[11px] text-gray-400">📍 {selectedAuction.city} • {selectedAuction.sellerName}</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                  {selectedAuction.title}
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed font-medium">
                  {selectedAuction.description}
                </p>
              </div>

              {/* صندوق السعر والمزايدة الحية */}
              <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#27272A] pb-2.5">
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] block font-bold">السعر الحالي:</span>
                    <div className="text-xl sm:text-2xl font-mono font-black text-[#FFC500]">
                      {selectedAuction.currentBid.toLocaleString()} <span className="text-xs">{selectedAuction.currency}</span>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-[#9CA3AF] block font-['Cairo']">الابتدائي:</span>
                    <span className="text-xs text-gray-400 font-bold">{selectedAuction.startingPrice.toLocaleString()} {selectedAuction.currency}</span>
                    <span className="text-[9px] text-gray-500 block">({selectedAuction.bidsCount} مزايدة)</span>
                  </div>
                </div>

                {/* أزرار الزيادة السريعة الذكية */}
                <div>
                  <span className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">زيادة سريعة بنقرة واحدة:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      selectedAuction.minIncrement,
                      selectedAuction.minIncrement * 2,
                      selectedAuction.minIncrement * 5
                    ].map((inc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBidAmountInput(selectedAuction.currentBid + inc)}
                        className="py-1.5 rounded-lg bg-[#0F0F12] border border-[#27272A] hover:border-[#FFC500] text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                      >
                        +{inc.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* حقل تأكيد المزايدة */}
                <form onSubmit={handlePlaceBid} className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[#9CA3AF] block mb-1">مبلغ مزايدتك القادمة ({selectedAuction.currency}):</label>
                    <input
                      type="number"
                      min={selectedAuction.currentBid + selectedAuction.minIncrement}
                      step={selectedAuction.minIncrement}
                      value={bidAmountInput}
                      onChange={(e) => setBidAmountInput(Number(e.target.value))}
                      className="w-full bg-[#0F0F12] border border-[#27272A] focus:border-[#FFC500] rounded-xl p-2 text-sm font-mono font-bold text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-md shadow-[#FFC500]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Gavel size={14} />
                    <span>تأكيد المزايدة</span>
                  </button>
                </form>
              </div>

              {/* سجل المزايدات الحية */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <User size={13} className="text-[#FFC500]" /> سجل المزايدات
                </h3>
                <div className="space-y-1">
                  {selectedAuction.bidsHistory.map((bid, i) => (
                    <div key={bid.id} className="p-2 rounded-xl bg-[#161619] border border-[#27272A] flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          i === 0 ? 'bg-[#FFC500] text-black font-black' : 'bg-[#0F0F12] text-gray-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-white text-[11px]">{bid.bidderCode}</span>
                      </div>
                      <div className="text-left font-mono">
                        <b className={`font-black text-xs ${i === 0 ? 'text-[#16A34A]' : 'text-gray-300'}`}>
                          {bid.amount.toLocaleString()} {selectedAuction.currency}
                        </b>
                        <span className="text-[8px] text-gray-500 block">{bid.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة المزادات الرئيسية
           ============================================================ */
        <div className="space-y-3">
          
          {/* شريط الفئات والحالات */}
          <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
            <div className="flex gap-1 bg-[#161619] p-0.5 rounded-xl border border-[#27272A]">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'active' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                المزادات النشطة ({auctionsList.filter(a => a.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'scheduled' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                المجدولة
              </button>
              <button
                onClick={() => setActiveTab('ended')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ended' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                المنتهية
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {['all', 'سيارات', 'عقارات', 'معدات', 'إلكترونيات', 'مواشي', 'نوادر'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#18181C] border-[#FFC500] text-[#FFC500]' 
                      : 'bg-[#121215] border-[#222226] text-gray-400'
                  }`}
                >
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* شبكة كروت المزادات الفاخرة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredAuctions.map((auc) => (
              <div
                key={auc.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-40 w-full relative bg-[#161619]">
                  <img src={auc.images[0]} alt={auc.title} className="w-full h-full object-cover" />
                  
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[9px] font-black">
                    🔴 مباشر
                  </span>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-white text-[9.5px] font-mono border border-white/10 backdrop-blur-sm">
                    ⏳ {formatTime(auc.timeLeftSeconds)}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-gray-400 mb-0.5">
                      <span className="text-[#FFC500] font-bold">{auc.category}</span>
                      <span>•</span>
                      <span>{auc.city}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {auc.title}
                    </h3>
                  </div>

                  <div className="bg-[#161619] p-2 rounded-xl border border-[#27272A] flex justify-between items-center">
                    <div>
                      <span className="text-[8.5px] text-[#9CA3AF] block font-bold">السعر الحالي:</span>
                      <b className="text-xs sm:text-sm font-mono text-[#FFC500]">
                        {auc.currentBid.toLocaleString()} {auc.currency}
                      </b>
                    </div>
                    <div className="text-left text-[9px] text-gray-400 font-mono">
                      <span>الحد الأدنى:</span>
                      <b className="block text-gray-300">+{auc.minIncrement.toLocaleString()}</b>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAuction(auc)}
                    className="w-full py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                  >
                    <span>عرض المزاد</span>
                    <ArrowRight size={12} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================
          عارض الصور الشامل باللمس (Touch Swipe Lightbox)
          ============================================================ */}
      {isLightboxOpen && selectedAuction && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-400 font-mono">
              {activeImageIndex + 1} / {selectedAuction.images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-8 h-8 rounded-full bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <img 
              src={selectedAuction.images[activeImageIndex]} 
              alt="Fullscreen" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="flex justify-center items-center gap-1.5 pb-4">
            {selectedAuction.images.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-gray-700'
                }`} 
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          نافذة إضافة مزاد جديد
          ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-5 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#222226] pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-[#FFC500]" /> إضافة مزاد جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">عنوان المزاد</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سيارة هايلوكس دبل 2023"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الفئة</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="سيارات">سيارات</option>
                    <option value="عقارات">عقارات</option>
                    <option value="معدات">معدات</option>
                    <option value="إلكترونيات">إلكترونيات</option>
                    <option value="مواشي">مواشي</option>
                    <option value="نوادر">نوادر</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">العملة</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">السعر الابتدائي</label>
                  <input
                    type="number"
                    required
                    value={newStartPrice}
                    onChange={(e) => setNewStartPrice(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الحد الأدنى للزيادة</label>
                  <input
                    type="number"
                    required
                    value={newIncrement}
                    onChange={(e) => setNewIncrement(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">المدينة</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                >
                  <option value="صنعاء">صنعاء</option>
                  <option value="عدن">عدن</option>
                  <option value="تعز">تعز</option>
                  <option value="حضرموت - المكلا">حضرموت - المكلا</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="مأرب">مأرب</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">الوصف والمواصفات</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتب مواصفات وحالة السلعة..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222226]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 cursor-pointer"
                >
                  نشر المزاد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
