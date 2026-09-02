import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, Search, MapPin, Phone, MessageCircle, 
  ArrowRight, Star, ShieldCheck, ChevronLeft, Sparkles, 
  Clock, Store, Utensils, Hotel, Stethoscope, Bus
} from 'lucide-react';
import { BusinessService } from '../../../services/platformServices';
import { BusinessEntity } from '../../../types/schema.types';
import { YRBadge } from '../../../components/common/YRBadge';
import { AdBanner } from '../../../components/common/AdBanner';
import { YEMEN_CITIES } from '../../../config/citiesConfig';

const MOCK_BUSINESSES: BusinessEntity[] = [
  BusinessService.getDemoRecord(),
  {
    id: 'biz-2',
    slug: 'yemeni-house-restaurant',
    name: 'مطعم البيت اليمني للمأكولات الشعبية',
    category_label: 'مطاعم وأغذية',
    badge_type: 'blue',
    city_name: 'صنعاء — حدة',
    address: 'شارع حدة — أمام مركز الكميم',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop&q=85',
    description: 'أشهى المأكولات اليمنية الشعبية الأصيلة، مندي، حنيذ، سلته، فحسة، ومشاوي طازجة يومياً بأعلى معايير الجودة والنظافة.',
    phone: '777222333',
    whatsapp: '967777222333',
    is_verified: true,
    services: [
      { name: 'وجبة مندي لحم بلدي مع الأرز والصلصة', price: 6500, currency: 'YER' },
      { name: 'فحسة يمنية ساخنة باللحم المفروم', price: 3500, currency: 'YER' },
      { name: 'سلته صنعانية بالخضار والحلبة', price: 2500, currency: 'YER' },
      { name: 'مشاوي مشكلة عائلية', price: 9000, currency: 'YER' }
    ],
    media: [
      { id: 'm1', file_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true },
      { id: 'm2', file_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 2 }
    ],
    reviews: [
      { id: 'r1', user_name: 'أحمد الوصابي', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', entity_type: 'business', entity_id: 'biz-2', rating: 5, comment: 'أكل يمني أصيل بنكهة ممتازة ونظافة عالية.', status: 'approved', created_at: 'منذ يومين' }
    ],
    rating_summary: { average: 4.8, count: 140, distribution: { 5: 120, 4: 15, 3: 5, 2: 0, 1: 0 } }
  },
  {
    id: 'biz-3',
    slug: 'elite-hospital-aden',
    name: 'مستشفى النخبة التخصصي',
    category_label: 'المستشفيات والمراكز الطبية',
    badge_type: 'gold',
    city_name: 'عدن — خور مكسر',
    address: 'شارع ساحل أبين — حي السفارات',
    logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400&auto=format&fit=crop&q=85',
    description: 'صرح طبي متكامل يقدم خدمات الطوارئ على مدار الساعة، غرف عمليات جراحية حديثة، عيادات استشارية متخصصة، ومختبرات تشخيصية دقيقة.',
    phone: '733111222',
    whatsapp: '967733111222',
    website_url: 'https://elite-hospital.ye',
    is_verified: true,
    services: [
      { name: 'خدمات الطوارئ والإسعاف 24/7', price: 5000, currency: 'YER' },
      { name: 'كشف واستشارة طبية تخصصية', price: 8000, currency: 'YER' },
      { name: 'فحوصات مخبرية شاملة', price: 15000, currency: 'YER' }
    ],
    media: [
      { id: 'm3', file_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true }
    ],
    reviews: [
      { id: 'r2', user_name: 'د. سامي المنصوري', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', entity_type: 'business', entity_id: 'biz-3', rating: 5, comment: 'عناية فائقة وتجهيزات طبية حديثة وكادر تمريضي ممتاز.', status: 'approved', created_at: 'منذ أسبوع' }
    ],
    rating_summary: { average: 4.9, count: 210, distribution: { 5: 190, 4: 18, 3: 2, 2: 0, 1: 0 } }
  },
  {
    id: 'biz-4',
    slug: 'aden-grand-hotel',
    name: 'فندق وأجنحة عدن جراند',
    category_label: 'الفنادق والضيافة',
    badge_type: 'gold',
    city_name: 'عدن — المعلا',
    address: 'شارع مدرم — إطلالة بحرية',
    logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&auto=format&fit=crop&q=85',
    description: 'إقامة فندقية فاخرة 5 نجوم بإطلالات ساحرة على خليج عدن، أجنحة مجهزة بالكامل، مسبح ومطاعم فخمة وقاعات مؤتمرات.',
    phone: '733555777',
    whatsapp: '967733555777',
    website_url: 'https://adengrandhotel.ye',
    is_verified: true,
    services: [
      { name: 'جناح فندقي تنفيذي إطلالة بحرية', price: 95000, currency: 'YER' },
      { name: 'غرفة ديلوكس مفردة مع إفطار بوفيه', price: 45000, currency: 'YER' },
      { name: 'حجز قاعة مؤتمرات وفعاليات', price: 180000, currency: 'YER' }
    ],
    media: [
      { id: 'm4', file_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true }
    ],
    reviews: [],
    rating_summary: { average: 4.8, count: 95, distribution: { 5: 80, 4: 12, 3: 3, 2: 0, 1: 0 } }
  }
];

export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter(b => {
      const matchCity = selectedCity === 'all' || b.city_name.includes(selectedCity);
      const matchQuery = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.category_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.services.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchQuery;
    });
  }, [selectedCity, searchQuery]);

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3.5 font-['Cairo',sans-serif] text-white">
      
      {/* إعلان البانر #4 */}
      <AdBanner placementId="4" className="mb-1" />

      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Store size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              دليل الشركات والمنشآت
            </h1>
            <span className="text-[9.5px] text-zinc-400 mt-0.5 block">
              تصفح أفضل المنشآت المعتمدة والمطاعم والمستشفيات والخدمات في اليمن
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={13} className="rtl:rotate-180" />
        </button>
      </div>

      {/* شريط البحث والفلترة السريعة */}
      <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226] shadow-xl">
        <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
          <Search size={14} className="text-zinc-500 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منشأة، مطعم، مستشفى، فندق، خدمة..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* فلاتر المحافظات */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-zinc-400 font-bold">المحافظة:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#18181C] border border-[#27272A] rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-200 outline-none cursor-pointer"
          >
            {YEMEN_CITIES.map(c => (
              <option key={c.id} value={c.name_ar}>{c.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {/* شبكة كروت المنشآت */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredBusinesses.map((biz) => (
          <div
            key={biz.id}
            onClick={() => navigate(`/businesses/${biz.slug}`)}
            className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/50 p-3.5 space-y-2.5 shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-98"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-[#18181C] border border-[#27272A] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                  <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover rounded-lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">
                      {biz.name}
                    </h3>
                    <YRBadge type={biz.badge_type} size={15} />
                  </div>

                  <div className="flex items-center gap-2 text-[9.5px] text-zinc-400 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#FFC500]/10 text-[#FFC500] font-bold">
                      {biz.category_label}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-zinc-300">
                      <MapPin size={10} className="text-[#FFC500]" /> {biz.city_name.split('—')[0]}
                    </span>
                    <span>•</span>
                    <span className="text-[#FFC500] font-bold">★ {biz.rating_summary.average}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                {biz.description}
              </p>

              {/* خدمات المنشأة البارزة */}
              {biz.services.length > 0 && (
                <div className="p-2 bg-[#161619] rounded-xl border border-[#27272A] space-y-1 text-[10px]">
                  <div className="text-zinc-400 font-bold truncate">أبرز الخدمات والأسعار:</div>
                  <div className="flex justify-between items-center text-zinc-200">
                    <span className="truncate">{biz.services[0].name}</span>
                    {biz.services[0].price && (
                      <b className="font-mono text-[#FFC500] shrink-0 mr-1">
                        {biz.services[0].price.toLocaleString()} ﷼
                      </b>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الاتصال والواتساب والدخول */}
            <div className="pt-2 border-t border-[#1F2937] flex items-center gap-1.5">
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-[#161619] border border-[#27272A] text-zinc-300 hover:text-[#FFC500] active:scale-95"
                  title="اتصال مباشر"
                >
                  <Phone size={13} />
                </a>
              )}

              {biz.whatsapp && (
                <a
                  href={`https://wa.me/${biz.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A] hover:text-white active:scale-95"
                  title="واتساب"
                >
                  <MessageCircle size={13} />
                </a>
              )}

              <button
                type="button"
                className="flex-1 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <span>عرض صفحة المنشأة</span>
                <ChevronLeft size={13} />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
