import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { CommunitySection, getSectionIcon } from '../../services/sectionsService';
import { AdBanner } from './AdBanner';
import { MarketSponsorSlot } from '../ads/MarketSponsorSlot';
import {
  XSearchFilterBar,
  XFilterModal,
  XMarketTweetCard,
  XMarketDetailView,
  XImageLightbox,
  XMarketItem,
  YEMEN_GOV_FILTER_OPTIONS,
} from './XMarketUI';

interface CustomSectionViewProps {
  section?: CommunitySection;
  tweets?: any[];
  onOpenRoute: (path: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث أولاً' },
  { value: 'oldest', label: 'الأقدم أولاً' },
  { value: 'popular', label: 'الأكثر تفاعلاً' },
];

export const CustomSectionView: React.FC<CustomSectionViewProps> = ({
  section,
  tweets = [],
  onOpenRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);

  const label = section?.label || 'قسم';
  const sectionKey = section?.id || 'custom';
  const SecIcon = getSectionIcon(section?.iconName);

  const activeFiltersCount =
    (cityFilter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  const sectionItems = useMemo(() => {
    const cleanTag = label.replace(/\s+/g, '_').toLowerCase();
    const labelLower = label.toLowerCase();
    const idLower = sectionKey.toLowerCase();

    const matched = tweets.filter((t) => {
      const text = String(t?.text || '').toLowerCase();
      return (
        text.includes(`#${labelLower}`) ||
        text.includes(`#${cleanTag}`) ||
        (idLower && text.includes(`#${idLower}`))
      );
    });

    const filtered = matched.filter((t) => {
      const text = String(t?.text || '').toLowerCase();
      const author = String(t?.authorName || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || text.includes(q) || author.includes(q);
      const matchCity =
        cityFilter === 'all' ||
        text.includes(cityFilter.toLowerCase()) ||
        String(t?.city || '').includes(cityFilter);
      return matchSearch && matchCity;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'popular') return (b?.likes || 0) - (a?.likes || 0);
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return sortBy === 'oldest' ? ta - tb : tb - ta;
    });

    return filtered;
  }, [tweets, label, sectionKey, searchQuery, cityFilter, sortBy]);

  const toMarketItem = (t: any): XMarketItem => {
    const imgs: string[] = [];
    if (Array.isArray(t?.images)) imgs.push(...t.images.filter(Boolean));
    else if (t?.image) imgs.push(t.image);

    const textStr = String(t?.text || '');
    const firstLine = textStr.split('\n')[0]?.trim() || label;
    return {
      id: String(t?.id || Math.random()),
      detailPath: `/post/${t?.id || ''}/engagements`,
      actionLabel: 'عرض المنشور',
      authorName: t?.authorName || 'مستخدم',
      authorUsername: t?.authorUsername || 'user',
      authorAvatar: t?.authorAvatar,
      badgeType: t?.badgeType || t?.authorBadge,
      createdAt: t?.createdAt,
      title: firstLine.slice(0, 80),
      description: textStr,
      metaParts: [label],
      tagLabel: label,
      images: imgs,
      city: t?.city,
    };
  };

  const handleShare = async (item: XMarketItem) => {
    const shareUrl = `${window.location.origin}${item.detailPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.description || item.title, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {}
  };

  if (selectedItem) {
    return (
      <>
        <XMarketDetailView
          item={selectedItem}
          activeImageIndex={activeImageIndex}
          onChangeImageIndex={setActiveImageIndex}
          onBack={() => setSelectedItem(null)}
          onOpenLightbox={() => setIsLightboxOpen(true)}
          onShare={() => handleShare(selectedItem)}
        />
        <XImageLightbox
          isOpen={isLightboxOpen}
          item={selectedItem}
          activeIndex={activeImageIndex}
          onChangeIndex={setActiveImageIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      </>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white">
      <MarketSponsorSlot section="community" />

      <div className="px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40">
        {(section?.description || section?.targetRoute) && (
          <div className="flex items-center justify-between gap-2 pb-1">
            <p className="text-[11px] text-[#71767B] truncate">
              {section?.description || label}
            </p>
            {section?.targetRoute && (
              <button
                type="button"
                onClick={() => onOpenRoute(section.targetRoute!)}
                className="px-3 py-1 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-[11px] font-black flex items-center gap-1 shrink-0 transition cursor-pointer"
              >
                <span>فتح</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>
        )}

        <XSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={`ابحث في ${label}...`}
          activeFiltersCount={activeFiltersCount}
          onOpenFilter={() => setShowFilterModal(true)}
          sectionIcon={<SecIcon size={18} className="text-[#FFC500]" />}
        />
      </div>

      <div className="max-w-3xl mx-auto px-0 pb-24 divide-y divide-[#2F3336]/40">
        <div className="bg-black">
          <AdBanner section="community" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
        </div>
        <div className="bg-black">
          <AdBanner
            section="community"
            slot="slot_2"
            enabled={slot1AdId !== undefined}
            excludeAdIds={slot1AdId ? [slot1AdId] : []}
            className="!my-0 border-x-0"
          />
        </div>

        {sectionItems.length === 0 ? (
          <div className="text-center py-16 px-4 text-[#71767B] text-xs space-y-1.5">
            <p className="font-bold text-white text-sm">
              {searchQuery || activeFiltersCount > 0 ? 'لا توجد نتائج مطابقة' : 'لا توجد منشورات حديثة'}
            </p>
            <p>
              {searchQuery || activeFiltersCount > 0
                ? 'جرّب البحث بكلمة أخرى أو تصفير الفلاتر.'
                : 'اضغط (+) لنشر أول إعلان أو تغريدة'}
            </p>
          </div>
        ) : (
          sectionItems.map((t) => {
            const item = toMarketItem(t);
            return (
              <XMarketTweetCard
                key={item.id}
                item={item}
                onOpenDetail={() => {
                  setActiveImageIndex(0);
                  setSelectedItem(item);
                }}
                onOpenImage={(idx) => {
                  setActiveImageIndex(idx);
                  setSelectedItem(item);
                  setIsLightboxOpen(true);
                }}
                onShare={() => handleShare(item)}
              />
            );
          })
        )}
      </div>

      <XFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={`فلترة ${label}`}
        activeFiltersCount={activeFiltersCount}
        onReset={() => {
          setCityFilter('all');
          setSortBy('newest');
        }}
        resultsCount={sectionItems.length}
        fields={[
          {
            label: 'المحافظة / المدينة',
            value: cityFilter,
            options: YEMEN_GOV_FILTER_OPTIONS,
            onChange: setCityFilter,
          },
          {
            label: 'ترتيب العرض',
            value: sortBy,
            options: SORT_OPTIONS,
            onChange: setSortBy,
          },
        ]}
      />
    </div>
  );
};
