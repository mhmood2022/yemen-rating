import React, { useState, useEffect } from 'react';
import { 
  Gavel, Clock, ArrowRight, Plus, MapPin, 
  CheckCircle2, AlertCircle, User, X, ImageIcon
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
    title: 'تويوتا لاندكروزر V8 موديل 2022',
    category: 'سيارات',
    description: 'سيارة بحالة ممتازة، عداد 24,000 كم، صيانة دورية منتظمة، طلاء المصنع، كاميرات 360 درجة، فتحة سقف، بصمة دخول ذكي.',
    currency: 'SAR',
    startingPrice: 150000,
    minIncrement: 2000,
    currentBid: 182000,
    bidsCount: 17,
    sellerName: 'معرض النخبة',
    sellerId: 'seller-1',
    city: 'صنعاء',
    endsAt: '2026-09-02',
    timeLeftSeconds: 15420,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541348263662-e0c86629c983?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
    ],
    bidsHistory: [
      { id: 'b-1', bidderCode: 'مزايد #3524', amount: 182000, time: 'منذ دقيقة' },
      { id: 'b-2', bidderCode: 'مزايد #1104', amount: 180000, time: 'منذ ساعة' },
      { id: 'b-3', bidderCode: 'مزايد #1904', amount: 178000, time: 'منذ ساعتين' }
    ]
  },
  {
    id: 'auc-102',
    title: 'أرض تجارية ركنية 6 لبن شارع الستين',
    category: 'عقارات',
    description: 'أرض تجارية استثمارية واجهة عريضة على الشارع الرئيسي، مسورة وجاهزة للبناء والتطوير التجاري، موقع استراتيجي.',
    currency: 'YER',
    startingPrice: 160000000,
    minIncrement: 1000000,
    currentBid: 185000000,
    bidsCount: 14,
    sellerName: 'مكتب الأمانة',
    sellerId: 'seller-2',
    city: 'صنعاء',
    endsAt: '2026-09-03',
    timeLeftSeconds: 84300,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
    ],
    bidsHistory: [
      { id: 'b-4', bidderCode: 'مزايد #8812', amount: 185000000, time: 'منذ 15 دقيقة' },
      { id: 'b-5', bidderCode: 'مزايد #4421', amount: 184000000, time: 'منذ 3 ساعات' }
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
    sellerName: 'المتحدة للنقل',
    sellerId: 'seller-3',
    city: 'عدن',
    endsAt: '2026-09-04',
    timeLeftSeconds: 43200,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80'
    ],
    bidsHistory: [
      { id: 'b-6', bidderCode: 'مزايد #7011', amount: 58000, time: 'منذ 30 دقيقة' }
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
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [bidToast, setBidToast] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // نموذج إضافة مزاد جديد
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AuctionItem['category']>('سيارات');
  const [newCurrency, setNewCurrency] = useState('SAR');
  const [newStartPrice, setNewStartPrice] = useState<number>(10000);
  const [newIncrement, setNewIncrement] = useState<number>(1000);
  const [newCity, setNewCity] = useState('صنعاء');
  const [newDesc, setNewDesc] = useState('');

  // تحديث العداد اللحظي
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctionsList(prev => prev.map(auc => ({
        ...auc,
        timeLeftSeconds: Math.max(0, auc.timeLeftSeconds - 1)
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // اختيار مزاد للمعاينة
  const handleOpenAuction = (auction: AuctionItem) => {
    setSelectedAuction(auction);
    setBidAmountInput(auction.currentBid + auction.minIncrement);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // تقديم مزايدة
  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;

    if (bidAmountInput < selectedAuction.currentBid + selectedAuction.minIncrement) {
      setBidToast(`الحد الأدنى للمزايدة هو ${ (selectedAuction.currentBid + selectedAuction.minIncrement).toLocaleString() } ${selectedAuction.currency}`);
      setTimeout(() => setBidToast(null), 3500);
      return;
    }

    const newBid = {
      id: `b-${Date.now()}`,
      bidderCode: `مزايد #${Math.floor(1000 + Math.random() * 9000)}`,
      amount: bidAmountInput,
      time: 'الآن'
    };

    const updatedAuction: AuctionItem = {
      ...selectedAuction,
      currentBid: bidAmountInput,
      bidsCount: selectedAuction.bidsCount + 1,
      bidsHistory: [newBid, ...selectedAuction.bidsHistory]
    };

    setSelectedAuction(updatedAuction);
    setAuctionsList(prev => prev.map(a => a.id === updatedAuction.id ? updatedAuction : a));
    setBidAmountInput(bidAmountInput + selectedAuction.minIncrement);
    setBidToast('تم تسجيل مزايدتك بنجاح');
    setTimeout(() => setBidToast(null), 3000);
  };

  // زيادة سريعة
  const handleQuickAdd = (inc: number) => {
    if (selectedAuction) {
      setBidAmountInput(selectedAuction.currentBid + inc);
    }
  };

  // إنشاء مزاد جديد
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
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
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
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص للمزادات #6 */}
      <AdBanner placementId="6" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي المباشر */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFC500]/20">
            <Gavel size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-none">
              المزادات
            </h1>
            <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">
              مزادات حية ومباشرة للسيارات والعقارات والمعدات
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>إضافة مزاد</span>
          </button>
          
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-[#121215] border border-[#222226] text-xs font-bold text-[#D1D5DB] hover:text-[#FFC500] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
        </div>
      </div>

      {/* إشعار المزايدة */}
      {bidToast && (
        <div className="p-3 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
          <span>{bidToast}</span>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل المزاد والمزايدة الحية (إذا تم اختيار مزاد)
          ============================================================ */}
      {selectedAuction ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedAuction(null)}
            className="text-xs text-[#FFC500] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>الرجوع للمزادات</span>
          </button>

          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            {/* الصورة الرئيسية والعداد */}
            <div className="h-56 sm:h-72 w-full relative bg-[#161619]">
              <img src={selectedAuction.images[0]} alt={selectedAuction.title} className="w-full h-full object-cover" />
              
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#DC2626] text-white text-xs font-black flex items-center gap-1 shadow-lg">
                🔴 مباشر
              </span>

              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/85 text-white text-xs font-mono border border-white/10 backdrop-blur-md">
                ⏳ الوقت المتبقي: {formatTime(selectedAuction.timeLeftSeconds)}
              </span>
            </div>

            {/* تفاصيل المزاد */}
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#FFC500]/15 text-[#FFC500] text-xs font-bold">
                    {selectedAuction.category}
                  </span>
                  <span className="text-xs text-gray-400">📍 {selectedAuction.city} • {selectedAuction.sellerName}</span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white">
                  {selectedAuction.title}
                </h2>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {selectedAuction.description}
                </p>
              </div>

              {/* صندوق السعر الحالي والمزايدة الحية */}
              <div className="bg-[#18181C] p-4 rounded-2xl border border-[#27272A] space-y-3">
                <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                  <div>
                    <span className="text-[11px] text-[#9CA3AF] block">السعر الحالي:</span>
                    <div className="text-xl sm:text-2xl font-mono font-black text-[#FFC500]">
                      {selectedAuction.currentBid.toLocaleString()} {selectedAuction.currency}
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-[#9CA3AF] block">السعر الابتدائي:</span>
                    <span className="text-xs font-mono text-gray-400">{selectedAuction.startingPrice.toLocaleString()} {selectedAuction.currency}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">({selectedAuction.bidsCount} مزايدة)</span>
                  </div>
                </div>

                {/* أزرار الزيادة السريعة المباشرة */}
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1.5 font-bold">زيادة سريعة بنقرة واحدة:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      selectedAuction.minIncrement,
                      selectedAuction.minIncrement * 2,
                      selectedAuction.minIncrement * 5
                    ].map((inc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickAdd(inc)}
                        className="py-2 rounded-xl bg-[#0F0F12] border border-[#27272A] hover:border-[#FFC500] text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                      >
                        +{inc.toLocaleString()} {selectedAuction.currency}
                      </button>
                    ))}
                  </div>
                </div>

                {/* حقل تأكيد المزايدة */}
                <form onSubmit={handlePlaceBid} className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">مبلغ المزايدة القادمة ({selectedAuction.currency}):</label>
                    <input
                      type="number"
                      min={selectedAuction.currentBid + selectedAuction.minIncrement}
                      step={selectedAuction.minIncrement}
                      value={bidAmountInput}
                      onChange={(e) => setBidAmountInput(Number(e.target.value))}
                      className="w-full bg-[#0F0F12] border border-[#27272A] focus:border-[#FFC500] rounded-xl p-2.5 text-base font-mono font-bold text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Gavel size={15} />
                    <span>تأكيد المزايدة</span>
                  </button>
                </form>
              </div>

              {/* سجل المزايدات الحية */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-[#D1D5DB] flex items-center gap-1.5">
                  <User size={13} className="text-[#FFC500]" /> سجل المزايدات الحية
                </h3>
                <div className="space-y-1.5">
                  {selectedAuction.bidsHistory.map((bid, i) => (
                    <div key={bid.id} className="p-2.5 rounded-xl bg-[#18181C] border border-[#27272A] flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-[#FFC500] text-black font-black' : 'bg-[#0F0F12] text-gray-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-white">{bid.bidderCode}</span>
                      </div>
                      <div className="text-left font-mono">
                        <b className={`font-black ${i === 0 ? 'text-[#16A34A]' : 'text-gray-300'}`}>
                          {bid.amount.toLocaleString()} {selectedAuction.currency}
                        </b>
                        <span className="text-[9px] text-gray-500 block">{bid.time}</span>
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
        <div className="space-y-4">
          
          {/* تبويبات الحالة وفلاتر الفئات الـ 6 الرسمية */}
          <div className="space-y-2 bg-[#0F0F12] p-3 rounded-2xl border border-[#222226]">
            {/* التبويبات */}
            <div className="flex gap-1 bg-[#18181C] p-1 rounded-xl border border-[#27272A]">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'active' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                المزادات النشطة ({auctionsList.filter(a => a.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'scheduled' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                المجدولة
              </button>
              <button
                onClick={() => setActiveTab('ended')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'ended' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                المنتهية
              </button>
            </div>

            {/* الفئات الـ 6 المعتمدة */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'سيارات', label: 'سيارات' },
                { id: 'عقارات', label: 'عقارات' },
                { id: 'معدات', label: 'معدات' },
                { id: 'إلكترونيات', label: 'إلكترونيات' },
                { id: 'مواشي', label: 'مواشي' },
                { id: 'نوادر', label: 'نوادر' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-[#18181C] border-[#FFC500] text-[#FFC500]' 
                      : 'bg-[#121215] border-[#222226] text-gray-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* شبكة كروت المزادات */}
          {filteredAuctions.length === 0 ? (
            <div className="text-center py-12 bg-[#0F0F12] rounded-2xl border border-[#222226] p-6 space-y-2">
              <Gavel size={32} className="mx-auto text-gray-500" />
              <h3 className="text-sm font-bold text-white">لا توجد مزادات في هذا القسم حالياً</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAuctions.map((auc) => (
                <div
                  key={auc.id}
                  className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="h-44 w-full relative bg-[#161619]">
                    <img src={auc.images[0]} alt={auc.title} className="w-full h-full object-cover" />
                    
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-[#DC2626] text-white text-[10px] font-black">
                      🔴 مباشر
                    </span>

                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/85 text-white text-[10px] font-mono border border-white/10 backdrop-blur-sm">
                      ⏳ {formatTime(auc.timeLeftSeconds)}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                        <span className="text-[#FFC500] font-bold">{auc.category}</span>
                        <span>•</span>
                        <span>{auc.city}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {auc.title}
                      </h3>
                    </div>

                    <div className="bg-[#18181C] p-2.5 rounded-xl border border-[#27272A] flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-[#9CA3AF] block">السعر الحالي:</span>
                        <b className="text-xs sm:text-sm font-mono text-[#FFC500]">
                          {auc.currentBid.toLocaleString()} {auc.currency}
                        </b>
                      </div>
                      <div className="text-left text-[9.5px] text-gray-400">
                        <span>الحد الأدنى:</span>
                        <b className="block font-mono text-gray-300">+{auc.minIncrement.toLocaleString()}</b>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAuction(auc)}
                      className="w-full py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                    >
                      <span>عرض المزاد</span>
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">عنوان المزاد / السلعة</label>
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
                  <label className="text-[11px] text-gray-400 block mb-1">العملة المعتمدة للمزاد</label>
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
                  <option value="حضرموت">حضرموت - المكلا</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="مأرب">مأرب</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">وصف السلعة والمواصفات</label>
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
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90"
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
