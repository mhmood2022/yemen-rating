import React from 'react';
import { useComparison } from '../../context/ComparisonContext';
import { YRBusiness } from '../../types/database.types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses?: YRBusiness[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose }) => {
  const context = useComparison();
  const selectedBusinesses = context?.selectedBusinesses || [];
  const removeFromCompare = context?.removeFromCompare || (() => {});
  const clearComparison = context?.clearComparison || (() => {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dir-rtl bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl rounded-2xl border p-6 text-white shadow-2xl max-h-[90vh] flex flex-col justify-between" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-code-compare text-xl" style={{ color: '#FFC107' }}></i>
            <h3 className="text-xl font-bold text-white">مقارنة المنشآت المختارة ({selectedBusinesses.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            {selectedBusinesses.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs px-3 py-1.5 rounded-lg border transition hover:bg-red-500/20 text-red-400"
                style={{ borderColor: '#DC2626' }}
              >
                مسح القائمة
              </button>
            )}
            <button onClick={onClose} className="hover:opacity-75 transition text-gray-400 hover:text-white">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>

        {/* Modal Content / Comparison Table */}
        <div className="my-6 overflow-x-auto flex-1">
          {selectedBusinesses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="fa-solid fa-code-compare text-4xl mb-3" style={{ color: '#A1A1AA' }}></i>
              <p className="font-bold">لم تقم بإضافة أي منشآت للمقارنة بعد.</p>
              <p className="text-xs mt-1 text-gray-500">اختر منشأتين أو أكثر من الصفحة الرئيسية لمقارنة خدماتهما بوضوح.</p>
            </div>
          ) : (
            <table className="w-full text-right text-sm border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: '#2A2A2A' }}>
                  <th className="p-3 text-gray-400 font-medium min-w-[120px]">المعيار</th>
                  {selectedBusinesses.map((b) => (
                    <th key={b?.id || Math.random()} className="p-3 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-white">{b?.name || 'منشأة'}</span>
                        <button
                          onClick={() => b?.id && removeFromCompare(b.id)}
                          className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                        >
                          <i className="fa-solid fa-trash-can"></i> إزالة
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                <tr>
                  <td className="p-3 text-gray-400 font-medium">التصنيف</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b?.id || Math.random()} className="p-3 text-center text-amber-400 font-bold">{b?.category_name || 'غير محدد'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-gray-400 font-medium">المدينة</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b?.id || Math.random()} className="p-3 text-center text-white">{b?.city || 'صنعاء'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-gray-400 font-medium">التقييم العام</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b?.id || Math.random()} className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-[#0D0D0D] px-2.5 py-1 rounded-lg border text-amber-400 border-[#2A2A2A] font-bold">
                        <i className="fa-solid fa-star text-xs"></i>
                        {b?.rating || '5.0'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-gray-400 font-medium">الوصف والخدمات</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b?.id || Math.random()} className="p-3 text-center text-xs text-gray-300 leading-relaxed">
                      {b?.description || 'خدمات متنوعة ومتميزة.'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-gray-400 font-medium">التواصل المباشر</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b?.id || Math.random()} className="p-3 text-center">
                      {b?.whatsapp ? (
                        <a
                          href={`https://wa.me/${b.whatsapp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-white transition hover:opacity-90"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          <i className="fa-brands fa-whatsapp text-sm"></i>
                          واتساب
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">غير متوفر</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t pt-4 flex justify-end" style={{ borderColor: '#2A2A2A' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white border transition hover:bg-gray-800"
            style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
