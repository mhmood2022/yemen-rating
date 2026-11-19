import React from 'react';
import {
  Crown,
  Star,
  Check,
  MessageCircle,
  Phone,
  ArrowLeft,
  Eye,
  Megaphone,
  ShieldCheck,
  Truck,
  Headphones,
  Cpu,
  HardDrive,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { VerifiedBadge, BadgeType } from '../common/VerifiedBadge';

export type PhonePostTier = 'free' | 'basic' | 'pro' | 'vip';

export interface PhoneCardSpec {
  k: string;
  v: string;
}

export interface PhoneCardData {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  condition: string;
  storage: string;
  ram?: string;
  processor?: string;
  simSupport?: string;
  delivery?: string;
  negotiable?: string;
  color?: string;
  city: string;
  sellerName: string;
  sellerPhone: string;
  isVerified: boolean;
  images: string[];
  category: string;
  description?: string;
  createdAt: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  badgeType?: BadgeType;
  businessId?: string;
  authorId?: string;
  adTier?: PhonePostTier;
  headline?: string;
  highlights?: string[];
  ctaLabel?: string;
  viewsCount?: number;
  expiresAt?: string;
}

interface CommonCardProps {
  item: PhoneCardData;
  categoryLabel: string;
  timeAgo: string;
  specs: PhoneCardSpec[];
  onOpenDetail: (item: PhoneCardData) => void;
  onOpenImage: (item: PhoneCardData) => void;
  onOpenBusiness?: (businessId: string) => void;
  onShare: (item: PhoneCardData) => void;
}

const buildWaUrl = (item: PhoneCardData, categoryLabel: string) =>
  `https://wa.me/${item.sellerPhone}?text=${encodeURIComponent(
    `مرحباً، أرغب بالاستفسار عن ${categoryLabel} ${item.name} المعروض بسعر ${item.price.toLocaleString()} ر.ي`
  )}`;

const getHandle = (item: PhoneCardData) =>
  item.sellerUsername || item.brand.toLowerCase().replace(/\s+/g, '');

const formatCompact = (n?: number, fallback = 120) => {
  const num = Number(n || fallback);
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
};

/* ============================================================================
 * 1) باقة VIP — خلفية سوداء بلمعة بنفسجية ملكية وإطار ذهبي وترتيب التغريدة
 * ========================================================================== */
export const PhoneVipBanner: React.FC<
  CommonCardProps & {
    totalVipCount?: number;
    activeVipIndex?: number;
    onSelectVipIndex?: (idx: number) => void;
  }
> = ({
  item,
  categoryLabel,
  timeAgo,
  specs,
  onOpenDetail,
  onOpenImage,
  onOpenBusiness,
  onShare,
  totalVipCount = 1,
  activeVipIndex = 0,
  onSelectVipIndex,
}) => {
  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 3)
      : specs.slice(0, 3).map((s) => `${s.k}: ${s.v}`);

  const vipIcons = [ShieldCheck, Truck, Headphones];

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full rounded-none bg-black bg-gradient-to-b from-[#2A1154]/45 via-black to-black border-y border-[#FFC500]/80 p-3 hover:from-[#2A1154]/55 transition cursor-pointer select-none"
    >
      <div className="flex gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (item.businessId && onOpenBusiness) onOpenBusiness(item.businessId);
            else onOpenDetail(item);
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 border-[1.5px] border-[#FFC500] flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#FFC500] text-lg cursor-pointer hover:opacity-85 transition"
        >
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
          ) : (
            <span>{item.sellerName?.[0] || 'م'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-nowrap min-w-0 gap-1">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[120px] sm:max-w-[175px]"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'gold' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[75px] sm:max-w-[115px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {totalVipCount > 1 && onSelectVipIndex && (
                <div className="flex items-center gap-0.5 text-[10px] text-[#FFC500] font-bold">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVipIndex((activeVipIndex - 1 + totalVipCount) % totalVipCount);
                    }}
                    className="p-0.5 hover:text-white cursor-pointer"
                    aria-label="السابق"
                  >
                    <ChevronRight size={12} />
                  </button>
                  <span>{activeVipIndex + 1}/{totalVipCount}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVipIndex((activeVipIndex + 1) % totalVipCount);
                    }}
                    className="p-0.5 hover:text-white cursor-pointer"
                    aria-label="التالي"
                  >
                    <ChevronLeft size={12} />
                  </button>
                </div>
              )}
              <span className="h-[22px] inline-flex items-center gap-1 px-2.5 rounded-full bg-gradient-to-r from-[#F5B727] to-[#FCE068] text-black text-[10.5px] font-black leading-none">
                <Crown size={11} className="stroke-[2.5] shrink-0" />
                <span>إعلان VIP مثبت</span>
              </span>
            </div>
          </div>

          <div className="mt-1 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h3 className="text-[14.5px] font-black text-[#FFD748] leading-[20px]">
                {item.headline || item.name}
              </h3>
              <span className="text-[14px] font-black font-mono text-[#FFC500] shrink-0">
                {item.price.toLocaleString()} ر.ي
              </span>
            </div>

            {item.headline && (
              <p className="text-[12.5px] font-bold text-white leading-[18px]">
                {categoryLabel} · {item.name}
              </p>
            )}

            {item.description && (
              <p className="text-[13px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words">
                {item.description}
              </p>
            )}

            {highlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-0.5 text-[11.5px] leading-[18px] text-[#E7E9EA]">
                {highlights.map((h, i) => {
                  const IconComp = vipIcons[i % vipIcons.length];
                  return (
                    <span key={i} className="inline-flex items-center gap-1">
                      <IconComp size={12.5} className="text-[#FFD748] shrink-0" />
                      <span>{h}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {item.images?.[0] && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenImage(item);
              }}
              className="mt-2.5 rounded-2xl overflow-hidden border border-[#FFC500]/35 max-h-80 bg-zinc-950 relative cursor-pointer"
            >
              <img src={item.images[0]} alt={item.name} className="w-full max-h-80 object-cover" loading="lazy" />
              {item.images.length > 1 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10.5px] font-bold border border-white/10">
                  1 / {item.images.length}
                </span>
              )}
            </div>
          )}

          <div
            className="mt-2.5 pt-1 flex items-center justify-between gap-2 text-[11.5px] text-[#8B98A5] leading-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1 leading-none">
                <Eye size={13.5} className="text-[#FFD748] shrink-0" />
                <span>{formatCompact(item.viewsCount, 125000)}</span>
              </span>
              <a href={`tel:${item.sellerPhone}`} className="inline-flex items-center gap-1 hover:text-[#FFD748] transition leading-none">
                <Phone size={13.5} className="shrink-0" />
                <span>اتصال</span>
              </a>
              <button type="button" onClick={() => onOpenDetail(item)} className="hover:text-[#FFD748] transition cursor-pointer leading-none">
                التفاصيل
              </button>
              <button type="button" onClick={() => onShare(item)} className="hover:text-[#FFD748] transition cursor-pointer inline-flex items-center" aria-label="مشاركة">
                <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                  <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                </svg>
              </button>
            </div>

            <a
              href={buildWaUrl(item, categoryLabel)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-[#FFC500] hover:bg-[#e5b200] text-black font-black text-[11px] leading-none transition shrink-0"
            >
              <span>{item.ctaLabel || 'تسوق الآن'}</span>
              <ArrowLeft size={12.5} className="shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ============================================================================
 * 2) الباقة الاحترافية (الذهبي) — خلفية سوداء + ألوان ذهبية خالصة + ترتيب التغريدة
 * ========================================================================== */
export const PhoneProAdCard: React.FC<CommonCardProps> = ({
  item,
  categoryLabel,
  timeAgo,
  specs,
  onOpenDetail,
  onOpenImage,
  onOpenBusiness,
  onShare,
}) => {
  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 4)
      : specs.slice(0, 4).map((s) => `${s.k}: ${s.v}`);

  const proIcons = [HardDrive, Cpu, BatteryCharging, Check];

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full rounded-none bg-black bg-gradient-to-b from-[#FFC500]/[0.08] via-black to-black border-y border-[#FFC500]/70 p-3 hover:from-[#FFC500]/[0.12] transition cursor-pointer select-none"
    >
      <div className="flex gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (item.businessId && onOpenBusiness) onOpenBusiness(item.businessId);
            else onOpenDetail(item);
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 border-[1.5px] border-[#FFC500]/80 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#FFC500] text-lg cursor-pointer hover:opacity-85 transition"
        >
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
          ) : (
            <span>{item.sellerName?.[0] || 'م'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-nowrap min-w-0 gap-1">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[125px] sm:max-w-[175px]"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'gold' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[115px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <span className="h-[22px] inline-flex items-center gap-1 px-2.5 rounded-full bg-[#FFC500] text-black text-[10.5px] font-black leading-none shrink-0">
              <Star size={11} className="fill-black stroke-black shrink-0" />
              <span>إعلان مميز</span>
            </span>
          </div>

          <div className="mt-1 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h3 className="text-[14.5px] font-black text-white leading-[20px]">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[14px] font-black font-mono text-[#FFC500]">
                  {item.price.toLocaleString()} ر.ي
                </span>
                {item.negotiable === 'نعم' && (
                  <span className="text-[10px] text-[#FFC500] font-bold border border-[#FFC500]/40 bg-[#FFC500]/10 px-1.5 py-0.5 rounded-full">
                    قابل للتفاوض
                  </span>
                )}
              </div>
            </div>

            {(item.headline || item.description) && (
              <p className="text-[13px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words">
                {item.headline || item.description}
              </p>
            )}

            {highlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-0.5 text-[11.5px] leading-[18px] text-zinc-200">
                {highlights.map((h, i) => {
                  const IconComp = proIcons[i % proIcons.length];
                  return (
                    <span key={i} className="inline-flex items-center gap-1">
                      <IconComp size={12.5} className="text-[#FFC500] shrink-0" />
                      <span>{h}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {item.images?.[0] && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenImage(item);
              }}
              className="mt-2.5 rounded-2xl overflow-hidden border border-[#FFC500]/30 max-h-80 bg-zinc-950 relative cursor-pointer"
            >
              <img src={item.images[0]} alt={item.name} className="w-full max-h-80 object-cover" loading="lazy" />
              {item.images.length > 1 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10.5px] font-bold border border-white/10">
                  1 / {item.images.length}
                </span>
              )}
            </div>
          )}

          <div
            className="mt-2.5 pt-1 flex items-center justify-between gap-2 text-[11.5px] text-[#8B98A5] leading-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1 leading-none">
                <Eye size={13.5} className="text-[#FFC500] shrink-0" />
                <span>{formatCompact(item.viewsCount, 78000)}</span>
              </span>
              <a href={`tel:${item.sellerPhone}`} className="inline-flex items-center gap-1 hover:text-[#FFC500] transition leading-none">
                <Phone size={13.5} className="shrink-0" />
                <span>اتصال</span>
              </a>
              <button type="button" onClick={() => onOpenDetail(item)} className="hover:text-[#FFC500] transition cursor-pointer leading-none">
                التفاصيل
              </button>
              <button type="button" onClick={() => onShare(item)} className="hover:text-[#FFC500] transition cursor-pointer inline-flex items-center" aria-label="مشاركة">
                <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                  <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                </svg>
              </button>
            </div>

            <a
              href={buildWaUrl(item, categoryLabel)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-[#FFC500] hover:bg-[#e5b200] text-black font-black text-[11px] leading-none transition shrink-0"
            >
              <MessageCircle size={12.5} className="shrink-0" />
              <span>{item.ctaLabel || 'تواصل معنا'}</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ============================================================================
 * 3) الباقة الأساسية (الأزرق) — خلفية سوداء + ألوان زرقاء خالصة + ترتيب التغريدة
 * ========================================================================== */
export const PhoneBasicAdCard: React.FC<CommonCardProps> = ({
  item,
  categoryLabel,
  timeAgo,
  specs,
  onOpenDetail,
  onOpenImage,
  onOpenBusiness,
  onShare,
}) => {
  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 3)
      : specs.slice(0, 3).map((s) => `${s.k}: ${s.v}`);

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full rounded-none bg-black bg-gradient-to-b from-[#1D9BF0]/[0.08] via-black to-black border-y border-[#1D9BF0]/55 p-3 hover:from-[#1D9BF0]/[0.12] transition cursor-pointer select-none"
    >
      <div className="flex gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (item.businessId && onOpenBusiness) onOpenBusiness(item.businessId);
            else onOpenDetail(item);
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 border-[1.5px] border-[#1D9BF0]/80 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#38BDF8] text-lg cursor-pointer hover:opacity-85 transition"
        >
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
          ) : (
            <span>{item.sellerName?.[0] || 'م'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-nowrap min-w-0 gap-1">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[125px] sm:max-w-[175px]"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'blue' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[115px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <span className="h-[22px] inline-flex items-center gap-1 px-2.5 rounded-full bg-[#0077E6] text-white text-[10.5px] font-black leading-none shrink-0">
              <Megaphone size={11} className="shrink-0" />
              <span>إعلان ممول</span>
            </span>
          </div>

          <div className="mt-1 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h3 className="text-[14.5px] font-black text-white leading-[20px]">
                {item.name}
              </h3>
              <span className="text-[14px] font-black font-mono text-[#38BDF8] shrink-0">
                {item.price.toLocaleString()} ر.ي
              </span>
            </div>

            {(item.headline || item.description) && (
              <p className="text-[13px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words">
                {item.headline || item.description}
              </p>
            )}

            {highlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-0.5 text-[11.5px] leading-[18px] text-zinc-200">
                {highlights.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1D9BF0]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                      <Check size={9.5} className="stroke-[3]" />
                    </span>
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {item.images?.[0] && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenImage(item);
              }}
              className="mt-2.5 rounded-2xl overflow-hidden border border-[#1D9BF0]/30 max-h-80 bg-zinc-950 relative cursor-pointer"
            >
              <img src={item.images[0]} alt={item.name} className="w-full max-h-80 object-cover" loading="lazy" />
              {item.images.length > 1 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10.5px] font-bold border border-white/10">
                  1 / {item.images.length}
                </span>
              )}
            </div>
          )}

          <div
            className="mt-2.5 pt-1 flex items-center justify-between gap-2 text-[11.5px] text-[#8B98A5] leading-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1 leading-none">
                <Eye size={13.5} className="text-[#38BDF8] shrink-0" />
                <span>{formatCompact(item.viewsCount, 62000)}</span>
              </span>
              <a href={`tel:${item.sellerPhone}`} className="inline-flex items-center gap-1 hover:text-[#38BDF8] transition leading-none">
                <Phone size={13.5} className="shrink-0" />
                <span>اتصال</span>
              </a>
              <button type="button" onClick={() => onOpenDetail(item)} className="hover:text-[#38BDF8] transition cursor-pointer leading-none">
                التفاصيل
              </button>
              <button type="button" onClick={() => onShare(item)} className="hover:text-[#38BDF8] transition cursor-pointer inline-flex items-center" aria-label="مشاركة">
                <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                  <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                </svg>
              </button>
            </div>

            <a
              href={buildWaUrl(item, categoryLabel)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-[#0077E6] hover:bg-[#0066CC] text-white font-black text-[11px] leading-none transition shrink-0"
            >
              <span>{item.ctaLabel || 'احصل عليه الآن'}</span>
              <ArrowLeft size={12.5} className="shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
