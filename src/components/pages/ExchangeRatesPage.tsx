import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, DollarSign, Coins, RefreshCw, Calculator, ShieldCheck } from 'lucide-react';

export const ExchangeRatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<'usd' | 'sar'>('usd');

  const detailedRates = {
    sanaa: {
      currencies: [
        { code: 'SAR', name: 'الريال السعودي', buy: 140.20, sell: 140.70, change: '+0.15%', isUp: true, icon: Coins },
        { code: 'USD', name: 'الدولار الأمريكي', buy: 535.00, sell: 538.00, change: '-0.20%', isUp: false, icon: DollarSign },
        { code: 'AED', name: 'الدرهم الإماراتي', buy: 145.50, sell: 146.20, change: '+0.10%', isUp: true, icon: Coins },
        { code: 'OMR', name: 'الريال العماني', buy: 1380.00, sell: 1395.00, change: '0.00%', isUp: true, icon: Coins },
        { code: 'EUR', name: 'اليورو الأوروبي', buy: 578.00, sell: 585.00, change: '+0.30%', isUp: true, icon: Coins }
      ],
      gold: [
        { karat: 'الذهب عيار 24 (جرام)', buy: 42500, sell: 44200, change: '+0.50%', isUp: true },
        { karat: 'الذهب عيار 21 (جرام)', buy: 37200, sell: 39500, change: '+0.45%', isUp: true },
        { karat: 'الذهب عيار 18 (جرام)', buy: 31800, sell: 33500, change: '+0.40%', isUp: true },
        { karat: 'الجنيه الذهب (سويسري/محلي)', buy: 298000, sell: 312000, change: '+0.85%', isUp: true }
      ],
      updatedAt: 'اليوم، 11:45 م (تحديث فوري)'
    },
    aden: {
      currencies: [
        { code: 'SAR', name: 'الريال السعودي', buy: 495.00, sell: 500.00, change: '+0.80%', isUp: true, icon: Coins },
        { code: 'USD', name: 'الدولار الأمريكي', buy: 1890.00, sell: 1910.00, change: '+1.10%', isUp: true, icon: DollarSign },
        { code: 'AED', name: 'الدرهم الإماراتي', buy: 512.00, sell: 518.00, change: '+0.75%', isUp: true, icon: Coins },
        { code: 'OMR', name: 'الريال العماني', buy: 4890.00, sell: 4950.00, change: '+0.90%', isUp: true, icon: Coins },
        { code: 'EUR', name: 'اليورو الأوروبي', buy: 2040.00, sell: 2075.00, change: '+1.25%', isUp: true, icon: Coins }
      ],
      gold: [
        { karat: 'الذهب عيار 24 (جرام)', buy: 148000, sell: 155000, change: '+0.95%', isUp: true },
        { karat: 'الذهب عيار 21 (جرام)', buy: 129500, sell: 138000, change: '+0.60%', isUp: true },
        { karat: 'الذهب عيار 18 (جرام)', buy: 111000, sell: 119000, change: '+0.70%', isUp: true },
        { karat: 'الجنيه الذهب (سويسري/محلي)', buy: 1040000, sell: 1095000, change: '+1.40%', isUp: true }
      ],
      updatedAt: 'اليوم، 11:45 م (تحديث فوري)'
    }
  };

  const current = detailedRates[activeMarket];
  const usdRate = current.currencies.find(c => c.code === 'USD')?.buy || 535;
  const sarRate = current.currencies.find(c => c.code === 'SAR')?.buy || 140.2;
  const calculatedTotal = calcCurrency === 'usd' ? calcAmount * usdRate : calcAmount * sarRate;

  return (
    <div dir="rtl" className="space-y-6 pb-16">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5c400] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#f5c400]/10">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              لوحة أسعار الصرف والذهب
              <span className="text-[11px] font-normal bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                تحديث لحظي
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              متابعة دقيقة لأسعار بيع وشراء العملات والذهب في أسواق صنعاء وعدن
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181818] border border-[#282828] text-xs text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-[#f5c400]" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Market Selector & Timestamp */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#151515] p-3 rounded-2xl border border-[#262626]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMarket('sanaa')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMarket === 'sanaa'
                ? 'bg-[#f5c400] text-zinc-950 shadow-md font-black'
                : 'bg-[#181818] text-zinc-400 hover:text-white'
            }`}
          >
            سوق صنعاء
          </button>
          <button
            onClick={() => setActiveMarket('aden')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeMarket === 'aden'
                ? 'bg-[#f5c400] text-zinc-950 shadow-md font-black'
                : 'bg-[#181818] text-zinc-400 hover:text-white'
            }`}
          >
            سوق عدن
          </button>
        </div>

        <span className="text-xs text-zinc-400 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-[#f5c400] animate-spin-slow" />
          <span>{current.updatedAt}</span>
        </span>
      </div>

      {/* 1. Currencies Rates Table / Cards */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>أسعار صرف العملات الأجنبية مقابل الريال اليمني (YER)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {current.currencies.map((curr) => {
            const Icon = curr.icon;
            return (
              <div
                key={curr.code}
                className="bg-[#151515] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-lg hover:border-[#383838] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-center text-[#f5c400]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{curr.name}</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">1 {curr.code}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    curr.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {curr.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {curr.change}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#222222]">
                  <div className="bg-[#0f0f0f] p-2 rounded-xl border border-[#1e1e1e]">
                    <span className="block text-[10px] text-zinc-400">سعر الشراء</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                      {curr.buy.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#0f0f0f] p-2 rounded-xl border border-[#1e1e1e]">
                    <span className="block text-[10px] text-zinc-400">سعر البيع</span>
                    <span className="text-base font-extrabold text-[#f5c400] font-mono tracking-tight">
                      {curr.sell.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Gold Prices Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#f5c400]" />
          <span>أسعار الذهب والسبائك في {activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {current.gold.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#151515] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-lg hover:border-[#383838] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.karat}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {item.change}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222222]">
                <div>
                  <span className="block text-[10px] text-zinc-400">شراء</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono tracking-tight">
                    {item.buy.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400">بيع</span>
                  <span className="text-sm font-extrabold text-[#f5c400] font-mono tracking-tight">
                    {item.sell.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live Currency Calculator */}
      <div className="bg-[#151515] border border-[#262626] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#242424] pb-3">
          <Calculator className="w-5 h-5 text-[#f5c400]" />
          <h3 className="text-sm sm:text-base font-bold text-white">حاسبة تحويل العملات اللحظية</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">المبلغ المراد تحويله</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full bg-[#0f0f0f] border border-[#282828] rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#f5c400] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">اختر العملة</label>
            <select
              value={calcCurrency}
              onChange={(e: any) => setCalcCurrency(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#282828] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#f5c400] cursor-pointer"
            >
              <option value="usd">دولار أمريكي (USD)</option>
              <option value="sar">ريال سعودي (SAR)</option>
            </select>
          </div>

          <div className="bg-[#0f0f0f] p-3.5 rounded-xl border border-[#282828] flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">المبلغ المقابل بالريال اليمني ({activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}):</span>
            <span className="text-lg font-black text-emerald-400 font-mono tracking-tight mt-0.5">
              {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} YER
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
