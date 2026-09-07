const fs = require('fs');
const { execSync } = require('child_process');

console.log('🏗️ جاري بناء وتثبيت القالبين الموحدين في الموقع العام...');

// 1️⃣ بناء قالب العرض الجماعي الموحد (CategoryListing.tsx)
const categoryListingCode = `import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, MapPin, Phone, ArrowRight, Frown, Layers, CheckCircle2, 
  Bed, Wifi, Car, Stethoscope, Sparkles, Clock, Megaphone, 
  ShieldCheck, Heart, Share2, ExternalLink, Loader2, Award, 
  Utensils, Gem, Truck, Users, AlertCircle, Waves, MessageCircle
} from 'lucide-react';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { AdBanner } from '../common/AdBanner';
import { supabase } from '../../lib/supabase';

interface CategoryListingProps {
  categorySlug: string;
  businesses: BusinessItem[];
  selectedGov: string;
  selectedCity: string;
  onSelectBusiness: (business: BusinessItem) => void;
  onBackHome?: () => void;
  onBack?: () => void;
}

export const CategoryListing: React.FC<CategoryListingProps> = ({
  categorySlug,
  businesses,
  selectedGov,
  selectedCity,
  onSelectBusiness,
  onBackHome,
  onBack
}) => {
  const handleBack = onBackHome || onBack || (() => window.history.back());
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [liveBusinesses, setLiveBusinesses] = useState<BusinessItem[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  const category = OFFICIAL_CATEGORIES.find(c => c.slug === categorySlug);
  const Icon = category?.icon;
  const subcategories = category?.subcategories || [];

  // جلب المنشآت الحقيقية من Supabase
  useEffect(() => {
    const fetchLiveCategoryBusinesses = async () => {
      setLoadingLive(true);
      try {
        const { data: catRow } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', categorySlug)
          .maybeSingle();

        let query = supabase.from('businesses').select('*');
        if (catRow && catRow.id) {
          query = query.or(\`category_id.eq.\${catRow.id},category_id.eq.\${categorySlug}\`);
        } else {
          query = query.eq('category_id', categorySlug);
        }

        const { data: bRows, error } = await query.order('created_at', { ascending: false });

        if (!error && bRows && bRows.length > 0) {
          const mapped: BusinessItem[] = bRows.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            categorySlug: categorySlug,
            subCategorySlug: b.sub_category || '',
            governorateId: b.city || '',
            cityId: b.city || '',
            logo: b.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            coverImage: b.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            images: Array.isArray(b.gallery_urls) && b.gallery_urls.length > 0 ? b.gallery_urls : [b.cover_url || ''],
            rating: Number(b.rating) || 4.8,
            reviewsCount: Number(b.review_count) || 0,
            isVerified: b.is_verified ?? false,
            badgeType: b.badge_type || 'gold',
            claimStatus: b.claim_status || 'UNCLAIMED',
            phone: b.phone || '',
            whatsapp: b.whatsapp || '',
            website: b.website_url || '',
            address: b.address || b.city || 'اليمن',
            description: b.description || '',
            sectionsConfig: b.sections_config || {},
            reviews: []
          }));
          setLiveBusinesses(mapped);
        } else {
          setLiveBusinesses([]);
        }
      } catch (err) {
        console.warn('Live fetch fallback:', err);
        setLiveBusinesses([]);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLiveCategoryBusinesses();
  }, [categorySlug]);

  const allList = liveBusinesses.length > 0 
    ? liveBusinesses 
    : businesses.filter(b => b.categorySlug === categorySlug);

  const filtered = useMemo(() => {
    return allList.filter(b => {
      const matchesSub = selectedSubCategory === 'all' || (b as any).subCategorySlug === selectedSubCategory;
      const matchesGov = !selectedGov || selectedGov === 'all' || selectedGov === 'كل المحافظات' || b.governorateId === selectedGov;
      const matchesCity = !selectedCity || selectedCity === 'all' || b.cityId === selectedCity;
      return matchesSub && matchesGov && matchesCity;
    });
  }, [allList, selectedSubCategory, selectedGov, selectedCity]);

  return (
    <div dir="rtl" className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 🟢 الوحدة الإعلانية 1: البنر العلوي (YR Ads Top Unit) */}
      <div className="w-full">
        <AdBanner placementId="1" className="mb-2 shadow-sm rounded-2xl overflow-hidden" />
      </div>

      {/* ترويسة التصنيف الرسمية */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
              <Icon className="w-7 h-7" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              {category?.name || 'التصنيف'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تصفح أفضل المنشآت والخدمات المعتمدة ({filtered.length} منشأة متاحة)
            </p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* قائمة المنشآت */}
      {loadingLive ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-500 font-bold">جاري تحميل منشآت هذا القسم...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Frown className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">لا توجد منشآت مسجلة في هذا القسم حالياً</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">سيتم إضافة وتحديث المنشآت المعتمدة قريباً.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, 3).map((item) => (
              <BusinessCard key={item.id} item={item} onSelect={() => onSelectBusiness(item)} />
            ))}
          </div>

          {/* 🟢 الوحدة الإعلانية 2: إعلان وسط القائمة (YR Ads In-Feed Native) */}
          <div className="w-full my-6">
            <AdBanner placementId="2" className="shadow-sm rounded-2xl overflow-hidden" />
          </div>

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(3).map((item) => (
                <BusinessCard key={item.id} item={item} onSelect={() => onSelectBusiness(item)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🟢 الوحدة الإعلانية 3: البنر السفلي (YR Ads Bottom Unit) */}
      <div className="w-full pt-4">
        <AdBanner placementId="3" className="shadow-sm rounded-2xl overflow-hidden" />
      </div>
    </div>
  );
};

// مكون بطاقة المنشأة الموحدة
function BusinessCard({ item, onSelect }: { item: BusinessItem; onSelect: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer" onClick={onSelect}>
          <img 
            src={item.coverImage} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-3 right-4 w-14 h-14 rounded-xl bg-white p-1 shadow-lg border border-white/20">
            <img src={item.logo} alt={item.name} className="w-full h-full object-contain rounded-lg" />
          </div>

          <div className="absolute top-3 left-3">
            {item.isVerified ? (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> موثّق
              </span>
            ) : (
              <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" /> غير مطالب به
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 
            onClick={onSelect}
            className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition truncate cursor-pointer"
          >
            {item.name}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{item.address || item.cityId || 'اليمن'}</span>
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'منشأة معتمدة تقدم خدمات راقية ومتميزة لعملائها.'}
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        {item.phone && (
          <a 
            href={\`tel:\${item.phone}\`} 
            className="flex-1 text-center py-2.5 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" /> اتصال
          </a>
        )}

        {(item.whatsapp || item.phone) && (
          <a 
            href={\`https://wa.me/\${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}\`} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 text-center py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" /> واتساب
          </a>
        )}

        <button 
          onClick={onSelect}
          className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          التفاصيل
        </button>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/category/CategoryListing.tsx', categoryListingCode, 'utf8');
console.log('✅ تم بناء CategoryListing.tsx بنجاح تام');

// 2️⃣ بناء قالب العرض الفردي الموحد (BusinessDetails.tsx)
const businessDetailsCode = `import React, { useState } from 'react';
import { 
  Star, MapPin, Phone, Clock, ArrowRight, Share2, Heart, 
  Globe, ShieldCheck, CheckCircle2, MessageCircle, X, ChevronRight, ChevronLeft, ZoomIn
} from 'lucide-react';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

interface BusinessDetailsProps {
  business: BusinessItem;
  onBack: () => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const imagesList = Array.isArray(business.images) && business.images.length > 0 
    ? business.images 
    : [business.coverImage];

  const displayGallery = imagesList.slice(0, 4);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* زر العودة */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع للقائمة</span>
        </button>
      </div>

      {/* الهيدر البانورامي والشعار */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="h-60 sm:h-80 w-full bg-slate-900 relative">
          <img 
            src={business.coverImage} 
            alt={business.name} 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 shrink-0">
              <img src={business.logo} alt={business.name} className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {business.name}
                </h1>
                {business.isVerified ? (
                  <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" /> موثّق رسمي
                  </span>
                ) : (
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3" /> غير مطالب به
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{business.address || business.cityId || 'الجمهورية اليمنية'}</span>
              </p>
            </div>
          </div>

          {/* زر إثبات الملكية إذا كانت غير موثقة */}
          {!business.isVerified && (
            <div className="w-full sm:w-auto">
              <a 
                href={\`https://wa.me/967770000000?text=\${encodeURIComponent('أرغب بإثبات ملكية وإدارة المنشأة: ' + business.name)}\`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>هل أنت المالك؟ اثبت ملكيتك</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* تفاصيل المنشأة وشبكة الأقسام */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيمن: النبذة ومعرض الصور */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* نبذة عن المنشأة */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>نبذة عن المنشأة والخدمات</span>
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {business.description || 'منشأة رائدة تقدم أرقى الخدمات لعملائها بأعلى معايير الجودة والالتزام في الجمهورية اليمنية.'}
            </p>
          </div>

          {/* ألبوم الصور الأربع المكبر (Lightbox Gallery) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-indigo-600" />
              <span>معرض الصور والمرافق ({displayGallery.length} صور)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {displayGallery.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer relative group"
                >
                  <img 
                    src={img} 
                    alt={\`صورة \${idx + 1}\`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* العمود الأيسر: التواصل والحجز وساعات الدوام */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-20">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 text-sm">
              التواصل والحجز المباشر
            </h3>

            <div className="space-y-3 mb-6">
              {business.phone && (
                <a 
                  href={\`tel:\${business.phone}\`} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              )}
              
              {(business.whatsapp || business.phone) && (
                <a 
                  href={\`https://wa.me/\${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}\`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ساعات الدوام:</span>
                <span className="font-bold text-slate-700">على مدار 24 ساعة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المدينة / الفرع:</span>
                <span className="font-bold text-slate-700">{business.cityId || 'المركز الرئيسي'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">حالة التوثيق:</span>
                <span className={\`font-bold \${business.isVerified ? 'text-emerald-600' : 'text-amber-600'}\`}>
                  {business.isVerified ? 'موثق ومعتمد رسمي' : 'غير مطالب به'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* البنر الإعلاني السفلي */}
      <div className="w-full pt-4">
        <AdBanner placementId="3" className="shadow-sm rounded-2xl overflow-hidden" />
      </div>

      {/* نافذة تكبير الصورة (Lightbox Modal) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-transparent" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 left-0 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="تكبير" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
`;
fs.writeFileSync('src/components/business/BusinessDetails.tsx', businessDetailsCode, 'utf8');
console.log('✅ تم بناء BusinessDetails.tsx بنجاح تام');

// 3️⃣ تفعيل قراءة رابط التصنيف في MainPublicApp.tsx
let mainCode = fs.readFileSync('src/MainPublicApp.tsx', 'utf8');
const routerSnippet = `
  // قراءة رابط التصنيف المباشر عند بدء الفتح
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        handleSelectCategory(cat);
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);
`;

if (!mainCode.includes("params.get('category')")) {
  mainCode = mainCode.replace(/export function MainPublicApp[^{]*\{/, match => match + routerSnippet);
  fs.writeFileSync('src/MainPublicApp.tsx', mainCode, 'utf8');
  console.log('✅ تم تفعيل مستمع رابط التصنيفات في MainPublicApp.tsx');
}

// 4️⃣ الرفع المباشر إلى GitHub
console.log('🚀 جاري الرفع إلى GitHub...');
execSync('git add src/components/category/CategoryListing.tsx src/components/business/BusinessDetails.tsx src/MainPublicApp.tsx');
execSync('git commit -m "feat: complete unified collective and individual templates with live supabase and ads"');
execSync('git push origin main');
console.log('🎉 تم بنجاح! تم بناء القالبين ورفعهما للإنتاج على Vercel.');
