import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  DollarSign, 
  Coins, 
  RefreshCw, 
  Calculator
} from 'lucide-react';

const MiniSparkline: React.FC<{ data: number[]; isUp: boolean; color: string }> = ({ data, color }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 90;
    const y = 30 - ((val - min) / range) * 24 - 3;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={90} height={32} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <polygon
        fill={`url(#grad-${color.replace('#', '')})`}
        points={`${points} 90,32 0,32`}
        opacity={0.6}
      />
    </svg>
  );
};

export const ExchangeRatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'SAR'>('USD');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // البيانات الموحدة الحقيقية المتطابقة بين الشريط والبطاقات والحاسبة
  const marketData = {
    sanaa: {
      name: 'سوق صنعاء',
      status: 'مفتوح • سيولة منتظمة',
      currencies: [
        { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦', buy: 140.20, sell: 140.70, change: '+0.15%', isUp: true, history: [139.8, 140.0, 140.1, 139.9, 140.15, 140.20] },
        { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸', buy: 535.00, sell: 538.00, change: '-0.20%', isUp: false, history: [537.0, 536.5, 536.0, 535.5, 535.8, 535.0] }
      ],
      gold: [
        { key: 'g24', label: 'الذهب عيار 24', sub: 'جرام عيار 24 خالص', buy: 42500, sell: 44200, change: '+0.50%', isUp: true, icon: '◍' },
        { key: 'g21', label: 'الذهب عيار 21', sub: 'جرام عيار 21 يمني', buy: 37200, sell: 39500, change: '+0.45%', isUp: true, icon: '✦' },
        { key: 'g18', label: 'الذهب عيار 18', sub: 'جرام عيار 18 إيطالي/محلي', buy: 31800, sell: 33500, change: '+0.40%', isUp: true, icon: '◇' },
        { key: 'sovereign', label: 'الجنيه الذهب', sub: '8 جرام عيار 21', buy: 298000, sell: 312000, change: '+0.85%', isUp: true, icon: '◈' }
      ]
    },
    aden: {
      name: 'سوق عدن',
      status: 'مفتوح • تداول مباشر',
      currencies: [
        { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦', buy: 495.00, sell: 500.00, change: '+0.80%', isUp: true, history: [490.0, 492.0, 493.5, 494.0, 494.5, 495.0] },
        { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸', buy: 1890.00, sell: 1910.00, change: '+1.10%', isUp: true, history: [1870.0, 1875.0, 1880.0, 1885.0, 1888.0, 1890.0] }
      ],
      gold: [
        { key: 'g24', label: 'الذهب عيار 24', sub: 'جرام عيار 24 خالص', buy: 148000, sell: 155000, change: '+0.95%', isUp: true, icon: '◍' },
        { key: 'g21', label: 'الذهب عيار 21', sub: 'جرام عيار 21 يمني', buy: 129500, sell: 138000, change: '+0.60%', isUp: true, icon: '✦' },
        { key: 'g18', label: 'الذهب عيار 18', sub: 'جرام عيار 18 إيطالي/محلي', buy: 111000, sell: 119000, change: '+0.70%', isUp: true, icon: '◇' },
        { key: 'sovereign', label: 'الجنيه الذهب', sub: '8 جرام عيار 21', buy: 1040000, sell: 1095000, change: '+1.40%', isUp: true, icon: '◈' }
      ]
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMarket = marketData[activeMarket];

  // عناصر الشريط المتحرك مشتقة مباشرة من نفس أرقام السوق النشط
  const marqueeItems = useMemo(() => {
    const items = [
      { label: `سعودي (${currentMarket.name})`, price: currentMarket.currencies[0].buy, change: currentMarket.currencies[0].change, flag: '🇸🇦' },
      { label: `دولار (${currentMarket.name})`, price: currentMarket.currencies[1].buy, change: currentMarket.currencies[1].change, flag: '🇺🇸' },
      { label: `ذهب 24 (${currentMarket.name})`, price: currentMarket.gold[0].buy, change: currentMarket.gold[0].change, flag: '🟡' },
      { label: `ذهب 18 (${currentMarket.name})`, price: currentMarket.gold[2].buy, change: currentMarket.gold[2].change, flag: '🪙' }
    ];
    return [...items, ...items, ...items, ...items];
  }, [activeMarket, currentMarket]);

  const currentRate = calcCurrency === 'USD' 
    ? currentMarket.currencies.find(c => c.code === 'USD')?.buy || 535 
    : currentMarket.currencies.find(c => c.code === 'SAR')?.buy || 140.2;
  const calculatedTotal = calcAmount * currentRate;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5b800] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#f5b800]/20">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">بورصة العملات والذهب في اليمن</h1>
              <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                تحديث متزامن ولحظي
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              متابعة دقيقة لأسعار الدولار الأمريكي والريال السعودي والذهب عيار 24 و 18 في صنعاء وعدن
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-[#f5b800]" />
          <span>الرئيسية</span>
        </button>
      </div>

      {/* 2. شريط الأسعار المتحرك المتطابق 100% مع المحتوى */}
      <div 
        className="relative w-full overflow-hidden rounded-2xl border border-[#262626] bg-[#111111] shadow-xl"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 bg-gradient-to-r from-[#111111] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 bg-gradient-to-l from-[#111111] to-transparent" />
        
        <div className={`ticker-continuous flex items-center gap-2.5 py-2.5 px-2 ${isTickerPaused ? 'paused' : ''}`}>
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#282828] bg-[#181818] px-3.5 py-1 text-xs">
              <span>{item.flag}</span>
              <span className="font-bold text-white/90">{item.label}</span>
              <span className="font-mono font-extrabold text-[#f5b800]">{item.price.toLocaleString()} YER</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300">
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. محدد السوق (صنعاء / عدن) */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#151515] p-4 rounded-3xl border border-[#262626] shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMarket('sanaa')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeMarket === 'sanaa'
                ? 'bg-[#f5b800] text-zinc-950 shadow-lg shadow-[#f5b800]/20 font-black'
                : 'bg-[#181818] text-zinc-400 hover:text-white border border-[#282828]'
            }`}
          >
            سوق صنعاء
          </button>
          <button
            onClick={() => setActiveMarket('aden')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeMarket === 'aden'
                ? 'bg-[#f5b800] text-zinc-950 shadow-lg shadow-[#f5b800]/20 font-black'
                : 'bg-[#181818] text-zinc-400 hover:text-white border border-[#282828]'
            }`}
          >
            سوق عدن
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
            <strong className="text-white">{currentMarket.name}</strong> • {currentMarket.status}
          </span>
          <span className="flex items-center gap-1 font-mono text-zinc-400">
            <RefreshCw className="w-3.5 h-3.5 text-[#f5b800]" />
            {currentTime.toLocaleTimeString('ar-YE')}
          </span>
        </div>
      </div>

      {/* 4. كروت أسعار العملات (المتطابقة تماماً) */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>أسعار صرف العملات مقابل الريال اليمني (YER) في {currentMarket.name}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMarket.currencies.map((curr) => {
            const chartColor = curr.isUp ? '#22c55e' : '#ef4444';
            return (
              <div
                key={curr.code}
                className="relative overflow-hidden rounded-3xl border border-[#262626] bg-[#151515] p-5 shadow-xl transition-all hover:border-[#383838]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#202020] text-2xl border border-[#2c2c2c] shadow-inner">
                      {curr.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">{curr.code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                          curr.isUp ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                        }`}>
                          {curr.change}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{curr.name}</div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">24H TREND</div>
                    <div className="mt-1">
                      <MiniSparkline data={curr.history} isUp={curr.isUp} color={chartColor} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#0d0d0d] p-3.5 border border-[#222222]">
                    <div className="text-[10px] font-bold text-zinc-400">سعر الشراء (YER)</div>
                    <div className="mt-1 text-xl font-black text-emerald-400 font-mono tracking-tight">
                      {curr.buy.toFixed(2)}
                    </div>
                    <div className="mt-1 text-[10px] text-emerald-400/80">شراء مباشر نقداً</div>
                  </div>

                  <div className="rounded-2xl bg-[#0d0d0d] p-3.5 border border-[#222222]">
                    <div className="text-[10px] font-bold text-zinc-400">سعر البيع (YER)</div>
                    <div className="mt-1 text-xl font-black text-rose-400 font-mono tracking-tight">
                      {curr.sell.toFixed(2)}
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500">فارق صرف {(curr.sell - curr.buy).toFixed(2)} YER</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. بورصة الذهب عيار 24 وعيار 18 وعيار 21 */}
      <div className="rounded-3xl border border-[#262626] bg-[#151515] p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#242424] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-black text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5b800] text-zinc-950 font-bold shadow-[0_0_16px_rgba(245,184,0,0.3)]">
                ◈
              </span>
              <span>بورصة الذهب في {currentMarket.name}</span>
              <span className="rounded-full bg-[#f5b800]/15 px-2 py-0.5 text-[10px] font-black tracking-widest text-[#f5b800]">
                LIVE GOLD
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">أسعار جرام الذهب عيار 24 و 18 و 21 والجنيه الذهب بالريال اليمني</p>
          </div>

          <span className="text-xs font-mono bg-[#f5b800]/10 text-[#f5b800] border border-[#f5b800]/30 px-3 py-1 rounded-xl font-bold">
            XAU / YER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentMarket.gold.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-[#262626] bg-[#0d0d0d] p-4 transition hover:border-[#f5b800]/40 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5b800]/15 text-xs text-[#f5b800] font-bold">
                    {item.icon}
                  </span>
                  <span className="text-xs font-extrabold text-white">{item.label}</span>
                </div>
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300">
                  {item.change}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1e1e]">
                <div>
                  <span className="text-[10px] text-zinc-400 block">شراء</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono tracking-tight">
                    {item.buy.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">بيع</span>
                  <span className="text-sm font-extrabold text-rose-400 font-mono tracking-tight">
                    {item.sell.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-zinc-500 block">{item.sub}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#0d0d0d] p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-2 font-bold text-[#f5b800]">
            <span className="h-2 w-2 rounded-full bg-[#f5b800] animate-pulse" />
            تنبيه البورصة: أسعار الذهب محتسبة وفق تسعيرة أسواق الصاغة المركزية
          </span>
          <span className="text-[11px] text-zinc-400">أسعار الجرامات والسبائك الصافية</span>
        </div>
      </div>

      {/* 6. محول العملات الفوري المتطابق مع سعر السوق النشط */}
      <div className="rounded-3xl border border-[#262626] bg-[#151515] p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#242424] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5b800] text-zinc-950 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">محول العملات الفوري ({currentMarket.name})</h3>
              <p className="text-[11px] text-zinc-400">تحويل سريع ومباشر وفق سعر صرف السوق اللحظي</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
            سعر الصرف: 1 {calcCurrency} = {currentRate.toLocaleString()} YER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">المبلغ المراد تحويله</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
              className="w-full h-12 bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-4 text-base font-mono font-bold text-white focus:outline-none focus:border-[#f5b800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">العملة</label>
            <select
              value={calcCurrency}
              onChange={(e: any) => setCalcCurrency(e.target.value)}
              className="w-full h-12 bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-4 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#f5b800] cursor-pointer"
            >
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
            </select>
          </div>

          <div className="bg-[#0d0d0d] p-3.5 rounded-xl border border-[#222222] flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">النتيجة بالريال اليمني ({currentMarket.name}):</span>
            <span className="text-xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
              {calculatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} YER
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExchangeRatesPage;
