import React, { useState, useEffect, useRef } from 'react';
import { Building, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { PropertyCard } from '../properties/PropertyCard';
import { YRSelect } from '../common/YRSelect';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'كل المدن والمحافظات' },
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
  { value: 'سقطرى', label: 'أرخبيل سقطرى' },
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

export const RealEstatePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'بيع' | 'إيجار'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenAddModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول إلى حسابك أولاً لتتمكن من إضافة عقار جديد');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remaining = 6 - uploadedImages.length;
      if (remaining <= 0) {
        setToastMessage('الحد الأقصى المسموح به هو 6 صور فقط');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      const taken = Array.from(files).slice(0, remaining);
      taken.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setUploadedImages((prev) => (prev.length < 6 ? [...prev, reader.result as string] : prev));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setOwnerPhone(numeric);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToCommission) return;

    if (ownerPhone.length !== 9) {
      setToastMessage('يرجى إدخال رقم هاتف مكون من 9 أرقام بالضبط (مثال: 77XXXXXXX)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول أولاً لإرسال العقار');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        title: newTitle.trim(),
        deal_type: newDealType,
        property_type: newPropertyType,
        city: newCity,
        location_details: newLocationDetails.trim() || newCity,
        price: parseFloat(newPrice) || 0,
        currency: newCurrency,
        area_m2: parseFloat(newArea) || 0,
        rooms: parseInt(newRooms) || 0,
        owner_id: session.user.id,
        images: uploadedImages,
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
      setToastMessage('تم إرسال العقار بنجاح وتوثيق الصور');
      setTimeout(() => setToastMessage(null), 4000);
      fetchProperties();
    } catch (err: any) {
      setToastMessage(err.message || 'حدث خطأ أثناء إرسال العقار');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const dealType = prop.deal_type || prop.dealType;
    const propType = prop.property_type || prop.propertyType;

    const matchDeal = dealTypeFilter === 'all' || dealType === dealTypeFilter;
    const matchType = typeFilter === 'all' || propType === typeFilter;
    const matchCity = cityFilter === 'all' || (prop.city && prop.city.includes(cityFilter));

    return matchDeal && matchType && matchCity;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Cairo'] text-white">
      <AdBanner placementId="5" className="mb-1" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس مع زر أضف عقار */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0D1527] border border-slate-800 text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all"
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
            className="p-2 bg-[#0D1527] border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط الفلترة الموحد الأنيق بدون أي ألوان رمادية */}
      <div className="bg-[#0D1527] p-3 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1 bg-[#060A13] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDealTypeFilter('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              dealTypeFilter === 'all' ? 'bg-[#F5C400] text-black font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setDealTypeFilter('بيع')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              dealTypeFilter === 'بيع' ? 'bg-[#F5C400] text-black font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            للبيع
          </button>
          <button
            onClick={() => setDealTypeFilter('إيجار')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              dealTypeFilter === 'إيجار' ? 'bg-[#F5C400] text-black font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            للإيجار
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <YRSelect
            value={typeFilter}
            options={PROPERTY_TYPES}
            onChange={(val) => setTypeFilter(val)}
            placeholder="كافة الأنواع"
          />
          <YRSelect
            value={cityFilter}
            options={YEMEN_GOVERNORATES}
            onChange={(val) => setCityFilter(val)}
            placeholder="كل المدن والمحافظات"
          />
        </div>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري تحميل العقارات الحقيقية...</span>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-[#0D1527] rounded-2xl border border-slate-800 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#F5C400] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد عقارات معروضة حالياً</h3>
          <p className="text-xs text-slate-300">كن أول من يضيف عقاراً بالضغط على زر "أضف عقار" أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      {/* نافذة أضف عقار */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto font-['Cairo'] text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-[#F5C400]" /> إضافة عقار جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-[#060A13] text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#F5C400] block mb-1 font-bold">نوع المعاملة *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDealType('بيع')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newDealType === 'بيع' ? 'bg-[#F5C400] text-black border-[#F5C400]' : 'bg-[#060A13] text-slate-300 border-slate-800'
                    }`}
                  >
                    للبيع
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDealType('إيجار')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newDealType === 'إيجار' ? 'bg-[#F5C400] text-black border-[#F5C400]' : 'bg-[#060A13] text-slate-300 border-slate-800'
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
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
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
                  className="w-full py-2.5 border border-dashed border-slate-800 hover:border-[#F5C400] rounded-xl bg-[#060A13] text-white flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <ImagePlus size={16} className="text-[#F5C400]" />
                  <span>{uploadedImages.length >= 6 ? 'تم بلوغ الحد الأقصى (6 صور)' : 'اضغط لاختيار الصور من استوديو الجوال'}</span>
                </button>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-slate-800 bg-[#060A13]">
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
                    className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
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
                    className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                  />
                </div>
                <div>
                  <label className="block text-white mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={newRooms}
                    onChange={(e) => setNewRooms(e.target.value)}
                    className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
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
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white text-left font-mono focus:outline-none focus:border-[#F5C400]"
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
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
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

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#060A13] border border-slate-800 text-white text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToCommission || ownerPhone.length !== 9 || submitting}
                  className="px-5 py-2 rounded-xl bg-[#F5C400] disabled:opacity-40 text-black font-black text-xs transition-colors shadow-md"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال العقار للاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
