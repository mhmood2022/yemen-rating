import React, { useState } from 'react';
import { 
  Star, MapPin, Phone, Clock, ArrowRight, Share2, Heart, 
  Globe, ShieldCheck, CheckCircle2, MessageCircle, X, ChevronRight, ChevronLeft, ZoomIn
} from 'lucide-react';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

interface BusinessDetailsProps {
  business: BusinessItem;
  onBack: () => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const imagesList = Array.isArray(business.images) && business.images.length > 0 
    ? business.images 
    : [business.coverImage];

  const displayGallery = imagesList.slice(0, 4);

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* زر العودة */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع للقائمة</span>
        </button>
      </div>

      {/* الهيدر البانورامي والشعار */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="h-60 sm:h-80 w-full bg-slate-900 relative">
          <img 
            src={business.coverImage} 
            alt={business.name} 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 shrink-0">
              <img src={business.logo} alt={business.name} className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {business.name}
                </h1>
                {business.isVerified ? (
                  <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" /> موثّق رسمي
                  </span>
                ) : (
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3" /> غير مطالب به
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{business.address || business.cityId || 'الجمهورية اليمنية'}</span>
              </p>
            </div>
          </div>

          {/* زر إثبات الملكية إذا كانت غير موثقة */}
          {!business.isVerified && (
            <div className="w-full sm:w-auto">
              <a 
                href={`https://wa.me/967770000000?text=${encodeURIComponent('أرغب بإثبات ملكية وإدارة المنشأة: ' + business.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>هل أنت المالك؟ اثبت ملكيتك</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* تفاصيل المنشأة وشبكة الأقسام */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيمن: النبذة ومعرض الصور */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* نبذة عن المنشأة */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>نبذة عن المنشأة والخدمات</span>
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {business.description || 'منشأة رائدة تقدم أرقى الخدمات لعملائها بأعلى معايير الجودة والالتزام في الجمهورية اليمنية.'}
            </p>
          </div>

          {/* ألبوم الصور الأربع المكبر (Lightbox Gallery) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-indigo-600" />
              <span>معرض الصور والمرافق ({displayGallery.length} صور)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {displayGallery.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer relative group"
                >
                  <img 
                    src={img} 
                    alt={`صورة ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* العمود الأيسر: التواصل والحجز وساعات الدوام */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-20">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 text-sm">
              التواصل والحجز المباشر
            </h3>

            <div className="space-y-3 mb-6">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              )}
              
              {(business.whatsapp || business.phone) && (
                <a 
                  href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>
              )}
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ساعات الدوام:</span>
                <span className="font-bold text-slate-700">على مدار 24 ساعة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المدينة / الفرع:</span>
                <span className="font-bold text-slate-700">{business.cityId || 'المركز الرئيسي'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">حالة التوثيق:</span>
                <span className={`font-bold ${business.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {business.isVerified ? 'موثق ومعتمد رسمي' : 'غير مطالب به'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* البنر الإعلاني السفلي */}
      <div className="w-full pt-4">
        <AdBanner placementId="3" className="shadow-sm rounded-2xl overflow-hidden" />
      </div>

      {/* نافذة تكبير الصورة (Lightbox Modal) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-transparent" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 left-0 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="تكبير" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};
