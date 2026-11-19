import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, ImagePlus, Trash2, Search, Maximize2, BedDouble } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { PropertyCard } from '../properties/PropertyCard';
import { YRSelect } from '../common/YRSelect';
import { BadgeType } from '../common/VerifiedBadge';
import { getMyBusinessPage, mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import { XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard,
  XMarketDetailView, XImageLightbox, XLinkedAccountCard,
  YEMEN_GOV_FILTER_OPTIONS, YEMEN_GOV_FORM_OPTIONS, XToast, XToastState, toArabicMarketError } from '../common/XMarketUI';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'جميع المحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'حجة', label: 'حجة' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'الضالع', label: 'الضالع' },
  { value: 'ريمة', label: 'ريمة' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'سقطرى', label: 'سقطرى' },
  { value: 'الجوف', label: 'الجوف' }
];

const PROPERTY_TYPES = [
  { value: 'all', label: 'كافة الأنواع' },
  { value: 'شقة', label: 'شقق' },
  { value: 'فيلا', label: 'فلل' },
  { value: 'أرض', label: 'أراضي' },
  { value: 'محل تجاري', label: 'محلات تجارية' },
  { value: 'عمارة', label: 'عمائر' },
  { value: 'مستودع', label: 'مستودعات' }
];

const CURRENCIES = [
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' }
];

export const RealEstatePage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({ onBack, embedded = false }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'بيع' | 'إيجار'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // نافذة أضف عقار
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDealType, setNewDealType] = useState<'بيع' | 'إيجار'>('بيع');
  const [newPropertyType, setNewPropertyType] = useState('شقة');
  const [newCity, setNewCity] = useState('صنعاء');
  const [newPrice, setNewPrice] = useState('');
  const [newCurrency, setNewCurrency] = useState('YER');
  const [newArea, setNewArea] = useState('');
  const [newRooms, setNewRooms] = useState('');
  const [newLocationDetails, setNewLocationDetails] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [agreedToCommission, setAgreedToCommission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<XToastState | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success', ms = 3500) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), ms);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: bizData }, { data: profData }] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').limit(200),
        supabase.from('profiles').select('id, full_name, avatar_url, phone, email').limit(200),
      ]);
      if (error) throw error;
      if (bizData) setBusinessesList(bizData.map(mapBusinessToPage));
      if (profData) {
        const pm: Record<string, any> = {};
        profData.forEach((x: any) => { if (x?.id) pm[x.id] = x; });
        setProfilesMap(pm);
      }
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id; if (!uid) return;
      const [{ data: prof }, biz] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        getMyBusinessPage(uid),
      ]);
      if (prof) setMyProfile(prof);
      if (biz) {
        setMyBusinessPage(biz);
        if (biz.phone) setOwnerPhone(biz.phone.replace(/\D/g, '').slice(-9));
        if (biz.city) setNewCity(biz.city);
      } else if (prof?.phone) {
        setOwnerPhone(prof.phone.replace(/\D/g, '').slice(-9));
      }
    }).catch(() => {});
  }, []);

  const handleOpenAddModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      showToast('يجب تسجيل الدخول إلى حسابك أولاً لتتمكن من إضافة عقار جديد', 'error', 4000);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const rem = 6 - uploadedImages.length;
    if (rem <= 0) { setFormError('الحد الأقصى 6 صور فقط'); showToast('الحد الأقصى 6 صور فقط', 'error', 3000); return; }
    Array.from(files).slice(0, rem).forEach((file) => {
      const r = new FileReader();
      r.onloadend = () => {
        if (typeof r.result !== 'string') return;
        const img = new Image();
        img.onload = () => {
          const cv = document.createElement('canvas');
          const M = 1000; let w = img.width, h = img.height;
          if (w > h && w > M) { h = Math.round(h * M / w); w = M; }
          else if (h > M) { w = Math.round(w * M / h); h = M; }
          cv.width = w; cv.height = h;
          cv.getContext('2d')?.drawImage(img, 0, 0, w, h);
          setUploadedImages((prev) => prev.length < 6 ? [...prev, cv.toDataURL('image/jpeg', 0.72)] : prev);
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setOwnerPhone(numeric);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    if (!newTitle.trim()) { setFormError('يرجى كتابة عنوان العقار'); showToast('يرجى كتابة عنوان العقار', 'error', 3500); return; }
    if (!agreedToCommission) { setFormError('يرجى الموافقة على عمولة الوساطة أولاً'); showToast('يرجى الموافقة على عمولة الوساطة أولاً', 'error', 3500); return; }

    const effPh = ownerPhone.trim() || (myBusinessPage?.phone || myProfile?.phone || '').replace(/\D/g, '').slice(-9);
    if (effPh.length !== 9) {
      setFormError('يرجى إدخال رقم هاتف مكون من 9 أرقام بالضبط');
      showToast('يرجى إدخال رقم هاتف مكون من 9 أرقام بالضبط', 'error', 3500);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      showToast('يجب تسجيل الدخول أولاً لإرسال العقار', 'error', 3500);
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        owner_user_id: session.user.id,
        business_id: myBusinessPage?.id || null,
        title: newTitle.trim(),
        listing_type: newDealType === 'بيع' ? 'SALE' : 'RENT',
        property_type: newPropertyType,
        city: newCity,
        district: newLocationDetails.trim() || newCity,
        price: parseFloat(newPrice) || 0,
        currency: newCurrency,
        area_sqm: parseFloat(newArea) || 0,
        bedrooms: parseInt(newRooms) || 0,
        image_urls: uploadedImages,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('properties').insert([payload]);
      if (error) throw error;

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewPrice('');
      setNewArea('');
      setNewRooms('');
      setNewLocationDetails('');
      setOwnerPhone('');
      setUploadedImages([]);
      setAgreedToCommission(false);
      showToast('تم إرسال العقار بنجاح وتوثيق الصور', 'success', 4000);
      fetchProperties();
    } catch (err: any) {
      const arMsg = toArabicMarketError(err, 'حدث خطأ أثناء إرسال العقار');
      setFormError(arMsg);
      showToast(arMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const rawDeal = prop.deal_type || prop.dealType || prop.listing_type;
    const dealType = rawDeal === 'SALE' ? 'بيع' : rawDeal === 'RENT' ? 'إيجار' : rawDeal;
    const propType = prop.property_type || prop.propertyType;

    const matchDeal = dealTypeFilter === 'all' || dealType === dealTypeFilter;
    const matchType = typeFilter === 'all' || propType === typeFilter;
    const matchCity = cityFilter === 'all' || (prop.city && prop.city.includes(cityFilter));
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || (prop.title || '').toLowerCase().includes(q) || (prop.city || '').toLowerCase().includes(q) || (propType || '').toLowerCase().includes(q);

    return matchDeal && matchType && matchCity && matchSearch;
  });

  const toPropX = (prop: any): XMarketItem => {
    const ownerUid = prop.owner_user_id || prop.owner_id;
    const biz = businessesList.find((b) =>
      (prop.business_id && b.id === prop.business_id) ||
      (ownerUid && b.ownerId === ownerUid)) || null;
    const prof = ownerUid ? profilesMap[ownerUid] : null;
    const pt = prop.property_type || prop.propertyType || 'عقار';
    const rawDt = prop.deal_type || prop.dealType || prop.listing_type;
    const dt = rawDt === 'SALE' ? 'بيع' : rawDt === 'RENT' ? 'إيجار' : (rawDt || 'متاح');
    return {
      id: prop.id, detailPath: `/properties/${prop.id}`, actionLabel: 'التفاصيل',
      onAction: () => { const it = toPropX(prop); setSelectedItem(it); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: 'instant' }); },
      authorName: biz?.name || prof?.full_name || `${pt} (${dt})`,
      authorUsername: biz?.username || (prof?.email ? prof.email.split('@')[0] : (prop.city || 'realestate')),
      authorAvatar: biz?.avatarUrl || prof?.avatar_url || '',
      badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none',
      businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
      createdAt: prop.created_at, title: prop.title,
      priceText: prop.price ? `${Number(prop.price).toLocaleString()} ${prop.currency || 'YER'}` : 'عند المعاينة',
      description: prop.district || prop.description || prop.location_details || '',
      metaParts: [`${pt} · ${dt}`, (prop.area_sqm || prop.area_m2 || prop.area) ? `${prop.area_sqm || prop.area_m2 || prop.area} م²` : '',
        (prop.bedrooms || prop.rooms) ? `${prop.bedrooms || prop.rooms} غرف` : '', prop.city || ''].filter(Boolean),
      tagLabel: `${pt} · ${dt}`,
      images: Array.isArray(prop.image_urls) ? prop.image_urls : (Array.isArray(prop.images) ? prop.images : []),
      city: prop.city, phone: biz?.phone || prof?.phone || '',
    };
  };
  const onShareX = (it: XMarketItem) => {
    navigator.clipboard?.writeText(it.title);
    showToast('تم نسخ التفاصيل', 'success', 2500);
  };
  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Tahoma'] text-white bg-black min-h-screen"}>
      {!embedded && !selectedItem && <AdBanner placementId="5" className="mb-1" />}

      <XToast toast={toastMessage} />

      {!embedded && !selectedItem && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F3336] pb-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-[#000000] border border-[#2F3336] text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all"
              >
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-[#F5C400]" />
              <h1 className="text-lg sm:text-xl font-black text-white">سوق العقارات المعتمد</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs transition-colors shadow-md"
            >
              <Plus size={15} />
              <span>أضف عقار</span>
            </button>

            <button
              onClick={fetchProperties}
              disabled={loading}
              className="p-2 bg-[#000000] border border-[#2F3336] text-slate-300 hover:text-white rounded-xl transition-colors"
              title="تحديث"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
            </button>
          </div>
        </div>
      )}

      {selectedItem ? <XMarketDetailView item={selectedItem} activeImageIndex={activeImageIndex} onChangeImageIndex={setActiveImageIndex} onBack={() => setSelectedItem(null)} onOpenLightbox={() => setIsLightboxOpen(true)} onShare={() => onShareX(selectedItem)} /> : (<>
      {/* الرأس الموحد: بحث + أيقونة الفلتر يساراً مثل سوق الهواتف */}
      <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#000000] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
        <XSearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="ابحث عن عقار، حي، أو مدينة..." activeFiltersCount={(dealTypeFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0)} onOpenFilter={() => setIsFilterModalOpen(true)} />
        {embedded && <AdBanner placementId="5" className="py-0.5" />}
      </div>

      {/* المحتوى بأسلوب تغريدات X */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#FFC500] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري تحميل العقارات...</span>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
          <AlertCircle className="w-9 h-9 text-[#FFC500] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-white">لا توجد عقارات معروضة حالياً</h3>
          <p className="text-xs">اضغط على زر + لإضافة عقار جديد.</p>
        </div>
      ) : embedded ? (
        <div className="divide-y divide-[#2F3336]/60">{filteredProperties.map((prop) => { const item = toPropX(prop); return <XMarketTweetCard key={prop.id} item={item} onOpenDetail={() => { setSelectedItem(item); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: "instant" }); }} onOpenImage={(idx) => { setSelectedItem(item); setActiveImageIndex(idx); setIsLightboxOpen(true); }} onShare={() => onShareX(item)} />; })}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={{ ...prop, deal_type: prop.deal_type || (prop.listing_type === 'SALE' ? 'بيع' : prop.listing_type === 'RENT' ? 'إيجار' : prop.listing_type), area_m2: prop.area_m2 ?? prop.area_sqm, rooms: prop.rooms ?? prop.bedrooms, images: prop.images ?? prop.image_urls }} />
          ))}
        </div>
      )}

      </>)}
      {embedded && !selectedItem && !isAddModalOpen && (
        <button
          onClick={handleOpenAddModal}
          className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition"
          title="أضف عقار"
        >
          <Plus size={24} className="stroke-[2.2]" />
        </button>
      )}

      {/* نافذة أضف عقار */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden font-['Tahoma',sans-serif] text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2F3336]/60 shrink-0">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition">
                <X size={18} />
              </button>
              <span className="text-[13px] font-bold text-[#71767B]">إضافة عقار جديد</span>
              <span className="w-7" />
            </div>

            <form onSubmit={handleAddProperty} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(myBusinessPage || myProfile) && <XLinkedAccountCard name={myBusinessPage?.name || myProfile?.full_name || "حسابك"} username={myBusinessPage?.username || (myProfile?.email ? myProfile.email.split("@")[0] : "account")} avatarUrl={myBusinessPage?.avatarUrl || myProfile?.avatar_url} badgeType={myBusinessPage ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? "gold" : "none")) : "none"} label={myBusinessPage ? "صفحة المنشأة" : "حسابك"} />}
              {formError && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs">{formError}</div>}
              <div>
                <label className="text-[11px] text-[#F5C400] block mb-1 font-bold">نوع المعاملة *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDealType('بيع')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newDealType === 'بيع' ? 'bg-white text-black border-white' : 'bg-black text-slate-300 border-[#2F3336]'
                    }`}
                  >
                    للبيع
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDealType('إيجار')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newDealType === 'إيجار' ? 'bg-white text-black border-white' : 'bg-black text-slate-300 border-[#2F3336]'
                    }`}
                  >
                    للإيجار
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white mb-1">عنوان العقار *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: شقة سوبر ديلوكس في حي حدة"
                  className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white"
                />
              </div>

              {/* قسم رفع الصور من الهاتف (1 إلى 6 صور) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white font-bold flex items-center gap-1">
                    <ImagePlus size={14} className="text-[#F5C400]" />
                    <span>صور العقار من الهاتف (من 1 إلى 6 صور)</span>
                  </label>
                  <span className="text-[10px] text-[#F5C400] font-bold">
                    {uploadedImages.length} من 6
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImagesUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedImages.length >= 6}
                  className="w-full py-2.5 border border-dashed border-[#2F3336] hover:border-white rounded-xl bg-black text-white flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <ImagePlus size={16} className="text-[#F5C400]" />
                  <span>{uploadedImages.length >= 6 ? 'تم بلوغ الحد الأقصى (6 صور)' : 'اضغط لاختيار الصور من استوديو الجوال'}</span>
                </button>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-[#2F3336] bg-black">
                        <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 left-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white mb-1">نوع العقار *</label>
                  <YRSelect
                    value={newPropertyType}
                    options={PROPERTY_TYPES.filter((t) => t.value !== 'all')}
                    onChange={(val) => setNewPropertyType(val)}
                  />
                </div>
                <div>
                  <label className="block text-white mb-1">المحافظة *</label>
                  <YRSelect
                    value={newCity}
                    options={YEMEN_GOVERNORATES.filter((g) => g.value !== 'all')}
                    onChange={(val) => setNewCity(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white mb-1">السعر *</label>
                  <input
                    required
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-1">العملة *</label>
                  <YRSelect
                    value={newCurrency}
                    options={CURRENCIES}
                    onChange={(val) => setNewCurrency(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={newRooms}
                    onChange={(e) => setNewRooms(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-1">
                  رقم الهاتف (واتساب) * <span className="text-[#F5C400] text-[10px]">(9 أرقام بالضبط)</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={9}
                  value={ownerPhone}
                  onChange={handlePhoneChange}
                  placeholder="77XXXXXXX"
                  className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white text-left font-mono focus:outline-none focus:border-white caret-white"
                />
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  تم إدخال: {ownerPhone.length} من 9 أرقام
                </span>
              </div>

              <div>
                <label className="block text-white mb-1">تفاصيل الحي أو الشارع</label>
                <input
                  type="text"
                  value={newLocationDetails}
                  onChange={(e) => setNewLocationDetails(e.target.value)}
                  placeholder="مثال: خلف مجمع حدة السكني"
                  className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white"
                />
              </div>

              {/* الإقرار الأخضر الشفاف بالنص الأصلي الإلزامي */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>تنبيه وساطة يمن ريتغ:</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed">
                  تطبق المنصة عمولة الوساطة المعتمدة عند إتمام المعاملة العقارية عبر وساطة المنصة.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToCommission}
                    onChange={(e) => setAgreedToCommission(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">أوافق على شروط وسياسة وساطة يمن ريتغ</span>
                </label>
              </div>

              {formError && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs">{formError}</div>}
              <div className="flex justify-end gap-2 pt-1 border-t border-[#2F3336]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black border border-[#2F3336] text-white text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToCommission || ownerPhone.length !== 9 || submitting}
                  className="px-5 py-2 rounded-xl bg-[#FFC500] disabled:opacity-40 text-black font-bold text-xs rounded-full transition-colors shadow-md"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال العقار للاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <XImageLightbox isOpen={isLightboxOpen} item={selectedItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <XFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="تصفية العقارات" activeFiltersCount={(dealTypeFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0)} onReset={() => { setDealTypeFilter('all'); setTypeFilter('all'); setCityFilter('all'); }} resultsCount={filteredProperties.length} fields={[
        { label: 'نوع المعاملة', value: dealTypeFilter, onChange: (v) => setDealTypeFilter(v as any), options: [{ value: 'all', label: 'الكل (بيع وإيجار)' }, { value: 'بيع', label: 'للبيع' }, { value: 'إيجار', label: 'للإيجار' }] },
        { label: 'نوع العقار', value: typeFilter, onChange: setTypeFilter, options: PROPERTY_TYPES },
        { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
      ]} />
    </div>
  );
};
