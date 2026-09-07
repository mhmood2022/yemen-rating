import React, { useState, useEffect, useMemo } from 'react';
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
          query = query.or(`category_id.eq.${catRow.id},category_id.eq.${categorySlug}`);
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
            href={`tel:${item.phone}`} 
            className="flex-1 text-center py-2.5 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" /> اتصال
          </a>
        )}

        {(item.whatsapp || item.phone) && (
          <a 
            href={`https://wa.me/${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}`} 
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
