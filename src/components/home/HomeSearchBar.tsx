import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  X,
  Building2,
  Landmark,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  MapPin,
  Check
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const YEMEN_GOVERNORATES = [
  { value: "all", label: "كل المحافظات" },
  { value: "صنعاء", label: "صنعاء" },
  { value: "عدن", label: "عدن" },
  { value: "تعز", label: "تعز" },
  { value: "حضرموت", label: "حضرموت" },
  { value: "الحديدة", label: "الحديدة" },
  { value: "إب", label: "إب" },
  { value: "ذمار", label: "ذمار" },
  { value: "مأرب", label: "مأرب" },
  { value: "صعدة", label: "صعدة" },
  { value: "حجة", label: "حجة" },
  { value: "البيضاء", label: "البيضاء" },
  { value: "لحج", label: "لحج" },
  { value: "أبين", label: "أبين" },
  { value: "المهرة", label: "المهرة" },
  { value: "شبوة", label: "شبوة" },
  { value: "عمران", label: "عمران" },
  { value: "الضالع", label: "الضالع" },
  { value: "ريمة", label: "ريمة" },
  { value: "المحويت", label: "المحويت" },
  { value: "سقطرى", label: "أرخبيل سقطرى" },
  { value: "الجوف", label: "الجوف" }
];

interface HomeSearchBarProps {
  officialCategories?: any[];
  onSelectCategory?: (slug: string) => void;
  className?: string;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  officialCategories = [],
  onSelectCategory,
  className = ""
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGov, setSelectedGov] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isGovMenuOpen, setIsGovMenuOpen] = useState(false);

  const [realSponsorAd, setRealSponsorAd] = useState<{
    advertiserName: string;
    title?: string;
    targetUrl?: string;
    logoUrl?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    sponsorTag?: string;
  } | null>(null);

  const [matchedCategories, setMatchedCategories] = useState<any[]>([]);
  const [matchedBusinesses, setMatchedBusinesses] = useState<any[]>([]);
  const [matchedBanks, setMatchedBanks] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const govDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // جلب الراعي من قاعدة البيانات مع الفصل الصارم بين الفيديو والشعار
  useEffect(() => {
    let isMounted = true;
    async function loadRealSponsor() {
      try {
        const { data, error } = await supabase
          .from("published_ads")
          .select("*")
          .eq("placement_id", "home_sponsor")
          .eq("status", "active")
          .limit(1);

        if (!error && data && data.length > 0 && isMounted) {
          const ad = data[0];
          const adData = ad.data || {};
          
          // 🎥 فيديو الإعلان أو صورته فقط (ممنوع منعاً باتاً وضع الشعار هنا):
          const adVideoOrImage = adData.mediaUrl || adData.media_url || ad.media_url || "";
          
          // 🪙 شعار الراعي الدائري الصغير فقط:
          const sponsorLogoOnly = ad.sponsor_logo || adData.logoUrl || "";

          const isVideo = Boolean(
            adVideoOrImage && (
              adData.mediaType === "video" ||
              adVideoOrImage.endsWith(".mp4") ||
              adVideoOrImage.endsWith(".webm") ||
              adVideoOrImage.startsWith("data:video")
            )
          );

          const name = ad.sponsor_name || adData.advertiserName || ad.title;

          if (name) {
            setRealSponsorAd({
              advertiserName: name,
              title: adData.title || ad.title || "",
              targetUrl: adData.targetUrl || ad.target_url || "",
              logoUrl: sponsorLogoOnly,
              mediaUrl: adVideoOrImage,
              mediaType: isVideo ? "video" : "image",
              sponsorTag: ad.sponsor_tag || adData.sponsorTag || "الراعي الرسمي"
            });
            return;
          }
        }
        if (isMounted) setRealSponsorAd(null);
      } catch {
        if (isMounted) setRealSponsorAd(null);
      }
    }
    loadRealSponsor();

    return () => {
      isMounted = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (govDropdownRef.current && !govDropdownRef.current.contains(e.target as Node)) {
        setIsGovMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsGovMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // البحث المباشر
  const performLiveSearch = useCallback(async (term: string, gov: string) => {
    const clean = term.trim().replace(/[%_(),،]/g, "");
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

    const catMatches = officialCategories.filter((cat) => {
      const name = (cat.name || "").toLowerCase();
      const id = (cat.id || "").toLowerCase();
      return name.includes(lower) || id.includes(lower);
    });
    setMatchedCategories(catMatches.slice(0, 4));

    try {
      let bankQuery = supabase
        .from("banks")
        .select("id, slug, name, city, logo_url")
        .ilike("name", `%${clean}%`)
        .limit(4);

      if (gov && gov !== "all") {
        bankQuery = bankQuery.ilike("city", `%${gov}%`);
      }

      let bizQuery = supabase
        .from("businesses")
        .select("id, slug, name, city, category_id")
        .ilike("name", `%${clean}%`)
        .limit(6);

      if (gov && gov !== "all") {
        bizQuery = bizQuery.ilike("city", `%${gov}%`);
      }

      const [bankRes, bizRes] = await Promise.allSettled([bankQuery, bizQuery]);

      if (bankRes.status === "fulfilled" && bankRes.value.data) {
        setMatchedBanks(bankRes.value.data);
      } else {
        setMatchedBanks([]);
      }

      if (bizRes.status === "fulfilled" && bizRes.value.data) {
        setMatchedBusinesses(bizRes.value.data);
      } else {
        setMatchedBusinesses([]);
      }

      setIsOpen(true);
    } catch (_) {
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

  const handleGovSelect = (govValue: string) => {
    setSelectedGov(govValue);
    setIsGovMenuOpen(false);
    if (searchTerm.trim()) {
      performLiveSearch(searchTerm, govValue);
    }
  };

  const handleFullSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    setIsGovMenuOpen(false);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("search", searchTerm.trim());
    if (selectedGov && selectedGov !== "all") params.append("city", selectedGov);
    navigate(`/directory?${params.toString()}`);
  };

  const totalMatches = matchedCategories.length + matchedBusinesses.length + matchedBanks.length;
  const selectedGovLabel = YEMEN_GOVERNORATES.find((g) => g.value === selectedGov)?.label || "كل المحافظات";

  return (
    <div ref={containerRef} dir="rtl" className={`relative z-40 font-['Cairo',sans-serif] w-full ${className}`}>
      <div className="bg-[#090E1A] border border-slate-800 shadow-2xl rounded-none overflow-visible">

        {/* ⭐ إعلان الراعي الرسمي: الفيديو الحقيقي فقط في الخلفية، والشعار في الدائرة الصغيرة */}
        {realSponsorAd && (
          <div className="bg-[#050811] border-b border-slate-800 rounded-none overflow-hidden transition-all">
            {realSponsorAd.mediaUrl ? (
              <div
                onClick={() => {
                  if (realSponsorAd.targetUrl) window.open(realSponsorAd.targetUrl, "_blank", "noopener,noreferrer");
                }}
                className="relative w-full h-24 sm:h-28 bg-[#0B101D] overflow-hidden cursor-pointer group rounded-none"
              >
                {/* مشغل الفيديو الحقيقي (وليس الشعار!) */}
                {realSponsorAd.mediaType === "video" ? (
                  <video
                    key={realSponsorAd.mediaUrl}
                    src={realSponsorAd.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                  />
                ) : (
                  <img
                    src={realSponsorAd.mediaUrl}
                    alt={realSponsorAd.advertiserName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                  />
                )}

                {/* طبقة التظليل والبيانات المصغرة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50 flex flex-col justify-between p-2 sm:p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-black/60 text-[#F5C400] border border-[#F5C400]/40 text-[9px] font-black rounded-none flex items-center gap-1 backdrop-blur-sm">
                      <Sparkles size={10} />
                      <span>{realSponsorAd.sponsorTag || "الراعي الرسمي"}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {realSponsorAd.targetUrl && (
                        <span className="text-[9px] text-black bg-[#F5C400] font-black px-2 py-0.5 rounded-none flex items-center gap-0.5 shadow-md">
                          <span>زيارة</span>
                          <ExternalLink size={9} />
                        </span>
                      )}
                      <span className="text-[8px] text-zinc-300 bg-black/70 border border-white/15 px-1.5 py-0.5 rounded-none">
                        إعلان راعٍ ⓘ
                      </span>
                      <span className="text-[8px] font-black text-zinc-100 bg-white/15 border border-white/25 px-1 py-0.5 rounded-none font-sans">
                        AD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    {/* الشعار الدائري الصغير فقط + اسم الراعي */}
                    <div className="flex items-center gap-2 min-w-0">
                      {realSponsorAd.logoUrl && (
                        <img src={realSponsorAd.logoUrl} alt="logo" className="w-6 h-6 rounded-full object-cover border border-white/40 bg-black/60 shrink-0" />
                      )}
                      <h4 className="text-white text-xs sm:text-sm font-black truncate drop-shadow-md">{realSponsorAd.advertiserName}</h4>
                    </div>

                    {realSponsorAd.title && (
                      <p className="text-[#F5C400] text-[10px] font-bold drop-shadow-md shrink-0 text-left">
                        {realSponsorAd.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* شريط الراعي بدون وسائط */
              <div
                onClick={() => {
                  if (realSponsorAd.targetUrl) window.open(realSponsorAd.targetUrl, "_blank", "noopener,noreferrer");
                }}
                className={`px-3 py-1.5 flex items-center justify-between text-xs group hover:bg-[#0c1322] transition-colors rounded-none ${
                  realSponsorAd.targetUrl ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-[#F5C400]/15 text-[#F5C400] border border-[#F5C400]/30 text-[9px] font-bold flex items-center gap-1 rounded-none">
                    <Sparkles size={9} />
                    <span>{realSponsorAd.sponsorTag || "الراعي الرسمي"}</span>
                  </span>

                  {realSponsorAd.logoUrl && (
                    <img src={realSponsorAd.logoUrl} alt="sponsor" className="w-5 h-5 rounded-full object-cover" />
                  )}

                  <span className="text-white text-xs font-bold truncate group-hover:text-[#F5C400] transition-colors">
                    {realSponsorAd.advertiserName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {realSponsorAd.title && (
                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[150px] hidden sm:inline">
                      {realSponsorAd.title}
                    </span>
                  )}
                  {realSponsorAd.targetUrl && (
                    <span className="text-[10px] text-[#F5C400] hover:text-white font-bold flex items-center gap-0.5 transition-colors">
                      <span>زيارة</span>
                      <ExternalLink size={9} />
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400 bg-white/5 border border-white/10 px-1 py-0.5 rounded-none font-sans">
                    AD
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🔍 شريط البحث بنمط Yelp وبزوايا 90 حادة */}
        <form
          onSubmit={handleFullSearchSubmit}
          className="flex items-center h-11 px-3 gap-2 w-full rounded-none"
        >
          <Search size={17} className="text-[#F5C400] shrink-0" />

          <input
            type="text"
            dir="rtl"
            value={searchTerm}
            onChange={handleTermChange}
            onFocus={() => searchTerm.trim() && setIsOpen(true)}
            placeholder="ابحث عن بنك، شركة، مطعم، مستشفى، خدمة، عقار..."
            style={{
              outline: "none",
              border: "none",
              boxShadow: "none",
              WebkitTapHighlightColor: "transparent"
            }}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 font-medium text-right border-0 focus:outline-none focus:ring-0 ring-0 shadow-none p-0 m-0"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-white shrink-0"
            >
              <X size={14} />
            </button>
          )}

          <div className="w-px h-5 bg-slate-800 shrink-0" />

          {/* اختيار المحافظة */}
          <div ref={govDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsGovMenuOpen(!isGovMenuOpen)}
              className="h-8 px-2 flex items-center gap-1.5 text-slate-300 hover:text-white transition-all text-right cursor-pointer"
            >
              <MapPin size={13} className="text-[#F5C400] shrink-0" />
              <span className="text-xs font-bold truncate max-w-[85px]">
                {selectedGovLabel}
              </span>
              <ChevronDown
                size={11}
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                  isGovMenuOpen ? "rotate-180 text-[#F5C400]" : ""
                }`}
              />
            </button>

            {isGovMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto bg-[#0A0F1D] border border-slate-700 shadow-2xl p-1.5 z-50 space-y-0.5 rounded-none">
                {YEMEN_GOVERNORATES.map((gov) => {
                  const isSelected = selectedGov === gov.value;
                  return (
                    <div
                      key={gov.value}
                      onClick={() => handleGovSelect(gov.value)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-bold cursor-pointer transition-colors rounded-none ${
                        isSelected
                          ? "bg-[#F5C400] text-black"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className={isSelected ? "text-black" : "text-slate-400"} />
                        <span>{gov.label}</span>
                      </div>
                      {isSelected && <Check size={13} className="text-black stroke-[3]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* نافذة النتائج المنبثقة للبحث الحي */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#090E1A] border border-slate-800 shadow-2xl p-2.5 z-50 max-h-96 overflow-y-auto space-y-2.5 rounded-none">
          {totalMatches === 0 && !isSearching ? (
            <div className="py-6 text-center text-xs text-slate-400">
              لا توجد نتائج مطابقة لـ{" "}
              <span className="text-[#F5C400] font-bold">"{searchTerm}"</span>
              {selectedGov !== "all" && ` في محافظة ${selectedGovLabel}`}
            </div>
          ) : (
            <>
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
                      className="flex items-center justify-between p-2.5 hover:bg-[#050811] cursor-pointer transition-colors group rounded-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {bank.logo_url ? (
                          <img src={bank.logo_url} alt={bank.name} className="w-6 h-6 object-contain bg-white/10 p-0.5 shrink-0" />
                        ) : (
                          <span className="p-1 bg-blue-500/20 text-blue-400 shrink-0">
                            <Landmark size={14} />
                          </span>
                        )}
                        <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                          {bank.name}
                        </span>
                      </div>
                      <ChevronLeft size={13} className="text-slate-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* بوابات الخدمات */}
              {matchedCategories.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 px-2 block mb-1.5">
                    بوابات الخدمات
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {matchedCategories.map((cat) => {
                      const isValidIcon = cat.icon && (typeof cat.icon === "function" || typeof cat.icon === "object");
                      const IconComp = isValidIcon ? cat.icon : Building2;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setIsOpen(false);
                            if (onSelectCategory) onSelectCategory(cat.id);
                            else navigate(`/directory?category=${encodeURIComponent(cat.id)}`);
                          }}
                          className="flex items-center gap-2 p-2 bg-[#050811] hover:bg-[#F5C400]/10 border border-slate-800 hover:border-[#F5C400]/40 cursor-pointer transition-colors group rounded-none"
                        >
                          <IconComp size={14} className="text-[#F5C400] shrink-0" />
                          <span className="text-xs font-bold text-white group-hover:text-[#F5C400] truncate">
                            بوابة {cat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* المنشآت والشركات والمحلات */}
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
                      className="flex items-center justify-between p-2.5 hover:bg-[#050811] cursor-pointer transition-colors group rounded-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F5C400]/15 text-[#F5C400] border border-[#F5C400]/30 shrink-0 rounded-none">
                          منشأة
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

              {/* عرض كافة النتائج */}
              <div
                onClick={() => handleFullSearchSubmit()}
                className="mt-2 pt-2 border-t border-slate-800 p-2.5 bg-[#050811] hover:bg-[#F5C400]/10 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 rounded-none"
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
