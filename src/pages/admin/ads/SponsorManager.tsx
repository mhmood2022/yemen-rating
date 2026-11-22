import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  Power,
  Save,
  Trash2,
  ArrowRight,
  Eye,
  ChevronDown,
  Image as ImageIcon,
  Film,
  Check,
  MessageCircle,
  Globe,
  Plus,
  Pencil,
  Calendar,
  Layers,
  Sliders,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  adsDatabaseService,
  ExtendedAdRecord,
} from '../../../services/adsDatabaseService';
import {
  getDynamicMarketSections,
  getDynamicSectionLabel,
  normalizeAdTargetSection,
} from '../../../utils/adGeneratorEngine';
import {
  fetchCommunitySections,
  getCachedCommunitySections,
  type CommunitySection,
} from '../../../services/sectionsService';

interface ToastState {
  type: 'success' | 'error' | 'warning';
  text: string;
}

const SPONSOR_TAG_OPTIONS = [
  'الراعي الرسمي',
  'الراعي الذهبي',
  'الراعي الماسي',
  'الراعي الفضي',
  'شريك استراتيجي',
  'عرض حصري',
  'راعي القسم',
  'إعلان مميز',
];

const ANIMATION_OPTIONS = [
  { id: 'none', label: 'بدون حركة' },
  { id: 'shimmer', label: 'لمعان دوري (Shimmer)' },
  { id: 'pulse', label: 'نبض هادئ (Pulse)' },
  { id: 'glow', label: 'توهج ناصع (Glow)' },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: 'عادية (1x)' },
  { value: 2, label: 'متوسطة (2x)' },
  { value: 3, label: 'مرتفعة (3x)' },
  { value: 5, label: 'أولوية قصوى (5x)' },
];

export const SponsorManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [sponsorsList, setSponsorsList] = useState<ExtendedAdRecord[]>([]);
  const [filterSection, setFilterSection] = useState<string>('all_filter');
  const [dynamicSections, setDynamicSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const marketSectionOptions = getDynamicMarketSections(dynamicSections);

  useEffect(() => {
    fetchCommunitySections().then(setDynamicSections).catch(() => {});
  }, []);

  const [sponsorRecordId, setSponsorRecordId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [viewsCount, setViewsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);

  // الاستهداف والجدولة والأولوية
  const [targetSections, setTargetSections] = useState<string[]>(['phones']);
  const [priority, setPriority] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // بيانات الراعي الأساسية
  const [advertiserName, setAdvertiserName] = useState('');
  const [sponsorTag, setSponsorTag] = useState('الراعي الرسمي');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // التحكم بإظهار وإخفاء عناصر البانر
  const [showTag, setShowTag] = useState(true);
  const [showButton, setShowButton] = useState(true);
  const [showText, setShowText] = useState(true);
  const [showAdInfo, setShowAdInfo] = useState(true);

  // الرابط الذكي
  const [linkType, setLinkType] = useState<'whatsapp' | 'website'>('whatsapp');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ctaText, setCtaText] = useState('تواصل واتساب');

  // الوسائط
  const [logoUrl, setLogoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // التخصيص البصري
  const [bgColor, setBgColor] = useState('#090E1A');
  const [accentColor, setAccentColor] = useState('#F5C400');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [btnBgColor, setBtnBgColor] = useState('#16A34A');
  const [btnTextColor, setBtnTextColor] = useState('#FFFFFF');
  const [animationEffect, setAnimationEffect] = useState<'none' | 'shimmer' | 'pulse' | 'glow'>('shimmer');
  const [customHeight, setCustomHeight] = useState(112);

  const logoGalleryRef = useRef<HTMLInputElement>(null);
  const mediaGalleryRef = useRef<HTMLInputElement>(null);
  const mediaVideoRef = useRef<HTMLInputElement>(null);

  const [openTagDropdown, setOpenTagDropdown] = useState(false);
  const [openAnimDropdown, setOpenAnimDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const animDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error' | 'warning', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFormForNew = () => {
    setSponsorRecordId(null);
    setIsActive(true);
    setViewsCount(0);
    setClicksCount(0);
    setTargetSections(['phones']);
    setPriority(1);
    setStartDate('');
    setEndDate('');
    setAdvertiserName('');
    setSponsorTag('الراعي الرسمي');
    setTitle('');
    setDescription('');
    setShowTag(true);
    setShowButton(true);
    setShowText(true);
    setShowAdInfo(true);
    setLinkType('whatsapp');
    setWhatsappNumber('');
    setWebsiteUrl('');
    setCtaText('تواصل واتساب');
    setLogoUrl('');
    setMediaUrl('');
    setMediaType('image');
    setBgColor('#090E1A');
    setAccentColor('#F5C400');
    setTextColor('#FFFFFF');
    setBtnBgColor('#16A34A');
    setBtnTextColor('#FFFFFF');
    setAnimationEffect('shimmer');
    setCustomHeight(112);
  };

  const loadSponsorIntoForm = (sp: ExtendedAdRecord) => {
    const d: any = sp;
    const styles = d.styles || {};
    setSponsorRecordId(sp.id);
    setIsActive(sp.status === 'active');
    setViewsCount(sp.views || 0);
    setClicksCount(sp.clicks || 0);
    setTargetSections(
      Array.isArray(sp.targetSections) && sp.targetSections.length > 0
        ? sp.targetSections
        : ['all']
    );
    setPriority(Number(sp.priority || 1));
    setStartDate(sp.startDate || '');
    setEndDate(sp.endDate || sp.contractExpiry || '');
    setAdvertiserName(d.advertiserName || '');
    setSponsorTag(d.sponsorTag || 'الراعي الرسمي');
    setTitle(d.title || d.headline || '');
    setDescription(d.description || '');
    setShowTag(d.showTag !== false);
    setShowButton(d.showButton !== false);
    setShowText(d.showText !== false);
    setShowAdInfo(d.showAdInfo !== false);

    const savedUrl = d.targetUrl || '';
    if (savedUrl.includes('wa.me/')) {
      setLinkType('whatsapp');
      const num = savedUrl.split('wa.me/')[1]?.split('?')[0]?.replace(/^967/, '') || '';
      setWhatsappNumber(num);
      setWebsiteUrl('');
    } else {
      setLinkType('website');
      setWebsiteUrl(savedUrl.replace(/^https?:\/\//, ''));
      setWhatsappNumber('');
    }

    setCtaText(d.ctaText || 'تواصل واتساب');
    setLogoUrl(d.logoUrl || '');
    setMediaUrl(d.mediaUrl || '');
    setMediaType(d.mediaType || (String(d.mediaUrl || '').endsWith('.mp4') ? 'video' : 'image'));

    setBgColor(styles.bgColor || d.bgColor || '#090E1A');
    setAccentColor(styles.accentColor || d.accentColor || '#F5C400');
    setTextColor(styles.textColor || d.textColor || '#FFFFFF');
    setBtnBgColor(styles.btnBgColor || d.btnBgColor || '#16A34A');
    setBtnTextColor(styles.btnTextColor || d.btnTextColor || '#FFFFFF');
    setAnimationEffect(styles.animationEffect || d.animationEffect || 'shimmer');
    setCustomHeight(Number(styles.customHeight || d.customHeight || 112));
  };

  const loadSponsors = async (selectId?: string) => {
    try {
      setLoading(true);
      const list = await adsDatabaseService.getAllAds('sponsor');
      setSponsorsList(list);
      if (selectId) {
        const found = list.find((s) => s.id === selectId);
        if (found) loadSponsorIntoForm(found);
      } else if (list.length > 0 && !sponsorRecordId) {
        loadSponsorIntoForm(list[0]);
      }
    } catch {
      showToast('error', 'تعذر تحميل قائمة الرعاة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setOpenTagDropdown(false);
      }
      if (animDropdownRef.current && !animDropdownRef.current.contains(e.target as Node)) {
        setOpenAnimDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSectionSelection = (secId: string) => {
    if (secId === 'all') {
      setTargetSections(['all']);
      return;
    }
    const withoutAll = targetSections.filter((s) => s !== 'all');
    if (withoutAll.includes(secId)) {
      const next = withoutAll.filter((s) => s !== secId);
      setTargetSections(next.length > 0 ? next : [secId]);
    } else {
      setTargetSections([...withoutAll, secId]);
    }
  };

  const getFinalTargetUrl = () => {
    if (linkType === 'whatsapp') {
      const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
      if (!cleanDigits) return '';
      if (cleanDigits.startsWith('967')) return `https://wa.me/${cleanDigits}`;
      if (cleanDigits.length === 9) return `https://wa.me/967${cleanDigits}`;
      if (cleanDigits.length === 10 && cleanDigits.startsWith('0')) {
        return `https://wa.me/967${cleanDigits.slice(1)}`;
      }
      return `https://wa.me/${cleanDigits}`;
    }
    const raw = websiteUrl.trim();
    if (!raw) return '';
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
      return raw;
    }
    return `https://${raw}`;
  };

  const compressImage = (file: File, maxW = 900, quality = 0.78): Promise<{ blob: Blob; base64: string }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        URL.revokeObjectURL(url);
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/webp', quality);
        canvas.toBlob(
          (b) => {
            if (b) resolve({ blob: b, base64 });
            else reject(new Error('toBlob failed'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('img load error'));
      };
      img.src = url;
    });

  const handlePhoneFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'media',
    forcedType?: 'image' | 'video'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = forcedType === 'video' || file.type.startsWith('video/');
    if (isVideo && file.size > 10 * 1024 * 1024) {
      showToast('error', 'حجم الفيديو أكبر من 10 ميجابايت.');
      e.target.value = '';
      return;
    }

    showToast('warning', `جارِ معالجة ورفع ${isVideo ? 'فيديو' : 'صورة'} الراعي...`);

    try {
      let body: Blob | File = file;
      let fallbackBase64 = '';
      if (!isVideo) {
        const compressed = await compressImage(file, target === 'logo' ? 400 : 900);
        body = compressed.blob;
        fallbackBase64 = compressed.base64;
      }

      const fileExt = isVideo ? file.name.split('.').pop() || 'mp4' : 'webp';
      const fileName = `ads/sponsors_${target}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('businesses')
        .upload(fileName, body, { upsert: true, contentType: isVideo ? file.type : 'image/webp' });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('businesses').getPublicUrl(fileName);
        if (target === 'logo') setLogoUrl(publicUrl);
        else {
          setMediaUrl(publicUrl);
          setMediaType(isVideo ? 'video' : 'image');
        }
        showToast('success', 'تم رفع الوسائط للسحابة بنجاح');
      } else if (!isVideo && fallbackBase64) {
        if (target === 'logo') setLogoUrl(fallbackBase64);
        else {
          setMediaUrl(fallbackBase64);
          setMediaType('image');
        }
        showToast('success', 'تم حفظ الصورة بنجاح');
      } else {
        throw uploadError;
      }
    } catch (err: any) {
      showToast('error', `فشل الرفع: ${err?.message || 'خطأ غير متوقع'}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveSponsor = async (desiredStatus?: boolean) => {
    const statusToSave = desiredStatus !== undefined ? desiredStatus : isActive;
    if (statusToSave && !advertiserName.trim() && !mediaUrl) {
      showToast('warning', 'يرجى كتابة اسم الراعي أو رفع صورة للبانر');
      return;
    }

    try {
      setSaving(true);
      const id =
        sponsorRecordId ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `sponsor_${Date.now()}`);

      const stylesData = {
        bgColor,
        accentColor,
        textColor,
        btnBgColor,
        btnTextColor,
        animationEffect,
        customHeight,
      };

      const targetUrl = getFinalTargetUrl();
      const normalizedTargets = targetSections.map(normalizeAdTargetSection);
      const firstSec = normalizedTargets[0] || 'all';
      const secObj = marketSectionOptions.find((m) => m.id === firstSec);

      const record: any = {
        id,
        placementId: secObj?.legacyPlacementId || 'home_sponsor',
        placementName: `راعي: ${normalizedTargets.map((s) => getDynamicSectionLabel(s, dynamicSections)).join('، ')}`,
        status: statusToSave ? 'active' : 'paused',
        adKind: 'sponsor',
        isSponsor: true,
        targetSections,
        slotKey: 'header_sponsor',
        priority,
        startDate,
        endDate,
        contractExpiry: endDate,
        advertiserName: advertiserName.trim(),
        sponsorTag: sponsorTag.trim() || 'الراعي الرسمي',
        title: title.trim(),
        headline: title.trim() || advertiserName.trim(),
        description: description.trim(),
        targetUrl,
        ctaText: ctaText.trim() || (linkType === 'whatsapp' ? 'تواصل واتساب' : 'زيارة الموقع'),
        logoUrl,
        mediaUrl,
        mediaType,
        showTag,
        showButton,
        showText,
        showAdInfo,
        styles: stylesData,
        bgColor,
        accentColor,
        textColor,
        btnBgColor,
        btnTextColor,
        animationEffect,
        customHeight,
        views: viewsCount,
        clicks: clicksCount,
        createdAt: new Date().toISOString(),
      };

      const ok = await adsDatabaseService.publishAd(record as ExtendedAdRecord);
      if (!ok) {
        showToast('error', 'فشل حفظ إعلان الراعي في قاعدة البيانات');
        return;
      }

      setSponsorRecordId(id);
      setIsActive(statusToSave);
      await loadSponsors(id);
      showToast(
        'success',
        statusToSave ? 'تم حفظ وتفعيل الراعي بنجاح' : 'تم حفظ الراعي وإيقافه مؤقتاً'
      );
    } catch (err: any) {
      showToast('error', `فشل الحفظ: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRowStatus = async (sp: ExtendedAdRecord) => {
    const next = sp.status === 'active' ? 'paused' : 'active';
    const ok = await adsDatabaseService.updateAdStatus(sp.id, next);
    if (ok) {
      if (sponsorRecordId === sp.id) setIsActive(next === 'active');
      await loadSponsors(sponsorRecordId || undefined);
      showToast('success', next === 'active' ? 'تم تفعيل الراعي' : 'تم إيقاف الراعي مؤقتاً');
    }
  };

  const handleDeleteSponsor = async (spId: string) => {
    const ok = await adsDatabaseService.deleteAd(spId);
    if (ok) {
      if (sponsorRecordId === spId) resetFormForNew();
      await loadSponsors();
      showToast('success', 'تم حذف إعلان الراعي بنجاح');
    } else {
      showToast('error', 'تعذر حذف إعلان الراعي');
    }
  };

  const filteredSponsors = sponsorsList.filter((sp) => {
    if (filterSection === 'all_filter') return true;
    const normFilter = normalizeAdTargetSection(filterSection);
    const secs = (sp.targetSections || ['all']).map(normalizeAdTargetSection);
    return secs.includes(normFilter) || secs.includes('all');
  });

  const bannerHeight = Math.min(Math.max(customHeight, 88), 160);

  return (
    <div dir="rtl" className="space-y-4 font-['Cairo',sans-serif] text-white p-2 sm:p-4 max-w-5xl mx-auto pb-16">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-300'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-300'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* شريط الرأس */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-[#0B0F17] border border-[#2F3336] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <NavLink
            to="/admin/ads"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] text-[#FFC500] hover:bg-[#2F3336] border border-[#2F3336] transition font-bold text-xs"
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>رجوع</span>
          </NavLink>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="text-[#FFC500]" size={15} />
              <span>إدارة رعاة الأقسام والأسواق</span>
            </h1>
            <p className="text-[10.5px] text-[#71767B]">
              تخصيص راعٍ أو عدة رعاة بالتناوب لكل قسم مع التحكم الكامل بالعناصر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFormForNew}
            className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>راعٍ جديد</span>
          </button>
          {sponsorRecordId && (
            <button
              type="button"
              onClick={() => handleSaveSponsor(!isActive)}
              disabled={saving}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <Power size={13} />
              <span>{isActive ? 'إيقاف الحالي' : 'تفعيل الحالي'}</span>
            </button>
          )}
        </div>
      </div>

      {/* قائمة الرعاة المسجلين */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Layers size={14} className="text-[#FFC500]" />
            <span>الرعاة المسجلون ({filteredSponsors.length})</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterSection('all_filter')}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border ${
                filterSection === 'all_filter'
                  ? 'bg-[#FFC500] text-black border-[#FFC500]'
                  : 'bg-[#161D2B] text-gray-300 border-[#2F3336]'
              }`}
            >
              الكل
            </button>
            {marketSectionOptions.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setFilterSection(sec.id)}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border ${
                  filterSection === sec.id
                    ? 'bg-[#FFC500] text-black border-[#FFC500]'
                    : 'bg-[#161D2B] text-gray-300 border-[#2F3336]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-[#71767B]">جارِ تحميل الرعاة...</div>
        ) : filteredSponsors.length === 0 ? (
          <div className="py-5 text-center text-xs text-[#71767B]">
            لا يوجد رعاة في هذا القسم بعد. أنشئ راعياً جديداً من النموذج بالأسفل.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSponsors.map((sp) => {
              const isSelected = sp.id === sponsorRecordId;
              const secs = (sp.targetSections || ['all']).map((s) => getDynamicSectionLabel(s, dynamicSections)).join('، ');
              return (
                <div
                  key={sp.id}
                  onClick={() => loadSponsorIntoForm(sp)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#161D2B] border-[#FFC500]'
                      : 'bg-black/60 border-[#2F3336] hover:border-white/30'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          sp.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {sp.advertiserName || sp.title || 'راعي بدون اسم'}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] font-bold shrink-0">
                        أولوية {sp.priority || 1}x
                      </span>
                    </div>
                    <div className="text-[10px] text-[#71767B] truncate">
                      الأقسام: <span className="text-gray-300">{secs}</span>
                    </div>
                    <div className="text-[10px] text-[#71767B] font-mono">
                      مشاهدات: {sp.views || 0} • نقرات: {sp.clicks || 0}
                      {sp.endDate ? ` • ينتهي: ${sp.endDate}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleToggleRowStatus(sp)}
                      className="p-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-gray-300 hover:text-[#FFC500]"
                      title={sp.status === 'active' ? 'إيقاف' : 'تفعيل'}
                    >
                      <Power size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSponsorIntoForm(sp)}
                      className="p-1.5 rounded-lg bg-[#FFC500]/10 border border-[#FFC500]/25 text-[#FFC500]"
                      title="تعديل"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSponsor(sp.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500 hover:text-white"
                      title="حذف"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* المعاينة الحية المطابقة لبنر جوجل 90° */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#2F3336]">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold text-[11px]">
            <Eye size={13} className="text-[#FFC500]" />
            <span>معاينة حية (مطابقة للظهور في رأس القسم تماماً):</span>
          </div>
          <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isActive ? '● نشط' : '○ متوقف'}
          </span>
        </div>

        <div
          className="relative w-full rounded-none overflow-hidden border-b-2"
          style={{
            backgroundColor: bgColor,
            borderColor: accentColor,
            minHeight: mediaUrl ? `${bannerHeight}px` : '52px',
          }}
        >
          {mediaUrl ? (
            <div className="relative w-full bg-[#0B101D] overflow-hidden" style={{ height: `${bannerHeight}px` }}>
              {mediaType === 'video' ? (
                <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
              )}
              <div
                className={`absolute inset-0 flex flex-col justify-between p-2 z-10 ${
                  showText || showButton || showTag ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  {showTag ? (
                    <span
                      style={{
                        backgroundColor: `${accentColor}25`,
                        color: accentColor,
                        borderColor: `${accentColor}50`,
                      }}
                      className="px-1.5 py-0.5 border text-[9px] font-black rounded-none flex items-center gap-1"
                    >
                      <Sparkles size={10} />
                      <span>{sponsorTag}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-1">
                    {showButton && (
                      <span
                        style={{ backgroundColor: btnBgColor, color: btnTextColor }}
                        className="text-[9px] font-black px-2.5 py-0.5 rounded-none flex items-center gap-1 shadow-md"
                      >
                        <span>{ctaText || 'زيارة'}</span>
                        <ExternalLink size={9} />
                      </span>
                    )}
                    {showAdInfo && (
                      <>
                        <span className="text-[8px] text-zinc-300 bg-black border border-white/15 px-1.5 py-0.5 rounded-none">
                          إعلان الراعي ⓘ
                        </span>
                        <span className="text-[8px] font-black text-zinc-100 bg-white/15 border border-white/25 px-1 py-0.5 rounded-none font-sans">
                          AD
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  {showText ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt="logo"
                          style={{ borderColor: accentColor }}
                          className="w-5 h-5 rounded-full object-cover border bg-black shrink-0"
                        />
                      )}
                      <h4 className="text-white text-[11px] sm:text-xs font-bold truncate drop-shadow-md">
                        {advertiserName || 'اسم الجهة الراعية'}
                      </h4>
                    </div>
                  ) : (
                    <span />
                  )}
                  {showText && title && (
                    <p style={{ color: textColor }} className="text-[10px] font-bold drop-shadow-md shrink-0">
                      {title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {showTag && (
                  <span style={{ color: accentColor, borderColor: accentColor }} className="px-1.5 py-0.5 text-[9px] font-bold border rounded-none flex items-center gap-1">
                    <Sparkles size={9} />
                    <span>{sponsorTag}</span>
                  </span>
                )}
                {showText && (
                  <span className="text-white text-xs font-bold truncate">
                    {advertiserName || 'اسم الجهة الراعية'}
                  </span>
                )}
              </div>
              {showButton && (
                <span style={{ backgroundColor: btnBgColor, color: btnTextColor }} className="text-[9px] font-black px-2 py-0.5 rounded-none flex items-center gap-0.5">
                  <span>{ctaText || 'زيارة'}</span>
                  <ExternalLink size={9} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* نموذج الإعداد والتعديل */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3 sm:p-4 space-y-4">
        {/* 1. اختيار الأقسام والجدولة والأولوية */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-[#FFC500] pb-1 border-b border-[#2F3336] flex items-center gap-1.5">
            <Layers size={13} />
            <span>1. الأقسام المستهدفة وفترة الرعاية والأولوية:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {marketSectionOptions.map((sec) => {
              const selected = targetSections.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => toggleSectionSelection(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-[#FFC500] text-black border-[#FFC500]'
                      : 'bg-[#161D2B] text-gray-300 border-[#2F3336] hover:border-white/40'
                  }`}
                >
                  {selected && <Check size={12} />}
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1 flex items-center gap-1">
                <Calendar size={11} /> <span>تاريخ البداية (اختياري)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs font-mono focus:outline-none focus:border-white caret-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1 flex items-center gap-1">
                <Calendar size={11} /> <span>تاريخ الانتهاء (اختياري)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs font-mono focus:outline-none focus:border-white caret-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">أولوية الظهور والتناوب</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs focus:outline-none focus:border-white"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. مفاتيح إظهار/إخفاء عناصر البانر */}
        <div className="space-y-2 pt-2 border-t border-[#2F3336]">
          <div className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
            <Sliders size={13} />
            <span>2. إظهار وإخفاء النصوص والأزرار فوق البانر:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: 'شارة الراعي', val: showTag, set: setShowTag },
              { label: 'زر الإجراء', val: showButton, set: setShowButton },
              { label: 'الاسم والشعار والعنوان', val: showText, set: setShowText },
              { label: 'علامة إعلان الراعي / AD', val: showAdInfo, set: setShowAdInfo },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`px-2.5 py-2 rounded-lg border text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                  item.val
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#161D2B] border-[#2F3336] text-gray-400'
                }`}
              >
                <span>{item.label}</span>
                <span>{item.val ? 'ظاهر' : 'مخفي'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. البيانات الأساسية */}
        <div className="space-y-2 pt-2 border-t border-[#2F3336]">
          <div className="text-xs font-bold text-gray-300">3. بيانات ونصوص الراعي:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">اسم الراعي / الشركة</label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="مثال: شركة سبأ فون"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white focus:outline-none focus:border-white caret-white text-xs"
              />
            </div>

            <div className="relative" ref={tagDropdownRef}>
              <label className="block text-[11px] text-gray-400 mb-1">عبارة الشارة</label>
              <button
                type="button"
                onClick={() => setOpenTagDropdown(!openTagDropdown)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs flex items-center justify-between"
              >
                <span>{sponsorTag}</span>
                <ChevronDown size={14} className="text-[#FFC500]" />
              </button>
              {openTagDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121824] border border-[#2D3748] rounded-xl shadow-2xl z-50 py-1 max-h-48 overflow-y-auto">
                  {SPONSOR_TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSponsorTag(tag);
                        setOpenTagDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-right text-xs flex items-center justify-between ${
                        sponsorTag === tag ? 'bg-[#FFC500]/15 text-[#FFC500] font-bold' : 'text-gray-200 hover:bg-[#1A2234]'
                      }`}
                    >
                      <span>{tag}</span>
                      {sponsorTag === tag && <Check size={13} className="text-[#FFC500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">عنوان مختصر</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: عروض حصرية لفترة محدودة"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white focus:outline-none focus:border-white caret-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">نص زر الإجراء</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="مثال: تواصل واتساب أو زيارة الموقع"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white focus:outline-none focus:border-white caret-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. توجيه الرابط */}
        <div className="space-y-2 pt-2 border-t border-[#2F3336]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">4. رابط الانتقال عند الضغط:</span>
            <div className="flex items-center gap-1 bg-[#161D2B] p-0.5 rounded-lg border border-[#2F3336]">
              <button
                type="button"
                onClick={() => {
                  setLinkType('whatsapp');
                  if (!ctaText || ctaText === 'زيارة الموقع') setCtaText('تواصل واتساب');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                  linkType === 'whatsapp' ? 'bg-[#16A34A] text-white' : 'text-gray-400'
                }`}
              >
                <MessageCircle size={12} />
                <span>واتساب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkType('website');
                  if (!ctaText || ctaText === 'تواصل واتساب') setCtaText('زيارة الموقع');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                  linkType === 'website' ? 'bg-[#FFC500] text-black' : 'text-gray-400'
                }`}
              >
                <Globe size={12} />
                <span>رابط موقع / صفحة</span>
              </button>
            </div>
          </div>

          {linkType === 'whatsapp' ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1.5 bg-[#161D2B] border border-[#2F3336] rounded-lg text-xs font-mono text-gray-300 dir-ltr">
                +967
              </span>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="77xxxxxxx"
                maxLength={9}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white font-mono text-sm focus:outline-none focus:border-white caret-white text-left dir-ltr"
              />
            </div>
          ) : (
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com أو /businesses/slug"
              className="w-full px-3 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs focus:outline-none focus:border-white caret-white text-left dir-ltr"
            />
          )}
        </div>

        {/* 5. الوسائط */}
        <div className="pt-2 border-t border-[#2F3336] space-y-2">
          <label className="block text-[11px] text-gray-300 font-bold">5. شعار الراعي وصورة/فيديو البانر:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="relative">
              <input ref={logoGalleryRef} type="file" accept="image/*" onChange={(e) => handlePhoneFileUpload(e, 'logo', 'image')} className="hidden" />
              <div
                onClick={() => logoGalleryRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-[#161D2B] border border-dashed border-[#FFC500] cursor-pointer text-center"
              >
                <ImageIcon size={16} className="text-[#FFC500]" />
                <span className="text-[10.5px] font-bold text-white">
                  {logoUrl ? 'تغيير شعار الراعي' : 'رفع شعار الراعي'}
                </span>
              </div>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl('')} className="absolute top-1.5 left-1.5 p-1 rounded bg-rose-500/20 text-rose-400">
                  <Trash2 size={11} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <input ref={mediaGalleryRef} type="file" accept="image/*" onChange={(e) => handlePhoneFileUpload(e, 'media', 'image')} className="hidden" />
              <input ref={mediaVideoRef} type="file" accept="video/*" onChange={(e) => handlePhoneFileUpload(e, 'media', 'video')} className="hidden" />
              <div className="grid grid-cols-2 gap-1.5">
                <div onClick={() => mediaGalleryRef.current?.click()} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#161D2B] border border-dashed border-[#FFC500] cursor-pointer text-center">
                  <ImageIcon size={15} className="text-[#FFC500]" />
                  <span className="text-[10px] font-bold text-white">صورة البانر</span>
                </div>
                <div onClick={() => mediaVideoRef.current?.click()} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#161D2B] border border-dashed border-[#FFC500] cursor-pointer text-center">
                  <Film size={15} className="text-[#FFC500]" />
                  <span className="text-[10px] font-bold text-white">فيديو البانر</span>
                </div>
              </div>
              {mediaUrl && (
                <div className="flex items-center justify-between p-1 rounded-lg bg-[#161D2B] border border-[#2F3336] text-[10px]">
                  <span className="text-emerald-400 font-bold">تم اختيار {mediaType === 'video' ? 'الفيديو' : 'الصورة'}</span>
                  <button type="button" onClick={() => setMediaUrl('')} className="p-1 text-rose-400">
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. الألوان والارتفاع والحركة */}
        <div className="pt-2 border-t border-[#2F3336] space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            {[
              { label: 'لون الزر', val: btnBgColor, set: setBtnBgColor },
              { label: 'نص الزر', val: btnTextColor, set: setBtnTextColor },
              { label: 'لون العنوان', val: textColor, set: setTextColor },
              { label: 'لون الإطار', val: accentColor, set: setAccentColor },
            ].map((cItem) => (
              <div key={cItem.label} className="p-1.5 bg-[#161D2B] rounded-lg border border-[#2F3336] flex items-center justify-between">
                <span className="text-white font-bold">{cItem.label}</span>
                <input type="color" value={cItem.val} onChange={(e) => cItem.set(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="relative" ref={animDropdownRef}>
              <label className="block text-[10px] text-gray-400 mb-1">الحركة البصرية</label>
              <button
                type="button"
                onClick={() => setOpenAnimDropdown(!openAnimDropdown)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#2F3336] text-white text-xs flex items-center justify-between"
              >
                <span>{ANIMATION_OPTIONS.find((o) => o.id === animationEffect)?.label || 'بدون حركة'}</span>
                <ChevronDown size={13} className="text-[#FFC500]" />
              </button>
              {openAnimDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121824] border border-[#2D3748] rounded-xl shadow-2xl z-50 py-1">
                  {ANIMATION_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAnimationEffect(item.id as any);
                        setOpenAnimDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-right text-xs flex items-center justify-between ${
                        animationEffect === item.id ? 'bg-[#FFC500]/15 text-[#FFC500] font-bold' : 'text-gray-200 hover:bg-[#1A2234]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {animationEffect === item.id && <Check size={13} className="text-[#FFC500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>ارتفاع بانر الراعي</span>
                <span className="font-mono text-[#FFC500]">{customHeight}px</span>
              </div>
              <input
                type="range"
                min={88}
                max={160}
                step={4}
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-full accent-[#FFC500] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveSponsor(true)}
            disabled={saving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'جارِ الحفظ...' : sponsorRecordId ? 'حفظ تعديلات الراعي وتفعيله' : 'إضافة وتفعيل الراعي'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveSponsor(false)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#161D2B] border border-[#2F3336] text-gray-300 hover:text-white font-bold text-xs cursor-pointer"
          >
            حفظ كمتوقف
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorManager;
