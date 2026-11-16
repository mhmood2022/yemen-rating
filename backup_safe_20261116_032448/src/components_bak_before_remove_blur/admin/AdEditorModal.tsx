import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { AdItem, AdPlacement, AdStatus, AdType } from '../../types/ads';
import { useAdmin } from '../../context/AdminContext';
import { Megaphone, Link, Calendar, DollarSign, Image } from 'lucide-react';

interface AdEditorModalProps {
  ad: AdItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdEditorModal: React.FC<AdEditorModalProps> = ({ ad, isOpen, onClose }) => {
  const { saveAd } = useAdmin();

  const [title, setTitle] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [type, setType] = useState<AdType>('banner');
  const [placement, setPlacement] = useState<AdPlacement>('home_top');
  const [status, setStatus] = useState<AdStatus>('published');
  const [mediaUrl, setMediaUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [budget, setBudget] = useState('$300');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-09-30');

  useEffect(() => {
    if (ad) {
      setTitle(ad.title);
      setAdvertiserName(ad.advertiserName);
      setType(ad.type);
      setPlacement(ad.placements[0] || 'home_top');
      setStatus(ad.status);
      setMediaUrl(ad.mediaUrl);
      setTargetUrl(ad.targetUrl);
      setBudget(ad.budget || '$300');
      setStartDate(ad.startDate);
      setEndDate(ad.endDate);
    } else {
      setTitle('');
      setAdvertiserName('');
      setType('banner');
      setPlacement('home_top');
      setStatus('published');
      setMediaUrl('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80');
      setTargetUrl('https://yemenrating.com');
      setBudget('$300');
    }
  }, [ad, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave: AdItem = {
      id: ad ? ad.id : `ad_${Date.now()}`,
      title: title.trim(),
      advertiserName: advertiserName.trim(),
      type,
      placements: [placement],
      status,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: mediaUrl.trim(),
      targetUrl: targetUrl.trim(),
      budget: budget.trim(),
      startDate,
      endDate,
      impressions: ad ? ad.impressions : 0,
      clicks: ad ? ad.clicks : 0,
      ctr: ad ? ad.ctr : 0,
      createdAt: ad ? ad.createdAt : new Date().toISOString().split('T')[0],
    };

    saveAd(itemToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ad ? `تعديل إعلان: ${ad.title}` : 'إنشاء حملة إعلانية جديدة (YR Ads)'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
        <Input
          label="عنوان الحملة الإعلانية"
          placeholder="مثال: عرض الصيف لمحفظة جيب كاش باك"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rightIcon={<Megaphone size={16} />}
        />

        <Input
          label="اسم الجهة المعلنة / النشاط"
          placeholder="مثال: بنك الكريمي / متجر العصرية"
          required
          value={advertiserName}
          onChange={(e) => setAdvertiserName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Select
            label="نوع الإعلان"
            value={type}
            options={[
              { label: 'إعلان بانر (Banner)', value: 'banner' },
              { label: 'إعلان فيديو (Video Ad)', value: 'video' },
              { label: 'إعلان متجاوب للهاتف (Mobile)', value: 'mobile_banner' },
              { label: 'إعلان سطح مكتب (Desktop)', value: 'desktop_leaderboard' },
            ]}
            onChange={(val) => setType(val as any)}
          />

          <Select
            label="مكان الظهور على المنصة"
            value={placement}
            options={[
              { label: 'الصفحة الرئيسية (Home Top)', value: 'home_top' },
              { label: 'منتصف الصفحة الرئيسية (Home Middle)', value: 'home_middle' },
              { label: 'سوق الوظائف (Jobs Page)', value: 'jobs_page' },
              { label: 'صفحة الأسعار (Prices Page)', value: 'prices_page' },
              { label: 'دليل الأنشطة (Directory)', value: 'directory_sidebar' },
              { label: 'صفحات الأنشطة (Business Profiles)', value: 'business_profile' },
            ]}
            onChange={(val) => setPlacement(val as any)}
          />
        </div>

        <Input
          label="رابط ملف الصورة / الفيديو"
          type="url"
          required
          placeholder="https://..."
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          rightIcon={<Image size={16} />}
        />

        <Input
          label="رابط الوجهة عند النقر (Target URL)"
          type="url"
          required
          placeholder="https://..."
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          rightIcon={<Link size={16} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Input
            label="الميزانية"
            placeholder="$500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <Input
            label="تاريخ البداية"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="تاريخ النهاية"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Select
          label="حالة الحملة الإعلانية"
          value={status}
          options={[
            { label: 'منشور ومفعل فوراً', value: 'published' },
            { label: 'مجدول لتاريخ لاحق', value: 'scheduled' },
            { label: 'مسودة (غير مفعل)', value: 'draft' },
            { label: 'متوقف مؤقتاً', value: 'paused' },
          ]}
          onChange={(val) => setStatus(val as any)}
        />

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
          <Button type="submit" variant="primary" fullWidth className="font-bold">
            {ad ? 'حفظ التعديلات' : 'نشر وتأكيد الحملة'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
