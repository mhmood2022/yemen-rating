import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Globe, MessageCircle, Star, ArrowRight, Check, Camera, ShieldCheck, Megaphone } from 'lucide-react';
import { BankService } from '../../services/platformServices';
import { YRBadge } from '../../components/common/YRBadge';
import { AdBanner } from '../../components/common/AdBanner';
import { YRReviewSystem } from '../../components/common/YRReviewSystem';

export const BankProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const bankData = BankService.getDemoRecord();
  const gallery = bankData.media.filter(m => m.media_type === 'image');

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="4" className="mb-1" />
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <button onClick={() => navigate('/banks')} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للبنوك</span>
        </button>
      </div>

      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative">
        <div className="relative h-44 sm:h-64 w-full bg-[#161619] overflow-hidden">
          <img src={bankData.cover_url} alt={bankData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
        </div>

        <div className="p-4 sm:p-5 relative -mt-12 sm:-mt-14 z-10 space-y-3">
          <div className="flex items-end gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F0F12] border-2 border-[#FFC500] p-1 shadow-2xl shrink-0 overflow-hidden">
              <img src={bankData.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-lg font-black text-white">{bankData.name}</h1>
                <YRBadge type={bankData.badge_type || 'gold'} size={18} showTooltip />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="px-2 py-0.2 rounded bg-[#FFC500]/15 text-[#FFC500] font-bold">{bankData.category_label}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><MapPin size={11} className="text-[#FFC500]" /> {bankData.city_name}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pt-1 font-medium">{bankData.description}</p>
        </div>
      </div>

      <YRReviewSystem entityType="bank" entityId={bankData.id} initialReviews={bankData.reviews} />
    </div>
  );
};
