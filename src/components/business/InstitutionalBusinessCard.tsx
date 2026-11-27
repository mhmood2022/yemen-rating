import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Star,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Bookmark,
  Share2,
  Check,
  Image as ImageIcon,
  Stethoscope,
  Syringe,
  Microscope,
  Bed,
  Utensils,
  Truck,
  GraduationCap,
  BookOpen,
  Car,
  Building,
  ShieldCheck,
  Clock,
  Wifi,
  Waves,
  CheckCircle2,
  Sparkles,
  Store,
  HeartPulse,
} from 'lucide-react';
import { YRBadge, BadgeType } from '../common/YRBadge';

export interface InstitutionalBusinessCardProps {
  business: Record<string, any>;
  categoryLabel?: string;
  categorySlug?: string;
  liveRating?: number;
  liveReviewCount?: number;
  reviewerAvatars?: string[];
  onOpen?: (business: Record<string, any>) => void;
}

const SAVED_BIZ_KEY = 'yr_saved_businesses_v1';

const getSavedSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SAVED_BIZ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const pickCategoryIcon = (slugOrLabel: string): React.ElementType => {
  const s = (slugOrLabel || '').toLowerCase();
  if (s.includes('hospital') || s.includes('مستشف') || s.includes('clinic') || s.includes('عياد')) return Stethoscope;
  if (s.includes('pharm') || s.includes('صيدل') || s.includes('lab') || s.includes('مختبر')) return HeartPulse;
  if (s.includes('hotel') || s.includes('فندق') || s.includes('chalet') || s.includes('شاليه')) return Bed;
  if (s.includes('rest') || s.includes('مطعم') || s.includes('cafe') || s.includes('كافيه')) return Utensils;
  if (s.includes('univ') || s.includes('جامع') || s.includes('school') || s.includes('مدرس')) return GraduationCap;
  if (s.includes('car') || s.includes('سيار')) return Car;
  if (s.includes('bank') || s.includes('بنك') || s.includes('صراف')) return Building;
  if (s.includes('transport') || s.includes('نقل')) return Truck;
  if (s.includes('market') || s.includes('mall') || s.includes('سوبر')) return Store;
  return Sparkles;
};

const pickFeatureIcon = (label: string, slugOrLabel: string): React.ElementType => {
  const t = (label || '').toLowerCase();
  const s = (slugOrLabel || '').toLowerCase();
  if (t.includes('طوارئ') || t.includes('إسعاف') || t.includes('عناية')) return Syringe;
  if (t.includes('مختبر') || t.includes('تحاليل') || t.includes('أشعة')) return Microscope;
  if (t.includes('أقسام') || t.includes('غرف') || t.includes('أجنحة') || t.includes('سكن')) return Bed;
  if (t.includes('طب') || t.includes('عياد') || t.includes('جراح')) return Stethoscope;
  if (t.includes('توصيل') || t.includes('سفري') || t.includes('شحن')) return Truck;
  if (t.includes('واي فاي') || t.includes('wifi') || t.includes('إنترنت')) return Wifi;
  if (t.includes('مسبح')) return Waves;
  if (t.includes('24') || t.includes('ساعة')) return Clock;
  if (t.includes('بكالوريوس') || t.includes('ماجستير') || t.includes('تخصص') || t.includes('مناهج')) return BookOpen;
  if (s.includes('rest') || s.includes('مطعم') || t.includes('أكل') || t.includes('مشاوي') || t.includes('بحرية')) return Utensils;
  if (s.includes('car') || s.includes('سيار') || t.includes('تويوتا') || t.includes('هيونداي') || t.includes('موديل')) return Car;
  if (s.includes('univ') || s.includes('جامع') || s.includes('school')) return GraduationCap;
  return CheckCircle2;
};

export const InstitutionalBusinessCard: React.FC<InstitutionalBusinessCardProps> = ({
  business,
  categoryLabel,
  categorySlug = '',
  liveRating,
  liveReviewCount,
  reviewerAvatars = [],
  onOpen,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(() => getSavedSet().has(String(business.id)));

  const resolvedCategory =
    categoryLabel ||
    business.categoryName ||
    business.sub_category ||
    business.category_label ||
    'منشأة معتمدة';

  const catHint = `${categorySlug} ${resolvedCategory}`;
  const CategoryIcon = pickCategoryIcon(catHint);

  const avgRating = Number(liveRating ?? business.rating ?? 0);
  const reviewCount = Number(liveReviewCount ?? business.review_count ?? business.reviews_count ?? 0);
  const hasRatings = avgRating > 0 && reviewCount > 0;

  // عدد الصور الحقيقية
  const mediaCount = useMemo(() => {
    const imgs = new Set<string>();
    if (business.cover_url) imgs.add(business.cover_url);
    if (Array.isArray(business.gallery)) {
      business.gallery.forEach((g: any) => {
        if (typeof g === 'string' && g.trim()) imgs.add(g);
        else if (g?.url) imgs.add(g.url);
      });
    }
    if (Array.isArray(business.images)) {
      business.images.forEach((g: any) => {
        if (typeof g === 'string' && g.trim()) imgs.add(g);
      });
    }
    return imgs.size;
  }, [business]);

  // استخراج المزايا والخدمات الحقيقية المتكيفة حسب نشاط المنشأة
  const featureChips = useMemo(() => {
    const out: string[] = [];
    const pushUnique = (val: string) => {
      const clean = String(val || '').trim();
      if (clean && !out.includes(clean)) out.push(clean);
    };

    const rawSector =
      business.sector_features ||
      business.sections_config?.features?.sector_features;

    if (Array.isArray(rawSector)) {
      rawSector.forEach((f: any) => {
        if (typeof f === 'string') pushUnique(f);
        else if (f && f.enabled !== false && f.label) pushUnique(f.label);
      });
    } else if (rawSector && typeof rawSector === 'object') {
      Object.keys(rawSector).forEach((k) => {
        const v = rawSector[k];
        if (v === true) pushUnique(k);
        else if (v && v.enabled) pushUnique(v.label || k);
      });
    }

    const featObj = business.sections_config?.features || {};
    if (featObj.rooms_count > 0) pushUnique(`${featObj.rooms_count} غرفة وجناح`);
    if (featObj.has_pool) pushUnique('مسبح');
    if (featObj.has_wifi) pushUnique('واي فاي مجاني');
    if (featObj.has_delivery) pushUnique('خدمة توصيل');
    if (featObj.emergency_24h) pushUnique('طوارئ 24/7');

    for (const arrField of [business.services, business.specialties, business.facilities, business.brands, business.offers]) {
      if (Array.isArray(arrField)) {
        arrField.forEach((x: any) => {
          if (typeof x === 'string') pushUnique(x);
          else if (x?.name || x?.title || x?.label) pushUnique(x.name || x.title || x.label);
        });
      } else if (typeof arrField === 'string' && arrField.trim()) {
        arrField
          .split(/[,،\n|]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach(pushUnique);
      }
    }

    if (Array.isArray(business.branches) && business.branches.length > 0) {
      pushUnique(`${business.branches.length} فروع`);
    }
    if (business.working_hours && String(business.working_hours).includes('24')) {
      pushUnique('يعمل 24 ساعة');
    }

    return out;
  }, [business]);

  const locationText = [business.city, business.district || business.address]
    .filter((v) => v && String(v).trim())
    .join(' - ') || 'اليمن';

  const mapHref = business.map_url && /^https?:\/\//i.test(business.map_url)
    ? business.map_url
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name || ''} ${business.city || 'اليمن'}`)}`;

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const set = getSavedSet();
    const id = String(business.id);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    try {
      localStorage.setItem(SAVED_BIZ_KEY, JSON.stringify(Array.from(set)));
    } catch {}
    setIsSaved(set.has(id));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/business-page/${business.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, url: shareUrl });
      } else {
        await navigator.clipboard?.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  const handleCardOpen = () => {
    onOpen?.(business);
  };

  const subtitle = business.tagline || business.slogan || (business.slug ? `@${business.slug}` : '');

  return (
    <article
      dir="rtl"
      onClick={handleCardOpen}
      className="bg-[#070709] border border-[#2F3336] hover:border-[#FFC500]/55 rounded-3xl overflow-hidden shadow-xl transition duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* 1. الغلاف العلوي */}
        <div className="relative h-40 sm:h-44 w-full bg-[#111318] overflow-hidden">
          {business.cover_url ? (
            <img
              src={business.cover_url}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#16181C] via-[#0D0F14] to-black flex items-center justify-center">
              <CategoryIcon className="w-14 h-14 text-[#FFC500]/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/15 to-black/45" />

          {/* شارة النشاط (أعلى اليمين) */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5 shadow">
            <CategoryIcon size={13} className="text-[#FFC500]" />
            <span>{resolvedCategory}</span>
          </div>

          {/* عداد الصور (أعلى اليسار) */}
          {mediaCount > 0 && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5 shadow"
              dir="ltr"
            >
              <ImageIcon size={12} className="text-[#FFC500]" />
              <span>1/{mediaCount}</span>
            </div>
          )}
        </div>

        {/* 2. جسم البطاقة (الأفاتار في اليمين + العنوان + التقييم + الخدمات + الوصف) */}
        <div className="px-4 pt-3 pb-3 space-y-3">
          {/* الصف العلوي: الشعار في الجهة اليمنى RTL + الاسم والشارة */}
          <div className="flex items-start gap-3">
            <div className="-mt-11 sm:-mt-12 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F1014] border-2 border-[#2F3336] p-1 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center relative z-10">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-xl font-black text-[#FFC500]">
                  {(business.name || 'م').charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#FFC500] transition leading-snug">
                  {business.name}
                </h3>
                {business.badge_type && business.badge_type !== 'none' && (
                  <YRBadge type={business.badge_type as BadgeType} size={18} />
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-[#71767B] truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* الموقع والتقييم الحقيقي */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold min-w-0">
              <MapPin size={14} className="text-[#FFC500] shrink-0" />
              <span className="truncate">{locationText}</span>
            </span>

            {hasRatings ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Star size={15} className="text-[#FFC500] fill-[#FFC500]" />
                <span className="text-sm font-black text-white" dir="ltr">
                  {avgRating.toFixed(1)} / 5
                </span>
                <span className="text-[11px] text-[#71767B]">
                  ({reviewCount.toLocaleString('ar-EG')} تقييم)
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[#71767B] font-semibold">
                لا توجد تقييمات بعد
              </span>
            )}
          </div>

          {/* الخدمات والمميزات المتكيفة مع النشاط */}
          {featureChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {featureChips.slice(0, 4).map((feat, idx) => {
                const FIcon = pickFeatureIcon(feat, catHint);
                return (
                  <span
                    key={`${feat}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16181C] border border-[#2F3336] text-zinc-200 text-[11px] font-bold"
                  >
                    <FIcon size={12} className="text-[#FFC500] shrink-0" />
                    <span>{feat}</span>
                  </span>
                );
              })}
              {featureChips.length > 4 && (
                <span className="px-2 py-1 rounded-full bg-[#111318] border border-[#2F3336] text-[10.5px] font-bold text-[#71767B]">
                  +{featureChips.length - 4}
                </span>
              )}
            </div>
          )}

          {/* صندوق الوصف القابل للتوسيع */}
          {business.description && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="rounded-2xl bg-[#111318] border border-[#2F3336] px-3.5 py-2.5 flex items-start justify-between gap-2 hover:border-zinc-600 transition"
            >
              <p
                className={`text-xs text-zinc-300 leading-relaxed flex-1 ${
                  expanded ? '' : 'line-clamp-2'
                }`}
              >
                {business.description}
              </p>
              <button
                type="button"
                aria-label="توسيع الوصف"
                className="text-[#71767B] hover:text-white pt-0.5 shrink-0"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}

          {/* شريط التفاعل: المقيمون + الهاتف + الخريطة */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-3 gap-2 pt-1 text-[11px]"
          >
            {/* المقيمون / حالة التوثيق */}
            <div className="flex items-center gap-1.5 min-w-0 bg-[#111318] border border-[#2F3336] rounded-xl px-2.5 py-2">
              {reviewerAvatars.length > 0 ? (
                <div className="flex -space-x-2 space-x-reverse shrink-0">
                  {reviewerAvatars.slice(0, 3).map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-black"
                    />
                  ))}
                </div>
              ) : (
                <ShieldCheck size={15} className="text-[#FFC500] shrink-0" />
              )}
              <span className="font-bold text-white truncate">
                {reviewCount > 0 ? `+${reviewCount} مقيم` : 'منشأة مسجلة'}
              </span>
            </div>

            {/* الاتصال */}
            {business.phone ? (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center justify-center gap-1.5 bg-[#111318] border border-[#2F3336] hover:border-[#FFC500]/50 rounded-xl px-2 py-2 text-center transition min-w-0"
              >
                <Phone size={14} className="text-[#FFC500] shrink-0" />
                <div className="min-w-0 text-right">
                  <p className="font-black text-white truncate text-[10.5px]" dir="ltr">
                    {business.phone}
                  </p>
                  <p className="text-[9.5px] text-[#71767B]">للاتصال</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-1 bg-[#111318] border border-[#2F3336] rounded-xl px-2 py-2 text-[#71767B]">
                <Phone size={13} />
                <span className="text-[10px]">غير مضاف</span>
              </div>
            )}

            {/* الخريطة */}
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 bg-[#111318] border border-[#2F3336] hover:border-[#FFC500]/50 rounded-xl px-2 py-2 text-zinc-200 font-bold transition min-w-0"
            >
              <MapPin size={14} className="text-[#FFC500] shrink-0" />
              <span className="truncate text-[10.5px]">عرض على الخريطة</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. شريط الإجراءات السفلي */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-4 pb-4 pt-1 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleCardOpen}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-[#FFC500] hover:bg-[#e6b100] active:scale-[0.98] text-black text-sm font-black flex items-center justify-center gap-1.5 transition shadow"
        >
          <span>عرض التفاصيل الكاملة</span>
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          onClick={handleToggleSave}
          aria-label="حفظ المنشأة"
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
            isSaved
              ? 'bg-[#FFC500]/20 border-[#FFC500] text-[#FFC500]'
              : 'bg-[#16181C] border-[#2F3336] text-white hover:border-[#FFC500]/50'
          }`}
        >
          <Bookmark size={17} className={isSaved ? 'fill-[#FFC500]' : ''} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="مشاركة المنشأة"
          className="w-11 h-11 rounded-2xl bg-[#16181C] border border-[#2F3336] hover:border-[#FFC500]/50 text-white flex items-center justify-center transition"
        >
          {copied ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
        </button>
      </div>
    </article>
  );
};
