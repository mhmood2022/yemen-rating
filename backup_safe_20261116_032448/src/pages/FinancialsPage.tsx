import React, { useState } from 'react';
import { rateService } from '../services/rateService';

interface Props {
  onNavigate: (path: string) => void;
}

export const FinancialsPage: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'banks' | 'exchanges' | 'wallets' | 'rates'>('rates');
  const [market, setMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState('USD');

  const { total } = rateService.calculateConversion(calcAmount, calcCurrency, market);

  const banks = [
    { name: 'بنك الكريمي للتمويل الأصغر الإسلامي', logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=100', branches: '240 فرع', phone: '770123456', wa: '967770123456', score: 97 },
    { name: 'بنك التضامن الإسلامي الدولي', logo: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100', branches: '85 فرع', phone: '771223344', wa: '967771223344', score: 95 }
  ];

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-building-columns text-amber-400"></i>
          <span>المؤسسات المالية وأسعار الصرف</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">الرئيسية</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('rates')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'rates' ? 'bg-amber-400 text-black font-black' : 'bg-[#14141C] border border-[#22222E] text-neutral-400'}`}>
          أسعار الصرف والحاسبة
        </button>
        <button onClick={() => setActiveTab('banks')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'banks' ? 'bg-amber-400 text-black font-black' : 'bg-[#14141C] border border-[#22222E] text-neutral-400'}`}>
          البنوك والمصارف
        </button>
      </div>

      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 space-y-3">
            <div className="text-xs font-black text-amber-400">💱 حاسبة تحويل العملات اللحظية</div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={calcAmount} onChange={e => setCalcAmount(parseFloat(e.target.value) || 0)} className="bg-[#101015] border border-[#22222E] rounded-xl px-3 py-2 text-xs text-white" />
              <select value={calcCurrency} onChange={e => setCalcCurrency(e.target.value)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2 py-2 text-xs text-white">
                <option value="USD">دولار (USD)</option>
                <option value="SAR">سعودي (SAR)</option>
              </select>
              <select value={market} onChange={e => setMarket(e.target.value as any)} className="bg-[#101015] border border-[#22222E] rounded-xl px-2 py-2 text-xs text-white">
                <option value="sanaa">سوق صنعاء</option>
                <option value="aden">سوق عدن</option>
              </select>
            </div>
            <div className="p-3 bg-black rounded-xl text-center font-black text-amber-400 text-sm">
              المبلغ المعادل: {total.toLocaleString()} ريال يمني
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="space-y-3">
          {banks.map((b, i) => (
            <div key={i} className="bg-[#14141C] border border-[#22222E] p-4 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={b.logo} alt={b.name} className="w-11 h-11 rounded-xl object-cover" />
                <div>
                  <div className="text-sm font-black text-white">{b.name}</div>
                  <div className="text-xs text-neutral-400">{b.branches}</div>
                </div>
              </div>
              <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-black px-2.5 py-1 rounded-lg">
                YR {b.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
