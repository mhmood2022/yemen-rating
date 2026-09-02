import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, Search, MapPin, ArrowRight, Building2, 
  ChevronLeft, Sparkles, Star, Plus, Phone, Globe
} from 'lucide-react';
import { BankService } from '../../../services/platformServices';
import { YRBadge } from '../../../components/common/YRBadge';
import { AdBanner } from '../../../components/common/AdBanner';
import { BankEntity } from '../../../types/schema.types';

export const BanksPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب قائمة البنوك المسجلة من الخدمة
  const banksList: BankEntity[] = useMemo(() => {
    return [
      BankService.getDemoRecord(),
      {
        ...BankService.getDemoRecord(),
        id: 'bank-cac',
        slug: 'cac-bank',
        name: 'بنك التسليف التعاوني والزراعي (CAC Bank)',
        city_name: 'عدن / صنعاء',
        logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=85',
        branches_count: 95
      },
      {
        ...BankService.getDemoRecord(),
        id: 'wallet-jawali',
        slug: 'jawali-wallet',
        name: 'محفظة جوالي (Jawali Wallet)',
        category_label: 'محفظة إلكترونية',
        badge_type: 'blue',
        city_name: 'كل المحافظات',
        logo_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&auto=format&fit=crop&q=85',
        branches_count: 1200
      },
      {
        ...BankService.getDemoRecord(),
        id: 'exchange-qutaibi',
        slug: 'al-qutaibi',
        name: 'شركة القطيبي للصرافة والتحويلات',
        category_label: 'شركة صرافة',
        city_name: 'عدن — الشيخ عثمان',
        logo_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=85',
        branches_count: 70
      }
    ];
  }, []);

  const filtered = banksList.filter(b => {
    const matchCity = selectedCity === 'all' || b.city_name.includes(selectedCity);
    const matchQuery = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchQuery;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      <AdBanner placementId="8" className="mb-1" />

      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Landmark size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              دليل البنوك والمحافظ
            </h1>
            <span className="text-[9.5px] text-zinc-400 mt-0.5 block">
              قائمة البنوك اليمنية وشركات الصرافة والمحافظ المعتمدة
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={13} className="rtl:rotate-180" />
        </button>
      </div>

      {/* الفلترة والبحث */}
      <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
        <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
          <Search size={14} className="text-zinc-500 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن بنك، صرافة، أو محفظة..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* شبكة كروت البنوك الديناميكية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((bank) => (
          <div
            key={bank.id}
            onClick={() => navigate(`/banks/${bank.slug}`)}
            className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/50 p-3.5 space-y-2.5 shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-[#27272A] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                  <img src={bank.logo_url} alt={bank.name} className="w-full h-full object-cover rounded-lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">
                      {bank.name}
                    </h3>
                    <YRBadge type={bank.badge_type} size={15} />
                  </div>

                  <div className="flex items-center gap-2 text-[9.5px] text-zinc-400 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#FFC500]/10 text-[#FFC500] font-bold">
                      {bank.category_label}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-zinc-300">
                      <MapPin size={10} className="text-[#FFC500]" /> {bank.city_name.split('—')[0]}
                    </span>
                    <span>•</span>
                    <span className="text-[#FFC500] font-bold">★ {bank.rating_summary.average}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                {bank.short_description || bank.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#FFC500] font-bold">
              <span>عرض صفحة البنك والخدمات</span>
              <ChevronLeft size={14} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
