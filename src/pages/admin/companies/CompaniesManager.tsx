import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import {
  Building2, Search, Plus, Check, Filter, X, ShieldAlert,
  EyeOff, Eye, Edit3, Upload, Trash2, Phone, Globe, Mail,
  MapPin, CheckCircle2, Loader2, Award, ExternalLink, Star,
  Image as ImageIcon, Sparkles, Megaphone, Bed, Wifi, Car,
  Stethoscope, Clock, ShieldCheck, Tag, ChevronDown
} from 'lucide-react';

// مكون منسدل مخصص لا تعبث به متصفحات الهواتف نهائياً (Custom Dark Select)
const CustomSelect: React.FC<{
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder || value;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-right" ref={ref}>
      {label && <label className="text-gray-300 font-bold block mb-1 text-xs">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 bg-[#161D2B] text-white border border-[#1F2937] hover:border-[#FFC500]/50 rounded-xl text-xs outline-none transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180 text-[#FFC500]' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1.5 bg-[#161D2B] border-2 border-[#1F2937] rounded-xl shadow-2xl max-h-52 overflow-y-auto z-[90] p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-700">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-right px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#FFC500] text-black font-black'
                    : 'text-gray-200 hover:bg-[#0B0F17] hover:text-[#FFC500]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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

  // حالات رسالة النجاح الفورية
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // نافذة الإضافة والتعديل
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'features' | 'ads'>('info');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // تجميد وتثبيت خلفية الصفحة كلياً عند فتح النافذة على الهاتف (Body Scroll Lock)
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isModalOpen]);

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
    rooms_count: '20-50 غرفة',
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

  const cityOptions = [
    { value: 'all', label: 'كافة المحافظات والمدن' },
    { value: 'صنعاء', label: 'صنعاء' },
    { value: 'عدن', label: 'عدن' },
    { value: 'تعز', label: 'تعز' },
    { value: 'حضرموت', label: 'حضرموت' },
    { value: 'إب', label: 'إب' },
    { value: 'الحديدة', label: 'الحديدة' },
    { value: 'ذمار', label: 'ذمار' },
    { value: 'مأرب', label: 'مأرب' },
  ];

  const statusOptions = [
    { value: 'all', label: 'كافة الحالات' },
    { value: 'active', label: 'نشط ومعروض للموقع' },
    { value: 'pending', label: 'غير نشط / قيد المراجعة' },
    { value: 'hidden', label: 'مخفي وغير ظاهر' },
  ];

  const badgeOptions = [
    { value: 'all', label: 'كافة الشارات الملكية' },
    { value: 'gold', label: 'شارة ذهبية (Gold)' },
    { value: 'blue', label: 'شارة زرقاء موثقة' },
    { value: 'gray', label: 'شارة فضية اعتيادية' },
    { value: 'none', label: 'بدون شارة' },
  ];

  const claimOptions = [
    { value: 'UNCLAIMED', label: 'غير مطالب بها (جاهزة للمطالبة)' },
    { value: 'PENDING', label: 'طلب توثيق قيد المراجعة' },
    { value: 'CLAIMED', label: 'مملوكة وموثقة رسمياً' },
  ];

  const categoryDropdownOptions = useMemo(() => {
    return OFFICIAL_CATEGORIES.map(c => {
      const dbCat = categoriesMap[c.slug];
      const val = dbCat ? dbCat.id : c.id;
      return { value: val, label: c.name };
    });
  }, [categoriesMap]);

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

  const handleUploadFile = (target: 'logo' | 'cover' | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(String(target));
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const localBase64 = event.target?.result as string;
      if (target === 'logo') setFormData(p => ({ ...p, logo_url: localBase64 }));
      else if (target === 'cover') setFormData(p => ({ ...p, cover_url: localBase64 }));
      else if (typeof target === 'number') {
        setFormData(p => {
          const next = [...p.gallery_urls];
          next[target] = localBase64;
          return { ...p, gallery_urls: next };
        });
      }

      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const folder = target === 'logo' ? 'logos' : (target === 'cover' ? 'covers' : 'gallery');
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('businesses')
          .upload(fileName, file, { upsert: true });

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('businesses')
            .getPublicUrl(fileName);

          if (publicUrl) {
            if (target === 'logo') setFormData(p => ({ ...p, logo_url: publicUrl }));
            else if (target === 'cover') setFormData(p => ({ ...p, cover_url: publicUrl }));
            else if (typeof target === 'number') {
              setFormData(p => {
                const next = [...p.gallery_urls];
                next[target] = publicUrl;
                return { ...p, gallery_urls: next };
              });
            }
          }
        }
      } catch (uploadErr) {
        console.warn('Storage background upload notice:', uploadErr);
      } finally {
        setUploadingTarget(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setErrorMessage(null);
    setSavedSuccessfully(false);
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
      rooms_count: '20-50 غرفة',
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

  const handleOpenEditModal = (b: BusinessRecord) => {
    setEditingId(b.id);
    setErrorMessage(null);
    setSavedSuccessfully(false);
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
      rooms_count: feat.rooms_count || '20-50 غرفة',
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

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('يرجى إدخال اسم المنشأة.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const isEdit = !!editingId;
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
      if (isEdit) {
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

      // 1. إظهار النجاح فوراً عند زر الحفظ
      setSavedSuccessfully(true);

      const successText = isEdit
        ? `تم تحديث وحفظ بيانات "${formData.name}" بنجاح!`
        : `تمت إضافة ونشر "${formData.name}" بنجاح!`;

      setSuccessToast(successText);

      // 2. الانتظار ثانية واحدة ليراها المستخدم بوضوح قبل إغلاق النافذة
      setTimeout(() => {
        setSavedSuccessfully(false);
        setIsModalOpen(false);
      }, 1200);

      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);

    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'تعذر حفظ البيانات في السيرفر.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-6 font-['Cairo',sans-serif] text-white relative">
      {/* إشعار النجاح العائم المريح للهاتف (أسفل الشاشة مكان الإبهام) */}
      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3.5 rounded-2xl bg-[#161D2B] border-2 border-emerald-500 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-3 shadow-2xl backdrop-blur-xl">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span>{successToast}</span>
        </div>
      )}

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

      {/* شريط الفلاتر بالقوائم المنسدلة المخصصة الداركة 100% */}
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

        <CustomSelect
          value={filterCity}
          options={cityOptions}
          onChange={setFilterCity}
        />

        <CustomSelect
          value={filterStatus}
          options={statusOptions}
          onChange={setFilterStatus}
        />

        <CustomSelect
          value={filterBadge}
          options={badgeOptions}
          onChange={setFilterBadge}
        />
      </div>

      {/* قائمة البطاقات */}
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
            يمكنك الآن إضافة وتجهيز صفحات {activeOfficialCategory?.name || 'المنشآت'} ورفع الغلاف والشعار والصور ليطالب أصحابها بـ «إثبات الملكية» لاحقاً.
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
              <div className="relative h-28 bg-[#161D2B] overflow-hidden">
                {b.cover_url ? (
                  <img
                    src={b.cover_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center text-gray-600 text-xs">
                    لا يوجد غلاف بانورامي
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

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

                <div className="absolute -bottom-2 right-3 w-14 h-14 rounded-xl bg-[#0B0F17] border-2 border-[#1F2937] overflow-hidden shadow-lg flex items-center justify-center">
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#FFC500]" />
                  )}
                </div>
              </div>

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

      {/* المودال الشامل الموحد المطور للهاتف مع تجميد وعزل الخلفية بنسبة 100% */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          <div
            className="bg-[#0F141F] border border-[#1F2937] rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="p-4 sm:p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#111827] sticky top-0 z-30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFC500]/10 text-[#FFC500]">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white">
                    {editingId ? 'تعديل بيانات المنشأة' : 'إضافة منشأة جديدة'}
                  </h2>
                  <p className="text-[10px] text-gray-400">حفظ فوري ورفع مباشر من الهاتف</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl bg-[#161D2B]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-[#1F2937] bg-[#0B0F17] px-3 overflow-x-auto scrollbar-none text-xs font-bold gap-1 py-1 shrink-0">
              {[
                { id: 'info', label: '1. البيانات والتواصل' },
                { id: 'media', label: '2. الغلاف والشعار (4 صور)' },
                { id: 'features', label: '3. ميزات القطاع والسحب' },
                { id: 'ads', label: '4. الإعلانات والتوثيق' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3.5 rounded-xl whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#FFC500] text-black font-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-[#161D2B]'
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

            <form onSubmit={handleSaveBusiness} className="p-4 sm:p-5 space-y-4 text-xs flex-1">
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
                        placeholder="مثال: فندق سبأ، مطاعم الشيباني، مستشفى النخبة..."
                        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none focus:border-[#FFC500]"
                      />
                    </div>

                    <CustomSelect
                      label="التصنيف الرسمي *"
                      value={formData.category_id}
                      options={categoryDropdownOptions}
                      onChange={(val) => setFormData(p => ({ ...p, category_id: val }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CustomSelect
                      label="المدينة"
                      value={formData.city}
                      options={cityOptions.filter(o => o.value !== 'all')}
                      onChange={(val) => setFormData(p => ({ ...p, city: val }))}
                    />

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-gray-300 font-bold">العنوان التفصيلي</label>
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
                      <label className="text-gray-300 font-bold">رقم الهاتف</label>
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
                      <label className="text-gray-300 font-bold">الموقع الإلكتروني</label>
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
                    <label className="text-gray-300 font-bold">نبذة ووصف المنشأة</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="وصف الخدمات، المميزات، التأسيس..."
                      className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                      <label className="text-gray-300 font-bold block">شعار المنشأة (Logo)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                          {formData.logo_url ? (
                            <img
                              src={formData.logo_url}
                              alt="Logo Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <Building2 className="w-7 h-7 text-gray-500" />
                          )}
                        </div>
                        <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs flex items-center gap-2 shadow-md">
                          <Upload size={14} />
                          {uploadingTarget === 'logo' ? 'جاري المعاينة...' : 'اختر من الهاتف'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadFile('logo', e)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                      <label className="text-gray-300 font-bold block">الغلاف البانورامي (Cover Banner)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                          {formData.cover_url ? (
                            <img
                              src={formData.cover_url}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <ImageIcon className="w-7 h-7 text-gray-500" />
                          )}
                        </div>
                        <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#161D2B] hover:bg-[#FFC500] hover:text-black border border-[#1F2937] text-white font-bold text-xs flex items-center gap-2 transition-all">
                          <Upload size={14} />
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

                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-bold flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#FFC500]" />
                        معرض المنشأة (أربع صور للعرض من استوديو الهاتف)
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const imgUrl = formData.gallery_urls[slotIdx];
                        return (
                          <div key={slotIdx} className="space-y-2 text-center">
                            <div className="h-28 rounded-2xl bg-[#0B0F17] border border-[#1F2937] relative overflow-hidden flex items-center justify-center group">
                              {imgUrl ? (
                                <>
                                  <img
                                    src={imgUrl}
                                    alt={`Slot ${slotIdx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...formData.gallery_urls];
                                      next[slotIdx] = null;
                                      setFormData(p => ({ ...p, gallery_urls: next }));
                                    }}
                                    className="absolute top-1.5 left-1.5 p-1.5 rounded-lg bg-red-600 text-white shadow-lg"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500 text-xs font-mono">صورة #{slotIdx + 1}</span>
                              )}
                            </div>

                            <label className="cursor-pointer block py-2 px-2 rounded-xl bg-[#0B0F17] hover:bg-[#FFC500] hover:text-black text-gray-300 text-xs font-bold border border-[#1F2937] transition-all">
                              {uploadingTarget === String(slotIdx) ? 'جاري التحميل...' : 'اختر صورة'}
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

              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                    <label className="text-white font-bold flex items-center gap-2">
                      <Bed size={15} className="text-[#FFC500]" />
                      سعة وحجم المنشأة / عدد الغرف (اسحب واختر):
                    </label>
                    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                      {['منشأة ناشئة (1-10)', 'متوسطة (10-30)', '20-50 غرفة', '50-100 جناح', 'صرح كبير (+100)'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, rooms_count: chip }))}
                          className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition-all ${
                            formData.rooms_count === chip
                              ? 'bg-[#FFC500] text-black shadow-md shadow-yellow-500/10'
                              : 'bg-[#0B0F17] text-gray-300 border border-[#1F2937]'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                    <label className="text-white font-bold block">ميزات المنشأة (اضغط للتفعيل المباشر):</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'has_pool', label: 'مسبح خاص / عام', val: formData.has_pool },
                        { key: 'has_wifi', label: 'واي فاي مجاني سريع', val: formData.has_wifi },
                        { key: 'has_parking', label: 'مواقف سيارات واسعة', val: formData.has_parking },
                        { key: 'has_emergency', label: 'طوارئ 24 ساعة', val: formData.has_emergency },
                        { key: 'has_icu', label: 'عناية مركزة', val: formData.has_icu },
                        { key: 'has_delivery', label: 'توصيل للمنازل', val: formData.has_delivery },
                        { key: 'has_family_sections', label: 'جلسات عائلية خاصة', val: formData.has_family_sections },
                        { key: 'warranty_available', label: 'فحص وضمان معتمد', val: formData.warranty_available },
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, [item.key]: !item.val }))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            item.val
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-[#0B0F17] text-gray-500 border border-[#1F2937]'
                          }`}
                        >
                          <Check size={13} className={item.val ? 'opacity-100' : 'opacity-0'} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2">
                    <label className="text-white font-bold flex items-center gap-1.5">
                      <Clock size={15} className="text-[#FFC500]" />
                      مواعيد وساعات الدوام اليومي:
                    </label>
                    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                      {['08:00 ص - 10:00 م', 'مفتوح 24 ساعة يومياً', 'فترة صباحية ومسائية', '09:00 ص - 01:00 بعد منتصف الليل'].map(shift => (
                        <button
                          key={shift}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, working_hours: shift }))}
                          className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition-all ${
                            formData.working_hours === shift
                              ? 'bg-[#FFC500] text-black'
                              : 'bg-[#0B0F17] text-gray-400 border border-[#1F2937]'
                          }`}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Megaphone size={16} className="text-[#FFC500]" />
                        تفعيل الوحدات الإعلانية الثلاث (YR Ads) في هذا القسم
                      </h4>
                      <span className="text-[10px] text-amber-400 font-bold">معتمدة للموقع العام</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'ad_unit_top', title: '1. البنر العلوي الرئيسي (Top Banner Ad)', sub: 'يظهر في أعلى صفحة القسم للمنشآت المميزة' },
                        { key: 'ad_unit_feed', title: '2. الإعلان المضمن (In-Feed Sponsor Ad)', sub: 'يظهر بين بطاقات المنشآت أثناء التصفح' },
                        { key: 'ad_unit_sticky', title: '3. البنر الثابت (Sticky Bottom Ad)', sub: 'مثبت أسفل الشاشة للعروض الخاصة' },
                      ].map(ad => (
                        <label key={ad.key} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-[#1F2937] cursor-pointer">
                          <div>
                            <p className="font-bold text-white">{ad.title}</p>
                            <p className="text-[11px] text-gray-400">{ad.sub}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={(formData as any)[ad.key]}
                            onChange={e => setFormData(p => ({ ...p, [ad.key]: e.target.checked }))}
                            className="w-5 h-5 accent-[#FFC500]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CustomSelect
                      label="الشارة الملكية"
                      value={formData.badge_type || 'none'}
                      options={badgeOptions.filter(o => o.value !== 'all')}
                      onChange={(val) => setFormData(p => ({ ...p, badge_type: val === 'none' ? null : (val as any) }))}
                    />

                    <CustomSelect
                      label="حالة إثبات الملكية"
                      value={formData.claim_status}
                      options={claimOptions}
                      onChange={(val) => setFormData(p => ({ ...p, claim_status: val as any }))}
                    />

                    <CustomSelect
                      label="حالة الظهور"
                      value={formData.status}
                      options={statusOptions.filter(o => o.value !== 'all')}
                      onChange={(val) => setFormData(p => ({ ...p, status: val as any }))}
                    />
                  </div>
                </div>
              )}

              {/* شريط الإجراءات السفلي مع رسالة النجاح المرئية بجانب زر الحفظ مباشرة */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1F2937] sticky bottom-0 bg-[#0F141F] py-2.5">
                <div className="flex-1 min-w-0">
                  {savedSuccessfully && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs animate-bounce">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="truncate">تم الحفظ بنجاح في السيرفر!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#161D2B] text-gray-300 hover:text-white font-bold text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving || savedSuccessfully}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
                      savedSuccessfully
                        ? 'bg-emerald-500 text-black scale-105'
                        : 'bg-[#FFC500] hover:bg-[#e6b200] text-black'
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : savedSuccessfully ? (
                      <>
                        <Check size={16} className="stroke-[3]" />
                        <span>تم الحفظ بنجاح!</span>
                      </>
                    ) : (
                      <span>{editingId ? 'حفظ كافة التعديلات' : 'إضافة ونشر المنشأة'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
