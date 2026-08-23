import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdItem, AdStatus } from '../../types/ads';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { AdPreviewModal } from '../../components/admin/AdPreviewModal';
import { AdEditorModal } from '../../components/admin/AdEditorModal';
import {
  Megaphone,
  Eye,
  Edit,
  Play,
  Pause,
  Copy,
  Trash2,
  Video,
  FolderOpen,
  Plus,
} from 'lucide-react';

export const AdminAdsView: React.FC = () => {
  const { ads, adMedia, publishAd, pauseAd, deleteAd, duplicateAd } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'ads' | 'gallery'>('ads');
  const [previewAd, setPreviewAd] = useState<AdItem | null>(null);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const renderStatusBadge = (status: AdStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="success" size="sm">منشور نشط</Badge>;
      case 'paused':
        return <Badge variant="warning" size="sm">متوقف مؤقتاً</Badge>;
      case 'scheduled':
        return <Badge variant="info" size="sm">مجدول</Badge>;
      case 'draft':
        return <Badge variant="neutral" size="sm">مسودة</Badge>;
      default:
        return <Badge variant="danger" size="sm">منتهي</Badge>;
    }
  };

  const filteredAds = ads.filter((ad) => {
    if (filterType !== 'all' && ad.type !== filterType) return false;
    if (filterStatus !== 'all' && ad.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ad.title.toLowerCase().includes(q) || ad.advertiserName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5 text-right">
      {/* Header with Create Ad Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222222]">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Megaphone size={18} strokeWidth={2} className="text-[#F5C400]" />
            <span>مركز التحكم الكامل بالإعلانات (YR Ads Control Center)</span>
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            إدارة كافة الحملات الإعلانية (فيديو، بانرات، متجاوب)، المعاينة الحية، والتحكم بأماكن الظهور.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus size={14} strokeWidth={2.5} />}
            className="font-bold"
          >
            إضافة إعلان جديد
          </Button>

          <div className="flex items-center gap-1 p-0.5 rounded-[8px] bg-[#141414] border border-[#222222]">
            <Button
              variant={activeTab === 'ads' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ads')}
              className="text-xs font-bold h-7 px-2.5"
            >
              الإعلانات ({ads.length})
            </Button>

            <Button
              variant={activeTab === 'gallery' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('gallery')}
              className="text-xs font-bold h-7 px-2.5"
            >
              المعرض ({adMedia.length})
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'ads' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-6">
              <SearchInput
                placeholder="ابحث باسم الإعلان أو اسم المعلن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterType}
                options={[
                  { label: 'جميع الأنواع', value: 'all' },
                  { label: 'إعلان فيديو', value: 'video' },
                  { label: 'إعلان بانر', value: 'banner' },
                  { label: 'إعلان متجاوب للهاتف', value: 'mobile_banner' },
                  { label: 'إعلان سطح مكتب', value: 'desktop_leaderboard' },
                ]}
                onChange={setFilterType}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterStatus}
                options={[
                  { label: 'جميع الحالات', value: 'all' },
                  { label: 'منشور نشط', value: 'published' },
                  { label: 'متوقف مؤقتاً', value: 'paused' },
                  { label: 'مجدول', value: 'scheduled' },
                  { label: 'مسودة', value: 'draft' },
                ]}
                onChange={setFilterStatus}
              />
            </div>
          </div>

          {/* Ads List Cards */}
          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Media Thumbnail & Meta */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    onClick={() => setPreviewAd(ad)}
                    className="w-20 h-14 rounded-[8px] bg-black overflow-hidden shrink-0 relative cursor-pointer group"
                  >
                    <img src={ad.thumbnailUrl || ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {ad.type === 'video' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[#F5C400]">
                        <Video size={16} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(ad.status)}
                      <span className="text-[10px] text-[#A1A1AA] font-bold">مكان الظهور: {ad.placements.join(', ')}</span>
                    </div>

                    <h3 className="font-black text-sm text-white truncate">{ad.title}</h3>
                    <p className="text-xs text-[#A1A1AA] truncate">المعلن: <strong className="text-white">{ad.advertiserName}</strong> · الميزانية: {ad.budget || 'غير محدد'}</p>
                  </div>
                </div>

                {/* Metrics + Complete Control Buttons Suite */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#1C1C1C]">
                  <div className="text-center px-3 border-l border-[#1E1E1E]">
                    <span className="text-[10px] text-[#71717A] block font-semibold">ظهور / نقرات</span>
                    <span className="text-xs font-black text-white">{ad.impressions.toLocaleString()} / <strong className="text-[#F5C400]">{ad.clicks.toLocaleString()}</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewAd(ad)}
                      icon={<Eye size={13} />}
                      title="معاينة الإعلان"
                      className="h-8 px-2"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAd(ad)}
                      icon={<Edit size={13} />}
                      title="تعديل الحملة"
                      className="h-8 px-2"
                    />

                    {ad.status === 'published' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pauseAd(ad.id)}
                        icon={<Pause size={13} className="text-[#F59E0B]" />}
                        title="إيقاف مؤقت"
                        className="h-8 px-2"
                      />
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => publishAd(ad.id)}
                        icon={<Play size={13} />}
                        title="نشر وتفعيل"
                        className="h-8 px-2"
                      />
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateAd(ad.id)}
                      icon={<Copy size={13} />}
                      title="نسخ"
                      className="h-8 px-2"
                    />

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteAd(ad.id)}
                      icon={<Trash2 size={13} />}
                      title="حذف"
                      className="h-8 px-2"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Gallery */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {adMedia.map((media) => (
            <Card key={media.id} className="p-3 bg-[#111111] border border-[#222222] rounded-[12px] space-y-2">
              <div className="h-32 rounded-[8px] overflow-hidden bg-black relative">
                <img src={media.thumbnailUrl || media.mediaUrl} alt={media.fileName} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">{media.fileType} · {media.fileSize}</span>
              </div>
              <div>
                <h4 className="font-bold text-xs text-white truncate">{media.fileName}</h4>
                <p className="text-[10px] text-[#A1A1AA] truncate">الارتباط: {media.associatedAdTitle || 'غير مرتبط'}</p>
                <span className="text-[9px] text-[#71717A] block mt-1">تاريخ الرفع: {media.uploadedAt}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Live Preview Modal */}
      <AdPreviewModal
        ad={previewAd}
        isOpen={Boolean(previewAd)}
        onClose={() => setPreviewAd(null)}
      />

      {/* Create / Edit Ad Modal */}
      <AdEditorModal
        ad={editingAd}
        isOpen={isCreateOpen || Boolean(editingAd)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingAd(null);
        }}
      />
    </div>
  );
};
