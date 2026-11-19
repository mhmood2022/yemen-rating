import React, { useState, useEffect } from 'react';
import { XSpinner } from '../../components/ui/LoadingSpinner';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Gavel } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import { XMarketItem, XMarketDetailView, XImageLightbox, XToast, XToastState } from '../../components/common/XMarketUI';
import { XAuctionBidModal } from '../../components/auctions/XAuctionBidModal';
import { BadgeType } from '../../components/common/VerifiedBadge';
import { AUCTION_CATEGORY_OPTIONS, parseAuctionMeta } from '../../constants/marketOptions';
import { NOT_AVAILABLE } from '../../constants/realEstateOptions';

export const AuctionDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any | null>(null);
  const [biz, setBiz] = useState<BusinessPageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showBid, setShowBid] = useState(false);
  const [toast, setToast] = useState<XToastState | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success', ms = 3000) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  };

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    const { data } = await supabase.from('auctions').select('*').eq('id', slug).maybeSingle();
    setAuction(data);
    if (data?.business_id) {
      const { data: b } = await supabase.from('businesses').select('*').eq('id', data.business_id).maybeSingle();
      if (b) setBiz(mapBusinessToPage(b));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [slug]);
  const back = () => window.history.length > 1 ? navigate(-1) : navigate('/auctions');

  if (loading) return <div dir="rtl" className="min-h-screen bg-black flex items-center justify-center"><XSpinner size={28} /></div>;
  if (!auction) return <div dir="rtl" className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-['Tahoma',sans-serif]"><AlertCircle className="w-10 h-10 text-[#FFC500] mb-3" /><p className="text-sm font-bold">لم يتم العثور على المزاد</p><button onClick={back} className="mt-4 px-5 py-2 bg-[#FFC500] text-black font-bold rounded-full text-xs">رجوع</button></div>;

  const isDirect = auction.sale_type === 'fixed_price' || auction.sale_type === 'direct';
  const bid = Number(auction.current_bid || auction.starting_price || auction.final_price || 0);
  const imgs = Array.isArray(auction.images) && auction.images.length > 0 ? auction.images : (Array.isArray(auction.image_urls) ? auction.image_urls : []);
  const parsed = parseAuctionMeta(auction.description);
  const catLabel = AUCTION_CATEGORY_OPTIONS.find((x) => x.id === auction.category)?.label || auction.category;
  const fallbackPairs = [
    { label: 'النوع', value: isDirect ? 'بيع مباشر' : 'مزاد علني' },
    ...(catLabel ? [{ label: 'التصنيف', value: catLabel }] : []),
    ...(auction.city ? [{ label: 'المحافظة', value: auction.city }] : []),
  ];

  const xItem: XMarketItem = {
    id: auction.id, detailPath: `/auctions/${auction.id}`, actionLabel: isDirect ? 'التفاصيل' : 'المزايدة', actionIcon: <Gavel size={14} />, onAction: () => setShowBid(true),
    authorName: biz?.name || auction.seller_name || (isDirect ? 'بيع مباشر' : 'مزاد علني'), authorUsername: biz?.username || auction.city || 'auction', authorAvatar: biz?.avatarUrl || '',
    badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none', businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
    createdAt: auction.created_at, title: auction.title, priceText: `${bid.toLocaleString()} ${auction.currency || 'YER'}`, description: parsed.notes,
    metaParts: [isDirect ? 'بيع مباشر' : 'مزاد علني', catLabel, auction.city].filter(Boolean),
    specPairs: (parsed.pairs.length > 0 ? parsed.pairs : fallbackPairs).filter((x) => x.value !== NOT_AVAILABLE),
    videoUrl: parsed.videoUrl,
    blueprintImage: parsed.docImage,
    tagLabel: isDirect ? 'بيع مباشر' : 'مزاد علني', images: imgs, city: auction.city, phone: auction.seller_phone || biz?.phone || '',
  };

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white font-['Tahoma',sans-serif]">
      <XToast toast={toast} />
      <XMarketDetailView item={xItem} activeImageIndex={activeImageIndex} onChangeImageIndex={setActiveImageIndex} onBack={back} onOpenLightbox={() => setIsLightboxOpen(true)} onShare={() => { navigator.clipboard?.writeText(window.location.href); showToast('تم نسخ الرابط', 'success', 2500); }} />
      <XImageLightbox isOpen={isLightboxOpen} item={xItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <XAuctionBidModal auction={showBid ? auction : null} onClose={() => setShowBid(false)} onSuccess={(m) => { showToast(m, 'success', 3500); load(); }} />
    </div>
  );
};
