import React from 'react';
import { AdItem } from '../../types/ads';
import { ExternalLink, Video } from 'lucide-react';
import { Card } from '../ui/Card';

interface YrAdBannerProps {
  ad: AdItem;
  className?: string;
}

export const YrAdBanner: React.FC<YrAdBannerProps> = ({ ad, className }) => {
  return (
    <div className={`space-y-1 my-3 ${className || ''}`}>
      {/* Sponsored Tag */}
      <div className="flex items-center justify-between px-1 text-[10px] font-bold text-[#71717A]">
        <span>إعلان ممول · برعاية {ad.advertiserName}</span>
        <span className="text-[#F5C400]">YR Ads</span>
      </div>

      {/* Ad Card Banner */}
      <Card
        hoverable
        noPadding
        onClick={() => window.open(ad.targetUrl, '_blank')}
        className="overflow-hidden rounded-[12px] bg-[#0A0A0A] border border-[#222222] cursor-pointer group shadow-md"
      >
        <div className="relative h-[120px] sm:h-[150px] w-full overflow-hidden bg-black">
          <img
            src={ad.thumbnailUrl || ad.mediaUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {ad.type === 'video' && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-[#F5C400] flex items-center justify-center">
              <Video size={14} />
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
            <h4 className="font-bold text-xs truncate max-w-[80%]">{ad.title}</h4>
            <span className="p-1 rounded-full bg-[#F5C400] text-black">
              <ExternalLink size={12} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
