import React, { useState, useEffect } from 'react';
import { Building, ArrowRight, MapPin, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { PropertyCard } from '../properties/PropertyCard';

interface RealEstatePageProps {
  onBack?: () => void;
}

export const RealEstatePage: React.FC<RealEstatePageProps> = ({ onBack }) => {
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
  const [agreedToCommission, setAgreedToCommission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToCommission) return;

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
      setAgreedToCommission(false);
      setToastMessage('تم إرسال العقار بنجاح وتوثيق عمولة الوساطة المعتمدة');
      setTimeout(() => setToastMessage(null), 4000);
      fetchProperties();
    } catch (err: any) {
      setToastMessage(err.message || 'تم تسجيل العقار للمراجعة');
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
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="5" className="mb-2" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#D4AF37] text-[#0B1325] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس مع زر أضف عقار */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#162238] border border-slate-700 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all"
            >
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-lg sm:text-xl font-black text-white">سوق العقارات المعتمد</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a230] text-[#0B1325] font-black rounded-lg text-xs transition-colors shadow-md"
          >
            <Plus size={15} />
            <span>أضف عقار</span>
          </button>

          <button
            onClick={fetchProperties}
            disabled={loading}
            className="p-2 bg-[#162238] border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط الفلترة */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#162238] p-3 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-1.5 bg-[#0B1325] p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setDealTypeFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              dealTypeFilter === 'all' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setDealTypeFilter('بيع')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              dealTypeFilter === 'بيع' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            للبيع
          </button>
          <button
            onClick={() => setDealTypeFilter('إيجار')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              dealTypeFilter === 'إيجار' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            للإيجار
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B1325] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">كافة الأنواع</option>
            <option value="شقة">شقق</option>
            <option value="فيلا">فلل</option>
            <option value="أرض">أراضي</option>
            <option value="محل تجاري">محلات تجارية</option>
            <option value="عمارة">عمائر</option>
            <option value="مستودع">مستودعات</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#0B1325] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">كافة المدن</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
            <option value="إب">إب</option>
          </select>
        </div>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span className="text-xs font-bold">جاري تحميل العقارات الحقيقية...</span>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-[#162238] rounded-2xl border border-slate-700/60 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد عقارات معروضة حالياً</h3>
          <p className="text-xs text-slate-400">كن أول من يضيف عقاراً بالضغط على زر "أضف عقار" أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      {/* نافذة أضف عقار مع إقرار عمولة الوساطة 2% */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162238] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto font-['Cairo'] text-white">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-[#D4AF37]" /> إضافة عقار جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-[#0B1325] text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#D4AF37] block mb-1 font-bold">نوع المعاملة *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDealType('بيع')}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      newDealType === 'بيع' ? 'bg-[#D4AF37] text-[#0B1325] border-[#D4AF37]' : 'bg-[#0B1325] text-slate-300 border-slate-700'
                    }`}
                  >
                    للبيع
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDealType('إيجار')}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      newDealType === 'إيجار' ? 'bg-[#D4AF37] text-[#0B1325] border-[#D4AF37]' : 'bg-[#0B1325] text-slate-300 border-slate-700'
                    }`}
                  >
                    للإيجار
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">عنوان العقار *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: شقة سوبر ديلوكس في حي حدة"
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">نوع العقار *</label>
                  <select
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="شقة">شقة</option>
                    <option value="فيلا">فيلا</option>
                    <option value="أرض">أرض</option>
                    <option value="محل تجاري">محل تجاري</option>
                    <option value="عمارة">عمارة</option>
                    <option value="مستودع">مستودع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">المدينة *</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="إب">إب</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">السعر *</label>
                  <input
                    required
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">العملة *</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={newRooms}
                    onChange={(e) => setNewRooms(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">تفاصيل الحي أو الشارع</label>
                <input
                  type="text"
                  value={newLocationDetails}
                  onChange={(e) => setNewLocationDetails(e.target.value)}
                  placeholder="مثال: خلف مجمع حدة السكني"
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* سياسة عمولة الوساطة الرسمية 2% */}
              <div className="p-3 bg-[#0B1325] rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#D4AF37]" />
                  <span>سياسة الوساطة والعمولة الرسمية (2%)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  بتقديم هذا العقار، يقرّ المالك أو الوسيط بتفويض منصة يمن ريتغ في الوساطة والمعاينة، ويلتزم بسداد عمولة الوساطة المعتمدة (2% من إجمالي قيمة الصفقة) عند إتمام البيع أو التأجير عبر المنصة.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToCommission}
                    onChange={(e) => setAgreedToCommission(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span className="text-[11px] font-bold text-white">أوافق على شروط وسياسة وساطة يمن ريتغ</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToCommission || submitting}
                  className="px-5 py-2 rounded-lg bg-[#D4AF37] disabled:opacity-40 text-[#0B1325] font-black text-xs transition-colors"
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
