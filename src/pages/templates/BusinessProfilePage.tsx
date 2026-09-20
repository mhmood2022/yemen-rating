import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { YRReviewSystem } from '../../components/common/YRReviewSystem';
import { YRBadge } from '../../components/common/YRBadge';
import { AdBanner } from '../../components/common/AdBanner';
import { ClaimOwnershipModal } from '../../components/business/ClaimOwnershipModal';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBusiness = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // البحث بالـ slug أولاً، ثم بالـ id
        let { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (!data && !error) {
          const res = await supabase
            .from('businesses')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
          data = res.data;
        }

        if (isMounted) {
          setBusiness(data);
        }
      } catch (err) {
        console.error('Error fetching business:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusiness();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070A10] flex items-center justify-center text-white font-['Cairo']">
        <p className="text-xs font-bold text-amber-400">جاري تحميل بيانات المنشأة...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#070A10] flex flex-col items-center justify-center text-white font-['Cairo'] space-y-3">
        <p className="text-sm font-bold text-red-400">عذراً، لم يتم العثور على هذه المنشأة</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-1.5 rounded-xl bg-[#161619] border border-white/10 text-xs font-bold text-zinc-300"
        >
          رجوع
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="business_profile_top" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight size={13} className="rtl:rotate-180" /> رجوع
        </button>

        {(!business.is_verified || business.is_verified === 'false' || business.ownership_status === 'UNCLAIMED') && (
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30 transition"
          >
            طلب إثبات ملكية الصفحة
          </button>
        )}
      </div>

      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl relative">
        <div className="relative h-44 sm:h-64 w-full bg-[#161619] overflow-hidden">
          {business.cover_url ? (
            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
        </div>

        <div className="p-4 sm:p-5 relative -mt-12 sm:-mt-14 z-10 space-y-3">
          <div className="flex items-end gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F0F12] border-2 border-[#FFC500] p-1 shadow-2xl overflow-hidden shrink-0">
              {business.logo_url ? (
                <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-[#161619] flex items-center justify-center text-amber-400 font-black text-xl">
                  {business.name?.charAt(0) || 'Y'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-white">{business.name}</h1>
                {business.badge_type && business.badge_type !== 'none' && (
                  <YRBadge type={business.badge_type as any} size={18} showTooltip />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin size={12} className="text-[#FFC500]" />
                <span>{business.city || 'اليمن'}</span>
              </div>
            </div>
          </div>

          {business.description && (
            <p className="text-xs text-zinc-300 leading-relaxed pt-1 font-medium">{business.description}</p>
          )}
        </div>
      </div>

      <YRReviewSystem entityType="business" entityId={business.id} initialReviews={[]} />

      {showClaimModal && (
        <ClaimOwnershipModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => alert('تم إرسال طلبك بنجاح!')}
          businessId={business.id}
          businessName={business.name}
        />
      )}

      <AdBanner placementId="business_profile_footer" className="mt-4" />
    </div>
  );
};

export default BusinessProfilePage;
