import React, { useState } from 'react';
import { Gavel, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuctionService } from '../../services/platformServices';
import { AdBanner } from '../../components/common/AdBanner';

export const AuctionDetailsPage: React.FC = () => {
  const auctionData = AuctionService.getDemoRecord();
  const [bid, setBid] = useState(auctionData.current_bid || 34500000);
  const [agreed, setAgreed] = useState(false);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="6" className="mb-1" />
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={() => window.history.back()} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للمزادات</span>
        </button>
      </div>
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] p-4 sm:p-5 space-y-3 shadow-2xl">
        <h1 className="text-base sm:text-xl font-black text-white">{auctionData.title}</h1>
        <p className="text-xs text-zinc-300">{auctionData.description}</p>
        <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2">
          <span className="text-xs text-[#9CA3AF]">أعلى مزايدة: <b className="text-[#FFC500] font-mono text-sm">{bid.toLocaleString()} {auctionData.currency}</b></span>
        </div>
      </div>
    </div>
  );
};
