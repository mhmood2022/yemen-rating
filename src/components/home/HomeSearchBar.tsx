import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  X,
  Building2,
  Landmark,
  ChevronLeft,
  RefreshCw,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { YRSelect } from '../common/YRSelect';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'كل المحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'حجة', label: 'حجة' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'الضالع', label: 'الضالع' },
  { value: 'ريمة', label: 'ريمة' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'سقطرى', label: 'أرخبيل سقطرى' },
  { value: 'الجوف', label: 'الجوف' }
];

interface HomeSearchBarProps {
  officialCategories?: any[];
  onSelectCategory?: (slug: string) => void;
  className?: string;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  officialCategories = [],
  onSelectCategory,
  className = ''
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGov, setSelectedGov] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // إعلان الراعي الحقيقي من Supabase فقط
  const [realSponsorAd, setRealSponsorAd] = useState<any | null>(null);

  // نتائج البحث
  const [matchedCategories, setMatchedCategories] = useState<any[]>([]);
  const [matchedBusinesses, setMatchedBusinesses] = useState<any[]>([]);
  const [matchedBanks, setMatchedBanks] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. جلب إعلان الراعي الحقيقي فقط بدون أي معلومات وهمية
  useEffect(() => {
    async function loadRealSponsor() {
      try {
        const { data } = await supabase
          .from('ads')
          .select('*')
          .or("ad_type.eq.sponsor,placements.cs.[\"home_top\"],status.eq.published")
          .limit(1)
          .maybeSingle();

        if (data && data.advertiser_name) {
          setRealSponsorAd(data);
        } else {
          setRealSponsorAd(null);
        }
      } catch (err) {
        setRealSponsorAd(null);
      }
    }
    loadRealSponsor();
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. محرك بحث حي في قاعدة بيانات Supabase (Yelp Search Engine)
  const performLiveSearch = async (term: string, gov: string) => {
    const clean = term.trim();
    if (!clean) {
      setMatchedCategories([]);
      setMatchedBusinesses([]);
      setMatchedBanks([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lower = clean.toLowerCase();

    // أ) مطابقة البوابات والتصنيفات الوطنية (شاليهات، مستشفيات، عيادات، حمامات بخار، إلخ)
    const catMatches = officialCategories.filter((cat) => {
      const name = (cat.name || '').toLowerCase();
      const id = (cat.id || '').toLowerCase();
      return name.includes(lower) || id.includes(lower);
    });
    setMatchedCategories(catMatches.slice(0, 4));

    // ب) البحث الحقيقي في Supabase في جدول المنشآت والمحلات businesses
    try {
      let bizQuery = supabase
        .from('businesses')
        .select('id, slug, name, category, city')
        .or(`name.ilike.%${clean}%,category.ilike.%${clean}%`)
        .limit(8);

      if (gov && gov !== 'all') {
        bizQuery = bizQuery.ilike('city', `%${gov}%`);
      }

      let bankQuery = supabase
        .from('banks')
        .select('id, slug, name, commercial_name')
        .or(`name.ilike.%${clean}%,commercial_name.ilike.%${clean}%`)
        .limit(4);

      const [bizRes, bankRes] = await Promise.allSettled([bizQuery, bankQuery]);

      if (bizRes.status === 'fulfilled' && bizRes.value.data) {
        setMatchedBusinesses(bizRes.value.data);
      } else {
        setMatchedBusinesses([]);
      }

      if (bankRes.status === 'fulfilled' && bankRes.value.data && (gov === 'all' || gov === 'صنعاء' || gov === 'عدن')) {
        setMatchedBanks(bankRes.value.data);
      } else {
        setMatchedBanks([]);
      }

      setIsOpen(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) {
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performLiveSearch(val, selectedGov);
    }, 250);
  };

  const handleGovChange = (gov: string) => {
    setSelectedGov(gov);
    if (searchTerm.trim()) {
      performLiveSearch(searchTerm, gov);
    }
  };

  // زر البحث الرئيسي (الانتقال للدليل العام بفلتر النشاط والمحافظة)
  const handleFullSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedGov && selectedGov !== 'all') params.append('city', selectedGov);
    navigate(`/directory?${params.toString()}`);
  };

  const totalMatches = matchedCategories.length + matchedBusinesses.length + matchedBanks.length;

  return (
    <div ref={containerRef} className={`relative z-40 font-['Cairo',sans-serif] ${className}`}>
      <div className="rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-[#F5C400]/50 transition-all shadow-2xl overflow-hidden">
        
        {/* 🌟 إعلان الراعي الحقيقي (يظهر فقط إذا كان موجوداً في Supabase بدون أي نصوص من الرأس) */}
        {realSponsorAd && (
          <div className="bg-[#060A13] border-b border-slate-800 px-3.5 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1 shrink-0">
                <Sparkles size={11} />
                <span>الراعي الرسمي</span>
              </span>
              <span className="text-white text-xs font-bold truncate">
                {realSponsorAd.advertiser_name}
              </span>
            </div>

            {realSponsorAd.title && (
              <span className="text-[10px] text-[#F5C400] font-bold shrink-0 truncate max-w-[180px]">
                {realSponsorAd.title}
              </span>
            )}
          </div>
        )}

        {/* 🔍 شريط بحث يلب المزدوج (ماذا تبحث عنه + المحافظة + زر البحث) */}
        <form onSubmit={handleFullSearchSubmit} className="p-2 sm:p-2.5 flex flex-col md:flex-row items-center gap-2">
          
          {/* الحقل 1: ماذا تبحث عنه؟ (Find) */}
          <div className="flex items-center gap-2 bg-[#060A13] border border-slate-800 rounded-xl px-3 h-11 flex-1 w-full focus-within:border-[#F5C400]/60 transition-colors">
            {isSearching ? (
              <RefreshCw size={17} className="animate-spin text-[#F5C400] shrink-0" />
            ) : (
              <Search size={17} className="text-[#F5C400] shrink-0" />
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={handleTermChange}
              onFocus={() => searchTerm.trim() && setIsOpen(true)}
              placeholder="عن ماذا تبحث؟ (شاليهات، مستشفيات، بنوك، معارض سيارات، حمامات بخار...)"
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* الحقل 2: المحافظة / المدينة (Near) */}
          <div className="w-full md:w-56 shrink-0">
            <YRSelect
              value={selectedGov}
              options={YEMEN_GOVERNORATES}
              onChange={handleGovChange}
              placeholder="كل المحافظات"
            />
          </div>

          {/* زر البحث الرئيسي على طريقة Yelp */}
          <button
            type="submit"
            className="w-full md:w-auto h-10 sm:h-10 px-5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>بحث</span>
            <ArrowLeft size={14} />
          </button>
        </form>
      </div>

      {/* 📋 القائمة المنبثقة الذكية للنتائج اللحظية من Supabase */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D1527] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 max-h-96 overflow-y-auto space-y-2">
          {totalMatches === 0 && !isSearching ? (
            <div className="py-6 text-center text-xs text-slate-400">
              لا توجد منشآت مطابقة لـ{' '}
              <span className="text-[#F5C400] font-bold">"{searchTerm}"</span>
              {selectedGov !== 'all' && ` في محافظة ${selectedGov}`}
            </div>
          ) : (
            <>
              {/* 1. البوابات والتصنيفات المتخصصة */}
              {matchedCategories.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    بوابات الخدمات المعتمدة
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {matchedCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setIsOpen(false);
                          if (onSelectCategory) onSelectCategory(cat.id);
                          else navigate(`/directory?category=${encodeURIComponent(cat.id)}`);
                        }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#060A13] hover:bg-[#F5C400]/10 border border-slate-800 hover:border-[#F5C400]/40 cursor-pointer transition-colors group"
                      >
                        <cat.icon size={15} className="text-[#F5C400] shrink-0" />
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          بوابة {cat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. المنشآت والمحلات الحقيقية من Supabase */}
              {matchedBusinesses.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    المنشآت والمحلات والشركات
                  </span>
                  {matchedBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/businesses/${biz.slug || biz.id}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#060A13] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5C400]/15 text-[#F5C400] border border-[#F5C400]/30 shrink-0">
                          {biz.category || 'منشأة'}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {biz.name}
                        </span>
                      </div>
                      {biz.city && (
                        <span className="text-[11px] text-slate-400 shrink-0">{biz.city}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 3. البنوك والمصارف الحقيقية */}
              {matchedBanks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    البنوك والمصارف
                  </span>
                  {matchedBanks.map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/banks/${bank.slug || bank.id}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#060A13] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                          مصرف
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {bank.name}
                        </span>
                      </div>
                      <ChevronLeft size={13} className="text-slate-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* رابط الانتقال الشامل لنتائج الدليل */}
              <div
                onClick={() => handleFullSearchSubmit()}
                className="mt-2 pt-2 border-t border-slate-800 p-2.5 rounded-xl bg-[#060A13] hover:bg-[#F5C400]/10 text-center cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xs font-bold text-[#F5C400]">
                  استعراض كافة نتائج "{searchTerm}" في الدليل العام
                </span>
                <ChevronLeft size={14} className="text-[#F5C400]" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
