import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, BedDouble, Building2, ArrowLeft } from 'lucide-react';

export interface PropertyCardData {
  id: string;
  title: string;
  property_type: string;
  deal_type: string;
  price: number;
  currency?: string;
  city: string;
  area_m2?: number;
  rooms?: number;
  images?: string[];
  status: string;
}

interface PropertyCardProps {
  property: PropertyCardData | any;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const isSale = property.deal_type === 'بيع' || property.dealType === 'بيع';
  const mainImage = (property.images && property.images.length > 0) ? property.images[0] : null;

  return (
    <div className="flex flex-col bg-[#162238] border border-slate-700/60 hover:border-[#D4AF37]/60 rounded-xl overflow-hidden shadow-lg transition-all duration-300 font-['Cairo']">
      <div className="relative w-full h-44 bg-[#0B1325] overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Building2 className="w-12 h-12 text-[#D4AF37]/40" />
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
            isSale 
              ? 'bg-[#D4AF37] text-[#0B1325]' 
              : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
          }`}>
            {property.deal_type || property.dealType || 'متاح'}
          </span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#0B1325]/80 text-white border border-slate-700 backdrop-blur-sm">
            {property.property_type || property.propertyType}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
            {property.title}
          </h3>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{property.city}</span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            {(property.area_m2 || property.area) ? (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{property.area_m2 || property.area} م²</span>
              </div>
            ) : null}
            {property.rooms ? (
              <div className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                <span>{property.rooms} غرف</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">القيمة المعروضة</span>
            <span className="text-sm font-bold text-[#D4AF37]">
              {property.price ? `${property.price.toLocaleString()} ${property.currency || 'YER'}` : 'السعر عند المعاينة'}
            </span>
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0B1325] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] text-xs font-bold rounded-lg transition-colors"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
