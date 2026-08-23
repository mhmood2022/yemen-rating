import React from 'react';
import { AdItem } from '../../types/ads';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExternalLink } from 'lucide-react';

interface AdPreviewModalProps {
  ad: AdItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdPreviewModal: React.FC<AdPreviewModalProps> = ({ ad, isOpen, onClose }) => {
  if (!ad) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`معاينة الإعلان: ${ad.title}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-right">
        <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#0E0E0E] border border-[#E2E8F0] dark:border-[#222222] text-xs">
          <div>
            <span className="text-[#64748B] dark:text-[#71717A] block">المعلن:</span>
            <span className="font-black text-[#0B1F3A] dark:text-white">{ad.advertiserName}</span>
          </div>

          <div className="text-left">
            <span className="text-[#64748B] dark:text-[#71717A] block">النوع والمكان:</span>
            <span className="font-bold text-[#F5C400]">{ad.type} · {ad.placements.join(', ')}</span>
          </div>
        </div>

        <div className="rounded-[14px] overflow-hidden border border-[#E2E8F0] dark:border-[#262626] bg-black p-2 text-center">
          <span className="text-[10px] text-[#A1A1AA] block mb-2 font-bold">
            [ معاينة الشكل الفعلي للمستخدم ]
          </span>

          {ad.type === 'video' ? (
            <div className="relative rounded-[10px] overflow-hidden max-h-[300px] bg-black">
              <video
                src={ad.mediaUrl}
                controls
                autoPlay
                muted
                className="w-full h-full max-h-[280px] object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="relative rounded-[10px] overflow-hidden max-h-[260px] bg-[#0A0A0A]">
              <img
                src={ad.mediaUrl}
                alt={ad.title}
                className="w-full h-full max-h-[250px] object-contain mx-auto"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0E0E0E] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">مرات الظهور</span>
            <span className="font-black text-sm text-[#0B1F3A] dark:text-white">{ad.impressions.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0E0E0E] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">النقرات</span>
            <span className="font-black text-sm text-[#F5C400]">{ad.clicks.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0E0E0E] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">نسبة التفاعل CTR</span>
            <span className="font-black text-sm text-[#16A34A] dark:text-[#22C55E]">{ad.ctr}%</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs">
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#F5C400] font-bold hover:underline flex items-center gap-1"
          >
            <span>رابط الوجهة: {ad.targetUrl}</span>
            <ExternalLink size={13} />
          </a>

          <Button variant="outline" size="sm" onClick={onClose}>
            إغلاق المعاينة
          </Button>
        </div>
      </div>
    </Modal>
  );
};
