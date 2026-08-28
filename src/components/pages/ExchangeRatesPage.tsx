import React, { useState } from 'react';
import { TrendingUp, ArrowRight, DollarSign, Coins, RefreshCw } from 'lucide-react';

export const ExchangeRatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<'usd' | 'sar'>('usd');

  const rates = {
    sanaa: {
      usd: { buy: 535, sell: 538 },
      sar: { buy: 140.2, sell: 140.8 },
      gold24: 42500,
      gold21: 37200,
      updatedAt: 'اليوم، 11:30 م'
    },
    aden: {
      usd: { buy: 1890, sell: 1910 },
      sar: { buy: 495, sell: 500 },
      gold24: 148000,
      gold21: 129500,
      updatedAt: 'اليوم، 11:30 م'
    }
  };

  const current = rates[activeMarket];
  const calculatedTotal = calcCurrency === 'usd' ? calcAmount * current.usd.buy : calcAmount * current.sar.buy;

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              أسعار الصرف والذهب في اليمن
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              تحديث لحظي لأسعار العملات الأجنبية مقابل الريال اليمني في صنعاء وعدن
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMarket('sanaa')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMarket === 'sanaa' ? 'bg-amber-400 text-zinc-950 shadow-md font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            أسعار صرف صنعاء
          </button>
          <button
            onClick={() => setActiveMarket('aden')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMarket === 'aden' ? 'bg-amber-400 text-zinc-950 shadow-md font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            أسعار صرف عدن
          </button>
        </div>

        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          آخر تحديث: {current.updatedAt}
        </span>
      </div>

      {/* Rates Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USD */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              الدولار الأمريكي (USD)
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">$1</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
            <div>
              <span className="block text-[10px] text-zinc-500">شراء</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{current.usd.buy}</span>
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500">بيع</span>
              <span className="text-base font-extrabold text-white font-mono">{current.usd.sell}</span>
            </div>
          </div>
        </div>

        {/* SAR */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              الريال السعودي (SAR)
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">1 ر.س</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
            <div>
              <span className="block text-[10px] text-zinc-500">شراء</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{current.sar.buy}</span>
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500">بيع</span>
              <span className="text-base font-extrabold text-white font-mono">{current.sar.sell}</span>
            </div>
          </div>
        </div>

        {/* Gold 24 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            ذهب عيار 24 (جرام)
          </span>
          <div className="pt-2 border-t border-zinc-800">
            <span className="block text-[10px] text-zinc-500">السعر بالريال اليمني</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{current.gold24.toLocaleString()} YER</span>
          </div>
        </div>

        {/* Gold 21 */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            ذهب عيار 21 (جرام)
          </span>
          <div className="pt-2 border-t border-zinc-800">
            <span className="block text-[10px] text-zinc-500">السعر بالريال اليمني</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{current.gold21.toLocaleString()} YER</span>
          </div>
        </div>
      </div>

      {/* Converter Tool */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">حاسبة تحويل العملات اللحظية</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">المبلغ المراد تحويله</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">العملة</label>
            <select
              value={calcCurrency}
              onChange={(e: any) => setCalcCurrency(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="usd">دولار أمريكي (USD)</option>
              <option value="sar">ريال سعودي (SAR)</option>
            </select>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500">المبلغ المقابل بالريال اليمني:</span>
            <span className="text-base font-black text-amber-400 font-mono">{calculatedTotal.toLocaleString()} YER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
