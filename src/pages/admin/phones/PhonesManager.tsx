import React, { useState } from 'react';
import { Smartphone, CheckCircle, Tag, Search } from 'lucide-react';

export const PhonesManager: React.FC = () => {
  const [phones] = useState([
    { id: 'PH-1', model: 'iPhone 15 Pro Max (256GB)', brand: 'Apple', city: 'صنعاء', price: '1,150 USD', condition: 'جديد كرت', store: 'مركز أبل الخليج', status: 'available' },
    { id: 'PH-2', model: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', city: 'عدن', price: '1,080 USD', condition: 'جديد كرت', store: 'سامسونج ستور', status: 'available' },
    { id: 'PH-3', model: 'Xiaomi 14 Pro (512GB)', brand: 'Xiaomi', city: 'تعز', price: '720 USD', condition: 'شبه جديد', store: 'فون زون', status: 'sold' },
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Smartphone className="text-[#FFC500]" />
          إدارة سوق الهواتف والأجهزة الذكية
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          متابعة عروض الهواتف الجديدة والمستعملة، أسعار المتاجر، وحالة الإعلانات.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">موديل الهاتف</th>
              <th className="py-3.5 px-4">المتجر والمدينة</th>
              <th className="py-3.5 px-4">الحالة</th>
              <th className="py-3.5 px-4 text-center">السعر المعروض</th>
              <th className="py-3.5 px-4 text-center">حالة العرض</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {phones.map((p) => (
              <tr key={p.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4 font-bold text-white">{p.model}</td>
                <td className="py-3.5 px-4 text-[#9CA3AF]">{p.store} • {p.city}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-[#161D2B] text-gray-300 text-[10px] font-semibold">
                    {p.condition}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">{p.price}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'available' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {p.status === 'available' ? 'معروض للبيع' : 'تم البيع'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
