import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  fetchUnifiedBusinessTaxonomy,
  UnifiedTaxonomyCategory,
} from '../../constants/businessTaxonomy';
import { MarketSponsorSlot } from '../ads/MarketSponsorSlot';
import { AdBanner } from '../common/AdBanner';
import { InstitutionalBusinessCard } from '../business/InstitutionalBusinessCard';
import { XSpinner } from '../ui/LoadingSpinner';

export const CommunityBusinessesDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [taxAllSubs, setTaxAllSubs] = useState<UnifiedTaxonomyCategory[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Map<string, { avg: number; count: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [bizRes, revRes, tax] = await Promise.all([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }),
          supabase.from('reviews').select('entity_id, stars').neq('is_hidden', true),
          fetchUnifiedBusinessTaxonomy(),
        ]);

        if (!active) return;
        setBusinesses((bizRes.data || []).filter((b: any) => !b.is_hidden && String(b.status || '').toLowerCase() !== 'hidden'));
        setTaxAllSubs(tax.allSubs || []);

        const grouped = new Map<string, number[]>();
        (revRes.data || []).forEach((r: any) => {
          if (!r.entity_id) return;
          const s = Number(r.stars);
          if (s >= 1 && s <= 5) {
            const arr = grouped.get(r.entity_id) || [];
            arr.push(s);
            grouped.set(r.entity_id, arr);
          }
        });
        const map = new Map<string, { avg: number; count: number }>();
        grouped.forEach((arr, id) => {
          const count = arr.length;
          const avg = Number((arr.reduce((a, b) => a + b, 0) / count).toFixed(1));
          map.set(id, { avg, count });
        });
        setReviewsMap(map);
      } catch (err) {
        console.error('CommunityBusinessesDirectory load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => {
      const catObj = taxAllSubs.find((x) => x.id === b.category_id);
      const hay = [
        b.name,
        b.description,
        b.city,
        b.address,
        catObj?.name,
        catObj?.short_name,
        b.sub_category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [businesses, searchQuery, taxAllSubs]);

  return (
    <div className="bg-black text-white pb-16" dir="rtl">
      <MarketSponsorSlot section="businesses" />

      <div className="px-3 pt-2.5 pb-2.5 border-b border-[#2F3336]/60 bg-black flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71767B] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في دليل المنشآت..."
            className="w-full bg-[#16181C] border border-[#2F3336] focus:border-[#FFC500] rounded-full pr-10 pl-4 py-2 text-xs text-white placeholder-[#71767B] outline-none transition"
          />
        </div>
        <span className="px-3 py-1.5 rounded-full bg-[#16181C] border border-[#2F3336] text-[11px] font-bold text-[#FFC500] shrink-0">
          {filtered.length} منشأة
        </span>
      </div>

      <AdBanner section="businesses" slot="slot_1" className="!my-0 border-x-0" />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <XSpinner size={28} />
          <p className="text-xs text-[#71767B]">جاري تحميل المنشآت...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-4 text-center space-y-2">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">لا توجد منشآت مطابقة</p>
        </div>
      ) : (
        <div className="px-3 pt-3 space-y-4">
          {filtered.map((item) => {
            const liveRev = reviewsMap.get(item.id);
            const avg = Number(item.rating || 0) > 0 ? Number(item.rating) : (liveRev?.avg || 0);
            const cnt = Number(item.review_count || 0) > 0 ? Number(item.review_count) : (liveRev?.count || 0);
            const catObj = taxAllSubs.find((x) => x.id === item.category_id);
            const shortCat = catObj?.short_name || catObj?.name || item.sub_category;
            return (
              <InstitutionalBusinessCard
                key={item.id}
                business={item}
                categoryLabel={shortCat}
                categorySlug={catObj?.slug || ''}
                liveRating={avg}
                liveReviewCount={cnt}
                onOpen={() => navigate(`/business-page/${item.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
