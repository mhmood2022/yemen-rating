import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MapPin, Phone, Image as ImageIcon, Globe, Mail, Briefcase, Clock, Star, MoreHorizontal, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkUserActionAllowed } from '../../services/socialService';
import type { CommunitySection } from '../../services/sectionsService';
import {
  createTabSpecializedListing, fetchTabFormSchema, fetchTabListings, type TabFormField,
} from '../../services/communityTabsAdminService';
import { fetchUnifiedBusinessTaxonomy, type UnifiedTaxonomyCategory } from '../../constants/businessTaxonomy';
import { getLiveOpenStatus } from '../../utils/workingHours';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { RatingStars } from '../common/RatingStars';
import { XSpinner } from '../ui/LoadingSpinner';
import { XActionBar } from '../feed/XActionBar';
import { AdBanner } from '../common/AdBanner';
import { YEMEN_GOV_FILTER_OPTIONS } from '../common/XMarketUI';

interface CustomSectionSpecializedFeedProps {
  section: CommunitySection;
  searchQuery: string;
  cityFilter: string;
  sortBy: string;
  bizTypeFilter?: string;
  onShowcaseMetaChange?: (meta: {
    categories: [string, number][];
    totalCount: number;
    filteredCount: number;
  }) => void;
  externalOpenComposerSignal?: number;
}

export const CustomSectionSpecializedFeed: React.FC<CustomSectionSpecializedFeedProps> = ({
  section, searchQuery, cityFilter, sortBy, bizTypeFilter = 'all', onShowcaseMetaChange, externalOpenComposerSignal = 0,
}) => {
  const navigate = useNavigate();
  const cardStyle = section.specializedCardStyle || 'custom';
  const isShowcaseMode = cardStyle === 'showcase';

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [hiddenBizRefs, setHiddenBizRefs] = useState<{ name: string; slug: string }[]>([]);
  const [taxAllSubs, setTaxAllSubs] = useState<UnifiedTaxonomyCategory[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Map<string, { avg: number; count: number }>>(new Map());
  const [toastMsg, setToastMsg] = useState('');

  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);

  const [likedBizIds, setLikedBizIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('yr_dir_likes') || '[]'); } catch { return []; }
  });
  const [bookmarkedBizIds, setBookmarkedBizIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('yr_dir_bookmarks') || '[]'); } catch { return []; }
  });

  const [schema, setSchema] = useState<TabFormField[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('YER');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const activeFormFields = useMemo(() => schema.filter((f) => f.is_active && f.is_visible).sort((a, b) => a.sort_order - b.sort_order), [schema]);
  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const arr = listings.filter((item) => {
      const blob = `${item.title || ''} ${item.description || ''} ${item.city || ''} ${JSON.stringify(item.field_values || {})}`.toLowerCase();
      return (!q || blob.includes(q)) && (cityFilter === 'all' || String(item.city || '').toLowerCase().includes(cityFilter.toLowerCase()) || blob.includes(cityFilter.toLowerCase()));
    });
    arr.sort((a, b) => {
      if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) return a.is_pinned ? -1 : 1;
      if (sortBy === 'popular') return Number(b.likes_count || 0) - Number(a.likes_count || 0);
      return sortBy === 'oldest' ? new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime() : new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    return arr;
  }, [listings, searchQuery, cityFilter, sortBy]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg((prev) => (prev === msg ? '' : prev)), 2600);
  };

  const getBizCat = (b: any): string => {
    const catObj = taxAllSubs.find((x) => x.id === b.category_id);
    return String(catObj?.short_name || catObj?.name || b.sub_category || b.category || '').trim();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (isShowcaseMode) {
        const [bizRes, revRes, tax] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('reviews').select('entity_id, stars').neq('is_hidden', true),
          fetchUnifiedBusinessTaxonomy(),
        ]);
        const allBizRows = bizRes.data || [];
        setBusinesses(allBizRows.filter((b: any) => !b.is_hidden && String(b.status || '').toLowerCase() !== 'hidden'));
        setHiddenBizRefs(allBizRows.filter((b: any) => b.is_hidden || String(b.status || '').toLowerCase() === 'hidden').map((b: any) => ({ name: String(b.name || ''), slug: String(b.slug || '') })));
        setTaxAllSubs(tax.allSubs || []);
        const grouped = new Map<string, number[]>();
        (revRes.data || []).forEach((r: any) => {
          if (!r.entity_id) return;
          const s = Number(r.stars);
          if (s >= 1 && s <= 5) {
            const arr = grouped.get(r.entity_id) || [];
            arr.push(s);
            grouped.set(r.entity_id, arr);
          }
        });
        const map = new Map<string, { avg: number; count: number }>();
        grouped.forEach((arr, id) => {
          const count = arr.length;
          const avg = Number((arr.reduce((a, b) => a + b, 0) / count).toFixed(1));
          map.set(id, { avg, count });
        });
        setReviewsMap(map);
      } else {
        const [fieldsData, listingsData] = await Promise.all([
          fetchTabFormSchema(section.id),
          fetchTabListings(section.id),
        ]);
        setSchema(fieldsData);
        setListings(listingsData);
      }
    } catch (err) {
      console.error('CustomSectionSpecializedFeed loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [section.id, isShowcaseMode]);

  useEffect(() => {
    if (externalOpenComposerSignal > 0 && section.allowPosting !== false && section.allowSpecializedAds !== false) {
      setStatusMsg(null);
      setIsComposerOpen(true);
    }
  }, [externalOpenComposerSignal, section.allowPosting, section.allowSpecializedAds]);

  const availableDirCategories = useMemo<[string, number][]>(() => {
    const counts = new Map<string, number>();
    businesses.forEach((b) => {
      const c = getBizCat(b);
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [businesses, taxAllSubs]);

  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const arr = businesses.filter((b) => {
      const cat = getBizCat(b);
      if (bizTypeFilter !== 'all' && cat !== bizTypeFilter) return false;
      const locHay = `${b.city || ''} ${b.governorate || ''} ${b.address || ''} ${b.country || ''}`.toLowerCase();
      if (cityFilter && cityFilter !== 'all' && !locHay.includes(cityFilter.toLowerCase())) return false;
      if (!q) return true;
      const hay = `${b.name || ''} ${b.description || ''} ${b.bio || ''} ${b.username || ''} ${b.slug || ''} ${cat} ${locHay}`.toLowerCase();
      return hay.includes(q);
    });
    const getRating = (b: any) => (Number(b.rating || 0) > 0 ? Number(b.rating) : (reviewsMap.get(b.id)?.avg || 0));
    const getRevCount = (b: any) => (Number(b.review_count || b.reviews_count || 0) > 0 ? Number(b.review_count || b.reviews_count) : (reviewsMap.get(b.id)?.count || 0));
    arr.sort((a, b) => {
      const pa = Boolean(a.is_featured || a.is_promoted || a.is_pinned);
      const pb = Boolean(b.is_featured || b.is_promoted || b.is_pinned);
      if (pa !== pb) return pa ? -1 : 1;
      if (sortBy === 'reviews') return getRevCount(b) - getRevCount(a) || getRating(b) - getRating(a);
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return getRating(b) - getRating(a) || getRevCount(b) - getRevCount(a);
    });
    return arr;
  }, [businesses, taxAllSubs, reviewsMap, searchQuery, bizTypeFilter, cityFilter, sortBy]);

  useEffect(() => {
    if (!isShowcaseMode || !onShowcaseMetaChange) return;
    onShowcaseMetaChange({
      categories: availableDirCategories,
      totalCount: businesses.length,
      filteredCount: filteredBusinesses.length,
    });
  }, [isShowcaseMode, availableDirCategories, businesses.length, filteredBusinesses.length, onShowcaseMetaChange]);

  const toggleBizLike = (id: string) => {
    setLikedBizIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem('yr_dir_likes', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleBizBookmark = (id: string) => {
    setBookmarkedBizIds((prev) => {
      const added = !prev.includes(id);
      const next = added ? [...prev, id] : prev.filter((x) => x !== id);
      try { localStorage.setItem('yr_dir_bookmarks', JSON.stringify(next)); } catch {}
      showToast(added ? 'تم الحفظ في المفضلة' : 'تمت الإزالة من المفضلة');
      return next;
    });
  };

  const shareBiz = async (b: any) => {
    const url = `${window.location.origin}/business-page/${b.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: b.name || 'منشأة', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('تم نسخ رابط المنشأة');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        showToast('تم نسخ رابط المنشأة');
      } catch {
        showToast('تعذر نسخ الرابط');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (submitting) return; setStatusMsg(null);
    if (!title.trim()) { setStatusMsg({ type: 'error', text: 'يرجى إدخال عنوان الإعلان.' }); return; }
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) { setStatusMsg({ type: 'error', text: 'يجب تسجيل الدخول أولاً.' }); return; }
    const perm = await checkUserActionAllowed(user.id, 'post');
    if (!perm.allowed) { setStatusMsg({ type: 'error', text: perm.reason || 'تم تقييد النشر.' }); return; }
    setSubmitting(true);
    try {
      const uploadedImages: string[] = [];
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const fp = `tab_listings/${section.id}/${user.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('social-media').upload(fp, imageFile, { upsert: true, contentType: imageFile.type || 'image/jpeg' });
        if (!upErr) { const { data: pub } = supabase.storage.from('social-media').getPublicUrl(fp); if (pub?.publicUrl) uploadedImages.push(pub.publicUrl); }
      }
      const res = await createTabSpecializedListing({
        sectionId: section.id, userId: user.id, title: title.trim(), description: description.trim() || undefined,
        price: price ? Number(price) : null, currency, city: city.trim() || undefined, phone: phone.trim() || undefined,
        images: uploadedImages, fieldValues, formSnapshot: activeFormFields.map((f) => ({ key: f.field_key, label: f.label, type: f.field_type })),
      });
      if (!res.ok) { setStatusMsg({ type: 'error', text: res.error || 'تعذر النشر.' }); return; }
      setTitle(''); setDescription(''); setPrice(''); setCity(''); setPhone(''); setFieldValues({});
      setImageFile(null); setImagePreview(''); setIsComposerOpen(false); await loadData();
    } finally { setSubmitting(false); }
  };

  if (isShowcaseMode) {
    return (
      <div className="bg-black text-white pb-8" dir="rtl">
        {toastMsg && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[180] px-4 py-2 rounded-full bg-zinc-900 border border-[#2F3336] text-xs font-bold text-white shadow-lg">{toastMsg}</div>}

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2"><XSpinner size={28} /></div>
        ) : filteredBusinesses.length === 0 ? (
          (() => {
            const q = searchQuery.trim().toLowerCase();
            const matchedHidden = Boolean(q && hiddenBizRefs.some((h) => h.name.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q)));
            if (matchedHidden) {
              return (
                <div className="py-12 px-4 text-center space-y-1">
                  <p className="text-sm font-bold text-zinc-300">هذه المنشأة غير متاحة للعرض حالياً</p>
                  <p className="text-xs text-[#71767B]">تم إيقاف عرض هذه المنشأة مؤقتاً في الدليل ونتائج البحث، وقد تكون قيد المراجعة الإدارية.</p>
                </div>
              );
            }
            return <div className="py-16 px-4 text-center text-xs text-[#71767B]">لا توجد منشآت مطابقة لخيارات الفرز الحالية</div>;
          })()
        ) : (
          <div className="bg-black divide-y divide-[#2F3336]/40">
            {filteredBusinesses.map((b, idx) => {
              const showSlot1 = idx === 1 || (filteredBusinesses.length < 2 && idx === filteredBusinesses.length - 1);
              const showPromoNudge = idx === 2 || (filteredBusinesses.length === 2 && idx === 1);
              const showSlot2 = idx === 5 || (filteredBusinesses.length >= 2 && filteredBusinesses.length <= 5 && idx === filteredBusinesses.length - 1);
              const isPromoted = Boolean(b.is_featured || b.is_promoted || b.is_pinned);
              const coverUrl = b.cover_url || b.banner_url || '';
              const avatarUrl = b.logo_url || b.avatar_url || '';
              const bName = b.name || 'منشأة';
              const handle = b.username || b.slug || '';
              const vType = b.badge_type || b.verification_type || (b.is_verified ? 'gold' : 'none');
              const liveRev = reviewsMap.get(b.id);
              const avgRating = Number(b.rating || 0) > 0 ? Number(b.rating) : (liveRev?.avg || 0);
              const reviewCount = Number(b.review_count || b.reviews_count || 0) > 0 ? Number(b.review_count || b.reviews_count) : (liveRev?.count || 0);
              const bioText = b.description || b.bio || '';
              const locText = b.city || b.address || b.country || '';
              const catText = getBizCat(b);
              const branchesLen = Array.isArray(b.branches) ? b.branches.length : 0;
              const hasBranchesOrMap = Boolean(b.map_url || b.mapUrl || branchesLen > 0);
              let hoursSt = { hasHours: false, isOpen: false, text: 'ساعات العمل' };
              try {
                const rawS = b.working_schedule || b.workingSchedule;
                const parsedS = typeof rawS === 'string' ? JSON.parse(rawS) : rawS;
                hoursSt = getLiveOpenStatus(parsedS && (parsedS.days || parsedS.mode) ? parsedS : null, b.working_hours || b.workingHours);
              } catch {}
              const followersCnt = Number(b.followers_count || 0);
              const followingCnt = Number(b.following_count || 0);
              const isLiked = likedBizIds.includes(b.id);
              const isBookmarked = bookmarkedBizIds.includes(b.id);
              const tweetProxy = {
                id: `biz-${b.id}`, isBusinessPost: true, businessId: b.id,
                repliesCount: reviewCount, repostsCount: Number(b.shares_count || 0),
                likesCount: Number(b.likes_count || 0) + (isLiked ? 1 : 0),
                viewsCount: Number(b.views_count || followersCnt || 3), isLiked, isBookmarked,
              };

              return (
                <React.Fragment key={b.id}>
                  <article onClick={() => navigate(`/business-page/${b.id}`)} className="p-3 hover:bg-white/[0.03] transition cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-black border border-white flex items-center justify-center shrink-0 overflow-hidden">
                        <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M24 3L41.5 9.8V22.5C41.5 33.2 33.7 41.8 24 45C14.3 41.8 6.5 33.2 6.5 22.5V9.8L24 3Z" fill="#FFFFFF"/>
                          <path d="M24 7.5L37 12.6V22.5C37 30.8 31.2 37.6 24 40.3C16.8 37.6 11 30.8 11 22.5V12.6L24 7.5Z" stroke="#000000" strokeWidth="2.4"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center flex-nowrap min-w-0 gap-1">
                            <span className="font-bold text-[#E7E9EA] text-[12.5px] truncate">{section.label}</span>
                            <VerifiedBadge type="gold" size={14.5} className="shrink-0" />
                            <span className="text-[11.5px] text-[#71767B] truncate" dir="ltr">@directory</span>
                            {isPromoted && <span className="px-1.5 py-0.5 rounded-full bg-[#FFC500]/15 text-[#FFC500] text-[9.5px] font-black inline-flex items-center gap-0.5 shrink-0"><Zap size={9} /> أولوية إعلانية</span>}
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/business-page/${b.id}`); }} className="text-[#71767B] hover:text-[#FFC500] p-1 rounded-full shrink-0"><MoreHorizontal size={14} className="rotate-90" /></button>
                        </div>
                        {(catText || locText) && <p className="-mt-0.5 text-[13px] leading-[19px] text-[#D6D9DB]">{catText}{catText && locText ? ' · ' : ''}{locText}</p>}
                        <div className="mt-2 rounded-2xl border border-[#2F3336]/60 overflow-hidden bg-black">
                          <div className="w-full h-24 sm:h-32 bg-zinc-900 overflow-hidden">
                            {coverUrl ? <img src={coverUrl} alt={bName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />}
                          </div>
                          <div className="px-3 pb-3">
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                              <div className="-mt-6 sm:-mt-7 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-black bg-zinc-950 overflow-hidden flex items-center justify-center shrink-0">
                                {avatarUrl ? <img src={avatarUrl} alt={bName} className="w-full h-full object-cover" /> : <span className="text-base font-black text-white">{bName[0] || '؟'}</span>}
                              </div>
                              <div className="pt-1.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-0.5">
                                  <button type="button" onClick={() => { const s = String(b.website || '').trim(); if (!s) return showToast('لم يتم إضافة موقع إلكتروني بعد'); window.open(s.startsWith('http') ? s : `https://${s}`, '_blank', 'noopener,noreferrer'); }} className="w-6 h-6 rounded-full flex items-center justify-center text-[#8B98A5] hover:text-[#FFC500] hover:bg-white/10 transition cursor-pointer"><Globe size={13.5} /></button>
                                  <button type="button" onClick={() => { const p = String(b.phone || '').trim(); if (!p) return showToast('لم يتم إضافة رقم اتصال بعد'); window.location.href = `tel:${p}`; }} className="w-6 h-6 rounded-full flex items-center justify-center text-[#8B98A5] hover:text-[#FFC500] hover:bg-white/10 transition cursor-pointer"><Phone size={13.5} /></button>
                                  <button type="button" onClick={() => { const d = String(b.whatsapp || b.phone || '').replace(/[^\d]/g, ''); if (!d) return showToast('لم يتم إضافة واتساب بعد'); window.open(`https://wa.me/${d.length === 9 && d.startsWith('7') ? `967${d}` : d}`, '_blank', 'noopener,noreferrer'); }} className="w-6 h-6 rounded-full flex items-center justify-center text-[#8B98A5] hover:text-[#FFC500] hover:bg-white/10 transition cursor-pointer"><i className="fa-brands fa-whatsapp text-[13.5px] leading-none" aria-hidden="true" /></button>
                                  <button type="button" onClick={() => navigate(`/business-page/${b.id}`)} className="w-6 h-6 rounded-full flex items-center justify-center text-[#8B98A5] hover:text-[#FFC500] hover:bg-white/10 transition cursor-pointer"><Mail size={13.5} /></button>
                                </div>
                                <button type="button" onClick={() => navigate(`/business-page/${b.id}`)} className="px-3 py-1 rounded-full bg-white hover:bg-zinc-200 text-black text-[11px] font-bold leading-none cursor-pointer">عرض</button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-nowrap min-w-0">
                              <h3 className="text-white text-[14px] font-bold leading-snug truncate">{bName}</h3>
                              {vType && vType !== 'none' && <VerifiedBadge type={vType as any} size={13.5} className="shrink-0" />}
                            </div>
                            {handle && (
                              <p className="text-[11.5px] text-[#71767B] truncate leading-tight mt-0.5">
                                <span dir={/[\u0600-\u06FF]/.test(handle) ? 'rtl' : 'ltr'} className="inline-block">@{handle}</span>
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                              <RatingStars rating={avgRating} size={11} />
                              <span className="font-bold text-white tabular-nums">{avgRating > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                              <span className="text-[10.5px] text-[#71767B]">({reviewCount} تقييم)</span>
                            </div>
                            {bioText && <p className="mt-1.5 text-[#D6D9DB] text-[12px] leading-[1.45] whitespace-pre-wrap line-clamp-2">{bioText}</p>}
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 mt-2 text-[10.5px] text-[#71767B]">
                              {locText && <span className="inline-flex items-center gap-1"><MapPin size={11.5} className="text-[#FFC500]" />{locText}</span>}
                              {catText && <span className="inline-flex items-center gap-1"><Briefcase size={11.5} className="text-[#FFC500]" />{catText}</span>}
                              {hasBranchesOrMap && <span className="inline-flex items-center gap-1"><MapPin size={11.5} className="text-[#FFC500]" />الموقع والفروع{branchesLen > 0 ? ` (${branchesLen})` : ''}</span>}
                              {(hoursSt.hasHours || b.working_hours || b.workingHours) && <span className="inline-flex items-center gap-1"><Clock size={11.5} className="text-[#FFC500]" /><span className={hoursSt.hasHours ? (hoursSt.isOpen ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold') : ''}>{hoursSt.text}</span></span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-[#71767B]">
                              <span><strong className="text-white tabular-nums">{followingCnt}</strong> متابَعاً</span>
                              <span><strong className="text-white tabular-nums">{followersCnt}</strong> متابِعاً</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => navigate(`/business-page/${b.id}`)} className="w-full py-1.5 px-3 rounded-full border border-[#2F3336] hover:bg-white/10 text-white text-[11.5px] font-bold transition cursor-pointer">عرض الصفحة</button>
                              <button type="button" onClick={() => navigate(`/business-page/${b.id}`)} className="w-full py-1.5 px-3 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-[11.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"><Star size={11.5} className="text-black fill-black" /><span>قيّم الصفحة</span></button>
                            </div>
                          </div>
                        </div>
                        <XActionBar tweet={tweetProxy} isBusinessPost onReply={() => navigate(`/business-page/${b.id}`)} onRepost={() => shareBiz(b)} onLike={() => toggleBizLike(b.id)} onBookmark={() => toggleBizBookmark(b.id)} onRate={() => navigate(`/business-page/${b.id}`)} onShare={() => shareBiz(b)} />
                      </div>
                    </div>
                  </article>
                  {showSlot1 && <AdBanner section={section.id as any} slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />}
                  {showPromoNudge && section.allowSponsorAndBanners !== false && (
                    <div onClick={() => navigate('/premium')} className="px-3 py-2.5 bg-black hover:bg-white/[0.02] flex items-center justify-between gap-2 cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap size={15} className="text-[#FFC500] shrink-0" />
                        <p className="text-[11.5px] text-[#D6D9DB] truncate">تملك منشأة؟ <strong className="text-white">الممولة تتصدر أعلى {section.label}</strong> قبل المنافسين</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#FFC500] text-black text-[10.5px] font-black shrink-0">تصدر الآن</span>
                    </div>
                  )}
                  {showSlot2 && <AdBanner section={section.id as any} slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const showFeedBlock = !loading && filteredListings.length > 0;
  return (
    <>
      {showFeedBlock && (
        <div className="border-b border-[#2F3336]/40 bg-black divide-y divide-[#2F3336]">
          {filteredListings.map((item) => (
            <div key={item.id} onClick={() => setDetailItem(item)} className="p-3 hover:bg-white/[0.03] transition cursor-pointer">
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-white">{item.title}</h3>{item.city && <span className="text-[11px] text-[#71767B]">{item.city}</span>}</div>
              {item.description && <p className="text-xs text-[#D6D9DB] mt-1 line-clamp-2">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
      {detailItem && (
        <div className="fixed inset-0 z-[150] bg-black/85 flex items-center justify-center p-4" dir="rtl" onClick={() => setDetailItem(null)}>
          <div className="w-full max-w-lg bg-black border border-[#2F3336] rounded-2xl p-4 text-white space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="font-bold">{detailItem.title}</h3><button onClick={() => setDetailItem(null)}><X size={16} /></button></div>
            {detailItem.description && <p className="text-xs text-zinc-300">{detailItem.description}</p>}
          </div>
        </div>
      )}
      {isComposerOpen && (
        <div className="fixed inset-0 z-[150] bg-black/85 flex items-center justify-center p-4" dir="rtl" onClick={() => setIsComposerOpen(false)}>
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-black border border-[#2F3336] rounded-2xl p-4 text-white space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><span className="text-sm font-bold">نشر في {section.label}</span><button type="button" onClick={() => setIsComposerOpen(false)}><X size={16} /></button></div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان *" className="w-full bg-black border border-[#2F3336] rounded-xl px-3 py-2 text-xs text-white" />
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" className="w-full bg-black border border-[#2F3336] rounded-xl px-3 py-2 text-xs text-white" />
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="التفاصيل" className="w-full bg-black border border-[#2F3336] rounded-xl px-3 py-2 text-xs text-white" />
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer"><ImageIcon size={14} className="text-[#FFC500]" /><span>{imageFile ? imageFile.name : 'صورة اختيارية'}</span><input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" /></label>
            {imagePreview && <img src={imagePreview} className="w-full h-24 object-cover rounded-xl" />}
            {statusMsg && <p className="text-xs text-red-400">{statusMsg.text}</p>}
            <button type="submit" disabled={submitting} className="w-full py-2 rounded-full bg-[#FFC500] text-black text-xs font-black">{submitting ? 'جاري النشر...' : 'نشر'}</button>
          </form>
        </div>
      )}
    </>
  );
};
