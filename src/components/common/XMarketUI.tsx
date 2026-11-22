import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, MapPin, MessageCircle, Phone, Search, SlidersHorizontal, X } from 'lucide-react';
import { YRSelect, YRSelectOption } from './YRSelect';
import { VerifiedBadge, BadgeType } from './VerifiedBadge';

export const YEMEN_GOVS_21 = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب',
  'عمران', 'حجة', 'صعدة', 'البيضاء', 'لحج', 'أبين', 'شبوة',
  'المهرة', 'الضالع', 'المحويت', 'ريمة', 'الجوف', 'سقطرى',
];

export const YEMEN_GOV_FILTER_OPTIONS: YRSelectOption[] = [
  { value: 'all', label: 'جميع المحافظات' },
  ...YEMEN_GOVS_21.map((g) => ({ value: g, label: g })),
];

export const YEMEN_GOV_FORM_OPTIONS: YRSelectOption[] = YEMEN_GOVS_21.map((g) => ({ value: g, label: g }));

export function formatXTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'الآن';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'الآن';
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const toAr = (n: number | string) => String(n).replace(/[0-9]/g, (c) => '٠١٢٣٤٥٦٧٨٩'[+c]);
  if (sec < 60) return 'الآن';
  if (min < 60) return `${toAr(min)} د`;
  if (hr < 24) return `${toAr(hr)} س`;
  if (day < 7) return `${toAr(day)} ي`;
  return `${toAr(d.getDate())} ${d.toLocaleDateString('ar-YE', { month: 'short' })}`;
}

export function toWaLink(phone?: string, text?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const intl = digits.startsWith('967') ? digits : `967${digits.slice(-9)}`;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function buildDetailedWaText(item: XMarketItem): string {
  if (item.whatsappText && item.whatsappText.includes('\n')) return item.whatsappText;
  const lines: string[] = [];
  lines.push(`مرحباً، أرغب بالاستفسار عن: ${item.title}`);
  if (item.tagLabel) lines.push(`القسم: ${item.tagLabel}`);
  if (item.priceText) lines.push(`السعر: ${item.priceText}`);
  if (item.city) lines.push(`المحافظة: ${item.city}`);
  const specs = (item.specPairs || []).filter(
    (sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق', '-'].includes(sp.value.trim())
  );
  if (specs.length > 0) {
    lines.push('التفاصيل:');
    specs.forEach((sp) => lines.push(`• ${sp.label}: ${sp.value}`));
  }
  if (item.description && item.description.trim()) {
    lines.push(`الوصف: ${item.description.trim().slice(0, 220)}`);
  }
  return lines.join('\n');
}

export interface XMarketItem {
  id: string;
  detailPath: string;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  badgeType?: BadgeType;
  businessPath?: string;
  createdAt?: string;
  title: string;
  priceText?: string;
  description?: string;
  metaParts: string[];
  specPairs?: { label: string; value: string }[];
  mapUrl?: string;
  blueprintImage?: string;
  videoUrl?: string;
  tagLabel?: string;
  images: string[];
  city?: string;
  phone?: string;
  whatsappText?: string;
  shareText?: string;
}

export const XSearchFilterBar: React.FC<{
  searchQuery: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  activeFiltersCount: number;
  onOpenFilter: () => void;
  sectionIcon?: React.ReactNode;
}> = ({ searchQuery, onSearchChange, placeholder, activeFiltersCount, onOpenFilter, sectionIcon }) => (
  <div className="flex items-center justify-between gap-2.5">
    {sectionIcon && (
      <div className="shrink-0 flex items-center justify-center">
        {sectionIcon}
      </div>
    )}
    <div className="flex-1 max-w-[82%] mx-auto flex items-center bg-black border border-[#2F3336] focus-within:border-white rounded-full px-3 py-1.5 transition-colors">
      <Search size={14} className="text-[#71767B] ml-2 shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent text-[12.5px] text-white placeholder-[#71767B] outline-none caret-white"
      />
      {searchQuery && (
        <button type="button" onClick={() => onSearchChange('')} className="text-[#71767B] hover:text-white cursor-pointer">
          <X size={13} />
        </button>
      )}
    </div>
    <button
      type="button"
      onClick={onOpenFilter}
      aria-label="فلترة النتائج"
      className={`relative p-1.5 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
        activeFiltersCount > 0
          ? 'text-[#FFC500]'
          : 'text-[#E7E9EA] hover:text-white'
      }`}
    >
      <SlidersHorizontal size={18} />
      {activeFiltersCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FFC500] text-black text-[9px] font-black flex items-center justify-center leading-none">
          {activeFiltersCount}
        </span>
      )}
    </button>
  </div>
);

export const XFilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activeFiltersCount: number;
  onReset: () => void;
  resultsCount: number;
  fields: { label: string; value: string; options: YRSelectOption[]; onChange: (v: string) => void }[];
}> = ({ isOpen, onClose, title, activeFiltersCount, onReset, resultsCount, fields }) => {
  if (!isOpen) return null;
  return (
    <div data-no-tab-swipe="true" className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div dir="rtl" onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="w-10 h-1 rounded-full bg-[#2F3336] mx-auto mt-2.5 sm:hidden" />
        <div className="px-4 py-3 border-b border-[#2F3336] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onClose} aria-label="إغلاق" className="w-8 h-8 rounded-full hover:bg-white/10 text-white flex items-center justify-center cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-[15px] font-black text-white">{title}</h3>
          </div>
          <button type="button" onClick={onReset} disabled={activeFiltersCount === 0} className={`text-xs font-bold ${activeFiltersCount > 0 ? 'text-white hover:text-white/80 cursor-pointer' : 'text-[#71767B]/50 cursor-default'}`}>
            إعادة ضبط
          </button>
        </div>
        <div className="p-3.5 space-y-2.5">
          {fields.map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold text-[#71767B] block mb-1.5">{f.label}</label>
              <YRSelect compact value={f.value} onChange={f.onChange} options={f.options} />
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-[#2F3336] bg-black rounded-b-2xl">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-black text-sm transition-all cursor-pointer">
            عرض النتائج ({resultsCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export const XLinkedAccountCard: React.FC<{
  name: string;
  username: string;
  avatarUrl?: string;
  badgeType?: BadgeType;
  label: string;
}> = ({ name, username, avatarUrl, badgeType = 'none', label }) => (
  <div className="p-2.5 rounded-xl bg-zinc-950 border border-[#2F3336] flex items-center gap-2.5">
    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold">
      {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : <span>{name?.[0] || 'م'}</span>}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1">
        <span className="font-bold text-white text-xs truncate">{name}</span>
        <VerifiedBadge type={badgeType} size={13} />
      </div>
      <div className="text-[11px] text-[#71767B] truncate" dir="ltr">@{username}</div>
    </div>
    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold shrink-0">{label}</span>
  </div>
);

const ShareSvg = () => (
  <svg viewBox="0 0 24 24" width="14.5" height="14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
    <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /><line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
  </svg>
);

export const XMarketTweetCard: React.FC<{
  item: XMarketItem;
  onOpenDetail: () => void;
  onOpenImage: (idx: number) => void;
  onShare: () => void;
}> = ({ item, onOpenDetail, onOpenImage, onShare }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const waHref = toWaLink(item.phone, buildDetailedWaText(item));
  return (
    <article
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button,a')) onOpenDetail(); }}
      className="p-3.5 bg-black hover:bg-white/[0.02] transition cursor-pointer select-none"
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); item.businessPath ? navigate(item.businessPath) : onOpenDetail(); }}
          className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-base cursor-pointer"
        >
          {item.authorAvatar ? <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" /> : <span>{item.authorName?.[0] || 'م'}</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-nowrap min-w-0 w-full gap-1">
            <span
              onClick={(e) => { if (item.businessPath) { e.stopPropagation(); navigate(item.businessPath); } }}
              className="font-bold text-[#E7E9EA] text-[13px] hover:underline cursor-pointer truncate shrink max-w-[140px] sm:max-w-[190px]"
            >
              {item.authorName}
            </span>
            <VerifiedBadge type={item.badgeType || 'none'} size={14.5} className="shrink-0" />
            <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[90px] sm:max-w-[125px]" dir="ltr">@{item.authorUsername}</span>
            <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
            <span className="text-[#71767B] text-[11px] whitespace-nowrap shrink-0">{formatXTimeAgo(item.createdAt)}</span>
          </div>
          <div className="mt-0.5 space-y-1">
            <div className="text-[14px] leading-[20px] font-bold text-white flex items-center gap-1.5 flex-wrap">
              <span>{item.title}</span>
              {item.priceText && <><span className="text-[#71767B] font-normal">·</span><span className="text-[#FFC500] font-mono text-[13px]">{item.priceText}</span></>}
            </div>
            {(() => {
              const cleanSpecs = (item.specPairs || []).filter((sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(sp.value.trim()));
              const isLongSpecs = cleanSpecs.length > 6;
              const isLongDesc = Boolean(item.description && item.description.length > 130);
              const visibleSpecs = expanded || !isLongSpecs ? cleanSpecs : cleanSpecs.slice(0, 6);
              const descText = item.description && isLongDesc && !expanded ? `${item.description.slice(0, 130)}...` : item.description;
              return (
                <>
                  {descText && <p className="text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words select-text">{descText}</p>}
                  {cleanSpecs.length > 0 ? (
                    <div className="text-[12.5px] leading-[20px] flex flex-wrap items-center gap-x-2 gap-y-1">
                      {visibleSpecs.map((sp, idx) => (
                        <React.Fragment key={`${sp.label}-${idx}`}>
                          {idx > 0 && <span className="text-[#536471]">·</span>}
                          <span className="inline-flex items-center gap-1">
                            <span className="text-[#8B98A5]">{sp.label}:</span>
                            <span className="text-white font-semibold">{sp.value}</span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : item.metaParts.length > 0 ? <div className="text-[12px] text-[#71767B] flex flex-wrap items-center gap-1.5">{item.metaParts.join(' · ')}</div> : null}
                  {(isLongSpecs || isLongDesc) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
                      className="text-[#FFC500] text-[12px] font-bold hover:underline cursor-pointer inline-block pt-0.5"
                    >
                      {expanded ? 'عرض أقل' : 'عرض المزيد'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
          {item.images[0] && (
            <div onClick={(e) => { e.stopPropagation(); onOpenImage(0); }} className="mt-2.5 rounded-2xl overflow-hidden border border-[#2F3336]/50 max-h-80 bg-zinc-950 relative cursor-pointer">
              <img src={item.images[0]} alt={item.title} className="w-full max-h-80 object-cover" loading="lazy" />
              {item.images.length > 1 && <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10.5px] font-bold border border-white/10">1 / {item.images.length}</span>}
            </div>
          )}
          <div className="flex items-center justify-between text-[#71767B] w-full mt-2.5 px-0 select-none leading-none" dir="rtl" onClick={(e) => e.stopPropagation()}>
            {item.onAction ? (
              <button type="button" onClick={item.onAction} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors py-1 cursor-pointer">
                {item.actionIcon || <ArrowRight size={14} className="rtl:rotate-180" />}
                <span className="text-[11.5px] font-medium">{item.actionLabel}</span>
              </button>
            ) : (
              <Link to={item.detailPath} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors py-1">
                {item.actionIcon || <ArrowRight size={14} className="rtl:rotate-180" />}
                <span className="text-[11.5px] font-medium">{item.actionLabel}</span>
              </Link>
            )}
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#00BA7C] transition-colors py-1">
                <MessageCircle size={14.5} /><span className="text-[11.5px] font-medium">واتساب</span>
              </a>
            ) : <span className="flex items-center gap-1.5 opacity-40 py-1 text-[11.5px]"><MessageCircle size={14.5} /> واتساب</span>}
            {item.phone ? (
              <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-[#FFC500] transition-colors py-1">
                <Phone size={14} /><span className="text-[11.5px] font-medium">اتصال</span>
              </a>
            ) : <span className="flex items-center gap-1.5 opacity-40 py-1 text-[11.5px]"><Phone size={14} /> اتصال</span>}
            <button type="button" onClick={onShare} className="hover:text-[#1D9BF0] transition-colors cursor-pointer py-1"><ShareSvg /></button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const XMarketDetailView: React.FC<{
  item: XMarketItem;
  activeImageIndex: number;
  onChangeImageIndex: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
  onOpenLightbox: () => void;
  onShare: () => void;
}> = ({ item, activeImageIndex, onChangeImageIndex, onBack, onOpenLightbox, onShare }) => {
  const navigate = useNavigate();
  const touchX = useRef<number | null>(null);
  const cleanImages = (Array.isArray(item.images) ? item.images : [])
    .map((u) => (u || '').trim())
    .filter((u) => Boolean(u && !u.includes('yr-logo')));
  const cleanSpecs = (item.specPairs || []).filter(
    (sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق', '-'].includes(sp.value.trim())
  );
  const hasPhone = Boolean(item.phone && item.phone.trim());
  const waHref = hasPhone ? toWaLink(item.phone, buildDetailedWaText(item)) : '';

  return (
    <div data-no-tab-swipe="true" className="bg-black min-h-screen pb-24">
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-[#2F3336]/60 px-3 py-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          className="w-8 h-8 rounded-full hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
        >
          <ArrowRight size={17} />
        </button>
        <h2 className="text-[13.5px] font-bold text-white">تفاصيل الإعلان</h2>
      </div>

      <article className="px-4 pt-2">
        <div className="bg-black">
          <div className="pb-2 flex items-center justify-between gap-2 bg-black">
            <div
              onClick={() => { if (item.businessPath) navigate(item.businessPath); }}
              className={`flex items-center gap-2.5 min-w-0 flex-1 ${item.businessPath ? 'cursor-pointer' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-black border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-xs">
                {item.authorAvatar ? (
                  <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" />
                ) : (
                  <span>{item.authorName?.[0] || 'م'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-[#E7E9EA] text-[14px] hover:underline truncate max-w-[180px] sm:max-w-[260px]">
                    {item.authorName}
                  </span>
                  <VerifiedBadge type={item.badgeType || 'none'} size={14} className="shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-[#71767B] min-w-0">
                  <span className="truncate max-w-[120px]" dir="ltr">@{item.authorUsername}</span>
                  <span>·</span>
                  <span className="shrink-0">{formatXTimeAgo(item.createdAt)}</span>
                </div>
              </div>
            </div>
            {item.tagLabel && (
              <span className="shrink-0 text-[11px] font-medium text-[#71767B]">{item.tagLabel}</span>
            )}
          </div>

          {cleanImages.length > 0 ? (
            <div className="bg-black">
              <div
                className="relative bg-black cursor-pointer select-none overflow-hidden rounded-none border border-[#2F3336]/80"
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchX.current === null || cleanImages.length <= 1) return;
                  const diff = touchX.current - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 35) {
                    onChangeImageIndex((p) => diff > 0 ? (p + 1) % cleanImages.length : (p - 1 + cleanImages.length) % cleanImages.length);
                  }
                  touchX.current = null;
                }}
                onClick={onOpenLightbox}
              >
                <img
                  src={cleanImages[activeImageIndex] || cleanImages[0]}
                  alt={item.title}
                  className="w-full h-[290px] sm:h-[340px] object-cover rounded-none block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {item.city && (
                      <div className="text-[10.5px] text-[#A1A1AA]">{item.city}</div>
                    )}
                    <h1 className="text-[15.5px] font-bold text-white leading-snug truncate">{item.title}</h1>
                  </div>
                  {item.priceText && (
                    <span className="shrink-0 text-[13px] font-bold text-[#FFC500] font-mono whitespace-nowrap">
                      {item.priceText}
                    </span>
                  )}
                </div>
              </div>
              {cleanImages.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 pt-2">
                  {cleanImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChangeImageIndex(idx)}
                      className={`h-1 rounded-none transition-all cursor-pointer ${activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-[#2F3336]'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 bg-black flex items-center justify-between gap-3">
              <div className="min-w-0">
                {item.city && <div className="text-[10.5px] text-[#71767B]">{item.city}</div>}
                <h1 className="text-[15.5px] font-bold text-white leading-snug truncate">{item.title}</h1>
              </div>
              {item.priceText && (
                <span className="shrink-0 text-[13px] font-bold text-[#FFC500] font-mono whitespace-nowrap">
                  {item.priceText}
                </span>
              )}
            </div>
          )}

          {cleanSpecs.length > 0 ? (
            <div className="pt-2.5 bg-black grid grid-cols-2 gap-x-3 gap-y-1">
              {cleanSpecs.map((sp, idx) => (
                <div key={`${sp.label}-${idx}`} className="flex items-center gap-1 py-0.5 text-[11px] min-w-0">
                  <span className="text-[#71767B] shrink-0">{sp.label}:</span>
                  <span className="text-[#E7E9EA] font-medium truncate">{sp.value}</span>
                </div>
              ))}
            </div>
          ) : item.metaParts.length > 0 ? (
            <div className="pt-2 text-[12px] text-[#71767B]">{item.metaParts.join(' · ')}</div>
          ) : null}

          {item.description && (
            <p dir="auto" className="pt-2 bg-black text-[13px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words select-text">
              {item.description}
            </p>
          )}

          {(item.mapUrl || item.videoUrl) && (
            <div className="flex flex-wrap gap-2 pt-2.5">
              {item.mapUrl && (
                <a
                  href={item.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-[#2F3336]/80 bg-transparent text-[11.5px] text-[#E7E9EA] hover:border-white/50 transition"
                >
                  <MapPin size={12.5} className="text-[#FFC500]" />
                  <span>الموقع على الخريطة</span>
                </a>
              )}
              {item.videoUrl && (
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-[#2F3336]/80 bg-transparent text-[11.5px] text-[#E7E9EA] hover:border-white/50 transition"
                >
                  <span>عرض الفيديو المرفق</span>
                </a>
              )}
            </div>
          )}

          {item.blueprintImage && (
            <div className="mt-2.5 border border-[#2F3336]/80 bg-black p-2 space-y-1">
              <span className="text-[11px] text-[#71767B] block">المخطط الهندسي</span>
              <img src={item.blueprintImage} alt="المخطط الهندسي" className="w-full max-h-64 object-contain bg-black" />
            </div>
          )}

          <div className="pt-3 bg-black flex items-center gap-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
              >
                <MessageCircle size={13} />
                <span>واتساب</span>
              </a>
            )}
            {hasPhone && (
              <a
                href={`tel:${item.phone}`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
              >
                <Phone size={13} />
                <span>اتصال</span>
              </a>
            )}
            {item.onAction ? (
              <button
                type="button"
                onClick={item.onAction}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium cursor-pointer"
              >
                {item.actionIcon || <ArrowRight size={13} className="rtl:rotate-180" />}
                <span>{item.actionLabel}</span>
              </button>
            ) : (
              <Link
                to={item.detailPath}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
              >
                {item.actionIcon || <ArrowRight size={13} className="rtl:rotate-180" />}
                <span>{item.actionLabel}</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3 py-2.5 border-b border-[#2F3336]/60 text-[12px] text-[#71767B] flex items-center justify-between">
          <span>{formatXTimeAgo(item.createdAt)} · {item.city || 'اليمن'}</span>
          <button type="button" onClick={onShare} className="hover:text-[#1D9BF0] transition cursor-pointer p-1" title="مشاركة">
            <ShareSvg />
          </button>
        </div>
      </article>
    </div>
  );
};

export const XImageLightbox: React.FC<{
  isOpen: boolean;
  item: XMarketItem | null;
  activeIndex: number;
  onChangeIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}> = ({ isOpen, item, activeIndex, onChangeIndex, onClose }) => {
  const touchX = useRef<number | null>(null);
  if (!isOpen || !item || item.images.length === 0) return null;
  const waHref = toWaLink(item.phone, buildDetailedWaText(item));
  return (
    <div
      dir="rtl"
      data-no-tab-swipe="true"
      className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between select-none overflow-hidden"
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null || item.images.length <= 1) return;
        const diff = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 35) onChangeIndex((p) => diff > 0 ? (p + 1) % item.images.length : (p - 1 + item.images.length) % item.images.length);
        touchX.current = null;
      }}
    >
      <div className="w-full pt-4 pb-2 px-4 flex items-center justify-between z-50" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="رجوع" className="w-11 h-11 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center text-white border border-white/5 shadow-md cursor-pointer">
          <ArrowRight size={20} />
        </button>
        {item.images.length > 1 && <span className="px-3 py-1.5 rounded-full bg-[#192227] text-white text-xs font-mono border border-white/5">{activeIndex + 1} / {item.images.length}</span>}
      </div>
      <div className="flex-1 flex items-center justify-center px-2 py-2" onClick={(e) => e.stopPropagation()}>
        <img src={item.images[activeIndex] || item.images[0]} alt={item.title} className="w-full max-h-[78vh] object-contain" />
      </div>
      <div className="w-full px-4 pt-6 pb-5 flex flex-col gap-3 z-50" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)' }} onClick={(e) => e.stopPropagation()}>
        {item.images.length > 1 && (
          <div className="flex justify-center items-center gap-1.5">
            {item.images.map((_, idx) => <button key={idx} type="button" onClick={() => onChangeIndex(idx)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`} />)}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-sm">
              {item.authorAvatar ? <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" /> : <span>{item.authorName?.[0] || 'م'}</span>}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-[14px] truncate">{item.authorName}</span>
                <VerifiedBadge type={item.badgeType || 'none'} size={13.5} className="shrink-0" />
              </div>
              <div className="text-[#71767B] text-[12px] truncate">{item.title}{item.priceText ? ` · ${item.priceText}` : ''}</div>
            </div>
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 shrink-0">
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5"><MessageCircle size={14} /><span>واتساب</span></a>
              <a href={`tel:${item.phone}`} className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5"><Phone size={14} /><span>اتصال</span></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export interface XToastState {
  type: 'success' | 'error';
  text: string;
}

export function toArabicMarketError(err: any, fallback = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً'): string {
  const raw = typeof err === 'string' ? err : (err?.message || err?.error_description || '');
  const msg = String(raw || '').trim();
  if (!msg) return fallback;
  if (/[\u0600-\u06FF]/.test(msg)) return msg;
  const low = msg.toLowerCase();
  if (low.includes('failed to fetch') || low.includes('network') || low.includes('load failed'))
    return 'تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت';
  if (low.includes('jwt') || low.includes('not authenticated') || low.includes('auth') || low.includes('session'))
    return 'انتهت جلسة الدخول، يرجى تسجيل الدخول مجدداً';
  if (low.includes('row-level security') || low.includes('permission denied') || low.includes('42501') || low.includes('admin_requests'))
    return 'لا تملك صلاحية تنفيذ هذا الإجراء حالياً، تأكد من تسجيل الدخول أو تواصل مع الإدارة';
  if (low.includes('not-null constraint') || low.includes('null value in column'))
    return 'يرجى تعبئة كافة الحقول الإلزامية المطلوبة';
  if (low.includes('schema cache') || low.includes('could not find the') || low.includes('does not exist'))
    return 'حدث عدم تطابق في بيانات الحقول، يرجى تحديث الصفحة والمحاولة';
  if (low.includes('duplicate key') || low.includes('already exists') || low.includes('23505'))
    return 'هذا السجل مسجل مسبقاً';
  if (low.includes('check constraint'))
    return 'بعض القيم المدخلة غير صالحة، يرجى مراجعة البيانات';
  if (low.includes('invalid input syntax'))
    return 'صيغة أحد الحقول غير صحيحة، يرجى التأكد من الأرقام والبيانات';
  return fallback;
}

export const XToast: React.FC<{ toast: XToastState | null }> = ({ toast }) => {
  if (!toast) return null;
  const cleanText = toast.text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '').trim();
  return (
    <div
      className="fixed top-[52px] left-1/2 -translate-x-1/2 z-[999999] bg-[#242D34] text-white px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.85)] border border-white/20 flex items-center gap-2 select-none max-w-[92vw]"
      style={{ direction: 'rtl' }}
    >
      {toast.type === 'success' ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
      )}
      <span className="text-[12.5px] font-bold text-white font-['Tahoma',sans-serif] truncate max-w-[76vw] sm:max-w-[340px]">
        {cleanText}
      </span>
    </div>
  );
};
