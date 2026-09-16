import React, { useState, useEffect } from 'react';
import { Gavel, ArrowRight, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { AuctionCard } from '../auctions/AuctionCard';

interface AuctionsPageProps {
  onBack?: () => void;
}

export const AuctionsPage: React.FC<AuctionsPageProps> = ({ onBack }) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'fixed_price'>('all');
  const [cityFilter, setCityFilter] = useState('all');

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const filteredListings = listings.filter((item) => {
    const saleType = item.sale_type || item.saleType || 'auction';
    const matchTab = activeTab === 'all' || saleType === activeTab;
    const matchCity = cityFilter === 'all' || (item.city && item.city.includes(cityFilter));
    return matchTab && matchCity;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="6" className="mb-2" />

      {/* الرأس */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#162238] border border-slate-700 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all"
            >
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-lg sm:text-xl font-black text-white">المزادات والعروض الحصرية</h1>
          </div>
        </div>

        <button
          onClick={fetchAuctions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#162238] border border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* شريط الفلترة */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#162238] p-3 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-1.5 bg-[#0B1325] p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === 'all' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab('auction')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === 'auction' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            مزاد حي
          </button>
          <button
            onClick={() => setActiveTab('fixed_price')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === 'fixed_price' ? 'bg-[#D4AF37] text-[#0B1325]' : 'text-slate-300 hover:text-white'
            }`}
          >
            بيع مباشر
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin size={14} className="text-[#D4AF37]" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#0B1325] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">كافة المدن</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
            <option value="الحديدة">الحديدة</option>
          </select>
        </div>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span className="text-xs font-bold">جاري تحميل المزادات الحقيقية...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-[#162238] rounded-2xl border border-slate-700/60 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد مزادات معروضة حالياً</h3>
          <p className="text-xs text-slate-400">سيتم إدراج المزادات والعروض فور اعتمادها من لوحة التحكم.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};
