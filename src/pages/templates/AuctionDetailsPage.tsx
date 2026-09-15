import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../../components/common/AdBanner';

export const AuctionDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuction() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('auctions')
          .select('*')
          .or(`id.eq.${slug},title.eq.${decodeURIComponent(slug)}`)
          .maybeSingle();

        if (error) throw error;
        setAuction(data);
      } catch (err: any) {
        setError(err.message || 'تعذر تحميل بيانات المزاد');
      } finally {
        setLoading(false);
      }
    }
    fetchAuction();
  }, [slug]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[50vh] flex items-center justify-center font-['Cairo'] text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span>جاري تحميل المزاد...</span>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8 text-center font-['Cairo'] text-white">
        <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <p className="text-base font-bold">لم يتم العثور على المزاد المطلوب</p>
        <button
          onClick={() => navigate('/auctions')}
          className="mt-4 px-4 py-2 bg-[#162238] border border-[#D4AF37]/50 text-[#D4AF37] rounded-lg text-xs"
        >
          العودة لقائمة المزادات
        </button>
      </div>
    );
  }

  const isAuction = auction.sale_type === 'auction' || auction.saleType === 'auction' || !auction.sale_type;
  const currentPrice = auction.current_bid || auction.currentBid || auction.starting_price || auction.startingPrice || auction.final_price || auction.finalPrice;
  const images: string[] = Array.isArray(auction.images) ? auction.images : (auction.image_url ? [auction.image_url] : []);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="6" className="mb-2" />

      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <button
          onClick={() => navigate('/auctions')}
          className="px-3 py-1.5 rounded-lg bg-[#162238] border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rtl:rotate-180" />
          <span>الرجوع للمزادات</span>
        </button>
        <span className="text-xs px-2.5 py-1 rounded bg-[#162238] text-slate-300 border border-slate-700">
          حالة المزاد: <strong className="text-[#D4AF37]">{auction.status || 'نشط'}</strong>
        </span>
      </div>

      <div className="bg-[#162238] rounded-2xl border border-slate-700/70 p-4 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            {images.length > 0 ? (
              <div className="rounded-xl overflow-hidden bg-[#0B1325] border border-slate-700 h-64 sm:h-80">
                <img src={images[0]} alt={auction.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-64 sm:h-80 bg-[#0B1325] rounded-xl border border-slate-700 flex items-center justify-center">
                <Gavel className="w-16 h-16 text-slate-600" />
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                {auction.title}
              </h1>

              {auction.city && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>{auction.city}</span>
                </div>
              )}

              {auction.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-4 bg-[#0B1325]/50 p-3 rounded-lg border border-slate-700/50">
                  {auction.description}
                </p>
              )}
            </div>

            <div className="bg-[#0B1325] p-4 rounded-xl border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isAuction ? 'السعر الحالي / الافتتاحي:' : 'السعر المطلوب:'}
                </span>
                <span className="text-base sm:text-lg font-black text-[#D4AF37]">
                  {currentPrice ? `${currentPrice.toLocaleString()} ${auction.currency || 'YER'}` : 'غير محدد'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>المزايدة والتوثيق يتمان وفق سياسة منصة يمن ريتغ للوساطة والضمان.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
