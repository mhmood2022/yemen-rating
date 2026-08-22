import React from 'react';
import { BusinessItem } from '../../../types/business';
import { Card } from '../../ui/Card';
import { Car, Gauge, Fuel, Cog } from 'lucide-react';

export const CarDealerSection: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const cars = business.carListings || [];
  if (cars.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {cars.map((car) => (
          <Card key={car.id} noPadding className="overflow-hidden bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px]">
            <div className="relative h-[130px] w-full overflow-hidden bg-[#1A1A1A]">
              <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[6px] bg-black/75 text-white text-[10px] font-extrabold">
                {car.condition} · {car.year}
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] bg-[#F5C400] text-black text-xs font-black">
                {car.price}
              </div>
            </div>

            <div className="p-3.5 space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white line-clamp-1">
                {car.title}
              </h4>

              <div className="grid grid-cols-3 gap-1 text-[10px] text-[#64748B] dark:text-[#A1A1AA] pt-1 border-t border-[#F1F5F9] dark:border-[#1E1E1E]">
                <span className="flex items-center gap-1"><Cog size={11} className="text-[#F5C400]" /> {car.transmission}</span>
                <span className="flex items-center gap-1"><Fuel size={11} className="text-[#F5C400]" /> {car.fuelType}</span>
                {car.mileageKm && <span className="flex items-center gap-1"><Gauge size={11} className="text-[#F5C400]" /> {car.mileageKm.toLocaleString()} كم</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
