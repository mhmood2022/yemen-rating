import React, { useState, useMemo } from 'react';
import { 
  Landmark, Coins, Wallet, ArrowLeftRight, Search, 
  MapPin, Phone, Globe, ShieldCheck, ArrowRight, 
  Plus, X, CheckCircle2, ChevronRight, CreditCard, 
  Smartphone, Building2, Check, ExternalLink, HelpCircle
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';

export interface FinancialEntity {
  id: string;
  name: string;
  type: 'bank' | 'exchange' | 'wallet' | 'remittance';
  categoryLabel: string;
  city: string;
  branchesCount: number;
  atmsCount?: number;
  phone: string;
  website: string;
  appAvailable: boolean;
  services: string[];
  usdBuy: number;
  usdSell: number;
  sarBuy: number;
  sarSell: number;
  isVerified: boolean;
  badgeType: 'gold' | 'blue';
  description: string;
}

const FINANCIAL_ENTITIES: FinancialEntity[] = [
  {
    id: 'bank-1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    type: 'bank',
    categoryLabel: 'بنوك ومصارف',
    city: 'صنعاء — المركز الرئيسي',
    branchesCount: 185,
    atmsCount: 220,
    phone: '8008800',
    website: 'https://kuraimibank.com',
    appAvailable: true,
    services: ['حسابات جارية وتوفير', 'تطبيق كريمي جوال', 'حوالات مُميّز', 'تمويل مشاريع', 'صراف آلي واسع الانتشار'],
    usdBuy: 535.0,
    usdSell: 538.0,
    sarBuy: 140.4,
    sarSell: 140.7,
    isVerified: true,
    badgeType: 'gold',
    description: 'أكبر شبكة فروع وصرافات آلية في الجمهورية اليمنية، رائد الخدمات المالية الرقمية وتطبيق كريمي جوال.'
  },
  {
    id: 'bank-2',
    name: 'بنك التسليف التعاوني والزراعي (CAC Bank)',
    type: 'bank',
    categoryLabel: 'بنوك ومصارف',
    city: 'عدن / صنعاء',
    branchesCount: 95,
    atmsCount: 110,
    phone: '8002222',
    website: 'https://cacbank.com.ye',
    appAvailable: true,
    services: ['خدمات مصرفية للأفراد والشركات', 'تطبيق كاك بنك موبايل', 'حسابات دولية', 'سويفت كود'],
    usdBuy: 534.5,
    usdSell: 538.0,
    sarBuy: 140.3,
    sarSell: 140.8,
    isVerified: true,
    badgeType: 'gold',
    description: 'يقدم خدمات مصرفية متطورة للقطاعين العام والخاص، ودعم المشاريع التنموية والزراعية.'
  },
  {
    id: 'bank-3',
    name: 'بنك التضامن الإسلامي',
    type: 'bank',
    categoryLabel: 'بنوك ومصارف',
    city: 'صنعاء — الزبيري',
    branchesCount: 60,
    atmsCount: 75,
    phone: '8005555',
    website: 'https://tadhamonbank.com',
    appAvailable: true,
    services: ['محفظة محفظتي الرقمية', 'اعتمادات مستندية للشركات', 'حسابات استثمار إسلامي', 'تحويلات ويسترن يونيون'],
    usdBuy: 535.0,
    usdSell: 538.5,
    sarBuy: 140.5,
    sarSell: 140.8,
    isVerified: true,
    badgeType: 'gold',
    description: 'أحد أكبر البنوك الإسلامية في اليمن مع شراكات دولية وتحويلات مالية عالمية موثوقة.'
  },
  {
    id: 'wallet-1',
    name: 'محفظة جوالي (Jawali Wallet)',
    type: 'wallet',
    categoryLabel: 'محافظ إلكترونية',
    city: 'كل المحافظات',
    branchesCount: 1200,
    phone: '8000000',
    website: 'https://jawali.ye',
    appAvailable: true,
    services: ['دفع فواتير الماء والكهرباء والإنترنت', 'شحن رصيد الموبايل', 'تحويل فوري بدون حساب بنكي', 'شراء من المتاجر عبر QR'],
    usdBuy: 534.8,
    usdSell: 537.9,
    sarBuy: 140.4,
    sarSell: 140.7,
    isVerified: true,
    badgeType: 'blue',
    description: 'محفظة رقمية رائدة تتيح الدفع المالي وسداد الفواتير والشراء الإلكتروني عبر نقاط الخدمة في كل المحافظات.'
  },
  {
    id: 'wallet-2',
    name: 'محفظة كاش (Cash Wallet)',
    type: 'wallet',
    categoryLabel: 'محافظ إلكترونية',
    city: 'كل المحافظات',
    branchesCount: 850,
    phone: '8001111',
    website: 'https://cash.ye',
    appAvailable: true,
    services: ['تحويلات نقدية فورية', 'سحب نقدي من الوكلاء', 'سداد اشتراكات وباقات', 'دفع إلكتروني للشركات'],
    usdBuy: 534.8,
    usdSell: 537.9,
    sarBuy: 140.4,
    sarSell: 140.7,
    isVerified: true,
    badgeType: 'blue',
    description: 'حلول مالية رقمية متكاملة لتبسيط المعاملات النقدية والتحويلات اللحظية.'
  },
  {
    id: 'exchange-1',
    name: 'شركة القطيبي للصرافة والتحويلات',
    type: 'exchange',
    categoryLabel: 'شركات الصرافة',
    city: 'عدن — الشيخ عثمان',
    branchesCount: 70,
    phone: '8004040',
    website: 'https://al-qutaibi.com',
    appAvailable: true,
    services: ['شبكة القطيبي إكسبرس', 'صرافة العملات الأجنبية', 'حوالات داخلية وخارجية', 'تطبيق القطيبي موبايل'],
    usdBuy: 1910.0,
    usdSell: 1925.0,
    sarBuy: 501.5,
    sarSell: 504.0,
    isVerified: true,
    badgeType: 'gold',
    description: 'شبكة صرافة وتحويلات واسعة الانتشار تتميز بالسرعة والانتشار في المحافظات الجنوبية والشرقية.'
  },
  {
    id: 'exchange-2',
    name: 'شركة النجم للصرافة والتحويلات',
    type: 'exchange',
    categoryLabel: 'شركات الصرافة',
    city: 'صنعاء — الدائري',
    branchesCount: 90,
    phone: '8009999',
    website: 'https://alnajm.ye',
    appAvailable: true,
    services: ['شبكة النجم إكسبرس للحوالات', 'صرف وتبديل العملات', 'حوالات تجارية للمنشآت'],
    usdBuy: 535.0,
    usdSell: 538.0,
    sarBuy: 140.4,
    sarSell: 140.7,
    isVerified: true,
    badgeType: 'blue',
    description: 'شبكة تحويلات محلية تغطي كافة مديريات ومناطق الجمهورية اليمنية.'
  }
];

export const BanksAndWalletsPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate = () => {} }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bank' | 'exchange' | 'wallet'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<FinancialEntity | null>(null);

  // نافذة طلب إدراج جهة مصرفية جديدة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<FinancialEntity['type']>('bank');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('صنعاء');
  const [formServices, setFormServices] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredEntities = useMemo(() => {
    return FINANCIAL_ENTITIES.filter(item => {
      const matchTab = activeTab === 'all' || item.type === activeTab;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchCity && matchSearch;
    });
  }, [activeTab, selectedCity, searchQuery]);

  const handleOpenEntity = (entity: FinancialEntity) => {
    setSelectedEntity(entity);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setIsAddModalOpen(false);
    setFormName('');
    setFormPhone('');
    setFormServices('');
    setToastMessage('تم إرسال طلب إدراج الجهة المصرفية بنجاح وهو قيد المراجعة والاعتماد');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص للمصارف والمالية */}
      <AdBanner placementId="8" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Landmark size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              البنوك والصرافة والمحافظ
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              دليل البنوك اليمنية، شركات الصرافة المعتمدة، والمحافظ الرقمية
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>إدراج جهة مصرفية</span>
          </button>
          
          <button
            onClick={selectedEntity ? () => setSelectedEntity(null) : () => onNavigate('home')}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedEntity ? 'رجوع' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل الجهة المصرفية المحددة
          ============================================================ */}
      {selectedEntity ? (
        <div className="space-y-3">
          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-4 sm:p-5 space-y-4 shadow-xl">
            
            {/* رأس البطاقة والشارات */}
            <div className="border-b border-[#1F2937] pb-3 space-y-2">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedEntity.categoryLabel}
                  </span>
                  {selectedEntity.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-[10px] font-black">
                      <ShieldCheck size={12} /> معتمد وموثق
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedEntity.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#27272A] hover:border-[#FFC500] text-xs font-bold text-gray-200 flex items-center gap-1"
                  >
                    <Phone size={13} className="text-[#FFC500]" />
                    <span>{selectedEntity.phone}</span>
                  </a>
                  <a
                    href={selectedEntity.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-[#161619] border border-[#27272A] text-gray-300 hover:text-[#FFC500]"
                  >
                    <Globe size={15} />
                  </a>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {selectedEntity.name}
              </h2>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {selectedEntity.description}
              </p>
            </div>

            {/* شبكة أرقام الانتشار والفروع */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">شبكة الفروع</span>
                <b className="text-xs text-white font-bold">{selectedEntity.branchesCount} فرع</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">أجهزة الصراف ATM</span>
                <b className="text-xs text-white font-bold">{selectedEntity.atmsCount ? `${selectedEntity.atmsCount} جهاز` : 'متوفر عبر الوكلاء'}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">التطبيق المالي</span>
                <b className="text-xs text-[#16A34A] font-bold font-['Cairo']">{selectedEntity.appAvailable ? 'متوفر لنظامين' : 'خدمات نقاط'}</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]">
                <span className="text-[9px] text-[#9CA3AF] font-['Cairo'] block">المقر والانتشار</span>
                <b className="text-xs text-gray-200 font-bold font-['Cairo']">{selectedEntity.city.split('—')[0]}</b>
              </div>
            </div>

            {/* أسعار الصرف المعتمدة لدى الجهة */}
            <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2">
              <span className="text-xs font-bold text-[#FFC500] block">أسعار الصرف المعتمدة لدى {selectedEntity.name}:</span>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 rounded-lg bg-[#0F0F12] border border-[#27272A] flex justify-between items-center">
                  <span className="text-gray-400 font-['Cairo']">الدولار (شراء/بيع):</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#16A34A] font-bold">{selectedEntity.usdBuy}</span>
                    <span>/</span>
                    <span className="text-[#DC2626] font-bold">{selectedEntity.usdSell}</span>
                    <span className="text-[#FFC500] font-black text-[10px]">﷼</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#0F0F12] border border-[#27272A] flex justify-between items-center">
                  <span className="text-gray-400 font-['Cairo']">السعودي (شراء/بيع):</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[#16A34A] font-bold">{selectedEntity.sarBuy}</span>
                    <span>/</span>
                    <span className="text-[#DC2626] font-bold">{selectedEntity.sarSell}</span>
                    <span className="text-[#FFC500] font-black text-[10px]">﷼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* قائمة الخدمات المصرفية والحلول */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-white">الخدمات المصرفية والحلول الرقمية:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedEntity.services.map((srv, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-[#161619] border border-[#27272A] flex items-center gap-2 text-xs text-gray-200">
                    <Check size={13} className="text-[#FFC500] shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة البنوك والمصارف والشركات
           ============================================================ */
        <div className="space-y-3">
          
          {/* شريط البحث وفلاتر القطاعات المصرفية */}
          <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
            <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
              <Search size={14} className="text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن بنك، شركة صرافة، محفظة إلكترونية..."
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            {/* الأقسام المصرفية */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'bank', label: 'بنوك ومصارف' },
                { id: 'exchange', label: 'شركات الصرافة' },
                { id: 'wallet', label: 'المحافظ الإلكترونية' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#FFC500] text-black shadow-md shadow-[#FFC500]/20' 
                      : 'bg-[#18181C] text-gray-400 border border-[#27272A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* شبكة كروت البنوك والمحافظ الفاخرة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredEntities.map((item) => (
              <div
                key={item.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 p-3.5 space-y-2.5 shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[9.5px] font-bold">
                      {item.categoryLabel}
                    </span>
                    {item.isVerified && (
                      <span className="text-[9.5px] text-[#16A34A] font-bold flex items-center gap-0.5">
                        <ShieldCheck size={11} /> موثق
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} className="text-[#FFC500]" /> {item.branchesCount} فرع
                    </span>
                    <span>•</span>
                    <span className="text-gray-300">{item.city.split('—')[0]}</span>
                  </div>

                  {/* أسعار الصرف السريعة لدى الجهة */}
                  <div className="bg-[#18181C] p-2 rounded-xl border border-[#27272A] font-mono text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-['Cairo']">الدولار:</span>
                      <div>
                        <span className="text-[#16A34A]">{item.usdBuy}</span> / <span className="text-[#DC2626]">{item.usdSell}</span> <span className="text-[#FFC500] font-black text-[9px]">﷼</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-['Cairo']">السعودي:</span>
                      <div>
                        <span className="text-[#16A34A]">{item.sarBuy}</span> / <span className="text-[#DC2626]">{item.sarSell}</span> <span className="text-[#FFC500] font-black text-[9px]">﷼</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F2937] flex items-center gap-1.5">
                  <a
                    href={`tel:${item.phone}`}
                    className="p-2 rounded-xl bg-[#18181C] text-gray-300 border border-[#27272A] hover:text-[#FFC500]"
                    title="اتصال بخدمة العملاء"
                  >
                    <Phone size={13} />
                  </a>

                  <button
                    onClick={() => handleOpenEntity(item)}
                    className="flex-1 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>عرض التفاصيل والفروع</span>
                    <ArrowRight size={12} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================
          نافذة طلب إدراج جهة مصرفية / محفظة جديدة
          ============================================================ */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto no-scrollbar cursor-default shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={15} className="text-[#FFC500]" /> طلب إدراج جهة مصرفية / محفظة
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">اسم البنك / الشركة / المحفظة*</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة النجم للصرافة..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">نوع القطاع*</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="bank">بنك ومصرف</option>
                    <option value="exchange">شركة صرافة</option>
                    <option value="wallet">محفظة إلكترونية</option>
                    <option value="remittance">شبكة تحويلات</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">رقم خدمة العملاء*</label>
                  <input
                    type="tel"
                    required
                    placeholder="8000000 أو 777..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">المركز الرئيسي / المدينة</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
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
                <label className="text-[11px] text-gray-400 block mb-1">أبرز الخدمات والحلول المصرفية</label>
                <textarea
                  rows={2}
                  value={formServices}
                  onChange={(e) => setFormServices(e.target.value)}
                  placeholder="حوالات سريعة، صراف آلي، تطبيق جوال..."
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
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 cursor-pointer shadow-md"
                >
                  إرسال الطلب للاعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
