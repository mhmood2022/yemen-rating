
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

export const AuctionsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
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
      const { data, error } = await supabase.from('auctions').select('*').order('created_at', { ascending: false });
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

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white bg-black min-h-screen">
      <AdBanner placementId="6" className="mb-1" />

      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-5 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2 border border-black/10 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الترويسة الرئيسية - بدون وساطة معتمدة */}
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

      {/* تبويبات التصنيفات العامة الستة بدون أي إيموجي */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {GENERAL_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                selectedCat === cat.id
                  ? 'bg-[#F5C400] text-black border-[#F5C400] font-black shadow-md'
                  : 'bg-black text-slate-300 border-[#2F3336] hover:text-white'
              }`}
            >
              {Icon && <Icon size={14} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* تبويبات الحالة: المزادات النشطة، البيع المباشر، المزادات المنتهية */}
      <div className="grid grid-cols-3 gap-1.5 bg-black p-1.5 rounded-2xl border border-[#2F3336] text-center">
        <button
          type="button"
          onClick={() => setStatusTab('ACTIVE')}
          className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
            statusTab === 'ACTIVE'
              ? 'bg-[#F5C400] text-black font-black shadow-md shadow-[#F5C400]/15'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A] font-bold'
          }`}
        >
          <span className="text-[11px] sm:text-xs leading-none">المزادات النشطة</span>
          <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md leading-none ${
            statusTab === 'ACTIVE' ? 'bg-black text-black' : 'bg-[#111111] text-slate-300 border border-[#2F3336]'
          }`}>
            {activeAuctions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab('DIRECT')}
          className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
            statusTab === 'DIRECT'
              ? 'bg-[#F5C400] text-black font-black shadow-md shadow-[#F5C400]/15'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A] font-bold'
          }`}
        >
          <span className="text-[11px] sm:text-xs leading-none">البيع المباشر</span>
          <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md leading-none ${
            statusTab === 'DIRECT' ? 'bg-black text-black' : 'bg-[#111111] text-slate-300 border border-[#2F3336]'
          }`}>
            {directSales.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab('ENDED')}
          className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
            statusTab === 'ENDED'
              ? 'bg-[#F5C400] text-black font-black shadow-md shadow-[#F5C400]/15'
              : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A] font-bold'
          }`}
        >
          <span className="text-[11px] sm:text-xs leading-none">المزادات المنتهية</span>
          <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md leading-none ${
            statusTab === 'ENDED' ? 'bg-black text-black' : 'bg-[#111111] text-slate-300 border border-[#2F3336]'
          }`}>
            {endedListings.length}
          </span>
        </button>
      </div>

      {/* شريط البحث والمدينة المخصص بدون رمادي أندرويد */}
      <div className="bg-black p-3 rounded-2xl border border-[#2F3336] flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم السلعة أو الموديل..."
            className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl py-2.5 pr-9 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <Search className="absolute right-3 top-3 w-4 h-4 text-[#F5C400]" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-3 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-64">
          <YRSelect
            value={cityFilter}
            options={YEMEN_GOVERNORATES}
            onChange={(val) => setCityFilter(val)}
            placeholder="كل المحافظات"
          />
        </div>
      </div>

      {/* شبكة عرض كروت المزادات */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3 bg-black rounded-2xl border border-[#2F3336]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-white">جاري مزامنة بيانات المزادات...</span>
        </div>
      ) : displayedListings.length === 0 ? (
        <div className="py-20 text-center bg-black rounded-2xl border border-[#2F3336] p-8 space-y-3">
          <AlertCircle size={44} className="text-[#F5C400] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد معروضات مسجلة في هذا القسم حالياً</h3>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto">
            كن أول من يضيف معروضاً للمزاد أو البيع المباشر عبر الزر أعلاه.
          </p>
          <button
            onClick={() => setIsCreateAuctionOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] text-black font-black rounded-xl text-xs"
          >
            <Plus size={14} /> إضافة معروض جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedListings.map((auc) => (
            <AuctionCard key={auc.id} auction={auc} />
          ))}
        </div>
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
    </div>
  );
};
