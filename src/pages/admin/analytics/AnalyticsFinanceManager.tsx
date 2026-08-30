import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Gavel,
  Home,
  Megaphone,
  Coins,
  ShieldCheck,
  Download,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  PieChart,
  Activity,
  Layers,
  Smartphone,
  CheckCircle2,
  Clock,
  Building2
} from 'lucide-react';

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface FinancialTransaction {
  id: string;
  source: 'إعلانات YR Ads' | 'عمولة مزاد' | 'توثيق منشأة (Gold)' | 'إعلان عقار مميز' | 'اشتراك متجر هواتف';
  clientName: string;
  amount: number;
  currency: 'USD' | 'YER' | 'SAR';
  status: 'settled' | 'pending' | 'cancelled';
  date: string;
  referenceId: string;
}

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  { id: 'TX-901', source: 'إعلانات YR Ads', clientName: 'بنك الكريمي للتمويل الأصغر', amount: 1500, currency: 'USD', status: 'settled', date: '2026-08-30', referenceId: 'AD-402' },
  { id: 'TX-902', source: 'عمولة مزاد', clientName: 'مجموعة النور التجارية', amount: 682, currency: 'USD', status: 'settled', date: '2026-08-29', referenceId: 'AUC-101' },
  { id: 'TX-903', source: 'توثيق منشأة (Gold)', clientName: 'مستشفى الأمل التخصصي', amount: 120000, currency: 'YER', status: 'settled', date: '2026-08-28', referenceId: 'CLM-55' },
  { id: 'TX-904', source: 'إعلان عقار مميز', clientName: 'مكتب الأفق للعقارات', amount: 800, currency: 'SAR', status: 'settled', date: '2026-08-27', referenceId: 'PROP-109' },
  { id: 'TX-905', source: 'إعلانات YR Ads', clientName: 'عدن فون للإلكترونيات', amount: 450, currency: 'USD', status: 'pending', date: '2026-08-30', referenceId: 'AD-408' },
  { id: 'TX-906', source: 'عمولة مزاد', clientName: 'معرض الفخامة للسيارات', amount: 2500, currency: 'SAR', status: 'settled', date: '2026-08-26', referenceId: 'AUC-102' },
];

export const AnalyticsFinanceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'categories' | 'transactions'>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [transactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // البطاقات المالية الشاملة
  const financialCards = [
    { title: 'إجمالي الإيرادات والعمولات', value: '$24,850', change: '+18.4%', sub: 'مجموع كافة المصادر المسواة', icon: DollarSign, color: '#10B981' },
    { title: 'عوائد الإعلانات الممولة YR Ads', value: '$9,850', change: '+22.1%', sub: '48 حملة نشطة ومؤكدة', icon: Megaphone, color: '#3B82F6' },
    { title: 'عمولات المزادات المحصلة', value: '$11,200', change: '+14.5%', sub: 'نسب ومبالغ مقطوعة مسواة', icon: Gavel, color: '#EAB308' },
    { title: 'رسوم التوثيق والشارات الذهبية', value: '$3,800', change: '+8.0%', sub: '35 منشأة موثقة رسمياً', icon: ShieldCheck, color: '#A855F7' },
  ];

  // نسب مساهمة مصادر الإيرادات
  const revenueSources = [
    { name: 'عمولات المزادات والصفقات', percent: 45, value: '$11,200', color: '#EAB308' },
    { name: 'الحملات الإعلانية YR Ads', percent: 40, value: '$9,850', color: '#3B82F6' },
    { name: 'خدمات التوثيق والشارات الرسمية', percent: 10, value: '$2,500', color: '#10B981' },
    { name: 'العقارات والمتاجر المميزة', percent: 5, value: '$1,300', color: '#A855F7' },
  ];

  // أداء القطاعات الـ 26 الأكثر مساهمة وتفاعلاً
  const topCategories = [
    { name: 'البنوك والصرافة وأسعار الصرف', share: '32%', ads: '14 حملة', growth: '+25%' },
    { name: 'العقارات والأراضي', share: '24%', ads: '11 حملة', growth: '+18%' },
    { name: 'الاتصالات وسوق الهواتف', share: '18%', ads: '9 حملات', growth: '+15%' },
    { name: 'المطاعم والكافيهات', share: '14%', ads: '8 حملات', growth: '+12%' },
    { name: 'الفنادق والسياحة', share: '8%', ads: '4 حملات', growth: '+9%' },
    { name: 'الصحة والخدمات الطبية', share: '4%', ads: '2 حملات', growth: '+5%' },
  ];

  // تصفية المعاملات
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch =
        tx.clientName.includes(searchQuery) ||
        tx.source.includes(searchQuery) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCurrency = currencyFilter === 'all' || tx.currency === currencyFilter;
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchSearch && matchCurrency && matchStatus;
    });
  }, [transactions, searchQuery, currencyFilter, statusFilter]);

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والفلاتر الزمنية */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">التقارير والتحليلات المالية</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                متابعة تدفقات الإيرادات، عمولات المزادات، عوائد YR Ads، ومؤشرات نمو المنصة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* فلتر النطاق الزمني */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: '7 أيام' },
                { id: 'month', label: 'هذا الشهر' },
                { id: 'quarter', label: 'الربع الحالي' },
                { id: 'year', label: 'العام' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as TimeRange)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    timeRange === t.id
                      ? 'bg-yellow-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => alert('تم تنزيل ملخص التقرير المالي كملف CSV')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-yellow-400" /> تصدير التقرير
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة على المركز المالي', icon: BarChart3 },
            { id: 'sources', label: 'تفصيل مصادر الدخل', icon: PieChart },
            { id: 'categories', label: 'أداء القطاعات الـ 26', icon: Layers },
            { id: 'transactions', label: 'سجل المعاملات المحصلة', icon: Activity, count: transactions.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. بطاقات المؤشرات المالية الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-bold">{c.title}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black text-white font-mono tracking-tight" style={{ color: c.color }}>
                  {c.value}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900 text-[11px]">
                  <span className="text-zinc-500">{c.sub}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {c.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* التبويب 1: نظرة عامة وتفصيل مصادر الدخل                    */}
      {/* ========================================================= */}
      {(activeTab === 'overview' || activeTab === 'sources') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* توزيع مصادر الإيرادات */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <PieChart className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">توزيع مصادر الدخل والعمولات المحصلة</h3>
              </div>
              <span className="text-xs text-zinc-400">حسب العمليات المسواة</span>
            </div>

            <div className="space-y-4">
              {revenueSources.map((src, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-200">{src.name}</span>
                    <span className="font-mono text-zinc-400">
                      {src.value} ({src.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${src.percent}%`, backgroundColor: src.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-900 text-center text-xs">
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">التحصيل بالدولار</span>
                <span className="font-bold text-white font-mono mt-0.5 block">$24,850</span>
              </div>
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">التحصيل بالريال اليمني</span>
                <span className="font-bold text-yellow-400 font-mono mt-0.5 block">14,250,000 YER</span>
              </div>
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">التحصيل بالريال السعودي</span>
                <span className="font-bold text-emerald-400 font-mono mt-0.5 block">18,500 SAR</span>
              </div>
            </div>
          </div>

          {/* مؤشرات الأمان والنمو */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">السياسات المالية وسرية العمولات</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mt-3">
                جميع العمولات والتحصيلات المالية مسجلة في بيئة مشفرة. لا تظهر نسب العمولات للزوار في الواجهة العامة وفق قواعد السرية التامة للمنصة.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-900 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">معدل نمو الإيرادات:</span>
                <span className="font-bold text-emerald-400">+18.4% شهرياً</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400">الأنشطة التجارية المشتركة:</span>
                <span className="font-bold text-yellow-400">1,420 منشأة</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: أداء القطاعات الـ 26 الأكثر نمواً                */}
      {/* ========================================================= */}
      {activeTab === 'categories' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-400">
              <Layers className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">أداء وتفاعل القطاعات الـ 26 الرسمية</h2>
            </div>
            <span className="text-xs text-zinc-400">ترتيب القطاعات حسب العوائد والتفاعل الإعلاني</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-bold text-sm text-white truncate">{cat.name}</span>
                  <span className="text-xs font-mono font-bold text-yellow-400">{cat.share}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>الحملات النشطة: <strong className="text-zinc-200">{cat.ads}</strong></span>
                  <span className="text-emerald-400 font-bold">{cat.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: سجل المعاملات والعمليات المالية المحصلة         */}
      {/* ========================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* شريط الفلاتر والبحث في المعاملات */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث برقم المعاملة، العميل، أو المرجع..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={currencyFilter}
                onChange={e => setCurrencyFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
              >
                <option value="all">كل العملات</option>
                <option value="USD">دولار (USD)</option>
                <option value="YER">ريال يمني (YER)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="settled">مسوى (Settled)</option>
                <option value="pending">معلق (Pending)</option>
              </select>
            </div>
          </div>

          {/* جدول المعاملات */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">رقم العملية</th>
                    <th className="py-3.5 px-4">مصدر المعاملة</th>
                    <th className="py-3.5 px-4">العميل / المنشأة</th>
                    <th className="py-3.5 px-4 text-center">المبلغ المحصل</th>
                    <th className="py-3.5 px-4 text-center">المرجع</th>
                    <th className="py-3.5 px-4 text-center">الحالة</th>
                    <th className="py-3.5 px-4 text-center">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-200">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">{tx.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{tx.source}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{tx.clientName}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-yellow-400">
                        {tx.amount.toLocaleString()} {tx.currency}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-500 text-[11px]">{tx.referenceId}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {tx.status === 'settled' ? '✓ تم التحصيل والتسوية' : '⏳ معلق'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-zinc-400 text-[11px]">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFinanceManager;
