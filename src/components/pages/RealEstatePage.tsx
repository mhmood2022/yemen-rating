import React, { useState, useRef } from 'react';
import { 
  Building, MapPin, ArrowRight, Plus, CheckCircle2, 
  User, X, Upload, Trash2, ShieldCheck, BedDouble, Bath, 
  Maximize2, Phone, MessageCircle, Lock, Unlock, Tag
} from 'lucide-react';
import { AdBanner } from '../common/AdBanner';

export interface RealEstateItem {
  id: string;
  title: string;
  type: 'sale' | 'rent'; // للبيع / للإيجار
  category: 'شقق' | 'فلل' | 'أراضي' | 'عمائر' | 'محلات' | 'مزارع';
  price: number;
  currency: string;
  city: string;
  area: number; // م²
  rooms?: number;
  bathrooms?: number;
  description: string;
  images: string[];
  publisherName: string;
  publisherPhone: string;
  isContactMasked: boolean;
  isVerified: boolean;
  createdAt: string;
}

const INITIAL_PROPERTIES: RealEstateItem[] = [
  {
    id: 'prop-101',
    title: 'شقة سوبر ديلوكس مفروشة راقية — حدة',
    type: 'rent',
    category: 'شقق',
    price: 3500,
    currency: 'SAR',
    city: 'صنعاء — حدة',
    area: 160,
    rooms: 3,
    bathrooms: 2,
    description: 'شقة فاخرة مؤثثة بالكامل بأرقى الأثاث المودرن، إطلالة ممتازة، مصعد كهربائي، حراسة وموقف سيارات خاص، ماء وكهرباء متوفرة على مدار الساعة.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=85'
    ],
    publisherName: 'عبدالرحمن الحداد',
    publisherPhone: '967777123456',
    isContactMasked: true,
    isVerified: true,
    createdAt: 'اليوم'
  },
  {
    id: 'prop-102',
    title: 'فيلا مستقلة فاخرة مسبح وحديقة — خور مكسر',
    type: 'sale',
    category: 'فلل',
    price: 450000,
    currency: 'USD',
    city: 'عدن — خور مكسر',
    area: 480,
    rooms: 5,
    bathrooms: 4,
    description: 'فيلا فخمة على شوارع عريضة، حديقة خاصة ومسبح وموقف لثلاث سيارات، تشطيبات ديلوكس رخام وجبس وإضاءات مخفية، موقع هادئ وراقٍ.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=85'
    ],
    publisherName: 'مكتب الكاف العقاري',
    publisherPhone: '967733987654',
    isContactMasked: true,
    isVerified: true,
    createdAt: 'أمس'
  },
  {
    id: 'prop-103',
    title: 'عمارة تجارية استثمارية 5 أدوار ركنية',
    type: 'sale',
    category: 'عمائر',
    price: 850000,
    currency: 'USD',
    city: 'تعز — الحوبان',
    area: 320,
    rooms: 10,
    bathrooms: 8,
    description: 'عمارة استثمارية ممتازة تتكون من 4 محلات تجارية و 8 شقق سكنية مؤجرة بالكامل، دخل شهري ممتاز وموقع تجاري نشط.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541348263662-e0c86629c983?w=900&auto=format&fit=crop&q=85'
    ],
    publisherName: 'الصبري للعقارات',
    publisherPhone: '967711555777',
    isContactMasked: true,
    isVerified: true,
    createdAt: 'منذ يومين'
  },
  {
    id: 'prop-104',
    title: 'أرض زراعية واستثمارية مسورة 12 لبنة',
    type: 'sale',
    category: 'أراضي',
    price: 45000000,
    currency: 'YER',
    city: 'إب — بعدان',
    area: 530,
    description: 'أرض استثمارية واجهة عريضة على الشارع العام، مسورة بالكامل ومستوية، تتوفر فيها مياه وكهرباء، صالحة لبناء استراحة أو مشروع.',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=85'
    ],
    publisherName: 'محمود الصبري',
    publisherPhone: '967770112233',
    isContactMasked: true,
    isVerified: false,
    createdAt: 'منذ 3 أيام'
  }
];

export const RealEstatePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<RealEstateItem | null>(null);
  const [propertiesList, setPropertiesList] = useState<RealEstateItem[]>(INITIAL_PROPERTIES);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [unmaskedContacts, setUnmaskedContacts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // نافذة إضافة عقار جديد
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'sale' | 'rent'>('sale');
  const [newCategory, setNewCategory] = useState<RealEstateItem['category']>('شقق');
  const [newCurrency, setNewCurrency] = useState('YER'); // يمني افتراضي
  const [newPrice, setNewPrice] = useState<number>(15000000);
  const [newArea, setNewArea] = useState<number>(120);
  const [newRooms, setNewRooms] = useState<number>(3);
  const [newBathrooms, setNewBathrooms] = useState<number>(2);
  const [newCity, setNewCity] = useState('صنعاء');
  const [newDesc, setNewDesc] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [agreedToCommission, setAgreedToCommission] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // إحداثيات السحب باللمس
  const touchStartX = useRef<number | null>(null);

  const handleOpenProperty = (property: RealEstateItem) => {
    setSelectedProperty(property);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // رفع من 1 إلى 8 صور من الهاتف
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 8 - uploadedImages.length;
      const filesToTake = Array.from(files).slice(0, remainingSlots);
      const newUrls = filesToTake.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // التمرير باللمس في المعرض
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !selectedProperty) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveImageIndex(prev => (prev + 1) % selectedProperty.images.length);
      } else {
        setActiveImageIndex(prev => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
      }
    }
    touchStartX.current = null;
  };

  // كشف بيانات التواصل للمعلن
  const handleRevealContact = (propId: string) => {
    setUnmaskedContacts(prev => ({ ...prev, [propId]: true }));
    setToastMessage('تم كشف بيانات التواصل المباشر مع المعلن');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // إضافة عقار جديد
  const handleSubmitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToCommission) return;

    const defaultImg = uploadedImages.length > 0 
      ? uploadedImages 
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop&q=85'];

    const newEntry: RealEstateItem = {
      id: `prop-${Date.now()}`,
      title: newTitle,
      type: newType,
      category: newCategory,
      price: Number(newPrice),
      currency: newCurrency,
      city: newCity,
      area: Number(newArea),
      rooms: Number(newRooms),
      bathrooms: Number(newBathrooms),
      description: newDesc,
      images: defaultImg,
      publisherName: 'معلن معتمد',
      publisherPhone: '967777000111',
      isContactMasked: true,
      isVerified: true,
      createdAt: 'الآن'
    };

    setPropertiesList(prev => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setUploadedImages([]);
    setAgreedToCommission(false);
    setToastMessage('تم إرسال العقار بنجاح وهو قيد المراجعة والاعتماد');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProperties = propertiesList.filter(p => {
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchCity = selectedCity === 'all' || p.city.includes(selectedCity);
    return matchType && matchCategory && matchCity;
  });

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص للعقارات #5 */}
      <AdBanner placementId="5" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي الأنيق */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Building size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              العقارات
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              عروض البيع والإيجار المباشرة في اليمن
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>إضافة عقار</span>
          </button>
          
          <button
            onClick={selectedProperty ? () => setSelectedProperty(null) : onBack}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedProperty ? 'رجوع' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل العقار المحدد والمواصفات
          ============================================================ */}
      {selectedProperty ? (
        <div className="space-y-3">
          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            
            {/* معرض الصور باللمس (يعرض عدد الصور المرفوعة 1-8 فقط) */}
            <div 
              className="relative h-56 sm:h-72 w-full bg-[#161619] overflow-hidden cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img 
                src={selectedProperty.images[activeImageIndex]} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover transition-all duration-300" 
              />
              
              <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-md ${
                selectedProperty.type === 'sale' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
              }`}>
                {selectedProperty.type === 'sale' ? 'للبيع' : 'للإيجار'}
              </span>

              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/85 text-[#FFC500] text-xs font-mono font-black border border-[#FFC500]/30 backdrop-blur-md">
                {selectedProperty.price.toLocaleString()} {selectedProperty.currency} {selectedProperty.type === 'rent' ? '/ شهرياً' : ''}
              </span>

              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/85 text-white text-[9px] font-bold border border-white/10">
                📷 {activeImageIndex + 1} من {selectedProperty.images.length}
              </span>
            </div>

            {/* صور مصغرة إن كانت أكثر من صورة */}
            {selectedProperty.images.length > 1 && (
              <div className="flex gap-1.5 p-2 bg-[#121215] border-t border-[#1F2937] overflow-x-auto no-scrollbar">
                {selectedProperty.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#FFC500]' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* البيانات والمواصفات */}
            <div className="p-3.5 sm:p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedProperty.category}
                  </span>
                  <span className="text-[11px] text-gray-400">📍 {selectedProperty.city}</span>
                  {selectedProperty.isVerified && <span className="text-[9px] text-[#16A34A] font-bold">✓ موثق</span>}
                </div>
                <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                  {selectedProperty.title}
                </h2>
              </div>

              {/* شبكة مواصفات العقار السريعة */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">المساحة</span>
                  <b className="text-xs text-white font-bold">{selectedProperty.area} م²</b>
                </div>
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">الغرف</span>
                  <b className="text-xs text-white font-bold">{selectedProperty.rooms || '—'}</b>
                </div>
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">الحمامات</span>
                  <b className="text-xs text-white font-bold">{selectedProperty.bathrooms || '—'}</b>
                </div>
              </div>

              {selectedProperty.description && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#D1D5DB]">التفاصيل والوصف:</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed font-medium">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* صندوق التواصل المحمي والمشفر */}
              <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-[#FFC500]" />
                    <span className="text-xs font-bold text-white">{selectedProperty.publisherName}</span>
                  </div>
                  <span className="text-[9.5px] text-gray-400">تاريخ العرض: {selectedProperty.createdAt}</span>
                </div>

                {unmaskedContacts[selectedProperty.id] ? (
                  <div className="pt-2 border-t border-[#27272A] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                      <Unlock size={14} className="text-[#16A34A]" />
                      <span>{selectedProperty.publisherPhone}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <a
                        href={`https://wa.me/${selectedProperty.publisherPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن عقار ${selectedProperty.title} في يمن ريتنغ`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#16A34A]/90"
                      >
                        <MessageCircle size={13} />
                        <span>واتساب</span>
                      </a>
                      <a
                        href={`tel:${selectedProperty.publisherPhone}`}
                        className="p-1.5 rounded-lg bg-[#18181C] text-white border border-[#27272A] hover:border-[#FFC500]"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => handleRevealContact(selectedProperty.id)}
                      className="w-full py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={14} />
                      <span>طلب كشف الرقم وحجز معاينة</span>
                    </button>
                    <span className="text-[9px] text-gray-400 text-center block mt-1.5">
                      يتم كشف أرقام التواصل للمستخدمين للتحقق من جدية المعاينة والصفقة.
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة العقارات
           ============================================================ */
        <div className="space-y-3">
          
          {/* شريط الفلاتر */}
          <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
            {/* نوع العرض: بيع / إيجار */}
            <div className="flex gap-1 bg-[#161619] p-0.5 rounded-xl border border-[#27272A]">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'all' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                جميع العروض ({propertiesList.length})
              </button>
              <button
                onClick={() => setTypeFilter('sale')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'sale' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                عقارات للبيع
              </button>
              <button
                onClick={() => setTypeFilter('rent')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'rent' ? 'bg-[#FFC500] text-black font-black' : 'text-gray-400'
                }`}
              >
                عقارات للإيجار
              </button>
            </div>

            {/* الفئات المعتمدة والمدن */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar flex-1">
                {['all', 'شقق', 'فلل', 'أراضي', 'عمائر', 'محلات', 'مزارع'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      categoryFilter === cat 
                        ? 'bg-[#18181C] border-[#FFC500] text-[#FFC500]' 
                        : 'bg-[#121215] border-[#222226] text-gray-400'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : cat}
                  </button>
                ))}
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg px-2 py-1 text-[10.5px] font-bold text-[#D1D5DB] outline-none cursor-pointer shrink-0"
              >
                <option value="all">كل المدن</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="حضرموت">حضرموت</option>
                <option value="إب">إب</option>
              </select>
            </div>
          </div>

          {/* شبكة كروت العقارات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-40 w-full relative bg-[#161619]">
                  <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                  
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black ${
                    prop.type === 'sale' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
                  }`}>
                    {prop.type === 'sale' ? 'للبيع' : 'للإيجار'}
                  </span>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-[#FFC500] text-[10px] font-mono font-black border border-white/10">
                    {prop.price.toLocaleString()} {prop.currency} {prop.type === 'rent' ? '/ ش' : ''}
                  </span>

                  <span className="absolute top-2 left-2 px-1.5 py-0.2 rounded bg-black/80 text-white text-[8.5px]">
                    📷 {prop.images.length}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-gray-400 mb-0.5">
                      <span className="text-[#FFC500] font-bold">{prop.category}</span>
                      <span>•</span>
                      <span>{prop.city}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {prop.title}
                    </h3>
                  </div>

                  {/* مواصفات سريعة */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-300 font-mono py-1 border-t border-[#1F2937]">
                    <span>📐 {prop.area} م²</span>
                    {prop.rooms && <span>• 🛏️ {prop.rooms} غرف</span>}
                    {prop.bathrooms && <span>• 🚿 {prop.bathrooms} حمام</span>}
                  </div>

                  <button
                    onClick={() => handleOpenProperty(prop)}
                    className="w-full py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                  >
                    <span>عرض العقار</span>
                    <ArrowRight size={12} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================
          عارض الصور باللمس (Touch Swipe Lightbox)
          ============================================================ */}
      {isLightboxOpen && selectedProperty && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono">
              {activeImageIndex + 1} من {selectedProperty.images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="px-3 py-1 rounded-xl bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
            >
              رجوع
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedProperty.images[activeImageIndex]} 
              alt="Fullscreen" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl" 
            />
          </div>

          <div className="flex justify-center items-center gap-1.5 pb-4" onClick={e => e.stopPropagation()}>
            {selectedProperty.images.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-gray-700'
                }`} 
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          نافذة إضافة عقار جديد (1 إلى 8 صور) مع الموافقة الإلزامية
          ============================================================ */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto cursor-default shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={15} className="text-[#FFC500]" /> إضافة عقار جديد
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={handleSubmitProperty} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">عنوان الإعلان</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شقة للبيع في حدة 3 غرف..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              {/* رفع من 1 إلى 8 صور من الهاتف */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">صور العقار (من 1 إلى 8 صور)</label>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImagesUpload} 
                  className="hidden" 
                />
                
                <div className="flex gap-2 items-center flex-wrap">
                  {uploadedImages.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-[#18181C] border border-dashed border-[#FFC500]/60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#FFC500]"
                    >
                      <Upload size={14} className="text-[#FFC500]" />
                      <span>اختيار صور العقار</span>
                    </button>
                  )}

                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#27272A] shrink-0">
                      <img src={img} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-600 text-white text-[9px]"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">نوع العرض</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="sale">عقار للبيع</option>
                    <option value="rent">عقار للإيجار</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الفئة</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="شقق">شقق</option>
                    <option value="فلل">فلل</option>
                    <option value="أراضي">أراضي</option>
                    <option value="عمائر">عمائر</option>
                    <option value="محلات">محلات ومكاتب</option>
                    <option value="مزارع">مزارع</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">السعر المطلوبة</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">العملة</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الغرف</label>
                  <input
                    type="number"
                    value={newRooms}
                    onChange={(e) => setNewRooms(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الحمامات</label>
                  <input
                    type="number"
                    value={newBathrooms}
                    onChange={(e) => setNewBathrooms(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">المدينة</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                >
                  <option value="صنعاء">صنعاء</option>
                  <option value="عدن">عدن</option>
                  <option value="تعز">تعز</option>
                  <option value="حضرموت - المكلا">حضرموت - المكلا</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="إب">إب</option>
                  <option value="مأرب">مأرب</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">وصف العقار ومميزاته</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتب مواصفات العقار بدقة..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              {/* تنبيه العمولة وموافقة السياسات الإلزامية */}
              <div className="p-3 rounded-xl bg-[#18181C] border border-[#27272A] space-y-2">
                <div className="flex items-center gap-1.5 text-[#FFC500] font-bold text-[11px]">
                  <ShieldCheck size={14} />
                  <span>تنبيه وساطة يمن ريتنغ:</span>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  تطبق المنصة عمولة الوساطة المعتمدة عند إتمام المعاملة العقارية عبر وساطة المنصة.
                </p>

                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToCommission}
                    onChange={(e) => setAgreedToCommission(e.target.checked)}
                    className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">
                    أوافق على شروط وسياسة وساطة يمن ريتنغ
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToCommission}
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md"
                >
                  إرسال العقار للاعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
