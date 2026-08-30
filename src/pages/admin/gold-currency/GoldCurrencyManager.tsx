import React, { useState } from 'react';
import { Coins, TrendingUp, RefreshCw, Plus, Edit2, Check, AlertCircle } from 'lucide-react';
import { adminRatesService } from '../../../services/adminService';

export const GoldCurrencyManager: React.FC = () => {
  const [rates, setRates] = useState([
    { id: '1', currency: 'الدولار الأمريكي (USD)', code: 'USD', buySanaa: 535, sellSanaa: 538, buyAden: 1910, sellAden: 1925, source: 'يدوي (إدارة)', lastUpdated: 'الآن' },
    { id: '2', currency: 'الريال السعودي (SAR)', code: 'SAR', buySanaa: 140.2, sellSanaa: 140.8, buyAden: 501, sellAden: 504, source: 'يدوي (إدارة)', lastUpdated: 'منذ 10 دقائق' },
  ]);

  const [editingRate, setEditingRate] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiMsg, setApiMsg] = useState('');

  // استدعاء التحديث الخارجي مع Fallback
  const handleFetchExternal = async () => {
    setApiLoading(true);
    setApiMsg('');
    const res = await adminRatesService.fetchExternalRates();
    if (res.success) {
      setApiMsg('تم مزامنة الأسعار الخارجية بنجاح مع الاحتفاظ بقيم صنعاء وعدن المخصصة');
    } else {
      setApiMsg(res.error || 'تم العودة للإدخال اليدوي المعتمد');
    }
    setApiLoading(false);
  };

  // حفظ التعديل اليدوي
  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    setRates(prev => prev.map(r => r.id === editingRate.id ? { ...editingRate, source: 'يدوي (إدارة)', lastUpdated: 'الآن' } : r));
    await adminRatesService.updateRateManual(editingRate.id, editingRate.buySanaa, editingRate.sellSanaa, editingRate.buyAden, editingRate.sellAden);
    setEditingRate(null);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Coins className="text-[#FFC500]" />
            الذهب، العملات، والبنوك
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            تعديل أسعار الشراء والبيع يدويًا لصنعاء وعدن، ربط الـ API الخارجي مع الحفاظ على الإدخال اليدوي.
          </p>
        </div>

        <button
          onClick={handleFetchExternal}
          disabled={apiLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161D2B] text-white hover:border-[#FFC500] border border-[#1F2937] text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={apiLoading ? 'animate-spin text-[#FFC500]' : ''} />
          <span>{apiLoading ? 'جارٍ الفحص...' : 'فحص ومزامنة الأسعار العالمية'}</span>
        </button>
      </div>

      {apiMsg && (
        <div className="p-3 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs text-[#FFC500] flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{apiMsg}</span>
        </div>
      )}

      {/* جدول أسعار الصرف مع التعديل الحي والمصدر */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FFC500]" /> أسعار الصرف (صنعاء / عدن)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3 px-4">العملة</th>
                <th className="py-3 px-4 text-center">شراء (صنعاء)</th>
                <th className="py-3 px-4 text-center">بيع (صنعاء)</th>
                <th className="py-3 px-4 text-center">شراء (عدن)</th>
                <th className="py-3 px-4 text-center">بيع (عدن)</th>
                <th className="py-3 px-4 text-center">المصدر ووقت التحديث</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {rates.map(r => (
                <tr key={r.id} className="hover:bg-[#161D2B]/50">
                  <td className="py-3.5 px-4 font-bold">{r.currency}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">{r.buySanaa}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">{r.sellSanaa}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#16A34A]">{r.buyAden}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#16A34A]">{r.sellAden}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] text-[#9CA3AF] block">{r.source}</span>
                    <span className="text-[9px] text-[#6B7280] font-mono">{r.lastUpdated}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setEditingRate(r)}
                      className="px-2.5 py-1 rounded bg-[#161D2B] text-[#FFC500] hover:bg-[#FFC500] hover:text-black font-bold text-[11px] transition-all"
                    >
                      تعديل يدوي
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal التعديل اليدوي */}
      {editingRate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">تعديل أسعار {editingRate.currency} يدويًا</h3>

            <form onSubmit={handleSaveManual} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div className="col-span-2 text-[11px] font-bold text-[#FFC500]">أسعار صنعاء (YER):</div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">شراء</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRate.buySanaa}
                    onChange={(e) => setEditingRate({ ...editingRate, buySanaa: Number(e.target.value) })}
                    className="w-full bg-[#0B0F17] border border-[#1F2937] rounded p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">بيع</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRate.sellSanaa}
                    onChange={(e) => setEditingRate({ ...editingRate, sellSanaa: Number(e.target.value) })}
                    className="w-full bg-[#0B0F17] border border-[#1F2937] rounded p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div className="col-span-2 text-[11px] font-bold text-[#16A34A]">أسعار عدن (YER):</div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">شراء</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRate.buyAden}
                    onChange={(e) => setEditingRate({ ...editingRate, buyAden: Number(e.target.value) })}
                    className="w-full bg-[#0B0F17] border border-[#1F2937] rounded p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">بيع</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRate.sellAden}
                    onChange={(e) => setEditingRate({ ...editingRate, sellAden: Number(e.target.value) })}
                    className="w-full bg-[#0B0F17] border border-[#1F2937] rounded p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 rounded-lg bg-[#161D2B] text-white text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90"
                >
                  حفظ وتحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
