import React, { useState, useEffect } from 'react';
import { 
  Gavel, AlertCircle, CheckCircle2, ShieldAlert, 
  CreditCard, Search, User, Filter, AlertTriangle, 
  Settings, Check, X, ExternalLink
} from 'lucide-react';
import { adminAuctionsService, adminAuditService } from '../../../services/adminService';

export const AuctionsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'commissions' | 'disputes' | 'settings'>('listings');
  const [filterType, setFilterType] = useState<'all' | 'auction' | 'fixed_price'>('all');
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

  const [listings, setListings] = useState<any[]>([
    {
      id: 'AUC-201',
      title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة',
      saleType: 'auction',
      currency: 'YER',
      currentBid: 34500000,
      finalPrice: 34500000,
      sellerName: 'معرض النخبة',
      winnerName: 'مزايد #9700',
      status: 'deal_confirmed_commission_due',
      commissionStatus: 'pending_admin_verification',
      commissionAmount: 1725000,
      transferNumber: 'TRX-884129',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      disputeStatus: 'no_dispute'
    },
    {
      id: 'AUC-202',
      title: 'iPhone 15 Pro Max 256GB تيتانيوم',
      saleType: 'fixed_price',
      currency: 'YER',
      fixedPrice: 620000,
      finalPrice: 620000,
      sellerName: 'العصرية للإلكترونيات',
      winnerName: 'أحمد الوصابي',
      status: 'deal_completed',
      commissionStatus: 'paid',
      commissionAmount: 20000,
      transferNumber: 'TRX-110293',
      disputeStatus: 'no_dispute'
    },
    {
      id: 'AUC-203',
      title: 'أرض تجارية 6 لبن شارع الستين',
      saleType: 'auction',
      currency: 'YER',
      currentBid: 185000000,
      finalPrice: 185000000,
      sellerName: 'مكتب الأمانة العقاري',
      winnerName: 'مزايد #8812',
      status: 'dispute_opened',
      commissionStatus: 'due',
      commissionAmount: 9250000,
      disputeStatus: 'open',
      disputeReason: 'اختلاف المعروض عن الوصف: لم يتم الاتفاق على حدود الأرض الشمالية'
    }
  ]);

  const handleVerifyCommission = (id: string, isApproved: boolean) => {
    setListings(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          commissionStatus: isApproved ? 'paid' : 'rejected',
          status: isApproved ? 'deal_completed' : 'deal_confirmed_commission_due'
        };
      }
      return item;
    }));
    adminAuditService.logAction(isApproved ? 'اعتماد إيصال سداد العمولة' : 'رفض إيصال سداد العمولة', 'auctions', id, { isApproved });
  };

  const handleResolveDispute = (id: string, decision: 'deal_completed' | 'cancelled') => {
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

  return (
    <div className="space-y-5 font-['Cairo',sans-serif] text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] p-4 rounded-2xl border border-[#1F2937]">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Gavel className="text-[#FFC500]" />
            مركز إدارة المزادات وعروض البيع والعمولات والنزاعات
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            متابعة دورة الصفقات، التحقق من إيصالات التحويل، فض النزاعات، والتحكم بحساب تحصيل عمولات يمن ريتغ
          </p>
        </div>

        <div className="flex gap-1 bg-[#161D2B] p-1 rounded-xl border border-[#1F2937]">
          <button onClick={() => setActiveTab('listings')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}`}>المعروضات ({listings.length})</button>
          <button onClick={() => setActiveTab('commissions')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'commissions' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}`}>إثباتات السداد ({listings.filter(l => l.commissionStatus === 'pending_admin_verification').length})</button>
          <button onClick={() => setActiveTab('disputes')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'disputes' ? 'bg-[#DC2626] text-white' : 'text-gray-400 hover:text-white'}`}>النزاعات ({listings.filter(l => l.disputeStatus === 'open').length})</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}`}>حساب التحصيل</button>
        </div>
      </div>

      {settingsSavedToast && (
        <div className="p-3 bg-[#16A34A]/20 border border-[#16A34A] rounded-xl text-xs font-bold text-white flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
          <span>تم حفظ وتحديث إعدادات وبيانات حساب تحصيل عمولات يمن ريتغ بنجاح</span>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] overflow-hidden shadow-xl space-y-3 p-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-1.5 text-xs flex-1 max-w-md">
              <Search size={14} className="text-gray-400 ml-2" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث برقم المزاد، السلعة، أو البائع..." className="bg-transparent text-white outline-none w-full" />
            </div>

            <div className="flex gap-1">
              {(['all', 'auction', 'fixed_price'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${filterType === t ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-gray-400 border-[#1F2937]'}`}>
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
                  <th className="py-3 px-3">البائع</th>
                  <th className="py-3 px-3">المشتري / الفائز</th>
                  <th className="py-3 px-3">السعر النهائي</th>
                  <th className="py-3 px-3 text-[#FFC500]">عمولة المنصة</th>
                  <th className="py-3 px-3 text-center">حالة العمولة</th>
                  <th className="py-3 px-3 text-center">حالة الصفقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white font-mono">
                {listings.map(item => (
                  <tr key={item.id} className="hover:bg-[#161D2B]/50 font-['Cairo']">
                    <td className="py-3 px-3 font-bold">
                      <div>{item.title}</div>
                      <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.saleType === 'fixed_price' ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                        {item.saleType === 'fixed_price' ? 'سعر ثابت' : 'مزاد علني'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{item.sellerName}</td>
                    <td className="py-3 px-3 text-gray-300">{item.winnerName || '—'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{(item.finalPrice || item.currentBid || item.fixedPrice)?.toLocaleString()} {item.currency}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#FFC500]">{item.commissionAmount?.toLocaleString()} YER</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.commissionStatus === 'paid' ? 'bg-[#16A34A]/20 text-[#16A34A]' : item.commissionStatus === 'pending_admin_verification' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                        {item.commissionStatus === 'paid' ? 'تم السداد ✓' : item.commissionStatus === 'pending_admin_verification' ? 'بانتظار التحقق' : 'مستحقة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'deal_completed' ? 'bg-[#16A34A]/20 text-[#16A34A]' : item.status === 'dispute_opened' ? 'bg-[#DC2626]/20 text-[#DC2626]' : 'bg-gray-800 text-gray-300'}`}>
                        {item.status === 'deal_completed' ? 'مكتملة' : item.status === 'dispute_opened' ? 'نزاع' : 'نشط'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <CreditCard size={16} className="text-[#FFC500]" /> إثباتات سداد عمولات يمن ريتغ المرفوعة للتحقق
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listings.filter(l => l.commissionStatus === 'pending_admin_verification').map(item => (
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
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleVerifyCommission(item.id, true)} className="flex-1 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-black hover:bg-[#16A34A]/90 flex items-center justify-center gap-1 cursor-pointer">
                    <Check size={14} /> اعتماد السداد وإغلاق الصفقة
                  </button>
                  <button onClick={() => handleVerifyCommission(item.id, false)} className="px-3 py-2 bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/40 rounded-lg text-xs font-bold hover:bg-[#DC2626]/30 cursor-pointer">
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
            <AlertTriangle size={16} className="text-[#DC2626]" /> النزاعات التجارية وقرارات الإدارة
          </h3>
          <div className="space-y-3">
            {listings.filter(l => l.disputeStatus === 'open').map(item => (
              <div key={item.id} className="p-4 bg-[#161D2B] rounded-xl border border-[#DC2626]/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <span className="text-[10px] text-gray-400">البائع: {item.sellerName} • المشتري: {item.winnerName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#DC2626]/20 text-[#DC2626] text-xs font-bold">نزاع مفتوح</span>
                </div>
                <div className="p-3 bg-[#0F0F12] rounded-xl border border-[#27272A] text-xs space-y-1">
                  <b className="text-red-400 block">سبب النزاع المرفوع:</b>
                  <p className="text-gray-300 leading-relaxed">{item.disputeReason}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                  <button onClick={() => handleResolveDispute(item.id, 'cancelled')} className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-bold">إلغاء الصفقة</button>
                  <button onClick={() => handleResolveDispute(item.id, 'deal_completed')} className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold">تثبيت إتمام الصفقة</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 space-y-4 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Settings size={16} className="text-[#FFC500]" /> إعدادات وبيانات حساب تحصيل عمولات يمن ريتغ
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              هذه البيانات مشفرة وسرية، ولا تظهر لصاحب العرض إلا عندما تصبح العمولة مستحقة الدفع بعد تأكيد الصفقة.
            </p>
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
