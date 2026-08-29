import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  ArrowRight, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  Plus, 
  Check, 
  Lock, 
  FileText, 
  Send, 
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

export type PropertyListingType = 'rent' | 'sale';
export type PropertyType = 'apartment' | 'villa' | 'building' | 'land' | 'commercial' | 'office';

export interface RealEstateItem {
  id: string;
  title: string;
  listingType: PropertyListingType;
  propertyType: PropertyType;
  propertyTypeName: string;
  price: number;
  currency: string; // العملة التي يحددها الناشر
  period?: string; // مثلاً: شهرياً / سنوياً في حالة الإيجار
  city: string;
  governorate: string;
  location: string;
  area: string;
  bedrooms?: number;
  bathrooms?: number;
  condition: string;
  description: string;
  features: string[];
  publishedAt: string;
  status: 'active' | 'negotiating' | 'deal_completed' | 'pending_review';
  viewsCount: number;
  images: string[];
  
  // بيانات الناشر العامة والخاصة
  publisherId: string;
  publisherName: string;
  publisherType: 'owner' | 'brokerage_office' | 'company';
  isVerifiedPublisher: boolean;
  
  // بيانات التواصل المحمية (لا تكشف للعامة)
  privateContact: {
    phone: string;
    whatsapp: string;
  };
  
  // نظام عمولة المنصة
  commissionRate: number; // مثلاً 2.5%
  showCommissionToOwner: boolean; // تحكم الإدارة في إظهار أو إخفاء العمولة عن صاحب العقار
}

export const RealEstatePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
  const [selectedProperty, setSelectedProperty] = useState<RealEstateItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectionRequestSent, setInspectionRequestSent] = useState(false);
  const [addSuccessToast, setAddSuccessToast] = useState(false);

  // هوية وصلاحيات المستخدم الحالي في النظام (محاكاة أمنية)
  const currentUserId = 'user-current';
  const currentUserRole: 'visitor' | 'buyer' | 'owner' | 'admin' = 'owner';

  // نموذج إضافة عقار جديد
  const [newPropertyForm, setNewPropertyForm] = useState({
    title: '',
    listingType: 'rent' as PropertyListingType,
    propertyType: 'apartment' as PropertyType,
    price: '',
    currency: 'USD',
    period: 'شهرياً',
    city: 'صنعاء',
    location: '',
    area: '',
    bedrooms: '3',
    bathrooms: '2',
    condition: 'سوبر ديلوكس',
    description: '',
    features: 'موقف سيارات, حراسة, مصعد, خزان مستقل, ألياف ضوئية',
    phone: ''
  });

  // قائمة العقارات مع تطبيق القواعد والعملات والخصوصية
  const [propertiesList, setPropertiesList] = useState<RealEstateItem[]>([
    {
      id: 'prop-101',
      title: 'شقة عائلية فاخرة سوبر ديلوكس مع إطلالة مفتوحة',
      listingType: 'rent',
      propertyType: 'apartment',
      propertyTypeName: 'شقة سكنية',
      price: 400,
      currency: 'USD',
      period: 'شهرياً',
      city: 'صنعاء',
      governorate: 'صنعاء',
      location: 'حدة - الحي الدبلوماسي خلف فندق شيراتون',
      area: '160 م²',
      bedrooms: 3,
      bathrooms: 2,
      condition: 'سوبر ديلوكس جاهزة للسكن',
      description: 'شقة واسعة تشطيب راقٍ جداً، ديكورات جبسية حديثة، أرضيات رخام وسيراميك أسباني، تهوية وإنارة ممتازة لكافة الغرف، منطقة هادئة وآمنة وقريبة من كافة الخدمات.',
      features: ['موقف سيارات خاص', 'مصعد كهربائي حديث', 'خزان مياه أرضي وعلوي مستقل', 'حراسة وأمن 24/7', 'إنترنت ألياف ضوئية'],
      publishedAt: 'قبل يومين',
      status: 'active',
      viewsCount: 680,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
      ],
      publisherId: 'user-current', // ملك المستخدم الحالي لتجربة ظهور العمولة
      publisherName: 'مكتب الأمانة العقاري',
      publisherType: 'brokerage_office',
      isVerifiedPublisher: true,
      privateContact: {
        phone: '777123456',
        whatsapp: '777123456'
      },
      commissionRate: 5,
      showCommissionToOwner: true // صلاحية ظهور العمولة مفعلة من الإدارة
    },
    {
      id: 'prop-102',
      title: 'فيلا مستقلة مودرن حوش واسع مع مسبح خاص',
      listingType: 'sale',
      propertyType: 'villa',
      propertyTypeName: 'فيلا مستقلة',
      price: 280000,
      currency: 'USD',
      city: 'عدن',
      governorate: 'عدن',
      location: 'إنماء - المرحلة السكنية الأولى الساحلية',
      area: '450 م²',
      bedrooms: 5,
      bathrooms: 4,
      condition: 'بناء شخصي حديث غير مسكونة',
      description: 'فيلا عصرية فاخرة دورين وملحق، تصميم معماري مميز، حوش واسع يتسع لـ 3 سيارات، مسبح خاص مجهز بنظام فلترة، إطلالة بحرية قريبة، تشطيبات فندقية.',
      features: ['مسبح خاص', 'حديقة منزلية', 'حوش واسع للسيارات', 'تكييف مركزي مجهز', 'منظومة طاقة شمسية', 'توثيق وبصيرة شرعية معمدة'],
      publishedAt: 'قبل 4 أيام',
      status: 'active',
      viewsCount: 1250,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
      ],
      publisherId: 'user-772',
      publisherName: 'شركة الساحل للاستثمار العقاري',
      publisherType: 'company',
      isVerifiedPublisher: true,
      privateContact: {
        phone: '733987654',
        whatsapp: '733987654'
      },
      commissionRate: 2.5,
      showCommissionToOwner: false // العمولة مخفية عن المالك بقرار الإدارة
    },
    {
      id: 'prop-103',
      title: 'عمارة استثمارية 4 أدوار 8 شقق موقع تجاري',
      listingType: 'sale',
      propertyType: 'building',
      propertyTypeName: 'عمارة استثمارية',
      price: 450000000,
      currency: 'YER',
      city: 'صنعاء',
      governorate: 'صنعاء',
      location: 'بيت بوس - شارع الـ 24 التجاري',
      area: '600 م²',
      bedrooms: 16,
      bathrooms: 8,
      condition: 'عمارة مؤجرة بالكامل دخل شهري ممتاز',
      description: 'عمارة حجر مهندمة على شارع 24 تجاري، تتكون من 4 أدوار تضم 8 شقق و4 فتحات تجارية، مؤجرة بالكامل بعائد استثماري ثابت، خزان أرضي كبير ومواقف.',
      features: ['موقع تجاري حيوي', 'محلات تجارية مؤجرة', 'دخل استثماري مضمون', 'بصيرة أصل معمدة في المحكمة', 'خزان مياه مركزي'],
      publishedAt: 'قبل أسبوع',
      status: 'active',
      viewsCount: 940,
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80'
      ],
      publisherId: 'user-109',
      publisherName: 'مالك العقار مباشر',
      publisherType: 'owner',
      isVerifiedPublisher: true,
      privateContact: {
        phone: '771223344',
        whatsapp: '771223344'
      },
      commissionRate: 2.5,
      showCommissionToOwner: true
    }
  ]);

  // تصفية العقارات
  const filteredProperties = propertiesList.filter((item) => {
    if (filterType === 'all') return true;
    return item.listingType === filterType;
  });

  // فحص صلاحية رؤية عمولة المنصة
  const canViewPropertyCommission = (item: RealEstateItem): boolean => {
    if (currentUserRole === 'admin') return true;
    if (item.publisherId === currentUserId && item.showCommissionToOwner) return true;
    return false;
  };

  // معالجة إضافة عقار جديد
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: RealEstateItem = {
      id: `prop-${Date.now()}`,
      title: newPropertyForm.title,
      listingType: newPropertyForm.listingType,
      propertyType: newPropertyForm.propertyType,
      propertyTypeName: newPropertyForm.propertyType === 'apartment' ? 'شقة سكنية' : 'فيلا مستقلة',
      price: Number(newPropertyForm.price),
      currency: newPropertyForm.currency,
      period: newPropertyForm.listingType === 'rent' ? newPropertyForm.period : undefined,
      city: newPropertyForm.city,
      governorate: newPropertyForm.city,
      location: newPropertyForm.location,
      area: newPropertyForm.area,
      bedrooms: Number(newPropertyForm.bedrooms),
      bathrooms: Number(newPropertyForm.bathrooms),
      condition: newPropertyForm.condition,
      description: newPropertyForm.description,
      features: newPropertyForm.features.split(',').map(s => s.trim()),
      publishedAt: 'الآن',
      status: 'pending_review',
      viewsCount: 1,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'],
      publisherId: currentUserId,
      publisherName: 'المستخدم الحالي (صاحب العقار)',
      publisherType: 'owner',
      isVerifiedPublisher: true,
      privateContact: {
        phone: newPropertyForm.phone,
        whatsapp: newPropertyForm.phone
      },
      commissionRate: 2.5,
      showCommissionToOwner: true
    };

    setPropertiesList([newProp, ...propertiesList]);
    setAddSuccessToast(true);
    setTimeout(() => {
      setAddSuccessToast(false);
      setIsAddModalOpen(false);
    }, 2000);
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5b800] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#f5b800]/15">
            <Building className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">سوق العقارات والمخططات</h1>
              <span className="text-[11px] font-bold bg-[#f5b800]/10 text-[#f5b800] border border-[#f5b800]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                وساطة عقارية معتمدة
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              تصفح الشقق، الفلل، الأراضي، والعمائر الاستثمارية الموثقة في كافة المحافظات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#f5b800] hover:bg-[#e5aa00] active:scale-95 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-[#f5b800]/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>نشر عقار جديد</span>
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-[#f5b800]" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* 2. Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => { setFilterType('all'); setSelectedProperty(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          كل العقارات ({propertiesList.length})
        </button>
        <button
          onClick={() => { setFilterType('rent'); setSelectedProperty(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'rent'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          عقارات للإيجار
        </button>
        <button
          onClick={() => { setFilterType('sale'); setSelectedProperty(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'sale'
              ? 'bg-[#f5b800] text-zinc-950 shadow-md font-black'
              : 'bg-[#161616] text-zinc-400 hover:text-white border border-[#242424]'
          }`}
        >
          عقارات للبيع والشراء
        </button>
      </div>

      {/* 3. العرض التفصيلي للعقار المحدد (Property Details View) */}
      {selectedProperty ? (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProperty(null)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-zinc-300 hover:text-white"
            >
              <ArrowRight className="w-4 h-4 text-[#f5b800]" />
              <span>الرجوع إلى قائمة العقارات</span>
            </button>

            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              selectedProperty.listingType === 'rent'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {selectedProperty.listingType === 'rent' ? 'عقار معروض للإيجار' : 'عقار معروض للبيع'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* العمود الأيمن (2fr): الصور والمواصفات والوصف والمميزات */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* صورة الغلاف ومعرض الصور */}
              <div className="rounded-3xl bg-[#151515] border border-[#242424] overflow-hidden shadow-2xl">
                <div className="relative h-64 sm:h-84 w-full bg-[#1e1e1e]">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-[#f5b800] shadow-lg">
                    {selectedProperty.price.toLocaleString()} {selectedProperty.currency} {selectedProperty.period && `/${selectedProperty.period}`}
                  </div>
                </div>

                {selectedProperty.images.length > 1 && (
                  <div className="p-3 bg-[#111111] flex items-center gap-2.5 overflow-x-auto border-t border-[#222]">
                    {selectedProperty.images.map((img, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-xl bg-[#202020] overflow-hidden border border-[#2c2c2c] flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* بطاقة التفاصيل والمواصفات */}
              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-5 sm:p-6 space-y-5 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                    <span className="text-[#f5b800] font-bold bg-[#f5b800]/10 px-2 py-0.5 rounded border border-[#f5b800]/20">
                      {selectedProperty.propertyTypeName}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#f5b800]" />
                      {selectedProperty.city}، {selectedProperty.location}
                    </span>
                  </div>
                  
                  <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                    {selectedProperty.title}
                  </h2>
                </div>

                {/* شبكة المواصفات الرئيسية */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0d0d0d] border border-[#202020] text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-500 block">المساحة الإجمالية:</span>
                    <strong className="text-white flex items-center gap-1 font-mono">
                      <Maximize2 className="w-3.5 h-3.5 text-[#f5b800]" /> {selectedProperty.area}
                    </strong>
                  </div>

                  {selectedProperty.bedrooms !== undefined && (
                    <div className="space-y-1">
                      <span className="text-zinc-500 block">عدد الغرف:</span>
                      <strong className="text-white flex items-center gap-1 font-mono">
                        <BedDouble className="w-3.5 h-3.5 text-[#f5b800]" /> {selectedProperty.bedrooms} غرف
                      </strong>
                    </div>
                  )}

                  {selectedProperty.bathrooms !== undefined && (
                    <div className="space-y-1">
                      <span className="text-zinc-500 block">عدد الحمامات:</span>
                      <strong className="text-white flex items-center gap-1 font-mono">
                        <Bath className="w-3.5 h-3.5 text-[#f5b800]" /> {selectedProperty.bathrooms} حمامات
                      </strong>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-zinc-500 block">حالة التشطيب:</span>
                    <strong className="text-white block truncate">{selectedProperty.condition}</strong>
                  </div>
                </div>

                {/* الوصف */}
                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <h3 className="text-xs font-bold text-zinc-400">وصف العقار بالتفصيل</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>

                {/* المميزات والخدمات */}
                {selectedProperty.features.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-[#222]">
                    <h3 className="text-xs font-bold text-zinc-400">المميزات والخدمات المتوفرة</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedProperty.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 p-2 rounded-xl bg-[#0d0d0d] border border-[#202020] text-xs text-zinc-200">
                          <Check className="w-3.5 h-3.5 text-[#f5b800] flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* إحصائيات وتاريخ النشر */}
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-[#222]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> تاريخ النشر: {selectedProperty.publishedAt}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="w-3.5 h-3.5" /> {selectedProperty.viewsCount} مشاهدة
                  </span>
                </div>
              </div>

            </div>

            {/* العمود الأيسر (1fr): الوساطة المعتمدة، طلب المعاينة، وصندوق العمولة المشروط */}
            <div className="space-y-5">
              
              {/* صندوق السعر والوساطة المعتمدة للزائر والمشتري */}
              <div className="rounded-3xl bg-[#151515] border border-[#242424] p-5 space-y-4 shadow-2xl">
                
                <div className="text-center bg-[#0d0d0d] p-4 rounded-2xl border border-[#222] space-y-1">
                  <span className="text-xs text-zinc-400 block">السعر المطلوب:</span>
                  <div className="text-2xl font-black text-[#f5b800] font-mono tracking-tight">
                    {selectedProperty.price.toLocaleString()} {selectedProperty.currency}
                    {selectedProperty.period && <span className="text-xs text-zinc-400 font-sans font-normal"> / {selectedProperty.period}</span>}
                  </div>
                </div>

                {/* معلومات المعلن العامة بدون بيانات التواصل الخاصة */}
                <div className="p-3.5 bg-[#0d0d0d] rounded-2xl border border-[#202020] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">الجهة الناشرة للعقار:</span>
                    <span className="text-white font-bold">{selectedProperty.publisherName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">حالة التوثيق:</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> معتمد وموثق
                    </span>
                  </div>
                </div>

                {/* حماية بيانات التواصل وطلب المعاينة عبر المنصة */}
                <div className="p-3.5 bg-[#121212] rounded-2xl border border-[#262626] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#f5b800] font-bold">
                    <Lock className="w-4 h-4 text-[#f5b800]" />
                    <span>حماية المعاملات والوساطة المعتمدة</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    لحماية حقوق الطرفين، تتم المعاينة والتفاوض عبر وساطة Yemen Rating المعتمدة. تُفتح معلومات التواصل المباشرة بعد اعتماد وتأكيد طلب المعاينة وفق قواعد المنصة.
                  </p>

                  {inspectionRequestSent ? (
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>تم استلام طلب المعاينة، سيتواصل معك منسق العقارات.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInspectionRequestSent(true)}
                      className="w-full py-2.5 bg-[#f5b800] hover:bg-[#e5aa00] active:scale-95 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>طلب موعد معاينة العقار عبر المنصة</span>
                    </button>
                  )}
                </div>

                {/* 🔒 صندوق عمولة المنصة (يظهر لصاحب العقار فقط إذا كانت الصلاحية مفعلة، وللإدارة) */}
                {canViewPropertyCommission(selectedProperty) && (
                  <div className="bg-[#0c0c0c] p-3.5 rounded-2xl border border-[#2c2c2c] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300 border-b border-[#1f1f1f] pb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-[#f5b800]">
                        <Lock className="w-3.5 h-3.5" />
                        البيانات المالية للعمولة (خاص بناشر العقار والإدارة)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono text-zinc-300 pt-0.5">
                      <div className="flex justify-between">
                        <span>سعر العقار:</span>
                        <span className="text-white font-bold">{selectedProperty.price.toLocaleString()} {selectedProperty.currency}</span>
                      </div>
                      <div className="flex justify-between text-[#f5b800]">
                        <span>عمولة Yemen Rating ({selectedProperty.commissionRate}%):</span>
                        <span>{((selectedProperty.price * selectedProperty.commissionRate) / 100).toLocaleString()} {selectedProperty.currency}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 border-t border-[#1e1e1e] pt-1">
                        <span>صافي مستحق صاحب العقار:</span>
                        <span className="font-bold">{(selectedProperty.price - ((selectedProperty.price * selectedProperty.commissionRate) / 100)).toLocaleString()} {selectedProperty.currency}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      ) : (
        /* 4. شبكة قائمة العقارات (Real Estate Grid) */
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProperties.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedProperty(item)}
                className="rounded-3xl bg-[#151515] border border-[#242424] hover:border-[#f5b800]/40 overflow-hidden cursor-pointer group transition-all shadow-xl flex flex-col"
              >
                {/* صورة العقار والأسعار والشارات */}
                <div className="relative h-44 sm:h-48 w-full bg-[#202020] overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 right-3 bg-zinc-950/90 backdrop-blur-md px-3 py-1 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-[#f5b800] shadow-md">
                    {item.price.toLocaleString()} {item.currency} {item.period && `/${item.period}`}
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-md ${
                      item.listingType === 'rent'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.listingType === 'rent' ? 'للإيجار' : 'للبيع'}
                    </span>
                  </div>
                </div>

                {/* تفاصيل البطاقة العامة */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-[#f5b800] bg-[#f5b800]/10 px-2 py-0.5 rounded-md border border-[#f5b800]/20 font-bold">
                      {item.propertyTypeName}
                    </span>

                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] transition-colors line-clamp-1 mt-1.5">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-[#f5b800] flex-shrink-0" />
                      <span>{item.city}، {item.location}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-2.5 mt-2.5 border-t border-[#202020]">
                      <span className="flex items-center gap-1 font-mono"><Maximize2 className="w-3.5 h-3.5 text-[#f5b800]" /> {item.area}</span>
                      {item.bedrooms && <span className="flex items-center gap-1 font-mono"><BedDouble className="w-3.5 h-3.5 text-[#f5b800]" /> {item.bedrooms} غرف</span>}
                      {item.bathrooms && <span className="flex items-center gap-1 font-mono"><Bath className="w-3.5 h-3.5 text-[#f5b800]" /> {item.bathrooms}</span>}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#202020] flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[11px]">{item.publishedAt}</span>
                    <span className="text-[#f5b800] font-bold group-hover:underline flex items-center gap-1">
                      <span>معاينة التفاصيل</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. نافذة نشر عقار جديد (Add Property Modal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#151515] border border-[#282828] rounded-3xl p-5 sm:p-6 w-full max-w-2xl space-y-4 shadow-2xl my-6">
            
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#f5b800]" />
                  <span>طلب نشر عقار جديد</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  تخضع جميع العقارات لمراجعة الإدارة والتحقق من الوثائق قبل النشر للعامة
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addSuccessToast ? (
              <div className="p-5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">تم إرسال طلب نشر العقار بنجاح!</h4>
                <p className="text-xs text-zinc-300">
                  حالة العقار: <strong>بانتظار مراجعة الإدارة</strong>. سيتم التحقق من التفاصيل ونشره قريباً.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateProperty} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 mb-1 font-bold">عنوان الإعلان *</label>
                    <input
                      type="text"
                      required
                      value={newPropertyForm.title}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, title: e.target.value })}
                      placeholder="مثال: شقة سوبر ديلوكس للإيجار في حدة"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">نوع العرض *</label>
                    <select
                      value={newPropertyForm.listingType}
                      onChange={(e: any) => setNewPropertyForm({ ...newPropertyForm, listingType: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    >
                      <option value="rent">للإيجار</option>
                      <option value="sale">للبيع</option>
                    </select>
                  </div>
                </div>

                {/* السعر والعملة */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">السعر المطلوب *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPropertyForm.price}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, price: e.target.value })}
                      placeholder="مثال: 500"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">العملة المحددة *</label>
                    <select
                      value={newPropertyForm.currency}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, currency: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#f5b800]"
                    >
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="YER">ريال يمني (YER)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">نوع العقار *</label>
                    <select
                      value={newPropertyForm.propertyType}
                      onChange={(e: any) => setNewPropertyForm({ ...newPropertyForm, propertyType: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    >
                      <option value="apartment">شقة سكنية</option>
                      <option value="villa">فيلا مستقلة</option>
                      <option value="building">عمارة استثمارية</option>
                      <option value="land">أرض / مخطط</option>
                      <option value="commercial">محل تجاري</option>
                      <option value="office">مكتب / عيادة</option>
                    </select>
                  </div>
                </div>

                {/* المساحة والمواصفات والمدينة */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">المساحة *</label>
                    <input
                      type="text"
                      required
                      value={newPropertyForm.area}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, area: e.target.value })}
                      placeholder="مثال: 160 م² أو 6 لبن"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">الغرف</label>
                    <input
                      type="number"
                      value={newPropertyForm.bedrooms}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, bedrooms: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">الحمامات</label>
                    <input
                      type="number"
                      value={newPropertyForm.bathrooms}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, bathrooms: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">المدينة *</label>
                    <input
                      type="text"
                      required
                      value={newPropertyForm.city}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, city: e.target.value })}
                      placeholder="صنعاء، عدن..."
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>
                </div>

                {/* الموقع وبيانات التواصل المحمية */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">الموقع العام / الحي *</label>
                    <input
                      type="text"
                      required
                      value={newPropertyForm.location}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, location: e.target.value })}
                      placeholder="مثال: حدة - الحي الدبلوماسي"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">رقم الهاتف (محمي ولا يظهر للعامة) *</label>
                    <input
                      type="tel"
                      required
                      value={newPropertyForm.phone}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, phone: e.target.value })}
                      placeholder="777000000"
                      className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#f5b800]"
                    />
                  </div>
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">وصف العقار بالتفصيل *</label>
                  <textarea
                    rows={3}
                    required
                    value={newPropertyForm.description}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, description: e.target.value })}
                    placeholder="مواصفات العقار، جودة التشطيب، المزايا والخدمات..."
                    className="w-full bg-[#0d0d0d] border border-[#2c2c2c] rounded-xl p-3 text-white focus:outline-none focus:border-[#f5b800]"
                  />
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center justify-between pt-2 border-t border-[#242424] flex-wrap gap-2">
                  <span className="text-[10px] text-zinc-500">
                    * سيتم إشعارك فور مراجعة واعتماد نشر العقار
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#f5b800] hover:bg-[#e5aa00] active:scale-95 text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال للإدارة للمراجعة</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default RealEstatePage;
