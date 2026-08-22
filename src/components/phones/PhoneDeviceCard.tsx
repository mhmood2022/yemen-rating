import React from 'react';
import { Smartphone, Store, ShieldCheck, MapPin, ArrowLeft, Tag } from 'lucide-react';
import { PhoneDeviceItem } from '../../types/phones';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PhoneDeviceCardProps {
  device: PhoneDeviceItem;
  onNavigate?: (path: string) => void;
}

export const PhoneDeviceCard: React.FC<PhoneDeviceCardProps> = ({ device, onNavigate }) => {
  return (
    <Card
      hoverable
      noPadding
      onClick={() => onNavigate && onNavigate(`/business/${device.storeId}`)}
      className="overflow-hidden rounded-[14px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
    >
      {/* Device Image Cover */}
      <div className="relative h-[130px] sm:h-[150px] w-full overflow-hidden bg-[#F7F8FA] dark:bg-[#181818]">
        <img
          src={device.imageUrl}
          alt={device.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Condition Tag */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[6px] bg-black/70 backdrop-blur-[2px] text-white flex items-center gap-1 text-[10px] font-extrabold border border-white/10">
          <Tag size={10} className="text-[#F5C400]" />
          <span>{device.condition === 'new' ? 'جديد مختوم' : device.condition === 'used' ? 'مستخدم نظيف' : 'خدمة صيانة'}</span>
        </div>

        {/* Offer Tag */}
        {device.isOffer && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] bg-[#EF4444] text-white text-[10px] font-black shadow-sm">
            عرض خاص
          </div>
        )}
      </div>

      {/* Device Details Body */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#A1A1AA] mb-1">
            <span className="font-bold text-[#F5C400]">{device.brand}</span>
            {device.storage && <span>{device.storage}</span>}
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-snug line-clamp-1">
            {device.name}
          </h3>

          {/* Pricing Box for Sanaa & Aden */}
          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] my-2 text-center text-[10px]">
            <div>
              <span className="text-[#64748B] dark:text-[#71717A] block">صنعاء</span>
              <span className="font-black text-[#0B1F3A] dark:text-white block text-xs">
                {device.priceSanaa.toLocaleString()} <small className="text-[9px] font-normal">ريال</small>
              </span>
            </div>
            <div className="border-r border-[#E2E8F0] dark:border-[#1E1E1E] pr-1.5">
              <span className="text-[#64748B] dark:text-[#71717A] block">عدن</span>
              <span className="font-black text-[#0B1F3A] dark:text-[#F5C400] block text-xs">
                {device.priceAden.toLocaleString()} <small className="text-[9px] font-normal">ريال</small>
              </span>
            </div>
          </div>
        </div>

        {/* Store & City */}
        <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#1E1E1E] flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] dark:text-[#A1A1AA] truncate flex items-center gap-1">
            <Store size={12} className="text-[#F5C400] shrink-0" />
            <span className="truncate">{device.storeName}</span>
          </span>

          <span className="flex items-center gap-0.5 text-[#94A3B8] dark:text-[#71717A] shrink-0">
            <MapPin size={11} />
            <span>{device.city}</span>
          </span>
        </div>
      </div>
    </Card>
  );
};
