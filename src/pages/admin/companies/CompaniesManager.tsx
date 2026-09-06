import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import {
  Building2, Search, Plus, Check, Filter, X, ShieldAlert,
  EyeOff, Eye, Edit3, Upload, Trash2, Phone, Globe, Mail,
  MapPin, CheckCircle2, Loader2, Award, ExternalLink, Star,
  Image as ImageIcon, Sparkles, Megaphone, Bed, Wifi, Car,
  Stethoscope, Clock, ShieldCheck, Tag
} from 'lucide-react';

interface BusinessRecord {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website_url: string | null;
  city: string;
  address: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls: string[];
  badge_type: 'gold' | 'blue' | 'gray' | null;
  is_verified: boolean;
  status: 'active' | 'pending' | 'hidden';
  claim_status: 'UNCLAIMED' | 'PENDING' | 'CLAIMED';
  rating: number;
  review_count: number;
  sections_config: any;
  created_at?: string;
  category_name?: string;
  category_slug?: string;
}

export const CompaniesManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategorySlug = searchParams.get('category');

  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, { id: string; name: string; slug: string }>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterBadge, setFilterBadge] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // نافذة الإضافة والتعديل
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'features' | 'ads'>('info');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // حقول النموذج الشاملة
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    category_id: string;
    city: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    website_url: string;
    description: string;
    logo_url: string | null;
    cover_url: string | null;
    gallery_urls: (string | null)[];
    badge_type: 'gold' | 'blue' | 'gray' | null;
    is_verified: boolean;
    status: 'active' | 'pending' | 'hidden';
    claim_status: 'UNCLAIMED' | 'PENDING' | 'CLAIMED';
    rating: number;
    review_count: number;
    // الحقول المخصصة للقطاعات
    rooms_count: string;
    has_pool: boolean;
    has_wifi: boolean;
    has_parking: boolean;
    has_emergency: boolean;
    has_icu: boolean;
    has_delivery: boolean;
    has_family_sections: boolean;
    warranty_available: boolean;
    gold_carat: string;
    working_hours: string;
    // إعدادات الوحدات الإعلانية الثلاث
    ad_unit_top: boolean;
    ad_unit_feed: boolean;
    ad_unit_sticky: boolean;
  }>({
    name: '',
    slug: '',
    category_id: '',
    city: 'صنعاء',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    website_url: '',
    description: '',
    logo_url: null,
    cover_url: null,
    gallery_urls: [null, null, null, null],
    badge_type: 'gold',
    is_verified: true,
    status: 'active',
    claim_status: 'UNCLAIMED',
    rating: 4.8,
    review_count: 5,
    rooms_count: '',
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_emergency: false,
    has_icu: false,
    has_delivery: false,
    has_family_sections: true,
    warranty_available: false,
    gold_carat: '21 & 18',
    working_hours: '08:00 ص - 10:00 م',
    ad_unit_top: true,
    ad_unit_feed: true,
    ad_unit_sticky: false,
  });

  const activeOfficialCategory = useMemo(() => {
    if (!currentCategorySlug) return null;
    return OFFICIAL_CATEGORIES.find(c => c.slug === currentCategorySlug) || null;
  }, [currentCategorySlug]);

  const selectedCatSlug = useMemo(() => {
    if (formData.category_id && categoriesMap[formData.category_id]) {
      return categoriesMap[formData.category_id].slug;
    }
    return currentCategorySlug || '';
  }, [formData.category_id, categoriesMap, currentCategorySlug]);

  // جلب البيانات الحقيقية من Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('id, name, slug');
      const catMap: Record<string, { id: string; name: string; slug: string }> = {};
      if (catData) {
        catData.forEach(c => {
          catMap[c.id] = c;
          catMap[c.slug] = c;
        });
        setCategoriesMap(catMap);
      }

      const { data: bData, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enriched: BusinessRecord[] = (bData || []).map(b => ({
        ...b,
        gallery_urls: Array.isArray(b.gallery_urls) ? b.gallery_urls : [],
        category_name: catMap[b.category_id]?.name || 'منشأة عامة',
        category_slug: catMap[b.category_id]?.slug || '',
      }));

      setBusinesses(enriched);
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // التصفية الشاملة
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      if (currentCategorySlug) {
        const matchesSlug = b.category_slug === currentCategorySlug;
        const matchesId = categoriesMap[currentCategorySlug]?.id === b.category_id;
        if (!matchesSlug && !matchesId) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          b.name.toLowerCase().includes(term) ||
          (b.city && b.city.toLowerCase().includes(term)) ||
          (b.phone && b.phone.includes(term));
        if (!matchesSearch) return false;
      }
      if (filterCity !== 'all' && b.city !== filterCity) return false;
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      if (filterBadge !== 'all') {
        if (filterBadge === 'none' && b.badge_type) return false;
        if (filterBadge !== 'none' && b.badge_type !== filterBadge) return false;
      }
      return true;
    });
  }, [businesses, currentCategorySlug, searchTerm, filterCity, filterStatus, filterBadge, categoriesMap]);

  // رفع الصور المباشر من الهاتف (شعار، غلاف، وأربع صور للمعرض)
  const handleUploadFile = async (target: 'logo' | 'cover' | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(String(target));
    setErrorMessage(null);

    try {
      const ext = file.name.split('.').pop();
      const folder = target === 'logo' ? 'logos' : (target === 'cover' ? 'covers' : 'gallery');
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('businesses')
        .upload(fileName, file, { upsert: true });

      if (uploadErr) {
        await supabase.storage.from('public').upload(fileName, file, { upsert: true });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('businesses')
        .getPublicUrl(fileName);

      const finalUrl = publicUrl || URL.createObjectURL(file);

      if (target === 'logo') {
        setFormData(p => ({ ...p, logo_url: finalUrl }));
      } else if (target === 'cover') {
        setFormData(p => ({ ...p, cover_url: finalUrl }));
      } else if (typeof target === 'number') {
        setFormData(p => {
          const nextGallery = [...p.gallery_urls];
          nextGallery[target] = finalUrl;
          return { ...p, gallery_urls: nextGallery };
        });
      }
    } catch (err: any) {
      console.warn('Storage fallback applied:', err);
      const previewUrl = URL.createObjectURL(file);
      if (target === 'logo') setFormData(p => ({ ...p, logo_url: previewUrl }));
      else if (target === 'cover') setFormData(p => ({ ...p, cover_url: previewUrl }));
      else if (typeof target === 'number') {
        setFormData(p => {
          const next = [...p.gallery_urls];
          next[target] = previewUrl;
          return { ...p, gallery_urls: next };
        });
      }
    } finally {
      setUploadingTarget(null);
    }
  };

  // فتح نافذة الإضافة
  const handleOpenAddModal = () => {
    setEditingId(null);
    setErrorMessage(null);
    setActiveTab('info');

    const defaultCatId = currentCategorySlug && categoriesMap[currentCategorySlug]
      ? categoriesMap[currentCategorySlug].id
      : (Object.values(categoriesMap)[0]?.id || '');

    setFormData({
      name: '',
      slug: '',
      category_id: defaultCatId,
      city: 'صنعاء',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      website_url: '',
      description: '',
      logo_url: null,
      cover_url: null,
      gallery_urls: [null, null, null, null],
      badge_type: 'gold',
      is_verified: true,
      status: 'active',
      claim_status: 'UNCLAIMED',
      rating: 4.8,
      review_count: 5,
      rooms_count: '',
      has_pool: false,
      has_wifi: true,
      has_parking: true,
      has_emergency: false,
      has_icu: false,
      has_delivery: false,
      has_family_sections: true,
      warranty_available: false,
      gold_carat: '21 & 18',
      working_hours: '08:00 ص - 10:00 م',
      ad_unit_top: true,
      ad_unit_feed: true,
      ad_unit_sticky: false,
    });
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل
  const handleOpenEditModal = (b: BusinessRecord) => {
    setEditingId(b.id);
    setErrorMessage(null);
    setActiveTab('info');

    const sec = b.sections_config || {};
    const feat = sec.features || {};

    const gallery4: (string | null)[] = [null, null, null, null];
    if (Array.isArray(b.gallery_urls)) {
      b.gallery_urls.slice(0, 4).forEach((url, i) => { gallery4[i] = url; });
    }

    setFormData({
      name: b.name,
      slug: b.slug || '',
      category_id: b.category_id || '',
      city: b.city || 'صنعاء',
      address: b.address || '',
      phone: b.phone || '',
      whatsapp: b.whatsapp || '',
      email: b.email || '',
      website_url: b.website_url || '',
      description: b.description || '',
      logo_url: b.logo_url || null,
      cover_url: b.cover_url || null,
      gallery_urls: gallery4,
      badge_type: b.badge_type || null,
      is_verified: b.is_verified,
      status: b.status || 'active',
      claim_status: b.claim_status || 'UNCLAIMED',
      rating: b.rating || 4.8,
      review_count: b.review_count || 5,
      rooms_count: feat.rooms_count || '',
      has_pool: !!feat.has_pool,
      has_wifi: feat.has_wifi !== undefined ? !!feat.has_wifi : true,
      has_parking: feat.has_parking !== undefined ? !!feat.has_parking : true,
      has_emergency: !!feat.has_emergency,
      has_icu: !!feat.has_icu,
      has_delivery: !!feat.has_delivery,
      has_family_sections: feat.has_family_sections !== undefined ? !!feat.has_family_sections : true,
      warranty_available: !!feat.warranty_available,
      gold_carat: feat.gold_carat || '21 & 18',
      working_hours: sec.working_hours || '08:00 ص - 10:00 م',
      ad_unit_top: sec.ad_unit_top !== undefined ? !!sec.ad_unit_top : true,
      ad_unit_feed: sec.ad_unit_feed !== undefined ? !!sec.ad_unit_feed : true,
      ad_unit_sticky: !!sec.ad_unit_sticky,
    });
    setIsModalOpen(true);
  };

  // حفظ المنشأة بالكامل
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('يرجى إدخال اسم المنشأة.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const generatedSlug = formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-');
    const cleanGallery = formData.gallery_urls.filter(Boolean) as string[];

    const payload = {
      name: formData.name.trim(),
      slug: generatedSlug,
      category_id: formData.category_id,
      city: formData.city,
      address: formData.address || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      email: formData.email || null,
      website_url: formData.website_url || null,
      description: formData.description || null,
      logo_url: formData.logo_url,
      cover_url: formData.cover_url,
      gallery_urls: cleanGallery,
      badge_type: formData.badge_type,
      is_verified: formData.is_verified,
      status: formData.status,
      claim_status: formData.claim_status,
      rating: Number(formData.rating) || 4.5,
      review_count: Number(formData.review_count) || 0,
      sections_config: {
        ads: true,
        ad_unit_top: formData.ad_unit_top,
        ad_unit_feed: formData.ad_unit_feed,
        ad_unit_sticky: formData.ad_unit_sticky,
        working_hours: formData.working_hours,
        features: {
          rooms_count: formData.rooms_count,
          has_pool: formData.has_pool,
          has_wifi: formData.has_wifi,
          has_parking: formData.has_parking,
          has_emergency: formData.has_emergency,
          has_icu: formData.has_icu,
          has_delivery: formData.has_delivery,
          has_family_sections: formData.has_family_sections,
          warranty_available: formData.warranty_available,
          gold_carat: formData.gold_carat,
        }
      },
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('businesses')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'تعذر حفظ البيانات في السيرفر.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-6 font-['Cairo',sans-serif] text-white">
      {/* الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          {activeOfficialCategory ? (
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <activeOfficialCategory.icon className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-[#161D2B] border border-[#1F2937] flex items-center justify-center text-[#FFC500]">
              <Building2 className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {activeOfficialCategory ? `إدارة قطاع ${activeOfficialCategory.name}` : 'إدارة كافة المنشآت والأنشطة'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              التحكم في المنشآت، رفع الغلاف والصور الأربع، وتفعيل شارات التوثيق والوحدات الإعلانية الثلاث.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {currentCategorySlug && (
            <button
              onClick={() => setSearchParams({})}
              className="px-3 py-2 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs text-gray-300 hover:text-white"
            >
              عرض الكل
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-black font-bold text-xs shadow-lg transition-all"
          >
            <Plus size={16} />
            إضافة {activeOfficialCategory ? activeOfficialCategory.name.replace(/^ال/, '') : 'منشأة'} جديدة
          </button>
        </div>
      </div>

      {/* شريط البحث والفلترة الدقيق */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-3 rounded-2xl border border-[#1F2937]">
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، المدينة، الهاتف..."
            className="w-full pr-10 pl-3 py-2 bg-[#161D2B] border border-[#1F2937] rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#FFC500]/50"
          />
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-gray-300 outline-none"
        >
          <option value="all">كافة المحافظات والمدن</option>
          <option value="صنعاء">صنعاء</option>
          <option value="عدن">عدن</option>
          <option value="تعز">تعز</option>
          <option value="حضرموت">حضرموت</option>
          <option value="إب">إب</option>
          <option value="الحديدة">الحديدة</option>
          <option value="ذمار">ذمار</option>
          <option value="مأرب">مأرب</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-gray-300 outline-none"
        >
          <option value="all">كافة الحالات</option>
          <option value="active">نشط ومعروض للموقع</option>
          <option value="pending">غير نشط / قيد المراجعة</option>
          <option value="hidden">مخفي وغير ظاهر</option>
        </select>

        <select
          value={filterBadge}
          onChange={(e) => setFilterBadge(e.target.value)}
          className="bg-[#161D2B] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-gray-300 outline-none"
        >
          <option value="all">كافة الشارات الملكية</option>
          <option value="gold">شارة ذهبية (Gold) 🏆</option>
          <option value="blue">شارة زرقاء موثقة 🛡️</option>
          <option value="gray">شارة فضية اعتيادية</option>
          <option value="none">بدون شارة</option>
        </select>
      </div>

      {/* قائمة البطاقات الحقيقية الغنية */}
      {loading ? (
        <div className="py-24 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="w-7 h-7 animate-spin text-[#FFC500]" />
          جاري استدعاء المنشآت الحقيقية من قاعدة بيانات Supabase...
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="py-16 text-center bg-[#0B0F17] rounded-3xl border border-dashed border-[#1F2937] space-y-3.5 p-6">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-base font-bold text-gray-200">
            {activeOfficialCategory
              ? `لا توجد ${activeOfficialCategory.name} مسجلة حالياً (العدد: 0)`
              : 'لا توجد منشآت مطابقة للبحث'}
          </p>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            سياسة YEMEN RATING تتيح لك كمسؤول إضافة وتجهيز صفحات {activeOfficialCategory?.name || 'المنشآت'} ورفع الغلاف والشعار والصور، ليطالب أصحابها بـ «إثبات الملكية» لاحقاً.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC500] text-black font-bold text-xs shadow-lg"
          >
            <Plus size={15} /> إضافة أول منشأة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((b) => (
            <div
              key={b.id}
              className={`bg-[#0B0F17] border rounded-2xl overflow-hidden transition-all shadow-lg flex flex-col ${
                b.status === 'hidden'
                  ? 'border-red-900/40 opacity-75 bg-red-950/5'
                  : 'border-[#1F2937] hover:border-[#FFC500]/50'
              }`}
            >
              {/* صورة الغلاف العريض والشعار */}
              <div className="relative h-28 bg-[#161D2B] overflow-hidden">
                {b.cover_url ? (
                  <img src={b.cover_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center text-gray-600 text-xs">
                    لا يوجد غلاف بانورامي
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* حالة النشاط */}
                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    b.status === 'active'
                      ? 'bg-emerald-500/90 text-black'
                      : b.status === 'pending'
                      ? 'bg-amber-500/90 text-black'
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {b.status === 'active' ? 'نشط ومعروض' : b.status === 'pending' ? 'غير نشط' : 'مخفي'}
                  </span>
                </div>

                {/* الشعار المرفوع من الهاتف */}
                <div className="absolute -bottom-2 right-3 w-14 h-14 rounded-xl bg-[#0B0F17] border-2 border-[#1F2937] overflow-hidden shadow-lg flex items-center justify-center">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#FFC500]" />
                  )}
                </div>
              </div>

              {/* المحتوى والتفاصيل */}
              <div className="p-4 pt-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">{b.name}</h3>
                      <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">{b.category_name}</span>
                    </div>

                    {b.badge_type && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                        b.badge_type === 'gold'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : b.badge_type === 'blue'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {b.badge_type === 'gold' ? 'شارة ذهبية' : b.badge_type === 'blue' ? 'موثق رسمي' : 'فضية'}
                      </span>
                    )}
                  </div>

                  {/* التقييم والصور الأربع */}
                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-[#1F2937]">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={13} className="fill-amber-400" />
                      <span>{b.rating || 4.5}</span>
                      <span className="text-gray-500 text-[10px]">({b.review_count || 0} تقييم)</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                      <ImageIcon size={12} className="text-[#FFC500]" />
                      <span>{b.gallery_urls?.length || 0} صور معروضة</span>
                    </div>
                  </div>

                  {/* التواصل والمدينة */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#161D2B]/70 border border-[#1F2937] space-y-1 text-xs text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-[11px] flex items-center gap-1"><MapPin size={11} /> المدينة:</span>
                      <span className="font-bold text-white text-[11px]">{b.city}</span>
                    </div>
                    {b.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-[11px] flex items-center gap-1"><Phone size={11} /> الهاتف:</span>
                        <span className="font-mono text-gray-200 text-[11px]">{b.phone}</span>
                      </div>
                    )}
                    {b.website_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-[11px] flex items-center gap-1"><Globe size={11} /> الموقع:</span>
                        <a href={b.website_url} target="_blank" rel="noreferrer" className="text-blue-400 text-[10px] truncate max-w-[140px] hover:underline">
                          {b.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[#1F2937]/50">
                      <span className="text-gray-500 text-[11px]">إثبات الملكية:</span>
                      <span className={`text-[10px] font-bold ${
                        b.claim_status === 'CLAIMED' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {b.claim_status === 'CLAIMED' ? 'مملوكة وموثقة' : 'غير مطالب بها (جاهزة للمطالبة)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#1F2937] mt-3">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#161D2B] hover:bg-[#FFC500] hover:text-black text-gray-200 text-xs font-bold transition-all"
                  >
                    <Edit3 size={13} />
                    تعديل شامل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* المودال الشامل الموحد للإضافة والتعديل الكامل مع التبويبات المتطورة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0F141F] border border-[#1F2937] rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* ترويسة المودال */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#111827] sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFC500]/10 text-[#FFC500]">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {editingId ? 'تعديل بيانات المنشأة الشاملة' : 'إضافة منشأة جديدة بالكامل للموقع'}
                  </h2>
                  <p className="text-[11px] text-gray-400">نموذج الإدارة الموحد مع رفع وسائط الهاتف وميزات القطاع</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* أزرار التبويبات الداخلية */}
            <div className="flex border-b border-[#1F2937] bg-[#0B0F17] px-4 text-xs font-bold">
              {[
                { id: 'info', label: '1. البيانات والتواصل' },
                { id: 'media', label: '2. الغلاف والشعار والمعرض (4 صور)' },
                { id: 'features', label: '3. ميزات القطاع المخصصة' },
                { id: 'ads', label: '4. الوحدات الإعلانية والتوثيق' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3 sm:px-4 border-b-2 transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'border-[#FFC500] text-[#FFC500]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="m-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveBusiness} className="p-5 space-y-4 text-xs flex-1">
              {/* التبويب 1: البيانات والتواصل */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">اسم المنشأة أو الكيان *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="مثال: فندق عدن بلازا، مطاعم الشيباني، مستشفى النخبة..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none focus:border-[#FFC500]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">التصنيف الرسمي التابع له *</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      >
                        {OFFICIAL_CATEGORIES.map(c => {
                          const dbCat = categoriesMap[c.slug];
                          const val = dbCat ? dbCat.id : c.id;
                          return (
                            <option key={c.id} value={val}>
                              {c.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">المدينة / المحافظة</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      >
                        <option value="صنعاء">صنعاء</option>
                        <option value="عدن">عدن</option>
                        <option value="تعز">تعز</option>
                        <option value="حضرموت">حضرموت</option>
                        <option value="إب">إب</option>
                        <option value="الحديدة">الحديدة</option>
                        <option value="ذمار">ذمار</option>
                        <option value="مأرب">مأرب</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-gray-300 font-bold">العنوان التفصيلي وموقع النشاط</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                        placeholder="الشارع، الحي، أقرب معلم..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">رقم الهاتف الرسمي</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+967..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">رقم الواتساب</label>
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                        placeholder="+967..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">الموقع الإلكتروني (Website)</label>
                      <input
                        type="text"
                        value={formData.website_url}
                        onChange={(e) => setFormData(p => ({ ...p, website_url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">نبذة تعريفية ووصف المنشأة</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="وصف الخدمات، تاريخ التأسيس، المنتجات الرئيسية، المميزات..."
                      className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* التبويب 2: وسائط العرض المباشرة من الهاتف */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {/* رفع الغلاف العريض والشعار */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* الشعار */}
                    <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                      <label className="text-gray-300 font-bold block">شعار المنشأة (Logo)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                          {formData.logo_url ? (
                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#0B0F17] hover:bg-[#FFC500] hover:text-black text-gray-300 border border-[#1F2937] font-bold text-xs flex items-center gap-1.5 transition-colors">
                          <Upload size={13} />
                          {uploadingTarget === 'logo' ? 'جاري الرفع...' : 'اختر من الهاتف'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadFile('logo', e)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* الغلاف العريض */}
                    <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                      <label className="text-gray-300 font-bold block">الغلاف البانورامي (Cover Banner)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-14 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                          {formData.cover_url ? (
                            <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-[#0B0F17] hover:bg-[#FFC500] hover:text-black text-gray-300 border border-[#1F2937] font-bold text-xs flex items-center gap-1.5 transition-colors">
                          <Upload size={13} />
                          {uploadingTarget === 'cover' ? 'جاري الرفع...' : 'رفع غلاف من الهاتف'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadFile('cover', e)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* معرض الصور الأربع المخصصة للعرض */}
                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-bold flex items-center gap-2">
                        <ImageIcon size={15} className="text-[#FFC500]" />
                        معرض المنشأة (أربع صور للعرض من استوديو الهاتف)
                      </label>
                      <span className="text-[11px] text-gray-400">تظهر في صفحة المنشأة العامة للزائر</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const imgUrl = formData.gallery_urls[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-1.5 text-center">
                            <div className="h-24 rounded-xl bg-[#0B0F17] border border-[#1F2937] relative overflow-hidden flex items-center justify-center group">
                              {imgUrl ? (
                                <>
                                  <img src={imgUrl} alt={`Gallery ${slotIdx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...formData.gallery_urls];
                                      next[slotIdx] = null;
                                      setFormData(p => ({ ...p, gallery_urls: next }));
                                    }}
                                    className="absolute top-1 left-1 p-1 rounded-lg bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-600 text-[11px]">صورة #{slotIdx + 1}</span>
                              )}
                            </div>

                            <label className="cursor-pointer block py-1.5 px-2 rounded-lg bg-[#0B0F17] hover:bg-[#FFC500] hover:text-black text-gray-400 text-[10px] font-bold border border-[#1F2937] transition-colors">
                              {uploadingTarget === String(slotIdx) ? 'جاري الرفع...' : 'رفع من الهاتف'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadFile(slotIdx, e)}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* التبويب 3: الحقول المخصصة لكل قطاع */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs flex items-center gap-2">
                    <Sparkles size={16} />
                    حقول مخصصة لقطاع: <strong className="text-white">{categoriesMap[formData.category_id]?.name || 'العام'}</strong>
                  </div>

                  {/* مواصفات الفنادق والشاليهات */}
                  {(selectedCatSlug.includes('hotel') || selectedCatSlug.includes('chalet')) && (
                    <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                      <h4 className="font-bold text-white flex items-center gap-2"><Bed size={15} className="text-[#FFC500]" /> مواصفات الإقامة الفندقية</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-400 text-[11px] block mb-1">إجمالي الغرف والأجنحة</label>
                          <input
                            type="text"
                            value={formData.rooms_count}
                            onChange={e => setFormData(p => ({ ...p, rooms_count: e.target.value }))}
                            placeholder="مثال: 45 جناح وغرفة فندقية"
                            className="w-full p-2 bg-[#0B0F17] border border-[#1F2937] rounded-xl text-white"
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.has_pool}
                              onChange={e => setFormData(p => ({ ...p, has_pool: e.target.checked }))}
                              className="accent-[#FFC500]"
                            />
                            <span>مسبح خاص / عام</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.has_wifi}
                              onChange={e => setFormData(p => ({ ...p, has_wifi: e.target.checked }))}
                              className="accent-[#FFC500]"
                            />
                            <span>واي فاي مجاني سريع</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* مواصفات المستشفيات والعيادات */}
                  {(selectedCatSlug.includes('hospital') || selectedCatSlug.includes('clinic')) && (
                    <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                      <h4 className="font-bold text-white flex items-center gap-2"><Stethoscope size={15} className="text-[#FFC500]" /> التجهيزات الطبية</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.has_emergency}
                            onChange={e => setFormData(p => ({ ...p, has_emergency: e.target.checked }))}
                            className="accent-[#FFC500]"
                          />
                          <span>طوارئ 24 ساعة</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.has_icu}
                            onChange={e => setFormData(p => ({ ...p, has_icu: e.target.checked }))}
                            className="accent-[#FFC500]"
                          />
                          <span>عناية مركزة وغرف عمليات</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* مواصفات المطاعم والكافيهات */}
                  {(selectedCatSlug.includes('restaurant') || selectedCatSlug.includes('cafe')) && (
                    <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                      <h4 className="font-bold text-white flex items-center gap-2"><Sparkles size={15} className="text-[#FFC500]" /> خدمات الضيافة والأطعمة</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.has_family_sections}
                            onChange={e => setFormData(p => ({ ...p, has_family_sections: e.target.checked }))}
                            className="accent-[#FFC500]"
                          />
                          <span>قسم عوائل خاص ومستقل</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.has_delivery}
                            onChange={e => setFormData(p => ({ ...p, has_delivery: e.target.checked }))}
                            className="accent-[#FFC500]"
                          />
                          <span>خدمة التوصيل السريع للمنازل</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* مواصفات معارض السيارات ومحلات الذهب */}
                  {selectedCatSlug.includes('car') && (
                    <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.warranty_available}
                          onChange={e => setFormData(p => ({ ...p, warranty_available: e.target.checked }))}
                          className="accent-[#FFC500]"
                        />
                        <span>فحص وضمان ميكانيكي معتمد</span>
                      </label>
                    </div>
                  )}

                  {/* أوقات الدوام العامة لكافة المنشآت */}
                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2">
                    <label className="text-gray-300 font-bold block flex items-center gap-1.5"><Clock size={14} /> مواعيد وساعات الدوام اليومي</label>
                    <input
                      type="text"
                      value={formData.working_hours}
                      onChange={e => setFormData(p => ({ ...p, working_hours: e.target.value }))}
                      placeholder="مثال: يومياً من 08:00 صباحاً حتى 11:30 مساءً"
                      className="w-full p-2.5 bg-[#0B0F17] border border-[#1F2937] rounded-xl text-white"
                    />
                  </div>
                </div>
              )}

              {/* التبويب 4: الوحدات الإعلانية الثلاث والتوثيق والملكية */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  {/* الوحدات الإعلانية الثلاث للمنصة */}
                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Megaphone size={16} className="text-[#FFC500]" />
                        تفعيل الوحدات الإعلانية الثلاث (YR Ads) في صفحة القسم
                      </h4>
                      <span className="text-[10px] text-amber-400 font-bold">نظام إعلانات المنصة الرسمي</span>
                    </div>

                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1F2937] cursor-pointer">
                        <div>
                          <p className="font-bold text-white">1. الوحدة الإعلانية العلوية (Top Banner Ad)</p>
                          <p className="text-[11px] text-gray-400">بنر ترويجي رئيسي أعلى صفحة التصنيف للمنشآت المميزة</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.ad_unit_top}
                          onChange={e => setFormData(p => ({ ...p, ad_unit_top: e.target.checked }))}
                          className="w-4 h-4 accent-[#FFC500]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1F2937] cursor-pointer">
                        <div>
                          <p className="font-bold text-white">2. الوحدة الإعلانية المضمنة (In-Feed Sponsor Ad)</p>
                          <p className="text-[11px] text-gray-400">تظهر بين كروت المنشآت لجذب الزوار أثناء التصفح</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.ad_unit_feed}
                          onChange={e => setFormData(p => ({ ...p, ad_unit_feed: e.target.checked }))}
                          className="w-4 h-4 accent-[#FFC500]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1F2937] cursor-pointer">
                        <div>
                          <p className="font-bold text-white">3. الوحدة الإعلانية المثبتة (Sticky Bottom Ad)</p>
                          <p className="text-[11px] text-gray-400">بنر ثابت أسفل الشاشة للعروض الخاصة والحملات الكبرى</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.ad_unit_sticky}
                          onChange={e => setFormData(p => ({ ...p, ad_unit_sticky: e.target.checked }))}
                          className="w-4 h-4 accent-[#FFC500]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* الشارات، التقييم، وحالة الملكية والنشاط */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">نوع الشارة الملكية (Badge)</label>
                      <select
                        value={formData.badge_type || 'none'}
                        onChange={(e) => setFormData(p => ({
                          ...p,
                          badge_type: e.target.value === 'none' ? null : (e.target.value as any)
                        }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      >
                        <option value="gold">شارة ذهبية (Gold Badge) 🏆</option>
                        <option value="blue">شارة موثقة زرقاء (Blue Verified) 🛡️</option>
                        <option value="gray">شارة فضية اعتيادية (Silver)</option>
                        <option value="none">بدون شارة (قياسي)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">حالة إثبات الملكية (Claim Status)</label>
                      <select
                        value={formData.claim_status}
                        onChange={(e) => setFormData(p => ({ ...p, claim_status: e.target.value as any }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      >
                        <option value="UNCLAIMED">غير مطالب بها (جاهزة لطلب الملكية)</option>
                        <option value="PENDING">طلب توثيق قيد المراجعة</option>
                        <option value="CLAIMED">مملوكة وموثقة رسمياً للمالك</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">حالة الظهور</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                      >
                        <option value="active">نشط ومعروض</option>
                        <option value="pending">غير نشط / معلق</option>
                        <option value="hidden">مخفي بالكامل</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">التقييم الافتراضي (1 - 5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData(p => ({ ...p, rating: parseFloat(e.target.value) || 4.5 }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-300 font-bold">عدد المراجعات والتقييمات</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.review_count}
                        onChange={(e) => setFormData(p => ({ ...p, review_count: parseInt(e.target.value) || 0 }))}
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* أزرار الحفظ الموحدة */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#161D2B] text-gray-300 hover:text-white font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-black font-black shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'حفظ كافة التعديلات' : 'إضافة ونشر المنشأة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
