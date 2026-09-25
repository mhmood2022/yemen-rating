import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  ImageIcon, 
  Trash2, 
  Bed, 
  Clock, 
  Megaphone, 
  Check, 
  CheckCircle2, 
  Edit3,
  ChevronDown,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { DynamicSectorFeatures } from '../../pages/admin/companies/DynamicSectorFeatures';

const YEMEN_CITIES = [
  'صنعاء', 'عدن', 'مأرب', 'تعز', 'حضرموت', 'الحديدة', 'إب', 'ذمار', 
  'شبوة', 'صعدة', 'لحج', 'أبين', 'المهرة', 'حجة', 'البيضاء', 
  'عمران', 'الضالع', 'سقطرى', 'المحويت', 'ريمة', 'الجوف'
];

interface CustomSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  allowCustomCategory?: boolean;
}

const CustomDarkSelect: React.FC<CustomSelectProps> = ({ label, value, options, onChange, allowCustomCategory }) => {
  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsAddingNew(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value || 'اختر...';

  const handleAddNewCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    try {
      const slug = 'cat-' + Date.now().toString(36);
      const { data } = await supabase
        .from('categories')
        .insert([{ name: trimmed, slug: slug }])
        .select()
        .single();
      if (data) {
        setDynamicCategories(prev => [...prev, data]);
        onChange(data.id);
      } else {
        onChange(trimmed);
      }
    } catch (e) {
      onChange(trimmed);
    } finally {
      setIsAddingNew(false);
      setOpen(false);
      setNewCatName('');
    }
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-gray-300 font-bold block">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] hover:border-[#FFC500]/50 rounded-xl text-white flex items-center justify-between text-xs outline-none transition"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180 text-[#FFC500]' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-[#161D2B] border border-[#1F2937] rounded-xl shadow-2xl p-1 space-y-0.5 no-scrollbar">
          
          {/* خيار افتراضي: اختر الصنف */}
          {allowCustomCategory && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-right px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-[#0B0F17] hover:text-white transition-colors"
            >
              اختر الصنف
            </button>
          )}

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

          {/* خيار إضافة صنف جديد */}
          {allowCustomCategory && (
            <div className="pt-1 mt-1 border-t border-[#1F2937]">
              {!isAddingNew ? (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full text-right px-3 py-2 rounded-lg text-xs font-black text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ صنف جديد</span>
                </button>
              ) : (
                <div className="p-2 space-y-2 bg-[#0B0F17] rounded-lg border border-amber-500/30">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="اكتب اسم الصنف الجديد..."
                    className="w-full p-2 bg-[#161D2B] border border-[#1F2937] focus:border-[#FFC500] rounded-lg text-white text-xs outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-2.5 py-1 text-[11px] text-gray-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-1 bg-[#FFC500] text-black font-black text-[11px] rounded-md hover:bg-amber-400 transition"
                    >
                      تأكيد
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

interface UnifiedFacilityEditorProps {
  businessId?: string | null;
  onSaved?: (data: any) => void;
}

export const UnifiedFacilityEditor: React.FC<UnifiedFacilityEditorProps> = ({ businessId, onSaved }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'features' | 'ads'>('info');
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [categoriesMap, setCategoriesMap] = useState<Record<string, { id: string; name: string; slug: string }>>({});
  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const [formData, setFormData] = useState({
    id: '',
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
    logo_url: null as string | null,
    cover_url: null as string | null,
    gallery_urls: [null, null, null, null] as (string | null)[],
    badge_type: null as any,
    is_verified: false,
    status: 'active' as any,
    claim_status: 'CLAIMED' as any,
    rating: 5,
    review_count: 0,
    ad_unit_top: false,
    ad_unit_feed: false,
    ad_unit_sticky: false,
    working_hours: 'مفتوح 24 ساعة يومياً',
    rooms_count: 'متوسطة (10-30)',
    has_pool: false,
    has_wifi: false,
    has_parking: false,
    has_emergency: false,
    has_icu: false,
    has_delivery: false,
    has_family_sections: false,
    warranty_available: false,
    gold_carat: null,
    sector_features: [] as any[],
    biz_promotions: [] as any[],
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data: dbCategories } = await supabase.from('categories').select('id, name, slug');
        if (dbCategories && dbCategories.length > 0) {
          setDynamicCategories(dbCategories);
          const map: Record<string, { id: string; name: string; slug: string }> = {};
          dbCategories.forEach(c => { map[c.slug] = c; });
          setCategoriesMap(map);
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCats();
  }, []);

  const categoryOptions = useMemo(() => {
    return OFFICIAL_CATEGORIES.map(c => {
      const dbCat = categoriesMap[c.slug];
      return {
        value: dbCat?.id || c.slug,
        label: c.name,
        slug: c.slug
      };
    });
  }, [categoriesMap]);

  const cityOptions = useMemo(() => {
    return YEMEN_CITIES.map(c => ({ value: c, label: c }));
  }, []);

  const selectedCatSlug = useMemo(() => {
    const found = categoryOptions.find(o => o.value === formData.category_id || o.slug === formData.category_id);
    return found ? found.slug : 'companies';
  }, [formData.category_id, categoryOptions]);

  useEffect(() => {
    if (!businessId) return;
    const loadBusiness = async () => {
      try {
        const { data: b } = await supabase.from('businesses').select('*').eq('id', businessId).single();
        if (b) {
          const sec = b.sections_config || {};
          const feats = sec.features || {};
          setFormData({
            id: b.id,
            name: b.name || '',
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
            gallery_urls: (b.gallery_urls && b.gallery_urls.length > 0) ? b.gallery_urls : [null, null, null, null],
            badge_type: b.badge_type || null,
            is_verified: !!b.is_verified,
            status: b.status || 'active',
            claim_status: b.claim_status || 'CLAIMED',
            rating: b.rating || 5,
            review_count: b.review_count || 0,
            ad_unit_top: sec.ad_unit_top ?? false,
            ad_unit_feed: sec.ad_unit_feed ?? false,
            ad_unit_sticky: sec.ad_unit_sticky ?? false,
            working_hours: sec.working_hours || 'مفتوح 24 ساعة يومياً',
            rooms_count: feats.rooms_count || 'متوسطة (10-30)',
            has_pool: !!feats.has_pool,
            has_wifi: !!feats.has_wifi,
            has_parking: !!feats.has_parking,
            has_emergency: !!feats.has_emergency,
            has_icu: !!feats.has_icu,
            has_delivery: !!feats.has_delivery,
            has_family_sections: !!feats.has_family_sections,
            warranty_available: !!feats.warranty_available,
            gold_carat: feats.gold_carat || null,
            sector_features: feats.sector_features || [],
            biz_promotions: feats.biz_promotions || [],
          });
        }
      } catch (e) {
        console.error('Error loading business:', e);
      }
    };
    loadBusiness();
  }, [businessId]);

  const handleUploadFile = async (target: 'logo' | 'cover' | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(String(target));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `businesses/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      
      let finalUrl = '';
      if (!uploadError) {
        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        finalUrl = data.publicUrl;
      } else {
        finalUrl = URL.createObjectURL(file);
      }

      if (target === 'logo') {
        setFormData(p => ({ ...p, logo_url: finalUrl }));
      } else if (target === 'cover') {
        setFormData(p => ({ ...p, cover_url: finalUrl }));
      } else if (typeof target === 'number') {
        const next = [...formData.gallery_urls];
        next[target] = finalUrl;
        setFormData(p => ({ ...p, gallery_urls: next }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingTarget(null);
    }
  };

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

    let finalCatId = formData.category_id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCatId)) {
      const match = categoriesMap[finalCatId] || dynamicCategories.find(c => c.slug === finalCatId);
      finalCatId = match ? match.id : null as any;
    }

    const payload = {
      name: formData.name.trim(),
      slug: generatedSlug,
      category_id: finalCatId,
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
      rating: formData.rating ? Number(formData.rating) : 5,
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
          sector_features: formData.sector_features || [],
          biz_promotions: formData.biz_promotions || [],
        }
      },
      updated_at: new Date().toISOString(),
    };

    try {
      if (businessId) {
        const { error } = await supabase.from('businesses').update(payload).eq('id', businessId);
        if (error) throw error;
      }

      setSavedSuccessfully(true);
      const text = `تم حفظ وتحديث بيانات "${formData.name}" بنجاح في السيرفر!`;
      setSuccessToast(text);

      if (onSaved) onSaved(payload);

      setTimeout(() => setSavedSuccessfully(false), 2500);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err?.message || 'تعذر الحفظ في قاعدة البيانات.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full text-right font-['Cairo',sans-serif]" dir="rtl">
      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-[#161D2B] border-2 border-emerald-500 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-3 shadow-2xl backdrop-blur-xl">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-[#1F2937] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFC500]/10 text-[#FFC500]">
            <Edit3 size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white">تعديل بيانات المنشأة</h2>
            <p className="text-[10px] text-gray-400">حفظ فوري ورفع مباشر من الهاتف أو الحاسوب</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-[#1F2937] bg-[#0B0F17] px-2 overflow-x-auto no-scrollbar text-xs font-bold gap-1 py-1 shrink-0 rounded-2xl mb-4">
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
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
        {/* STEP 1: INFO */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">اسم المنشأة أو الكيان *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="أدخل اسم المنشأة (شركة، مصنع، بنك، فندق)..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              {/* دعم اختيار الصنف وإضافة صنف جديد */}
              <CustomDarkSelect
                label="التصنيف الرسمي (كافة القطاعات الـ 30) *"
                value={formData.category_id}
                options={categoryOptions}
                onChange={(val) => setFormData(p => ({ ...p, category_id: val }))}
                allowCustomCategory={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CustomDarkSelect
                label="المحافظة / المدينة *"
                value={formData.city}
                options={cityOptions}
                onChange={(val) => setFormData(p => ({ ...p, city: val }))}
              />

              <div className="space-y-1 sm:col-span-2">
                <label className="text-gray-300 font-bold block">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="الشارع، الحي، أقرب معلم بارز..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">رقم الهاتف الرسمي</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+967..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">رقم الواتساب</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="+967..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">رابط الموقع أو الخريطة</label>
                <input
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData(p => ({ ...p, website_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-bold block">نبذة ووصف المنشأة للزوار</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="اكتب نبذة مميزة تشرح خدمات وتجهيزات منشأتك..."
                className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                <label className="text-gray-300 font-bold block">شعار المنشأة (Logo)</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-gray-500" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs flex items-center gap-2 shadow-md">
                    <Upload size={14} />
                    {uploadingTarget === 'logo' ? 'جاري الرفع...' : 'اختر من الهاتف'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFile('logo', e)} />
                  </label>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
                <label className="text-gray-300 font-bold block">الغلاف البانورامي (Cover Banner)</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden flex items-center justify-center shrink-0">
                    {formData.cover_url ? (
                      <img src={formData.cover_url} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-gray-500" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#161D2B] hover:bg-[#FFC500] hover:text-black border border-[#1F2937] text-white font-bold text-xs flex items-center gap-2 transition-all">
                    <Upload size={14} />
                    {uploadingTarget === 'cover' ? 'جاري الرفع...' : 'رفع غلاف من الهاتف'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFile('cover', e)} />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-3">
              <label className="text-white font-bold flex items-center gap-2">
                <ImageIcon size={16} className="text-[#FFC500]" />
                معرض المنشأة (أربع صور للعرض من استوديو الهاتف)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const imgUrl = formData.gallery_urls[slotIdx];
                  return (
                    <div key={slotIdx} className="space-y-2 text-center">
                      <div className="h-28 rounded-2xl bg-[#0B0F17] border border-[#1F2937] relative overflow-hidden flex items-center justify-center group">
                        {imgUrl ? (
                          <>
                            <img src={imgUrl} alt={`Slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
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
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadFile(slotIdx, e)} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FEATURES & PROMOTIONS */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2.5">
              <label className="text-white font-bold flex items-center gap-2">
                <Bed size={15} className="text-[#FFC500]" />
                سعة وحجم المنشأة / نطاق العمل (اسحب واختر):
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {['منشأة ناشئة (1-10)', 'متوسطة (10-30)', '20-50 غرفة', '50-100 جناح', 'صرح كبير (+100)'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, rooms_count: chip }))}
                    className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition-all ${
                      formData.rooms_count === chip
                        ? 'bg-[#FFC500] text-black shadow-md'
                        : 'bg-[#0B0F17] text-gray-300 border border-[#1F2937]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <DynamicSectorFeatures
              categorySlug={selectedCatSlug}
              savedFeatures={formData.sector_features || []}
              onChange={(updatedFeatures: any[]) => {
                setFormData(p => ({
                  ...p,
                  sector_features: updatedFeatures,
                  has_pool: updatedFeatures.some((f: any) => f.label.includes('مسبح') && f.enabled),
                  has_wifi: updatedFeatures.some((f: any) => f.label.includes('واي فاي') && f.enabled),
                  has_parking: updatedFeatures.some((f: any) => f.label.includes('مواقف') && f.enabled),
                  has_emergency: updatedFeatures.some((f: any) => f.label.includes('طوارئ') && f.enabled),
                  has_icu: updatedFeatures.some((f: any) => f.label.includes('عناية') && f.enabled),
                  has_delivery: updatedFeatures.some((f: any) => f.label.includes('توصيل') && f.enabled),
                  has_family_sections: updatedFeatures.some((f: any) => f.label.includes('عائل') && f.enabled),
                  warranty_available: updatedFeatures.some((f: any) => f.label.includes('ضمان') && f.enabled),
                }));
              }}
            />

            <div className="p-4 sm:p-5 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-white font-bold flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC500]"></span>
                  <span className="text-[#FFC500] font-black">العروض الترويجية والخصومات (لكافة التصنيفات):</span>
                </label>
                <span className="text-[11px] text-zinc-400">تظهر في تبويب العروض بالقالب الفردي الموحد</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#0B0F17] p-3.5 rounded-xl border border-[#1F2937]">
                <input
                  type="text"
                  placeholder="عنوان العرض (مثال: خصم خاص، عرض الموسم)..."
                  id="admin-offer-title"
                  className="bg-[#161D2B] border border-[#1F2937] focus:border-[#FFC500] text-white text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="تفاصيل الخصم أو العرض (مثال: خصم 15% على الكشف أو التوصيل)..."
                    id="admin-offer-desc"
                    className="flex-1 bg-[#161D2B] border border-[#1F2937] focus:border-[#FFC500] text-white text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const titleEl = document.getElementById('admin-offer-title') as HTMLInputElement;
                      const descEl = document.getElementById('admin-offer-desc') as HTMLInputElement;
                      if (titleEl && descEl && (titleEl.value.trim() || descEl.value.trim())) {
                        const newOffer = {
                          title: titleEl.value.trim() || 'عرض خاص',
                          description: descEl.value.trim() || ''
                        };
                        const currentOffers = (formData as any).biz_promotions || [];
                        setFormData(prev => ({ ...prev, biz_promotions: [...currentOffers, newOffer] }));
                        titleEl.value = '';
                        descEl.value = '';
                      }
                    }}
                    className="bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs px-5 py-3 rounded-xl transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    + إضافة عرض
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {((formData as any).biz_promotions || []).map((offer: any, index: number) => {
                  const title = typeof offer === 'string' ? offer : (offer.title || 'عرض خاص');
                  const desc = typeof offer === 'string' ? '' : (offer.description || '');
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 bg-[#0B0F17] border border-amber-500/30 p-3.5 rounded-xl shadow-md"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-[#FFC500] font-black text-xs sm:text-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC500]"></span>
                          <span>{title}</span>
                        </h4>
                        {desc && <p className="text-white text-xs font-normal pr-3">{desc}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentOffers = (formData as any).biz_promotions || [];
                          setFormData(prev => ({ ...prev, biz_promotions: currentOffers.filter((_, i) => i !== index) }));
                        }}
                        className="text-red-400 hover:text-red-300 font-bold text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                      >
                        حذف
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <span className="text-[11px] text-zinc-400 block">عروض سريعة جاهزة (اضغط للإضافة الفورية):</span>
                <div className="flex flex-wrap gap-1.5">
                  {['خصم 20% لفترة محدودة', 'توصيل مجاني للطلبات الكبيرة', 'عرض خاص بمناسبة الافتتاح', 'هدية مجانية مع كل خدمة'].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const currentOffers = (formData as any).biz_promotions || [];
                        const exists = currentOffers.some((o: any) => (typeof o === 'string' ? o : o.title) === preset);
                        if (!exists) {
                          setFormData(prev => ({ ...prev, biz_promotions: [...currentOffers, { title: preset, description: '' }] }));
                        }
                      }}
                      className="bg-black border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 text-[11px] font-bold px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-2">
              <label className="text-white font-bold flex items-center gap-1.5">
                <Clock size={15} className="text-[#FFC500]" />
                مواعيد وساعات الدوام اليومي:
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
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

        {/* STEP 4: ADS */}
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
              <CustomDarkSelect
                label="الشارة الملكية"
                value={formData.badge_type || 'none'}
                options={[
                  { value: 'none', label: 'بدون شارة' },
                  { value: 'gold', label: 'شارة ذهبية (VIP)' },
                  { value: 'blue', label: 'شارة موثقة زرقاء' },
                  { value: 'gray', label: 'شارة عادية' },
                ]}
                onChange={(val) => setFormData(p => ({ ...p, badge_type: val === 'none' ? null : val as any }))}
              />

              <CustomDarkSelect
                label="حالة إثبات الملكية"
                value={formData.claim_status}
                options={[
                  { value: 'CLAIMED', label: 'تم إثبات الملكية (مطالب بها وموثقة)' },
                  { value: 'PENDING', label: 'قيد المراجعة والتدقيق' },
                  { value: 'UNCLAIMED', label: 'غير مطالب بها (جاهزة للمطالبة)' },
                ]}
                onChange={(val) => setFormData(p => ({ ...p, claim_status: val as any }))}
              />

              <CustomDarkSelect
                label="حالة الظهور"
                value={formData.status}
                options={[
                  { value: 'active', label: 'نشط ومعروض للموقع العام' },
                  { value: 'hidden', label: 'مخفي مؤقتاً' },
                  { value: 'pending', label: 'قيد الانتظار' },
                ]}
                onChange={(val) => setFormData(p => ({ ...p, status: val as any }))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1F2937]">
          <div className="flex-1 min-w-0">
            {savedSuccessfully && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs animate-bounce">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="truncate">تم الحفظ بنجاح في السيرفر!</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ بالسيرفر...' : 'حفظ كافة التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnifiedFacilityEditor;
