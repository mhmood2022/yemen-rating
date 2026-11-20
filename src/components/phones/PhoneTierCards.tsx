import React, { useState, useEffect } from 'react';
import {
  Crown,
  Star,
  Check,
  MessageCircle,
  Phone,
  Globe,
  Send,
  Megaphone,
  ShieldCheck,
  Zap,
  Headphones,
  Cpu,
  HardDrive,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { VerifiedBadge, BadgeType } from '../common/VerifiedBadge';
import { XActionBar } from '../feed/XActionBar';

export type PhonePostTier = 'free' | 'basic' | 'pro' | 'vip';
export type PhoneContactType = 'whatsapp' | 'call' | 'website' | 'message';

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
  contactType?: PhoneContactType;
  contactUrl?: string;
  viewsCount?: number;
  expiresAt?: string;
  likesCount?: number;
  repostsCount?: number;
  repliesCount?: number;
  likedBy?: string[];
  repostedBy?: string[];
}

interface CommonCardProps {
  item: PhoneCardData;
  categoryLabel: string;
  timeAgo: string;
  specs: PhoneCardSpec[];
  currentUserId?: string;
  onOpenDetail: (item: PhoneCardData) => void;
  onOpenImage: (item: PhoneCardData) => void;
  onOpenBusiness?: (businessId: string) => void;
  onLike?: (item: PhoneCardData) => void;
  onRepost?: (item: PhoneCardData) => void;
  onBookmark?: (item: PhoneCardData) => void;
  onShare: (item: PhoneCardData) => void;
  onSendMessage?: (item: PhoneCardData) => void;
}

const buildWaUrl = (item: PhoneCardData, categoryLabel: string) =>
  `https://wa.me/${item.sellerPhone}?text=${encodeURIComponent(
    `مرحباً، أرغب بالاستفسار عن ${categoryLabel} ${item.name} المعروض بسعر ${item.price.toLocaleString()} ر.ي`
  )}`;

const getHandle = (item: PhoneCardData) =>
  item.sellerUsername || (item.brand ? item.brand.toLowerCase().replace(/\s+/g, '') : 'user');

const AdAutoImageSlider: React.FC<{
  images?: string[];
  alt: string;
  borderClass: string;
  dotActiveClass: string;
  onOpenImage: () => void;
}> = ({ images, alt, borderClass, dotActiveClass, onOpenImage }) => {
  const validImages = React.useMemo(
    () => (Array.isArray(images) ? images.map((s) => (s || '').trim()).filter(Boolean) : []),
    [images]
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [validImages.length]);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % validImages.length);
    }, 3500);
    return () => clearInterval(t);
  }, [validImages.length]);

  if (validImages.length === 0) return null;

  const safeIdx = idx % validImages.length;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenImage();
      }}
      className={`mt-2.5 rounded-2xl overflow-hidden border ${borderClass} max-h-80 bg-zinc-950 relative cursor-pointer`}
    >
      <img
        src={validImages[safeIdx]}
        alt={alt}
        className="w-full max-h-80 object-cover transition-opacity duration-500"
        loading="lazy"
      />
      {validImages.length > 1 && (
        <>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-bold border border-white/10">
            {safeIdx + 1} / {validImages.length}
          </span>
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${i === safeIdx ? `w-3.5 ${dotActiveClass}` : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const AdContactButton: React.FC<{
  item: PhoneCardData;
  categoryLabel: string;
  buttonClass: string;
  onSendMessage?: (item: PhoneCardData) => void;
}> = ({ item, categoryLabel, buttonClass, onSendMessage }) => {
  const mode: PhoneContactType = item.contactType || 'whatsapp';

  if (mode === 'call') {
    return (
      <a
        href={`tel:${item.sellerPhone}`}
        onClick={(e) => e.stopPropagation()}
        className={`h-6 inline-flex items-center gap-1 px-2.5 rounded-full font-bold text-[10px] leading-none transition shrink-0 ${buttonClass}`}
      >
        <Phone size={10.5} className="shrink-0" />
        <span>{item.ctaLabel || 'اتصال'}</span>
      </a>
    );
  }

  if (mode === 'website') {
    const rawUrl = (item.contactUrl || '').trim();
    const safeUrl = rawUrl
      ? /^https?:\/\//i.test(rawUrl)
        ? rawUrl
        : `https://${rawUrl}`
      : buildWaUrl(item, categoryLabel);
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`h-6 inline-flex items-center gap-1 px-2.5 rounded-full font-bold text-[10px] leading-none transition shrink-0 ${buttonClass}`}
      >
        <Globe size={10.5} className="shrink-0" />
        <span>{item.ctaLabel || 'الموقع'}</span>
      </a>
    );
  }

  if (mode === 'message') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSendMessage?.(item);
        }}
        className={`h-6 inline-flex items-center gap-1 px-2.5 rounded-full font-bold text-[10px] leading-none transition shrink-0 cursor-pointer ${buttonClass}`}
      >
        <Send size={10.5} className="shrink-0" />
        <span>{item.ctaLabel || 'إرسال رسالة'}</span>
      </button>
    );
  }

  return (
    <a
      href={buildWaUrl(item, categoryLabel)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`h-6 inline-flex items-center gap-1 px-2.5 rounded-full font-bold text-[10px] leading-none transition shrink-0 ${buttonClass}`}
    >
      <MessageCircle size={10.5} className="shrink-0" />
      <span>{item.ctaLabel || 'واتساب'}</span>
    </a>
  );
};

const renderTweetLikeFooter = (
  props: CommonCardProps,
  buttonClass: string
) => {
  const {
    item,
    categoryLabel,
    currentUserId,
    onOpenDetail,
    onLike,
    onRepost,
    onBookmark,
    onShare,
    onSendMessage,
  } = props;

  return (
    <div className="mt-1 flex items-center gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
      <div className="flex-1 min-w-0">
        <XActionBar
          tweet={{
            id: item.id,
            likes: item.likesCount ?? 0,
            likedBy: item.likedBy ?? [],
            reposts: item.repostsCount ?? 0,
            repostedBy: item.repostedBy ?? [],
            replies: item.repliesCount ?? 0,
            views: item.viewsCount ?? 1,
          }}
          currentUserId={currentUserId}
          onReply={() => onOpenDetail(item)}
          onRepost={() => onRepost?.(item)}
          onLike={() => onLike?.(item)}
          onBookmark={() => onBookmark?.(item)}
          onShare={() => onShare(item)}
        />
      </div>
      <div className="pt-2 shrink-0">
        <AdContactButton
          item={item}
          categoryLabel={categoryLabel}
          buttonClass={buttonClass}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};

/* ============================================================================
 * 1) باقة VIP — خلفية سوداء + هيدر وفوتر التغريدة + أيقونات وشارة بنفسجية
 * ========================================================================== */
export const PhoneVipBanner: React.FC<
  CommonCardProps & {
    totalVipCount?: number;
    activeVipIndex?: number;
    onSelectVipIndex?: (idx: number) => void;
  }
> = (props) => {
  const {
    item,
    categoryLabel,
    timeAgo,
    specs,
    onOpenDetail,
    onOpenImage,
    onOpenBusiness,
    totalVipCount = 1,
    activeVipIndex = 0,
    onSelectVipIndex,
  } = props;

  const [expanded, setExpanded] = useState(false);

  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 4)
      : specs.slice(0, 4).map((s) => `${s.k}: ${s.v}`);

  const fullText = [item.headline ? `${categoryLabel} · ${item.name}` : '', item.description || '']
    .filter(Boolean)
    .join(' — ');
  const hasMoreInfo = fullText.length > 85 || highlights.length > 2;
  const visibleHighlights = expanded ? highlights : highlights.slice(0, 2);
  const vipIcons = [ShieldCheck, Zap, Headphones, Check];

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full overflow-hidden rounded-none bg-black border-y border-[#A855F7]/70 p-3 hover:bg-white/[0.02] transition cursor-pointer select-none"
    >
      <div className="flex gap-3 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (item.businessId && onOpenBusiness) onOpenBusiness(item.businessId);
            else onOpenDetail(item);
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 border-[1.5px] border-[#A855F7] flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#C084FC] text-lg cursor-pointer hover:opacity-85 transition"
        >
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
          ) : (
            <span>{item.sellerName?.[0] || 'م'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center flex-nowrap min-w-0 flex-1 gap-1 overflow-hidden">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate min-w-0"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'gold' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate max-w-[70px] sm:max-w-[110px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {totalVipCount > 1 && onSelectVipIndex && (
                <div className="flex items-center gap-0.5 text-[10px] text-[#C084FC] font-bold">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVipIndex((activeVipIndex - 1 + totalVipCount) % totalVipCount);
                    }}
                    className="p-0.5 hover:text-white cursor-pointer"
                    aria-label="السابق"
                  >
                    <ChevronRight size={11} />
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
                    <ChevronLeft size={11} />
                  </button>
                </div>
              )}
              <span className="h-5 inline-flex items-center gap-1 px-2 rounded-full bg-[#9333EA] text-white text-[9.5px] font-black leading-none shrink-0">
                <Crown size={10} className="stroke-[2.5] shrink-0" />
                <span>VIP مثبت</span>
              </span>
            </div>
          </div>

          <div className="mt-1 space-y-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
              <h3 className="text-[12.5px] font-bold text-[#E9D5FF] leading-[18px] break-words min-w-0">
                {item.headline || item.name}
              </h3>
              {item.price > 0 && (
                <span className="text-[10.5px] font-semibold font-mono text-[#C084FC] shrink-0">
                  {item.price.toLocaleString()} ر.ي
                </span>
              )}
            </div>

            {fullText && (
              <p className={`text-[12.5px] leading-[19px] text-[#D6D9DB] whitespace-pre-wrap break-words ${!expanded ? 'line-clamp-2' : ''}`}>
                {fullText}
              </p>
            )}

            {visibleHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-[11px] leading-[17px] text-[#E7E9EA]">
                {visibleHighlights.map((h, i) => {
                  const IconComp = vipIcons[i % vipIcons.length];
                  return (
                    <span key={i} className="inline-flex items-center gap-1 min-w-0 max-w-full">
                      <IconComp size={11.5} className="text-[#C084FC] shrink-0" />
                      <span className="truncate">{h}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {hasMoreInfo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="text-[11px] font-bold text-[#C084FC] hover:underline cursor-pointer pt-0.5"
              >
                {expanded ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>

          <AdAutoImageSlider
            images={item.images}
            alt={item.name}
            borderClass="border-[#A855F7]/35"
            dotActiveClass="bg-[#C084FC]"
            onOpenImage={() => onOpenImage(item)}
          />

          {renderTweetLikeFooter(props, 'bg-[#9333EA] hover:bg-[#7E22CE] text-white')}
        </div>
      </div>
    </article>
  );
};

/* ============================================================================
 * 2) الباقة الاحترافية (الفضي) — خلفية سوداء + هيدر وفوتر التغريدة + ألوان فضية
 * ========================================================================== */
export const PhoneProAdCard: React.FC<CommonCardProps> = (props) => {
  const { item, timeAgo, specs, onOpenDetail, onOpenImage, onOpenBusiness } = props;
  const [expanded, setExpanded] = useState(false);

  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 4)
      : specs.slice(0, 4).map((s) => `${s.k}: ${s.v}`);

  const bodyText = item.headline || item.description || '';
  const hasMoreInfo = bodyText.length > 85 || highlights.length > 2;
  const visibleHighlights = expanded ? highlights : highlights.slice(0, 2);
  const proIcons = [HardDrive, Cpu, BatteryCharging, Check];

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full overflow-hidden rounded-none bg-black border-y border-[#CBD5E1]/55 p-3 hover:bg-white/[0.02] transition cursor-pointer select-none"
    >
      <div className="flex gap-3 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (item.businessId && onOpenBusiness) onOpenBusiness(item.businessId);
            else onOpenDetail(item);
          }}
          className="w-12 h-12 rounded-full bg-zinc-900 border-[1.5px] border-[#CBD5E1]/80 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[#E2E8F0] text-lg cursor-pointer hover:opacity-85 transition"
        >
          {item.sellerAvatar ? (
            <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
          ) : (
            <span>{item.sellerName?.[0] || 'م'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center flex-nowrap min-w-0 flex-1 gap-1 overflow-hidden">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate min-w-0"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'silver' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate max-w-[70px] sm:max-w-[110px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <span className="h-5 inline-flex items-center gap-1 px-2 rounded-full bg-[#CBD5E1] text-black text-[9.5px] font-black leading-none shrink-0">
              <Star size={10} className="fill-black stroke-black shrink-0" />
              <span>إعلان مميز</span>
            </span>
          </div>

          <div className="mt-1 space-y-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
              <h3 className="text-[12.5px] font-bold text-white leading-[18px] break-words min-w-0">
                {item.name}
              </h3>
              {item.price > 0 && (
                <span className="text-[10.5px] font-semibold font-mono text-[#CBD5E1] shrink-0">
                  {item.price.toLocaleString()} ر.ي
                </span>
              )}
            </div>

            {bodyText && (
              <p className={`text-[12.5px] leading-[19px] text-[#D6D9DB] whitespace-pre-wrap break-words ${!expanded ? 'line-clamp-2' : ''}`}>
                {bodyText}
              </p>
            )}

            {visibleHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-[11px] leading-[17px] text-zinc-300">
                {visibleHighlights.map((h, i) => {
                  const IconComp = proIcons[i % proIcons.length];
                  return (
                    <span key={i} className="inline-flex items-center gap-1 min-w-0 max-w-full">
                      <IconComp size={11.5} className="text-[#CBD5E1] shrink-0" />
                      <span className="truncate">{h}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {hasMoreInfo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="text-[11px] font-bold text-[#CBD5E1] hover:underline cursor-pointer pt-0.5"
              >
                {expanded ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>

          <AdAutoImageSlider
            images={item.images}
            alt={item.name}
            borderClass="border-[#CBD5E1]/30"
            dotActiveClass="bg-[#CBD5E1]"
            onOpenImage={() => onOpenImage(item)}
          />

          {renderTweetLikeFooter(props, 'bg-[#CBD5E1] hover:bg-white text-black')}
        </div>
      </div>
    </article>
  );
};

/* ============================================================================
 * 3) الباقة الأساسية (الأزرق) — خلفية سوداء + هيدر وفوتر التغريدة + ألوان زرقاء
 * ========================================================================== */
export const PhoneBasicAdCard: React.FC<CommonCardProps> = (props) => {
  const { item, timeAgo, specs, onOpenDetail, onOpenImage, onOpenBusiness } = props;
  const [expanded, setExpanded] = useState(false);

  const highlights =
    item.highlights && item.highlights.length > 0
      ? item.highlights.slice(0, 4)
      : specs.slice(0, 4).map((s) => `${s.k}: ${s.v}`);

  const bodyText = item.headline || item.description || '';
  const hasMoreInfo = bodyText.length > 85 || highlights.length > 2;
  const visibleHighlights = expanded ? highlights : highlights.slice(0, 2);

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          onOpenDetail(item);
        }
      }}
      className="w-full overflow-hidden rounded-none bg-black border-y border-[#1D9BF0]/55 p-3 hover:bg-white/[0.02] transition cursor-pointer select-none"
    >
      <div className="flex gap-3 min-w-0">
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

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center flex-nowrap min-w-0 flex-1 gap-1 overflow-hidden">
              <span
                onClick={(e) => {
                  if (item.businessId && onOpenBusiness) {
                    e.stopPropagation();
                    onOpenBusiness(item.businessId);
                  }
                }}
                className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate min-w-0"
              >
                {item.sellerName}
              </span>
              <VerifiedBadge type={item.badgeType || (item.isVerified ? 'blue' : 'none')} size={14.5} className="shrink-0" />
              <span className="text-[11.5px] text-[#71767B] truncate max-w-[70px] sm:max-w-[110px]" dir="ltr">
                @{getHandle(item)}
              </span>
              <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
              <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{timeAgo}</span>
            </div>

            <span className="h-5 inline-flex items-center gap-1 px-2 rounded-full bg-[#0077E6] text-white text-[9.5px] font-black leading-none shrink-0">
              <Megaphone size={10} className="shrink-0" />
              <span>إعلان ممول</span>
            </span>
          </div>

          <div className="mt-1 space-y-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap min-w-0">
              <h3 className="text-[12.5px] font-bold text-white leading-[18px] break-words min-w-0">
                {item.name}
              </h3>
              {item.price > 0 && (
                <span className="text-[10.5px] font-semibold font-mono text-[#38BDF8] shrink-0">
                  {item.price.toLocaleString()} ر.ي
                </span>
              )}
            </div>

            {bodyText && (
              <p className={`text-[12.5px] leading-[19px] text-[#D6D9DB] whitespace-pre-wrap break-words ${!expanded ? 'line-clamp-2' : ''}`}>
                {bodyText}
              </p>
            )}

            {visibleHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-[11px] leading-[17px] text-zinc-300">
                {visibleHighlights.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1 min-w-0 max-w-full">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1D9BF0]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                      <Check size={9} className="stroke-[3]" />
                    </span>
                    <span className="truncate">{h}</span>
                  </span>
                ))}
              </div>
            )}

            {hasMoreInfo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="text-[11px] font-bold text-[#38BDF8] hover:underline cursor-pointer pt-0.5"
              >
                {expanded ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>

          <AdAutoImageSlider
            images={item.images}
            alt={item.name}
            borderClass="border-[#1D9BF0]/30"
            dotActiveClass="bg-[#38BDF8]"
            onOpenImage={() => onOpenImage(item)}
          />

          {renderTweetLikeFooter(props, 'bg-[#0077E6] hover:bg-[#0066CC] text-white')}
        </div>
      </div>
    </article>
  );
};
