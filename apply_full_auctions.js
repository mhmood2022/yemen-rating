const fs = require('fs');

// 1. كتابة كود صفحة المزادات والبيع المباشر في الموقع العام
const auctionsPageCode = `import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, Clock, ArrowRight, Plus, MapPin, 
  CheckCircle2, User, X, Upload, Trash2, ShieldCheck,
  Tag, MessageSquare, Send, AlertTriangle, CreditCard,
  Check, FileText, ChevronRight, ChevronLeft, Building2,
  DollarSign, ShoppingCart, Eye, Lock
} from 'lucide-react';
import { AdBanner } from '../common/AdBanner';
import { adminAuctionsService } from '../../services/adminService';

export interface AuctionListing {
  id: string;
  itemType: 'سيارة' | 'هاتف' | 'إلكترونيات' | 'عقار' | 'أثاث' | 'أخرى';
  itemName: string;
  title: string;
  description: string;
  category: string;
  city: string;
  areaLocation?: string;
  itemCondition: 'جديد' | 'مستعمل';
  images: string[];
  sellerName: string;
  sellerPhone: string;
  sellerId: string;
  saleType: 'fixed_price' | 'auction';
  fixedPrice?: number;
  startingPrice?: number;
  minIncrement?: number;
  currentBid?: number;
  bidsCount?: number;
  startTime?: string;
  endTime?: string;
  timeLeftSeconds?: number;
  currency: string;
  winnerBuyerName?: string;
  winnerBuyerPhone?: string;
  winnerBuyerId?: string;
  finalPrice?: number;
  status: 'active' | 'scheduled' | 'ended_with_winner' | 'ended_no_bids' | 'deal_pending_confirmation' | 'deal_confirmed_commission_due' | 'deal_completed' | 'dispute_opened';
  dealConfirmedBySeller?: boolean;
  dealConfirmedByBuyer?: boolean;
  commissionAmount?: number;
  commissionStatus: 'not_due' | 'due' | 'pending_admin_verification' | 'paid' | 'rejected';
  transferNumber?: string;
  receiptImage?: string;
  disputeStatus: 'no_dispute' | 'open' | 'under_review' | 'decision_made' | 'closed';
  disputeReason?: string;
  bidsHistory: { id: string; bidderCode: string; amount: number; time: string }[];
  messages: { id: string; senderRole: 'seller' | 'buyer' | 'admin'; senderName: string; text: string; time: string }[];
}

const INITIAL_LISTINGS: AuctionListing[] = [
  {
    id: 'auc-201',
    itemType: 'سيارة',
    itemName: 'تويوتا لاندكروزر V8',
    title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي',
    description: 'سيارة وكالة بحالة ممتازة، عداد 24,000 كم فقط، صيانة دورية منتظمة، طلاء المصنع بالكامل، جلد بيج، كاميرات 360، فتحة سقف، بصمة.',
    category: 'سيارات',
    city: 'صنعاء',
    areaLocation: 'حدة — جولة الرويشان',
    itemCondition: 'مستعمل',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c86629c983?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=85'
    ],
    sellerName: 'معرض النخبة',
    sellerPhone: '777123456',
    sellerId: 'user-seller-1',
    saleType: 'auction',
    startingPrice: 32000000,
    minIncrement: 500000,
    currentBid: 34500000,
    bidsCount: 18,
    currency: 'YER',
    timeLeftSeconds: 15480,
    status: 'active',
    commissionAmount: 1725000,
    commissionStatus: 'not_due',
    disputeStatus: 'no_dispute',
    bidsHistory: [
      { id: 'b-1', bidderCode: 'مزايد #9700', amount: 34500000, time: 'الآن' },
      { id: 'b-2', bidderCode: 'مزايد #8392', amount: 34000000, time: 'منذ 15 دقيقة' },
      { id: 'b-3', bidderCode: 'مزايد #4110', amount: 33500000, time: 'منذ ساعة' }
    ],
    messages: []
  },
  {
    id: 'auc-202',
    itemType: 'هاتف',
    itemName: 'iPhone 15 Pro Max',
    title: 'آيفون 15 برو ماكس 256 جيجابايت تيتانيوم طبيعي',
    description: 'جهاز جديد كرت أصلي بالكرتون وكامل ملحقات الوكالة، بطارية 100%، مجمرك رسمياً شريحتين.',
    category: 'هواتف',
    city: 'عدن',
    areaLocation: 'المنصورة — شارع القصر',
    itemCondition: 'جديد',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=85'
    ],
    sellerName: 'العصرية للإلكترونيات',
    sellerPhone: '733987654',
    sellerId: 'user-seller-2',
    saleType: 'fixed_price',
    fixedPrice: 620000,
    currency: 'YER',
    status: 'active',
    commissionAmount: 20000,
    commissionStatus: 'not_due',
    disputeStatus: 'no_dispute',
    bidsHistory: [],
    messages: []
  }
];

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return \`\${h}:\${m}:\${s}\`;
}

export const AuctionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'fixed_price'>('all');
  const [selectedListing, setSelectedListing] = useState<AuctionListing | null>(null);
  const [listings, setListings] = useState<AuctionListing[]>(INITIAL_LISTINGS);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [commissionSettings, setCommissionSettings] = useState<any>({
    default_fixed_commission_amount: 20000,
    default_auction_commission_rate: 5.0,
    bank_name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    account_holder_name: 'منصة يمن ريتغ للوساطة والتسويق',
    account_number: '3001234567',
    wallet_provider: 'محفظة جوالي / كاش',
    wallet_number: '777000111',
    payment_instructions: 'يرجى توريد مبلغ العمولة باسم المنصة وإرفاق صورة واضحة من إشعار أو إيصال التحويل ورقم العملية.'
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemType, setItemType] = useState<AuctionListing['itemType']>('سيارة');
  const [itemName, setItemName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('سيارات');
  const [city, setCity] = useState('صنعاء');
  const [areaLocation, setAreaLocation] = useState('');
  const [itemCondition, setItemCondition] = useState<'جديد' | 'مستعمل'>('مستعمل');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [saleType, setSaleType] = useState<'fixed_price' | 'auction'>('auction');
  const [currency, setCurrency] = useState('YER');
  const [fixedPrice, setFixedPrice] = useState<number>(50000);
  const [startingPrice, setStartingPrice] = useState<number>(100000);
  const [minIncrement, setMinIncrement] = useState<number>(5000);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [consentListing, setConsentListing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [consentBuyerPurchase, setConsentBuyerPurchase] = useState(false);

  const [bidInput, setBidInput] = useState<number>(0);
  const [consentBidder, setConsentBidder] = useState(false);

  const [isConfirmDealModalOpen, setIsConfirmDealModalOpen] = useState(false);
  const [consentDealCompletion, setConsentDealCompletion] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transferNumber, setTransferNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [consentPaymentProof, setConsentPaymentProof] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);

  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('عدم تسليم المعروض');
  const [disputeDetails, setDisputeDetails] = useState('');

  const [chatMessage, setChatMessage] = useState('');
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    adminAuctionsService.getPlatformCommissionSettings().then(res => {
      if (res.data) setCommissionSettings(res.data);
    });

    const timer = setInterval(() => {
      setListings(prev => prev.map(item => {
        if (item.saleType === 'auction' && item.timeLeftSeconds && item.status === 'active') {
          const nextTime = Math.max(0, item.timeLeftSeconds - 1);
          return {
            ...item,
            timeLeftSeconds: nextTime,
            status: nextTime === 0 ? ((item.bidsCount || 0) > 0 ? 'ended_with_winner' : 'ended_no_bids') : item.status
          };
        }
        return item;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenListing = (item: AuctionListing) => {
    setSelectedListing(item);
    setActiveImageIndex(0);
    if (item.saleType === 'auction') {
      setBidInput((item.currentBid || item.startingPrice || 0) + (item.minIncrement || 1000));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remaining = 6 - uploadedImages.length;
      const taken = Array.from(files).slice(0, remaining);
      const urls = taken.map(f => URL.createObjectURL(f));
      setUploadedImages(prev => [...prev, ...urls]);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellerPhone.trim() || !consentListing) return;

    const isFixed = saleType === 'fixed_price';
    const imagesToUse = uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=85'];

    const newListing: AuctionListing = {
      id: \`auc-\${Date.now()}\`,
      itemType,
      itemName: itemName || title,
      title,
      description,
      category,
      city,
      areaLocation,
      itemCondition,
      images: imagesToUse,
      sellerName: sellerName || 'صاحب العرض',
      sellerPhone,
      sellerId: 'current-user',
      saleType,
      currency,
      fixedPrice: isFixed ? Number(fixedPrice) : undefined,
      startingPrice: !isFixed ? Number(startingPrice) : undefined,
      minIncrement: !isFixed ? Number(minIncrement) : undefined,
      currentBid: !isFixed ? Number(startingPrice) : undefined,
      bidsCount: 0,
      timeLeftSeconds: !isFixed ? 86400 * 2 : undefined,
      status: 'active',
      commissionAmount: isFixed ? 20000 : (Number(startingPrice) * 0.05),
      commissionStatus: 'not_due',
      disputeStatus: 'no_dispute',
      bidsHistory: [],
      messages: []
    };

    setListings(prev => [newListing, ...prev]);
    setIsAddModalOpen(false);
    setConsentListing(false);
    setUploadedImages([]);
    setToastMessage(\`تم نشر \${isFixed ? 'عرض البيع بسعر ثابت' : 'المزاد العلني'} بنجاح وتوثيق الإقرار\`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBuyerConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !consentBuyerPurchase || !buyerPhone.trim()) return;

    const updated: AuctionListing = {
      ...selectedListing,
      winnerBuyerName: buyerName || 'المشتري',
      winnerBuyerPhone: buyerPhone,
      status: 'deal_pending_confirmation',
      messages: [
        {
          id: \`msg-\${Date.now()}\`,
          senderRole: 'admin',
          senderName: 'وساطة يمن ريتغ',
          text: 'تم إنشاء هذه المحادثة الخاصة بين البائع والمشتري للاتفاق على طريقة الدفع ومكان وموعد استلام وتسليم المعروض.',
          time: 'الآن'
        }
      ]
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setIsBuyModalOpen(false);
    setConsentBuyerPurchase(false);
    setToastMessage('تم تأكيد رغبة الشراء بنجاح وفتح المحادثة الخاصة مع البائع');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !consentBidder) return;

    const minAllowed = (selectedListing.currentBid || selectedListing.startingPrice || 0) + (selectedListing.minIncrement || 1000);
    if (bidInput < minAllowed) {
      setToastMessage(\`الحد الأدنى للمزايدة التالية هو \${minAllowed.toLocaleString()} \${selectedListing.currency}\`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newBid = {
      id: \`b-\${Date.now()}\`,
      bidderCode: \`مزايد #\${Math.floor(1000 + Math.random() * 9000)}\`,
      amount: bidInput,
      time: 'الآن'
    };

    const updated: AuctionListing = {
      ...selectedListing,
      currentBid: bidInput,
      bidsCount: (selectedListing.bidsCount || 0) + 1,
      finalPrice: bidInput,
      winnerBuyerName: newBid.bidderCode,
      bidsHistory: [newBid, ...(selectedListing.bidsHistory || [])]
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setBidInput(bidInput + (selectedListing.minIncrement || 1000));
    setConsentBidder(false);
    setToastMessage('تم تسجيل وتوثيق مزايدتك بنجاح');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDealCompletion = () => {
    if (!selectedListing || !consentDealCompletion) return;

    const isFixed = selectedListing.saleType === 'fixed_price';
    const dueAmount = isFixed ? 20000 : ((selectedListing.finalPrice || selectedListing.currentBid || 0) * 0.05);

    const updated: AuctionListing = {
      ...selectedListing,
      status: 'deal_confirmed_commission_due',
      commissionStatus: 'due',
      commissionAmount: dueAmount,
      dealConfirmedBySeller: true,
      dealConfirmedByBuyer: true
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setIsConfirmDealModalOpen(false);
    setConsentDealCompletion(false);
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !transferNumber.trim() || !consentPaymentProof) return;

    const updated: AuctionListing = {
      ...selectedListing,
      transferNumber,
      receiptImage: receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      commissionStatus: 'pending_admin_verification'
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setIsPaymentModalOpen(false);
    setConsentPaymentProof(false);
    setToastMessage('تم إرسال إثبات السداد بنجاح — العملية قيد مراجعة وتحقق الإدارة');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleOpenDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !disputeDetails.trim()) return;

    const updated: AuctionListing = {
      ...selectedListing,
      status: 'dispute_opened',
      disputeStatus: 'open',
      disputeReason: \`\${disputeCategory}: \${disputeDetails}\`
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setIsDisputeModalOpen(false);
    setDisputeDetails('');
    setToastMessage('تم فتح النزاع وتجميد إغلاق العملية حتى صدور قرار الإدارة');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !chatMessage.trim()) return;

    const newMsg = {
      id: \`msg-\${Date.now()}\`,
      senderRole: 'seller' as const,
      senderName: selectedListing.sellerName,
      text: chatMessage.trim(),
      time: 'الآن'
    };

    const updated: AuctionListing = {
      ...selectedListing,
      messages: [...(selectedListing.messages || []), newMsg]
    };

    setSelectedListing(updated);
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setChatMessage('');
  };

  const filteredListings = listings.filter(item => {
    if (activeTab === 'auction') return item.saleType === 'auction';
    if (activeTab === 'fixed_price') return item.saleType === 'fixed_price';
    return true;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white">
      
      <AdBanner placementId="6" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Gavel size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              المزادات والبيع المباشر
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              عروض بيع بسعر ثابت ومزادات مباشرة بإشراف يمن ريتغ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>إضافة معروض</span>
          </button>
          
          <button
            onClick={selectedListing ? () => setSelectedListing(null) : onBack}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedListing ? 'رجوع' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedListing ? (
        <div className="space-y-3">
          {selectedListing.disputeStatus === 'open' && (
            <div className="p-3 bg-[#DC2626]/15 border border-[#DC2626] rounded-xl flex items-center gap-2 text-xs text-white font-bold">
              <AlertTriangle size={16} className="text-[#DC2626] shrink-0" />
              <div>
                <span>نزاع مفتوح — تم تجميد إغلاق العملية بانتظار قرار الإدارة.</span>
                <span className="text-[10px] text-gray-300 block font-normal">{selectedListing.disputeReason}</span>
              </div>
            </div>
          )}

          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            <div 
              className="relative h-56 sm:h-72 w-full bg-[#161619] overflow-hidden cursor-pointer select-none"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img src={selectedListing.images[activeImageIndex]} alt={selectedListing.title} className="w-full h-full object-cover" />
              <span className={\`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black shadow-md \${selectedListing.saleType === 'fixed_price' ? 'bg-[#2EA5FF] text-white' : 'bg-[#DC2626] text-white'}\`}>
                {selectedListing.saleType === 'fixed_price' ? 'بيع بسعر ثابت' : 'مزاد مباشر'}
              </span>
              {selectedListing.saleType === 'auction' && selectedListing.timeLeftSeconds !== undefined && (
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 text-white text-[10px] font-mono border border-white/10">
                  ⏳ المتبقي: {formatTimer(selectedListing.timeLeftSeconds)}
                </span>
              )}
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedListing.itemType}
                  </span>
                  <span className="text-[11px] text-gray-400">📍 {selectedListing.city} {selectedListing.areaLocation ? \`• \${selectedListing.areaLocation}\` : ''}</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                  {selectedListing.title}
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed font-medium">
                  {selectedListing.description}
                </p>
              </div>

              {selectedListing.saleType === 'fixed_price' && (
                <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2.5">
                  <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block font-bold">سعر البيع المحدد:</span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#FFC500]">
                        {selectedListing.fixedPrice?.toLocaleString()} <span className="text-xs">{selectedListing.currency}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 font-bold">البائع: {selectedListing.sellerName}</span>
                  </div>

                  {selectedListing.status === 'active' && (
                    <button
                      onClick={() => setIsBuyModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart size={15} />
                      <span>تأكيد الشراء والتواصل مع البائع</span>
                    </button>
                  )}
                </div>
              )}

              {selectedListing.saleType === 'auction' && (
                <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2.5">
                  <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block font-bold">أعلى مزايدة:</span>
                      <div className="text-xl sm:text-2xl font-mono font-black text-[#FFC500]">
                        {selectedListing.currentBid?.toLocaleString()} <span className="text-xs">{selectedListing.currency}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">الابتدائي: {selectedListing.startingPrice?.toLocaleString()} {selectedListing.currency}</span>
                  </div>

                  {selectedListing.status === 'active' && (
                    <form onSubmit={handlePlaceBid} className="space-y-2 pt-1">
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          min={(selectedListing.currentBid || 0) + (selectedListing.minIncrement || 1000)}
                          step={selectedListing.minIncrement || 1000}
                          value={bidInput}
                          onChange={(e) => setBidInput(Number(e.target.value))}
                          className="flex-1 bg-[#0F0F12] border border-[#27272A] focus:border-[#FFC500] rounded-xl p-2 text-sm font-mono font-bold text-white outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!consentBidder}
                          className="px-5 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <Gavel size={14} />
                          <span>تأكيد المزايدة</span>
                        </button>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0F0F12] border border-[#27272A] space-y-1">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={consentBidder}
                            onChange={(e) => setConsentBidder(e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#FFC500] rounded mt-0.5 cursor-pointer shrink-0"
                          />
                          <span className="text-[10px] text-gray-300 leading-snug">
                            <b>تنبيه إلزامي:</b> بتأكيد المزايدة، يقرّ المزايد بموافقته على شروط المزاد، وأن مزايدته ملزمة له ويلتزم بإتمام الشراء في حال فوزه.
                          </span>
                        </label>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {(selectedListing.status === 'deal_pending_confirmation' || selectedListing.status === 'deal_confirmed_commission_due' || selectedListing.status === 'deal_completed' || selectedListing.status === 'dispute_opened') && (
                <div className="p-3.5 rounded-xl bg-[#161619] border border-[#27272A] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                    <span className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                      <MessageSquare size={14} /> المحادثة الخاصة بالصفقة
                    </span>
                    {selectedListing.disputeStatus === 'no_dispute' && (
                      <button onClick={() => setIsDisputeModalOpen(true)} className="text-[10px] text-[#DC2626] font-bold flex items-center gap-1 hover:underline cursor-pointer">
                        <AlertTriangle size={12} /> فتح نزاع
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-[#0F0F12] rounded-xl border border-[#27272A] text-xs">
                    {selectedListing.messages && selectedListing.messages.length > 0 ? (
                      selectedListing.messages.map((m) => (
                        <div key={m.id} className="p-2 rounded-lg bg-[#18181C] space-y-0.5">
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                            <span>{m.senderName} ({m.senderRole})</span>
                            <span className="font-mono">{m.time}</span>
                          </div>
                          <p className="text-gray-200">{m.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-[11px] text-gray-400">
                        محادثة مشفرة وخاصة لتنسيق الاستلام والتسليم والدفع بين الطرفين.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-1.5">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="اكتب تفاصيل الاتفاق أو موعد التسليم..."
                      className="flex-1 bg-[#0F0F12] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                    />
                    <button type="submit" className="p-2 bg-[#FFC500] text-black rounded-xl font-bold">
                      <Send size={14} />
                    </button>
                  </form>

                  <div className="pt-2 border-t border-[#27272A] space-y-2">
                    {selectedListing.status === 'deal_pending_confirmation' && (
                      <button
                        onClick={() => setIsConfirmDealModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white font-black text-xs hover:bg-[#16A34A]/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check size={15} />
                        <span>تأكيد إتمام الصفقة واستحقاق العمولة</span>
                      </button>
                    )}

                    {selectedListing.status === 'deal_confirmed_commission_due' && (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <CreditCard size={15} />
                        <span>سداد عمولة يمن ريتغ ورفع إثبات التحويل</span>
                      </button>
                    )}

                    {selectedListing.commissionStatus === 'pending_admin_verification' && (
                      <div className="p-2.5 bg-[#18181C] rounded-xl text-center text-xs text-amber-400 font-bold border border-amber-500/30">
                        ⏳ بانتظار تحقق واعتماد الإدارة لإثبات السداد
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-1 bg-[#0F0F12] p-1 rounded-xl border border-[#222226]">
            <button onClick={() => setActiveTab('all')} className={\`flex-1 py-1.5 rounded-lg text-xs font-black transition-all \${activeTab === 'all' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}\`}>الكل ({listings.length})</button>
            <button onClick={() => setActiveTab('auction')} className={\`flex-1 py-1.5 rounded-lg text-xs font-black transition-all \${activeTab === 'auction' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}\`}>المزادات</button>
            <button onClick={() => setActiveTab('fixed_price')} className={\`flex-1 py-1.5 rounded-lg text-xs font-black transition-all \${activeTab === 'fixed_price' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'}\`}>بيع بسعر ثابت</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredListings.map((item) => (
              <div key={item.id} className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-md transition-all flex flex-col justify-between">
                <div className="h-40 w-full relative bg-[#161619]">
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  <span className={\`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black \${item.saleType === 'fixed_price' ? 'bg-[#2EA5FF] text-white' : 'bg-[#DC2626] text-white'}\`}>
                    {item.saleType === 'fixed_price' ? 'سعر ثابت' : 'مزاد مباشر'}
                  </span>
                  {item.saleType === 'auction' && item.timeLeftSeconds !== undefined && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-white text-[9.5px] font-mono border border-white/10">
                      ⏳ {formatTimer(item.timeLeftSeconds)}
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-gray-400 mb-0.5">
                      <span className="text-[#FFC500] font-bold">{item.itemType}</span>
                      <span>•</span>
                      <span>{item.city}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</h3>
                  </div>

                  <div className="bg-[#161619] p-2 rounded-xl border border-[#27272A] flex justify-between items-center font-mono">
                    <div>
                      <span className="text-[8.5px] text-[#9CA3AF] block font-['Cairo']">{item.saleType === 'fixed_price' ? 'السعر المحدد:' : 'أعلى مزايدة:'}</span>
                      <b className="text-xs sm:text-sm text-[#FFC500]">{(item.saleType === 'fixed_price' ? item.fixedPrice : item.currentBid)?.toLocaleString()} {item.currency}</b>
                    </div>
                    <span className="text-[9px] text-gray-400 font-['Cairo']">{item.itemCondition}</span>
                  </div>

                  <button onClick={() => handleOpenListing(item)} className="w-full py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98">
                    <span>{item.saleType === 'fixed_price' ? 'عرض وشراء' : 'عرض ومزايدة'}</span>
                    <ArrowRight size={12} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نافذة إضافة معروض */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto cursor-default shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5"><Plus size={15} className="text-[#FFC500]" /> إضافة معروض جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white cursor-pointer">رجوع</button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-[#FFC500] block mb-1 font-bold">طريقة البيع المعتمدة*</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSaleType('fixed_price')} className={\`py-2 rounded-xl border text-xs font-bold transition-all \${saleType === 'fixed_price' ? 'bg-[#2EA5FF] text-white border-[#2EA5FF]' : 'bg-[#18181C] text-gray-400 border-[#27272A]'}\`}>بيع بسعر ثابت</button>
                  <button type="button" onClick={() => setSaleType('auction')} className={\`py-2 rounded-xl border text-xs font-bold transition-all \${saleType === 'auction' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#18181C] text-gray-400 border-[#27272A]'}\`}>مزاد (مزايدة)</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">نوع المعروض*</label>
                  <select value={itemType} onChange={(e) => setItemType(e.target.value as any)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none">
                    <option value="سيارة">سيارة</option><option value="هاتف">هاتف</option><option value="إلكترونيات">إلكترونيات</option><option value="عقار">عقار</option><option value="أثاث">أثاث</option><option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">حالة المعروض*</label>
                  <select value={itemCondition} onChange={(e) => setItemCondition(e.target.value as any)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none">
                    <option value="جديد">جديد</option><option value="مستعمل">مستعمل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">عنوان العرض*</label>
                <input type="text" required placeholder="اكتب عنوان العرض..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]" />
              </div>

              {saleType === 'fixed_price' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#FFC500] block mb-1 font-bold">سعر البيع*</label>
                    <input type="number" required value={fixedPrice} onChange={(e) => setFixedPrice(Number(e.target.value))} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">العملة*</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold">
                      <option value="YER">ريال يمني (YER)</option><option value="SAR">ريال سعودي (SAR)</option><option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-[#FFC500] block mb-1 font-bold">الابتدائي*</label>
                    <input type="number" required value={startingPrice} onChange={(e) => setStartingPrice(Number(e.target.value))} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">الحد الأدنى*</label>
                    <input type="number" required value={minIncrement} onChange={(e) => setMinIncrement(Number(e.target.value))} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">العملة*</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold">
                      <option value="YER">ريال يمني (YER)</option><option value="SAR">ريال سعودي (SAR)</option><option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">اسم صاحب العرض*</label>
                  <input type="text" required placeholder="اسمك..." value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">رقم التواصل*</label>
                  <input type="tel" required placeholder="777000111" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">وصف المعروض*</label>
                <textarea rows={2} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اكتب مواصفات وتفاصيل المعروض..." className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none" />
              </div>

              <div className="p-3 rounded-xl bg-[#18181C] border border-[#27272A] space-y-2">
                <div className="flex items-center gap-1.5 text-[#FFC500] font-bold text-[11px]"><ShieldCheck size={14} /><span>تنبيه إلزامي:</span></div>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  {saleType === 'fixed_price'
                    ? 'بتقديم هذا العرض، يقرّ صاحب العرض بصحة جميع البيانات والسعر المحدد، ويوافق على شروط وساطة يمن ريتغ، ويلتزم بإتمام البيع وسداد عمولة يمن ريتغ البالغة (20,000 ريال يمني) عند إتمام الصفقة.'
                    : 'بتقديم المعروض للمزاد، يقرّ صاحب المزاد بصحة جميع البيانات والسعر الابتدائي، ويوافق على نظام المزايدة، ويلتزم بسداد عمولة يمن ريتغ المستحقة عند إتمام الصفقة.'}
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={consentListing} onChange={(e) => setConsentListing(e.target.checked)} className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أوافق على الإقرار والشروط المعتمدة</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer">إلغاء</button>
                <button type="submit" disabled={!consentListing} className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md">نشر المعروض</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الشراء بالسعر الثابت */}
      {isBuyModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsBuyModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5"><ShoppingCart size={15} className="text-[#2EA5FF]" /> تأكيد الشراء والتواصل مع البائع</h3>
              <button onClick={() => setIsBuyModalOpen(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleBuyerConfirmPurchase} className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex justify-between items-center">
                <span>المعروض: <b>{selectedListing.title}</b></span>
                <b className="text-[#FFC500] font-mono">{selectedListing.fixedPrice?.toLocaleString()} {selectedListing.currency}</b>
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">اسم المشتري*</label>
                <input type="text" required placeholder="اسمك الكامل..." value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">رقم الهاتف للتواصل*</label>
                <input type="tel" required placeholder="777000111" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]" />
              </div>
              <div className="p-3 rounded-xl bg-[#18181C] border border-[#27272A] space-y-2">
                <div className="flex items-center gap-1.5 text-[#2EA5FF] font-bold text-[11px]"><ShieldCheck size={14} /><span>تنبيه إلزامي:</span></div>
                <p className="text-[10px] text-gray-300 leading-relaxed">بتأكيد الشراء، يقرّ المشتري بموافقته على السعر المعلن وشروط البيع، ويلتزم بإتمام عملية الشراء وفق الاتفاق مع صاحب العرض.</p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={consentBuyerPurchase} onChange={(e) => setConsentBuyerPurchase(e.target.checked)} className="w-4 h-4 accent-[#2EA5FF] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أوافق وأؤكد الشراء</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsBuyModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold">إلغاء</button>
                <button type="submit" disabled={!consentBuyerPurchase} className="px-5 py-2 rounded-xl bg-[#2EA5FF] text-white text-xs font-black hover:bg-[#2EA5FF]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md">تأكيد وفتح المحادثة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد إتمام الصفقة واستحقاق العمولة */}
      {isConfirmDealModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsConfirmDealModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#222226] pb-2">
              <CheckCircle2 size={16} className="text-[#16A34A]" /> إقرار وتأكيد إتمام الصفقة
            </h3>
            <div className="p-3 rounded-xl bg-[#18181C] border border-[#27272A] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#FFC500] font-bold text-[11px]"><ShieldCheck size={14} /><span>إقرار إلزامي لصاحب العرض/المزاد:</span></div>
              <p className="text-[10px] text-gray-300 leading-relaxed">
                {selectedListing.saleType === 'fixed_price'
                  ? 'أقرّ بأن عملية البيع قد تمت، وأنني استلمت قيمة المعروض وفق الاتفاق مع المشتري، وألتزم بسداد عمولة يمن ريتغ البالغة (20,000 ريال يمني) وفق بيانات الدفع المعتمدة.'
                  : 'أقرّ بأن المزاد قد انتهى بفائز وأن الصفقة قد تمت، وألتزم بسداد عمولة يمن ريتغ المستحقة عند إتمام الصفقة.'}
              </p>
              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none border-t border-[#27272A]">
                <input type="checkbox" checked={consentDealCompletion} onChange={(e) => setConsentDealCompletion(e.target.checked)} className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer" />
                <span className="text-[11px] font-bold text-white">أقرّ وألتزم بسداد العمولة</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setIsConfirmDealModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold">إلغاء</button>
              <button onClick={handleConfirmDealCompletion} disabled={!consentDealCompletion} className="px-5 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-black hover:bg-[#16A34A]/90 disabled:opacity-40 shadow-md">تأكيد والانتقال لبيانات الدفع</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة سداد العمولة المعتمدة */}
      {isPaymentModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 shadow-2xl cursor-default max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#FFC500] flex items-center gap-1.5"><CreditCard size={15} /> سداد عمولة وساطة يمن ريتغ</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-3.5 rounded-xl bg-[#18181C] border border-[#FFC500]/30 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-[#27272A] pb-1.5">
                <span className="text-[#9CA3AF]">العمولة المستحقة:</span>
                <b className="text-base text-[#FFC500] font-mono">{selectedListing.commissionAmount?.toLocaleString()} YER</b>
              </div>
              <div className="space-y-1 text-[11px] text-gray-300">
                <div>البنك: <b className="text-white">{commissionSettings.bank_name}</b></div>
                <div>صاحب الحساب: <b className="text-white">{commissionSettings.account_holder_name}</b></div>
                <div>رقم الحساب: <b className="text-[#FFC500] font-mono">{commissionSettings.account_number}</b></div>
                <div>المحفظة: <b className="text-white">{commissionSettings.wallet_provider} ({commissionSettings.wallet_number})</b></div>
              </div>
            </div>

            <form onSubmit={handleSubmitPaymentProof} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">رقم عملية التحويل / الإشعار*</label>
                <input type="text" required placeholder="أدخل رقم الحوالة..." value={transferNumber} onChange={(e) => setTransferNumber(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]" />
              </div>
              <div className="p-3 rounded-xl bg-[#18181C] border border-[#27272A] space-y-2">
                <div className="flex items-center gap-1.5 text-[#FFC500] font-bold text-[11px]"><ShieldCheck size={14} /><span>إقرار إلزامي:</span></div>
                <p className="text-[10px] text-gray-300 leading-relaxed">أقرّ بأن بيانات الدفع وإثبات التحويل المقدم صحيحان، وأتحمل مسؤولية صحة المعلومات المقدمة.</p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={consentPaymentProof} onChange={(e) => setConsentPaymentProof(e.target.checked)} className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer" />
                  <span className="text-[11px] font-bold text-white">أقرّ بصحة البيانات وإثبات الدفع</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold">إلغاء</button>
                <button type="submit" disabled={!consentPaymentProof} className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 shadow-md">إرسال للتحقق</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة فتح نزاع */}
      {isDisputeModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer" onClick={() => setIsDisputeModalOpen(false)}>
          <div className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#DC2626] flex items-center gap-1.5"><AlertTriangle size={15} /> فتح نزاع في الصفقة</h3>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleOpenDispute} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">سبب النزاع*</label>
                <select value={disputeCategory} onChange={(e) => setDisputeCategory(e.target.value)} className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none">
                  <option value="عدم تسليم المعروض">عدم تسليم المعروض</option>
                  <option value="اختلاف المعروض عن الوصف">اختلاف المعروض عن الوصف</option>
                  <option value="عدم إتمام الدفع">عدم إتمام الدفع</option>
                  <option value="رفض إتمام الصفقة بعد الفوز">رفض إتمام الصفقة بعد الفوز</option>
                  <option value="سبب آخر">سبب آخر</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">تفاصيل المشكلة*</label>
                <textarea rows={3} required value={disputeDetails} onChange={(e) => setDisputeDetails(e.target.value)} placeholder="اشرح المشكلة للإدارة بالتفصيل..." className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsDisputeModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-black hover:bg-[#DC2626]/90 shadow-md">إرسال النزاع للإدارة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* عارض الصور باللمس */}
      {isLightboxOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer" onClick={() => setIsLightboxOpen(false)}>
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono">{activeImageIndex + 1} من {selectedListing.images.length}</span>
            <button onClick={() => setIsLightboxOpen(false)} className="px-3 py-1 rounded-xl bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold">رجوع</button>
          </div>
          <div className="flex-1 flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <img src={selectedListing.images[activeImageIndex]} alt="Fullscreen" className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
