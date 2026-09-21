import React from 'react';
import { 
  Building2, 
  MapPin, 
  Star, 
  Sparkles, 
  Settings2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { BusinessItem } from '@/types/owner';

interface Props {
  business: BusinessItem;
  onManage: (business: BusinessItem) => void;
  publicRoutePrefix?: string;
}

export const OwnerBusinessCard: React.FC<Props> = ({
  business,
  onManage,
  publicRoutePrefix = '/businesses',
}) => {
  const getStatusBadge = () => {
    switch (business.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            نشط في الدليل
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            قيد مراجعة الإدارة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <AlertCircle className="w-3.5 h-3.5" />
            غير نشط
          </span>
        );
    }
  };

  return (
    <div className="font-['Cairo'] bg-white rounded-2xl border border-zinc-200 shadow-xs hover:shadow-sm transition flex flex-col justify-between overflow-hidden">
      <div>
        <div className="relative h-40 bg-zinc-100 overflow-hidden">
          {business.cover_url || business.logo_url ? (
            <img
              src={business.cover_url || business.logo_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-400">
              <Building2 className="w-10 h-10 opacity-30 mb-1" />
              <span className="text-[11px]">لا توجد صورة</span>
            </div>
          )}

          <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1.5">
            {getStatusBadge()}
            {business.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
                مميزة
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-semibold">
              <Tag className="w-3 h-3" />
              {business.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {business.city}
            </span>
          </div>

          <h3 className="text-base font-black text-zinc-900 leading-snug line-clamp-1 mb-2">
            {business.name}
          </h3>

          <div className="flex items-center gap-4 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-zinc-800">
                {business.rating ? Number(business.rating).toFixed(1) : '0.0'}
              </span>
              <span className="text-zinc-400">({business.reviews_count || 0} تقييم)</span>
            </div>
          </div>
        </div>
      </div>

      {/* زران رئيسيان: إدارة المنشأة + عرض المنشأة بالمسار الأصلي */}
      <div className="p-4 sm:p-5 pt-0 bg-white grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onManage(business)}
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition active:scale-95"
        >
          <Settings2 className="w-4 h-4" />
          إدارة المنشأة
        </button>

        <a
          href={`${publicRoutePrefix}/${business.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          عرض المنشأة
        </a>
      </div>
    </div>
  );
};
