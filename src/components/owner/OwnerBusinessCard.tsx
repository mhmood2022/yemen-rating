import React from 'react';
import Link from 'next/link';
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

interface OwnerBusinessCardProps {
  business: BusinessItem;
  onManage: (business: BusinessItem) => void;
  onPromote?: (business: BusinessItem) => void;
}

export const OwnerBusinessCard: React.FC<OwnerBusinessCardProps> = ({
  business,
  onManage,
  onPromote,
}) => {
  const getStatusBadge = () => {
    switch (business.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            نشط
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            قيد المراجعة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <AlertCircle className="w-3.5 h-3.5" />
            غير نشط
          </span>
        );
    }
  };

  return (
    <div className="font-['Cairo'] bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* رأس البطاقة والصورة */}
      <div>
        <div className="relative h-40 bg-zinc-100 overflow-hidden">
          {business.cover_image || business.logo_url ? (
            <img
              src={business.cover_image || business.logo_url}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-400">
              <Building2 className="w-12 h-12 stroke-[1.5] mb-1" />
              <span className="text-xs">لا توجد صورة</span>
            </div>
          )}

          {/* شارات الحالة والتميز */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-2">
            {getStatusBadge()}
            {business.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                مميزة
              </span>
            )}
          </div>
        </div>

        {/* معلومات المنشأة الأساسية */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
              <Tag className="w-3 h-3" />
              {business.category_name || business.classification}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {business.city || 'اليمن'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug line-clamp-1 mb-2">
            {business.name}
          </h3>

          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-4 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
            {business.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-zinc-800">{business.rating.toFixed(1)}</span>
                {business.reviews_count !== undefined && (
                  <span className="text-zinc-400">({business.reviews_count})</span>
                )}
              </div>
            )}
            {business.views_count !== undefined && (
              <div className="text-zinc-500">
                {business.views_count.toLocaleString('ar-YE')} مشاهدة
              </div>
            )}
          </div>
        </div>
      </div>

      {/* إجراءات المنشأة */}
      <div className="p-4 sm:p-5 pt-0 bg-white grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => onManage(business)}
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 text-white text-xs sm:text-sm font-semibold hover:bg-zinc-800 transition active:scale-[0.98]"
        >
          <Settings2 className="w-4 h-4" />
          إدارة المنشأة
        </button>

        {onPromote && (
          <button
            onClick={() => onPromote(business)}
            type="button"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50/60 text-amber-900 text-xs sm:text-sm font-semibold hover:bg-amber-100/60 transition active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            ترويج واشتراك
          </button>
        )}
      </div>
    </div>
  );
};
