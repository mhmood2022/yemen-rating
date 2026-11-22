import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  X,
  MapPin,
  Phone,
  Eye,
  Pin,
  Sparkles,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkUserActionAllowed } from '../../services/socialService';
import type { CommunitySection } from '../../services/sectionsService';
import {
  createTabSpecializedListing,
  fetchTabFormSchema,
  fetchTabListings,
  type TabFormField,
} from '../../services/communityTabsAdminService';

interface CustomSectionSpecializedFeedProps {
  section: CommunitySection;
  searchQuery: string;
  cityFilter: string;
  sortBy: string;
  externalOpenComposerSignal?: number;
}

export const CustomSectionSpecializedFeed: React.FC<CustomSectionSpecializedFeedProps> = ({
  section,
  searchQuery,
  cityFilter,
  sortBy,
  externalOpenComposerSignal = 0,
}) => {
  const [schema, setSchema] = useState<TabFormField[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('YER');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fieldsData, listingsData] = await Promise.all([
        fetchTabFormSchema(section.id),
        fetchTabListings(section.id),
      ]);
      setSchema(fieldsData);
      setListings(listingsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [section.id]);

  useEffect(() => {
    if (externalOpenComposerSignal > 0 && section.allowPosting !== false && section.allowSpecializedAds !== false) {
      setStatusMsg(null);
      setIsComposerOpen(true);
    }
  }, [externalOpenComposerSignal, section.allowPosting, section.allowSpecializedAds]);

  const activeFormFields = useMemo(
    () =>
      schema
        .filter((f) => f.is_active && f.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order),
    [schema]
  );

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const arr = listings.filter((item) => {
      const textBlob = `${item.title || ''} ${item.description || ''} ${item.city || ''} ${JSON.stringify(
        item.field_values || {}
      )}`.toLowerCase();
      const matchSearch = !q || textBlob.includes(q);
      const matchCity =
        cityFilter === 'all' ||
        String(item.city || '').toLowerCase().includes(cityFilter.toLowerCase()) ||
        textBlob.includes(cityFilter.toLowerCase());
      return matchSearch && matchCity;
    });

    arr.sort((a, b) => {
      if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) return a.is_pinned ? -1 : 1;
      if (sortBy === 'popular') return Number(b.likes_count || 0) - Number(a.likes_count || 0);
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortBy === 'oldest' ? ta - tb : tb - ta;
    });
    return arr;
  }, [listings, searchQuery, cityFilter, sortBy]);

  const cardStyle = section.specializedCardStyle || 'custom';
  const styleAccentLabel =
    cardStyle === 'phone'
      ? 'إعلان هاتف'
      : cardStyle === 'property'
        ? 'عرض عقاري'
        : cardStyle === 'job'
          ? 'فرصة وظيفية'
          : cardStyle === 'auction'
            ? 'مزاد'
            : section.label;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setStatusMsg(null);

    if (section.allowPosting === false || section.allowSpecializedAds === false) {
      setStatusMsg({ type: 'error', text: 'النشر المتخصص مغلق حالياً في هذا التبويب.' });
      return;
    }

    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال عنوان الإعلان.' });
      return;
    }

    for (const f of activeFormFields) {
      if (f.is_required) {
        const val = fieldValues[f.field_key];
        if (val === undefined || val === null || String(val).trim() === '') {
          setStatusMsg({ type: 'error', text: `الحقل "${f.label}" مطلوب.` });
          return;
        }
      }
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setStatusMsg({ type: 'error', text: 'يجب تسجيل الدخول أولاً لنشر إعلان متخصص.' });
      return;
    }

    const perm = await checkUserActionAllowed(user.id, 'post');
    if (!perm.allowed) {
      setStatusMsg({ type: 'error', text: perm.reason || 'تم تقييد صلاحية النشر لهذا الحساب.' });
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImages: string[] = [];
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const filePath = `tab_listings/${section.id}/${user.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('social-media')
          .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type || 'image/jpeg' });
        if (!upErr) {
          const { data: pub } = supabase.storage.from('social-media').getPublicUrl(filePath);
          if (pub?.publicUrl) uploadedImages.push(pub.publicUrl);
        }
      }

      const snapshot = activeFormFields.map((f) => ({
        key: f.field_key,
        label: f.label,
        type: f.field_type,
      }));

      const res = await createTabSpecializedListing({
        sectionId: section.id,
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        price: price ? Number(price) : null,
        currency,
        city: city.trim() || (fieldValues.city ? String(fieldValues.city) : undefined),
        phone: phone.trim() || undefined,
        images: uploadedImages,
        fieldValues,
        formSnapshot: snapshot,
      });

      if (!res.ok) {
        setStatusMsg({ type: 'error', text: res.error || 'تعذر نشر الإعلان.' });
        return;
      }

      setTitle('');
      setDescription('');
      setPrice('');
      setCity('');
      setPhone('');
      setFieldValues({});
      setImageFile(null);
      setImagePreview('');
      setIsComposerOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const renderListingSpecs = (item: any) => {
    const vals: Record<string, any> = item.field_values || {};
    const snap: Array<{ key: string; label: string }> = Array.isArray(item.form_snapshot)
      ? item.form_snapshot
      : [];

    const specs: Array<{ label: string; value: string }> = [];
    if (snap.length > 0) {
      snap.forEach((s) => {
        const fieldDef = schema.find((f) => f.field_key === s.key);
        if (fieldDef && !fieldDef.card_display) return;
        const v = vals[s.key];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          specs.push({ label: s.label, value: String(v) });
        }
      });
    } else {
      schema
        .filter((f) => f.card_display)
        .forEach((f) => {
          const v = vals[f.field_key];
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            specs.push({ label: f.label, value: String(v) });
          }
        });
    }
    return specs.slice(0, 6);
  };

  const handleShare = async (item: any) => {
    try {
      const txt = `${item.title} — ${section.label}`;
      if (navigator.share) {
        await navigator.share({ title: item.title, text: txt, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${txt}\n${window.location.href}`);
      }
    } catch {}
  };

  return (
    <div className="border-b border-[#2F3336]/40">
      {/* شريط الإعلانات المتخصصة المصمم للقسم */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 bg-[#0B0F17]/60 border-b border-[#2F3336]/40">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={14} className="text-[#FFC500] shrink-0" />
          <span className="text-xs font-black text-white truncate">
            إعلانات {section.label} المتخصصة ({filteredListings.length})
          </span>
        </div>

        {section.allowPosting !== false && section.allowSpecializedAds !== false && (
          <button
            type="button"
            onClick={() => {
              setStatusMsg(null);
              setIsComposerOpen(true);
            }}
            className="px-3 py-1 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-[11px] font-black flex items-center gap-1 shrink-0 transition cursor-pointer"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>إعلان متخصص</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-[#71767B]">جاري تحميل البطاقات المتخصصة...</div>
      ) : filteredListings.length > 0 ? (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredListings.map((item) => {
            const firstImg = Array.isArray(item.images) ? item.images[0] : null;
            const specs = renderListingSpecs(item);
            return (
              <div
                key={item.id}
                onClick={() => setDetailItem(item)}
                className="rounded-2xl bg-[#0B0F17] border border-[#2F3336] hover:border-white/25 overflow-hidden flex flex-col justify-between transition cursor-pointer"
              >
                <div>
                  {firstImg && (
                    <div className="h-40 w-full bg-black overflow-hidden relative">
                      <img src={firstImg} alt={item.title} className="w-full h-full object-cover" />
                      {item.is_pinned && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FFC500] text-black text-[10px] font-black flex items-center gap-1">
                          <Pin size={10} /> مثبت
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFC500]/10 text-[#FFC500] font-bold">
                        {styleAccentLabel}
                      </span>
                      {item.price !== null && item.price !== undefined && (
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {Number(item.price).toLocaleString()} {item.currency || 'YER'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-white line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-[11px] text-[#71767B] line-clamp-2">{item.description}</p>
                    )}

                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {specs.map((sp, i) => (
                          <span
                            key={`${sp.label}-${i}`}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-black border border-[#2F3336] text-zinc-300"
                          >
                            <span className="text-[#71767B]">{sp.label}: </span>
                            <strong className="text-white">{sp.value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-3 py-2 border-t border-[#2F3336]/60 flex items-center justify-between text-[11px] text-[#71767B]">
                  <div className="flex items-center gap-2.5 truncate">
                    {item.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#FFC500]" />
                        {item.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {Number(item.views_count || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1"
                      >
                        <Phone size={10} /> تواصل
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="p-1 text-[#71767B] hover:text-white cursor-pointer"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* نافذة تفاصيل الإعلان المتخصص */}
      {detailItem && (
        <div
          className="fixed inset-0 z-[150] bg-black/85 flex items-center justify-center p-4"
          dir="rtl"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="w-full max-w-lg bg-[#000000] border border-[#2F3336] rounded-2xl overflow-hidden text-white max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#2F3336] flex items-center justify-between">
              <span className="text-xs font-black text-[#FFC500]">{styleAccentLabel}</span>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="p-1 text-[#71767B] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {Array.isArray(detailItem.images) && detailItem.images[0] && (
                <img
                  src={detailItem.images[0]}
                  alt={detailItem.title}
                  className="w-full max-h-64 object-cover rounded-xl border border-[#2F3336]"
                />
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-black text-white">{detailItem.title}</h3>
                {detailItem.price !== null && detailItem.price !== undefined && (
                  <span className="text-sm font-black text-emerald-400 font-mono shrink-0">
                    {Number(detailItem.price).toLocaleString()} {detailItem.currency || 'YER'}
                  </span>
                )}
              </div>
              {detailItem.description && (
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {detailItem.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {renderListingSpecs(detailItem).map((sp, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2F3336] text-xs">
                    <div className="text-[10px] text-[#71767B]">{sp.label}</div>
                    <div className="font-bold text-white mt-0.5">{sp.value}</div>
                  </div>
                ))}
              </div>
              {detailItem.phone && (
                <a
                  href={`tel:${detailItem.phone}`}
                  className="w-full py-2.5 rounded-full bg-[#FFC500] text-black text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} /> اتصال مباشر: {detailItem.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة نشر إعلان متخصص ديناميكي حسب نموذج القسم */}
      {isComposerOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-4"
          dir="rtl"
          onClick={() => setIsComposerOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-[#000000] border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden text-white max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-[#2F3336] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#FFC500]" />
                <h3 className="text-sm font-black">نشر إعلان متخصص — {section.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="p-1 text-[#71767B] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-white mb-1">عنوان الإعلان *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`اكتب عنوان الإعلان في ${section.label}...`}
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">السعر (اختياري)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="صنعاء / عدن..."
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* الحقول والقوائم المنسدلة الديناميكية من الإدارة */}
              {activeFormFields.length > 0 && (
                <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#2F3336] space-y-2.5">
                  <div className="text-[11px] font-black text-[#FFC500]">
                    بيانات نموذج {section.label}
                  </div>
                  {activeFormFields.map((f) => {
                    const activeOpts = (f.options || []).filter((o) => o.is_active);
                    const val = fieldValues[f.field_key] ?? '';
                    return (
                      <div key={f.id}>
                        <label className="block text-[11px] font-bold text-zinc-200 mb-1">
                          {f.label} {f.is_required && <span className="text-red-400">*</span>}
                        </label>
                        {f.field_type === 'select' ? (
                          <select
                            value={val}
                            onChange={(e) =>
                              setFieldValues({ ...fieldValues, [f.field_key]: e.target.value })
                            }
                            className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="">{f.placeholder || `اختر ${f.label}`}</option>
                            {activeOpts.map((opt) => (
                              <option key={opt.id} value={opt.option_value}>
                                {opt.option_label}
                              </option>
                            ))}
                          </select>
                        ) : f.field_type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={val}
                            onChange={(e) =>
                              setFieldValues({ ...fieldValues, [f.field_key]: e.target.value })
                            }
                            placeholder={f.placeholder || ''}
                            className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        ) : f.field_type === 'boolean' ? (
                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) =>
                                setFieldValues({ ...fieldValues, [f.field_key]: e.target.checked })
                              }
                              className="accent-[#FFC500]"
                            />
                            <span>نعم</span>
                          </label>
                        ) : (
                          <input
                            type={
                              f.field_type === 'number'
                                ? 'number'
                                : f.field_type === 'date'
                                  ? 'date'
                                  : f.field_type === 'tel'
                                    ? 'tel'
                                    : f.field_type === 'url'
                                      ? 'url'
                                      : 'text'
                            }
                            value={val}
                            onChange={(e) =>
                              setFieldValues({ ...fieldValues, [f.field_key]: e.target.value })
                            }
                            placeholder={f.placeholder || ''}
                            className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">رقم التواصل (اختياري)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="77xxxxxxx"
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">صورة الإعلان</label>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#2F3336] hover:border-white text-xs text-zinc-200 cursor-pointer">
                    <ImageIcon size={14} className="text-[#FFC500]" />
                    <span>{imageFile ? imageFile.name.slice(0, 18) : 'اختر صورة'}</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-full h-32 object-cover rounded-xl border border-[#2F3336]"
                />
              )}

              <div>
                <label className="block text-xs font-bold text-white mb-1">تفاصيل إضافية</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب أي تفاصيل إضافية..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {statusMsg && (
                <p
                  className={`text-xs font-bold ${
                    statusMsg.type === 'error' ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {statusMsg.text}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white hover:border-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#FFC500] hover:bg-[#e6b100] disabled:opacity-50 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{submitting ? 'جاري النشر...' : 'نشر الإعلان'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
