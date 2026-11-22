import React, { useState, useEffect, useRef, useMemo } from 'react';
import { XSpinner } from '../ui/LoadingSpinner';
import { Building, ArrowRight, RefreshCw, AlertCircle, Plus, ShieldCheck, X, ImagePlus, Trash2, MapPin, Video, FileImage } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { MarketSponsorSlot } from '../ads/MarketSponsorSlot';
import { PropertyCard } from '../properties/PropertyCard';
import { YRSelect } from '../common/YRSelect';
import { BadgeType } from '../common/VerifiedBadge';
import { getMyBusinessPage, mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import {
  XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard,
  XMarketDetailView, XImageLightbox, XLinkedAccountCard,
  YEMEN_GOV_FILTER_OPTIONS, XToast, XToastState, toArabicMarketError
} from '../common/XMarketUI';
import {
  NOT_AVAILABLE, RE_PROPERTY_TYPES, RE_GOVERNORATES,
  getCityOptions, getDistrictOptions, getNeighborhoodOptions,
  RE_AREA_OPTIONS, RE_COUNT_1_20, RE_COUNT_1_10, RE_COUNT_1_5,
  RE_FLOOR_NUM_OPTIONS, RE_AGE_OPTIONS, RE_STATUS_OPTIONS, RE_FINISHING_OPTIONS,
  RE_CONSTRUCTION_OPTIONS, RE_ELECTRICITY_OPTIONS, RE_WATER_OPTIONS, RE_PARKING_OPTIONS,
  RE_GARDEN_OPTIONS, RE_ELEVATOR_OPTIONS, RE_AC_OPTIONS, RE_SEWAGE_OPTIONS,
  RE_INTERNET_OPTIONS, RE_STREET_TYPE_OPTIONS, RE_STREET_WIDTH_OPTIONS,
  RE_FACADES_COUNT_OPTIONS, RE_FACING_DIR_OPTIONS, RE_LAND_NATURE_OPTIONS,
  RE_INSTALLMENT_OPTIONS, RE_OWNERSHIP_OPTIONS, RE_DOC_TYPE_OPTIONS, RE_DOC_STATUS_OPTIONS,
  RE_NEGOTIABLE_OPTIONS, RE_VIEWING_OPTIONS, RE_SHOP_ACTIVITY_OPTIONS, RE_OFFICE_USE_OPTIONS,
  getVisibleRealEstateFields, buildPropertyFeatures, parsePropertyFeatures
} from '../../constants/realEstateOptions';

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
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [minRoomsFilter, setMinRoomsFilter] = useState('all');
  const [finishingFilter, setFinishingFilter] = useState('all');
  const fmtAmt = (v: string) => {
    const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (!embedded) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [embedded]);
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<XToastState | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success', ms = 3500) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), ms);
  };

  // نافذة إضافة عقار
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDealType, setNewDealType] = useState<'بيع' | 'إيجار'>('بيع');
  const [newPropertyType, setNewPropertyType] = useState('شقة');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCurrency, setNewCurrency] = useState('YER');

  // الموقع (قوائم منسدلة)
  const [newGov, setNewGov] = useState('صنعاء');
  const [newCity, setNewCity] = useState('أمانة العاصمة');
  const [newDistrict, setNewDistrict] = useState('السبعين');
  const [newNeighborhood, setNewNeighborhood] = useState('حدة');

  // مواصفات العقار (قوائم منسدلة)
  const [newArea, setNewArea] = useState('160');
  const [newRooms, setNewRooms] = useState('4');
  const [newBedrooms, setNewBedrooms] = useState('3');
  const [newBathrooms, setNewBathrooms] = useState('2');
  const [newKitchens, setNewKitchens] = useState('1');
  const [newFloorsCount, setNewFloorsCount] = useState('2');
  const [newFloorNum, setNewFloorNum] = useState('الأول');
  const [newAge, setNewAge] = useState('جديد (أقل من سنة)');
  const [newCondition, setNewCondition] = useState('جديد');
  const [newFinishing, setNewFinishing] = useState('سوبر ديلوكس');
  const [newConstruction, setNewConstruction] = useState('مسلح');
  const [newApartmentsCount, setNewApartmentsCount] = useState('4');
  const [newShopsCount, setNewShopsCount] = useState('2');
  const [newShopActivity, setNewShopActivity] = useState('تجاري عام');
  const [newOfficeUse, setNewOfficeUse] = useState('مكتب إداري');

  // الخدمات والمرافق (قوائم منسدلة)
  const [newElectricity, setNewElectricity] = useState('منظومة شمسية');
  const [newWater, setNewWater] = useState('شبكة');
  const [newParking, setNewParking] = useState('متوفر');
  const [newGarden, setNewGarden] = useState(NOT_AVAILABLE);
  const [newElevator, setNewElevator] = useState('متوفر');
  const [newAc, setNewAc] = useState(NOT_AVAILABLE);
  const [newSewage, setNewSewage] = useState('شبكة صرف صحي');
  const [newInternet, setNewInternet] = useState('ألياف بصرية');

  // تفاصيل الأرض والعقار
  const [newStreetType, setNewStreetType] = useState('رئيسي');
  const [newStreetWidth, setNewStreetWidth] = useState('12 متر');
  const [newFacadesCount, setNewFacadesCount] = useState('واجهة واحدة');
  const [newFacingDir, setNewFacingDir] = useState('جنوب');
  const [newLandNature, setNewLandNature] = useState('مستوية');
  const [newInstallment, setNewInstallment] = useState('غير متاح');

  // الملكية والوثائق
  const [newOwnership, setNewOwnership] = useState('ملك حر');
  const [newDocType, setNewDocType] = useState('بصيرة');
  const [newDocStatus, setNewDocStatus] = useState('مكتملة');

  // المعاينة والتفاوض
  const [newNegotiable, setNewNegotiable] = useState('نعم');
  const [newViewing, setNewViewing] = useState('متاحة');

  // التواصل والمرفقات
  const [ownerPhone, setOwnerPhone] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [blueprintImage, setBlueprintImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [locatingMap, setLocatingMap] = useState(false);
  const [agreedToCommission, setAgreedToCommission] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blueprintInputRef = useRef<HTMLInputElement | null>(null);

  const visibleFields = useMemo(() => getVisibleRealEstateFields(newPropertyType), [newPropertyType]);
  const cityOptions = useMemo(() => getCityOptions(newGov), [newGov]);
  const districtOptions = useMemo(() => getDistrictOptions(newGov), [newGov]);
  const neighborhoodOptions = useMemo(() => getNeighborhoodOptions(newGov), [newGov]);

  const handleGovChange = (gov: string) => {
    setNewGov(gov);
    setNewCity(getCityOptions(gov)[0]?.value || gov);
    setNewDistrict(getDistrictOptions(gov)[0]?.value || NOT_AVAILABLE);
    setNewNeighborhood(getNeighborhoodOptions(gov)[0]?.value || NOT_AVAILABLE);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: bizData }, { data: profData }] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').limit(200),
        supabase.from('profiles').select('id, full_name, username, avatar_url, phone, email').limit(200),
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
      const meta: any = session.user.user_metadata || {};
      const mergedProf = {
        ...(prof || { id: uid }),
        full_name: prof?.full_name || meta.full_name || meta.name || '',
        username: prof?.username || meta.username || meta.user_name || (session.user.email ? session.user.email.split('@')[0] : ''),
        avatar_url: prof?.avatar_url || meta.avatar_url || '',
        phone: prof?.phone || meta.phone || '',
      };
      setMyProfile(mergedProf);
      if (biz) {
        setMyBusinessPage(biz);
        const bPh = (biz.phone || mergedProf.phone || '').replace(/\D/g, '').slice(-9);
        if (bPh) setOwnerPhone(bPh);
        if (biz.city) handleGovChange(biz.city);
      } else if (mergedProf.phone) {
        setOwnerPhone(mergedProf.phone.replace(/\D/g, '').slice(-9));
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

  const compressToDataUrl = (file: File, cb: (dataUrl: string) => void) => {
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
        cb(cv.toDataURL('image/jpeg', 0.72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const rem = 6 - uploadedImages.length;
    if (rem <= 0) { setFormError('الحد الأقصى 6 صور فقط'); showToast('الحد الأقصى 6 صور فقط', 'error', 3000); return; }
    Array.from(files).slice(0, rem).forEach((file) => {
      compressToDataUrl(file, (url) => setUploadedImages((prev) => prev.length < 6 ? [...prev, url] : prev));
    });
  };

  const handleBlueprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    compressToDataUrl(file, (url) => setBlueprintImage(url));
  };

  const handleLocateOnMap = () => {
    if (!navigator.geolocation) {
      showToast('المتصفح لا يدعم تحديد الموقع الجغرافي', 'error', 3500);
      return;
    }
    setLocatingMap(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setMapUrl(url);
        setLocatingMap(false);
        showToast('تم تحديد موقع العقار على الخريطة', 'success', 2500);
      },
      () => {
        setLocatingMap(false);
        showToast('تعذر الوصول للموقع، تأكد من تفعيل GPS', 'error', 3500);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const removeImage = (index: number) => setUploadedImages((prev) => prev.filter((_, i) => i !== index));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
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

    const v = visibleFields;
    const featuresArr = buildPropertyFeatures([
      ['العرض', newDealType === 'بيع' ? 'للبيع' : 'للإيجار'],
      ['النوع', newPropertyType],
      ['المحافظة', newGov],
      ['المدينة', newCity],
      ['المديرية', newDistrict],
      ['الحي', newNeighborhood],
      ['المساحة', v.has('area') && newArea !== NOT_AVAILABLE ? `${newArea} م²` : NOT_AVAILABLE],
      ['الغرف', v.has('rooms') ? newRooms : NOT_AVAILABLE],
      ['غرف النوم', v.has('bedrooms') ? newBedrooms : NOT_AVAILABLE],
      ['الحمامات', v.has('bathrooms') ? newBathrooms : NOT_AVAILABLE],
      ['المطابخ', v.has('kitchens') ? newKitchens : NOT_AVAILABLE],
      ['عدد الطوابق', v.has('floorsCount') ? newFloorsCount : NOT_AVAILABLE],
      ['رقم الطابق', v.has('floorNum') ? newFloorNum : NOT_AVAILABLE],
      ['عدد الشقق', v.has('apartmentsCount') ? newApartmentsCount : NOT_AVAILABLE],
      ['عدد المحلات', v.has('shopsCount') ? newShopsCount : NOT_AVAILABLE],
      ['النشاط', v.has('shopActivity') ? newShopActivity : NOT_AVAILABLE],
      ['الاستخدام', v.has('officeUse') ? newOfficeUse : NOT_AVAILABLE],
      ['عمر العقار', v.has('age') ? newAge : NOT_AVAILABLE],
      ['الحالة', v.has('propCondition') ? newCondition : NOT_AVAILABLE],
      ['التشطيب', v.has('finishing') ? newFinishing : NOT_AVAILABLE],
      ['نوع البناء', v.has('construction') ? newConstruction : NOT_AVAILABLE],
      ['الكهرباء', v.has('electricity') ? newElectricity : NOT_AVAILABLE],
      ['المياه', v.has('water') ? newWater : NOT_AVAILABLE],
      ['موقف سيارات', v.has('parking') ? newParking : NOT_AVAILABLE],
      ['حديقة', v.has('garden') ? newGarden : NOT_AVAILABLE],
      ['مصعد', v.has('elevator') ? newElevator : NOT_AVAILABLE],
      ['تكييف', v.has('ac') ? newAc : NOT_AVAILABLE],
      ['الصرف الصحي', v.has('sewage') ? newSewage : NOT_AVAILABLE],
      ['الإنترنت', v.has('internet') ? newInternet : NOT_AVAILABLE],
      ['نوع الشارع', v.has('streetType') ? newStreetType : NOT_AVAILABLE],
      ['عرض الشارع', v.has('streetWidth') ? newStreetWidth : NOT_AVAILABLE],
      ['الواجهات', v.has('facadesCount') ? newFacadesCount : NOT_AVAILABLE],
      ['اتجاه الواجهة', v.has('facingDir') ? newFacingDir : NOT_AVAILABLE],
      ['طبيعة الأرض', v.has('landNature') ? newLandNature : NOT_AVAILABLE],
      ['التقسيط', v.has('installment') ? newInstallment : NOT_AVAILABLE],
      ['الملكية', v.has('ownership') ? newOwnership : NOT_AVAILABLE],
      ['الوثيقة', v.has('docType') ? newDocType : NOT_AVAILABLE],
      ['حالة الوثائق', v.has('docStatus') ? newDocStatus : NOT_AVAILABLE],
      ['التفاوض', v.has('negotiable') ? newNegotiable : NOT_AVAILABLE],
      ['المعاينة', v.has('viewing') ? newViewing : NOT_AVAILABLE],
      ['__MAP_URL__', mapUrl],
      ['__BLUEPRINT__', blueprintImage],
      ['__VIDEO_URL__', videoUrl.trim()],
      ['__OWNER_NAME__', (myBusinessPage?.name || myProfile?.full_name || (session.user.user_metadata as any)?.full_name || '').trim()],
      ['__OWNER_PHONE__', effPh],
    ]);

    const districtParts = [newCity, newDistrict, newNeighborhood].filter((x) => x && x !== NOT_AVAILABLE);
    const districtText = newDescription.trim() || districtParts.join(' · ') || newGov;

    try {
      setSubmitting(true);
      const payload: any = {
        owner_user_id: session.user.id,
        business_id: myBusinessPage?.id || null,
        title: newTitle.trim(),
        listing_type: newDealType === 'بيع' ? 'SALE' : 'RENT',
        property_type: newPropertyType,
        city: newGov,
        district: districtText,
        price: parseFloat(newPrice.replace(/,/g, '')) || 0,
        currency: newCurrency,
        area_sqm: newArea !== NOT_AVAILABLE ? (parseFloat(newArea) || 0) : 0,
        bedrooms: v.has('bedrooms') && newBedrooms !== NOT_AVAILABLE ? (parseInt(newBedrooms) || 0) : (v.has('rooms') && newRooms !== NOT_AVAILABLE ? (parseInt(newRooms) || 0) : 0),
        bathrooms: v.has('bathrooms') && newBathrooms !== NOT_AVAILABLE ? (parseInt(newBathrooms) || 0) : 0,
        features: featuresArr,
        image_urls: uploadedImages,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('properties').insert([payload]);
      if (error) throw error;

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setUploadedImages([]);
      setBlueprintImage('');
      setVideoUrl('');
      setMapUrl('');
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
    const parsed = parsePropertyFeatures(prop.features);
    const roomsPair = parsed.pairs.find((x) => x.label === 'الغرف' || x.label === 'غرف النوم')?.value || '';
    const roomsNum = Number(prop.bedrooms || prop.rooms || parseInt(roomsPair, 10) || 0);
    const finPair = parsed.pairs.find((x) => x.label === 'التشطيب')?.value || '';

    const matchDeal = dealTypeFilter === 'all' || dealType === dealTypeFilter;
    const matchType = typeFilter === 'all' || propType === typeFilter;
    const matchCity = cityFilter === 'all' || (prop.city && prop.city.includes(cityFilter));
    const matchCurr = currencyFilter === 'all' || (prop.currency || 'YER') === currencyFilter;
    const matchRooms = minRoomsFilter === 'all' || roomsNum >= Number(minRoomsFilter);
    const matchFin = finishingFilter === 'all' || finPair === finishingFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || (prop.title || '').toLowerCase().includes(q)
      || (prop.city || '').toLowerCase().includes(q)
      || (prop.district || '').toLowerCase().includes(q)
      || (prop.description || '').toLowerCase().includes(q)
      || (propType || '').toLowerCase().includes(q);

    return matchDeal && matchType && matchCity && matchCurr && matchRooms && matchFin && matchSearch;
  });

  const activeFiltersCount =
    (dealTypeFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) +
    (currencyFilter !== 'all' ? 1 : 0) + (minRoomsFilter !== 'all' ? 1 : 0) +
    (finishingFilter !== 'all' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0);

  const toPropX = (prop: any): XMarketItem => {
    const ownerUid = prop.owner_user_id || prop.owner_id;
    const biz = businessesList.find((b) =>
      (prop.business_id && b.id === prop.business_id) ||
      (ownerUid && b.ownerId === ownerUid)) || null;
    const prof = ownerUid ? profilesMap[ownerUid] : null;
    const pt = prop.property_type || prop.propertyType || 'عقار';
    const rawDt = prop.deal_type || prop.dealType || prop.listing_type;
    const dt = rawDt === 'SALE' ? 'بيع' : rawDt === 'RENT' ? 'إيجار' : (rawDt || 'متاح');
    const parsed = parsePropertyFeatures(prop.features);

    const fallbackPairs: { label: string; value: string }[] = [
      { label: 'النوع', value: pt },
      { label: 'العرض', value: dt === 'بيع' ? 'للبيع' : dt === 'إيجار' ? 'للإيجار' : dt },
      ...((prop.area_sqm || prop.area_m2 || prop.area) ? [{ label: 'المساحة', value: `${prop.area_sqm || prop.area_m2 || prop.area} م²` }] : []),
      ...((prop.bedrooms || prop.rooms) ? [{ label: 'الغرف', value: String(prop.bedrooms || prop.rooms) }] : []),
      ...(prop.city ? [{ label: 'المحافظة', value: prop.city }] : []),
    ];

    const ownerNamePair = parsed.pairs.find((sp) => sp.label === '__OWNER_NAME__');
    const ownerPhonePair = parsed.pairs.find((sp) => sp.label === '__OWNER_PHONE__');
    const visiblePairs = parsed.pairs.filter((sp) => !sp.label.startsWith('__'));
    const specPairs = (visiblePairs.length > 0 ? visiblePairs : fallbackPairs)
      .filter((sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(sp.value.trim()));
    const pubName = biz?.name || prof?.full_name || ownerNamePair?.value || `${pt} (${dt})`;
    const pubPhone = biz?.phone || prof?.phone || ownerPhonePair?.value || '';
    const appName = myBusinessPage?.name || myProfile?.full_name || '';
    const appPhone = String(myBusinessPage?.phone || myProfile?.phone || '').replace(/\D/g, '').slice(-9);
    const priceLabel = prop.price ? `${Number(prop.price).toLocaleString()} ${prop.currency || 'YER'}` : 'عند المعاينة';
    const descLabel = prop.district || prop.description || prop.location_details || '';

    return {
      id: prop.id, detailPath: `/properties/${prop.id}`, actionLabel: 'التفاصيل',
      onAction: () => { const it = toPropX(prop); setSelectedItem(it); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: 'instant' }); },
      authorName: pubName,
      authorUsername: biz?.username || prof?.username || (prof?.email ? prof.email.split('@')[0] : (prop.city || 'realestate')),
      authorAvatar: biz?.avatarUrl || prof?.avatar_url || '',
      badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none',
      businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
      createdAt: prop.created_at, title: prop.title,
      priceText: priceLabel,
      description: descLabel,
      metaParts: [`${pt} · ${dt}`, (prop.area_sqm || prop.area_m2 || prop.area) ? `${prop.area_sqm || prop.area_m2 || prop.area} م²` : '',
        (prop.bedrooms || prop.rooms) ? `${prop.bedrooms || prop.rooms} غرف` : '', prop.city || ''].filter(Boolean),
      specPairs,
      mapUrl: parsed.mapUrl,
      blueprintImage: parsed.blueprintImage,
      videoUrl: parsed.videoUrl,
      tagLabel: `${pt} · ${dt}`,
      images: Array.isArray(prop.image_urls) ? prop.image_urls : (Array.isArray(prop.images) ? prop.images : []),
      city: prop.city, phone: pubPhone,
      whatsappText: [
        `مرحباً، أرغب بالاستفسار عن العقار: ${prop.title}`,
        `اسم الناشر: ${pubName}`,
        pubPhone ? `هاتف الناشر: ${pubPhone}` : '',
        appName ? `اسم المتقدم: ${appName}` : '',
        appPhone ? `هاتف المتقدم: ${appPhone}` : '',
        `السعر: ${priceLabel}`,
        prop.city ? `المحافظة: ${prop.city}` : '',
        ...specPairs.map((sp) => `• ${sp.label}: ${sp.value}`),
        descLabel ? `الوصف: ${descLabel.slice(0, 200)}` : '',
      ].filter(Boolean).join('\n'),
    };
  };

  const onShareX = (it: XMarketItem) => {
    navigator.clipboard?.writeText(it.title);
    showToast('تم نسخ التفاصيل', 'success', 2500);
  };

  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < filteredProperties.length && !isLoadingMore) {
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
  }, [visibleCount, filteredProperties.length, isLoadingMore]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Tahoma'] text-white bg-black min-h-screen"}>
      <XToast toast={toastMessage} />

      {!embedded && !selectedItem && (
        <div className="space-y-2.5 border-b border-[#2F3336] pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-xl bg-[#000000] border border-[#2F3336] text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all">
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-[#F5C400]" />
                <h1 className="text-lg sm:text-xl font-black text-white">سوق العقارات المعتمد</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleOpenAddModal} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs transition-colors shadow-md">
                <Plus size={15} /><span>أضف عقار</span>
              </button>
              <button onClick={fetchProperties} disabled={loading} className="p-2 bg-[#000000] border border-[#2F3336] text-slate-300 hover:text-white rounded-xl transition-colors" title="تحديث">
                <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
              </button>
            </div>
          </div>
          <MarketSponsorSlot section="realestate" />
        </div>
      )}

      {selectedItem ? <XMarketDetailView item={selectedItem} activeImageIndex={activeImageIndex} onChangeImageIndex={setActiveImageIndex} onBack={() => setSelectedItem(null)} onOpenLightbox={() => setIsLightboxOpen(true)} onShare={() => onShareX(selectedItem)} /> : (<>
        {embedded && <MarketSponsorSlot section="realestate" />}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#000000] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
          <XSearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="ابحث عن عقار، حي، أو مدينة..." activeFiltersCount={activeFiltersCount} onOpenFilter={() => setIsFilterModalOpen(true)} sectionIcon={<Building size={18} className="text-[#FFC500]" />} />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
            <XSpinner size={28} />
            <span className="text-xs font-bold text-white">جاري تحميل العقارات...</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
            <AlertCircle className="w-9 h-9 text-[#FFC500] mx-auto opacity-75" />
            <h3 className="text-sm font-bold text-white">لا توجد عقارات معروضة حالياً</h3>
            <p className="text-xs">اضغط على زر + لإضافة عقار جديد.</p>
          </div>
        ) : embedded ? (
          <div className="divide-y divide-[#2F3336]/60">
            {filteredProperties.slice(0, visibleCount).map((prop, idx) => {
              const item = toPropX(prop);
              return (
                <React.Fragment key={prop.id}>
                  <XMarketTweetCard
                    item={item}
                    onOpenDetail={() => { setSelectedItem(item); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: "instant" }); }}
                    onOpenImage={(idx) => { setSelectedItem(item); setActiveImageIndex(idx); setIsLightboxOpen(true); }}
                    onShare={() => onShareX(item)}
                  />
                  {idx === (filteredProperties.length >= 8 ? 2 : filteredProperties.length >= 4 ? 1 : 0) && (
                    <div className="bg-black">
                      <AdBanner section="realestate" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                    </div>
                  )}
                  {idx === (filteredProperties.length >= 8 ? 7 : filteredProperties.length >= 2 ? filteredProperties.length - 1 : -1) && (
                    <div className="bg-black">
                      <AdBanner section="realestate" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.slice(0, visibleCount).map((prop, idx) => (
              <React.Fragment key={prop.id}>
                <PropertyCard property={{ ...prop, deal_type: prop.deal_type || (prop.listing_type === 'SALE' ? 'بيع' : prop.listing_type === 'RENT' ? 'إيجار' : prop.listing_type), area_m2: prop.area_m2 ?? prop.area_sqm, rooms: prop.rooms ?? prop.bedrooms, images: prop.images ?? prop.image_urls }} />
                {idx === (filteredProperties.length >= 6 ? 2 : 0) && (
                  <div className="col-span-full">
                    <AdBanner section="realestate" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                  </div>
                )}
                {idx === (filteredProperties.length >= 6 ? 5 : filteredProperties.length >= 2 ? filteredProperties.length - 1 : -1) && (
                  <div className="col-span-full">
                    <AdBanner section="realestate" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                  </div>
                )}
              </React.Fragment>
            ))}

          </div>
        )}

          {filteredProperties.length > 0 && (
            <div ref={bottomSentinelRef} className="py-3 flex items-center justify-center">
              {isLoadingMore || visibleCount < filteredProperties.length ? (
                <XSpinner ariaLabel="جاري تحميل المزيد" />
              ) : (
                <span className="text-[11px] text-[#71767B]">تم عرض كل النتائج</span>
              )}
            </div>
          )}
      </>)}

      {embedded && !selectedItem && !isAddModalOpen && (
        <button onClick={handleOpenAddModal} className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition" title="أضف عقار">
          <Plus size={24} className="stroke-[2.2]" />
        </button>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden font-['Tahoma',sans-serif] text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2F3336]/60 shrink-0">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition"><X size={18} /></button>
              <span className="text-[13px] font-bold text-[#71767B]">إضافة عقار جديد</span>
              <span className="w-7" />
            </div>

            <form onSubmit={handleAddProperty} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {(myBusinessPage || myProfile) && <XLinkedAccountCard name={myBusinessPage?.name || myProfile?.full_name || "حسابك"} username={myBusinessPage?.username || myProfile?.username || (myProfile?.email ? myProfile.email.split("@")[0] : "account")} avatarUrl={myBusinessPage?.avatarUrl || myProfile?.avatar_url} badgeType={myBusinessPage ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? "gold" : "none")) : "none"} label={myBusinessPage ? "صفحة المنشأة" : "حسابك"} />}
              {formError && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs">{formError}</div>}

              {/* أولاً: نوع العرض ونوع العقار */}
              <div>
                <label className="text-[11px] text-[#F5C400] block mb-1 font-bold">نوع العرض *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewDealType('بيع')} className={`py-2 rounded-xl font-bold border transition-all ${newDealType === 'بيع' ? 'bg-white text-black border-white' : 'bg-black text-slate-300 border-[#2F3336]'}`}>للبيع</button>
                  <button type="button" onClick={() => setNewDealType('إيجار')} className={`py-2 rounded-xl font-bold border transition-all ${newDealType === 'إيجار' ? 'bg-white text-black border-white' : 'bg-black text-slate-300 border-[#2F3336]'}`}>للإيجار</button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">نوع العقار *</label>
                <YRSelect value={newPropertyType} options={RE_PROPERTY_TYPES} onChange={setNewPropertyType} />
              </div>

              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">عنوان العقار *</label>
                <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثال: شقة سوبر ديلوكس في حي حدة" className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white" />
              </div>

              {/* ثالثاً: الموقع (قوائم منسدلة) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المحافظة *</label>
                  <YRSelect compact value={newGov} options={RE_GOVERNORATES.map((g) => ({ value: g, label: g }))} onChange={handleGovChange} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المدينة</label>
                  <YRSelect compact value={newCity} options={cityOptions} onChange={setNewCity} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المديرية</label>
                  <YRSelect compact value={newDistrict} options={districtOptions} onChange={setNewDistrict} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الحي</label>
                  <YRSelect compact value={newNeighborhood} options={neighborhoodOptions} onChange={setNewNeighborhood} />
                </div>
              </div>

              {/* السعر والعملة */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#FFC500] font-bold block mb-1">السعر *</label>
                  <input required type="text" inputMode="numeric" value={newPrice} onChange={(e) => setNewPrice(fmtAmt(e.target.value))} placeholder="أدخل السعر..." className="w-full bg-black border border-[#2F3336] rounded-xl p-2 text-white font-mono focus:outline-none focus:border-white caret-white" />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">العملة *</label>
                  <YRSelect compact value={newCurrency} options={CURRENCIES} onChange={setNewCurrency} />
                </div>
              </div>

              {/* رابعاً: معلومات العقار الديناميكية حسب النوع */}
              <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                <div className="text-[11px] font-bold text-[#FFC500]">معلومات {newPropertyType}</div>
                <div className="grid grid-cols-2 gap-2">
                  {visibleFields.has('area') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">المساحة (م²)</label><YRSelect compact value={newArea} options={RE_AREA_OPTIONS} onChange={setNewArea} /></div>
                  )}
                  {visibleFields.has('shopActivity') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع النشاط</label><YRSelect compact value={newShopActivity} options={RE_SHOP_ACTIVITY_OPTIONS} onChange={setNewShopActivity} /></div>
                  )}
                  {visibleFields.has('officeUse') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">الاستخدام</label><YRSelect compact value={newOfficeUse} options={RE_OFFICE_USE_OPTIONS} onChange={setNewOfficeUse} /></div>
                  )}
                  {visibleFields.has('rooms') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد الغرف</label><YRSelect compact value={newRooms} options={RE_COUNT_1_20} onChange={setNewRooms} /></div>
                  )}
                  {visibleFields.has('bedrooms') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">غرف النوم</label><YRSelect compact value={newBedrooms} options={RE_COUNT_1_10} onChange={setNewBedrooms} /></div>
                  )}
                  {visibleFields.has('bathrooms') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">الحمامات</label><YRSelect compact value={newBathrooms} options={RE_COUNT_1_10} onChange={setNewBathrooms} /></div>
                  )}
                  {visibleFields.has('kitchens') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">المطابخ</label><YRSelect compact value={newKitchens} options={RE_COUNT_1_5} onChange={setNewKitchens} /></div>
                  )}
                  {visibleFields.has('floorsCount') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد الطوابق</label><YRSelect compact value={newFloorsCount} options={RE_COUNT_1_20} onChange={setNewFloorsCount} /></div>
                  )}
                  {visibleFields.has('floorNum') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">رقم الطابق</label><YRSelect compact value={newFloorNum} options={RE_FLOOR_NUM_OPTIONS} onChange={setNewFloorNum} /></div>
                  )}
                  {visibleFields.has('apartmentsCount') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد الشقق</label><YRSelect compact value={newApartmentsCount} options={RE_COUNT_1_20} onChange={setNewApartmentsCount} /></div>
                  )}
                  {visibleFields.has('shopsCount') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد المحلات</label><YRSelect compact value={newShopsCount} options={RE_COUNT_1_20} onChange={setNewShopsCount} /></div>
                  )}
                  {visibleFields.has('age') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">عمر العقار</label><YRSelect compact value={newAge} options={RE_AGE_OPTIONS} onChange={setNewAge} /></div>
                  )}
                  {visibleFields.has('propCondition') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">حالة العقار</label><YRSelect compact value={newCondition} options={RE_STATUS_OPTIONS} onChange={setNewCondition} /></div>
                  )}
                  {visibleFields.has('finishing') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">مستوى التشطيب</label><YRSelect compact value={newFinishing} options={RE_FINISHING_OPTIONS} onChange={setNewFinishing} /></div>
                  )}
                  {visibleFields.has('construction') && (
                    <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع البناء</label><YRSelect compact value={newConstruction} options={RE_CONSTRUCTION_OPTIONS} onChange={setNewConstruction} /></div>
                  )}
                </div>
              </div>

              {/* خامساً: الخدمات والمرافق */}
              {(visibleFields.has('electricity') || visibleFields.has('water') || visibleFields.has('parking') || visibleFields.has('elevator')) && (
                <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                  <div className="text-[11px] font-bold text-[#FFC500]">الخدمات والمرافق</div>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleFields.has('electricity') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">الكهرباء</label><YRSelect compact value={newElectricity} options={RE_ELECTRICITY_OPTIONS} onChange={setNewElectricity} /></div>}
                    {visibleFields.has('water') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">المياه</label><YRSelect compact value={newWater} options={RE_WATER_OPTIONS} onChange={setNewWater} /></div>}
                    {visibleFields.has('parking') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">موقف سيارات</label><YRSelect compact value={newParking} options={RE_PARKING_OPTIONS} onChange={setNewParking} /></div>}
                    {visibleFields.has('garden') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">حديقة</label><YRSelect compact value={newGarden} options={RE_GARDEN_OPTIONS} onChange={setNewGarden} /></div>}
                    {visibleFields.has('elevator') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">مصعد</label><YRSelect compact value={newElevator} options={RE_ELEVATOR_OPTIONS} onChange={setNewElevator} /></div>}
                    {visibleFields.has('ac') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">تكييف</label><YRSelect compact value={newAc} options={RE_AC_OPTIONS} onChange={setNewAc} /></div>}
                    {visibleFields.has('sewage') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">الصرف الصحي</label><YRSelect compact value={newSewage} options={RE_SEWAGE_OPTIONS} onChange={setNewSewage} /></div>}
                    {visibleFields.has('internet') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">الإنترنت</label><YRSelect compact value={newInternet} options={RE_INTERNET_OPTIONS} onChange={setNewInternet} /></div>}
                  </div>
                </div>
              )}

              {/* سادساً وسابعاً: الشارع والواجهة والملكية والوثائق */}
              <div className="p-3 rounded-2xl border border-[#2F3336]/70 bg-zinc-950/50 space-y-2.5">
                <div className="text-[11px] font-bold text-[#FFC500]">تفاصيل الموقع والوثائق</div>
                <div className="grid grid-cols-2 gap-2">
                  {visibleFields.has('streetType') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع الشارع</label><YRSelect compact value={newStreetType} options={RE_STREET_TYPE_OPTIONS} onChange={setNewStreetType} /></div>}
                  {visibleFields.has('streetWidth') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">عرض الشارع</label><YRSelect compact value={newStreetWidth} options={RE_STREET_WIDTH_OPTIONS} onChange={setNewStreetWidth} /></div>}
                  {visibleFields.has('facadesCount') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">عدد الواجهات</label><YRSelect compact value={newFacadesCount} options={RE_FACADES_COUNT_OPTIONS} onChange={setNewFacadesCount} /></div>}
                  {visibleFields.has('facingDir') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">اتجاه الواجهة</label><YRSelect compact value={newFacingDir} options={RE_FACING_DIR_OPTIONS} onChange={setNewFacingDir} /></div>}
                  {visibleFields.has('landNature') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">طبيعة الأرض</label><YRSelect compact value={newLandNature} options={RE_LAND_NATURE_OPTIONS} onChange={setNewLandNature} /></div>}
                  {visibleFields.has('installment') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">إمكانية التقسيط</label><YRSelect compact value={newInstallment} options={RE_INSTALLMENT_OPTIONS} onChange={setNewInstallment} /></div>}
                  {visibleFields.has('ownership') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع الملكية</label><YRSelect compact value={newOwnership} options={RE_OWNERSHIP_OPTIONS} onChange={setNewOwnership} /></div>}
                  {visibleFields.has('docType') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">نوع الوثيقة</label><YRSelect compact value={newDocType} options={RE_DOC_TYPE_OPTIONS} onChange={setNewDocType} /></div>}
                  {visibleFields.has('docStatus') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">حالة الوثائق</label><YRSelect compact value={newDocStatus} options={RE_DOC_STATUS_OPTIONS} onChange={setNewDocStatus} /></div>}
                  {visibleFields.has('negotiable') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">قابل للتفاوض</label><YRSelect compact value={newNegotiable} options={RE_NEGOTIABLE_OPTIONS} onChange={setNewNegotiable} /></div>}
                  {visibleFields.has('viewing') && <div><label className="text-[10.5px] text-[#71767B] block mb-1">المعاينة</label><YRSelect compact value={newViewing} options={RE_VIEWING_OPTIONS} onChange={setNewViewing} /></div>}
                </div>
              </div>

              {/* تاسعاً: الصور والمرفقات والموقع */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white font-bold flex items-center gap-1"><ImagePlus size={14} className="text-[#F5C400]" /><span>صور العقار (1 إلى 6 صور)</span></label>
                  <span className="text-[10px] text-[#F5C400] font-bold">{uploadedImages.length} من 6</span>
                </div>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImagesUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadedImages.length >= 6} className="w-full py-2.5 border border-dashed border-[#2F3336] hover:border-white rounded-xl bg-black text-white flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50">
                  <ImagePlus size={16} className="text-[#F5C400]" />
                  <span>{uploadedImages.length >= 6 ? 'تم بلوغ الحد الأقصى (6 صور)' : 'اختر صور العقار'}</span>
                </button>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-[#2F3336] bg-black">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 left-1 p-1 rounded-full bg-red-600/80 text-white"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <input type="file" accept="image/*" ref={blueprintInputRef} onChange={handleBlueprintUpload} className="hidden" />
                    <button type="button" onClick={() => blueprintInputRef.current?.click()} className={`w-full py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${blueprintImage ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-[#2F3336] bg-black text-white'}`}>
                      <FileImage size={14} className="text-[#FFC500]" />
                      <span>{blueprintImage ? 'تم إرفاق المخطط' : 'مخطط هندسي (اختياري)'}</span>
                    </button>
                  </div>
                  <button type="button" onClick={handleLocateOnMap} disabled={locatingMap} className={`w-full py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 ${mapUrl ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-[#2F3336] bg-black text-white'}`}>
                    <MapPin size={14} className="text-[#FFC500]" />
                    <span>{locatingMap ? 'جاري التحديد...' : mapUrl ? 'تم تحديد الخريطة' : 'تحديد على الخريطة'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-black border border-[#2F3336] rounded-xl px-2.5 py-2">
                  <Video size={14} className="text-[#FFC500] shrink-0" />
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="رابط فيديو اختياري (YouTube / رابط مباشر)..." className="flex-1 bg-transparent text-xs text-white outline-none caret-white" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">وصف إضافي (اختياري عند الحاجة)</label>
                <textarea rows={2} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="ملاحظات إضافية عن العقار..." className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white focus:outline-none focus:border-white caret-white resize-none" />
              </div>

              <div>
                <label className="block text-white mb-1">رقم الهاتف (واتساب) * <span className="text-[#F5C400] text-[10px]">(9 أرقام بالضبط)</span></label>
                <input required type="tel" maxLength={9} value={ownerPhone} onChange={handlePhoneChange} placeholder="77XXXXXXX" className="w-full bg-black border border-[#2F3336] rounded-xl p-2.5 text-white text-left font-mono focus:outline-none focus:border-white caret-white" />
                <span className="text-[10px] text-slate-300 block mt-0.5">تم إدخال: {ownerPhone.length} من 9 أرقام</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs"><ShieldCheck size={16} /><span>تنبيه وساطة يمن ريتغ:</span></div>
                <p className="text-[11px] text-gray-200 leading-relaxed">تطبق المنصة عمولة الوساطة المعتمدة عند إتمام المعاملة العقارية عبر وساطة المنصة.</p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={agreedToCommission} onChange={(e) => setAgreedToCommission(e.target.checked)} className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أوافق على شروط وسياسة وساطة يمن ريتغ</span>
                </label>
              </div>

              {formError && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs">{formError}</div>}
              <div className="flex justify-end gap-2 pt-1 border-t border-[#2F3336]">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-black border border-[#2F3336] text-white text-xs font-bold">إلغاء</button>
                <button type="submit" disabled={!agreedToCommission || ownerPhone.length !== 9 || submitting} className="px-5 py-2 bg-[#FFC500] disabled:opacity-40 text-black font-bold text-xs rounded-full transition-colors shadow-md">
                  {submitting ? 'جاري الإرسال...' : 'إرسال العقار للاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <XImageLightbox isOpen={isLightboxOpen} item={selectedItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <XFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="تصفية العقارات" activeFiltersCount={activeFiltersCount} onReset={() => { setDealTypeFilter('all'); setTypeFilter('all'); setCurrencyFilter('all'); setMinRoomsFilter('all'); setFinishingFilter('all'); setCityFilter('all'); }} resultsCount={filteredProperties.length} fields={[
        { label: 'نوع المعاملة', value: dealTypeFilter, onChange: (v) => setDealTypeFilter(v as any), options: [{ value: 'all', label: 'الكل (بيع وإيجار)' }, { value: 'بيع', label: 'للبيع' }, { value: 'إيجار', label: 'للإيجار' }] },
        { label: 'نوع العقار', value: typeFilter, onChange: setTypeFilter, options: [{ value: 'all', label: 'كافة الأنواع' }, ...RE_PROPERTY_TYPES] },
        { label: 'العملة', value: currencyFilter, onChange: setCurrencyFilter, options: [{ value: 'all', label: 'كل العملات' }, ...CURRENCIES] },
        { label: 'عدد الغرف', value: minRoomsFilter, onChange: setMinRoomsFilter, options: [{ value: 'all', label: 'الكل' }, { value: '1', label: '1+ غرف' }, { value: '2', label: '2+ غرف' }, { value: '3', label: '3+ غرف' }, { value: '4', label: '4+ غرف' }, { value: '5', label: '5+ غرف' }] },
        { label: 'التشطيب', value: finishingFilter, onChange: setFinishingFilter, options: [{ value: 'all', label: 'الكل' }, ...RE_FINISHING_OPTIONS.filter((o) => o.value !== NOT_AVAILABLE)] },
        { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
      ]} />
    </div>
  );
};
