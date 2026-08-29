import React, { useState } from 'react';
import { Home, Eye, EyeOff, ShieldCheck, Lock, Unlock, DollarSign } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  propertyType: string;
  city: string;
  price: number;
  currency: string;
  ownerName: string;
  contactNumber: string;
  isContactHidden: boolean;
  commissionRate: number;
  isCommissionHiddenFromSeller: boolean;
  status: 'available' | 'deal_in_progress' | 'sold';
}

export const RealEstateManager: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 'PROP-201',
      title: 'عمارة سكنية تجارية 5 أدوار',
      type: 'sale',
      propertyType: 'عمارة',
      city: 'صنعاء - حدة',
      price: 850000,
      currency: 'USD',
      ownerName: 'عبدالرحمن الحداد',
      contactNumber: '+967 777 123 456',
      isContactHidden: true,
      commissionRate: 2.5,
      isCommissionHiddenFromSeller: false,
      status: 'available'
    },
    {
      id: 'PROP-202',
      title: 'شقة فاخرة مفروشة إطلالة بحرية',
      type: 'rent',
      propertyType: 'شقة',
      city: 'عدن - خور مكسر',
      price: 3500,
      currency: 'SAR',
      ownerName: 'سالم الكاف',
      contactNumber: '+967 733 987 654',
      isContactHidden: false,
      commissionRate: 5.0,
      isCommissionHiddenFromSeller: true,
      status: 'deal_in_progress'
    },
    {
      id: 'PROP-203',
      title: 'أرض زراعية واستثمارية مسورة',
      type: 'sale',
      propertyType: 'أرض',
      city: 'إب - بعدان',
      price: 45000000,
      currency: 'YER',
      ownerName: 'محمود الصبري',
      contactNumber: '+967 711 555 777',
      isContactHidden: true,
      commissionRate: 2.0,
      isCommissionHiddenFromSeller: false,
      status: 'available'
    }
  ]);

  // تبديل حجب/كشف بيانات الاتصال
  const toggleContactLock = (id: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, isContactHidden: !p.isContactHidden } : p));
  };

  // تبديل إظهار/إخفاء العمولة عن صاحب العقار
  const toggleCommissionVisibility = (id: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, isCommissionHiddenFromSeller: !p.isCommissionHiddenFromSeller } : p));
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Home className="text-[#FFC500]" />
          إدارة العقارات والصفقات
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          حماية أرقام التواصل للمالكين، التحكم في إظهار أو إخفاء العمولة عن صاحب العقار، واحتساب العمولات بعملة الإعلان.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">العقار والنوع</th>
                <th className="py-3.5 px-4">السعر والعملة</th>
                <th className="py-3.5 px-4">بيانات التواصل المباشر</th>
                <th className="py-3.5 px-4 text-center">ظهور العمولة للمالك</th>
                <th className="py-3.5 px-4 text-center">عمولة المنصة (داخلياً)</th>
                <th className="py-3.5 px-4 text-center">حالة العرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {properties.map((prop) => {
                const commissionVal = (prop.price * (prop.commissionRate / 100));

                return (
                  <tr key={prop.id} className="hover:bg-[#161D2B]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{prop.title}</div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {prop.city} • <span className="text-[#FFC500]">{prop.type === 'sale' ? 'للبيع' : 'للإيجار'}</span> ({prop.propertyType})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm">
                      {prop.price.toLocaleString()} <span className="text-[#FFC500] text-xs">{prop.currency}</span>
                    </td>

                    {/* حماية رقم التواصل */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {prop.isContactHidden ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#DC2626]/10 text-[#DC2626] font-mono text-[11px]">
                            <Lock size={12} />
                            <span>رقم الهاتف محجوب</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16A34A]/10 text-[#16A34A] font-mono text-[11px]">
                            <Unlock size={12} />
                            <span>{prop.contactNumber}</span>
                          </div>
                        )}
                        <button
                          onClick={() => toggleContactLock(prop.id)}
                          className="p-1 rounded bg-[#161D2B] text-[#9CA3AF] hover:text-white"
                          title="تبديل حالة كشف الرقم"
                        >
                          {prop.isContactHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* إظهار/إخفاء العمولة عن صاحب العقار */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleCommissionVisibility(prop.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          prop.isCommissionHiddenFromSeller
                            ? 'border-gray-600 bg-gray-800/40 text-gray-400'
                            : 'border-[#16A34A]/40 bg-[#16A34A]/10 text-[#16A34A]'
                        }`}
                      >
                        {prop.isCommissionHiddenFromSeller ? 'مخفية عن المالك' : 'ظاهرة للمالك'}
                      </button>
                    </td>

                    {/* احتساب العمولة الداخلي */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">
                      {commissionVal.toLocaleString()} {prop.currency} ({prop.commissionRate}%)
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prop.status === 'available' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                        prop.status === 'deal_in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {prop.status === 'available' ? 'متاح للطلب' : prop.status === 'deal_in_progress' ? 'جارٍ إتمام الصفقة' : 'مباع'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
