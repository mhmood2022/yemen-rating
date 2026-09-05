import React, { useState, useEffect } from 'react';
import { 
  Landmark, Search, Filter, ShieldCheck, CheckCircle2, 
  XCircle, Edit3, Image, Upload, Trash2, Eye, ExternalLink,
  Phone, Globe, Mail, MapPin, AlertCircle, Check, X, Loader2, Plus
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BankRecord {
  id: string;
  name: string;
  slug: string | null;
  city: string;
  address: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  badge_type: string | null;
  verified: boolean;
  status: string;
  is_published: boolean;
  priority_level: string | null;
  display_order: number | null;
  created_at?: string;
  posts?: any[];
}

export const BanksManager: React.FC = () => {
  const [banks, setBanks] = useState<BankRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // نافذة التعديل
  const [selectedBank, setSelectedBank] = useState<BankRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // حقول النموذج
  const [formData, setFormData] = useState<Partial<BankRecord>>({});
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([null, null, null, null]);

  // جلب البنوك الحقيقية من Supabase
  const fetchBanks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (err) {
      console.error('Error fetching banks from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // فتح نافذة إضافة بنك جديد
  const handleOpenAdd = () => {
    setSelectedBank(null);
    setFormData({
      name: '',
      slug: '',
      city: 'صنعاء',
      address: '',
      description: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      logo_url: null,
      cover_url: null,
      badge_type: 'gold',
      verified: false,
      status: 'active',
      is_published: true,
      priority_level: 'normal'
    });
    setGalleryImages([null, null, null, null]);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  // فتح نافذة التعديل
  const handleOpenEdit = (bank: BankRecord) => {
    setSelectedBank(bank);
    setFormData({ ...bank });
    
    // استخراج صور المعرض الأربع المعتمدة
    let initialGallery: (string | null)[] = [null, null, null, null];
    if (bank.posts && Array.isArray(bank.posts)) {
      bank.posts.slice(0, 4).forEach((p: any, idx: number) => {
        initialGallery[idx] = p.image || p.file_url || null;
      });
    }
    setGalleryImages(initialGallery);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  // دالة رفع الصور المباشرة إلى Supabase Storage (bank-images)
  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('bank-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('bank-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      console.warn('Direct bucket upload fallback:', err);
      // في حال وجود أي عائق في الـ bucket نستخدم dataURL لضمان استمرار عمل الإدارة
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // معالجة اختيار الملفات
  const handleImageFileChange = async (type: 'logo' | 'cover' | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetKey = typeof type === 'number' ? `gallery-${type}` : type;
    setUploadingTarget(targetKey);

    try {
      const folderName = type === 'logo' ? 'logos' : (type === 'cover' ? 'covers' : 'gallery');
      const publicUrl = await uploadToStorage(file, folderName);

      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      } else if (type === 'cover') {
        setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      } else if (typeof type === 'number') {
        setGalleryImages(prev => {
          const updated = [...prev];
          updated[type] = publicUrl;
          return updated;
        });
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('تعذر رفع الصورة، يرجى المحاولة مرة أخرى');
    } finally {
      setUploadingTarget(null);
    }
  };

  // حذف صورة
  const handleRemoveImage = (type: 'logo' | 'cover' | number) => {
    if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo_url: null }));
    } else if (type === 'cover') {
      setFormData(prev => ({ ...prev, cover_url: null }));
    } else if (typeof type === 'number') {
      setGalleryImages(prev => {
        const updated = [...prev];
        updated[type] = null;
        return updated;
      });
    }
  };

  // حفظ التعديلات في Supabase
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault(); if (!formData.name) {
      alert('يرجى كتابة اسم البنك على الأقل');
      return;
    }
    setSaving(true);
    setSaveSuccess(false);

    try {
      // تجهيز مصفوفة المعرض الأربع
      const validPosts = galleryImages
        .filter(img => img !== null)
        .map((img, idx) => ({
          id: idx + 1,
          title: (formData.name || 'البنك') + ' - صورة ' + (idx + 1),
          image: img,
          tag: formData.name || 'البنك'
        }));

      const payload = {
        name: formData.name,
        slug: formData.slug || null,
        city: formData.city,
        address: formData.address,
        description: formData.description,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        website: formData.website,
        logo_url: formData.logo_url,
        cover_url: formData.cover_url,
        badge_type: formData.badge_type || 'gold',
        verified: formData.verified === true,
        status: formData.status || 'active',
        is_published: formData.is_published !== false,
        priority_level: formData.priority_level || 'normal',
        posts: validPosts
      };

      let error;
      if (selectedBank && selectedBank.id) {
        const res = await supabase
          .from('banks')
          .update(payload)
          .eq('id', selectedBank.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('banks')
          .insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      setSaveSuccess(true);
      fetchBanks();
      setTimeout(() => {
        setIsEditing(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating bank in Supabase:', err);
      alert('حدث خطأ أثناء حفظ بيانات البنك: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setSaving(false);
    }
  };

  // فلترة البنوك الحقيقية
  const filteredBanks = banks.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCity = filterCity === 'all' || (b.city && b.city.includes(filterCity));
    const matchVerified = filterVerified === 'all' || 
                          (filterVerified === 'verified' && b.verified) || 
                          (filterVerified === 'unverified' && !b.verified);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchCity && matchVerified && matchStatus;
  });

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-6 font-['Cairo',sans-serif] text-white">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Landmark className="text-[#FFC500]" /> إدارة البنوك والمصارف المعتمدة
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إدارة سجلات البنوك، التوثيق، الشارات، ومعارض الصور مباشرة من قاعدة بيانات Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs font-mono font-bold text-[#FFC500]">
            {banks.length} بنك مسجل
          </span>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>إضافة بنك جديد</span>
            </button>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0B0F17] p-3.5 rounded-2xl border border-[#1F2937]">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم البنك أو المدينة..."
            className="w-full bg-[#161D2B] border border-[#273244] rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FFC500]"
          />
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="bg-[#161D2B] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC500]"
        >
          <option value="all">جميع المدن</option>
          <option value="صنعاء">صنعاء</option>
          <option value="تعز">تعز</option>
          <option value="عدن">عدن</option>
          <option value="حضرموت">حضرموت</option>
        </select>

        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="bg-[#161D2B] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC500]"
        >
          <option value="all">كل حالات التوثيق</option>
          <option value="verified">موثق فقط (Verified)</option>
          <option value="unverified">غير موثق</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#161D2B] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FFC500]"
        >
          <option value="all">كل الحالات (Status)</option>
          <option value="active">نشط (Active)</option>
          <option value="inactive">غير نشط (Inactive)</option>
        </select>
      </div>

      {/* جدول البنوك الحقيقية */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">جاري تحميل البنوك من Supabase...</div>
      ) : filteredBanks.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500 bg-[#0B0F17] rounded-2xl border border-[#1F2937]">
          لا توجد بنوك مطابقة للبحث.
        </div>
      ) : (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-gray-300 font-bold border-b border-[#1F2937]">
                <tr>
                  <th className="p-3.5">البنك</th>
                  <th className="p-3.5">المدينة</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">التوثيق والشارة</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/50">
                {filteredBanks.map((bank) => (
                  <tr key={bank.id} className="hover:bg-[#161D2B]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {bank.logo_url ? (
                          <img src={bank.logo_url} alt={bank.name} className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-gray-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#1F2937] flex items-center justify-center text-[#FFC500]">
                            <Landmark size={18} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {bank.name}
                            {bank.verified && <CheckCircle2 size={14} className="text-[#1D9BF0]" />}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {bank.slug || bank.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-300 font-medium">{bank.city || 'اليمن'}</td>
                    <td className="p-3.5 text-gray-300 font-mono">{bank.phone || '—'}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        bank.badge_type === 'blue' 
                          ? 'bg-[#1D9BF0]/10 text-[#1D9BF0] border-[#1D9BF0]/30' 
                          : 'bg-[#FFC500]/10 text-[#FFC500] border-[#FFC500]/30'
                      }`}>
                        {bank.badge_type === 'blue' ? 'شارة زرقاء' : 'شارة ذهبية'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        bank.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {bank.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(bank)}
                        className="px-3 py-1.5 rounded-xl bg-[#161D2B] hover:bg-[#FFC500] hover:text-black border border-[#273244] text-[#FFC500] text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>تعديل السجل</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة تعديل بيانات البنك الشاملة */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B0F17] border border-[#1F2937] rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto text-right max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* رأس النافذة */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Landmark className="text-[#FFC500]" size={18} />
                  {selectedBank ? ('تعديل بيانات: ' + selectedBank.name) : 'إضافة بنك جديد'}
                </h3>
                {selectedBank ? (
                  <span className="text-[11px] text-gray-400 font-mono">ID: {selectedBank.id}</span>
                ) : (
                  <span className="text-[11px] text-gray-400">تسجيل بنك جديد في قاعدة البيانات</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-[#161D2B] text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> تم تحديث بيانات البنك وحفظها في Supabase بنجاح!
              </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-4 text-xs">
              
              {/* 1. إدارة الشعار والغلاف */}
              <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
                <h4 className="font-bold text-[#FFC500] text-xs flex items-center gap-1.5">
                  <Image size={14} /> الشعار والغلاف الرسمي (مستودع bank-images)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* الشعار */}
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 font-bold">شعار البنك (Logo)</label>
                    <div className="flex items-center gap-3">
                      {formData.logo_url ? (
                        <div className="relative w-16 h-16 rounded-xl bg-white p-1 border border-gray-600 shrink-0">
                          <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('logo')}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center shadow"
                            title="حذف"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[#161D2B] border border-dashed border-gray-600 flex items-center justify-center text-gray-500 shrink-0">
                          <Landmark size={24} />
                        </div>
                      )}
                      <label className="px-3 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5">
                        {uploadingTarget === 'logo' ? <Loader2 size={13} className="animate-spin text-[#FFC500]" /> : <Upload size={13} />}
                        <span>{formData.logo_url ? 'استبدال الشعار' : 'رفع شعار'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange('logo', e)} />
                      </label>
                    </div>
                  </div>

                  {/* الغلاف */}
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 font-bold">غلاف البنك (Cover)</label>
                    <div className="flex items-center gap-3">
                      {formData.cover_url ? (
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-gray-600 shrink-0">
                          <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('cover')}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center shadow"
                            title="حذف"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-16 rounded-xl bg-gradient-to-r from-[#002244] to-[#0A4D80] border border-gray-600 flex items-center justify-center text-white/40 text-[10px] shrink-0">
                          غلاف افتراضي
                        </div>
                      )}
                      <label className="px-3 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5">
                        {uploadingTarget === 'cover' ? <Loader2 size={13} className="animate-spin text-[#FFC500]" /> : <Upload size={13} />}
                        <span>{formData.cover_url ? 'استبدال الغلاف' : 'رفع غلاف'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange('cover', e)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. معرض الصور الأربع المعتمد (الحد الأقصى 4 صور) */}
              <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[#FFC500] text-xs flex items-center gap-1.5">
                    <Image size={14} /> صور المعرض الأربع المعتمدة (الحد الأقصى 4 صور)
                  </h4>
                  <span className="text-[10px] text-gray-400">تظهر في تبويب المعرض بصفحة البنك</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const img = galleryImages[slotIdx];
                    const isUp = uploadingTarget === `gallery-${slotIdx}`;
                    return (
                      <div key={slotIdx} className="bg-[#161D2B] border border-[#273244] rounded-xl p-2 text-center space-y-1.5 relative">
                        <span className="text-[10px] font-bold text-gray-400 block">صورة {slotIdx + 1}</span>
                        {img ? (
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-700">
                            <img src={img} alt={'Gallery ' + (slotIdx + 1)} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(slotIdx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center shadow"
                              title="حذف الصورة"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full aspect-square rounded-lg border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 gap-1">
                            {isUp ? <Loader2 size={18} className="animate-spin text-[#FFC500]" /> : <Image size={20} />}
                            <span className="text-[9px]">{isUp ? 'جاري الرفع...' : 'فارغة'}</span>
                          </div>
                        )}
                        <label className="w-full py-1 rounded-lg bg-[#1F2937] hover:bg-[#FFC500] hover:text-black text-gray-300 text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1">
                          <Upload size={11} />
                          <span>{img ? 'استبدال' : 'رفع'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(slotIdx, e)} />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. البيانات الأساسية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-bold mb-1">اسم البنك <span className="text-[#FFC500]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">المعرف اللطيف (Slug للرابط)</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="مثال: tadhamon أو kuraimi"
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">المدينة المقر</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              {/* 4. الوصف والنبذة */}
              <div>
                <label className="block text-white font-bold mb-1">الوصف والنبذة التعريفية</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                ></textarea>
              </div>

              {/* 5. بيانات الاتصال والتواصل */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-bold mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">واتساب</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">الموقع الإلكتروني</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              {/* 6. التوثيق والحالات والشارة */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#1F2937]">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">نوع الشارة</label>
                  <select
                    value={formData.badge_type || 'gold'}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_type: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="gold">ذهبية (Gold)</option>
                    <option value="blue">زرقاء (Blue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">حالة التوثيق</label>
                  <select
                    value={formData.verified ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.value === 'true' }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="true">موثق (Verified)</option>
                    <option value="false">غير موثق</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">حالة البنك</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">حالة النشر</label>
                  <select
                    value={formData.is_published !== false ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.value === 'true' }))}
                    className="w-full bg-[#161D2B] border border-[#273244] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="true">منشور للعامة</option>
                    <option value="false">مسودة مخفية</option>
                  </select>
                </div>
              </div>

              {/* أزرار الحفظ والإغلاق */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[#161D2B] text-gray-300 font-bold hover:bg-[#1F2937] transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black transition flex items-center gap-1.5 shadow-lg shadow-[#FFC500]/10 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'جاري الحفظ في Supabase...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
