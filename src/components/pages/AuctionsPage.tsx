import React, { useState, useEffect, useRef, useMemo } from 'react';
import { XSpinner } from '../ui/LoadingSpinner';
import { Gavel, ArrowRight, RefreshCw, AlertCircle, Plus, X, ImagePlus, Trash2, MapPin, Video, FileImage } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { MarketSponsorSlot } from '../ads/MarketSponsorSlot';
import { YRSelect } from '../common/YRSelect';
import { XAuctionBidModal } from '../auctions/XAuctionBidModal';
import { BadgeType } from '../common/VerifiedBadge';
import { mapBusinessToPage, getMyBusinessPage, BusinessPageRecord } from '../../services/businessPageService';
import { XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard, XMarketDetailView, XImageLightbox, XLinkedAccountCard, YEMEN_GOV_FILTER_OPTIONS, XToast, XToastState, toArabicMarketError } from '../common/XMarketUI';
import { NOT_AVAILABLE, RE_GOVERNORATES, getCityOptions, getDistrictOptions } from '../../constants/realEstateOptions';
import {
  AUCTION_KIND_OPTIONS, AUCTION_CATEGORY_OPTIONS, AUCTION_CONDITION_OPTIONS,
  AUCTION_QUANTITY_OPTIONS, AUCTION_DURATION_OPTIONS, AUCTION_MIN_INCREMENT_OPTIONS,
  AUCTION_AUTO_EXTEND_OPTIONS, AUCTION_YES_NO_OPTIONS, AUCTION_PARTICIPATION_OPTIONS,
  AUCTION_BID_RULES_OPTIONS, AUCTION_WITHDRAW_POLICY_OPTIONS,
  AUCTION_DELIVERY_METHOD_OPTIONS, AUCTION_DELIVERY_FEE_OPTIONS,
  getAuctionBrandOptions, getAuctionModelOptions, parseAuctionMeta
} from '../../constants/marketOptions';

const sellerRate = 5;

const AUCTION_CURRENCIES = [
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
];

export const AuctionsPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({ onBack, embedded = false }) => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'ENDED' | 'DIRECT'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const fmtAmt = (v: string) => {
    const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (!embedded) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [embedded]);
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [biddingAuction, setBiddingAuction] = useState<any | null>(null);

  // نافذة العرض / المزاد (قوائم منسدلة + ديناميكية)
  const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState(false);
  const [auctionKind, setAuctionKind] = useState('مزاد إلكتروني');
  const [saleType, setSaleType] = useState<'auction' | 'fixed_price'>('auction');
  const [formTitle, setFormTitle] = useState('');
  const [formSellerName, setFormSellerName] = useState('');
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [publisherAvatar, setPublisherAvatar] = useState('');
  const [publisherUsername, setPublisherUsername] = useState('');
  const [publisherUserId, setPublisherUserId] = useState('');
  const [hasAccountPhone, setHasAccountPhone] = useState(false);
  const [formPhoneTouched, setFormPhoneTouched] = useState(false);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const normalizeYemenPhone = (v: string) =>
    v.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '').slice(0, 9);
  const isValidYemenPhone = (v: string) => /^(73|71|77|78)\d{7}$/.test(v);
  const [formCategory, setFormCategory] = useState('vehicles');
  const [formCondition, setFormCondition] = useState('مستعمل');
  const [formBrand, setFormBrand] = useState('تويوتا (Toyota)');
  const [formModel, setFormModel] = useState('لاندكروزر');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formCity, setFormCity] = useState('صنعاء');
  const [formSubCity, setFormSubCity] = useState('أمانة العاصمة');
  const [formDistrict, setFormDistrict] = useState('السبعين');

  const [formCurrency, setFormCurrency] = useState('YER');
  const [formPrice, setFormPrice] = useState('');
  const [formBuyNowPrice, setFormBuyNowPrice] = useState('');
  const [formDuration, setFormDuration] = useState('3 أيام');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formMinIncrement, setFormMinIncrement] = useState('1000');
  const [formAutoExtend, setFormAutoExtend] = useState('مفعل');
  const [formShowBidsCount, setFormShowBidsCount] = useState('نعم');
  const [formShowTopBid, setFormShowTopBid] = useState('نعم');

  const [formParticipation, setFormParticipation] = useState('متاحة للجميع');
  const [formBidRules, setFormBidRules] = useState('الالتزام التام بسعر المزايدة عند الترسية');
  const [formWithdrawPolicy, setFormWithdrawPolicy] = useState('غير مسموح بالتراجع بعد تأكيد المزايدة');
  const [formDeliveryMethod, setFormDeliveryMethod] = useState('استلام مباشر');
  const [formDeliveryFee, setFormDeliveryFee] = useState('حسب الاتفاق');

  const [formDescription, setFormDescription] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [docImage, setDocImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<XToastState | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success', ms = 3500) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), ms);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const brandOptions = useMemo(() => getAuctionBrandOptions(formCategory), [formCategory]);
  const modelOptions = useMemo(() => getAuctionModelOptions(formCategory, formBrand), [formCategory, formBrand]);
  const subCityOptions = useMemo(() => getCityOptions(formCity), [formCity]);
  const districtOptions = useMemo(() => getDistrictOptions(formCity), [formCity]);

  const isDirectKind = auctionKind === 'مزاد مباشر' || auctionKind === 'مزاد بسعر محدد';

  const handleKindChange = (val: string) => {
    setAuctionKind(val);
    setSaleType(val === 'مزاد مباشر' || val === 'مزاد بسعر محدد' ? 'fixed_price' : 'auction');
  };

  const handleCategoryChange = (cat: string) => {
    setFormCategory(cat);
    const bs = getAuctionBrandOptions(cat);
    const nb = bs[0]?.value || NOT_AVAILABLE;
    setFormBrand(nb);
    const ms = getAuctionModelOptions(cat, nb);
    setFormModel(ms[0]?.value || NOT_AVAILABLE);
  };

  const handleBrandChange = (brand: string) => {
    setFormBrand(brand);
    const ms = getAuctionModelOptions(formCategory, brand);
    setFormModel(ms[0]?.value || NOT_AVAILABLE);
  };

  const handleGovChange = (gov: string) => {
    setFormCity(gov);
    setFormSubCity(getCityOptions(gov)[0]?.value || gov);
    setFormDistrict(getDistrictOptions(gov)[0]?.value || NOT_AVAILABLE);
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: bizData }, { data: profData }] = await Promise.all([
        supabase.from('auctions').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').limit(200),
        supabase.from('profiles').select('*').limit(200),
      ]);
      if (error) throw error;
      if (bizData) setBusinessesList(bizData.map(mapBusinessToPage));
      if (profData) {
        const pm: Record<string, any> = {};
        profData.forEach((pr: any) => {
          if (pr.id) pm[pr.id] = pr;
          if (pr.full_name) pm[String(pr.full_name).trim()] = pr;
          if (pr.username) pm[String(pr.username).trim()] = pr;
        });
        setProfilesMap(pm);
      }
      setAuctions(data || []);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    const loadId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) return;
        const meta: any = session.user.user_metadata || {};
        const [{ data: prof }, biz] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
          getMyBusinessPage(uid),
        ]);
        const emailH = session.user.email ? session.user.email.split('@')[0] : '';
        const mp = {
          ...(prof || { id: uid }),
          full_name: prof?.full_name || meta.full_name || meta.name || '',
          username: prof?.username || meta.username || meta.user_name || emailH || '',
          avatar_url: prof?.avatar_url || meta.avatar_url || '',
          phone: prof?.phone || meta.phone || '',
        };
        setMyProfile(mp);
        if (biz) setMyBusinessPage(biz);
        const rn = (biz?.name || mp.full_name || mp.username || emailH || '').trim();
        const ra = (biz?.avatarUrl || mp.avatar_url || '').trim();
        const ru = (biz?.username || mp.username || emailH || '').trim();
        const rawPh = String(biz?.phone || mp.phone || '').replace(/^(\+?967)/, '');
        const cp = normalizeYemenPhone(rawPh);
        setPublisherUserId(uid);
        if (rn) setFormSellerName(rn);
        if (ra) setPublisherAvatar(ra);
        if (ru) setPublisherUsername(ru);
        if (isValidYemenPhone(cp)) { setFormPhone(cp); setHasAccountPhone(true); }
        else { setHasAccountPhone(false); }
        if (biz?.city) handleGovChange(biz.city);
      } catch {}
    };
    loadId();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadId(); });
    return () => { subscription.unsubscribe(); };
  }, []);

  const compressImage = (file: File): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 6 - uploadedImages.length;
    if (remaining <= 0) { showToast('الحد الأقصى المسموح به هو 6 صور فقط', 'error', 3000); return; }
    try {
      setCompressing(true);
      const list = await Promise.all(Array.from(files).slice(0, remaining).map(compressImage));
      setUploadedImages((prev) => [...prev, ...list]);
    } catch (err) {
      console.error('Error compressing images:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setDocImage(compressed);
  };

  const removeImage = (idx: number) => setUploadedImages((prev) => prev.filter((_, i) => i !== idx));

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFormPhone = normalizeYemenPhone(formPhone);
    setFormPhoneTouched(true);
    if (!isValidYemenPhone(cleanFormPhone)) {
      setPublishMsg({ type: 'error', text: 'الرقم خاطئ' });
      showToast('الرقم خاطئ', 'error', 3500);
      return;
    }
    if (!formTitle.trim() || !consent) {
      const m = 'يرجى إكمال عنوان المعروض والموافقة على الشروط';
      setPublishMsg({ type: 'error', text: m });
      showToast(m, 'error', 3500);
      return;
    }

    try {
      setSubmitting(true);
      const priceNum = parseFloat(formPrice.replace(/,/g, '')) || 0;
      const startIso = formStartTime ? new Date(formStartTime).toISOString() : new Date().toISOString();
      const durObj = AUCTION_DURATION_OPTIONS.find((d) => d.value === formDuration);
      const computedEnd = formEndDate
        ? new Date(formEndDate).toISOString()
        : (!isDirectKind && durObj ? new Date(new Date(startIso).getTime() + durObj.days * 86400000).toISOString() : null);

      const catLabel = AUCTION_CATEGORY_OPTIONS.find((x) => x.id === formCategory)?.label || formCategory;
      const rawPairs: [string, string][] = [
        ['نوع المزاد', auctionKind],
        ['التصنيف', catLabel],
        ['الحالة', formCondition],
        ['الشركة', formBrand],
        ['الموديل', formModel],
        ['الكمية', formQuantity],
        ['المحافظة', formCity],
        ['المدينة', formSubCity],
        ['المديرية', formDistrict],
        ...(!isDirectKind ? [
          ['الحد الأدنى للزيادة', `${Number(formMinIncrement).toLocaleString()} ${formCurrency}`] as [string, string],
          ['الشراء الفوري', formBuyNowPrice ? `${Number(formBuyNowPrice.replace(/,/g, '')).toLocaleString()} ${formCurrency}` : NOT_AVAILABLE] as [string, string],
          ['مدة المزاد', formDuration] as [string, string],
          ['التمديد التلقائي', formAutoExtend] as [string, string],
          ['إظهار عدد المزايدات', formShowBidsCount] as [string, string],
          ['إظهار أعلى مزايدة', formShowTopBid] as [string, string],
        ] : []),
        ['المشاركة', formParticipation],
        ['شروط المزايدة', formBidRules],
        ['التراجع عن المزايدة', formWithdrawPolicy],
        ['الاستلام', formDeliveryMethod],
        ...(formDeliveryMethod === 'توصيل' ? [['رسوم التوصيل', formDeliveryFee] as [string, string]] : []),
      ];

      const specs = rawPairs
        .filter(([, v]) => v && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(v.trim()))
        .map(([label, value]) => ({ label, value }));

      const metaJson = JSON.stringify({
        notes: formDescription.trim(),
        specs,
        videoUrl: videoUrl.trim() || undefined,
        docImage: docImage || undefined,
        sellerAvatar: publisherAvatar || undefined,
        sellerUsername: publisherUsername || undefined,
        ownerUserId: publisherUserId || undefined,
      });

      const payload: any = {
        title: formTitle.trim(),
        seller_name: formSellerName.trim() || 'صاحب المعروض المعتمد',
        sale_type: saleType,
        category: formCategory,
        city: formCity,
        currency: formCurrency,
        description: metaJson,
        seller_phone: cleanFormPhone,
        images: uploadedImages,
        status: 'active',
        starting_price: priceNum,
        current_bid: priceNum,
        final_price: priceNum,
        start_time: startIso,
        end_date: computedEnd,
        min_increment: parseFloat(formMinIncrement) || 1000,
        deposit_required: false,
        deposit_amount: 0,
        seller_commission_rate_snapshot: sellerRate,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('auctions').insert([payload]);
      if (error) throw error;

      setUploadedImages([]);
      setDocImage('');
      setVideoUrl('');
      setFormTitle('');
      setFormPrice('');
      setFormBuyNowPrice('');
      setFormDescription('');
      setPublishMsg({ type: 'success', text: 'تم نشر المعروض بنجاح وإدراجه في المنصة' });
      showToast('تم نشر المعروض بنجاح وإدراجه في المنصة', 'success', 4000);
      setTimeout(() => { setIsCreateAuctionOpen(false); setPublishMsg(null); }, 1000);
      fetchAuctions();
    } catch (err: any) {
      const arMsg = toArabicMarketError(err, 'حدث خطأ أثناء الاتصال بالنظام، يرجى إعادة المحاولة');
      setPublishMsg({ type: 'error', text: arMsg });
      showToast(arMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const isAuctionEnded = (item: any) => {
    const status = (item.status || '').toLowerCase();
    if (['completed', 'ended', 'sold', 'closed'].includes(status)) return true;
    if (item.end_date) return new Date(item.end_date).getTime() <= Date.now();
    return false;
  };

  const activeAuctions = auctions.filter(a => a.sale_type !== 'fixed_price' && a.sale_type !== 'direct' && !isAuctionEnded(a));
  const directSales = auctions.filter(a => a.sale_type === 'fixed_price' || a.sale_type === 'direct');
  const endedListings = auctions.filter(a => a.sale_type !== 'fixed_price' && a.sale_type !== 'direct' && isAuctionEnded(a));

  let currentList = auctions;
  if (statusTab === 'ACTIVE') currentList = activeAuctions;
  else if (statusTab === 'DIRECT') currentList = directSales;
  else if (statusTab === 'ENDED') currentList = endedListings;

  const displayedListings = currentList.filter(a => {
    const matchCat = selectedCat === 'all' || a.category === selectedCat;
    const matchCity = cityFilter === 'all' || (a.city && a.city.includes(cityFilter));
    const matchCurr = currencyFilter === 'all' || (a.currency || 'YER') === currencyFilter;
    const meta = parseAuctionMeta(a.description);
    const condVal = meta.pairs.find((x) => x.label === 'الحالة')?.value || a.condition || '';
    const matchCond = conditionFilter === 'all' || condVal === conditionFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || (a.title || '').toLowerCase().includes(q)
      || (a.city || '').toLowerCase().includes(q)
      || (a.category || '').toLowerCase().includes(q)
      || (meta.notes || '').toLowerCase().includes(q);
    return matchCat && matchCity && matchCurr && matchCond && matchSearch;
  });

  const activeFiltersCount =
    (selectedCat !== 'all' ? 1 : 0) + (statusTab !== 'ALL' ? 1 : 0) +
    (currencyFilter !== 'all' ? 1 : 0) + (conditionFilter !== 'all' ? 1 : 0) +
    (cityFilter !== 'all' ? 1 : 0);

  const toAucX = (auc: any): XMarketItem => {
    const biz = businessesList.find((b) =>
      (auc.business_id && b.id === auc.business_id) ||
      (auc.seller_name && b.name.trim() === String(auc.seller_name).trim())
    ) || null;
    let rm: any = {};
    try {
      if (typeof auc.description === 'string' && auc.description.trim().startsWith('{')) {
        rm = JSON.parse(auc.description);
      }
    } catch {}
    const pm = profilesMap[rm.ownerUserId || auc.owner_user_id || '']
      || profilesMap[rm.sellerUsername || '']
      || profilesMap[String(auc.seller_name || '').trim()]
      || null;
    const dir = auc.sale_type === 'fixed_price' || auc.sale_type === 'direct';
    const bid = Number(auc.current_bid || auc.starting_price || auc.final_price || 0);
    const imgs = Array.isArray(auc.images) && auc.images.length > 0
      ? auc.images
      : (Array.isArray(auc.image_urls) ? auc.image_urls : []);
    const parsed = parseAuctionMeta(auc.description);
    const catLabel =
      AUCTION_CATEGORY_OPTIONS.find((x) => x.id === auc.category)?.label || auc.category;
    const fallbackPairs = [
      { label: 'النوع', value: dir ? 'بيع مباشر' : 'مزاد علني' },
      ...(catLabel ? [{ label: 'التصنيف', value: catLabel }] : []),
      ...(auc.city ? [{ label: 'المحافظة', value: auc.city }] : []),
    ];
    return {
      id: auc.id, detailPath: `/auctions/${auc.id}`,
      actionLabel: dir ? 'التفاصيل' : 'المزايدة',
      actionIcon: <Gavel size={14} />, onAction: () => setBiddingAuction(auc),
      authorName: biz?.name || auc.seller_name || pm?.full_name || (dir ? 'بيع مباشر' : 'مزاد علني'),
      authorUsername: biz?.username || rm.sellerUsername || pm?.username || auc.city || 'auction',
      authorAvatar: biz?.avatarUrl || rm.sellerAvatar || pm?.avatar_url || '',
      badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none',
      businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
      createdAt: auc.created_at, title: auc.title, priceText: `${bid.toLocaleString()} ${auc.currency || 'YER'}`,
      description: parsed.notes,
      metaParts: [dir ? 'بيع مباشر' : 'مزاد علني', catLabel, auc.city].filter(Boolean),
      specPairs: (parsed.pairs.length > 0 ? parsed.pairs : fallbackPairs).filter((x) => x.value && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(x.value.trim())),
      videoUrl: parsed.videoUrl,
      blueprintImage: parsed.docImage,
      tagLabel: dir ? 'بيع مباشر' : 'مزاد علني', images: imgs, city: auc.city, phone: auc.seller_phone || biz?.phone || ''
    };
  };

  const onShareX = (it: XMarketItem) => { navigator.clipboard?.writeText(it.title); showToast('تم نسخ التفاصيل', 'success', 2500); };

  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < displayedListings.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 360);
        }
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, displayedListings.length, isLoadingMore]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white bg-black min-h-screen"}>
      <XToast toast={toastMessage} />

      {!embedded && !selectedItem && (
        <div className="space-y-2.5 bg-black border border-[#2F3336] p-4 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-[#111111] border border-[#2F3336] text-[#F5C400]"><ArrowRight size={16} className="rtl:rotate-180" /></button>}
              <div>
                <h1 className="text-lg font-black text-white">المزادات والبيع المباشر</h1>
                <p className="text-[11px] text-[#71767B]">منصة المزايدات الموثقة والصفقات المباشرة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsCreateAuctionOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC500] text-black font-black rounded-xl text-xs"><Plus size={15} /><span>أضف معروض</span></button>
              <button onClick={fetchAuctions} disabled={loading} className="p-2 bg-black border border-[#2F3336] text-slate-300 rounded-xl"><RefreshCw size={15} className={loading ? 'animate-spin text-[#FFC500]' : ''} /></button>
            </div>
          </div>
          <MarketSponsorSlot section="auctions" />
        </div>
      )}

      {selectedItem ? <XMarketDetailView item={selectedItem} activeImageIndex={activeImageIndex} onChangeImageIndex={setActiveImageIndex} onBack={() => setSelectedItem(null)} onOpenLightbox={() => setIsLightboxOpen(true)} onShare={() => onShareX(selectedItem)} /> : (<>
        {embedded && <MarketSponsorSlot section="auctions" />}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#000000] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
          <XSearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="ابحث في المزادات والبيع المباشر..." activeFiltersCount={activeFiltersCount} onOpenFilter={() => setIsFilterModalOpen(true)} />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
            <XSpinner size={28} />
            <span className="text-xs font-bold text-white">جاري تحميل المزادات...</span>
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
            <AlertCircle className="w-9 h-9 text-[#FFC500] mx-auto opacity-75" />
            <h3 className="text-sm font-bold text-white">لا توجد معروضات مطابقة حالياً</h3>
            <p className="text-xs">اضغط على زر + لإضافة مزاد أو معروض جديد.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2F3336]/60">
            {displayedListings.slice(0, visibleCount).map((auc, idx) => {
              const item = toAucX(auc);
              return (
                <React.Fragment key={auc.id}>
                  <XMarketTweetCard
                    item={item}
                    onOpenDetail={() => { setSelectedItem(item); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                    onOpenImage={(idx) => { setSelectedItem(item); setActiveImageIndex(idx); setIsLightboxOpen(true); }}
                    onShare={() => onShareX(item)}
                  />
                  {idx === (displayedListings.length >= 8 ? 2 : displayedListings.length >= 4 ? 1 : 0) && (
                    <div className="bg-black">
                      <AdBanner section="auctions" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                    </div>
                  )}
                  {idx === (displayedListings.length >= 8 ? 7 : displayedListings.length >= 2 ? displayedListings.length - 1 : -1) && (
                    <div className="bg-black">
                      <AdBanner section="auctions" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>
        )}

          {displayedListings.length > 0 && (
            <div ref={bottomSentinelRef} className="py-3 flex items-center justify-center">
              {isLoadingMore || visibleCount < displayedListings.length ? (
                <XSpinner ariaLabel="جاري تحميل المزيد" />
              ) : (
                <span className="text-[11px] text-[#71767B]">تم عرض كل النتائج</span>
              )}
            </div>
          )}
      </>)}

      {embedded && !selectedItem && !isCreateAuctionOpen && (
        <button onClick={() => setIsCreateAuctionOpen(true)} className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition" title="أضف مزاد"><Plus size={24} className="stroke-[2.2]" /></button>
      )}

      {isCreateAuctionOpen && (
        <div className="fixed inset-0 z-[150] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4" onClick={() => setIsCreateAuctionOpen(false)}>
          <div className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden font-['Tahoma',sans-serif] text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2F3336]/60 shrink-0"><button type="button" onClick={() => setIsCreateAuctionOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white"><X size={18} /></button><span className="text-[13px] font-bold text-[#71767B]">إضافة معروض أو مزاد</span><span className="w-7" /></div>

            <form onSubmit={handleCreateListing} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(myBusinessPage || myProfile || formSellerName) && (
                <XLinkedAccountCard
                  name={myBusinessPage?.name || myProfile?.full_name || formSellerName || 'حسابك'}
                  username={myBusinessPage?.username || publisherUsername || myProfile?.username || 'account'}
                  avatarUrl={myBusinessPage?.avatarUrl || publisherAvatar || myProfile?.avatar_url}
                  badgeType={myBusinessPage ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? 'gold' : 'none')) : 'none'}
                  label={myBusinessPage ? 'صفحة المنشأة' : 'حسابك'}
                />
              )}
              {publishMsg && <div className={`p-2.5 rounded-xl font-bold text-xs ${publishMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/15 text-rose-300 border border-rose-500/40'}`}>{publishMsg.text}</div>}

              {/* 1. نوع المزاد والتصنيف */}
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع المزاد *</label><YRSelect compact value={auctionKind} onChange={handleKindChange} options={AUCTION_KIND_OPTIONS} /></div>
                <div><label className="text-[10.5px] text-[#71767B] block mb-1">تصنيف المعروض *</label><YRSelect compact value={formCategory} onChange={handleCategoryChange} options={AUCTION_CATEGORY_OPTIONS.map((x) => ({ value: x.id, label: x.label }))} /></div>
              </div>

              <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="اسم المنتج أو المعروض..." className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white outline-none" />

              {/* 3. معلومات المعروض (قوائم منسدلة ديناميكية) */}
              <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                <div className="text-[11px] font-bold text-[#FFC500]">معلومات المعروض</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">الحالة</label><YRSelect compact value={formCondition} onChange={setFormCondition} options={AUCTION_CONDITION_OPTIONS} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">الكمية</label><YRSelect compact value={formQuantity} onChange={setFormQuantity} options={AUCTION_QUANTITY_OPTIONS} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">الشركة المصنعة</label><YRSelect compact value={formBrand} onChange={handleBrandChange} options={brandOptions} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">الموديل</label><YRSelect compact value={formModel} onChange={setFormModel} options={modelOptions} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">المحافظة</label><YRSelect compact value={formCity} onChange={handleGovChange} options={RE_GOVERNORATES.map((g) => ({ value: g, label: g }))} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">المدينة</label><YRSelect compact value={formSubCity} onChange={setFormSubCity} options={subCityOptions} /></div>
                  <div className="col-span-2"><label className="text-[10.5px] text-[#71767B] block mb-1">المديرية</label><YRSelect compact value={formDistrict} onChange={setFormDistrict} options={districtOptions} /></div>
                </div>
              </div>

              {/* 4. معلومات المزايدة (تتكيف ديناميكياً مع نوع المزاد) */}
              <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                <div className="text-[11px] font-bold text-[#FFC500]">{isDirectKind ? 'تفاصيل السعر' : 'معلومات المزايدة'}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10.5px] text-[#FFC500] font-bold block mb-1">{isDirectKind ? 'السعر المحدد *' : 'السعر الافتتاحي *'}</label>
                    <input required type="text" inputMode="numeric" value={formPrice} onChange={(e) => setFormPrice(fmtAmt(e.target.value))} placeholder="0" className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2 text-white font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-[#71767B] block mb-1">العملة</label>
                    <YRSelect compact value={formCurrency} onChange={setFormCurrency} options={AUCTION_CURRENCIES} />
                  </div>
                  {!isDirectKind && (
                    <>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">الحد الأدنى للزيادة</label><YRSelect compact value={formMinIncrement} onChange={setFormMinIncrement} options={AUCTION_MIN_INCREMENT_OPTIONS} /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">الشراء الفوري (اختياري)</label><input type="text" inputMode="numeric" value={formBuyNowPrice} onChange={(e) => setFormBuyNowPrice(fmtAmt(e.target.value))} placeholder="اختياري" className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2 text-white font-mono outline-none" /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">مدة المزاد</label><YRSelect compact value={formDuration} onChange={setFormDuration} options={AUCTION_DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">تمديد اللحظات الأخيرة</label><YRSelect compact value={formAutoExtend} onChange={setFormAutoExtend} options={AUCTION_AUTO_EXTEND_OPTIONS} /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">بداية المزاد (اختياري)</label><input type="datetime-local" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="w-full bg-black border border-[#2F3336] rounded-xl p-2 text-[11px] text-white outline-none" /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">انتهاء المزاد (اختياري)</label><input type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="w-full bg-black border border-[#2F3336] rounded-xl p-2 text-[11px] text-white outline-none" /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">إظهار عدد المزايدات</label><YRSelect compact value={formShowBidsCount} onChange={setFormShowBidsCount} options={AUCTION_YES_NO_OPTIONS} /></div>
                      <div><label className="text-[10.5px] text-[#71767B] block mb-1">إظهار أعلى مزايدة</label><YRSelect compact value={formShowTopBid} onChange={setFormShowTopBid} options={AUCTION_YES_NO_OPTIONS} /></div>
                    </>
                  )}
                </div>
              </div>

              {/* 5. شروط المشاركة والاستلام */}
              <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                <div className="text-[11px] font-bold text-[#FFC500]">شروط المشاركة والاستلام</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">المشاركة متاحة</label><YRSelect compact value={formParticipation} onChange={setFormParticipation} options={AUCTION_PARTICIPATION_OPTIONS} /></div>
                  <div><label className="text-[10.5px] text-[#71767B] block mb-1">طريقة الاستلام</label><YRSelect compact value={formDeliveryMethod} onChange={setFormDeliveryMethod} options={AUCTION_DELIVERY_METHOD_OPTIONS} /></div>
                  {formDeliveryMethod === 'توصيل' && (
                    <div className="col-span-2"><label className="text-[10.5px] text-[#71767B] block mb-1">رسوم التوصيل</label><YRSelect compact value={formDeliveryFee} onChange={setFormDeliveryFee} options={AUCTION_DELIVERY_FEE_OPTIONS} /></div>
                  )}
                  <div className="col-span-2"><label className="text-[10.5px] text-[#71767B] block mb-1">شروط المزايدة</label><YRSelect compact value={formBidRules} onChange={setFormBidRules} options={AUCTION_BID_RULES_OPTIONS} /></div>
                  <div className="col-span-2"><label className="text-[10.5px] text-[#71767B] block mb-1">سياسة التراجع</label><YRSelect compact value={formWithdrawPolicy} onChange={setFormWithdrawPolicy} options={AUCTION_WITHDRAW_POLICY_OPTIONS} /></div>
                </div>
              </div>

              {/* 6. الصور والمرفقات */}
              <div className="space-y-2">
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImagesUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={compressing} className="w-full py-2.5 border border-dashed border-[#2F3336] hover:border-white rounded-xl bg-black text-white flex items-center justify-center gap-2 font-bold">
                  <ImagePlus size={15} className="text-[#FFC500]" />
                  <span>{compressing ? 'جاري المعالجة...' : `إضافة صور المعروض (${uploadedImages.length}/6)`}</span>
                </button>
                {uploadedImages.length > 0 && <div className="grid grid-cols-3 gap-2">{uploadedImages.map((img, i) => <div key={i} className="relative h-16 rounded-lg overflow-hidden border border-[#2F3336]"><img src={img} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => removeImage(i)} className="absolute top-1 left-1 p-1 rounded-full bg-black/80 text-white"><Trash2 size={11} /></button></div>)}</div>}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input type="file" accept="image/*" ref={docInputRef} onChange={handleDocUpload} className="hidden" />
                    <button type="button" onClick={() => docInputRef.current?.click()} className={`w-full py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${docImage ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-[#2F3336] bg-black text-white'}`}>
                      <FileImage size={14} className="text-[#FFC500]" /><span>{docImage ? 'تم إرفاق المستند' : 'مستندات (اختياري)'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black border border-[#2F3336] rounded-xl px-2">
                    <Video size={13} className="text-[#FFC500] shrink-0" />
                    <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="رابط فيديو اختياري" className="w-full bg-transparent text-[11px] text-white outline-none caret-white py-2" />
                  </div>
                </div>
              </div>

              {!hasAccountPhone && (
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">رقم الهاتف *</label>
                  <input
                    required type="tel" inputMode="numeric" dir="ltr" maxLength={9}
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(normalizeYemenPhone(e.target.value));
                      if (!formPhoneTouched) setFormPhoneTouched(true);
                    }}
                    onBlur={() => setFormPhoneTouched(true)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                  {formPhoneTouched && !isValidYemenPhone(normalizeYemenPhone(formPhone)) && (
                    <p className="text-[11px] text-rose-400 mt-1">الرقم خاطئ</p>
                  )}
                </div>
              )}
              <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="وصف المعروض (اختياري)..." className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white outline-none resize-none" />
              <label className="flex items-center gap-2 text-[11px] text-[#71767B] cursor-pointer"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-[#16A34A]" /><span>أوافق على شروط وسياسة وساطة يمن ريتغ</span></label>
              <button
                type="submit"
                disabled={submitting || !consent || (!hasAccountPhone && !isValidYemenPhone(normalizeYemenPhone(formPhone)))}
                className="w-full py-2.5 rounded-full bg-[#FFC500] disabled:opacity-40 text-black font-black text-xs"
              >
                {submitting ? 'جاري النشر...' : 'نشر الآن'}
              </button>
            </form>
          </div>
        </div>
      )}

      <XImageLightbox isOpen={isLightboxOpen} item={selectedItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <XAuctionBidModal auction={biddingAuction} onClose={() => setBiddingAuction(null)} onSuccess={(m) => { showToast(m, 'success', 3500); fetchAuctions(); }} />
      <XFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="تصفية المزادات" activeFiltersCount={activeFiltersCount} onReset={() => { setSelectedCat('all'); setStatusTab('ALL'); setCurrencyFilter('all'); setConditionFilter('all'); setCityFilter('all'); }} resultsCount={displayedListings.length} fields={[
        { label: 'التصنيف', value: selectedCat, onChange: setSelectedCat, options: [{ value: 'all', label: 'كل التصنيفات' }, ...AUCTION_CATEGORY_OPTIONS.map((x) => ({ value: x.id, label: x.label }))] },
        { label: 'نوع المزاد والحالة', value: statusTab, onChange: (v) => setStatusTab(v as any), options: [
          { value: 'ALL', label: `الكل (${auctions.length})` },
          { value: 'ACTIVE', label: `المزادات النشطة (${activeAuctions.length})` },
          { value: 'DIRECT', label: `البيع المباشر (${directSales.length})` },
          { value: 'ENDED', label: `المزادات المنتهية (${endedListings.length})` },
        ] },
        { label: 'حالة المعروض', value: conditionFilter, onChange: setConditionFilter, options: [{ value: 'all', label: 'كل الحالات' }, ...AUCTION_CONDITION_OPTIONS.filter((o) => o.value !== NOT_AVAILABLE)] },
        { label: 'العملة', value: currencyFilter, onChange: setCurrencyFilter, options: [{ value: 'all', label: 'كل العملات' }, ...AUCTION_CURRENCIES] },
        { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
      ]} />
    </div>
  );
};
