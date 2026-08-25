import React from 'react';
import { BusinessItem } from '../../types/database.types';

interface Props {
  businesses: BusinessItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export const ComparisonModal: React.FC<Props> = ({ businesses, isOpen, onClose, onRemove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans" dir="rtl">
      <div className="bg-[#14141C] border border-[#2A2A38] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#22222E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 text-base">
              <i className="fa-solid fa-scale-balanced"></i>
            </div>
            <h2 className="text-base font-black text-white">جدول المقارنة المباشرة بين الأنشطة المنافسة</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 text-lg">✕</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#22222E]">
                <th className="pb-3 text-neutral-400 font-bold">معيار المقارنة</th>
                {businesses.map(b => (
                  <th key={b.id} className="pb-3 px-3 text-amber-400 font-black text-sm">
                    <div className="flex items-center justify-between">
                      <span>{b.name}</span>
                      <button onClick={() => onRemove(b.id)} className="text-rose-400 hover:text-rose-300 text-xs mr-2">✕</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222E]">
              <tr>
                <td className="py-3 text-neutral-400 font-bold">التقييم العام</td>
                {businesses.map(b => <td key={b.id} className="py-3 px-3 font-bold text-white">★ {b.rating} ({b.reviews_count} تقييم)</td>)}
              </tr>
              <tr>
                <td className="py-3 text-neutral-400 font-bold">مؤشر YR Score</td>
                {businesses.map(b => <td key={b.id} className="py-3 px-3 font-black text-amber-400">YR {b.yr_score}</td>)}
              </tr>
              <tr>
                <td className="py-3 text-neutral-400 font-bold">ساعات العمل</td>
                {businesses.map(b => <td key={b.id} className="py-3 px-3">{b.hours}</td>)}
              </tr>
              <tr>
                <td className="py-3 text-neutral-400 font-bold">الموقع والحي</td>
                {businesses.map(b => <td key={b.id} className="py-3 px-3">{b.city} - {b.district}</td>)}
              </tr>
              <tr>
                <td className="py-3 text-neutral-400 font-bold">الخدمات المتاحة</td>
                {businesses.map(b => <td key={b.id} className="py-3 px-3 text-neutral-300">{b.services.join('، ')}</td>)}
              </tr>
              <tr>
                <td className="py-3 text-neutral-400 font-bold">التواصل المباشر</td>
                {businesses.map(b => (
                  <td key={b.id} className="py-3 px-3">
                    <a href={`tel:${b.phone}`} className="text-amber-400 font-bold hover:underline">{b.phone}</a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
