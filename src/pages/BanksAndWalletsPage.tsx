import React, { useState, useMemo } from 'react';
import { 
  Landmark, Coins, Wallet, Search, 
  MapPin, Phone, Globe, ArrowRight, 
  Plus, Building2, ShieldCheck, Star, ChevronLeft,
  MessageCircle, CreditCard, Sparkles
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';
import { YRBadge, BadgeType } from '../components/common/YRBadge';
import { BankProfileView, BankProfileData } from '../components/banks/BankProfileView';

const FINANCIAL_ENTITIES: BankProfileData[] = [
  {
    id: 'bank-1',
    name: 'بنك الكريمي',
    type: 'bank',
    categoryLabel: 'بنك ومصرف',
    badgeType: 'gold',
    city: 'صنعاء — حدة',
    address: 'شارع حدة — تقاطع الرويشان',
    branchesCount: 185,
    atmsCount: 220,
    rating: 4.9,
    reviewsCount: 320,
    phone: '8008800',
    whatsapp: '967777000111',
    email: 'info@kuraimibank.com',
    website: 'https://kuraimibank.com',
    logoImage: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85',
    services: ['حسابات جارية وتوفير إسلامية', 'تطبيق كريمي جوال', 'حوالات مُميّز الفورية', 'تمويل مشاريع صغيرة', 'صراف آلي واسع الانتشار'],
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'أكبر شبكة فروع وصرافات آلية في الجمهورية اليمنية، رائد الخدمات المالية الرقمية وتطبيق كريمي جوال والتمويل الإسلامي المعتمد.'
  },
  {
    id: 'bank-2',
    name: 'بنك التسليف (CAC Bank)',
    type: 'bank',
    categoryLabel: 'بنك ومصرف',
    badgeType: 'gold',
    city: 'عدن / صنعاء',
    address: 'شارع الزبيري / المعلا',
    branchesCount: 95,
    atmsCount: 110,
    rating: 4.8,
    reviewsCount: 190,
    phone: '8002222',
    whatsapp: '967733987654',
    website: 'https://cacbank.com.ye',
    logoImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
    services: ['خدمات مصرفية للأفراد والشركات', 'تطبيق كاك بنك موبايل', 'حسابات دولية وسويفت', 'دعم المشاريع التنموية'],
    galleryImages: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'يقدم خدمات مصرفية متطورة للأفراد والشركات، ودعم المبادرات الزراعية والتجارية.'
  },
  {
    id: 'bank-3',
    name: 'بنك التضامن',
    type: 'bank',
    categoryLabel: 'بنك ومصرف',
    badgeType: 'gold',
    city: 'صنعاء — الزبيري',
    address: 'شارع الزبيري الرئيسي',
    branchesCount: 60,
    atmsCount: 75,
    rating: 4.8,
    reviewsCount: 160,
    phone: '8005555',
    whatsapp: '967711223344',
    website: 'https://tadhamonbank.com',
    logoImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85',
    services: ['محفظة محفظتي الرقمية', 'اعتمادات مستندية', 'حسابات استثمار إسلامي', 'تحويلات ويسترن يونيون'],
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'أحد أكبر البنوك الإسلامية في اليمن مع شراكات دولية وتحويلات مالية عالمية موثوقة.'
  },
  {
    id: 'wallet-1',
    name: 'محفظة جوالي',
    type: 'wallet',
    categoryLabel: 'محفظة إلكترونية',
    badgeType: 'blue',
    city: 'كل المحافظات',
    address: 'نقاط وكلاء في كل المحافظات',
    branchesCount: 1200,
    rating: 4.7,
    reviewsCount: 450,
    phone: '8000000',
    whatsapp: '967777000222',
    website: 'https://jawali.ye',
    logoImage: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85',
    services: ['دفع فواتير الخدمات', 'شحن رصيد الموبايل', 'تحويل فوري بدون حساب بنكي', 'شراء عبر QR'],
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'محفظة رقمية رائدة تتيح الدفع المالي وسداد الفواتير والشراء الإلكتروني عبر نقاط الخدمة في كل المحافظات.'
  },
  {
    id: 'exchange-1',
    name: 'شركة القطيبي للصرافة',
    type: 'exchange',
    categoryLabel: 'شركة صرافة',
    badgeType: 'gold',
    city: 'عدن — الشيخ عثمان',
    address: 'جولة القاهرة',
    branchesCount: 70,
    rating: 4.8,
    reviewsCount: 140,
    phone: '8004040',
    whatsapp: '967733554433',
    website: 'https://al-qutaibi.com',
    logoImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400&auto=format&fit=crop&q=85',
    services: ['شبكة القطيبي إكسبرس', 'صرافة العملات', 'حوالات داخلية وخارجية', 'تطبيق القطيبي'],
    galleryImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'شبكة صرافة وتحويلات واسعة الانتشار تتميز بالسرعة والانتشار في المحافظات الجنوبية والشرقية.'
  },
  {
    id: 'exchange-2',
    name: 'شركة النجم للصرافة',
    type: 'exchange',
    categoryLabel: 'شركة صرافة',
    badgeType: 'blue',
    city: 'صنعاء — الدائري',
    address: 'شارع الدائري الغربي',
    branchesCount: 90,
    rating: 4.7,
    reviewsCount: 110,
    phone: '8009999',
    whatsapp: '967770889900',
    website: 'https://alnajm.ye',
    logoImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=85',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85',
    services: ['شبكة النجم إكسبرس', 'صرف العملات', 'حوالات تجارية فورية'],
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'شبكة تحويلات محلية تغطي كافة مديريات ومناطق الجمهورية اليمنية.'
  }
];

export const BanksAndWalletsPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate = () => {} }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bank' | 'exchange' | 'wallet'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankProfileData | null>(null);

  const filteredEntities = useMemo(() => {
    return FINANCIAL_ENTITIES.filter(item => {
      const matchTab = activeTab === 'all' || item.type === activeTab;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchCity && matchSearch;
    });
  }, [activeTab, selectedCity, searchQuery]);

  const handleOpenBank = (bank: BankProfileData) => {
    setSelectedBank(bank);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  if (selectedBank) {
    return (
      <BankProfileView
        bank={selectedBank}
        onBack={() => {
          setSelectedBank(null);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        onNavigateAd={() => onNavigate('ads')}
      />
    );
  }

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white">
      
      {/* إعلان البانر #8 */}
      <AdBanner placementId="8" className="mb-1" />

      {/* رأس الصفحة الرسمي */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Landmark size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              البنوك والصرافة والمحافظ
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              دليل البنوك اليمنية وشركات الصرافة والمحافظ الرقمية
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="px-3 py-1 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={12} className="rtl:rotate-180" />
        </button>
      </div>

      {/* شريط البحث والفلترة السريعة للهاتف */}
      <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
        <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
          <Search size={14} className="text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن بنك، شركة صرافة، أو محفظة..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar flex-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'bank', label: 'بنوك ومصارف' },
              { id: 'exchange', label: 'شركات الصرافة' },
              { id: 'wallet', label: 'المحافظ الإلكترونية' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#FFC500] text-black shadow-md' 
                    : 'bg-[#18181C] text-gray-400 border border-[#27272A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#18181C] border border-[#27272A] rounded-lg px-2 py-0.5 text-[10px] font-bold text-[#D1D5DB] outline-none cursor-pointer shrink-0"
          >
            <option value="all">كل المحافظات</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
          </select>
        </div>
      </div>

      {/* بطاقات البنوك المصممة خصيصاً للهاتف (بدون أسعار صرف) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredEntities.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenBank(item)}
            className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/50 p-3 space-y-2.5 shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div className="space-y-2">
              
              {/* رأس البطاقة: الشعار + الاسم ومعه الشارة مباشرة في نفس السطر */}
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-[#27272A] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                  <img 
                    src={item.logoImage || 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80'} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">
                      {item.name}
                    </h3>
                    <YRBadge type={item.badgeType} size={15} />
                  </div>

                  <div className="flex items-center gap-2 text-[9.5px] text-gray-400 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#FFC500]/10 text-[#FFC500] font-bold">
                      {item.categoryLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-gray-300">
                      <MapPin size={10} className="text-[#FFC500]" /> {item.city.split('—')[0]}
                    </span>
                    <span>•</span>
                    <span className="text-[#FFC500] font-bold">★ {item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* شارات الخدمات والفروع (معلومات مفيدة بديلة عن أسعار الصرف) */}
              <div className="p-2 bg-[#161619] rounded-xl border border-[#27272A] space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-gray-300 font-mono">
                  <span className="font-['Cairo'] text-gray-400">الانتشار الميداني:</span>
                  <b className="text-white">{item.branchesCount} فرع معتمد</b>
                </div>
                <div className="flex items-center gap-1 text-gray-300 truncate">
                  <Sparkles size={11} className="text-[#FFC500] shrink-0" />
                  <span className="truncate">{item.services.slice(0, 2).join(' • ')}</span>
                </div>
              </div>

            </div>

            {/* أزرار الاتصال والواتساب والدخول لصفحة البنك */}
            <div className="pt-2 border-t border-[#1F2937] flex items-center gap-1.5">
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-[#161619] border border-[#27272A] text-gray-300 hover:text-[#FFC500] active:scale-95"
                  title="اتصال مباشر"
                >
                  <Phone size={13} />
                </a>
              )}

              {item.whatsapp && (
                <a
                  href={`https://wa.me/${item.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A] hover:text-white active:scale-95"
                  title="محادثة واتساب"
                >
                  <MessageCircle size={13} />
                </a>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBank(item);
                }}
                className="flex-1 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <span>عرض صفحة البنك</span>
                <ArrowRight size={12} className="rtl:rotate-180" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
