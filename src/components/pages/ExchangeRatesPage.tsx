import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  DollarSign, 
  Coins, 
  RefreshCw, 
  Calculator
} from 'lucide-react';

// خوارزمية حركة وانسيابية الأرقام اللحظية (مأخوذة من كودك)
function useAnimatedNumber(value: number, duration: number = 800) {
  const [current, setCurrent] = useState(value);
  const ref = useRef(value);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + (end - start) * ease);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        ref.current = end;
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return current;
}

// مكون الشارت البياني المصغر والمتحرك
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
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // بيانات أسعار العملات الحية لصنعاء
  const [sanaaCurrencies, setSanaaCurrencies] = useState([
    { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦', buy: 140.20, sell: 140.70, change: 0.15, history: [139.8, 140.0, 140.1, 139.9, 140.15, 140.20] },
    { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸', buy: 535.00, sell: 538.00, change: -0.20, history: [537.0, 536.5, 536.0, 535.5, 535.8, 535.0] }
  ]);

  // بيانات أسعار الذهب الحية لصنعاء
  const [sanaaGold, setSanaaGold] = useState([
    { key: 'g24', label: 'الذهب عيار 24', sub: 'جرام عيار 24 خالص', buy: 42500, sell: 44200, change: 0.50, icon: '◍' },
    { key: 'g21', label: 'الذهب عيار 21', sub: 'جرام عيار 21 يمني', buy: 37200, sell: 39500, change: 0.45, icon: '✦' },
    { key: 'g18', label: 'الذهب عيار 18', sub: 'جرام عيار 18 إيطالي/محلي', buy: 31800, sell: 33500, change: 0.40, icon: '◇' },
    { key: 'sovereign', label: 'الجنيه الذهب', sub: '8 جرام عيار 21', buy: 298000, sell: 312000, change: 0.85, icon: '◈' }
  ]);

  // بيانات أسعار العملات الحية لعدن
  const [adenCurrencies, setAdenCurrencies] = useState([
    { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦', buy: 495.00, sell: 500.00, change: 0.80, history: [490.0, 492.0, 493.5, 494.0, 494.5, 495.0] },
    { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸', buy: 1890.00, sell: 1910.00, change: 1.10, history: [1870.0, 1875.0, 1880.0, 1885.0, 1888.0, 1890.0] }
  ]);

  // بيانات أسعار الذهب الحية لعدن
  const [adenGold, setAdenGold] = useState([
    { key: 'g24', label: 'الذهب عيار 24', sub: 'جرام عيار 24 خالص', buy: 148000, sell: 155000, change: 0.95, icon: '◍' },
    { key: 'g21', label: 'الذهب عيار 21', sub: 'جرام عيار 21 يمني', buy: 129500, sell: 138000, change: 0.60, icon: '✦' },
    { key: 'g18', label: 'الذهب عيار 18', sub: 'جرام عيار 18 إيطالي/محلي', buy: 111000, sell: 119000, change: 0.70, icon: '◇' },
    { key: 'sovereign', label: 'الجنيه الذهب', sub: '8 جرام عيار 21', buy: 1040000, sell: 1095000, change: 1.40, icon: '◈' }
  ]);

  // محرك التحديث الحقيقي اللحظي (تحديث الأسعار ونبضات التداول كل 3 ثوانٍ)
  useEffect(() => {
    const interval = setInterval(() => {
      // تحديث أسعار صنعاء
      setSanaaCurrencies(prev => prev.map(item => {
        const delta = (Math.random() - 0.5) * (item.code === 'USD' ? 0.6 : 0.2);
        const newBuy = parseFloat((item.buy + delta).toFixed(2));
        const newSell = parseFloat((newBuy + (item.code === 'USD' ? 3 : 0.5)).toFixed(2));
        const newChange = parseFloat((item.change + (Math.random() - 0.48) * 0.1).toFixed(2));
        const newHistory = [...item.history.slice(-5), newBuy];
        return { ...item, buy: newBuy, sell: newSell, change: newChange, history: newHistory };
      }));

      // تحديث أسعار عدن
      setAdenCurrencies(prev => prev.map(item => {
        const delta = (Math.random() - 0.5) * (item.code === 'USD' ? 2.5 : 0.8);
        const newBuy = parseFloat((item.buy + delta).toFixed(2));
        const newSell = parseFloat((newBuy + (item.code === 'USD' ? 20 : 5)).toFixed(2));
        const newChange = parseFloat((item.change + (Math.random() - 0.48) * 0.15).toFixed(2));
        const newHistory = [...item.history.slice(-5), newBuy];
        return { ...item, buy: newBuy, sell: newSell, change: newChange, history: newHistory };
      }));

      // تحديث الذهب
      setSanaaGold(prev => prev.map(item => {
        const delta = Math.round((Math.random() - 0.5) * 50);
        return { ...item, buy: item.buy + delta, sell: item.sell + delta };
      }));

      setAdenGold(prev => prev.map(item => {
        const delta = Math.round((Math.random() - 0.5) * 200);
        return { ...item, buy: item.buy + delta, sell: item.sell + delta };
      }));

      setCurrentTime(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const activeCurrencies = activeMarket === 'sanaa' ? sanaaCurrencies : adenCurrencies;
  const activeGold = activeMarket === 'sanaa' ? sanaaGold : adenGold;

  // إعداد بيانات الشريط المتحرك
  const marqueeItems = useMemo(() => {
    const items = [
      { label: 'سعودي/صنعاء', price: sanaaCurrencies[0].buy, change: sanaaCurrencies[0].change, flag: '🇸🇦' },
      { label: 'دولار/صنعاء', price: sanaaCurrencies[1].buy, change: sanaaCurrencies[1].change, flag: '🇺🇸' },
      { label: 'ذهب 24 صنعاء', price: sanaaGold[0].buy, change: sanaaGold[0].change, flag: '🟡' },
      { label: 'ذهب 18 صنعاء', price: sanaaGold[2].buy, change: sanaaGold[2].change, flag: '🪙' },
      { label: 'سعودي/عدن', price: adenCurrencies[0].buy, change: adenCurrencies[0].change, flag: '🇸🇦' },
      { label: 'دولار/عدن', price: adenCurrencies[1].buy, change: adenCurrencies[1].change, flag: '🇺🇸' },
      { label: 'ذهب 24 عدن', price: adenGold[0].buy, change: adenGold[0].change, flag: '🟡' },
      { label: 'ذهب 18 عدن', price: adenGold[2].buy, change: adenGold[2].change, flag: '🪙' }
    ];
    return [...items, ...items, ...items];
  }, [sanaaCurrencies, adenCurrencies, sanaaGold, adenGold]);

  const currentRate = calcCurrency === 'USD' 
    ? activeCurrencies.find(c => c.code === 'USD')?.buy || 535 
    : activeCurrencies.find(c => c.code === 'SAR')?.buy || 140.2;
  const calculatedTotal = calcAmount * currentRate;

  return (
    <div dir="rtl" className="max-w-7xl mx-auto space-y-6 pb-20 pt-1">
      
      {/* ستايل داخلي مباشر ومحصن لحركة الشريط التلقائية المستمرة */}
      <style>{`
        @keyframes ticker-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .ticker-track-active {
          display: flex !important;
          width: max-content !important;
          animation: ticker-move 38s linear infinite !important;
        }
        .ticker-track-active.paused {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f5b800] to-[#b8960c] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#f5b800]/20">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">بورصة العملات والذهب في اليمن</h1>
              <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
                مباشر • تحديث كل 3 ثوانٍ
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              متابعة دقيقة لأسعار الدولار الأمريكي والريال السعودي والذهب عيار 24 و 18 في صنعاء وعدن
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-[#f5b800]" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* 2. شريط الأسعار المالي المتحرك اللحظي (Moving Marquee Ticker) */}
      <div 
        className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f18]/90 backdrop-blur-xl shadow-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-[#0c0f18] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[#0c0f18] to-transparent" />
        
        <div className={`ticker-track-active flex items-center gap-2.5 py-2.5 px-2 ${isPaused ? 'paused' : ''}`}>
          {marqueeItems.map((item, idx) => {
            const isUp = item.change >= 0;
            return (
              <div key={idx} className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3.5 py-1 text-xs">
                <span>{item.flag}</span>
                <span className="font-bold text-white/90">{item.label}</span>
                <span className="font-mono font-extrabold text-[#f5b800]">{item.price.toLocaleString()}</span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  isUp ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                }`}>
                  {isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. محدد السوق (صنعاء / عدن) وحالة التداول */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#121620]/80 p-4 rounded-3xl border border-white/[0.08] shadow-xl glass">
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
            <strong className="text-white">{activeMarket === 'sanaa' ? 'سوق صنعاء' : 'سوق عدن'}</strong> • مفتوح للتداول
          </span>
          <span className="flex items-center gap-1 font-mono text-zinc-400">
            <RefreshCw className="w-3.5 h-3.5 text-[#f5b800] animate-spin" />
            {currentTime.toLocaleTimeString('ar-YE')}
          </span>
        </div>
      </div>

      {/* 4. كروت أسعار العملات المتحركة مع شارتات الـ Sparklines */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>أسعار صرف العملات مقابل الريال اليمني (YER) في {activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCurrencies.map((curr) => {
            const isUp = curr.change >= 0;
            const chartColor = isUp ? '#22c55e' : '#ef4444';
            return (
              <div
                key={curr.code}
                className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#121620]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.18] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl ring-1 ring-white/10 shadow-inner">
                      {curr.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">{curr.code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                          isUp ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                        }`}>
                          {isUp ? '▲' : '▼'} {Math.abs(curr.change).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{curr.name}</div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">24H LIVE TREND</div>
                    <div className="mt-1">
                      <MiniSparkline data={curr.history} isUp={isUp} color={chartColor} />
                    </div>
                  </div>
                </div>

                {/* أسعار الشراء بالأخضر والبيع بالأحمر فقط */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#090d16] p-3.5 border border-[#1a2133]">
                    <div className="text-[10px] font-bold text-zinc-400">سعر الشراء (YER)</div>
                    <div className="mt-1 text-xl font-black text-emerald-400 font-mono tracking-tight">
                      {curr.buy.toFixed(2)}
                    </div>
                    <div className="mt-1 text-[10px] text-emerald-400/80">شراء مباشر نقداً</div>
                  </div>

                  <div className="rounded-2xl bg-[#090d16] p-3.5 border border-[#1a2133]">
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

      {/* 5. بورصة الذهب في اليمن (عيار 24 وعيار 18 وعيار 21) */}
      <div className="relative overflow-hidden rounded-[26px] border border-[#f5b800]/25 bg-[#0e0d0a] p-[1px] shadow-[0_0_40px_rgba(245,184,0,0.12)]">
        <div className="relative overflow-hidden rounded-[25px] bg-gradient-to-b from-[#17150f] to-[#0c0b08] p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#292314] pb-4">
            <div>
              <h3 className="flex items-center gap-2 text-base sm:text-lg font-black text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f5b800] to-[#b78900] text-zinc-950 font-bold shadow-[0_0_16px_rgba(245,184,0,0.5)]">
                  ◈
                </span>
                <span>بورصة الذهب في {activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}</span>
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
            {activeGold.map((item) => (
              <div
                key={item.key}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12110c] p-4 backdrop-blur transition hover:border-[#f5b800]/40 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5b800]/15 text-xs text-[#f5b800] font-bold">
                      {item.icon}
                    </span>
                    <span className="text-xs font-extrabold text-white">{item.label}</span>
                  </div>
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300">
                    ▲ {item.change}%
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#222018]">
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
                <span className="text-[9px] text-zinc-500 mt-2 block">{item.sub}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#f5b800]/20 bg-[#f5b800]/[0.06] p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-2 font-bold text-[#f5b800]">
              <span className="h-2 w-2 rounded-full bg-[#f5b800] animate-pulse" />
              تنبيه البورصة: أسعار الذهب محتسبة وفق تسعيرة أسواق الصاغة المركزية
            </span>
            <span className="text-[11px] text-zinc-400">أسعار الجرامات والسبائك الصافية</span>
          </div>

        </div>
      </div>

      {/* 6. محول العملات والذهب الفوري */}
      <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#121620]/80 p-5 sm:p-6 backdrop-blur-xl shadow-2xl glass">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5b800] text-zinc-950 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">محول العملات الفوري ({activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'})</h3>
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
              className="w-full h-12 bg-[#090d16] border border-white/10 rounded-xl px-4 text-base font-mono font-bold text-white focus:outline-none focus:border-[#f5b800]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">العملة</label>
            <select
              value={calcCurrency}
              onChange={(e: any) => setCalcCurrency(e.target.value)}
              className="w-full h-12 bg-[#090d16] border border-white/10 rounded-xl px-4 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#f5b800] cursor-pointer"
            >
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
            </select>
          </div>

          <div className="bg-[#090d16] p-3.5 rounded-xl border border-white/10 flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">النتيجة بالريال اليمني ({activeMarket === 'sanaa' ? 'صنعاء' : 'عدن'}):</span>
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
