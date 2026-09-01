import React, { useState, useMemo } from 'react';
import { 
  Landmark, Coins, Wallet, Search, 
  MapPin, Phone, Globe, ArrowRight, 
  Plus, Building2, ShieldCheck, ChevronRight
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';
import { YRBadge, BadgeType } from '../components/common/YRBadge';
import { BankProfileView, BankProfileData } from '../components/banks/BankProfileView';

const FINANCIAL_ENTITIES: BankProfileData[] = [
  {
    id: 'bank-1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    type: 'bank',
    categoryLabel: 'بنوك ومصارف',
    badgeType: 'gold',
    city: 'صنعاء — المركز الرئيسي',
    address: 'شارع حدة — جوار تقاطع الرويشان',
    branchesCount: 185,
    atmsCount: 220,
    rating: 4.9,
    reviewsCount: 320,
    phone: '8008800',
    whatsapp: '967777000111',
    email: 'info@kuraimibank.com',
    website: 'https://kuraimibank.com',
    services: ['حسابات جارية وتوفير إسلامية', 'تطبيق كريمي جوال المالي', 'حوالات مُميّز الفورية', 'تمويل مشاريع صغيرة وأصغر', 'صراف آلي واسع الانتشار'],
    usdBuy: 535.0,
    usdSell: 538.0,
    sarBuy: 140.4,
    sarSell: 140.7,
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'أكبر شبكة فروع وصرافات آلية في الجمهورية اليمنية، رائد الخدمات المالية الرقمية وتطبيق كريمي جوال والتمويل الإسلامي المعتمد.'
  },
  {
    id: 'bank-2',
    name: 'بنك التسليف التعاوني والزراعي (CAC Bank)',
    type: 'bank',
    categoryLabel: 'بنوك ومصارف',
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
    services: ['خدمات مصرفية للأفراد والشركات', 'تطبيق كاك بنك موبايل', 'حسابات دولية وسويفت', 'دعم المشاريع التنموية'],
    usdBuy: 534.5,
    usdSell: 538.0,
    sarBuy: 140.3,
    sarSell: 140.8,
    galleryImages: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'يقدم خدمات مصرفية متطورة للقطاعين العام والخاص، ودعم المبادرات الزراعية والتجارية.'
  },
  {
    id: 'wallet-1',
    name: 'محفظة جوالي (Jawali Wallet)',
    type: 'wallet',
    categoryLabel: 'محافظ إلكترونية',
    badgeType: 'blue',
    city: 'كل المحافظات',
    address: 'خدمة رقمية واسعة الانتشار',
    branchesCount: 1200,
    rating: 4.7,
    reviewsCount: 450,
    phone: '8000000',
    website: 'https://jawali.ye',
    services: ['دفع فواتير الماء والكهرباء والإنترنت', 'شحن رصيد الموبايل', 'تحويل فوري بدون حساب بنكي', 'شراء من المتاجر عبر QR'],
    usdBuy: 534.8,
    usdSell: 537.9,
    sarBuy: 140.4,
    sarSell: 140.7,
    galleryImages: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'محفظة رقمية رائدة تتيح الدفع المالي وسداد الفواتير والشراء الإلكتروني عبر نقاط الخدمة في كل المحافظات.'
  },
  {
    id: 'exchange-1',
    name: 'شركة القطيبي للصرافة والتحويلات',
    type: 'exchange',
    categoryLabel: 'شركات الصرافة',
    badgeType: 'gold',
    city: 'عدن — الشيخ عثمان',
    address: 'جولة القاهرة',
    branchesCount: 70,
    rating: 4.8,
    reviewsCount: 140,
    phone: '8004040',
    website: 'https://al-qutaibi.com',
    services: ['شبكة القطيبي إكسبرس', 'صرافة العملات الأجنبية', 'حوالات داخلية وخارجية', 'تطبيق القطيبي موبايل'],
    usdBuy: 1910.0,
    usdSell: 1925.0,
    sarBuy: 501.5,
    sarSell: 504.0,
    galleryImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85'
    ],
    description: 'شبكة صرافة وتحويلات واسعة الانتشار تتميز بالسرعة والانتشار في المحافظات الجنوبية والشرقية.'
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

  // إذا تم اختيار بنك، يتم عرض صفحة البنك الكاملة للزائر
  if (selectedBank) {
    return (
      <BankProfileView
        bank={selectedBank}
        onBack={() => setSelectedBank(null)}
        onNavigateAd={() => onNavigate('ads')}
      />
    );
  }

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص #8 */}
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

        <button
          onClick={() => onNavigate('home')}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={13} className="rtl:rotate-180" />
        </button>
      </div>

      {/* 3. شريط البحث والفلترة السريعة */}
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
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#FFC500] text-black border-[#FFC500]' 
                    : 'bg-[#18181C] text-gray-400 border-[#27272A]'
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

      {/* 4. شبكة كروت البنوك والمحافظ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredEntities.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenEntity(item)}
            className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/50 p-3.5 space-y-2.5 shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[9.5px] font-bold">
                  {item.categoryLabel}
                </span>
                <YRBadge type={item.badgeType} size={16} />
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                {item.name}
              </h3>

              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1 text-gray-300">
                  <Building2 size={11} className="text-[#FFC500]" /> {item.branchesCount} فرع
                </span>
                <span>•</span>
                <span className="text-gray-300">{item.city.split('—')[0]}</span>
                <span>•</span>
                <span className="text-[#FFC500] font-bold">★ {item.rating.toFixed(1)}</span>
              </div>

              {/* أسعار الصرف السريعة */}
              {(item.usdBuy || item.sarBuy) && (
                <div className="bg-[#18181C] p-2 rounded-xl border border-[#27272A] font-mono text-[10px] space-y-0.5">
                  {item.usdBuy && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-['Cairo']">الدولار:</span>
                      <div>
                        <span className="text-[#16A34A] font-bold">{item.usdBuy}</span> / <span className="text-[#DC2626] font-bold">{item.usdSell}</span> <span className="text-[#FFC500] font-black text-[9px]">﷼</span>
                      </div>
                    </div>
                  )}
                  {item.sarBuy && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-['Cairo']">السعودي:</span>
                      <div>
                        <span className="text-[#16A34A] font-bold">{item.sarBuy}</span> / <span className="text-[#DC2626] font-bold">{item.sarSell}</span> <span className="text-[#FFC500] font-black text-[9px]">﷼</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#FFC500] font-bold">
              <span>عرض صفحة البنك والفروع والخدمات</span>
              <ChevronRight size={14} className="rtl:rotate-180" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
