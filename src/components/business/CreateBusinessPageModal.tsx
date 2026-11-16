import React, { useState, useRef } from 'react';
import { ArrowRight, Camera, Building2 } from 'lucide-react';

export interface BusinessPageDraft {
  id?: string;
  name: string;
  username: string;
  businessType: string;
  city: string;
  phone: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
}

interface CreateBusinessPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (draft: BusinessPageDraft) => void;
  isSubmitting?: boolean;
}

const BUSINESS_TYPES = [
  { value: 'SHOP', label: 'متجر / نشاط تجاري' },
  { value: 'RESTAURANT', label: 'مطعم / كافيه' },
  { value: 'COMPANY', label: 'شركة / مؤسسة' },
  { value: 'BANK', label: 'بنك / مصرف' },
  { value: 'WALLET', label: 'محفظة إلكترونية / صرافة' },
  { value: 'HEALTHCARE', label: 'عيادة / مركز طبي' },
  { value: 'HOTEL', label: 'فندق / سياحة' },
  { value: 'REAL_ESTATE', label: 'عقارات' },
  { value: 'CAR_DEALER', label: 'سيارات ونقل' },
  { value: 'EDUCATION', label: 'تعليم وتدريب' },
  { value: 'PROFESSIONAL', label: 'خدمات مهنية' },
];

const CITIES = ['صنعاء', 'عدن', 'تعز', 'المكلا', 'إب', 'الحديدة', 'ذمار', 'مأرب'];

export const CreateBusinessPageModal: React.FC<CreateBusinessPageModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [businessType, setBusinessType] = useState('SHOP');
  const [city, setCity] = useState('صنعاء');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'avatar') setAvatarUrl(reader.result);
        else setCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanName = name.trim();
    const cleanUsername = username.trim().replace(/^@+/, '').replace(/\s+/g, '_');

    if (!cleanName) {
      setErrorMsg('يرجى إدخال اسم المنشأة');
      return;
    }
    if (!cleanUsername) {
      setErrorMsg('يرجى إدخال معرّف المنشأة');
      return;
    }

    onCreated({
      name: cleanName,
      username: cleanUsername,
      businessType,
      city,
      phone: phone.trim(),
      description: description.trim(),
      avatarUrl,
      coverUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col overflow-y-auto" dir="rtl">
      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePreview(e, 'avatar')}
      />
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilePreview(e, 'cover')}
      />

      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-between px-4 h-[64px] border-b border-[#2F3336]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/10 p-1.5 rounded-full transition"
            title="رجوع"
          >
            <ArrowRight size={20} />
          </button>
          <h2 className="text-white font-bold text-[15px]">إنشاء صفحة منشأة</h2>
        </div>
        <button
          type="submit"
          form="create-business-page-form"
          disabled={isSubmitting}
          className="px-4 py-1.5 rounded-full bg-[#FFC500] text-black font-bold text-xs hover:opacity-90 transition disabled:opacity-50"
        >
          {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الصفحة'}
        </button>
      </div>

      <form id="create-business-page-form" onSubmit={handleSubmit} className="flex-1 pb-24">
        <div className="relative w-full h-36 sm:h-44 bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black">
          {coverUrl && <img src={coverUrl} alt="غلاف المنشأة" className="w-full h-full object-cover" />}
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition backdrop-blur-md border border-white/20"
            title="إضافة غلاف للمنشأة"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="px-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 -mt-12 sm:-mt-14 rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="شعار المنشأة" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={32} className="text-[#71767B]" />
            )}
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute inset-0 bg-black/50 hover:bg-black/30 flex items-center justify-center text-white transition"
              title="رفع شعار المنشأة"
            >
              <Camera size={22} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-6 space-y-4 max-w-xl mx-auto">
          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {errorMsg}
            </div>
          )}

          <div className="relative border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">اسم المنشأة *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="مثال: مطعم الشيباني"
              className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B]"
              required
            />
          </div>

          <div className="relative border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">معرّف المنشأة *</label>
            <div className="flex items-center gap-1" dir="ltr">
              <span className="text-[#71767B] text-sm pb-2">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={40}
                placeholder="alshaibani_ye"
                className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
              <label className="block text-[#71767B] text-xs font-bold mb-1">التصنيف</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-black text-white text-sm pb-2 outline-none cursor-pointer"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-black text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
              <label className="block text-[#71767B] text-xs font-bold mb-1">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-black text-white text-sm pb-2 outline-none cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-black text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">رقم الهاتف / الواتساب</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="770000000"
              dir="ltr"
              className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B] text-right"
            />
          </div>

          <div className="relative border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">نبذة عن المنشأة</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={160}
              placeholder="صف خدمات المنشأة ونشاطها..."
              className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B] resize-none"
            />
            <span className="text-[10px] text-[#71767B]">{description.length}/160</span>
          </div>
        </div>
      </form>
    </div>
  );
};
