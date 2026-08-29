import React, { useState } from 'react';
import { Coins, TrendingUp, Landmark, Wallet, RefreshCw } from 'lucide-react';

export const GoldCurrencyManager: React.FC = () => {
  const [rates, setRates] = useState([
    { currency: 'الدولار الأمريكي (USD)', code: 'USD', buySanaa: 535, sellSanaa: 538, buyAden: 1910, sellAden: 1925 },
    { currency: 'الريال السعودي (SAR)', code: 'SAR', buySanaa: 140.2, sellSanaa: 140.8, buyAden: 501, sellAden: 504 },
  ]);

  const [goldPrices] = useState([
    { type: 'جرام ذهب عيار 24', priceSanaa: '38,500 YER', priceAden: '135,000 YER' },
    { type: 'جرام ذهب عيار 21', priceSanaa: '33,700 YER', priceAden: '118,500 YER' },
    { type: 'جنيه ذهب إنجليزي', priceSanaa: '270,000 YER', priceAden: '950,000 YER' },
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Coins className="text-[#FFC500]" />
            الذهب، العملات، البنوك والمحافظ
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            إدارة وتحديث أسعار الصرف الفورية (صنعاء وعدن)، أسعار الذهب، والمقارنات المصرفية.
          </p>
        </div>
      </div>

      {/* أسعار الصرف */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FFC500]" /> أسعار الصرف الرسمية المعتمدة
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {rates.map(r => (
                <tr key={r.code} className="hover:bg-[#161D2B]/50">
                  <td className="py-3 px-4 font-bold">{r.currency}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#FFC500]">{r.buySanaa}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#FFC500]">{r.sellSanaa}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#16A34A]">{r.buyAden}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#16A34A]">{r.sellAden}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* أسعار الذهب */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Coins size={16} className="text-[#FFC500]" /> أسعار الذهب والسبائك
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {goldPrices.map((g, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#161D2B] border border-[#1F2937]">
              <div className="font-bold text-white text-xs">{g.type}</div>
              <div className="mt-2 flex justify-between text-[11px]">
                <span className="text-[#9CA3AF]">صنعاء: <b className="text-[#FFC500] font-mono">{g.priceSanaa}</b></span>
                <span className="text-[#9CA3AF]">عدن: <b className="text-[#16A34A] font-mono">{g.priceAden}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
