import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Store,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Coins,
  Percent,
  DollarSign,
  ArrowUpRight,
  Clock,
  Star,
  Sparkles,
  Building2,
  Tag,
  Check,
  X,
  ShieldAlert,
  Layers,
  MapPin,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

// الأنواع والواجهات البرمجية
export type PhoneStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'suspended' | 'sold' | 'expired';
export type SellerType = 'store' | 'individual';

export interface PhoneProduct {
  id: string;
  title: string;
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  color: string;
  condition: 'جديد (New)' | 'مستعمل كرت (Like New)' | 'مستعمل نظيف (Used)' | 'مجدد (Refurbished)';
  price: number;
  currency: 'YER' | 'SAR' | 'USD';
  city: string;
  sellerType: SellerType;
  sellerName: string;
  sellerPhone: string;
  isStoreVerified?: boolean;
  storeId?: string;
  status: PhoneStatus;
  isFeatured: boolean;
  featuredUntil?: string;
  createdAt: string;
  expiresAt: string;
  images: string[];
  rejectionReason?: string;
  description: string;
}

export interface BrandCatalogItem {
  id: string;
  name: string;
  models: string[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  adminName: string;
  target: string;
  time: string;
  details?: string;
}

// البيانات الأولية للتجربة والربط
const INITIAL_BRANDS: BrandCatalogItem[] = [
  { id: 'apple', name: 'Apple', models: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13', 'iPhone 12', 'iPhone 11'] },
  { id: 'samsung', name: 'Samsung', models: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy Z Fold 5', 'Galaxy A55', 'Galaxy A35'] },
  { id: 'xiaomi', name: 'Xiaomi / Redmi', models: ['Xiaomi 14 Ultra', 'Xiaomi 13T Pro', 'Redmi Note 13 Pro+', 'Redmi Note 13', 'Poco X6 Pro'] },
  { id: 'honor', name: 'Honor', models: ['Honor Magic 6 Pro', 'Honor 90', 'Honor X9b', 'Honor X8b'] },
  { id: 'oppo', name: 'Oppo', models: ['Find X7 Ultra', 'Reno 11 Pro', 'Reno 10', 'A78'] },
];

const INITIAL_PHONES: PhoneProduct[] = [
  {
    id: 'PH-1001',
    title: 'Apple iPhone 15 Pro Max 256GB تيتانيوم طبيعي',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storage: '256GB',
    ram: '8GB',
    color: 'تيتانيوم طبيعي',
    condition: 'جديد (New)',
    price: 385000,
    currency: 'YER',
    city: 'صنعاء',
    sellerType: 'store',
    sellerName: 'متجر العصرية للهواتف الذكية',
    sellerPhone: '777123456',
    isStoreVerified: true,
    storeId: 'biz-101',
    status: 'published',
    isFeatured: true,
    featuredUntil: '2026-09-15',
    createdAt: '2026-08-25',
    expiresAt: '2026-09-25',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'],
    description: 'جهاز جديد بكرتونته مع ضمان لمدة سنة كاملة من المتجر وشاحن أصلي هدية.'
  },
  {
    id: 'PH-1002',
    title: 'Samsung Galaxy S24 Ultra 512GB تيتانيوم رمادي',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage: '512GB',
    ram: '12GB',
    color: 'رمادي تيتانيوم',
    condition: 'مستعمل كرت (Like New)',
    price: 340000,
    currency: 'YER',
    city: 'عدن',
    sellerType: 'store',
    sellerName: 'عدن فون للتقنية',
    sellerPhone: '733987654',
    isStoreVerified: true,
    storeId: 'biz-102',
    status: 'pending',
    isFeatured: false,
    createdAt: '2026-08-29',
    expiresAt: '2026-09-29',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
    description: 'استخدام أسبوعين فقط، خالي من أي خدش، كامل الملحقات الأصلية متوفرة.'
  },
  {
    id: 'PH-1003',
    title: 'Xiaomi Redmi Note 13 Pro 256GB أسود ملكي',
    brand: 'Xiaomi / Redmi',
    model: 'Redmi Note 13',
    storage: '256GB',
    ram: '8GB',
    color: 'Midnight Black',
    condition: 'مستعمل نظيف (Used)',
    price: 950,
    currency: 'SAR',
    city: 'تعز',
    sellerType: 'individual',
    sellerName: 'خالد عبدالله الحميري (فردي)',
    sellerPhone: '711554433',
    status: 'published',
    isFeatured: false,
    createdAt: '2026-08-28',
    expiresAt: '2026-09-28',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'],
    description: 'هاتف شخصي نظيف جداً، بطارية 98%، للبيع لغرض السفر.'
  },
  {
    id: 'PH-1004',
    title: 'Apple iPhone 13 128GB أزرق',
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    ram: '4GB',
    color: 'Blue',
    condition: 'مستعمل نظيف (Used)',
    price: 180000,
    currency: 'YER',
    city: 'حضرموت - المكلا',
    sellerType: 'individual',
    sellerName: 'سعيد باوزير (فردي)',
    sellerPhone: '774433221',
    status: 'pending',
    isFeatured: false,
    createdAt: '2026-08-30',
    expiresAt: '2026-09-30',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
    description: 'هاتف بحالة ممتازة مع شاحن فقط بدون كرتون.'
  }
];

export const PhonesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'sellers' | 'catalog' | 'commission' | 'audit'>('products');
  const [phones, setPhones] = useState<PhoneProduct[]>(INITIAL_PHONES);
  const [brands, setBrands] = useState<BrandCatalogItem[]>(INITIAL_BRANDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: '1', action: 'قبول ونشر هاتف', adminName: 'Super Admin', target: 'PH-1001', time: 'منذ يوم', details: 'تم التحقق من بيانات المتجر' },
    { id: '2', action: 'حفظ إعدادات العمولة', adminName: 'Super Admin', target: 'Commission Rule', time: 'منذ 3 أيام', details: 'العمولة مغلقة OFF' },
  ]);

  // فلاتر البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sellerTypeFilter, setSellerTypeFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // نافذة مراجعة المنتج وتفاصيله
  const [reviewProduct, setReviewProduct] = useState<PhoneProduct | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // إعدادات الماركات والموديلات
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedBrandForModel, setSelectedBrandForModel] = useState<string>('');
  const [newModelName, setNewModelName] = useState('');

  // إعدادات العمولة المستقبلية (الافتراضي: OFF)
  const [isCommissionEnabled, setIsCommissionEnabled] = useState<boolean>(false);
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionRate, setCommissionRate] = useState<number>(3.0); // 3%
  const [fixedCommissionAmount, setFixedCommissionAmount] = useState<number>(1000); // 1000 ريال
  const [commissionSuccessToast, setCommissionSuccessToast] = useState(false);

  // إضافة سجل تدقيق جديد
  const addAuditLog = (action: string, target: string, details?: string) => {
    const newEntry: AuditLogEntry = {
      id: Date.now().toString(),
      action,
      adminName: 'مدير النظام (Admin)',
      target,
      time: 'الآن',
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // تغيير حالة المنتج
  const handleUpdateStatus = (id: string, newStatus: PhoneStatus, reason?: string) => {
    setPhones(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: newStatus,
            rejectionReason: reason || p.rejectionReason
          };
        }
        return p;
      })
    );

    const actionNames: Record<PhoneStatus, string> = {
      published: 'قبول ونشر المنتج',
      rejected: 'رفض المنتج',
      suspended: 'إيقاف المنتج',
      sold: 'تحديد المنتج كمباع',
      expired: 'إنهاء صلاحية المنتج',
      draft: 'حفظ كمسودة',
      pending: 'إعادة للمراجعة'
    };

    addAuditLog(actionNames[newStatus], id, reason);
    setReviewProduct(null);
    setRejectionModalOpen(false);
    setRejectionReasonText('');
  };

  // تمييز المنتج (Toggle Featured)
  const handleToggleFeatured = (id: string) => {
    setPhones(prev =>
      prev.map(p => {
        if (p.id === id) {
          const next = !p.isFeatured;
          addAuditLog(next ? 'تمييز إعلان الهاتف' : 'إلغاء تمييز الهاتف', id);
          return { ...p, isFeatured: next, featuredUntil: next ? '2026-09-30' : undefined };
        }
        return p;
      })
    );
  };

  // حذف المنتج
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج من سجلات السوق؟')) {
      setPhones(prev => prev.filter(p => p.id !== id));
      addAuditLog('حذف منتج من السوق', id);
    }
  };

  // إضافة ماركة جديدة
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const brandId = newBrandName.trim().toLowerCase().replace(/\s+/g, '-');
    if (brands.some(b => b.id === brandId)) {
      alert('هذه الماركة مسجلة بالفعل');
      return;
    }
    const newBrand: BrandCatalogItem = {
      id: brandId,
      name: newBrandName.trim(),
      models: []
    };
    setBrands(prev => [...prev, newBrand]);
    addAuditLog('إضافة ماركة جديدة', newBrand.name);
    setNewBrandName('');
  };

  // إضافة موديل جديد لماركة
  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandForModel || !newModelName.trim()) return;
    setBrands(prev =>
      prev.map(b => {
        if (b.id === selectedBrandForModel) {
          if (b.models.includes(newModelName.trim())) return b;
          return { ...b, models: [...b.models, newModelName.trim()] };
        }
        return b;
      })
    );
    addAuditLog('إضافة موديل هاتف', `${selectedBrandForModel} -> ${newModelName.trim()}`);
    setNewModelName('');
  };

  // حفظ إعدادات العمولة
  const handleSaveCommissionSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setCommissionSuccessToast(true);
    addAuditLog(
      'تعديل إعدادات عمولة سوق الهواتف',
      'Commission Rule',
      `الحالة: ${isCommissionEnabled ? 'ON' : 'OFF'} | النوع: ${commissionType === 'percentage' ? `${commissionRate}%` : `${fixedCommissionAmount} مبلغ ثابت`} (للمحلات فقط)`
    );
    setTimeout(() => setCommissionSuccessToast(false), 3000);
  };

  // تصفية المنتجات
  const filteredPhones = useMemo(() => {
    return phones.filter(p => {
      const matchQuery =
        p.title.includes(searchQuery) ||
        p.model.includes(searchQuery) ||
        p.sellerName.includes(searchQuery) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSellerType = sellerTypeFilter === 'all' || p.sellerType === sellerTypeFilter;
      const matchBrand = brandFilter === 'all' || p.brand === brandFilter;
      const matchCity = cityFilter === 'all' || p.city.includes(cityFilter);

      return matchQuery && matchStatus && matchSellerType && matchBrand && matchCity;
    });
  }, [phones, searchQuery, statusFilter, sellerTypeFilter, brandFilter, cityFilter]);

  // إحصائيات الـ Dashboard
  const stats = {
    total: phones.length,
    published: phones.filter(p => p.status === 'published').length,
    pending: phones.filter(p => p.status === 'pending').length,
    suspended: phones.filter(p => p.status === 'suspended').length,
    expired: phones.filter(p => p.status === 'expired').length,
    storesCount: new Set(phones.filter(p => p.sellerType === 'store').map(p => p.sellerName)).size,
    individualsCount: new Set(phones.filter(p => p.sellerType === 'individual').map(p => p.sellerName)).size,
    featuredCount: phones.filter(p => p.isFeatured).length
  };

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والتبويبات الرئيسية */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">إدارة سوق الهواتف الذكية</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                مراقبة عروض المحلات والأفراد، مراجعة المنتجات، وضبط الكتالوج والعمولات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              {stats.pending} بانتظار المراجعة
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {stats.published} هاتف منشور
            </span>
          </div>
        </div>

        {/* أزرار التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'products', label: 'إدارة الهواتف والمنتجات', icon: Smartphone, count: stats.total },
            { id: 'sellers', label: 'المحلات والبائعين', icon: Store, count: stats.storesCount + stats.individualsCount },
            { id: 'catalog', label: 'الماركات والموديلات', icon: Tag },
            { id: 'commission', label: 'إعدادات العمولة (OFF)', icon: Coins },
            { id: 'audit', label: 'سجل التدقيق الإداري', icon: Clock, count: auditLogs.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. مؤشرات الأداء السريعة (Dashboard KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-zinc-400 font-semibold block">إجمالي المنتجات</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-emerald-400 font-semibold block">المنشورة للزوار</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{stats.published}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-amber-400 font-semibold block">قيد المراجعة</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">{stats.pending}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-blue-400 font-semibold block">المحلات التجارية</span>
          <span className="text-xl font-black text-blue-400 mt-1 block">{stats.storesCount} متجر</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-purple-400 font-semibold block">البائعون الأفراد</span>
          <span className="text-xl font-black text-purple-400 mt-1 block">{stats.individualsCount} فرد</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90">
          <span className="text-[11px] text-yellow-400 font-semibold block">عروض مميزة YR</span>
          <span className="text-xl font-black text-yellow-400 mt-1 block">{stats.featuredCount}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* التبويب 1: إدارة الهواتف والمنتجات                          */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* شريط الفلاتر والبحث */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* البحث */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث باسم الهاتف، الموديل، المتجر، أو الرقم..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* فلتر الحالة */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة (Pending)</option>
              <option value="published">منشور (Published)</option>
              <option value="suspended">موقوف (Suspended)</option>
              <option value="sold">تم البيع (Sold)</option>
              <option value="rejected">مرفوض (Rejected)</option>
            </select>

            {/* فلتر نوع البائع */}
            <select
              value={sellerTypeFilter}
              onChange={e => setSellerTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">نوع البائع (الكل)</option>
              <option value="store">محلات تجارية فقط (Stores)</option>
              <option value="individual">بائعون أفراد (Individuals)</option>
            </select>

            {/* فلتر الماركة */}
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">كل الماركات</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* قائمة وجدول المنتجات */}
          <div className="space-y-3">
            {filteredPhones.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                لا توجد هواتف مطابقة لمعايير البحث الحالية.
              </div>
            ) : (
              filteredPhones.map(phone => (
                <div
                  key={phone.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-zinc-950 border transition-all ${
                    phone.status === 'pending'
                      ? 'border-amber-500/40 bg-amber-950/5'
                      : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* معلومات الهاتف */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <img
                        src={phone.images[0]}
                        alt={phone.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700">
                            {phone.id}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {phone.brand} • {phone.model}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                            {phone.condition}
                          </span>
                          {phone.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400" /> إعلان مميز
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              phone.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : phone.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                : phone.status === 'suspended'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : phone.status === 'sold'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {phone.status === 'published' && '● منشور للزوار'}
                            {phone.status === 'pending' && '⏳ قيد المراجعة'}
                            {phone.status === 'suspended' && '✕ موقوف إدارياً'}
                            {phone.status === 'sold' && '✓ تم البيع'}
                            {phone.status === 'rejected' && '✕ مرفوض'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-white truncate">{phone.title}</h3>

                        <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            {phone.sellerType === 'store' ? (
                              <Store className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-purple-400" />
                            )}
                            البائع: <strong className="text-zinc-200">{phone.sellerName}</strong>
                            {phone.isStoreVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {phone.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" /> أضيف في: {phone.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* السعر والإجراءات */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-900 shrink-0">
                      <div className="text-right lg:text-left">
                        <span className="text-[10px] text-zinc-500 block">السعر المطلوب</span>
                        <span className="font-black text-sm sm:text-lg text-yellow-400 font-mono">
                          {phone.price.toLocaleString()} {phone.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReviewProduct(phone)}
                          className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-yellow-400" /> مراجعة
                        </button>

                        <button
                          onClick={() => handleToggleFeatured(phone.id)}
                          className={`p-2 rounded-xl text-xs transition ${
                            phone.isFeatured
                              ? 'bg-yellow-500 text-zinc-950'
                              : 'bg-zinc-900 text-zinc-400 hover:text-yellow-400 border border-zinc-800'
                          }`}
                          title="تمييز الإعلان"
                        >
                          <Star className={`w-4 h-4 ${phone.isFeatured ? 'fill-zinc-950' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(phone.id)}
                          className="p-2 bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-xl border border-zinc-800 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: إدارة المحلات والبائعين                          */}
      {/* ========================================================= */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          {/* قسم المحلات التجارية */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Store className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">المحلات والمتاجر التجارية المشاركة</h2>
              </div>
              <span className="text-xs text-zinc-400">مرتبطة بصفحات الأنشطة في يمن ريتغ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from(new Set(phones.filter(p => p.sellerType === 'store').map(p => p.sellerName))).map((storeName, idx) => {
                const storePhones = phones.filter(p => p.sellerName === storeName);
                const first = storePhones[0];
                return (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{storeName}</span>
                        {first?.isStoreVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> موثق
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 block">{first?.city} • {first?.sellerPhone}</span>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-bold text-yellow-400 block">{storePhones.length} هواتف معروضة</span>
                      <span className="text-[10px] text-zinc-500">{storePhones.filter(p => p.status === 'published').length} منشور</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* قسم البائعين الأفراد */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-purple-400">
                <User className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">البائعون الأفراد (مستخدمين عاديين)</h2>
              </div>
              <span className="text-xs text-zinc-400">عروض شخصية ومباشرة (بدون عمولة)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from(new Set(phones.filter(p => p.sellerType === 'individual').map(p => p.sellerName))).map((sellerName, idx) => {
                const indPhones = phones.filter(p => p.sellerName === sellerName);
                const first = indPhones[0];
                return (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">{sellerName}</span>
                      <span className="text-xs text-zinc-400 block">{first?.city} • {first?.sellerPhone}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-zinc-300 block">{indPhones.length} هواتف</span>
                      <span className="text-[10px] text-zinc-500">حساب فردي</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: الكتالوج المركزي للماركات والموديلات             */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* نماذج إضافة ماركة وموديل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* إضافة ماركة جديدة */}
            <form onSubmit={handleAddBrand} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <Plus className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">إضافة ماركة جديدة للكتالوج</h3>
              </div>
              <input
                type="text"
                placeholder="اسم الماركة (مثال: Google Pixel, Infinix)..."
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition"
              >
                إضافة الماركة
              </button>
            </form>

            {/* إضافة موديل تابع لماركة */}
            <form onSubmit={handleAddModel} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-yellow-400">
                <Plus className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">إضافة موديل هاتف تحت ماركة</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedBrandForModel}
                  onChange={e => setSelectedBrandForModel(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
                >
                  <option value="">اختر الماركة</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="اسم الموديل..."
                  value={newModelName}
                  onChange={e => setNewModelName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition border border-zinc-700"
              >
                إضافة الموديل للكتالوج
              </button>
            </form>
          </div>

          {/* شجرة الماركات والموديلات */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white pb-3 border-b border-zinc-800">
              قائمة الماركات والموديلات المعتمدة في النظام ({brands.length} ماركة)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map(brand => (
                <div key={brand.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="font-black text-sm text-yellow-400">{brand.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{brand.models.length} موديل</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {brand.models.map((model, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 4: بنية وإعدادات العمولة المستقبلية (Default OFF)     */}
      {/* ========================================================= */}
      {activeTab === 'commission' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            {/* التنبيه الحاسم لقواعد العمولة */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-blue-300 text-xs sm:text-sm space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-blue-200">
                <AlertCircle className="w-4 h-4" />
                قواعد بنية العمولة في سوق الهواتف:
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300 text-xs pr-2">
                <li>الوضع الافتراضي حالياً هو <strong>إيقاف العمولة (OFF)</strong>.</li>
                <li>عند تفعيل العمولة مستقبلاً، تطبق <strong>حصراً على المحلات التجارية</strong>، و<strong>لا تطبق على البائعين الأفراد</strong>.</li>
                <li><strong>إضافة الهاتف أو نشره لا يقتطع أي عمولة</strong>؛ العمولة لا ترتبط إلا بعمليات البيع المؤكدة والمسجلة.</li>
                <li>نسبة وقيمة العمولة <strong>سرية تماماً</strong> وخاصة بالإدارة وصاحب المتجر ولا تظهر للزائر العام.</li>
              </ul>
            </div>

            <form onSubmit={handleSaveCommissionSettings} className="space-y-5">
              {/* المفتاح الرئيسي Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-white">تفعيل نظام العمولة لسوق الهواتف</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">التحكم في احتساب عمولة المنصة على مبيعات المحلات التجارية</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCommissionEnabled(prev => !prev)}
                  className={`w-14 h-7 rounded-full transition-colors relative p-1 ${
                    isCommissionEnabled ? 'bg-yellow-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                      isCommissionEnabled ? 'translate-x-0' : '-translate-x-7'
                    }`}
                  />
                </button>
              </div>

              {/* تفاصيل العمولة */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${!isCommissionEnabled ? 'opacity-50' : 'opacity-100'}`}>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">نوع احتساب العمولة:</label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      disabled={!isCommissionEnabled}
                      onClick={() => setCommissionType('percentage')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                        commissionType === 'percentage'
                          ? 'bg-yellow-500 text-zinc-950'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" /> نسبة مئوية %
                    </button>
                    <button
                      type="button"
                      disabled={!isCommissionEnabled}
                      onClick={() => setCommissionType('fixed')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                        commissionType === 'fixed'
                          ? 'bg-yellow-500 text-zinc-950'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" /> مبلغ مقطوع ثابت
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    قيمة العمولة المقررة للمحلات ({commissionType === 'percentage' ? 'نسبة مئوية %' : 'مبلغ ثابت'}):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    disabled={!isCommissionEnabled}
                    value={commissionType === 'percentage' ? commissionRate : fixedCommissionAmount}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      if (commissionType === 'percentage') setCommissionRate(val);
                      else setFixedCommissionAmount(val);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
              >
                {commissionSuccessToast ? (
                  <>
                    <Check className="w-4 h-4" /> تم حفظ إعدادات العمولة وسجل التدقيق بنجاح
                  </>
                ) : (
                  'حفظ سياسة العمولة'
                )}
              </button>
            </form>
          </div>

          {/* هيكل سجل العمليات المالية المستقبلية */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-white pb-2 border-b border-zinc-800">
              سجل العمليات المالية والعمولات المحصلة (Commission Transactions)
            </h3>
            <p className="text-xs text-zinc-500 italic py-4 text-center">
              لا توجد عمليات بيع مؤكدة حالياً لتسجيل عمولات (العمولة في وضع الإيقاف OFF وتتطلب مبيعات فعلية مسجلة).
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 5: سجل التدقيق الإداري (Audit Log)                  */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">سجل إجراءات وتدقيق سوق الهواتف</h2>
            </div>
            <span className="text-xs text-zinc-400">حماية العمليات وتتبع التغييرات</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200">{log.action}</span>
                    <span className="font-mono text-yellow-400 bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
                      {log.target}
                    </span>
                  </div>
                  {log.details && <p className="text-zinc-400 text-[11px]">{log.details}</p>}
                </div>

                <div className="text-left text-zinc-500 text-[11px]">
                  <span className="block font-semibold text-zinc-400">{log.adminName}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة مراجعة المنتج قبل النشر (Review Modal)               */}
      {/* ========================================================= */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* الرأس */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">مراجعة بيانات الهاتف: {reviewProduct.id}</h3>
              </div>
              <button
                onClick={() => setReviewProduct(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* صور الهاتف */}
            <div>
              <span className="text-xs font-bold text-zinc-400 block mb-2">صور الجهاز المرفقة:</span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {reviewProduct.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-32 h-32 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* المواصفات والبيانات */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block">الماركة والموديل:</span>
                <span className="font-bold text-zinc-200">{reviewProduct.brand} - {reviewProduct.model}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">السعة والذاكرة:</span>
                <span className="font-bold text-zinc-200">{reviewProduct.storage} {reviewProduct.ram ? `/ ${reviewProduct.ram}` : ''}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">حالة الجهاز:</span>
                <span className="font-bold text-yellow-400">{reviewProduct.condition}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">اللون:</span>
                <span className="font-bold text-zinc-200">{reviewProduct.color}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">المدينة:</span>
                <span className="font-bold text-zinc-200">{reviewProduct.city}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">السعر المطلوب:</span>
                <span className="font-black text-yellow-400 font-mono text-sm">{reviewProduct.price.toLocaleString()} {reviewProduct.currency}</span>
              </div>
            </div>

            {/* الوصف */}
            <div>
              <span className="text-xs font-bold text-zinc-400 block mb-1">وصف البائع:</span>
              <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-xl border border-zinc-800 leading-relaxed">
                {reviewProduct.description}
              </p>
            </div>

            {/* بيانات البائع */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">نوع وهوية البائع:</span>
                <span className="font-bold text-zinc-200 flex items-center gap-1.5 mt-0.5">
                  {reviewProduct.sellerType === 'store' ? <Store className="w-3.5 h-3.5 text-blue-400" /> : <User className="w-3.5 h-3.5 text-purple-400" />}
                  {reviewProduct.sellerName} ({reviewProduct.sellerPhone})
                </span>
              </div>
              {reviewProduct.isStoreVerified && (
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                  متجر موثق في يمن ريتغ
                </span>
              )}
            </div>

            {/* أزرار الإجراءات في المراجعة */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(reviewProduct.id, 'published')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" /> قبول ونشر في السوق
                </button>

                <button
                  onClick={() => setRejectionModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs border border-rose-500/30 transition"
                >
                  <XCircle className="w-4 h-4" /> رفض الإعلان
                </button>

                {reviewProduct.status === 'published' && (
                  <button
                    onClick={() => handleUpdateStatus(reviewProduct.id, 'suspended')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition"
                  >
                    إيقاف مؤقت
                  </button>
                )}
              </div>

              <button
                onClick={() => setReviewProduct(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تحديد سبب الرفض */}
      {rejectionModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" /> سبب رفض إعلان الهاتف
            </h3>
            <textarea
              placeholder="اكتب سبب الرفض ليتم إرساله للبائع في الإشعارات (مثال: الصور غير واضحة، السعر غير منطقي، نقص في المواصفات)..."
              value={rejectionReasonText}
              onChange={e => setRejectionReasonText(e.target.value)}
              className="w-full h-28 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateStatus(reviewProduct.id, 'rejected', rejectionReasonText)}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs transition"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhonesManager;
