import React from 'react';
import { Building2, MapPin, CheckCircle2, Phone, Mail, Globe, Share2, Bookmark, Flame } from 'lucide-react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BusinessScore } from './BusinessScore';
import { yrToast } from '../ui/Toast';

export const BusinessHeader: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `اكتشف ${business.name} على منصة يمن ريتغ (YR)`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      yrToast.success('تم نسخ الرابط بنجاح');
    }
  };

  const handleFavorite = () => {
    yrToast.info('تمت الإضافة إلى المفضلة');
  };

  return (
    <Card className="p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[14px] bg-[#0B1F3A]/5 border border-[#E2E8F0] flex items-center justify-center text-[#0B1F3A] font-bold shrink-0 shadow-sm">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <Building2 size={36} strokeWidth={1.5} />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" size="sm">{business.category}</Badge>
              {business.isTrending && (
                <Badge variant="yellow" size="sm" className="gap-1">
                  <Flame size={12} />
                  YR Trend
                </Badge>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-[#0B1F3A] flex items-center gap-2">
              <span>{business.name}</span>
              {business.isVerified && (
                <CheckCircle2 size={20} className="text-[#16A34A] shrink-0" strokeWidth={2.5} title="موثق رسمياً" />
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-1.5">
              <MapPin size={15} className="text-[#94A3B8] shrink-0" />
              <span>{business.city}</span>
              {business.address && <span>— {business.address}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-[#F1F5F9]">
          <BusinessScore score={business.yrScore} size="lg" showLabel={true} />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              icon={<Share2 size={15} strokeWidth={1.75} />}
              title="مشاركة"
            >
              مشاركة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              icon={<Bookmark size={15} strokeWidth={1.75} />}
              title="حفظ"
            >
              حفظ
            </Button>
          </div>
        </div>
      </div>

      {(business.phone || business.email || business.website) && (
        <div className="flex flex-wrap items-center gap-3 pt-4 mt-5 border-t border-[#F1F5F9] text-xs">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] text-[#0B1F3A] font-semibold hover:bg-[#E2E8F0] transition-colors"
            >
              <Phone size={14} className="text-[#16A34A]" />
              <span dir="ltr">{business.phone}</span>
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] text-[#0B1F3A] font-semibold hover:bg-[#E2E8F0] transition-colors"
            >
              <Mail size={14} className="text-[#2563EB]" />
              <span>{business.email}</span>
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F7F8FA] text-[#0B1F3A] font-semibold hover:bg-[#E2E8F0] transition-colors"
            >
              <Globe size={14} className="text-[#0B1F3A]" />
              <span>الموقع الإلكتروني</span>
            </a>
          )}
        </div>
      )}
    </Card>
  );
};
