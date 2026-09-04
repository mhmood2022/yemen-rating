import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Search, MapPin, ArrowRight, ChevronLeft } from 'lucide-react';
import { bankService } from '../../../services/bankService';
import { YRBadge } from '../../../components/common/YRBadge';
import { AdBanner } from '../../../components/common/AdBanner';
import { BankEntity } from '../../../types/schema.types';

export const BanksPage: React.FC = () => {
  const navigate = useNavigate();
  const [banksList, setBanksList] = useState<BankEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    bankService.fetchBanks().then((data) => {
      setBanksList(data);
      setLoading(false);
    });
  }, []);

  const filtered = banksList.filter(b => {
    const matchCity = selectedCity === 'all' || b.city_name.includes(selectedCity);
    const matchQuery = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchQuery;
  });

  if (loading) return <div className="text-center p-8 text-white">جاري تحميل البنوك...</div>;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="8" className="mb-1" />
      
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md">
            <Landmark size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">دليل البنوك والمحافظ</h1>
            <span className="text-[9.5px] text-zinc-400 mt-0.5 block">قائمة البنوك اليمنية وشركات الصرافة المعتمدة</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500]">
          <ArrowRight size={13} className="rtl:rotate-180 inline ml-1" /> الرئيسية
        </button>
      </div>

      <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
        <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
          <Search size={14} className="text-zinc-500 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن بنك..."
            className="flex-1 bg-transparent text-xs text-white outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-zinc-500">لا توجد بنوك مطابقة للبحث</div>
        ) : (
          filtered.map((bank) => (
            <div
              key={bank.id}
              onClick={() => navigate(`/bank/${bank.slug}`)}
              className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/50 p-3.5 space-y-2.5 shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-[#27272A] p-1 overflow-hidden">
                    <img src={bank.logo_url} alt={bank.name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-black text-white truncate">{bank.name}</h3>
                      <YRBadge type={bank.badge_type as any} size={15} />
                    </div>
                    <div className="flex items-center gap-2 text-[9.5px] text-zinc-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#FFC500]/10 text-[#FFC500] font-bold">{bank.category_label}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-zinc-300">
                        <MapPin size={10} className="text-[#FFC500]" /> {bank.city_name.split('—')[0]}
                      </span>
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
          ))
        )}
      </div>
    </div>
  );
};
