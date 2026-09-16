import React, { useState, useEffect } from 'react';
import { Building, ArrowRight, MapPin, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
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

      {/* الرأس */}
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

        <button
          onClick={fetchProperties}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#162238] border border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          <span>تحديث البيانات</span>
        </button>
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
          <p className="text-xs text-slate-400">سيتم إدراج العقارات المعتمدة فور تسجيلها وتدقيقها في المنصة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};
