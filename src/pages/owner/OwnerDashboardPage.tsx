import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Star, 
  Eye, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Upload, 
  ImageIcon, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Trash2,
  Check,
  ChevronDown
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const OwnerDashboardPage: React.FC = () => {
  const [ownerProfile] = useState(() => {
    const saved = localStorage.getItem('yr_active_owner_profile');
    return saved ? JSON.parse(saved) : {
      facilityName: 'فندق بلقيس الدولي',
      ownerName: 'محمد عبدالله السنيدار',
      sector: 'الفنادق',
      phone: '+967770000111'
    };
  });

  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'features'>('info');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // 1. البيانات الأساسية
  const [facilityData, setFacilityData] = useState({
    name: ownerProfile.facilityName,
    sector: ownerProfile.sector || 'الفنادق',
    city: 'صنعاء',
    address: 'شارع الستين الجنوبي - بجوار الجسر',
    phone: ownerProfile.phone,
    whatsapp: ownerProfile.phone,
    workHours: '24h',
    customHours: '08:00 ص - 10:00 م'
  });

  // 2. الصور الحقيقية (شعار، غلاف، 4 صور استوديو)
  const [mediaData, setMediaData] = useState({
    logo: '',
    cover: '',
    photos: ['', '', '', '']
  });

  // 3. ميزات القطاع
  const [sectorFeatures, setSectorFeatures] = useState([
    { id: 1, name: 'خدمة غرف على مدار 24 ساعة', active: true },
    { id: 2, name: 'إنترنت واي فاي مجاني فائق السرعة', active: true },
    { id: 3, name: 'مواقف سيارات خاصة ومجانية', active: true },
    { id: 4, name: 'قاعة مؤتمرات ومناسبات مجهزة', active: false },
    { id: 5, name: 'مطعم وبوفيه مفتوح', active: true },
    { id: 6, name: 'خدمة نقل من وإلى المطار', active: false },
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // 4. العروض والخصومات
  const [offers, setOffers] = useState([
    { id: 'off_1', title: 'خصم عطلة نهاية الأسبوع 20%', desc: 'خصم خاص على الحجوزات' }
  ]);
  const [customOfferTitle, setCustomOfferTitle] = useState('');
  const [customOfferDesc, setCustomOfferDesc] = useState('');

  // رفع الصور من استوديو الهاتف
  const handleImageUpload = (type: 'logo' | 'cover' | number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'logo') {
        setMediaData(prev => ({ ...prev, logo: result }));
        showToast('✅ تم اختيار الشعار بنجاح');
      } else if (type === 'cover') {
        setMediaData(prev => ({ ...prev, cover: result }));
        showToast('✅ تم اختيار الغلاف بنجاح');
      } else {
        const newPhotos = [...mediaData.photos];
        newPhotos[type] = result;
        setMediaData(prev => ({ ...prev, photos: newPhotos }));
        showToast(`✅ تم اختيار صورة المعرض #${type + 1}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFeature = (id: number) => {
    setSectorFeatures(sectorFeatures.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const handleAddCustomFeature = () => {
    if (!customFeatureInput.trim()) return;
    setSectorFeatures([...sectorFeatures, { id: Date.now(), name: customFeatureInput.trim(), active: true }]);
    setCustomFeatureInput('');
    showToast('✅ تمت إضافة الميزة');
  };

  const handleAddCustomOffer = () => {
    if (!customOfferTitle.trim()) return;
    setOffers([...offers, { id: `off_${Date.now()}`, title: customOfferTitle, desc: customOfferDesc }]);
    setCustomOfferTitle('');
    setCustomOfferDesc('');
    showToast('🎉 تم إضافة العرض');
  };

  const handleAddPresetOffer = (presetTitle: string) => {
    setOffers([...offers, { id: `off_${Date.now()}`, title: presetTitle, desc: 'عرض خاص لفترة محدودة' }]);
    showToast(`✅ تمت إضافة: ${presetTitle}`);
  };

  // حفظ التعديلات
  const handleSaveAll = async () => {
    // 1. حفظ محلي في المتصفح لتعكس فوراً
    localStorage.setItem('yr_active_owner_profile', JSON.stringify({
      facilityName: facilityData.name,
      ownerName: ownerProfile.ownerName,
      sector: facilityData.sector,
      phone: facilityData.phone,
      city: facilityData.city,
      address: facilityData.address,
      whatsapp: facilityData.whatsapp,
      media: mediaData,
      features: sectorFeatures,
      offers: offers
    }));

    // 2. إشعار الإدارة بالتحديثات
    await notificationService.createNotification({
      title: `تعديل بيانات منشأة: ${facilityData.name}`,
      message: `قام المالك (${ownerProfile.ownerName}) بحفظ تعديلات جديدة على الصور والبيانات.`,
      type: 'edit_request',
      sender_name: ownerProfile.ownerName,
      sender_phone: facilityData.phone,
      facility_name: facilityData.name,
      sector: facilityData.sector,
      admin_module: 'facilities'
    });

    showToast('✅ تم حفظ كافة التعديلات بنجاح!');
  };

  return (
    <div className="min-h-screen text-white p-3 sm:p-5 max-w-2xl mx-auto space-y-4 pb-24" dir="rtl">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] animate-in fade-in duration-150">
          <div className="bg-[#10172a] border border-[#10b981]/50 text-white p-3 rounded-xl shadow-2xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* الترويسة الرئيسية */}
      <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] shrink-0">
              {mediaData.logo ? (
                <img src={mediaData.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-white">{facilityData.name}</h1>
                <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  <ShieldCheck className="w-3 h-3" /> منشأة موثقة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                المالك: <strong className="text-white">{ownerProfile.ownerName}</strong> | القطاع: <span className="text-[#FFD000] font-bold">{facilityData.sector}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* شريط التبويبات الثلاثة بالأصفر الصريح #FFD000 */}
      <div className="bg-[#10172a] border border-[#1e293b] p-1.5 rounded-xl flex gap-1 shadow-md">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all text-center ${
            activeTab === 'info'
              ? 'bg-[#FFD000] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. البيانات والتواصل
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all text-center ${
            activeTab === 'media'
              ? 'bg-[#FFD000] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. الغلاف والشعار (4 صور)
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all text-center ${
            activeTab === 'features'
              ? 'bg-[#FFD000] text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. ميزات القطاع والعروض
        </button>
      </div>

      {/* التبويب 1: البيانات والتواصل */}
      {activeTab === 'info' && (
        <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              اسم المنشأة أو الكيان *
            </label>
            <input
              type="text"
              value={facilityData.name}
              onChange={e => setFacilityData({ ...facilityData, name: e.target.value })}
              placeholder="مثال: فندق سبأ، مطاعم الشيباني، مستشفى النخبة..."
              className="w-full bg-[#162238] border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD000]"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              التصنيف الرسمي *
            </label>
            <input
              type="text"
              disabled
              value={facilityData.sector}
              className="w-full bg-[#162238]/60 border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* قائمة المدن بتصميم كحلي متناسق بدون إفساد الأندرويد */}
          <div className="relative">
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              المدينة
            </label>
            <div className="relative">
              <select
                value={facilityData.city}
                onChange={e => setFacilityData({ ...facilityData, city: e.target.value })}
                className="w-full appearance-none bg-[#162238] border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD000] cursor-pointer"
              >
                <option value="صنعاء" className="bg-[#10172a] text-white">صنعاء</option>
                <option value="عدن" className="bg-[#10172a] text-white">عدن</option>
                <option value="تعز" className="bg-[#10172a] text-white">تعز</option>
                <option value="حضرموت (المكلا)" className="bg-[#10172a] text-white">حضرموت (المكلا)</option>
                <option value="حضرموت (سيئون)" className="bg-[#10172a] text-white">حضرموت (سيئون)</option>
                <option value="الحديدة" className="bg-[#10172a] text-white">الحديدة</option>
                <option value="إب" className="bg-[#10172a] text-white">إب</option>
                <option value="مأرب" className="bg-[#10172a] text-white">مأرب</option>
                <option value="ذمار" className="bg-[#10172a] text-white">ذمار</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              العنوان التفصيلي
            </label>
            <input
              type="text"
              value={facilityData.address}
              onChange={e => setFacilityData({ ...facilityData, address: e.target.value })}
              placeholder="الشارع، الحي، أقرب معلم..."
              className="w-full bg-[#162238] border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD000]"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              رقم الهاتف
            </label>
            <input
              type="text"
              value={facilityData.phone}
              onChange={e => setFacilityData({ ...facilityData, phone: e.target.value })}
              placeholder="+967..."
              className="w-full bg-[#162238] border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FFD000]"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1.5">
              رقم الواتساب
            </label>
            <input
              type="text"
              value={facilityData.whatsapp}
              onChange={e => setFacilityData({ ...facilityData, whatsapp: e.target.value })}
              placeholder="+967..."
              className="w-full bg-[#162238] border border-[#243354] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FFD000]"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FFD000]" /> مواعيد وساعات الدوام اليومي:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFacilityData({ ...facilityData, workHours: '24h' })}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  facilityData.workHours === '24h'
                    ? 'bg-[#FFD000] text-black border-[#FFD000]'
                    : 'bg-[#162238] text-slate-300 border-[#243354]'
                }`}
              >
                مفتوح 24 ساعة يومياً
              </button>

              <button
                type="button"
                onClick={() => setFacilityData({ ...facilityData, workHours: 'custom' })}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  facilityData.workHours === 'custom'
                    ? 'bg-[#FFD000] text-black border-[#FFD000]'
                    : 'bg-[#162238] text-slate-300 border-[#243354]'
                }`}
              >
                دوام محدد (08:00 ص - 10:00 م)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* التبويب 2: الغلاف والشعار (4 صور) */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          
          {/* شعار المنشأة */}
          <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-white">شعار المنشأة (Logo)</h3>
            <div className="bg-[#162238] border border-[#243354] rounded-xl p-3 flex items-center justify-between">
              <div className="w-16 h-16 rounded-xl bg-[#10172a] border border-[#243354] flex items-center justify-center overflow-hidden shrink-0">
                {mediaData.logo ? (
                  <img src={mediaData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-500" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="logo-input"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                />
                <label
                  htmlFor="logo-input"
                  className="cursor-pointer bg-[#FFD000] hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>اختر من الهاتف</span>
                </label>
              </div>
            </div>
          </div>

          {/* الغلاف البانورامي */}
          <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-white">الغلاف البانورامي (Cover Banner)</h3>
            <div className="bg-[#162238] border border-[#243354] rounded-xl p-3 flex items-center justify-between">
              <div className="w-20 h-14 rounded-xl bg-[#10172a] border border-[#243354] flex items-center justify-center overflow-hidden shrink-0">
                {mediaData.cover ? (
                  <img src={mediaData.cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-500" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="cover-input"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('cover', e.target.files[0])}
                />
                <label
                  htmlFor="cover-input"
                  className="cursor-pointer bg-[#1e293b] hover:bg-slate-700 text-white font-bold border border-[#243354] px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع غلاف من الهاتف</span>
                </label>
              </div>
            </div>
          </div>

          {/* معرض المنشأة 4 صور */}
          <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#FFD000]" />
              معرض المنشأة (أربع صور للعرض من استوديو الهاتف)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="bg-[#162238] border border-[#243354] rounded-xl p-2.5 space-y-2 text-center">
                  <div className="h-28 rounded-lg bg-[#10172a] border border-[#243354] flex items-center justify-center overflow-hidden">
                    {mediaData.photos[idx] ? (
                      <img src={mediaData.photos[idx]} alt={`صورة #${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-500 font-mono">صورة #{idx + 1}</span>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`photo-input-${idx}`}
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(idx, e.target.files[0])}
                    />
                    <label
                      htmlFor={`photo-input-${idx}`}
                      className="cursor-pointer w-full bg-[#1e293b] hover:bg-slate-700 text-white font-bold border border-[#243354] py-2 rounded-lg text-xs block transition-all active:scale-95"
                    >
                      اختر صورة
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* التبويب 3: ميزات القطاع والعروض */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          
          <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white">ميزات وخدمات القطاع الفعلية (اضغط للتفعيل المباشر):</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">تظهر في صفحة المنشأة للزبائن:</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={e => setCustomFeatureInput(e.target.value)}
                placeholder="إضافة خدمة أو ميزة إضافية..."
                className="flex-1 bg-[#162238] border border-[#243354] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD000]"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="bg-[#FFD000] hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {sectorFeatures.map((feat) => (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => toggleFeature(feat.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    feat.active
                      ? 'bg-[#162238] text-white border-[#FFD000]'
                      : 'bg-[#10172a] text-slate-500 border-[#1e293b] hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${feat.active ? 'bg-[#FFD000]' : 'bg-slate-600'}`}></span>
                  <span>{feat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* العروض والخصومات */}
          <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#FFD000]" /> العروض الترويجية والخصومات:
            </h3>

            <div className="space-y-2 bg-[#162238] p-3 rounded-xl border border-[#243354]">
              <input
                type="text"
                value={customOfferTitle}
                onChange={e => setCustomOfferTitle(e.target.value)}
                placeholder="عنوان العرض (مثال: خصم 25% على كافة الغرف)"
                className="w-full bg-[#10172a] border border-[#243354] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD000]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customOfferDesc}
                  onChange={e => setCustomOfferDesc(e.target.value)}
                  placeholder="تفاصيل الخصم أو العرض..."
                  className="flex-1 bg-[#10172a] border border-[#243354] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD000]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomOffer}
                  className="bg-[#FFD000] hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">عروض سريعة جاهزة (اضغط للإضافة):</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  'خصم 20% لفترة محدودة',
                  'توصيل مجاني للطلبات الكبيرة',
                  'عرض خاص بمناسبة الافتتاح',
                  'هدية مجانية مع كل حجز'
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddPresetOffer(preset)}
                    className="p-2 bg-[#162238] hover:bg-[#1e293b] border border-[#243354] text-slate-300 hover:text-white rounded-lg text-[11px] font-bold text-center transition-all"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {offers.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block">العروض النشطة:</span>
                {offers.map(off => (
                  <div key={off.id} className="bg-[#162238] border border-[#243354] p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#FFD000]">{off.title}</span>
                      {off.desc && <p className="text-[11px] text-slate-400">{off.desc}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOffers(offers.filter(o => o.id !== off.id))}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* الشريط السفلي الثابت: حفظ التعديلات بالأصفر الصريح */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-[#1e293b] z-40">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 bg-[#FFD000] hover:bg-yellow-300 text-black font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default OwnerDashboardPage;
