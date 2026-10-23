import React, { useState, useRef, useEffect } from 'react';
import { Gavel, Tag, X, ImagePlus, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { YRSelect, YRSelectOption } from '../common/YRSelect';
import { supabase } from '../../lib/supabase';

// القوائم المعتمدة الموحدة
const GENERAL_CATEGORY_OPTIONS: YRSelectOption[] = [
  { value: 'سيارات ومركبات', label: 'سيارات ومركبات' },
  { value: 'هواتف وأجهزة ذكية', label: 'هواتف وأجهزة ذكية' },
  { value: 'أسلحة ومقتنيات شخصية', label: 'أسلحة ومقتنيات شخصية' },
  { value: 'عفش وأثاث', label: 'عفش وأثاث' },
  { value: 'عقارات وأراضي', label: 'عقارات وأراضي' },
  { value: 'أغراض وسلع عامة', label: 'أغراض وسلع عامة ومعدات' }
];

const PUBLIC_CURRENCY_OPTIONS: YRSelectOption[] = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'YER', label: 'ريال يمنى (YER)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' }
];

const YEMEN_CITIES: YRSelectOption[] = [
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'حجة', label: 'حجة' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'الضالع', label: 'الضالع' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'ريمة', label: 'ريمة' },
  { value: 'الجوف', label: 'الجوف' },
  { value: 'سقطرى', label: 'سقطرى' }
];

interface AuctionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuctionCreateModal: React.FC<AuctionCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  // الحالات التفاعلية
  const [saleType, setSaleType] = useState<'auction' | 'direct'>('auction');
  const [selectedCategory, setSelectedCategory] = useState('سيارات ومركبات');
  const [selectedCity, setSelectedCity] = useState('صنعاء');
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');

  const [auctionTitle, setAuctionTitle] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  // جلب اسم ورقم صاحب المزاد تلقائياً من حسابه المسجل
  useEffect(() => {
    if (!isOpen) return;
    const fetchSellerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let name = user.user_metadata?.full_name || user.user_metadata?.name || "";
          let phone = user.phone || user.user_metadata?.phone || "";
          let email = user.email || "";

          try {
            const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
            if (prof) {
              if (prof.email) email = prof.email;
              if (prof.full_name && !name) name = prof.full_name;
              if (prof.phone && !phone) phone = prof.phone;
            }
          } catch {}

          if (name) setSellerName(name);
          if (phone) {
            const cleanPhone = phone.replace(/\D/g, "").slice(-9);
            setSellerPhone(cleanPhone);
          }
          if (email) setSellerEmail(email);
        }
      } catch (e) {
        console.error("Error auto-filling user info:", e);
      }
    };
    fetchSellerData();
  }, [isOpen]);


  // ضبط التواريخ الافتراضية
  const now = new Date();
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  const [minIncrement, setMinIncrement] = useState('1000');
  const [maxIncrement, setMaxIncrement] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [auctionImages, setAuctionImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sellerCommissionRate = 5;

  // دالة ضغط الصور
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
          else if (h > MAX) { h *= MAX / h; h = MAX; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(e.target?.result as string);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (auctionImages.length + files.length > 6) {
      setStatusMessage({ type: 'error', text: 'الحد الأقصى هو 6 صور للمزاد' });
      return;
    }
    setIsCompressing(true);
    setStatusMessage(null);
    try {
      const newImgs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (auctionImages.length + newImgs.length >= 6) break;
        const compressed = await compressImage(files[i]);
        newImgs.push(compressed);
      }
      setAuctionImages((prev) => [...prev, ...newImgs]);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء معالجة الصور' });
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setAuctionImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // دالة الحفظ الفعلي في قاعدة البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!auctionTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى كتابة عنوان المعروض' });
      return;
    }

    const priceNum = parseFloat(startingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال سعر صحيح أكبر من الصفر' });
      return;
    }

    if (!agreedToTerms) {
      setStatusMessage({ type: 'error', text: 'يرجى الموافقة على الشروط والسياسات للمتابعة' });
      return;
    }

    if (isCompressing) {
      setStatusMessage({ type: 'error', text: 'يرجى الانتظار حتى اكتمال ضغط الصور' });
      return;
    }

    try {
      setIsSubmitting(true);

      const minInc = parseFloat(minIncrement) || 1000;
      const maxInc = maxIncrement ? parseFloat(maxIncrement) : null;
      const cleanPhone = sellerPhone.trim().replace(/\D/g, '') || '770000000';

      const payload: any = {
        title: auctionTitle.trim(),
        seller_name: sellerName.trim() || 'صاحب المعروض',
        seller_phone: cleanPhone,
        seller_email: sellerEmail.trim() || null,
        sale_type: saleType,
        category: selectedCategory,
        city: selectedCity,
        currency: selectedCurrency,
        starting_price: priceNum,
        current_bid: priceNum,
        min_increment: minInc,
        max_increment: maxInc,
        start_time: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        end_date: endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        description: itemDescription.trim(),
        images: auctionImages,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('auctions').insert([payload]);
      if (error) throw error;

      setStatusMessage({ type: 'success', text: 'تم نشر المعروض بنجاح وإدراجه في المنصة!' });

      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('Error saving auction:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ المعروض، يرجى المحاولة ثانية' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black  flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-black border border-[#2F3336] rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto text-white shadow-2xl">
        {/* الترويسة */}
        <div className="flex justify-between items-center border-b border-[#2F3336] pb-3">
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Gavel size={16} className="text-[#F5C400]" />
            <span>إضافة معروض جديد في المنصة</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#111111] border border-[#2F3336] text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* جسم النموذج */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* اختيار نوع طريقة البيع */}
          <div>
            <label className="text-slate-300 block mb-1.5 font-bold">طريقة البيع المعتمدة *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaleType('auction')}
                className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  saleType === 'auction'
                    ? 'bg-[#F5C400] text-black border-[#F5C400] font-black'
                    : 'bg-[#111111] text-slate-300 border-[#2F3336]'
                }`}
              >
                <Gavel size={14} />
                <span>مزاد علني (مزايدة)</span>
              </button>

              <button
                type="button"
                onClick={() => setSaleType('direct')}
                className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  saleType === 'direct'
                    ? 'bg-[#F5C400] text-black border-[#F5C400] font-black'
                    : 'bg-[#111111] text-slate-300 border-[#2F3336]'
                }`}
              >
                <Tag size={14} />
                <span>بيع مباشر بسعر محدد</span>
              </button>
            </div>
          </div>

          {/* تصنيف السلعة */}
          <div>
            <label className="text-slate-300 block mb-1 font-bold">تصنيف السلعة *</label>
            <YRSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={GENERAL_CATEGORY_OPTIONS}
            />
          </div>

          {/* عنوان المعروض */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold">عنوان المعروض *</label>
            <input
              required
              type="text"
              value={auctionTitle}
              onChange={(e) => setAuctionTitle(e.target.value)}
              placeholder="مثال: هاتف سامسونج الترا 26 أو سيارة هيونداي..."
              className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
            />
          </div>

          {/* المحافظة والعملة */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">موقع المعاينة والمدينة *</label>
              <YRSelect
                value={selectedCity}
                options={YEMEN_CITIES}
                onChange={(val) => setSelectedCity(val)}
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-bold">العملة المعتمدة *</label>
              <YRSelect
                value={selectedCurrency}
                onChange={(val) => setSelectedCurrency(val)}
                options={PUBLIC_CURRENCY_OPTIONS}
              />
            </div>
          </div>

          {/* السعر */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold">
              {saleType === 'direct' ? 'سعر البيع المباشر المطلوب *' : 'السعر الابتدائي لافتتاح المزاد *'}
            </label>
            <input
              required
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="مثال : 5000"
              className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
            />
          </div>

          {/* بيانات صاحب المعروض الموثقة بالحساب - مقفلة بالكامل */}
          <div className="p-3 rounded-xl bg-[#111111] border border-[#2F3336] space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#2F3336]/80">
              <span className="text-[11px] font-bold text-slate-300">بيانات صاحب المعروض (موثقة بالحساب):</span>
              <span className="flex items-center justify-center p-1 rounded-md bg-[#1A1A1A] text-slate-400 border border-[#2F3336]" title="موثق ومقفل بالحساب"><Lock size={12} className="text-slate-400" /></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-bold">اسم صاحب المعروض (البائع)</label>
                <input
                  readOnly
                  type="text"
                  value={sellerName}
                  placeholder="جاري الجلب من الحساب..."
                  className="w-full bg-[#111111] border border-[#2F3336] rounded-xl p-2.5 text-white/90 text-xs outline-none cursor-not-allowed select-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-bold">رقم هاتف التواصل</label>
                <input
                  readOnly
                  type="text"
                  value={sellerPhone}
                  placeholder="جاري الجلب من الحساب..."
                  className="w-full bg-[#111111] border border-[#2F3336] rounded-xl p-2.5 text-white/90 font-mono text-xs outline-none cursor-not-allowed select-none text-left dir-ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-bold">البريد الإلكتروني المعتمد</label>
              <input
                readOnly
                type="email"
                value={sellerEmail}
                placeholder="جاري الجلب من الحساب..."
                className="w-full bg-[#111111] border border-[#2F3336] rounded-xl p-2.5 text-white/90 font-mono text-xs outline-none cursor-not-allowed select-none text-left dir-ltr"
              />
            </div>
          </div>

          {/* توقيت بدء وانتهاء المزاد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">تاريخ ووقت بدء المزاد *</label>
              <input
                required
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-bold">تاريخ ووقت انتهاء المزاد *</label>
              <input
                required
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
              />
            </div>
          </div>

          {/* قفزات المزايدة في حال كان مزاداً علنياً */}
          {saleType === 'auction' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">أدنى قفزة للمزايدة (الحد الأدنى) *</label>
                <input
                  required
                  type="number"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold">أعلى قفزة للزيادة (اختياري)</label>
                <input
                  type="number"
                  value={maxIncrement}
                  onChange={(e) => setMaxIncrement(e.target.value)}
                  placeholder="بدون سقف أعلى"
                  className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>
            </div>
          )}

          {/* تفاصيل ووصف السلعة */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold">وصف السلعة وحالتها وملحقاتها:</label>
            <textarea
              rows={3}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="اكتب مواصفات السلعة وحالتها بدقة..."
              className="w-full bg-[#111111] border border-[#2F3336] focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none resize-none"
            />
          </div>

          {/* رفع الصور */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-bold">صور المعروض الحقيقية (حتى 6 صور):</label>
            <div className="flex flex-wrap gap-2 items-center">
              {auctionImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#2F3336]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 rounded-full text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {auctionImages.length < 6 && (
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#F5C400] flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <ImagePlus size={18} />
                  <span className="text-[9px] mt-0.5">{isCompressing ? '...' : '+ صورة'}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* بيان عمولة البائع المطبقة للعلم والموافقة الصريحة */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-right">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>إقرار صاحب المعروض وسياسة عمولة المنصة المعتمدة:</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              بتقديم هذا المعروض، يقر صاحب العرض بصحة كافة البيانات والمواصفات وحالة السلعة، ويوافق على شروط الوساطة، ويلتزم بسداد عمولة منصة يمن ريتنج المعتمدة على البائع بنسبة (<span className="text-[#F5C400] font-black font-mono text-xs">{sellerCommissionRate}%</span>) {saleType === 'direct' ? 'من سعر البيع المباشر عند إتمام الصفقة.' : 'من أعلى مزايدة نهائية يرسو عليها المزاد.'}
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="text-[11px] text-white font-bold">
                أوافق وألتزم بالإقرار والشروط وعمولة المنصة المحددة ({sellerCommissionRate}%)
              </span>
            </label>
          </div>

          {/* تنبيهات النجاح والخطأ */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                  : 'bg-red-950/60 border border-red-500 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* أزرار الإجراء */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2F3336]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#111111] border border-[#2F3336] rounded-xl text-slate-300 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!agreedToTerms || isCompressing || isSubmitting}
              className="px-6 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'جاري النشر...' : 'نشر المعروض الآن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
