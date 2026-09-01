import React, { useState, useRef } from 'react';
import { 
  Building, MapPin, ArrowRight, Check, Camera, 
  X, Phone, MessageCircle, Lock, Unlock, User, Sparkles
} from 'lucide-react';
import { PropertyEntity } from '../../types/schema.types';
import { PropertyService } from '../../services/platformServices';
import { AdBanner } from '../../components/common/AdBanner';

export const PropertyDetailsPage: React.FC<{
  propertyData?: PropertyEntity;
  onBack?: () => void;
}> = ({
  propertyData = PropertyService.getDemoRecord(),
  onBack = () => window.history.back()
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isContactRevealed, setIsContactRevealed] = useState(false);
  const gallery = propertyData.media.filter(m => m.media_type === 'image');

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-2 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="5" className="mb-1" />

      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
          <ArrowRight size={13} className="rtl:rotate-180" />
          <span>الرجوع للعقارات</span>
        </button>
      </div>

      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] overflow-hidden shadow-2xl">
        <div 
          className="relative h-56 sm:h-80 w-full bg-[#161619] overflow-hidden cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={gallery[activeImageIndex]?.file_url} alt={propertyData.title} className="w-full h-full object-cover" />
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-black shadow-md ${
            propertyData.listing_type === 'sale' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
          }`}>
            {propertyData.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
          </span>
          <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/85 text-[#FFC500] text-sm font-mono font-black border border-[#FFC500]/30 backdrop-blur-md">
            {propertyData.price.toLocaleString()} {propertyData.currency} {propertyData.listing_type === 'rent' ? '/ شهرياً' : ''}
          </span>
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-1.5 p-2 bg-[#121215] border-t border-[#1F2937] overflow-x-auto no-scrollbar">
            {gallery.map((img, idx) => (
              <button key={img.id || idx} onClick={() => setActiveImageIndex(idx)} className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[#FFC500]' : 'border-transparent opacity-60'}`}>
                <img src={img.file_url} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">{propertyData.property_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-[#FFC500]" /> {propertyData.city_name}</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white leading-snug">{propertyData.title}</h1>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">المساحة</span><b className="text-xs text-white font-bold">{propertyData.area} م²</b></div>
            <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">الغرف</span><b className="text-xs text-white font-bold">{propertyData.bedrooms || '—'}</b></div>
            <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A]"><span className="text-[9px] text-zinc-400 font-['Cairo'] block">الحمامات</span><b className="text-xs text-white font-bold">{propertyData.bathrooms || '—'}</b></div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white">تفاصيل ومواصفات العقار:</h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{propertyData.description}</p>
          </div>

          {/* صندوق كشف بيانات التواصل المحمي والوساطة */}
          <div className="bg-[#161619] p-4 rounded-xl border border-[#27272A] space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <User size={14} className="text-[#FFC500]" />
                <span>الناشر: {propertyData.publisher_name}</span>
              </div>
            </div>

            {isContactRevealed ? (
              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <Unlock size={14} className="text-[#16A34A]" />
                  <span>{propertyData.publisher_phone}</span>
                </div>
                <div className="flex gap-1.5">
                  <a href={`https://wa.me/${propertyData.publisher_phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-xs font-bold flex items-center gap-1">
                    <MessageCircle size={13} />
                    <span>واتساب</span>
                  </a>
                  <a href={`tel:${propertyData.publisher_phone}`} className="p-1.5 rounded-lg bg-[#18181C] text-white border border-[#27272A]">
                    <Phone size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsContactRevealed(true)}
                className="w-full py-3 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock size={14} />
                <span>طلب كشف الرقم وحجز معاينة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
