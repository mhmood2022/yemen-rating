import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const PricesPage: React.FC<Props> = ({ onNavigate }) => {
  const [market, setMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [amount, setAmount] = useState<number>(100);
  const [currency, setCurrency] = useState('USD');

  const rate = currency === 'USD' ? (market === 'aden' ? 1540 : 535) : (market === 'aden' ? 410 : 140.5);
  const total = (amount * rate).toLocaleString();

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-coins text-amber-400"></i>
          <span>أسعار الصرف وحاسبة التحويل اللحظية</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">الرئيسية</button>
      </div>

      <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 space-y-3">
        <div className="text-xs font-bold text-amber-400">💱 الحاسبة الفورية</div>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="bg-[#101015] border border-[#22222E] rounded-xl px-3 py-2 text-xs text-white" />
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2 py-2 text-xs text-white">
            <option value="USD">دولار (USD)</option>
            <option value="SAR">سعودي (SAR)</option>
          </select>
          <select value={market} onChange={e => setMarket(e.target.value as any)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2 py-2 text-xs text-white">
            <option value="sanaa">سوق صنعاء</option>
            <option value="aden">سوق عدن</option>
          </select>
        </div>
        <div className="p-3 bg-black rounded-xl text-center font-black text-amber-400 text-sm">
          المقابل: {total} ريال يمني
        </div>
      </div>
    </div>
  );
};
