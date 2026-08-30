import React, { useState, useMemo } from 'react';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Tag,
  Search,
  Filter,
  Edit3,
  Plus,
  Clock,
  AlertCircle,
  Fuel,
  Apple,
  Boxes,
  Check,
  X,
  ArrowUpRight,
  ShieldCheck,
  Bell
} from 'lucide-react';

// الأنواع والواجهات
export type MarketCategory = 'تموين وحبوب' | 'مشتقات نفطية وغاز' | 'خضار وفواكه' | 'لحوم وأسماك' | 'مواد بناء';

export interface MarketItem {
  id: string;
  name: string;
  category: MarketCategory;
  unit: string;
  priceSanaa: number;
  priceAden: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  lastUpdated: string;
  status: 'active' | 'volatile' | 'stable';
}

export interface CentralMarket {
  id: string;
  name: string;
  city: string;
  category: string;
  status: 'active' | 'inactive';
  itemsCount: number;
  updated: string;
}

const INITIAL_MARKETS: CentralMarket[] = [
  { id: 'MKT-1', name: 'سوق الجملة المركزي (شعوب)', city: 'صنعاء', category: 'خضار وفواكه وسلع أساسية', status: 'active', itemsCount: 140, updated: 'منذ ساعتين' },
  { id: 'MKT-2', name: 'سوق الشيخ عثمان المركزي', city: 'عدن', category: 'أسماك ومواد غذائية وتموين', status: 'active', itemsCount: 95, updated: 'اليوم، 08:00 ص' },
  { id: 'MKT-3', name: 'سوق باب مكة للسلع التموينية', city: 'الحديدة', category: 'تموين وحبوب ومستوردات', status: 'active', itemsCount: 80, updated: 'أمس' },
  { id: 'MKT-4', name: 'سوق الغويزي التجاري', city: 'حضرموت - المكلا', category: 'سلع استهلاكية وأسماك', status: 'active', itemsCount: 60, updated: 'اليوم، 09:30 ص' },
  { id: 'MKT-5', name: 'سوق بيرباشا المركزي', city: 'تعز', category: 'خضار وفواكه ومواد غذائية', status: 'active', itemsCount: 75, updated: 'اليوم، 10:15 ص' },
  { id: 'MKT-6', name: 'سوق مأرب العام للسلع', city: 'مأرب', category: 'سلع تموينية وغاز', status: 'active', itemsCount: 50, updated: 'اليوم، 07:45 ص' },
];

const INITIAL_COMMODITIES: MarketItem[] = [
  { id: 'CMD-1', name: 'كيس دقيق القمح الأبيض (السنابل)', category: 'تموين وحبوب', unit: 'كيس 50 كجم', priceSanaa: 16500, priceAden: 42000, minPrice: 16000, maxPrice: 43000, trend: 'stable', changePercent: 0, lastUpdated: 'اليوم، 09:00 ص', status: 'stable' },
  { id: 'CMD-2', name: 'كيس سكر برازيلي ناعم', category: 'تموين وحبوب', unit: 'كيس 50 كجم', priceSanaa: 29500, priceAden: 74000, minPrice: 29000, maxPrice: 75000, trend: 'up', changePercent: 1.5, lastUpdated: 'اليوم، 10:30 ص', status: 'volatile' },
  { id: 'CMD-3', name: 'أرز تايلندي درجة أولى (بسمتي)', category: 'تموين وحبوب', unit: 'قطمة 20 كجم', priceSanaa: 21000, priceAden: 52000, minPrice: 20500, maxPrice: 53000, trend: 'stable', changePercent: 0, lastUpdated: 'أمس', status: 'stable' },
  { id: 'CMD-4', name: 'زيت طبخ نباتي (نقاء)', category: 'تموين وحبوب', unit: 'دبة 20 لتر', priceSanaa: 22500, priceAden: 58000, minPrice: 22000, maxPrice: 59000, trend: 'down', changePercent: 2.1, lastUpdated: 'اليوم، 08:15 ص', status: 'stable' },
  { id: 'CMD-5', name: 'بنزين ممتاز (رسمي)', category: 'مشتقات نفطية وغاز', unit: 'دبة 20 لتر', priceSanaa: 9500, priceAden: 28000, minPrice: 9500, maxPrice: 28500, trend: 'stable', changePercent: 0, lastUpdated: 'اليوم، 06:00 ص', status: 'stable' },
  { id: 'CMD-6', name: 'ديزل تجاري / محطات', category: 'مشتقات نفطية وغاز', unit: 'دبة 20 لتر', priceSanaa: 11000, priceAden: 29000, minPrice: 10500, maxPrice: 29500, trend: 'up', changePercent: 3.2, lastUpdated: 'اليوم، 07:00 ص', status: 'volatile' },
  { id: 'CMD-7', name: 'أسطوانة غاز منزلي (تعبئة)', category: 'مشتقات نفطية وغاز', unit: 'أسطوانة', priceSanaa: 5500, priceAden: 14000, minPrice: 5000, maxPrice: 14500, trend: 'stable', changePercent: 0, lastUpdated: 'أمس', status: 'stable' },
  { id: 'CMD-8', name: 'طماطم بلدي طازج', category: 'خضار وفواكه', unit: 'كجم', priceSanaa: 800, priceAden: 2000, minPrice: 700, maxPrice: 2200, trend: 'down', changePercent: 5.0, lastUpdated: 'اليوم، 06:30 ص', status: 'stable' },
  { id: 'CMD-9', name: 'بصل أحمر بلدي', category: 'خضار وفواكه', unit: 'كجم', priceSanaa: 1200, priceAden: 3000, minPrice: 1100, maxPrice: 3200, trend: 'up', changePercent: 8.0, lastUpdated: 'اليوم، 06:30 ص', status: 'volatile' },
  { id: 'CMD-10', name: 'سمك ثمد طازج (صيد اليوم)', category: 'لحوم وأسماك', unit: 'كجم', priceSanaa: 4500, priceAden: 8000, minPrice: 4000, maxPrice: 8500, trend: 'stable', changePercent: 0, lastUpdated: 'اليوم، 07:00 ص', status: 'stable' },
];

export const MarketsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commodities' | 'markets' | 'fuel' | 'alerts'>('commodities');
  const [commodities, setCommodities] = useState<MarketItem[]>(INITIAL_COMMODITIES);
  const [markets, setMarkets] = useState<CentralMarket[]>(INITIAL_MARKETS);
  
  // البحث والفلاتر
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityMarketFilter, setCityMarketFilter] = useState<string>('all');

  // نافذة تعديل السعر
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [editPriceSanaa, setEditPriceSanaa] = useState<number>(0);
  const [editPriceAden, setEditPriceAden] = useState<number>(0);
  const [editTrend, setEditTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [editPercent, setEditPercent] = useState<number>(0);

  // نافذة إضافة سلعة جديدة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<MarketCategory>('تموين وحبوب');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemPriceSanaa, setNewItemPriceSanaa] = useState<number>(0);
  const [newItemPriceAden, setNewItemPriceAden] = useState<number>(0);

  // فتح نافذة التعديل
  const openEditModal = (item: MarketItem) => {
    setEditingItem(item);
    setEditPriceSanaa(item.priceSanaa);
    setEditPriceAden(item.priceAden);
    setEditTrend(item.trend);
    setEditPercent(item.changePercent);
  };

  // حفظ التعديل
  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setCommodities(prev =>
      prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            priceSanaa: editPriceSanaa,
            priceAden: editPriceAden,
            trend: editTrend,
            changePercent: editPercent,
            lastUpdated: 'الآن (محدث)'
          };
        }
        return item;
      })
    );
    setEditingItem(null);
  };

  // إضافة سلعة جديدة
  const handleAddCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemUnit.trim()) return;

    const newItem: MarketItem = {
      id: `CMD-${Date.now().toString().slice(-4)}`,
      name: newItemName.trim(),
      category: newItemCat,
      unit: newItemUnit.trim(),
      priceSanaa: newItemPriceSanaa,
      priceAden: newItemPriceAden,
      minPrice: newItemPriceSanaa,
      maxPrice: newItemPriceAden,
      trend: 'stable',
      changePercent: 0,
      lastUpdated: 'الآن',
      status: 'stable'
    };

    setCommodities(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemUnit('');
    setNewItemPriceSanaa(0);
    setNewItemPriceAden(0);
  };

  // تصفية السلع
  const filteredCommodities = useMemo(() => {
    return commodities.filter(c => {
      const matchSearch = c.name.includes(searchQuery) || c.unit.includes(searchQuery);
      const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [commodities, searchQuery, categoryFilter]);

  // تصفية الأسواق المركزية
  const filteredMarkets = useMemo(() => {
    return markets.filter(m => {
      const matchSearch = m.name.includes(searchQuery) || m.category.includes(searchQuery);
      const matchCity = cityMarketFilter === 'all' || m.city.includes(cityMarketFilter);
      return matchSearch && matchCity;
    });
  }, [markets, searchQuery, cityMarketFilter]);

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والتبويبات */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الأسواق والأسعار اليومية</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                متابعة مؤشرات السلع التموينية، المشتقات النفطية، والأسواق المركزية في المحافظات
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-yellow-500/10"
          >
            <Plus className="w-4 h-4" /> إضافة سلعة للمؤشر
          </button>
        </div>

        {/* التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'commodities', label: 'مؤشر السلع والتموين', icon: Boxes, count: commodities.length },
            { id: 'markets', label: 'الأسواق المركزية بالمحافظات', icon: Store, count: markets.length },
            { id: 'fuel', label: 'المشتقات النفطية والغاز', icon: Fuel, count: commodities.filter(c => c.category === 'مشتقات نفطية وغاز').length },
            { id: 'alerts', label: 'تنبيهات تقلبات الأسعار', icon: Bell, count: commodities.filter(c => c.trend !== 'stable').length },
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. شريط البحث والفلاتر */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'markets' ? 'بحث باسم السوق أو المدينة...' : 'بحث باسم السلعة أو الوحدة...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        {activeTab === 'commodities' && (
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
          >
            <option value="all">جميع قطاعات السلع</option>
            <option value="تموين وحبوب">تموين وحبوب</option>
            <option value="مشتقات نفطية وغاز">مشتقات نفطية وغاز</option>
            <option value="خضار وفواكه">خضار وفواكه</option>
            <option value="لحوم وأسماك">لحوم وأسماك</option>
          </select>
        )}

        {activeTab === 'markets' && (
          <select
            value={cityMarketFilter}
            onChange={e => setCityMarketFilter(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
          >
            <option value="all">كل المحافظات</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="الحديدة">الحديدة</option>
            <option value="المكلا">حضرموت - المكلا</option>
            <option value="مأرب">مأرب</option>
          </select>
        )}
      </div>

      {/* ========================================================= */}
      {/* التبويب 1: جدول مؤشر السلع والتموين                         */}
      {/* ========================================================= */}
      {activeTab === 'commodities' && (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">اسم السلعة / المادة</th>
                  <th className="py-3.5 px-4">القطاع / التصنيف</th>
                  <th className="py-3.5 px-4">الوحدة</th>
                  <th className="py-3.5 px-4 text-center">سعر صنعاء (ريال)</th>
                  <th className="py-3.5 px-4 text-center">سعر عدن والمحافظات (ريال)</th>
                  <th className="py-3.5 px-4 text-center">المؤشر والتغير</th>
                  <th className="py-3.5 px-4 text-center">آخر تحديث</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                {filteredCommodities.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {item.id}
                      </span>
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{item.category}</td>
                    <td className="py-3.5 px-4 font-medium text-yellow-400">{item.unit}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {item.priceSanaa.toLocaleString()} YER
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {item.priceAden.toLocaleString()} YER
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.trend === 'up'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : item.trend === 'down'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {item.trend === 'stable' && <Minus className="w-3 h-3" />}
                        {item.trend === 'up' ? `+${item.changePercent}%` : item.trend === 'down' ? `-${item.changePercent}%` : 'مستقر'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-zinc-400 text-[11px]">{item.lastUpdated}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-300 rounded-lg transition"
                        title="تعديل السعر"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: جدول الأسواق المركزية بالمحافظات                 */}
      {/* ========================================================= */}
      {activeTab === 'markets' && (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">اسم السوق المركزي</th>
                  <th className="py-3.5 px-4">المدينة / المحافظة</th>
                  <th className="py-3.5 px-4">النشاط والتصنيف</th>
                  <th className="py-3.5 px-4 text-center">السلع المسجلة</th>
                  <th className="py-3.5 px-4 text-center">حالة السوق</th>
                  <th className="py-3.5 px-4 text-center">آخر تحديث للأسعار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-white">
                {filteredMarkets.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-3.5 px-4 text-zinc-400 flex items-center gap-1">
                      <MapPin size={13} className="text-yellow-400" /> {m.city}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{m.category}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-yellow-400">
                      {m.itemsCount} سلعة
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        ● نشط ومُحدّث
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-zinc-400 text-[11px]">{m.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: المشتقات النفطية والغاز                         */}
      {/* ========================================================= */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commodities.filter(c => c.category === 'مشتقات نفطية وغاز').map(fuel => (
            <div key={fuel.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Fuel className="w-5 h-5" />
                  <h3 className="font-bold text-sm sm:text-base text-white">{fuel.name}</h3>
                </div>
                <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {fuel.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block">سعر صنعاء والمناطق المجاورة:</span>
                  <span className="font-black text-sm text-yellow-400 font-mono mt-0.5 block">
                    {fuel.priceSanaa.toLocaleString()} YER
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">سعر عدن والمحافظات:</span>
                  <span className="font-black text-sm text-yellow-400 font-mono mt-0.5 block">
                    {fuel.priceAden.toLocaleString()} YER
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-500">{fuel.lastUpdated}</span>
                <button
                  onClick={() => openEditModal(fuel)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-200 rounded-lg text-xs font-bold transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> تعديل التسعيرة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 4: تنبيهات وتقلبات الأسعار                         */}
      {/* ========================================================= */}
      {activeTab === 'alerts' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-400">
              <Bell className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">تنبيهات تقلبات الأسعار اليومية</h2>
            </div>
            <span className="text-xs text-zinc-400">مؤشرات الارتفاع والانخفاض المباشرة</span>
          </div>

          <div className="space-y-3">
            {commodities.filter(c => c.trend !== 'stable').map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    <span className="text-xs text-zinc-400">({item.unit})</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    تم تسجيل تغير في الأسعار بمقدار{' '}
                    <strong className={item.trend === 'up' ? 'text-rose-400' : 'text-emerald-400'}>
                      {item.trend === 'up' ? `ارتفاع +${item.changePercent}%` : `انخفاض -${item.changePercent}%`}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left text-xs font-mono">
                    <span className="text-zinc-400 block">صنعاء: {item.priceSanaa.toLocaleString()} YER</span>
                    <span className="text-zinc-400 block">عدن: {item.priceAden.toLocaleString()} YER</span>
                  </div>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-300 rounded-xl transition"
                    title="تعديل السعر"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة تعديل السعر (Edit Modal)                             */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base text-white">تعديل تسعيرة: {editingItem.name}</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  سعر صنعاء والمناطق المجاورة (YER / {editingItem.unit}):
                </label>
                <input
                  type="number"
                  value={editPriceSanaa}
                  onChange={e => setEditPriceSanaa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  سعر عدن والمحافظات (YER / {editingItem.unit}):
                </label>
                <input
                  type="number"
                  value={editPriceAden}
                  onChange={e => setEditPriceAden(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">مؤشر الاتجاه:</label>
                  <select
                    value={editTrend}
                    onChange={e => setEditTrend(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="stable">مستقر ⎯</option>
                    <option value="up">مرتفع ↑</option>
                    <option value="down">منخفض ↓</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">نسبة التغير (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPercent}
                    onChange={e => setEditPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition shadow-md shadow-yellow-500/10"
                >
                  حفظ وتحديث المؤشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة إضافة سلعة جديدة (Add Modal)                          */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base text-white">إضافة سلعة جديدة للمؤشر</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCommodity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم السلعة / المنتج:</label>
                <input
                  type="text"
                  placeholder="مثال: حليب بودرة ممتاز، زيت ذرة..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">القطاع:</label>
                  <select
                    value={newItemCat}
                    onChange={e => setNewItemCat(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="تموين وحبوب">تموين وحبوب</option>
                    <option value="مشتقات نفطية وغاز">مشتقات نفطية وغاز</option>
                    <option value="خضار وفواكه">خضار وفواكه</option>
                    <option value="لحوم وأسماك">لحوم وأسماك</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">الوحدة:</label>
                  <input
                    type="text"
                    placeholder="كيس 50 كجم، دبة 20 لتر..."
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">سعر صنعاء (YER):</label>
                  <input
                    type="number"
                    value={newItemPriceSanaa}
                    onChange={e => setNewItemPriceSanaa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">سعر عدن (YER):</label>
                  <input
                    type="number"
                    value={newItemPriceAden}
                    onChange={e => setNewItemPriceAden(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  إضافة السلعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsManager;
