import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, MapPin, Calendar, ArrowLeft } from 'lucide-react';

export interface AuctionCardData {
  id: string;
  title: string;
  category?: string;
  city?: string;
  sale_type?: 'auction' | 'fixed_price' | string;
  starting_price?: number;
  current_bid?: number;
  final_price?: number;
  currency?: string;
  status: string;
  images?: string[];
  image_url?: string;
  created_at?: string;
  end_date?: string;
}

interface AuctionCardProps {
  auction: AuctionCardData | any;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const isAuction = auction.sale_type === 'auction' || auction.saleType === 'auction' || !auction.sale_type;
  const displayPrice = auction.current_bid || auction.currentBid || auction.starting_price || auction.startingPrice || auction.final_price || auction.finalPrice;
  const mainImage = (auction.images && auction.images.length > 0) ? auction.images[0] : auction.image_url;

  return (
    <div className="flex flex-col bg-[#0D1527] border border-slate-800 hover:border-[#F5C400]/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 font-['Cairo']">
      <div className="relative w-full h-44 bg-[#060A13] overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={auction.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Gavel className="w-12 h-12 text-[#F5C400]/40" />
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#060A13]/90 text-emerald-400 border border-emerald-500/30">
            {auction.status === 'active' ? 'جاري الآن' : auction.status === 'completed' ? 'منتهي' : (auction.status || 'متاح')}
          </span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#F5C400] text-black">
            {isAuction ? 'مزاد' : 'بيع مباشر'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
            {auction.title}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            {auction.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F5C400] shrink-0" />
                <span>{auction.city}</span>
              </div>
            )}
            {auction.end_date && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>ينتهي: {auction.end_date}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">
              {isAuction ? 'السعر الحالي / الابتدائي' : 'السعر المطلوب'}
            </span>
            <span className="text-sm font-bold text-[#F5C400]">
              {displayPrice ? `${displayPrice.toLocaleString()} ${auction.currency || 'YER'}` : 'عند المزايدة'}
            </span>
          </div>

          <Link
            to={`/auctions/${auction.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-lg transition-colors shadow-sm"
          >
            <span>عرض المزاد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
