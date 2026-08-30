import React, { useState, useMemo } from 'react';
import {
  Gavel,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Percent,
  DollarSign,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  User,
  MapPin,
  Calendar,
  Check,
  Edit3
} from 'lucide-react';

export interface AuctionBid {
  id: string;
  bidderName: string;
  bidderPhone: string;
  amount: number;
  time: string;
}

export interface AdminAuctionItem {
  id: string;
  title: string;
  category: string;
  sellerName: string;
  sellerPhone: string;
  city: string;
  currency: 'YER' | 'SAR' | 'USD';
  startPrice: number;
  currentBid: number;
  minStep: number;
  totalBids: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  endDate: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number; // إما نسبة % أو مبلغ ثابت
  bids: AuctionBid[];
}

const INITIAL_AUCTIONS: AdminAuctionItem[] = [
  {
    id: 'AUC-101',
    title: 'معدة صناعية وثقيلة - مولد كهربائي كاتربيلر 500KVA',
    category: 'معدات وآلات',
    sellerName: 'مجموعة النور التجارية',
    sellerPhone: '771234567',
    city: 'صنعاء',
    currency: 'USD',
    startPrice: 15000,
    currentBid: 19500,
    minStep: 500,
    totalBids: 9,
    status: 'active',
    endDate: '2026-09-05',
    commissionType: 'percentage',
    commissionValue: 3.5, // 3.5%
    bids: [
      { id: 'b1', bidderName: 'شركة السعيد للمقاولات', bidderPhone: '770011223', amount: 19500, time: 'منذ ساعتين' },
      { id: 'b2', bidderName: 'مؤسسة البركة للخدمات', bidderPhone: '773344556', amount: 19000, time: 'منذ 5 ساعات' },
    ]
  },
  {
    id: 'AUC-102',
    title: 'سيارة تويوتا لاندكروزر V8 موديل 2023 نظيفة جداً',
    category: 'سيارات ومركبات',
    sellerName: 'معرض الفخامة للسيارات',
    sellerPhone: '733987654',
    city: 'عدن',
    currency: 'SAR',
    startPrice: 120000,
    currentBid: 145000,
    minStep: 2000,
    totalBids: 14,
    status: 'active',
    endDate: '2026-09-02',
    commissionType: 'fixed',
    commissionValue: 2500, // 2500 ريال سعودي ثابت
    bids: [
      { id: 'b3', bidderName: 'أحمد صالح المهدي', bidderPhone: '735556677', amount: 145000, time: 'منذ 30 دقيقة' },
    ]
  },
  {
    id: 'AUC-103',
    title: 'أرضية تجارية استثمارية مساحة 10 لبن على شارع 24',
    category: 'عقارات وأراضي',
    sellerName: 'مكتب الأفق للعقارات',
    sellerPhone: '711223344',
    city: 'صنعاء',
    currency: 'YER',
    startPrice: 80000000,
    currentBid: 92000000,
    minStep: 1000000,
    totalBids: 6,
    status: 'completed',
    endDate: '2026-08-28',
    commissionType: 'percentage',
    commissionValue: 2.0, // 2%
    bids: [
      { id: 'b4', bidderName: 'التاجر محمد اليافعي', bidderPhone: '778899001', amount: 92000000, time: 'منتهي' },
    ]
  },
  {
    id: 'AUC-104',
    title: 'صفقة هواتف ذكية بالجملة (50 جهاز iPhone 15 Pro)',
    category: 'إلكترونيات وهواتف',
    sellerName: 'متجر تكنو ستور',
    sellerPhone: '774411882',
    city: 'حضرموت - المكلا',
    currency: 'USD',
    startPrice: 35000,
    currentBid: 35000,
    minStep: 500,
    totalBids: 0,
    status: 'pending',
    endDate: '2026-09-10',
    commissionType: 'fixed',
    commissionValue: 500, // 500 دولار ثابت
    bids: []
  }
];

export const AuctionsManager: React.FC = () => {
  const [auctions, setAuctions] = useState<AdminAuctionItem[]>(INITIAL_AUCTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  // إعدادات العمولة العامة الافتراضية
  const [globalCommissionType, setGlobalCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [globalCommissionValue, setGlobalCommissionValue] = useState<number>(2.5);
  const [isSavedSettings, setIsSavedSettings] = useState(false);

  // نافذة تفاصيل وسجل المزايدات
  const [selectedAuction, setSelectedAuction] = useState<AdminAuctionItem | null>(null);

  // حساب العمولة لمزاد محدد
  const calculateCommission = (auction: AdminAuctionItem): { text: string; amount: number } => {
    if (auction.commissionType === 'percentage') {
      const amount = (auction.currentBid * auction.commissionValue) / 100;
      return {
        text: `${auction.commissionValue}% (${amount.toLocaleString()} ${auction.currency})`,
        amount
      };
    } else {
      return {
        text: `${auction.commissionValue.toLocaleString()} ${auction.currency} (مبلغ ثابت)`,
        amount: auction.commissionValue
      };
    }
  };

  // تغيير حالة المزاد
  const handleStatusChange = (id: string, newStatus: AdminAuctionItem['status']) => {
    setAuctions(prev =>
      prev.map(auc => (auc.id === id ? { ...auc, status: newStatus } : auc))
    );
    if (selectedAuction && selectedAuction.id === id) {
      setSelectedAuction(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // تعديل عمولة مزاد محدد
  const handleUpdateItemCommission = (id: string, type: 'percentage' | 'fixed', val: number) => {
    setAuctions(prev =>
      prev.map(auc => (auc.id === id ? { ...auc, commissionType: type, commissionValue: val } : auc))
    );
  };

  // حفظ الإعدادات العامة للعمولة
  const handleSaveGlobalCommission = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedSettings(true);
    setTimeout(() => setIsSavedSettings(false), 2500);
  };

  // الفلترة والبحث
  const filteredAuctions = useMemo(() => {
    return auctions.filter(auc => {
      const matchSearch =
        auc.title.includes(searchQuery) ||
        auc.sellerName.includes(searchQuery) ||
        auc.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || auc.status === statusFilter;
      const matchCurrency = currencyFilter === 'all' || auc.currency === currencyFilter;
      return matchSearch && matchStatus && matchCurrency;
    });
  }, [auctions, searchQuery, statusFilter, currencyFilter]);

  // إجمالي الإحصائيات
  const activeCount = auctions.filter(a => a.status === 'active').length;
  const pendingCount = auctions.filter(a => a.status === 'pending').length;
  const completedCount = auctions.filter(a => a.status === 'completed').length;

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة المزادات والعمولات</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">متابعة العطاءات، التحكم بالعمولات المخصصة، والموافقة على المزادات</p>
          </div>
        </div>

        {/* مؤشرات سريعة */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeCount} مزاد نشط
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {pendingCount} بانتظار المراجعة
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {completedCount} مكتمل
          </span>
        </div>
      </div>

      {/* 2. صندوق إعدادات العمولة المخصصة (نسبة أو مبلغ ثابت) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-yellow-400">
            <Coins className="w-5 h-5" />
            <h2 className="text-sm sm:text-base font-bold text-white">إعدادات سياسة عمولة المنصة</h2>
          </div>
          <span className="text-xs text-zinc-400">خيارات مرنة: نسبة مئوية أو مبلغ ثابت</span>
        </div>

        <form onSubmit={handleSaveGlobalCommission} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">نوع احتساب العمولة:</label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setGlobalCommissionType('percentage')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  globalCommissionType === 'percentage'
                    ? 'bg-yellow-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Percent className="w-3.5 h-3.5" /> نسبة مئوية %
              </button>
              <button
                type="button"
                onClick={() => setGlobalCommissionType('fixed')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  globalCommissionType === 'fixed'
                    ? 'bg-yellow-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" /> مبلغ مقطوع ثابت
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              قيمة العمولة الافتراضية ({globalCommissionType === 'percentage' ? 'نسبة % من قيمة الترسية' : 'مبلغ مقطوع'}):
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={globalCommissionValue}
                onChange={e => setGlobalCommissionValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
              />
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">
                {globalCommissionType === 'percentage' ? '%' : 'حسب العملة'}
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-yellow-500/10"
            >
              {isSavedSettings ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" /> تم حفظ السياسة بنجاح
                </>
              ) : (
                'حفظ سياسة العمولة'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. أدوات البحث والفلترة */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="بحث برقم المزاد، العنوان، أو البائع..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {['all', 'active', 'pending', 'completed', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-yellow-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st === 'all' && 'جميع الحالات'}
                {st === 'active' && 'النشطة'}
                {st === 'pending' && 'معلق'}
                {st === 'completed' && 'مكتمل'}
                {st === 'cancelled' && 'ملغي'}
              </button>
            ))}
          </div>

          <select
            value={currencyFilter}
            onChange={e => setCurrencyFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
          >
            <option value="all">كل العملات</option>
            <option value="YER">ريال يمني (YER)</option>
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
          </select>
        </div>
      </div>

      {/* 4. قائمة المزادات */}
      <div className="space-y-3">
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-zinc-400 text-sm">
            لا توجد مزادات مطابقة لمعايير البحث الحالية.
          </div>
        ) : (
          filteredAuctions.map(auc => {
            const comm = calculateCommission(auc);

            return (
              <div
                key={auc.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* بيانات المزاد الأساسية */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-zinc-800 text-yellow-400 border border-zinc-700">
                        {auc.id}
                      </span>
                      <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {auc.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <MapPin className="w-3 h-3 text-zinc-500" /> {auc.city}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          auc.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : auc.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : auc.status === 'completed'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {auc.status === 'active' && '● مزاد نشط'}
                        {auc.status === 'pending' && '⏳ بانتظار الموافقة'}
                        {auc.status === 'completed' && '✓ منتهي وتم الترسية'}
                        {auc.status === 'cancelled' && '✕ ملغي'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-white">{auc.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" /> البائع: <strong className="text-zinc-300">{auc.sellerName}</strong> ({auc.sellerPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" /> ينتهي في: {auc.endDate}
                      </span>
                    </div>
                  </div>

                  {/* الأسعار والعطاءات والعمولة */}
                  <div className="flex items-center gap-3 sm:gap-6 bg-zinc-900/60 p-3 sm:p-4 rounded-xl border border-zinc-800 shrink-0 flex-wrap sm:flex-nowrap justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-500 block">أعلى عطاء حالي</span>
                      <span className="font-black text-sm sm:text-lg text-yellow-400 font-mono">
                        {auc.currentBid.toLocaleString()} {auc.currency}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {auc.totalBids} مزايدات مسجلة
                      </span>
                    </div>

                    <div className="border-r border-zinc-800 pr-3 sm:pr-4">
                      <span className="text-[11px] text-zinc-500 block">عمولة المنصة</span>
                      <span className="font-bold text-xs sm:text-sm text-emerald-400">
                        {comm.text}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {auc.commissionType === 'percentage' ? 'حساب نسبي' : 'مبلغ ثابت مقطوع'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {auc.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(auc.id, 'active')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> قبول وبدء المزاد
                      </button>
                    )}
                    {auc.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(auc.id, 'completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg text-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> إنهاء وترسية المزاد
                      </button>
                    )}
                    {auc.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(auc.id, 'cancelled')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg text-xs transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> إلغاء المزاد
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAuction(auc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-yellow-400" /> سجل المزايدات ({auc.bids.length})
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. نافذة تفاصيل سجل العطاءات والمزايدات */}
      {selectedAuction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Gavel className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base text-white">سجل مزايدات: {selectedAuction.id}</h3>
              </div>
              <button
                onClick={() => setSelectedAuction(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-300 font-semibold">{selectedAuction.title}</p>
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex justify-between text-xs">
                <span>أعلى سوم: <strong className="text-yellow-400 font-mono">{selectedAuction.currentBid.toLocaleString()} {selectedAuction.currency}</strong></span>
                <span>العمولة المقررة: <strong className="text-emerald-400">{calculateCommission(selectedAuction).text}</strong></span>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <span className="text-xs font-bold text-zinc-400 block">العطاءات المسجلة:</span>
              {selectedAuction.bids.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">لا توجد مزايدات حتى الآن على هذا المزاد.</p>
              ) : (
                selectedAuction.bids.map(bid => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-200">{bid.bidderName}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">{bid.bidderPhone} • {bid.time}</span>
                    </div>
                    <span className="font-black text-yellow-400 font-mono">
                      {bid.amount.toLocaleString()} {selectedAuction.currency}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <button
                onClick={() => setSelectedAuction(null)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionsManager;
