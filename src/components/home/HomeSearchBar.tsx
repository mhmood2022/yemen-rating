import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  X,
  Building2,
  Landmark,
  Building,
  Briefcase,
  Gavel,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sponsorAd, setSponsorAd] = useState<any>(null);

  const [matchedCategories, setMatchedCategories] = useState<any[]>([]);
  const [matchedBusinesses, setMatchedBusinesses] = useState<any[]>([]);
  const [matchedBanks, setMatchedBanks] = useState<any[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [matchedAuctions, setMatchedAuctions] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // جلب إعلان الراعي الرسمي
  useEffect(() => {
    async function fetchSponsor() {
      try {
        const { data } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) setSponsorAd(data);
      } catch (err) {
        // الراعي الافتراضي الوطني
      }
    }
    fetchSponsor();
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

  // محرك البحث اللحظي الشامل في Supabase
  const executeSearch = async (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) {
      setMatchedCategories([]);
      setMatchedBusinesses([]);
      setMatchedBanks([]);
      setMatchedProperties([]);
      setMatchedJobs([]);
      setMatchedAuctions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // 1. مطابقة البوابات والتصنيفات (شاليهات، مستشفيات، حمامات بخار، معارض سيارات، عيادات...)
    const lower = clean.toLowerCase();
    const catMatches = officialCategories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(lower);
      const idMatch = cat.id.toLowerCase().includes(lower);
      return nameMatch || idMatch;
    });
    setMatchedCategories(catMatches.slice(0, 4));

    // 2. البحث الحي في جداول Supabase في اللحظة ذاتها
    try {
      const [bRes, bnRes, pRes, jRes, aRes] = await Promise.allSettled([
        // البحث في المنشآت والمحلات والشركات
        supabase
          .from('businesses')
          .select('id, slug, name, category, city')
          .or(`name.ilike.%${clean}%,category.ilike.%${clean}%,city.ilike.%${clean}%`)
          .limit(6),

        // البحث في البنوك والمصارف
        supabase
          .from('banks')
          .select('id, slug, name, commercial_name')
          .or(`name.ilike.%${clean}%,commercial_name.ilike.%${clean}%`)
          .limit(3),

        // البحث في العقارات
        supabase
          .from('properties')
          .select('id, title, property_type, deal_type, city')
          .or(`title.ilike.%${clean}%,property_type.ilike.%${clean}%,city.ilike.%${clean}%`)
          .limit(3),

        // البحث في الوظائف
        supabase
          .from('jobs')
          .select('id, title, sector, city, work_type')
          .or(`title.ilike.%${clean}%,sector.ilike.%${clean}%,city.ilike.%${clean}%`)
          .limit(3),

        // البحث في المزادات
        supabase
          .from('auctions')
          .select('id, title, category, city, sale_type')
          .or(`title.ilike.%${clean}%,category.ilike.%${clean}%,city.ilike.%${clean}%`)
          .limit(3)
      ]);

      if (bRes.status === 'fulfilled' && bRes.value.data) setMatchedBusinesses(bRes.value.data);
      if (bnRes.status === 'fulfilled' && bnRes.value.data) setMatchedBanks(bnRes.value.data);
      if (pRes.status === 'fulfilled' && pRes.value.data) setMatchedProperties(pRes.value.data);
      if (jRes.status === 'fulfilled' && jRes.value.data) setMatchedJobs(jRes.value.data);
      if (aRes.status === 'fulfilled' && aRes.value.data) setMatchedAuctions(aRes.value.data);

      setIsOpen(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setIsOpen(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      executeSearch(val);
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      navigate(`/directory?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const totalResults =
    matchedCategories.length +
    matchedBusinesses.length +
    matchedBanks.length +
    matchedProperties.length +
    matchedJobs.length +
    matchedAuctions.length;

  return (
    <div ref={containerRef} className={`relative z-40 font-['Cairo',sans-serif] ${className}`}>
      {/* الحاوية المدمجة: شريط الراعي الرسمي + شريط البحث الوطني */}
      <div className="rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-[#F5C400]/60 transition-all shadow-2xl overflow-hidden">
        {/* 🌟 إعلان الراعي الرسمي المدمج داخل رأس شريط البحث */}
        <div className="bg-[#060A13] border-b border-slate-800 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1 shrink-0">
              <Sparkles size={11} />
              <span>الراعي الرسمي</span>
            </span>
            <span className="text-white text-xs font-bold truncate">
              {sponsorAd?.advertiser_name || 'بنك الكريمي للتمويل الأصغر الإسلامي'}
            </span>
          </div>

          <span className="text-[10px] text-[#F5C400] font-bold shrink-0">
            {sponsorAd?.title || 'شريك التمكين المالي والتنمية الوطنية'}
          </span>
        </div>

        {/* حقل البحث الرئيسي */}
        <div className="flex items-center justify-between p-2.5 px-3.5 gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {isSearching ? (
              <RefreshCw size={17} className="animate-spin text-[#F5C400] shrink-0" />
            ) : (
              <Search size={18} className="text-[#F5C400] shrink-0" />
            )}

            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim() && setIsOpen(true)}
              placeholder="ابحث عن مستشفى، شاليه، بنك، معرض سيارات، حمام بخار، محل..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#060A13] border border-slate-800 text-[11px] text-slate-300 shrink-0 select-none">
            <MapPin size={12} className="text-[#F5C400]" />
            <span>كل اليمن</span>
          </div>
        </div>
      </div>

      {/* 📋 القائمة المنسدلة التفاعلية العائمة لجميع المنشآت والخدمات */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D1527] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 max-h-96 overflow-y-auto space-y-2">
          {totalResults === 0 && !isSearching ? (
            <div className="py-6 text-center text-xs text-slate-400">
              لم يتم العثور على منشآت أو خدمات مطابقة لـ{' '}
              <span className="text-[#F5C400] font-bold">"{query}"</span>
            </div>
          ) : (
            <>
              {/* 1. البوابات والتصنيفات المتخصصة (مستشفيات، شاليهات، حمامات بخار، إلخ) */}
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

              {/* 2. المنشآت والمحلات والشركات */}
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

              {/* 3. البنوك والمصارف */}
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

              {/* 4. العقارات */}
              {matchedProperties.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    العقارات
                  </span>
                  {matchedProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/properties/${prop.id}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#060A13] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          عقار {prop.deal_type || ''}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {prop.title}
                        </span>
                      </div>
                      {prop.city && (
                        <span className="text-[11px] text-slate-400 shrink-0">{prop.city}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 5. الوظائف */}
              {matchedJobs.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    الوظائف الشاغرة
                  </span>
                  {matchedJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/jobs/${job.id}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#060A13] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                          وظيفة
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {job.title}
                        </span>
                      </div>
                      {job.city && (
                        <span className="text-[11px] text-slate-400 shrink-0">{job.city}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 6. المزادات */}
              {matchedAuctions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1">
                    المزادات
                  </span>
                  {matchedAuctions.map((auc) => (
                    <div
                      key={auc.id}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/auctions/${auc.id}`);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#060A13] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                          مزاد
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {auc.title}
                        </span>
                      </div>
                      {auc.city && (
                        <span className="text-[11px] text-slate-400 shrink-0">{auc.city}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* خيار استعراض كافة النتائج في الدليل العام */}
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/directory?search=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-2 pt-2 border-t border-slate-800 p-2 rounded-xl bg-[#060A13] hover:bg-[#F5C400]/10 text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="text-xs font-bold text-[#F5C400]">
                  استعراض كافة المنشآت والنتائج في الدليل الوطني لـ "{query}"
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
