import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Globe, MessageCircle, Star, ArrowRight, Tag } from 'lucide-react';
import { BusinessService } from '../../services/platformServices';
import { YRBadge } from '../../components/common/YRBadge';
import { AdBanner } from '../../components/common/AdBanner';
import { YRReviewSystem } from '../../components/common/YRReviewSystem';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const businessData = BusinessService.getDemoRecord();

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="4" className="mb-1" />
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع</span>
        </button>
      </div>
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative p-4">
        <h1 className="text-base sm:text-xl font-black text-white">{businessData.name}</h1>
        <p className="text-xs text-zinc-300 leading-relaxed mt-2">{businessData.description}</p>
      </div>
      <YRReviewSystem entityType="business" entityId={businessData.id} initialReviews={businessData.reviews} />
    </div>
  );
};
