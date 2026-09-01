import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gavel, AlertCircle, CheckCircle2, ShieldAlert, 
  CreditCard, Search, User, Filter, AlertTriangle, 
  Settings, Check, X, ExternalLink, RefreshCw, BarChart3,
  Calendar, MapPin, DollarSign, Activity
} from 'lucide-react';
import { adminAuctionsService, adminAuditService } from '../../../services/adminService';

export const AuctionsManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'listings' | 'commissions' | 'disputes' | 'ledger' | 'settings'>('listings');
  const [filterType, setFilterType] = useState<'all' | 'auction' | 'fixed_price'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [settings, setSettings] = useState<any>({
    default_fixed_commission_amount: 20000,
    default_auction_commission_rate: 5.0,
    bank_name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    account_holder_name: 'منصة يمن ريتغ للوساطة والتسويق',
    account_number: '3001234567',
    wallet_provider: 'محفظة جوالي / كاش',
    wallet_number: '777000111',
    payment_instructions: 'يرجى توريد مبلغ العمولة باسم المنصة وإرفاق صورة واضحة من إشعار أو إيصال التحويل ورقم العملية.'
  });

  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // قائمة المزادات الحقيقية
  const [listings, setListings] = useState<any[]>([
    {
      id: 'AUC-201',
      title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة',
      saleType: 'auction',
      currency: 'YER',
      city: 'صنعاء',
      startingPrice: 32000000,
      currentBid: 34500000,
      finalPrice: 34500000,
      sellerName: 'معرض النخبة',
      winnerName: 'مزايد #9700',
      status: 'active',
      commissionStatus: 'due',
      commissionAmount: 1725000,
      transferNumber: 'TRX-884129',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      disputeStatus: 'no_dispute',
      createdAt: '2026-09-01'
    },
    {
      id: 'AUC-202',
      title: 'iPhone 15 Pro Max 256GB تيتانيوم',
      saleType: 'fixed_price',
      currency: 'YER',
      city: 'عدن',
      fixedPrice: 620000,
      finalPrice: 620000,
      sellerName: 'العصرية للإلكترونيات',
      winnerName: 'أحمد الوصابي',
      status: 'completed',
      commissionStatus: 'paid',
      commissionAmount: 20000,
      transferNumber: 'TRX-110293',
      disputeStatus: 'no_dispute',
      createdAt: '2026-08-28'
    },
    {
      id: 'AUC-203',
      title: 'أرض تجارية 6 لبن شارع الستين',
      saleType: 'auction',
      currency: 'YER',
      city: 'صنعاء',
      startingPrice: 160000000,
      currentBid: 185000000,
      finalPrice: 185000000,
      sellerName: 'مكتب الأمانة العقاري',
      winnerName: 'مزايد #8812',
      status: 'disputed',
      commissionStatus: 'due',
      commissionAmount: 9250000,
      disputeStatus: 'open',
      disputeReason: 'اختلاف المعروض عن الوصف: لم يتم الاتفاق على حدود الأرض الشمالية',
      createdAt: '2026-08-30'
    }
  ]);

  const handleVerifyCommission = (id: string, isApproved: boolean) => {
    setListings(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          commissionStatus: isApproved ? 'paid' : 'rejected',
          status: isApproved ? 'completed' : 'payment_pending'
        };
      }
      return item;
    }));
    adminAuditService.logAction(isApproved ? 'اعتماد إيصال سداد العمولة' : 'رفض إيصال السداد', 'auctions', id, { isApproved });
  };

  const handleResolveDispute = (id: string, decision: 'completed' | 'cancelled') => {
    setListings(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          disputeStatus: 'closed',
          status: decision
        };
      }
      return item;
    }));
    adminAuditService.logAction('إغلاق النزاع التجاري واعتماد القرار الإداري', 'auctions', id, { decision });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminAuctionsService.updateCommissionSettings(settings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3500);
  };

  // إحصائيات المزادات المتقدمة
  const stats = useMemo(() => {
    const totalAuctions = listings.length;
    const activeAuctions = listings.filter(l => l.status === 'active').length;
    const completedAuctions = listings.filter(l => l.status === 'completed').length;
    const disputedAuctions = listings.filter(l => l.disputeStatus === 'open').length;
    
    const totalVolume = listings.reduce((acc, l) => acc + (l.finalPrice || l.currentBid || l.fixedPrice || 0), 0);
    const totalCommissions = listings.reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
    const paidCommissions = listings.filter(l => l.commissionStatus === 'paid').reduce((acc, l) => acc + (l.commissionAmount || 0), 0);
    const dueCommissions = totalCommissions - paidCommissions;

    return { totalAuctions, activeAuctions, completedAuctions, disputedAuctions, totalVolume, totalCommissions, paidCommissions, dueCommissions };
  }, [listings]);

  const filteredListings = listings.filter(item => {
    const matchType = filterType === 'all' || item.saleType === filterType;
    const matchCity = cityFilter === 'all' || item.city === cityFilter;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchCity && matchSearch;
  });

  return (
    <div className="space-y-5 font-['Cairo',sans-serif] text-white">
      
      {/* رأس الصفحة والتنقل */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] p-4 rounded-2xl border border-[#1F2937]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Gavel className="text-[#FFC500]" />
            مركز إدارة ومراقبة المزادات الحية والعمولات
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            مراقبة البث المباشر للمزادات، التحقق من إيصالات التحويل، فض النزاعات، وسجل التحصيل المالي
          </p>
        </div>

        {/* التبويبات الإدارية الستة */}
        <div className="flex gap-1 bg-[#161D2B] p-1 rounded-xl border border-[#1F2937] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'listings' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            المعروضات ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'commissions' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            إثباتات السداد ({listings.filter(l => l.commissionStatus === 'pending_admin_verification').length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'disputes' ? 'bg-[#DC2626] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            النزاعات ({listings.filter(l => l.disputeStatus === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ledger' ? 'bg-[#16A34A] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            سجل التحصيل المالي
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            حساب التحصيل
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات المتقدمة للأقسام */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">إجمالي قيمة الصفقات:</span>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            {stats.totalVolume.toLocaleString()} <span className="text-xs">YER</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">النشطة: {stats.activeAuctions} • المكتملة: {stats.completedAuctions}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">إجمالي عمولات يمن ريتغ:</span>
          <div className="text-lg sm:text-xl font-black text-[#FFC500] mt-1">
            {stats.totalCommissions.toLocaleString()} <span className="text-xs">YER</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-['Cairo']">المسددة: {stats.paidCommissions.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">العمولات المستحقة للتحصيل:</span>
          <div className="text-lg sm:text-xl font-black text-[#DC2626] mt-1">
            {stats.dueCommissions.toLocaleString()} <span className="text-xs">YER</span>
          </div>
          <span className="text-[10px] text-amber-400 font-['Cairo']">بانتظار التحقق: {listings.filter(l => l.commissionStatus === 'pending_admin_verification').length}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">النزاعات التجارية المفتوحة:</span>
          <div className="text-lg sm:text-xl font-black text-[#DC2626] mt-1">
            {stats.disputedAuctions} <span className="text-xs font-['Cairo']">نزاع</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">يتطلب قرار الإدارة</span>
        </div>
      </div>

      {settingsSavedToast && (
        <div className="p-3 bg-[#16A34A]/20 border border-[#16A34A] rounded-xl text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
          <span>تم حفظ وتحديث إعدادات وبيانات حساب تحصيل عمولات يمن ريتغ بنجاح</span>
        </div>
      )}

      {/* ============================================================
          تبويب 1: جدول المعروضات مع رابط المراقبة الحية /admin/auctions/:id
          ============================================================ */}
      {activeTab === 'listings' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] overflow-hidden shadow-xl space-y-3 p-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-1.5 text-xs flex-1 max-w-md">
              <Search size={14} className="text-gray-400 ml-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث برقم المزاد، السلعة، أو البائع..."
                className="bg-transparent text-white outline-none w-full"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-[#161D2B] border border-[#1F2937] rounded-xl px-2.5 py-1 text-xs text-gray-300 outline-none"
              >
                <option value="all">كل المدن</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="حضرموت">حضرموت</option>
              </select>

              {(['all', 'auction', 'fixed_price'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    filterType === t ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-gray-400 border-[#1F2937]'
                  }`}
                >
                  {t === 'all' ? 'الكل' : t === 'auction' ? 'المزادات' : 'سعر ثابت'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3 px-3">رقم العرض والسلعة</th>
                  <th className="py-3 px-3">طريقة البيع</th>
                  <th className="py-3 px-3">البائع والمدينة</th>
                  <th className="py-3 px-3">المشتري / الفائز</th>
                  <th className="py-3 px-3">السعر الحالي/النهائي</th>
                  <th className="py-3 px-3 text-[#FFC500]">عمولة المنصة</th>
                  <th className="py-3 px-3 text-center">حالة المزاد</th>
                  <th className="py-3 px-3 text-center">إجراءات المراقبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white font-mono">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400 font-['Cairo']">لا توجد مزادات مطابقة حالياً</td>
                  </tr>
                ) : (
                  filteredListings.map(item => (
                    <tr key={item.id} className="hover:bg-[#161D2B]/50 font-['Cairo']">
                      <td className="py-3 px-3 font-bold">
                        <div>{item.title}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.saleType === 'fixed_price' ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {item.saleType === 'fixed_price' ? 'سعر ثابت' : 'مزاد علني'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{item.sellerName} • {item.city}</td>
                      <td className="py-3 px-3 text-gray-300">{item.winnerName || '—'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {(item.finalPrice || item.currentBid || item.fixedPrice)?.toLocaleString()} {item.currency}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#FFC500]">
                        {item.commissionAmount?.toLocaleString()} YER
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          item.status === 'disputed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {item.status === 'active' ? 'نشط حي' : item.status === 'completed' ? 'مكتمل' : item.status === 'disputed' ? 'نزاع' : 'بانتظار السداد'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => navigate(`/admin/auctions/${item.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 mx-auto shadow-sm cursor-pointer"
                        >
                          <Activity size={13} />
                          <span>مراقبة المزاد</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 2: التحقق من إثباتات السداد
          ============================================================ */}
      {activeTab === 'commissions' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <CreditCard size={16} className="text-[#FFC500]" /> إثباتات سداد عمولات يمن ريتغ المرفوعة للتحقق
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listings.filter(l => l.commissionStatus === 'pending_admin_verification').length === 0 ? (
              <div className="col-span-2 text-center py-8 text-xs text-gray-400">لا توجد إيصالات سداد معلقة حالياً</div>
            ) : (
              listings.filter(l => l.commissionStatus === 'pending_admin_verification').map(item => (
                <div key={item.id} className="p-3.5 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] text-gray-400">البائع: {item.sellerName}</span>
                    </div>
                    <b className="text-[#FFC500] text-sm font-mono">{item.commissionAmount?.toLocaleString()} YER</b>
                  </div>
                  <div className="p-2.5 bg-[#0F0F12] rounded-lg text-xs space-y-1 font-mono">
                    <div>رقم الحوالة: <b className="text-white">{item.transferNumber}</b></div>
                    <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[#FFC500] flex items-center gap-1 hover:underline">
                      <ExternalLink size={12} /> مشاهدة صورة الإيصال المرفوع
                    </a>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleVerifyCommission(item.id, true)} className="flex-1 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-black hover:bg-[#16A34A]/90 flex items-center justify-center gap-1">
                      <Check size={14} /> اعتماد السداد
                    </button>
                    <button onClick={() => handleVerifyCommission(item.id, false)} className="px-3 py-2 bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/40 rounded-lg text-xs font-bold">
                      رفض الإيصال
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 3: النزاعات التجارية
          ============================================================ */}
      {activeTab === 'disputes' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <AlertTriangle size={16} className="text-[#DC2626]" /> النزاعات التجارية وقرارات التحكيم
          </h3>
          <div className="space-y-3">
            {listings.filter(l => l.disputeStatus === 'open').length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">لا توجد نزاعات تجارية مفتوحة حالياً</div>
            ) : (
              listings.filter(l => l.disputeStatus === 'open').map(item => (
                <div key={item.id} className="p-4 bg-[#161D2B] rounded-xl border border-[#DC2626]/40 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <span className="text-[10px] text-gray-400">المزاد: {item.id} • البائع: {item.sellerName} • المشتري: {item.winnerName}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#DC2626]/20 text-[#DC2626] text-xs font-bold">نزاع مفتوح</span>
                  </div>
                  <div className="p-3 bg-[#0F0F12] rounded-xl border border-[#27272A] text-xs space-y-1">
                    <b className="text-red-400 block">سبب وتفاصيل النزاع المرفوع:</b>
                    <p className="text-gray-300 leading-relaxed">{item.disputeReason}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                    <button onClick={() => handleResolveDispute(item.id, 'cancelled')} className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-bold">إلغاء الصفقة وتبرئة الأطراف</button>
                    <button onClick={() => handleResolveDispute(item.id, 'completed')} className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold">تثبيت إتمام الصفقة واستحقاق العمولة</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 4: سجل التحصيل المالي
          ============================================================ */}
      {activeTab === 'ledger' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <DollarSign size={16} className="text-[#16A34A]" /> سجل التحصيل المالي الشامل للعمولات
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3 px-3">رقم المزاد/الصفقة</th>
                  <th className="py-3 px-3">البائع</th>
                  <th className="py-3 px-3">قيمة الصفقة</th>
                  <th className="py-3 px-3 text-[#FFC500]">العمولة المستحقة</th>
                  <th className="py-3 px-3 text-center">حالة السداد</th>
                  <th className="py-3 px-3">رقم الحوالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white font-mono">
                {listings.map(item => (
                  <tr key={item.id} className="hover:bg-[#161D2B]/50 font-['Cairo']">
                    <td className="py-3 px-3 font-bold">{item.id}</td>
                    <td className="py-3 px-3">{item.sellerName}</td>
                    <td className="py-3 px-3 font-mono font-bold">{(item.finalPrice || item.currentBid || item.fixedPrice)?.toLocaleString()} {item.currency}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#FFC500]">{item.commissionAmount?.toLocaleString()} YER</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.commissionStatus === 'paid' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                        item.commissionStatus === 'pending_admin_verification' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.commissionStatus === 'paid' ? 'تم السداد ✓' : item.commissionStatus === 'pending_admin_verification' ? 'قيد المراجعة' : 'مستحقة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-300">{item.transferNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 5: إعدادات حساب التحصيل
          ============================================================ */}
      {activeTab === 'settings' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Settings size={16} className="text-[#FFC500]" /> إعدادات وبيانات حساب تحصيل عمولات يمن ريتغ
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">البيانات التي تظهر للبائع عند سداد العمولة</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">عمولة البيع بسعر ثابت (YER)</label>
                <input type="number" value={settings.default_fixed_commission_amount} onChange={(e) => setSettings({ ...settings, default_fixed_commission_amount: Number(e.target.value) })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">نسبة عمولة المزاد (%)</label>
                <input type="number" step="0.1" value={settings.default_auction_commission_rate} onChange={(e) => setSettings({ ...settings, default_auction_commission_rate: Number(e.target.value) })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">اسم البنك المعتمد</label>
                <input type="text" value={settings.bank_name} onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">اسم صاحب الحساب</label>
                <input type="text" value={settings.account_holder_name} onChange={(e) => setSettings({ ...settings, account_holder_name: e.target.value })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">رقم الحساب البنكي</label>
                <input type="text" value={settings.account_number} onChange={(e) => setSettings({ ...settings, account_number: e.target.value })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">المحفظة الإلكترونية ورقمها</label>
                <input type="text" value={settings.wallet_number} onChange={(e) => setSettings({ ...settings, wallet_number: e.target.value })} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono outline-none" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="px-6 py-2.5 bg-[#FFC500] text-black font-black text-xs rounded-xl hover:bg-[#FFC500]/90 transition-all shadow-md cursor-pointer">
                حفظ وتحديث بيانات حساب التحصيل
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
