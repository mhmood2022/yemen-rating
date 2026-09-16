import React, { useState, useEffect, useRef } from 'react';
import { Gavel, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminAuctionsService } from '../../services/adminService';
import { AdBanner } from '../common/AdBanner';
import { AuctionCard } from '../auctions/AuctionCard';
import { YRSelect } from '../common/YRSelect';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'كل المدن والمحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'صعدة', label: 'صعدة' },
  { value: 'حجة', label: 'حجة' },
  { value: 'البيضاء', label: 'البيضاء' },
  { value: 'لحج', label: 'لحج' },
  { value: 'أبين', label: 'أبين' },
  { value: 'المهرة', label: 'المهرة' },
  { value: 'شبوة', label: 'شبوة' },
  { value: 'عمران', label: 'عمران' },
  { value: 'الضالع', label: 'الضالع' },
  { value: 'ريمة', label: 'ريمة' },
  { value: 'المحويت', label: 'المحويت' },
  { value: 'سقطرى', label: 'أرخبيل سقطرى' },
  { value: 'الجوف', label: 'الجوف' }
];

const CURRENCIES = [
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' }
];

export const AuctionsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'auction' | 'fixed_price'>('all');
  const [cityFilter, setCityFilter] = useState('all');

  // عمولات لوحة التحكم
  const [commissionSettings, setCommissionSettings] = useState<any>(null);

  // نافذة أضف معروض
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saleType, setSaleType] = useState<'auction' | 'fixed_price'>('auction');
  const [category, setCategory] = useState('سيارات');
  const [city, setCity] = useState('صنعاء');
  const [startingPrice, setStartingPrice] = useState('');
  const [currency, setCurrency] = useState('YER');
  const [description, setDescription] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [consentListing, setConsentListing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    adminAuctionsService.getPlatformCommissionSettings?.().then((res: any) => {
      if (res?.data) setCommissionSettings(res.data);
    }).catch(() => {});
  }, []);

  // فحص تسجيل الدخول قبل فتح النافذة
  const handleOpenAddModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول إلى حسابك أولاً لتتمكن من إضافة معروض جديد');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setIsAddModalOpen(true);
  };

  // رفع من 1 إلى 6 صور من الهاتف
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remaining = 6 - uploadedImages.length;
      if (remaining <= 0) {
        setToastMessage('الحد الأقصى المسموح به هو 6 صور فقط');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      const taken = Array.from(files).slice(0, remaining);
      taken.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setUploadedImages((prev) => (prev.length < 6 ? [...prev, reader.result as string] : prev));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setSellerPhone(numeric);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !consentListing) return;

    if (sellerPhone.length !== 9) {
      setToastMessage('يرجى إدخال رقم هاتف يمني صحيح مكون من 9 أرقام بالضبط (مثال: 77XXXXXXX)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول أولاً لإرسال المعروض');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSubmitting(true);
      const priceNum = parseFloat(startingPrice) || 0;
      const payload: any = {
        title: title.trim(),
        sale_type: saleType,
        category: category,
        city: city,
        currency: currency,
        description: description.trim(),
        seller_phone: sellerPhone,
        seller_id: session.user.id,
        images: uploadedImages,
        status: 'active',
        created_at: new Date().toISOString()
      };

      if (saleType === 'auction') {
        payload.starting_price = priceNum;
        payload.current_bid = priceNum;
      } else {
        payload.final_price = priceNum;
      }

      const { error } = await supabase.from('auctions').insert([payload]);
      if (error) throw error;

      setIsAddModalOpen(false);
      setTitle('');
      setStartingPrice('');
      setDescription('');
      setSellerPhone('');
      setUploadedImages([]);
      setConsentListing(false);
      setToastMessage('تم نشر المعروض بنجاح وتوثيق الصور وشروط العمولة');
      setTimeout(() => setToastMessage(null), 4000);
      fetchAuctions();
    } catch (err: any) {
      setToastMessage(err.message || 'حدث خطأ أثناء الإرسال');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    const sType = item.sale_type || item.saleType || 'auction';
    const matchTab = activeTab === 'all' || sType === activeTab;
    const matchCity = cityFilter === 'all' || (item.city && item.city.includes(cityFilter));
    return matchTab && matchCity;
  });

  const fixedCommAmount = commissionSettings?.default_fixed_commission_amount || 20000;
  const fixedCommCurr = commissionSettings?.default_fixed_commission_currency || 'ريال يمني';
  const auctionCommRate = commissionSettings?.default_auction_commission_rate || 5;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="6" className="mb-2" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس مع زر أضف معروض المحمي بتسجيل الدخول */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0D1527] border border-slate-800 text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all"
            >
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-[#F5C400]" />
            <h1 className="text-lg sm:text-xl font-black text-white">المزادات والعروض الحصرية</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs transition-colors shadow-md"
          >
            <Plus size={15} />
            <span>أضف مزاد / معروض</span>
          </button>

          <button
            onClick={fetchAuctions}
            disabled={loading}
            className="p-2 bg-[#0D1527] border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط الوساطة الإلزامي المعتمد من لوحة التحكم */}
      <div className="bg-[#0D1527] border border-[#16A34A]/40 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-slate-200">
        <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
        <span>تخضع جميع المزادات والبيوع لوساطة وضمان يمن ريتغ الرسمية لحماية حقوق البائع والمشتري مع تثبيت وتوثيق عمولة المنصة المعتمدة.</span>
      </div>

      {/* شريط الفلترة الموحد */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1527] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 bg-[#060A13] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-[#F5C400] text-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab('auction')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'auction' ? 'bg-[#F5C400] text-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            مزاد حي
          </button>
          <button
            onClick={() => setActiveTab('fixed_price')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'fixed_price' ? 'bg-[#F5C400] text-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            بيع مباشر
          </button>
        </div>

        <div className="w-full sm:w-64">
          <YRSelect
            value={cityFilter}
            options={YEMEN_GOVERNORATES}
            onChange={(val) => setCityFilter(val)}
            placeholder="كل المدن والمحافظات"
          />
        </div>
      </div>

      {/* شبكة المزادات الحقيقية */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
          <span className="text-xs font-bold">جاري تحميل المزادات الحقيقية...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-[#0D1527] rounded-2xl border border-slate-800 p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-[#F5C400] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">لا توجد مزادات معروضة حالياً</h3>
          <p className="text-xs text-slate-400">كن أول من يضيف معروضاً بالضغط على "أضف مزاد / معروض" أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {/* نافذة أضف معروض مع رفع 1 إلى 6 صور والإقرار الأخضر الشفاف */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto font-['Cairo'] text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-[#F5C400]" /> إضافة معروض جديد
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-[#060A13] text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#F5C400] block mb-1 font-bold">طريقة البيع المعتمدة *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSaleType('fixed_price')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      saleType === 'fixed_price' ? 'bg-[#F5C400] text-black border-[#F5C400]' : 'bg-[#060A13] text-slate-300 border-slate-800'
                    }`}
                  >
                    بيع بسعر ثابت
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleType('auction')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      saleType === 'auction' ? 'bg-[#F5C400] text-black border-[#F5C400]' : 'bg-[#060A13] text-slate-300 border-slate-800'
                    }`}
                  >
                    مزاد (مزايدة)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">عنوان المعروض *</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: سيارة تويوتا لاندكروزر 2022"
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              {/* قسم رفع الصور من الهاتف (من 1 إلى 6 صور) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <ImagePlus size={14} className="text-[#F5C400]" />
                    <span>صور المعروض من الهاتف (من 1 إلى 6 صور)</span>
                  </label>
                  <span className="text-[10px] text-[#F5C400] font-bold">
                    {uploadedImages.length} من 6
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImagesUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedImages.length >= 6}
                  className="w-full py-2.5 border border-dashed border-slate-700 hover:border-[#F5C400] rounded-xl bg-[#060A13] text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <ImagePlus size={16} className="text-[#F5C400]" />
                  <span>{uploadedImages.length >= 6 ? 'تم بلوغ الحد الأقصى (6 صور)' : 'اضغط لاختيار الصور من استوديو الجوال'}</span>
                </button>

                {/* مصغرات الصور المرفوعة */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-slate-800 bg-[#060A13]">
                        <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 left-1 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">المدينة أو المحافظة *</label>
                  <YRSelect
                    value={city}
                    options={YEMEN_GOVERNORATES.filter((g) => g.value !== 'all')}
                    onChange={(val) => setCity(val)}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">العملة *</label>
                  <YRSelect
                    value={currency}
                    options={CURRENCIES}
                    onChange={(val) => setCurrency(val)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  {saleType === 'auction' ? 'السعر الابتدائي للمزاد *' : 'السعر المطلوب للبيع *'}
                </label>
                <input
                  required
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  رقم الهاتف (واتساب) * <span className="text-[#F5C400] text-[10px]">(9 أرقام بالضبط)</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={9}
                  value={sellerPhone}
                  onChange={handlePhoneChange}
                  placeholder="77XXXXXXX"
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white text-left font-mono focus:outline-none focus:border-[#F5C400]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  تم إدخال: {sellerPhone.length} من 9 أرقام
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الوصف والمواصفات</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              {/* الإقرار الأخضر الشفاف بالنص الأصلي الإلزامي */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>إقرار إلزامي لصاحب العرض/المزاد:</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed">
                  {saleType === 'fixed_price'
                    ? `بتقديم هذا العرض، يقرّ صاحب العرض بصحة جميع البيانات والسعر المحدد، ويوافق على شروط وساطة يمن ريتغ، ويلتزم بإتمام البيع وسداد عمولة يمن ريتغ البالغة (${fixedCommAmount.toLocaleString()} ${fixedCommCurr}) عند إتمام الصفقة.`
                    : `بتقديم المعروض للمزاد، يقرّ صاحب المزاد بصحة جميع البيانات والسعر الابتدائي، ويوافق على نظام المزايدة، ويلتزم بسداد عمولة يمن ريتغ المستحقة (${auctionCommRate}%) عند إتمام الصفقة.`}
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentListing}
                    onChange={(e) => setConsentListing(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">أوافق على الإقرار والشروط المعتمدة</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!consentListing || sellerPhone.length !== 9 || submitting}
                  className="px-5 py-2 rounded-xl bg-[#F5C400] disabled:opacity-40 text-black font-black text-xs transition-colors shadow-md"
                >
                  {submitting ? 'جاري الحفظ...' : 'نشر المعروض'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
