import React, { useState, useEffect } from 'react';
import { Home, Plus, Building, MapPin, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const RealEstateManager: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([
    {
      id: 'prop-1',
      title: 'عمارة تجارية استثمارية - 5 أدوار',
      city: 'صنعاء',
      location: 'شارع حدة العام',
      price: '450,000 $',
      type: 'بيع',
      status: 'نشط'
    },
    {
      id: 'prop-2',
      title: 'فيلا سكنية فاخرة مجهزة بالكامل',
      city: 'عدن',
      location: 'حي السفارات',
      price: '1,500 $ / شهرياً',
      type: 'إيجار',
      status: 'نشط'
    }
  ]);

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FFC500]">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة العقارات والاستثمار</h1>
            <p className="text-xs text-gray-400 mt-1">التحكم في العروض العقارية، الأراضي، والمكاتب المعتمدة.</p>
          </div>
        </div>
        <button onClick={() => alert('نافذة إضافة عرض عقاري جديد')} className="px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg">
          <Plus size={16} /> إضافة عرض عقاري
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((prop) => (
          <div key={prop.id} className="p-5 rounded-3xl bg-[#0e1320] border border-[#222b42] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFC500]/15 text-[#FFC500] text-xs font-bold">{prop.type}</span>
              <span className="text-base font-black text-white">{prop.price}</span>
            </div>
            <h3 className="text-sm font-bold text-white">{prop.title}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={13} className="text-[#FFC500]" /> {prop.city} • {prop.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealEstateManager;
