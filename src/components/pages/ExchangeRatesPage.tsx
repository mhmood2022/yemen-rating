import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coins, ArrowRight, RefreshCw, TrendingUp, TrendingDown, 
  Minus, Landmark, Wallet, Calculator, MapPin, 
  Clock, ArrowUpDown, DollarSign, Activity, Sparkles
} from 'lucide-react';
import { AdBanner } from '../common/AdBanner';

interface ExchangeRatesPageProps {
  onBack: () => void;
}

interface PriceItem {
  name: string;
  code?: string;
  flag?: string;
  buy: number;
  sell: number;
  change: string;
  trend: 'up' | 'down' | 'steady';
  previousBuy?: number;
}

export const ExchangeRatesPage: React.FC<ExchangeRatesPageProps> = ({ onBack }) => {
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [activeTab, setActiveTab] = useState<'rates' | 'converter' | 'banks'>('rates');
  
  // حاسبة التحويل
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'SAR'>('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tickKey, setTickKey] = useState(1);

  // حالة أسعار الصرف الحية مع التغير اللحظي
  const [sanaaRates, setSanaaRates] = useState<{
    usd: PriceItem;
    sar: PriceItem;
    gold24: PriceItem;
    gold21: PriceItem;
    gold18: PriceItem;
    goldPound: PriceItem;
    updatedAt: string;
  }>({
    usd: { name: 'الدولار الأمريكي', code: 'USD', flag: '🇺🇸', buy: 534.76, sell: 538.00, change: '-0.20%', trend: 'down' },
    sar: { name: 'الريال السعودي', code: 'SAR', flag: '🇸🇦', buy: 140.43, sell: 140.70, change: '+0.15%', trend: 'up' },
    gold24: { name: 'جرام عيار 24', buy: 42500, sell: 43500, change: '+0.40%', trend: 'up' },
    gold21: { name: 'جرام عيار 21', buy: 37200, sell: 38100, change: '+0.35%', trend: 'up' },
    gold18: { name: 'جرام عيار 18', buy: 31800, sell: 32500, change: '0.00%', trend: 'steady' },
    goldPound: { name: 'جنيه ذهب إنجليزي', buy: 298000, sell: 305000, change: '+0.50%', trend: 'up' },
    updatedAt: 'مباشر الآن'
  });

  const [adenRates, setAdenRates] = useState<{
    usd: PriceItem;
    sar: PriceItem;
    gold24: PriceItem;
    gold21: PriceItem;
    gold18: PriceItem;
    goldPound: PriceItem;
    updatedAt: string;
  }>({
    usd: { name: 'الدولار الأمريكي', code: 'USD', flag: '🇺🇸', buy: 1910.00, sell: 1925.00, change: '+0.80%', trend: 'up' },
    sar: { name: 'الريال السعودي', code: 'SAR', flag: '🇸🇦', buy: 501.50, sell: 504.00, change: '+0.65%', trend: 'up' },
    gold24: { name: 'جرام عيار 24', buy: 132000, sell: 135000, change: '+1.10%', trend: 'up' },
    gold21: { name: 'جرام عيار 21', buy: 115500, sell: 118000, change: '+0.95%', trend: 'up' },
    gold18: { name: 'جرام عيار 18', buy: 98000, sell: 101000, change: '-0.10%', trend: 'down' },
    goldPound: { name: 'جنيه ذهب إنجليزي', buy: 924000, sell: 945000, change: '+1.20%', trend: 'up' },
    updatedAt: 'مباشر الآن'
  });

  // محاكاة النبض الحركي اللحظي للأسواق الحية (Live Ticker Motion)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickKey(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const banksData = [
    { name: 'بنك الكريمي للتمويل', usdBuy: 535.0, usdSell: 538.0, sarBuy: 140.4, sarSell: 140.7, fee: '0.5%', trend: 'up', type: 'بنك' },
    { name: 'كاك بنك (CAC Bank)', usdBuy: 534.5, usdSell: 538.0, sarBuy: 140.3, sarSell: 140.8, fee: '0.6%', trend: 'down', type: 'بنك' },
    { name: 'بنك التضامن الإسلامي', usdBuy: 535.0, usdSell: 538.5, sarBuy: 140.5, sarSell: 140.8, fee: '0.5%', trend: 'steady', type: 'بنك' },
    { name: 'محفظة جوالي / كاش', usdBuy: 534.8, usdSell: 537.9, sarBuy: 140.4, sarSell: 140.7, fee: '0.4%', trend: 'up', type: 'محفظة' }
  ];

  const currentRates = activeMarket === 'sanaa' ? sanaaRates : adenRates;

  // نتائج محول الصرف اللحظية
  const converterResults = useMemo(() => {
    const sRate = calcCurrency === 'USD' ? sanaaRates.usd.sell : sanaaRates.sar.sell;
    const aRate = calcCurrency === 'USD' ? adenRates.usd.sell : adenRates.sar.sell;
    const sanaaTotal = Math.round(calcAmount * sRate);
    const adenTotal = Math.round(calcAmount * aRate);
    const diff = adenTotal - sanaaTotal;
    return { sanaaTotal, adenTotal, diff };
  }, [calcAmount, calcCurrency, sanaaRates, adenRates]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTickKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* تضمين محرك حركات الأرقام والأسهم الصاعدة والهابطة */}
      <style>{`
        @keyframes yrArrowBounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3.5px); }
        }
        @keyframes yrArrowBounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3.5px); }
        }
        @keyframes yrSteadyPulseWave {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes yrPriceFlashGreen {
          0%, 100% { color: #16A34A; }
          50% { color: #4ADE80; text-shadow: 0 0 10px rgba(74, 222, 128, 0.7); }
        }
        @keyframes yrPriceFlashRed {
          0%, 100% { color: #DC2626; }
          50% { color: #F87171; text-shadow: 0 0 10px rgba(248, 113, 113, 0.7); }
        }
        @keyframes yrPriceFlashSteady {
          0%, 100% { color: #FFC500; }
          50% { color: #FDE047; text-shadow: 0 0 8px rgba(255, 197, 0, 0.6); }
        }

        .yr-anim-arrow-up { animation: yrArrowBounceUp 1.8s infinite ease-in-out !important; }
        .yr-anim-arrow-down { animation: yrArrowBounceDown 1.8s infinite ease-in-out !important; }
        .yr-anim-steady { animation: yrSteadyPulseWave 2.5s infinite ease-in-out !important; }
        
        .yr-anim-num-up { animation: yrPriceFlashGreen 3s infinite ease-in-out !important; }
        .yr-anim-num-down { animation: yrPriceFlashRed 3s infinite ease-in-out !important; }
        .yr-anim-num-steady { animation: yrPriceFlashSteady 3s infinite ease-in-out !important; }
      `}</style>

      {/* 1. إعلان البانر المخصص لأسعار الصرف #8 */}
      <AdBanner placementId="8" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي الأنيق بدون أي زوائد */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Coins size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none flex items-center gap-1.5">
              <span>أسعار الصرف والذهب</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              تحديث مباشر ومتحرك لأسعار العملات والذهب في صنعاء وعدن
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-xl bg-[#161619] border border-[#27272A] text-gray-300 hover:text-[#FFC500] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            title="تحديث فوري للأسعار"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#FFC500]' : ''} />
          </button>
          
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>الرئيسية</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* 3. شريط التبويبات والأسواق (صنعاء / عدن) */}
      <div className="flex items-center justify-between gap-2 bg-[#0F0F12] p-2 rounded-2xl border border-[#222226] flex-wrap shadow-md">
        
        {/* أزرار الأسواق مع مؤشر النبض */}
        <div className="flex bg-[#161619] p-0.5 rounded-xl border border-[#27272A]">
          <button
            onClick={() => setActiveMarket('sanaa')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black shadow-md shadow-[#FFC500]/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>أسعار صنعاء</span>
          </button>
          
          <button
            onClick={() => setActiveMarket('aden')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMarket === 'aden' ? 'bg-[#FFC500] text-black shadow-md shadow-[#FFC500]/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>أسعار عدن</span>
          </button>
        </div>

        {/* التبويبات الفرعية */}
        <div className="flex gap-1 bg-[#161619] p-0.5 rounded-xl border border-[#27272A]">
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'rates' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            الأسعار والذهب
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'converter' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            محول الصرف
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'banks' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            مقارنة البنوك
          </button>
        </div>

      </div>

      {/* ============================================================
          تبويب 1: أسعار العملات والذهب الفورية بحركات الأسهم والأرقام
          ============================================================ */}
      {activeTab === 'rates' && (
        <div key={tickKey} className="space-y-3">
          
          {/* العملات الرئيسية (الدولار والسعودي) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Activity size={13} className="text-[#FFC500]" /> العملات الأجنبية في {activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}
              </span>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Clock size={11} className="text-[#FFC500]" /> {currentRates.updatedAt}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* بطاقة الدولار الأمريكي */}
              <div className="bg-[#0F0F12] p-3 rounded-2xl border border-[#222226] space-y-2 shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currentRates.usd.flag}</span>
                    <div>
                      <h3 className="text-xs font-black text-white">{currentRates.usd.name}</h3>
                      <span className="text-[9px] text-gray-400 font-mono">USD / YER</span>
                    </div>
                  </div>

                  {/* شارة حركة الصعود / الهبوط / الثبات */}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${
                    currentRates.usd.trend === 'up' ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30' :
                    currentRates.usd.trend === 'down' ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' :
                    'bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/30'
                  }`}>
                    {currentRates.usd.trend === 'up' && <TrendingUp size={12} className="yr-anim-arrow-up" />}
                    {currentRates.usd.trend === 'down' && <TrendingDown size={12} className="yr-anim-arrow-down" />}
                    {currentRates.usd.trend === 'steady' && <Minus size={12} className="yr-anim-steady" />}
                    <span>{currentRates.usd.change}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1F2937] font-mono">
                  <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                    <span className="text-[9px] text-gray-400 font-['Cairo'] block">سعر الشراء</span>
                    <b className={`text-sm sm:text-base font-black ${
                      currentRates.usd.trend === 'up' ? 'yr-anim-num-up' : currentRates.usd.trend === 'down' ? 'yr-anim-num-down' : 'text-[#16A34A]'
                    }`}>
                      {currentRates.usd.buy.toFixed(2)} ﷼
                    </b>
                  </div>
                  <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                    <span className="text-[9px] text-gray-400 font-['Cairo'] block">سعر البيع</span>
                    <b className={`text-sm sm:text-base font-black ${
                      currentRates.usd.trend === 'down' ? 'yr-anim-num-down' : currentRates.usd.trend === 'up' ? 'yr-anim-num-up' : 'text-[#DC2626]'
                    }`}>
                      {currentRates.usd.sell.toFixed(2)} ﷼
                    </b>
                  </div>
                </div>
              </div>

              {/* بطاقة الريال السعودي */}
              <div className="bg-[#0F0F12] p-3 rounded-2xl border border-[#222226] space-y-2 shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currentRates.sar.flag}</span>
                    <div>
                      <h3 className="text-xs font-black text-white">{currentRates.sar.name}</h3>
                      <span className="text-[9px] text-gray-400 font-mono">SAR / YER</span>
                    </div>
                  </div>

                  {/* شارة حركة الصعود / الهبوط / الثبات */}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${
                    currentRates.sar.trend === 'up' ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30' :
                    currentRates.sar.trend === 'down' ? 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30' :
                    'bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/30'
                  }`}>
                    {currentRates.sar.trend === 'up' && <TrendingUp size={12} className="yr-anim-arrow-up" />}
                    {currentRates.sar.trend === 'down' && <TrendingDown size={12} className="yr-anim-arrow-down" />}
                    {currentRates.sar.trend === 'steady' && <Minus size={12} className="yr-anim-steady" />}
                    <span>{currentRates.sar.change}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1F2937] font-mono">
                  <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                    <span className="text-[9px] text-gray-400 font-['Cairo'] block">سعر الشراء</span>
                    <b className={`text-sm sm:text-base font-black ${
                      currentRates.sar.trend === 'up' ? 'yr-anim-num-up' : currentRates.sar.trend === 'down' ? 'yr-anim-num-down' : 'text-[#16A34A]'
                    }`}>
                      {currentRates.sar.buy.toFixed(2)} ﷼
                    </b>
                  </div>
                  <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                    <span className="text-[9px] text-gray-400 font-['Cairo'] block">سعر البيع</span>
                    <b className={`text-sm sm:text-base font-black ${
                      currentRates.sar.trend === 'down' ? 'yr-anim-num-down' : currentRates.sar.trend === 'up' ? 'yr-anim-num-up' : 'text-[#DC2626]'
                    }`}>
                      {currentRates.sar.sell.toFixed(2)} ﷼
                    </b>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* أسعار الذهب والسبائك بالحركات والأسهم */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-[#FFC500] block px-1 flex items-center gap-1.5">
              <Sparkles size={13} /> أسعار الذهب والسبائك في {activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              {[
                { data: currentRates.gold24, title: 'ذهب عيار 24' },
                { data: currentRates.gold21, title: 'ذهب عيار 21' },
                { data: currentRates.gold18, title: 'ذهب عيار 18' },
                { data: currentRates.goldPound, title: 'جنيه ذهب' },
              ].map((g, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#222226] space-y-1 shadow-sm">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white font-['Cairo']">{g.title}</span>
                    <span className={`text-[9px] font-bold flex items-center gap-0.5 ${
                      g.data.trend === 'up' ? 'text-[#16A34A]' : g.data.trend === 'down' ? 'text-[#DC2626]' : 'text-[#FFC500]'
                    }`}>
                      {g.data.trend === 'up' && <TrendingUp size={10} className="yr-anim-arrow-up" />}
                      {g.data.trend === 'down' && <TrendingDown size={10} className="yr-anim-arrow-down" />}
                      {g.data.trend === 'steady' && <Minus size={10} className="yr-anim-steady" />}
                      <span>{g.data.change}</span>
                    </span>
                  </div>

                  <div className="flex justify-between text-[9.5px] pt-1 border-t border-[#1F2937]">
                    <span className="text-gray-400 font-['Cairo']">شراء:</span>
                    <b className={`font-black ${g.data.trend === 'up' ? 'yr-anim-num-up' : 'text-[#16A34A]'}`}>
                      {g.data.buy.toLocaleString()} ﷼
                    </b>
                  </div>

                  <div className="flex justify-between text-[9.5px]">
                    <span className="text-gray-400 font-['Cairo']">بيع:</span>
                    <b className={`font-black ${g.data.trend === 'down' ? 'yr-anim-num-down' : 'text-[#DC2626]'}`}>
                      {g.data.sell.toLocaleString()} ﷼
                    </b>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================
          تبويب 2: محول الصرف المباشر وحساب الفوارق
          ============================================================ */}
      {activeTab === 'converter' && (
        <div className="bg-[#0F0F12] p-4 sm:p-5 rounded-2xl border border-[#222226] space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#222226] pb-2">
            <Calculator size={16} className="text-[#FFC500]" />
            <h3 className="text-xs sm:text-sm font-black text-white">محول الصرف المباشر وحساب الفوارق بين السوقين</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] text-gray-400 block font-bold">المبلغ المراد تحويله:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="flex-1 bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-sm font-mono font-bold text-white outline-none focus:border-[#FFC500]"
                />
                <select
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value as any)}
                  className="bg-[#18181C] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#18181C] rounded-xl border border-[#FFC500]/30 space-y-1 font-mono text-center">
              <span className="text-[10px] text-gray-400 font-['Cairo'] block">فارق الصرف بين عدن وصنعاء:</span>
              <div className="text-base font-black text-[#FFC500] yr-anim-num-steady">
                +{converterResults.diff.toLocaleString()} ﷼
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1F2937] font-mono">
            <div className="p-3 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[10px] text-gray-400 font-['Cairo'] block">قيمة المبلغ في أسواق صنعاء:</span>
              <b className="text-lg font-black text-white">{converterResults.sanaaTotal.toLocaleString()} ﷼ يمني</b>
            </div>
            <div className="p-3 rounded-xl bg-[#161619] border border-[#27272A]">
              <span className="text-[10px] text-gray-400 font-['Cairo'] block">قيمة المبلغ في أسواق عدن:</span>
              <b className="text-lg font-black text-[#16A34A] yr-anim-num-up">{converterResults.adenTotal.toLocaleString()} ﷼ يمني</b>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          تبويب 3: مقارنة البنوك والمحافظ الإلكترونية
          ============================================================ */}
      {activeTab === 'banks' && (
        <div className="bg-[#0F0F12] p-3.5 sm:p-4 rounded-2xl border border-[#222226] space-y-2.5 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#222226] pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Landmark size={15} className="text-[#FFC500]" /> مقارنة أسعار الصرف في البنوك والمحافظ المعتمدة
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#161619] text-[#9CA3AF] border-b border-[#27272A]">
                <tr>
                  <th className="py-2.5 px-3">الجهة المصرفية</th>
                  <th className="py-2.5 px-3 font-mono">الدولار (شراء/بيع)</th>
                  <th className="py-2.5 px-3 font-mono">السعودي (شراء/بيع)</th>
                  <th className="py-2.5 px-3 text-center">الرسوم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white font-mono">
                {banksData.map((b, idx) => (
                  <tr key={idx} className="hover:bg-[#18181C]/50 font-['Cairo']">
                    <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                      {b.type === 'بنك' ? <Landmark size={13} className="text-[#FFC500]" /> : <Wallet size={13} className="text-[#2EA5FF]" />}
                      <span>{b.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="text-[#16A34A]">{b.usdBuy}</span> / <span className="text-[#DC2626]">{b.usdSell}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="text-[#16A34A]">{b.sarBuy}</span> / <span className="text-[#DC2626]">{b.sarSell}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{b.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
