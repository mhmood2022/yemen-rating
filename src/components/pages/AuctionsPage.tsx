import React, { useState } from 'react';
import { Gavel, Clock, ArrowRight, Star, ShieldCheck, Flame, User, CheckCircle } from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface AuctionItem {
  id: string;
  title: string;
  category: string;
  currentBid: number;
  startingPrice: number;
  bidsCount: number;
  timeLeft: string;
  city: string;
  sellerName: string;
  isVerifiedSeller: boolean;
  image: string;
  status: 'active' | 'upcoming' | 'ended';
}

export const AuctionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'ended'>('active');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [activeAuctionModal, setActiveAuctionModal] = useState<AuctionItem | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const auctions: AuctionItem[] = [
    {
      id: 'auc-1',
      title: 'سيارة تويوتا لاندكروزر V8 موديل 2022 وكالة',
      category: 'سيارات ومحركات',
      currentBid: 48500,
      startingPrice: 40000,
      bidsCount: 19,
      timeLeft: '04:18:22',
      city: 'صنعاء',
      sellerName: 'معرض النخبة للسيارات',
      isVerifiedSeller: true,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'auc-2',
      title: 'قطعة أرض تجارية ركنية 6 لبن حر على شارع الستين',
      category: 'عقارات ومخططات',
      currentBid: 185000000,
      startingPrice: 150000000,
      bidsCount: 12,
      timeLeft: '01:12:45',
      city: 'صنعاء',
      sellerName: 'مكتب الأمانة العقاري',
      isVerifiedSeller: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      status: 'active'
    },
    {
      id: 'auc-3',
      title: 'جنبية صيفاني عسيب قديم فاخر مع حزام مذهب',
      category: 'تحف وتراث',
      currentBid: 12000,
      startingPrice: 8000,
      bidsCount: 24,
      timeLeft: '00:45:10',
      city: 'صنعاء',
      sellerName: 'دار التراث اليمني',
      isVerifiedSeller: true,
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      status: 'active'
    }
  ];

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      setActiveAuctionModal(null);
    }, 2000);
  };

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/10">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              منصة المزادات الحية
              <span className="text-xs font-normal bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">
                وسيط معتمد
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              مزادات علنية موثقة للعقارات والسيارات والتحف والسلع الثمينة
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setSelectedTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            selectedTab === 'active'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>المزادات الجارية الآن</span>
        </button>
        <button
          onClick={() => setSelectedTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedTab === 'upcoming'
              ? 'bg-amber-400 text-zinc-950 shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          مزادات قادمة
        </button>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {auctions.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/50 rounded-2xl overflow-hidden transition-all flex flex-col group shadow-xl"
          >
            <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span className="font-mono">{item.timeLeft}</span>
              </div>
              <div className="absolute top-3 left-3 bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] px-2 py-0.5 rounded-md backdrop-blur-md font-bold">
                مباشر
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {item.category}
                </span>
                <h3 className="font-bold text-sm text-white mt-2 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                  <span>المعلن: {item.sellerName}</span>
                  {item.isVerifiedSeller && <VerifiedBadge type="gold" size="sm" />}
                </div>
              </div>

              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">أعلى مزايدة حالية:</span>
                  <span className="text-zinc-400 font-mono">({item.bidsCount} مزايدة)</span>
                </div>
                <div className="text-base font-extrabold text-amber-400 font-mono">
                  {item.currentBid.toLocaleString()} $
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveAuctionModal(item);
                  setBidAmount(item.currentBid + 500);
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Gavel className="w-4 h-4" />
                <span>دخول المزاد وتقديم عرض</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bidding Modal */}
      {activeAuctionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">تقديم مزايدة على: {activeAuctionModal.title}</h3>
            
            {successMessage ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>تم تسجيل مزايدتك بنجاح وتحديث السعر!</span>
              </div>
            ) : (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>السعر الحالي:</span>
                    <span className="text-amber-400 font-bold font-mono">{activeAuctionModal.currentBid.toLocaleString()} $</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>الحد الأدنى للزيادة:</span>
                    <span className="text-zinc-200 font-mono">+500 $</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">مبلغ مزايدتك ($)</label>
                  <input
                    type="number"
                    required
                    min={activeAuctionModal.currentBid + 100}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAuctionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs"
                  >
                    تأكيد المزايدة
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
