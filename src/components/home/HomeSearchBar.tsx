import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  X,
  Building2,
  Landmark,
  ChevronLeft,
  RefreshCw,
  ArrowLeft,
  ExternalLink
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

  const [realSponsorAd, setRealSponsorAd] = useState<{
    advertiserName: string;
    title?: string;
    targetUrl?: string;
    logoUrl?: string;
  } | null>(null);

  const [matchedCategories, setMatchedCategories] = useState<any[]>([]);
  const [matchedBusinesses, setMatchedBusinesses] = useState<any[]>([]);
  const [matchedBanks, setMatchedBanks] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // جلب إعلان الراعي النشط
  useEffect(() => {
    let isMounted = true;
    async function loadRealSponsor() {
      try {
        const { data, error } = await supabase
          .from('published_ads')
          .select('*')
          .eq('status', 'active')
          .or('placement_id.eq.home_sponsor,placement_id.eq.sponsor,placement_id.eq.header_sponsor')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && isMounted) {
          const adData = data.data || {};
          const name = adData.advertiserName || data.advertiser_name || adData.title || data.title;
          if (name) {
            setRealSponsorAd({
              advertiserName: name,
              title: adData.title || data.title || '',
              targetUrl: adData.targetUrl || data.target_url || '',
              logoUrl: adData.logoUrl || data.logo_url || data.image_url || ''
            });
            return;
          }
        }
        if (isMounted) setRealSponsorAd(null);
      } catch (err) {
        if (isMounted) setRealSponsorAd(null);
      }
    }
    loadRealSponsor();
    return () => {
      isMounted = false;
    };
  }, []);

  // إغلاق القائمة عند النقر خارجها أو ضغط Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // دالة البحث المباشر
  const performLiveSearch = useCallback(async (term: string, gov: string) => {
    const clean = term.trim().replace(/[%_]/g, '');
    if (!clean) {
      setMatchedCategories([]);
      setMatchedBusinesses([]);
      setMatchedBanks([]);
      setIsSearching(false);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const lower = clean.toLowerCase();

    // مطابقة الأقسام
    const catMatches = officialCategories.filter((cat) => {
      const name = (cat.name || '').toLowerCase();
      const id = (cat.id || '').toLowerCase();
      return name.includes(lower) || id.includes(lower);
    });
    setMatchedCategories(catMatches.slice(0, 4));

    try {
      // مطابقة المنشآت
      let bizQuery = supabase
        .from('businesses')
        .select('id, slug, name, category, city')
        .or(`name.ilike.%${clean}%,category.ilike.%${clean}%`)
        .limit(6);

      if (gov && gov !== 'all') {
        bizQuery = bizQuery.ilike('city', `%${gov}%`);
      }

      // مطابقة البنوك
      let bankQuery = supabase
        .from('banks')
        .select('id, slug, name, commercial_name')
        .or(`name.ilike.%${clean}%,commercial_name.ilike.%${clean}%`)
        .limit(3);

      const [bizRes, bankRes] = await Promise.allSettled([bizQuery, bankQuery]);

      if (bizRes.status === 'fulfilled' && bizRes.value.data) {
        setMatchedBusinesses(bizRes.value.data);
      } else {
        setMatchedBusinesses([]);
      }

      if (bankRes.status === 'fulfilled' && bankRes.value.data) {
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
  }, [officialCategories]);

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
    }, 200);
  };

  const handleGovChange = (gov: string) => {
    setSelectedGov(gov);
    if (searchTerm.trim()) {
      performLiveSearch(searchTerm, gov);
    }
  };

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
        
        {/* إعلان الراعي الحقيقي التفاعلي */}
        {realSponsorAd && (
          <div className="bg-[#060A13] border-b border-slate-800 px-3.5 py-1.5 flex items-center justify-between text-xs group hover:bg-[#0a101f] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1 shrink-0">
                <Sparkles size={11} className="animate-pulse" />
                <span>الراعي الرسمي</span>
              </span>

              {realSponsorAd.logoUrl && (
                <div className="w-5 h-5 rounded overflow-hidden bg-white/10 p-0.5 border border-slate-700 shrink-0">
                  <img src={realSponsorAd.logoUrl} alt="sponsor-logo" className="w-full h-full object-contain" />
                </div>
              )}

              <span className="text-white text-xs font-bold truncate">
                {realSponsorAd.advertiserName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {realSponsorAd.title && (
                <span className="text-[10px] text-[#F5C400] font-bold shrink-0 truncate max-w-[180px] hidden sm:inline">
                  {realSponsorAd.title}
                </span>
              )}
              {realSponsorAd.targetUrl && (
                <a
                  href={realSponsorAd.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-[#F5C400] transition-colors flex items-center gap-1 text-[11px]"
                  title="زيارة الراعي"
                >
                  <span className="hidden sm:inline">زيارة</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* شريط البحث المزدوج */}
        <form onSubmit={handleFullSearchSubmit} className="p-2 sm:p-2.5 flex flex-col md:flex-row items-center gap-2">
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
              placeholder="عن ماذا تبحث؟ (مطاعم، فنادق، مستشفيات، بنوك، شركات...)"
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white shrink-0 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="w-full md:w-56 shrink-0">
            <YRSelect
              value={selectedGov}
              options={YEMEN_GOVERNORATES}
              onChange={handleGovChange}
              placeholder="كل المحافظات"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto h-11 px-6 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>بحث</span>
            <ArrowLeft size={14} />
          </button>
        </form>
      </div>

      {/* قائمة النتائج المنبثقة الذكية */}
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
              {/* أقسام الخدمات */}
              {matchedCategories.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    بوابات الخدمات المعتمدة
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {matchedCategories.map((cat) => {
                      const IconComp = typeof cat.icon === 'function' || typeof cat.icon === 'object' ? cat.icon : Building2;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setIsOpen(false);
                            if (onSelectCategory) onSelectCategory(cat.id);
                            else navigate(`/directory?category=${encodeURIComponent(cat.id)}`);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#060A13] hover:bg-[#F5C400]/10 border border-slate-800 hover:border-[#F5C400]/40 cursor-pointer transition-colors group"
                        >
                          <IconComp size={15} className="text-[#F5C400] shrink-0" />
                          <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                            بوابة {cat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* المنشآت والمحلات */}
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

              {/* البنوك والمصارف */}
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
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 flex items-center gap-1">
                          <Landmark size={11} />
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

              {/* زر استعراض الكل */}
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
