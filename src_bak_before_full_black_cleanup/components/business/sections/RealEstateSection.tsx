import React from 'react';
import { BusinessItem } from '../../../types/business';
import { Card } from '../../ui/Card';
import { Home, MapPin, Tag, Layers, BedDouble, Bath } from 'lucide-react';

export const RealEstateSection: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const listings = business.realEstateListings || [];
  if (listings.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {listings.map((prop) => (
          <Card key={prop.id} noPadding className="overflow-hidden bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px]">
            <div className="relative h-[130px] w-full overflow-hidden bg-[#1A1A1A]">
              <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[6px] bg-black/75 text-white text-[10px] font-extrabold">
                {prop.dealType === 'بيع' ? 'للبيع' : 'للإيجار'}
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] bg-[#F5C400] text-black text-xs font-black">
                {prop.price}
              </div>
            </div>

            <div className="p-3.5 space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white line-clamp-1">
                {prop.title}
              </h4>

              <div className="flex items-center gap-3 text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
                <span className="flex items-center gap-1"><Layers size={12} className="text-[#F5C400]" /> {prop.areaM2} م²</span>
                {prop.rooms && <span className="flex items-center gap-1"><BedDouble size={12} className="text-[#F5C400]" /> {prop.rooms} غرف</span>}
                {prop.bathrooms && <span className="flex items-center gap-1"><Bath size={12} className="text-[#F5C400]" /> {prop.bathrooms} حمام</span>}
              </div>

              <div className="text-[10px] text-[#94A3B8] dark:text-[#71717A] flex items-center gap-1 pt-1 border-t border-[#F1F5F9] dark:border-[#1E1E1E]">
                <MapPin size={11} className="text-[#F5C400]" />
                <span className="truncate">{prop.location}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
