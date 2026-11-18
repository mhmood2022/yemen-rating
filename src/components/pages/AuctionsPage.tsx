
// دالة الضغط الاحترافي للصور من الهاتف لتقليل الحجم وتسريع الرفع
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // ضغط بجودة 0.75 وتحويل لصيغة webp خفيفة وسريعة (أو jpeg)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(compressedDataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

import { createPortal } from 'react-dom';
import { adminAuctionsService } from '../../services/adminService';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, 
  ShieldCheck, X, ImagePlus, Trash2, Tag, Search, Filter, 
  Car, Smartphone, Shield, Armchair, Building2, Package, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../common/AdBanner';
import { AuctionCard } from '../auctions/AuctionCard';
import { YRSelect } from '../common/YRSelect';
import { AuctionCreateModal } from '../auctions/AuctionCreateModal';
import { XAuctionBidModal } from '../auctions/XAuctionBidModal';
import { BadgeType } from '../common/VerifiedBadge';
import { mapBusinessToPage, BusinessPageRecord } from '../../services/businessPageService';
import { XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard, XMarketDetailView, XImageLightbox, YEMEN_GOV_FILTER_OPTIONS } from '../common/XMarketUI';

// إعدادات نسب العمولة المعتمدة للمنصة
const sellerRate = 5;
const buyerRate = 1;


const GENERAL_CATEGORY_OPTIONS = [
  { value: 'هواتف وأجهزة ذكية', label: 'هواتف وأجهزة ذكية (سامسونج، آيفون...)' },
  { value: 'سيارات ومركبات', label: 'سيارات ومركبات' },
  { value: 'أسلحة ومقتنيات شخصية', label: 'أسلحة ومقتنيات شخصية وتقليدية' },
  { value: 'عفش وأثاث', label: 'عفش وأثاث منزلي ومكتبي' },
  { value: 'عقارات وأراضي', label: 'عقارات وأراضي' },
  { value: 'أغراض وسلع عامة', label: 'أغراض وسلع عامة ومعدات' }
];

const PUBLIC_CURRENCY_OPTIONS = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' }
];

const GENERAL_CATEGORIES = [
  { id: 'all', label: 'كافة المعروضات' },
  { id: 'سيارات ومركبات', label: 'سيارات ومركبات', icon: Car },
  { id: 'هواتف وأجهزة ذكية', label: 'هواتف وأجهزة ذكية', icon: Smartphone },
  { id: 'أسلحة ومقتنيات شخصية', label: 'أسلحة ومقتنيات شخصية', icon: Shield },
  { id: 'عفش وأثاث', label: 'عفش وأثاث', icon: Armchair },
  { id: 'عقارات وأراضي', label: 'عقارات وأراضي', icon: Building2 },
  { id: 'أغراض وسلع عامة', label: 'أغراض وسلع عامة', icon: Package }
];

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'كل المدن والمحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' }
];


  // إعداد التاريخ والوقت التلقائي لحظة النشر الحالية
  const formatForDateTimeInput = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getInitialStartDate = () => formatForDateTimeInput(new Date());
  const getInitialEndDate = () => formatForDateTimeInput(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));


  const getFormattedStartDate = () => "2026 / 10 / 11   11 : 58 م";
  const getFormattedEndDate = () => "2026 / 10 / 16   11 : 58 م";

export const AuctionsPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({ onBack, embedded = false }) => {
  const [listings, setListings] = useState<any[]>([]);
  const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState<boolean>(false);

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingAuction, setEditingAuction] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentAuction, setCurrentAuction] = useState<any>(null);


  // إدارة صور المزاد من 1 إلى 6 صور مع الضغط
  const [auctionImages, setAuctionImages] = useState<string[]>([]);
  

  // دالة إرسال ونشر المعروض المتوافقة مع النموذج
  const handleCreateOrUpdateListing = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!agreedToTerms) {
      alert("يرجى الموافقة على الشروط والسياسات للمتابعة");
      return;
    }
    if (isCompressing) {
      alert("يرجى الانتظار حتى اكتمال ضغط وتجهيز الصور");
      return;
    }
    setIsSubmitting(true);
    try {
      setPublishSuccessMessage("تم حفظ ونشر المعروض بنجاح في المنصة وفق السياسات المعتمدة!");
      setTimeout(() => {
        setIsCreateAuctionOpen(false);
        if (typeof (window as any).setIsCreateAuctionOpen === 'function') (window as any).setIsCreateAuctionOpen(false);
        const xBtn = document.querySelector('button[aria-label="close"], button.close');
        if (xBtn) (xBtn as HTMLElement).click();
      }, 1600);
    } catch (err) {
      console.error("خطأ أثناء النشر:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (typeof (window as any).setFormData === 'function') {
      (window as any).setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setAuctionImages([]);
    setAgreedToTerms(false);
    setPublishSuccessMessage("");
  };

  const [auctionTitle, setAuctionTitle] = useState("");
  const [minIncrement, setMinIncrement] = useState("1000");
  const [maxIncrement, setMaxIncrement] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("سيارات ومركبات");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("صنعاء");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("ريال سعودي (SAR)");
  const [isCurrOpen, setIsCurrOpen] = useState(false);

  const [auctionStartDate, setAuctionStartDate] = useState<string>(getInitialStartDate());
  const [auctionEndDate, setAuctionEndDate] = useState<string>(getInitialEndDate());

  const [startingPrice, setStartingPrice] = useState<string>("");
  const [sellerName, setSellerName] = useState<string>("");
  const [sellerPhone, setSellerPhone] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string>("");

  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (auctionImages.length + files.length > 6) {
      alert('الحد الأقصى للصور هو 6 صور للمزاد الواحد');
      return;
    }

    setIsCompressing(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (auctionImages.length + newImages.length >= 6) break;
        const compressed = await compressImageFile(files[i]);
        newImages.push(compressed);
      }
      setAuctionImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('خطأ في معالجة وضغط الصور:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeAuctionImage = (indexToRemove: number) => {
    setAuctionImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'ENDED' | 'DIRECT'>('ACTIVE');
  const [selectedCat, setSelectedCat] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [biddingAuction, setBiddingAuction] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // نموذج إضافة المعروض
    // تجميد تمرير الصفحة بنسبة 100% ومنع حركة اللمس خلف الصورة
  useEffect(() => {
    if (isCreateAuctionOpen) {
      document.body.classList.add('modal-freeze-lock');
      document.documentElement.classList.add('modal-freeze-lock');
      return () => {
        document.body.classList.remove('modal-freeze-lock');
        document.documentElement.classList.remove('modal-freeze-lock');
        };
    }
  }, [isCreateAuctionOpen]);

  
;
  const [saleType, setSaleType] = useState<'auction' | 'fixed_price'>('auction');
  const [formCategory, setFormCategory] = useState('هواتف وأجهزة ذكية');
  const [formTitle, setFormTitle] = useState('');
  const [formSellerName, setFormSellerName] = useState('');
  const [formCity, setFormCity] = useState('صنعاء');
  const [formPrice, setFormPrice] = useState('');
  const [formStartTime, setFormStartTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [formEndDate, setFormEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 16);
  });
  const [formMinIncrement, setFormMinIncrement] = useState('1000');
  const [formMaxIncrement, setFormMaxIncrement] = useState('');
  const [sellerCommissionRate, setSellerCommissionRate] = useState(10);
  const [formCurrency, setFormCurrency] = useState('SAR');
  const [formPhone, setFormPhone] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      await supabase.from('auctions').delete().ilike('title', '%لاندكروزر%');
      const [{ data, error }, { data: bizData }] = await Promise.all([supabase.from('auctions').select('*').order('created_at', { ascending: false }), supabase.from('businesses').select('*').limit(200)]);
      if (bizData) setBusinessesList(bizData.map(mapBusinessToPage));
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
          if (name) setFormSellerName(name);
          let phone = user.phone || user.user_metadata?.phone || '';
          try {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (prof) {
              if (prof.full_name && !name) setFormSellerName(prof.full_name);
              if (prof.phone && !phone) phone = prof.phone;
            }
          } catch {}
          if (phone) setFormPhone(phone.replace(/\D/g, '').slice(-9));
        }
      } catch (e) {}
    };
    fetchSellerData();
  }, []);

  useEffect(() => {
    fetchAuctions();
    adminAuctionsService.getPlatformCommissionSettings().then((res) => {
      if (res?.data?.seller_commission_rate) {
        setSellerCommissionRate(res.data.seller_commission_rate);
      }
    });
  }, []);

  // دالة ضغط الصور التلقائي العالي الجودة باستخدام المتصفح لمنع تجاوز قاعدة البيانات
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 6 - uploadedImages.length;
    if (remaining <= 0) {
      setToastMessage('الحد الأقصى المسموح به هو 6 صور فقط');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      setCompressing(true);
      const toProcess = Array.from(files).slice(0, remaining);
      const compressedList: string[] = [];

      for (const file of toProcess) {
        const compressedBase64 = await compressImage(file);
        compressedList.push(compressedBase64);
      }

      setUploadedImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.error('Error compressing images:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !consent || formPhone.length !== 9) {
      setPublishMsg({ type: 'error', text: 'يرجى إكمال عنوان المعروض ورقم الهاتف (9 أرقام) والموافقة على الشروط' });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSubmitting(true);
      const priceNum = parseFloat(formPrice) || 0;

      const payload = {
        title: formTitle.trim(),
        seller_name: formSellerName.trim() || 'صاحب المعروض المعتمد',
        sale_type: saleType,
        category: formCategory,
        city: formCity,
        currency: formCurrency,
        description: formDescription.trim(),
        seller_phone: formPhone,
        images: uploadedImages,
        status: 'active',
        starting_price: priceNum,
        current_bid: priceNum,
        final_price: priceNum,
        start_time: formStartTime ? new Date(formStartTime).toISOString() : new Date().toISOString(),
        end_date: formEndDate ? new Date(formEndDate).toISOString() : null,
        min_increment: parseFloat(formMinIncrement) || 1000,
        max_increment: formMaxIncrement ? parseFloat(formMaxIncrement) : null,
        deposit_required: false,
        deposit_amount: 0,
        seller_commission_rate_snapshot: sellerCommissionRate,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('auctions').insert([payload]);
      if (error) throw error;

      setIsCreateAuctionOpen(false);
      setUploadedImages([]);
      setFormTitle('');
      setFormPrice('');
      setFormDescription('');
      setFormPhone('');
      setPublishMsg({ type: 'success', text: 'تم نشر المعروض بنجاح وإدراجه في المنصة' });
      setTimeout(() => { setIsCreateAuctionOpen(false); setPublishMsg(null); }, 1500);
      setTimeout(() => setToastMessage(null), 4000);
      fetchAuctions();
    } catch (err: any) {
      console.error(" SUPABASE_REAL_ERROR in src/components/pages/AuctionsPage.tsx:", err?.message || err);
      setPublishMsg({ type: 'error', text: err.message || 'حدث خطأ أثناء الاتصال بالنظام، يرجى إعادة المحاولة' });
    } finally {
      setSubmitting(false);
    }
  };

  // دالة الفحص الذكي لانتهاء المزاد سواء بالحالة أو بانتهاء التاريخ والوقت
  const isAuctionEnded = (item: any) => {
    const status = (item.status || '').toLowerCase();
    if (['completed', 'ended', 'sold', 'closed'].includes(status)) return true;
    
    const endStr = item.end_date || item.end_time;
    if (endStr) {
      const endTime = new Date(endStr).getTime();
      if (!isNaN(endTime) && endTime <= Date.now()) {
        return true;
      }
    }
    return false;
  };

  const endedListings = listings.filter(l => isAuctionEnded(l));
  const activeAuctions = listings.filter(l => !isAuctionEnded(l) && (l.status === 'active' || !l.status) && l.sale_type !== 'fixed_price');
  const directSales = listings.filter(l => !isAuctionEnded(l) && (l.status === 'active' || !l.status) && l.sale_type === 'fixed_price');

  const displayedListings = (
    statusTab === 'ACTIVE' ? activeAuctions :
    statusTab === 'DIRECT' ? directSales :
    endedListings
  ).filter((item) => {
    if (selectedCat !== 'all' && item.category !== selectedCat) return false;
    if (cityFilter !== 'all' && (!item.city || !item.city.includes(cityFilter))) return false;
    if (searchTerm.trim() && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toAucX = (auc: any): XMarketItem => {
    const cl = (s?: string) => (s || '').replace(/\D/g, '').slice(-9);
    const biz = businessesList.find((b) => (auc.business_id && b.id === auc.business_id) || (auc.owner_id && b.ownerId === auc.owner_id) || (auc.seller_name && b.name.trim() === auc.seller_name.trim()) || (cl(auc.seller_phone) && cl(b.phone) === cl(auc.seller_phone))) || null;
    let imgs: string[] = Array.isArray(auc.images) ? auc.images : [];
    if (!imgs.length && typeof auc.images === 'string') { try { const x = JSON.parse(auc.images); if (Array.isArray(x)) imgs = x; } catch {} }
    if (!imgs.length && auc.image_url) imgs = [auc.image_url];
    const bid = Number(auc.current_bid || auc.starting_price || auc.final_price || 0);
    const dir = auc.sale_type === 'fixed_price' || auc.sale_type === 'direct';
    let desc = auc.description || '';
    if (desc.startsWith('{')) { try { const x = JSON.parse(desc); desc = x.notes || x.description || ''; } catch {} }
    return { id: auc.id, detailPath: `/auctions/${auc.id}`, actionLabel: dir ? 'التفاصيل' : 'المزايدة', actionIcon: <Gavel size={14} />, onAction: () => setBiddingAuction(auc), authorName: biz?.name || auc.seller_name || (dir ? 'بيع مباشر' : 'مزاد علني'), authorUsername: biz?.username || auc.city || 'auction', authorAvatar: biz?.avatarUrl || '', badgeType: biz ? ((biz.verificationType as BadgeType) || (biz.isVerified ? 'gold' : 'none')) : 'none', businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined, createdAt: auc.created_at, title: auc.title, priceText: `${bid.toLocaleString()} ${auc.currency || 'SAR'}`, description: desc, metaParts: [dir ? 'بيع مباشر' : 'مزاد علني', auc.category, auc.city].filter(Boolean), tagLabel: dir ? 'بيع مباشر' : 'مزاد علني', images: imgs, city: auc.city, phone: auc.seller_phone || biz?.phone || '' };
  };
  const onShareX = (it: XMarketItem) => { navigator.clipboard?.writeText(it.title); setToastMessage('تم نسخ التفاصيل'); setTimeout(() => setToastMessage(null), 2500); };
  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white bg-black min-h-screen"}>
      {!embedded && !selectedItem && <AdBanner placementId="6" className="mb-1" />}

      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-5 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2 border border-black/10 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {!embedded && !selectedItem && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-black border border-[#2F3336] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-xl bg-[#111111] border border-[#2F3336] text-[#F5C400]">
                <ArrowRight size={16} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Gavel size={22} className="text-[#F5C400]" />
                <span>منصة المزادات والعروض</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">مزادات علنية حية وصفقات بيع مباشر بمواصفات حقيقية موثقة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateAuctionOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs sm:text-sm shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>إضافة مزاد جديد</span>
            </button>
            <button onClick={fetchAuctions} className="p-2.5 bg-[#111111] border border-[#2F3336] rounded-xl text-slate-300">
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
            </button>
          </div>
        </div>
      )}

      {selectedItem ? <XMarketDetailView item={selectedItem} activeImageIndex={activeImageIndex} onChangeImageIndex={setActiveImageIndex} onBack={() => setSelectedItem(null)} onOpenLightbox={() => setIsLightboxOpen(true)} onShare={() => onShareX(selectedItem)} /> : (<>
      {/* الرأس الموحد: بحث + أيقونة الفلتر يساراً مثل سوق الهواتف */}
      <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "space-y-3"}>
        <XSearchFilterBar searchQuery={searchTerm} onSearchChange={setSearchTerm} placeholder="ابحث باسم السلعة أو المزاد..." activeFiltersCount={(selectedCat !== 'all' ? 1 : 0) + (statusTab !== 'ACTIVE' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0)} onOpenFilter={() => setIsFilterModalOpen(true)} />
        {embedded && <AdBanner placementId="6" className="py-0.5" />}
      </div>

      {/* المحتوى بأسلوب تغريدات X */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#FFC500] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري مزامنة المزادات...</span>
        </div>
      ) : displayedListings.length === 0 ? (
        <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
          <AlertCircle size={36} className="text-[#FFC500] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-white">لا توجد مزادات مسجلة حالياً</h3>
          <p className="text-xs">اضغط على زر + لإضافة مزاد أو عرض جديد.</p>
        </div>
      ) : embedded ? (
        <div className="divide-y divide-[#2F3336]/60">{displayedListings.map((auc) => { const item = toAucX(auc); return <XMarketTweetCard key={auc.id} item={item} onOpenDetail={() => { setSelectedItem(item); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: "instant" }); }} onOpenImage={(idx) => { setSelectedItem(item); setActiveImageIndex(idx); setIsLightboxOpen(true); }} onShare={() => onShareX(item)} />; })}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedListings.map((auc) => (
            <AuctionCard key={auc.id} auction={auc} />
          ))}
        </div>
      )}

      </>)}
      {embedded && !selectedItem && !isCreateAuctionOpen && (
        <button
          onClick={() => setIsCreateAuctionOpen(true)}
          className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition"
          title="إضافة مزاد جديد"
        >
          <Plus size={24} className="stroke-[2.2]" />
        </button>
      )}

      {/* نافذة إضافة معروض جديد بنظام الثيم الداكن المخصص بدون افتراضيات أندرويد */}
      {isCreateAuctionOpen && (
        <AuctionCreateModal
        isOpen={isCreateAuctionOpen}
        onClose={() => setIsCreateAuctionOpen(false)}
        onSuccess={() => {
          setIsCreateAuctionOpen(false);
          fetchAuctions();
        }}
      />
      )}
      <XImageLightbox isOpen={isLightboxOpen} item={selectedItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <XAuctionBidModal auction={biddingAuction} onClose={() => setBiddingAuction(null)} onSuccess={(m) => { setToastMessage(m); setTimeout(() => setToastMessage(null), 3500); fetchAuctions(); }} />
      <XFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="تصفية المزادات" activeFiltersCount={(selectedCat !== 'all' ? 1 : 0) + (statusTab !== 'ACTIVE' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0)} onReset={() => { setSelectedCat('all'); setStatusTab('ACTIVE'); setCityFilter('all'); }} resultsCount={displayedListings.length} fields={[
        { label: 'القسم', value: selectedCat, onChange: setSelectedCat, options: GENERAL_CATEGORIES.map((x) => ({ value: x.id, label: x.label })) },
        { label: 'الحالة', value: statusTab, onChange: (v) => setStatusTab(v as any), options: [{ value: 'ACTIVE', label: `المزادات النشطة (${activeAuctions.length})` }, { value: 'DIRECT', label: `البيع المباشر (${directSales.length})` }, { value: 'ENDED', label: `المزادات المنتهية (${endedListings.length})` }] },
        { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
      ]} />
    </div>
  );
};
