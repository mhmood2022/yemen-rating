import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Smartphone,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Copy,
  CreditCard,
  ChevronDown,
  ShieldCheck,
  Gift,
  Eye,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  adSubscriptionsService,
  AdOrderQuote,
  AdPackageRecord,
  AdProductType,
  AdSlotAvailability,
  AdSubscriptionOrder,
  NormalizedPaymentMethod,
} from '../../services/adSubscriptionsService';
import {
  AD_SLOT_OPTIONS,
  getDynamicMarketSections,
  getDynamicSectionLabel,
} from '../../utils/adGeneratorEngine';
import {
  fetchCommunitySections,
  getCachedCommunitySections,
  getSectionConfigById,
  type CommunitySection,
} from '../../services/sectionsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialAdType?: AdProductType | null;
  initialSectionId?: string;
  initialSlotKey?: string;
  businessId?: string | null;
  entityScope?: 'account' | 'business';
  onOrderSubmitted?: (order: AdSubscriptionOrder) => void;
}

type WizardStep = 'type' | 'section_slot' | 'package' | 'creative' | 'checkout' | 'done';

const TYPE_CARDS: {
  id: AdProductType;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'phone_feed',
    title: 'إعلانات سوق الهاتف',
    subtitle: 'منشورات وتغريدات مميزة لمنتجاتك داخل المجتمع برصيد منشورات وإبراز محدد',
    badge: 'منشورات مميزة',
    icon: Smartphone,
  },
  {
    id: 'sponsor',
    title: 'إعلان الراعي (Sponsor)',
    subtitle: 'رعاية قسم معين بظهور شعارك واسمك وعبارة «هذا القسم برعاية» في رأس القسم',
    badge: 'رعاية قسم',
    icon: Sparkles,
  },
  {
    id: 'banner',
    title: 'إعلانات البانر (Banner)',
    subtitle: 'حجز مساحة بانر مصورة داخل الأقسام (الوحدة الأولى أو الثانية) مع معاينة حية',
    badge: 'مساحة مصورة',
    icon: ImageIcon,
  },
];

export const AdSubscriptionWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialAdType = null,
  initialSectionId = 'phones',
  initialSlotKey = 'all',
  businessId = null,
  entityScope,
  onOrderSubmitted,
}) => {
  const [step, setStep] = useState<WizardStep>('type');
  const [adType, setAdType] = useState<AdProductType | null>(initialAdType);
  const [sectionId, setSectionId] = useState<string>(initialSectionId || 'phones');
  const [slotKey, setSlotKey] = useState<string>(initialSlotKey || 'all');
  const [currency, setCurrency] = useState<'YER' | 'USD'>('YER');

  const [sections, setSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const [packages, setPackages] = useState<AdPackageRecord[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [quotesMap, setQuotesMap] = useState<Record<string, AdOrderQuote>>({});
  const [availability, setAvailability] = useState<AdSlotAvailability | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // بيانات المعلن والمحتوى الإعلاني
  const [userId, setUserId] = useState<string | null>(null);
  const [detectedBizId, setDetectedBizId] = useState<string | null>(businessId || null);
  const [advertiserName, setAdvertiserName] = useState('');
  const [sponsorTag, setSponsorTag] = useState('الراعي الرسمي');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [ctaText, setCtaText] = useState('زيارة الصفحة');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaDimensions, setMediaDimensions] = useState<{ w: number; h: number } | null>(null);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // الدفع اليدوي
  const [methods, setMethods] = useState<NormalizedPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<NormalizedPaymentMethod | null>(null);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<AdSubscriptionOrder | null>(null);

  // تهيئة عند الفتح
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setCreatedOrder(null);
    setMediaWarning(null);
    setProofFile(null);
    setPaymentRef('');
    setAdType(initialAdType || null);
    setSectionId(initialSectionId || 'phones');
    setSlotKey(
      initialAdType === 'sponsor'
        ? 'header_sponsor'
        : initialAdType === 'banner'
          ? initialSlotKey && initialSlotKey !== 'all'
            ? initialSlotKey
            : 'slot_1'
          : 'all'
    );
    setStep(initialAdType ? (initialAdType === 'phone_feed' ? 'package' : 'section_slot') : 'type');

    fetchCommunitySections().then(setSections).catch(() => {});
    adSubscriptionsService.getActivePaymentMethods().then((list) => {
      setMethods(list);
      if (list.length > 0) setSelectedMethod(list[0]);
    }).catch(() => {});

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id || null;
      setUserId(uid);
      if (uid) {
        const [{ data: prof }, { data: biz }] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', uid).maybeSingle(),
          (entityScope === 'business' || Boolean(businessId)) && businessId ? supabase.from('businesses').select('id, name, logo_url').eq('id', businessId).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        if (biz) {
          setDetectedBizId(biz.id);
          setAdvertiserName((prev) => prev || biz.name || '');
          setLinkUrl((prev) => prev || `/business-page/${biz.id}`);
        } else {
            setDetectedBizId(null);
            if (prof?.full_name)
          setAdvertiserName((prev) => prev || prof.full_name);
        }
      }
    });
  }, [isOpen, initialAdType, initialSectionId, initialSlotKey, businessId]);

  const marketSections = useMemo(
    () => getDynamicMarketSections(sections).filter((s) => s.id !== 'all'),
    [sections]
  );

  // الأقسام المؤهلة حسب النوع
  const eligibleSections = useMemo(() => {
    return marketSections.filter((sec) => {
      const cfg = getSectionConfigById(sec.id === 'realestate' ? 'properties' : sec.id);
      if (!cfg) return true;
      if (cfg.allowSponsorAndBanners === false) return false;
      if (adType === 'sponsor') return cfg.allowHeaderSponsor !== false;
      if (adType === 'banner') {
        return cfg.allowSlot1Banner !== false || cfg.allowSlot2Banner !== false;
      }
      return true;
    });
  }, [marketSections, adType]);

  // الوحدات المتاحة داخل القسم المختار للبانر
  const eligibleBannerSlots = useMemo(() => {
    const cfg = getSectionConfigById(sectionId === 'realestate' ? 'properties' : sectionId);
    return AD_SLOT_OPTIONS.filter((opt) => {
      if (opt.id === 'all') return false;
      if (!cfg) return true;
      if (opt.id === 'slot_1') return cfg.allowSlot1Banner !== false;
      if (opt.id === 'slot_2') return cfg.allowSlot2Banner !== false;
      return true;
    });
  }, [sectionId]);

  // تأكد من توافق slotKey مع القسم المختار
  useEffect(() => {
    if (adType === 'sponsor') {
      setSlotKey('header_sponsor');
    } else if (adType === 'phone_feed') {
      setSectionId('phones');
      setSlotKey('all');
    } else if (adType === 'banner') {
      if (eligibleBannerSlots.length > 0 && !eligibleBannerSlots.some((s) => s.id === slotKey)) {
        setSlotKey(eligibleBannerSlots[0].id);
      }
    }
  }, [adType, sectionId, eligibleBannerSlots]);

  // جلب الباقات وحساب التسعير من الخادم عند تغير النوع أو القسم أو المساحة أو العملة
  useEffect(() => {
    if (!isOpen || !adType) return;
    let active = true;
    const loadQuotes = async () => {
      setLoadingPackages(true);
      setErrorMsg(null);
      try {
        const pkgs = await adSubscriptionsService.getActivePackages(adType);
        if (!active) return;
        setPackages(pkgs);
        const effSection = adType === 'phone_feed' ? 'phones' : sectionId;
        const effSlot = adType === 'sponsor' ? 'header_sponsor' : adType === 'phone_feed' ? 'all' : slotKey;

        const entries = await Promise.all(
          pkgs.map(async (p) => {
            try {
              const q = await adSubscriptionsService.calculateQuote(p.id, effSection, effSlot, currency);
              return [p.id, q] as const;
            } catch {
              return null;
            }
          })
        );
        if (!active) return;
        const map: Record<string, AdOrderQuote> = {};
        for (const e of entries) {
          if (e) map[e[0]] = e[1];
        }
        setQuotesMap(map);
        if (pkgs.length > 0 && (!selectedPkgId || !pkgs.some((p) => p.id === selectedPkgId))) {
          setSelectedPkgId(pkgs[0].id);
        }
      } catch (err: any) {
        if (active) setErrorMsg(err?.message || 'تعذر جلب باقات الإعلانات');
      } finally {
        if (active) setLoadingPackages(false);
      }
    };
    loadQuotes();
    return () => {
      active = false;
    };
  }, [isOpen, adType, sectionId, slotKey, currency]);

  // فحص توفر المساحة ومنع التعارض عند اختيار الباقة
  useEffect(() => {
    if (!isOpen || !adType || !selectedPkgId) {
      setAvailability(null);
      return;
    }
    if (adType === 'phone_feed') {
      setAvailability({ available: true, conflict_count: 0, conflict_until: null });
      return;
    }
    const effSlot = adType === 'sponsor' ? 'header_sponsor' : slotKey;
    adSubscriptionsService
      .checkSlotAvailability(adType, selectedPkgId, sectionId, effSlot)
      .then(setAvailability)
      .catch(() => setAvailability({ available: true, conflict_count: 0, conflict_until: null }));
  }, [isOpen, adType, selectedPkgId, sectionId, slotKey]);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || null;
  const selectedQuote = selectedPkgId ? quotesMap[selectedPkgId] || null : null;

  const handleMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaWarning(null);
    setErrorMsg(null);

    // التحقق من أبعاد الصورة على المتصفح قبل الرفع
    const imgObjUrl = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = imgObjUrl;
    });
    URL.revokeObjectURL(imgObjUrl);

    if (dims.w === 0 || dims.h === 0) {
      setErrorMsg('الملف المحدد ليس صورة صالحة');
      return;
    }
    setMediaDimensions(dims);

    if (adType === 'banner' && (dims.w < 400 || dims.h < 100)) {
      setMediaWarning(`تنبيه: أبعاد الصورة صغيرة (${dims.w}×${dims.h}). يُفضّل عرض 800px على الأقل لبانر واضح.`);
    }

    setUploadingMedia(true);
    try {
      const folder = adType === 'sponsor' ? 'sponsors' : 'banners';
      const url = await adSubscriptionsService.uploadAdMedia(file, folder);
      setMediaUrl(url);
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل رفع الصورة');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCopy = (txt: string, key: string) => {
    navigator.clipboard?.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || !selectedQuote || !adType) return;
    setErrorMsg(null);

    if (!userId) {
      setErrorMsg('يرجى تسجيل الدخول أولاً لإرسال طلب الاشتراك');
      return;
    }

    if (availability && !availability.available) {
      setErrorMsg('هذه المساحة محجوزة حالياً في نفس الفترة ولا تقبل حجوزات متعارضة.');
      return;
    }

    const isFree = selectedQuote.is_free || selectedQuote.final_price === 0;
    if (!isFree) {
      if (!selectedMethod) {
        setErrorMsg('يرجى اختيار وسيلة الدفع');
        return;
      }
      if (!paymentRef.trim() || !proofFile) {
        setErrorMsg('يرجى إرفاق صورة سند التحويل وإدخال رقم العملية');
        return;
      }
    }

    setSubmitting(true);
    try {
      let proofUrl: string | null = null;
      let proofHash: string | null = null;

      if (!isFree && proofFile) {
        const up = await adSubscriptionsService.uploadPaymentProof(proofFile, userId);
        proofUrl = up.path;
        proofHash = up.hash;
      }

      const effSection = adType === 'phone_feed' ? 'phones' : sectionId;
      const effSlot = adType === 'sponsor' ? 'header_sponsor' : adType === 'phone_feed' ? 'all' : slotKey;

      const adPayload: Record<string, any> = {
        advertiserName: advertiserName.trim() || 'معلن',
        title: adTitle.trim() || advertiserName.trim() || selectedPkg.name,
        description: adDescription.trim(),
        linkUrl: linkUrl.trim(),
        ctaText: ctaText.trim() || 'زيارة الصفحة',
        mediaUrl: mediaUrl.trim(),
        mediaType: 'image',
        mediaDimensions,
        sponsorTag: adType === 'sponsor' ? sponsorTag : undefined,
      };

      const order = await adSubscriptionsService.submitOrder({
        packageId: selectedPkg.id,
        sectionId: effSection,
        slotKey: effSlot,
        currency,
        businessId: detectedBizId,
        adPayload,
        paymentMethodId: isFree ? null : selectedMethod?.id || null,
        paymentReference: isFree ? null : paymentRef.trim(),
        paymentProofUrl: proofUrl,
        paymentProofHash: proofHash,
      });

      setCreatedOrder(order);
      setStep('done');
      onOrderSubmitted?.(order);
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFreeSelected = Boolean(selectedQuote && (selectedQuote.is_free || selectedQuote.final_price === 0));

  const goBack = () => {
    setErrorMsg(null);
    if (step === 'section_slot') setStep('type');
    else if (step === 'package') setStep(adType === 'phone_feed' ? 'type' : 'section_slot');
    else if (step === 'creative') setStep('package');
    else if (step === 'checkout') setStep('creative');
  };

  return (
    <div
      className="fixed inset-0 z-[210] bg-black/85 backdrop-blur-sm flex items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[92vh] bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl flex flex-col overflow-hidden text-white"
        dir="rtl"
      >
        {/* الرأس */}
        <div className="px-4 py-3.5 border-b border-[#2F3336] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'type' && step !== 'done' && (
              <button
                type="button"
                onClick={goBack}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-black text-white">مركز الاشتراكات الإعلانية — يمن ريتنج</h2>
              <p className="text-[10.5px] text-[#71767B]">
                {step === 'type' && 'اختر نوع الإعلان المطلوب'}
                {step === 'section_slot' && 'اختر القسم والمساحة الإعلانية'}
                {step === 'package' && 'اختر الباقة المناسبة'}
                {step === 'creative' && 'بيانات الإعلان والمعاينة الحقيقية'}
                {step === 'checkout' && 'ملخص الطلب وتأكيد الدفع'}
                {step === 'done' && 'تم استلام الطلب بنجاح'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* شريط التقدم */}
        {step !== 'done' && (
          <div className="px-4 py-2 border-b border-[#2F3336]/50 flex items-center gap-1.5 text-[10px] bg-[#080808] shrink-0">
            {[
              { id: 'type', label: 'النوع' },
              ...(adType !== 'phone_feed' ? [{ id: 'section_slot', label: 'القسم' }] : []),
              { id: 'package', label: 'الباقة' },
              { id: 'creative', label: 'المحتوى' },
              { id: 'checkout', label: 'التأكيد' },
            ].map((s, i) => (
              <span
                key={s.id}
                className={`px-2.5 py-1 rounded-full font-bold ${
                  step === s.id ? 'bg-[#FFC500] text-black font-black' : 'bg-[#16181C] text-[#71767B]'
                }`}
              >
                {i + 1}. {s.label}
              </span>
            ))}
          </div>
        )}

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. اختيار نوع الإعلان */}
          {step === 'type' && (
            <div className="space-y-3">
              {TYPE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setAdType(card.id);
                      if (card.id === 'phone_feed') {
                        setSectionId('phones');
                        setSlotKey('all');
                        setStep('package');
                      } else {
                        setSlotKey(card.id === 'sponsor' ? 'header_sponsor' : 'slot_1');
                        setStep('section_slot');
                      }
                    }}
                    className="w-full p-4 rounded-2xl border border-[#2F3336] bg-[#080808] hover:border-[#FFC500] text-right transition flex items-start gap-3.5 group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FFC500]/15 border border-[#FFC500]/30 flex items-center justify-center text-[#FFC500] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-white group-hover:text-[#FFC500] transition">
                          {card.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#16181C] border border-[#2F3336] text-[10px] text-[#FFC500] font-bold">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#71767B] mt-1 leading-relaxed">{card.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. اختيار القسم والمساحة */}
          {step === 'section_slot' && adType && adType !== 'phone_feed' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  اختر القسم المستهدف ({eligibleSections.length} أقسام متاحة)
                </label>
                {eligibleSections.length === 0 ? (
                  <div className="p-4 rounded-xl border border-[#2F3336] text-xs text-zinc-400">
                    لا توجد أقسام مفعلة لهذا النوع حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {eligibleSections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSectionId(sec.id)}
                        className={`p-3 rounded-xl border text-right text-xs font-bold transition ${
                          sectionId === sec.id
                            ? 'border-[#FFC500] bg-[#FFC500]/15 text-[#FFC500]'
                            : 'border-[#2F3336] bg-[#080808] text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {adType === 'banner' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    اختر المساحة الإعلانية المعتمدة في القسم
                  </label>
                  {eligibleBannerSlots.length === 0 ? (
                    <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
                      هذا القسم لا يحتوي على مساحات بانر مفعلة حالياً.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eligibleBannerSlots.map((sl) => (
                        <button
                          key={sl.id}
                          type="button"
                          onClick={() => setSlotKey(sl.id)}
                          className={`w-full p-3 rounded-xl border text-right text-xs font-bold transition flex items-center justify-between ${
                            slotKey === sl.id
                              ? 'border-[#FFC500] bg-[#FFC500]/15 text-white'
                              : 'border-[#2F3336] bg-[#080808] text-zinc-300'
                          }`}
                        >
                          <span>{sl.label}</span>
                          {slotKey === sl.id && <Check className="w-4 h-4 text-[#FFC500]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={eligibleSections.length === 0 || (adType === 'banner' && eligibleBannerSlots.length === 0)}
                onClick={() => setStep('package')}
                className="w-full py-3 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-sm font-black disabled:opacity-40"
              >
                التالي: عرض الباقات والأسعار
              </button>
            </div>
          )}

          {/* 3. اختيار الباقة */}
          {step === 'package' && adType && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-[#71767B]">
                  القسم: <strong className="text-white">{getDynamicSectionLabel(sectionId, sections)}</strong>
                  {adType === 'banner' && (
                    <span> · {slotKey === 'slot_1' ? 'الوحدة الأولى' : 'الوحدة الثانية'}</span>
                  )}
                </div>
                <div className="flex bg-[#16181C] rounded-full p-0.5 border border-[#2F3336] text-[11px]">
                  {(['YER', 'USD'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1 rounded-full font-bold ${
                        currency === c ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                      }`}
                    >
                      {c === 'YER' ? 'ر.ي' : 'دولار $'}
                    </button>
                  ))}
                </div>
              </div>

              {loadingPackages ? (
                <div className="py-10 text-center text-xs text-[#71767B] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFC500]" />
                  <span>جاري جلب الباقات وحساب الأسعار من الخادم...</span>
                </div>
              ) : packages.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 border border-[#2F3336] rounded-2xl">
                  لا توجد باقات متاحة لهذا النوع حالياً.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {packages.map((pkg) => {
                    const q = quotesMap[pkg.id];
                    const selected = selectedPkgId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`w-full p-4 rounded-2xl border text-right transition space-y-2 ${
                          selected
                            ? 'border-[#FFC500] bg-[#FFC500]/10'
                            : 'border-[#2F3336] bg-[#080808] hover:border-zinc-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-white">{pkg.name}</span>
                              {pkg.is_exclusive && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                                  حصري
                                </span>
                              )}
                              {q?.is_free && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                                  مجانية
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#71767B] mt-0.5">{pkg.description}</p>
                          </div>

                          <div className="text-left shrink-0" dir="ltr">
                            {q ? (
                              q.is_free ? (
                                <span className="text-base font-black text-emerald-400">FREE (0)</span>
                              ) : (
                                <>
                                  <p className="text-base font-black text-[#FFC500]">
                                    {q.final_price.toLocaleString()} {q.currency}
                                  </p>
                                  {q.discount_amount > 0 && (
                                    <p className="text-[10px] text-zinc-500 line-through">
                                      {q.base_price.toLocaleString()} {q.currency}
                                    </p>
                                  )}
                                </>
                              )
                            ) : (
                              <span className="text-xs text-zinc-500">...</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[10.5px] text-zinc-300">
                          <span className="px-2 py-0.5 rounded bg-black border border-[#2F3336]">
                            المدة: {pkg.duration_days} يوم
                          </span>
                          {pkg.ad_type === 'phone_feed' && (
                            <>
                              <span className="px-2 py-0.5 rounded bg-black border border-[#2F3336]">
                                {pkg.post_quota} منشور
                              </span>
                              <span className="px-2 py-0.5 rounded bg-black border border-[#2F3336]">
                                {pkg.highlight_quota} إبراز
                              </span>
                            </>
                          )}
                          {q?.pricing_source === 'section_slot_custom' && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">
                              سعر مخصص للقسم
                            </span>
                          )}
                        </div>

                        {pkg.features.length > 0 && (
                          <ul className="space-y-1 pt-1">
                            {pkg.features.slice(0, 4).map((f, idx) => (
                              <li key={idx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {availability && !availability.available && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    هذه الباقة الحصرية محجوزة حالياً في هذا القسم حتى{' '}
                    {availability.conflict_until
                      ? new Date(availability.conflict_until).toLocaleDateString('ar-YE')
                      : 'نهاية الحملة الحالية'}
                    . اختر باقة أخرى أو قسماً آخر.
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedPkg || !selectedQuote || (availability ? !availability.available : false)}
                onClick={() => setStep('creative')}
                className="w-full py-3 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-sm font-black disabled:opacity-40"
              >
                التالي: إدخال بيانات الإعلان والمعاينة
              </button>
            </div>
          )}

          {/* 4. بيانات الإعلان والمعاينة */}
          {step === 'creative' && adType && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">اسم المعلن / المنشأة *</label>
                <input
                  type="text"
                  value={advertiserName}
                  onChange={(e) => setAdvertiserName(e.target.value)}
                  placeholder="مثال: متجر القمة للهواتف"
                  className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              {adType === 'sponsor' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">عبارة / وسم الرعاية</label>
                  <select
                    value={sponsorTag}
                    onChange={(e) => setSponsorTag(e.target.value)}
                    className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="الراعي الرسمي">الراعي الرسمي</option>
                    <option value="الراعي الذهبي">الراعي الذهبي</option>
                    <option value="الراعي الحصري">الراعي الحصري</option>
                    <option value="شريك استراتيجي">شريك استراتيجي</option>
                  </select>
                </div>
              )}

              {adType !== 'phone_feed' && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      {adType === 'sponsor' ? 'العنوان التسويقي للراعي' : 'عنوان البانر'}
                    </label>
                    <input
                      type="text"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="مثال: أقوى عروض الهواتف بضمان رسمي"
                      className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">رابط صفحة المنشأة أو العرض</label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="/business-page/... أو https://..."
                      className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      {adType === 'sponsor' ? 'رفع شعار الراعي' : 'رفع صورة البانر *'}
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#2F3336] hover:border-[#FFC500]/60 cursor-pointer bg-[#080808]">
                      {uploadingMedia ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#FFC500]" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#FFC500] mb-1.5" />
                          <span className="text-xs text-zinc-300">
                            {mediaUrl ? 'تغيير الصورة المرفوعة' : 'اضغط لرفع الصورة'}
                          </span>
                          {mediaDimensions && (
                            <span className="text-[10px] text-[#71767B] mt-1" dir="ltr">
                              {mediaDimensions.w} × {mediaDimensions.h} px
                            </span>
                          )}
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleMediaFile} />
                    </label>
                    {mediaWarning && (
                      <p className="text-[11px] text-amber-400 mt-1.5">{mediaWarning}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-zinc-400 mb-1">وصف أو ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder={
                    adType === 'phone_feed'
                      ? 'اكتب نبذة قصيرة عن نشاطك في سوق الهاتف (ستنشر تفاصيل الهواتف من رصيد باقتك بعد التفعيل)'
                      : 'وصف قصير يظهر للمستخدمين...'
                  }
                  className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              {/* معاينة حية */}
              <div className="p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] space-y-2">
                <p className="text-[11px] font-bold text-[#FFC500] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الإعلان في موقعه الحقيقي</span>
                </p>

                {adType === 'sponsor' && (
                  <div className="p-3 rounded-xl bg-[#090E1A] border border-[#FFC500]/40 flex items-center gap-3">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="" className="w-11 h-11 rounded-full object-cover border border-[#FFC500]" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#16181C] border border-[#FFC500] flex items-center justify-center text-[#FFC500] font-black">
                        {(advertiserName || 'ر').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFC500]/20 text-[#FFC500] font-bold">
                          هذا القسم برعاية · {sponsorTag}
                        </span>
                      </div>
                      <p className="text-sm font-black text-white truncate mt-0.5">
                        {advertiserName || 'اسم الراعي'}
                      </p>
                      {adTitle && <p className="text-[11px] text-zinc-300 truncate">{adTitle}</p>}
                    </div>
                  </div>
                )}

                {adType === 'banner' && (
                  <div className="rounded-xl overflow-hidden border border-[#2F3336] bg-black">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="Banner Preview" className="w-full max-h-40 object-cover" />
                    ) : (
                      <div className="h-24 flex items-center justify-center text-xs text-zinc-500">
                        ستظهر صورة البانر هنا في {slotKey === 'slot_1' ? 'الوحدة الأولى (أعلى)' : 'الوحدة الثانية'}
                      </div>
                    )}
                    {(adTitle || advertiserName) && (
                      <div className="px-3 py-2 flex items-center justify-between text-xs border-t border-[#222]">
                        <span className="font-bold text-white truncate">{adTitle || advertiserName}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFC500] text-black font-black text-[10px]">
                          {ctaText}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {adType === 'phone_feed' && (
                  <div className="p-3 rounded-xl border border-[#FFC500]/40 bg-black text-xs space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFC500] text-black text-[10px] font-black">
                      إعلان مميز · {selectedPkg?.name}
                    </span>
                    <p className="font-bold text-white mt-1">{advertiserName || 'المتجر / المعلن'}</p>
                    <p className="text-[11px] text-zinc-400">
                      رصيد الباقة: {selectedPkg?.post_quota} منشورات + {selectedPkg?.highlight_quota} إبراز لمدة {selectedPkg?.duration_days} يوماً
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={
                  !advertiserName.trim() ||
                  (adType === 'banner' && !mediaUrl) ||
                  uploadingMedia
                }
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-sm font-black disabled:opacity-40"
              >
                التالي: مراجعة السعر والتأكيد
              </button>
            </div>
          )}

          {/* 5. الملخص والدفع */}
          {step === 'checkout' && selectedPkg && selectedQuote && (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="p-4 rounded-2xl border border-[#2F3336] bg-[#080808] space-y-2 text-xs">
                <h3 className="text-sm font-black text-white mb-2">ملخص الطلب والتسعير</h3>
                <div className="flex justify-between">
                  <span className="text-[#71767B]">نوع الإعلان:</span>
                  <span className="font-bold text-white">
                    {TYPE_CARDS.find((c) => c.id === adType)?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71767B]">الباقة:</span>
                  <span className="font-bold text-white">{selectedQuote.package_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71767B]">القسم والمساحة:</span>
                  <span className="font-bold text-white">
                    {getDynamicSectionLabel(selectedQuote.section_id, sections)} · {selectedQuote.slot_key}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71767B]">مدة الاشتراك:</span>
                  <span className="font-bold text-white">{selectedQuote.duration_days} يوم</span>
                </div>
                {!isFreeSelected && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#71767B]">السعر قبل الخصم:</span>
                      <span className="text-zinc-300">
                        {selectedQuote.base_price.toLocaleString()} {selectedQuote.currency}
                      </span>
                    </div>
                    {selectedQuote.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>الخصم:</span>
                        <span>
                          -{selectedQuote.discount_amount.toLocaleString()} {selectedQuote.currency}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#222]">
                  <span className="font-black text-white">السعر النهائي:</span>
                  {isFreeSelected ? (
                    <span className="text-lg font-black text-emerald-400">مجانية (0)</span>
                  ) : (
                    <span className="text-lg font-black text-[#FFC500]">
                      {selectedQuote.final_price.toLocaleString()} {selectedQuote.currency}
                    </span>
                  )}
                </div>
              </div>

              {isFreeSelected ? (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200 flex items-start gap-2.5">
                  <Gift className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black text-white">هذه الباقة مجانية حالياً</p>
                    <p>
                      لا يُطلب منك إيصال تحويل. سيُرسل طلبك مباشرة للمراجعة والاعتماد من الإدارة قبل التفعيل.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#FFC500]" />
                    <span>اختر طريقة الدفع اليدوي</span>
                  </h4>

                  {methods.length === 0 ? (
                    <div className="p-3 rounded-xl border border-[#2F3336] text-xs text-zinc-400">
                      لا توجد طرق دفع مفعلة حالياً.
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMethodDropdownOpen((v) => !v)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080808] border border-[#2F3336] text-xs"
                      >
                        <span className="font-bold text-white">
                          {selectedMethod ? selectedMethod.name : 'اختر طريقة الدفع'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      </button>

                      {methodDropdownOpen && (
                        <div className="mt-1 rounded-xl border border-[#2F3336] bg-[#0B0B0E] overflow-hidden">
                          {methods.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedMethod(m);
                                setMethodDropdownOpen(false);
                              }}
                              className="w-full px-3.5 py-2.5 text-right text-xs font-bold hover:bg-white/5 flex items-center justify-between border-b border-[#222] last:border-0"
                            >
                              <span>{m.name}</span>
                              {selectedMethod?.id === m.id && <Check className="w-4 h-4 text-[#FFC500]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod && (
                    <div className="p-3.5 rounded-xl bg-[#080808] border border-[#2F3336] space-y-2 text-xs">
                      {selectedMethod.phone_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">رقم الهاتف: <strong className="text-white" dir="ltr">{selectedMethod.phone_number}</strong></span>
                          <button type="button" onClick={() => handleCopy(selectedMethod.phone_number!, 'phone')} className="text-[#FFC500]">
                            {copiedKey === 'phone' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      {selectedMethod.account_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">رقم الحساب: <strong className="text-white" dir="ltr">{selectedMethod.account_number}</strong></span>
                          <button type="button" onClick={() => handleCopy(selectedMethod.account_number!, 'acc')} className="text-[#FFC500]">
                            {copiedKey === 'acc' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      {selectedMethod.account_name && (
                        <p className="text-zinc-400">اسم المستفيد: <strong className="text-white">{selectedMethod.account_name}</strong></p>
                      )}
                      {selectedMethod.qr_code_url && (
                        <button
                          type="button"
                          onClick={() => setShowQR(selectedMethod.qr_code_url)}
                          className="w-full py-2 rounded-lg bg-zinc-900 text-[#FFC500] font-bold"
                        >
                          عرض باركود التحويل (QR)
                        </button>
                      )}
                      {selectedMethod.instructions && (
                        <p className="text-[11px] text-sky-400">{selectedMethod.instructions}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">صورة سند التحويل *</label>
                    <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-[#2F3336] bg-[#080808] cursor-pointer text-xs text-zinc-300">
                      <Upload className="w-4 h-4 text-[#FFC500]" />
                      <span>{proofFile ? proofFile.name : 'اختر صورة الإيصال'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">رقم مرجع العملية *</label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="مثال: TXN987654"
                      className="w-full bg-[#080808] border border-[#2F3336] rounded-xl p-2.5 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-[#2F3336] text-[11px] text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFC500] shrink-0" />
                <span>لن يتم تفعيل الإعلان تلقائياً؛ تراجع الإدارة الطلب والإيصال ثم تفعّله.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-sm font-black disabled:opacity-50"
              >
                {submitting ? 'جاري إرسال الطلب...' : isFreeSelected ? 'تأكيد إرسال الطلب المجاني' : 'إرسال الطلب وإثبات الدفع'}
              </button>
            </form>
          )}

          {/* 6. تم الاستلام */}
          {step === 'done' && createdOrder && (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-black text-white">تم استلام طلب الاشتراك الإعلاني بنجاح</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                الطلب رقم <span className="text-white font-mono" dir="ltr">{createdOrder.id.slice(0, 8)}</span> بحالة{' '}
                <strong className="text-[#FFC500]">بانتظار مراجعة الإدارة</strong>. سيتم تفعيل الإعلان أو رصيد المنشورات فور الاعتماد.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#FFC500] text-black text-xs font-black"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>

      {showQR && (
        <div
          className="fixed inset-0 z-[260] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowQR(null)}
        >
          <div className="bg-white p-4 rounded-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowQR(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={showQR} alt="QR" className="w-64 h-64 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
