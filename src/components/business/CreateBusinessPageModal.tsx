import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowRight, Camera, Building2, ChevronDown, Search, Check, X } from 'lucide-react';
import {
  YEMEN_GOVERNORATES, UnifiedTaxonomyCategory,
  fetchUnifiedBusinessTaxonomy, mapMainSlugToBusinessType,
} from '../../constants/businessTaxonomy';

export interface BusinessPageDraft {
  id?: string; name: string; username: string; businessType: string;
  categoryId?: string | null; subCategory?: string; city: string;
  phone: string; description: string; avatarUrl: string; coverUrl: string;
}

interface Props {
  isOpen: boolean; onClose: () => void; onCreated: (draft: BusinessPageDraft) => void; isSubmitting?: boolean;
}

export const CreateBusinessPageModal: React.FC<Props> = ({ isOpen, onClose, onCreated, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [mains, setMains] = useState<UnifiedTaxonomyCategory[]>([]);
  const [subsByParent, setSubsByParent] = useState<Record<string, UnifiedTaxonomyCategory[]>>({});
  const [allSubs, setAllSubs] = useState<UnifiedTaxonomyCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('صنعاء');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [picker, setPicker] = useState<'category' | 'city' | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || allSubs.length > 0) return;
    fetchUnifiedBusinessTaxonomy().then((res) => {
      setMains(res.mains); setSubsByParent(res.subsByParent); setAllSubs(res.allSubs);
      if (!categoryId && res.allSubs[0]) setCategoryId(res.allSubs[0].id);
    });
  }, [isOpen]);

  const selectedSub = useMemo(() => allSubs.find((s) => s.id === categoryId), [allSubs, categoryId]);

  if (!isOpen) return null;

  const handleFilePreview = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') target === 'avatar' ? setAvatarUrl(reader.result) : setCoverUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(null);
    const cleanName = name.trim();
    const cleanUsername = username.trim().replace(/^@+/, '').replace(/\s+/g, '_');
    if (!cleanName) { setErrorMsg('يرجى إدخال اسم المنشأة'); return; }
    if (!cleanUsername) { setErrorMsg('يرجى إدخال معرّف المنشأة'); return; }
    if (!categoryId) { setErrorMsg('يرجى اختيار تصنيف المنشأة'); return; }
    const parent = mains.find((m) => m.id === selectedSub?.parent_id);
    onCreated({
      name: cleanName, username: cleanUsername, categoryId,
      subCategory: selectedSub?.short_name || selectedSub?.name || '',
      businessType: mapMainSlugToBusinessType(parent?.slug),
      city, phone: phone.trim(), description: description.trim(), avatarUrl, coverUrl,
    });
  };

  const q = catSearch.trim().toLowerCase();
  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col overflow-y-auto" dir="rtl">
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePreview(e, 'avatar')} />
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePreview(e, 'cover')} />
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-between px-4 h-[76px] border-b border-[#2F3336]">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition"><ArrowRight size={22} /></button>
          <h2 className="text-white font-black text-base">إنشاء صفحة منشأة</h2>
        </div>
        <button type="submit" form="create-business-page-form" disabled={isSubmitting} className="px-5 py-2 rounded-full bg-[#FFC500] text-black font-black text-xs hover:opacity-90 transition disabled:opacity-50">
          {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الصفحة'}
        </button>
      </div>
      <form id="create-business-page-form" onSubmit={handleSubmit} className="flex-1 pb-24">
        <div className="relative w-full h-36 sm:h-44 bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black">
          {coverUrl && <img src={coverUrl} alt="غلاف" className="w-full h-full object-cover" />}
          <button type="button" onClick={() => coverRef.current?.click()} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20"><Camera size={20} /></button>
        </div>
        <div className="px-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 -mt-12 sm:-mt-14 rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">
            {avatarUrl ? <img src={avatarUrl} alt="شعار" className="w-full h-full object-cover" /> : <Building2 size={32} className="text-[#71767B]" />}
            <button type="button" onClick={() => avatarRef.current?.click()} className="absolute inset-0 bg-black/50 hover:bg-black/30 flex items-center justify-center text-white"><Camera size={22} /></button>
          </div>
        </div>
        <div className="px-4 pt-6 space-y-4 max-w-xl mx-auto">
          {errorMsg && <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{errorMsg}</div>}
          <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">اسم المنشأة *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="مثال: مطعم الشيباني" className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B]" required />
          </div>
          <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">معرّف المنشأة *</label>
            <div className="flex items-center gap-1" dir="ltr"><span className="text-[#71767B] text-sm pb-2">@</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={40} placeholder="alshaibani_ye" className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B]" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => { setCatSearch(''); setPicker('category'); }} className="border-b border-[#2F3336] hover:border-white transition py-1 text-right">
              <span className="block text-[#71767B] text-xs font-bold mb-1">التصنيف *</span>
              <span className="flex items-center justify-between pb-2 text-sm text-white"><span className="truncate">{selectedSub?.name || 'اختر التصنيف'}</span><ChevronDown size={15} className="text-[#71767B] shrink-0" /></span>
            </button>
            <button type="button" onClick={() => setPicker('city')} className="border-b border-[#2F3336] hover:border-white transition py-1 text-right">
              <span className="block text-[#71767B] text-xs font-bold mb-1">المحافظة</span>
              <span className="flex items-center justify-between pb-2 text-sm text-white"><span className="truncate">{city}</span><ChevronDown size={15} className="text-[#71767B] shrink-0" /></span>
            </button>
          </div>
          <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">رقم الهاتف / الواتساب</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="770000000" dir="ltr" className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B] text-right" />
          </div>
          <div className="border-b border-[#2F3336] focus-within:border-white transition py-1">
            <label className="block text-[#71767B] text-xs font-bold mb-1">نبذة عن المنشأة</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} placeholder="صف خدمات المنشأة ونشاطها..." className="w-full bg-transparent text-white text-sm pb-2 outline-none caret-white placeholder-[#71767B] resize-none" />
            <span className="text-[10px] text-[#71767B]">{description.length}/160</span>
          </div>
        </div>
      </form>
      {picker && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setPicker(null)}>
          <div className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-3xl max-h-[82vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2F3336]">
              <h3 className="text-white font-bold text-sm">{picker === 'category' ? 'اختر تصنيف المنشأة' : 'اختر المحافظة'}</h3>
              <button type="button" onClick={() => setPicker(null)} className="text-[#71767B] hover:text-white"><X size={18} /></button>
            </div>
            {picker === 'category' && (
              <div className="px-4 py-2.5 border-b border-[#2F3336] flex items-center gap-2 bg-black">
                <Search size={15} className="text-[#71767B]" />
                <input type="text" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="ابحث باسم التصنيف..." className="w-full bg-transparent text-white text-xs outline-none caret-white placeholder-[#71767B]" />
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {picker === 'category' ? mains.map((m) => {
                const subs = (subsByParent[m.id] || []).filter((sub) => !q || sub.name.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
                if (subs.length === 0) return null;
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-black text-[#71767B]">{m.name}</div>
                    {subs.map((sub) => (
                      <button key={sub.id} type="button" onClick={() => { setCategoryId(sub.id); setPicker(null); }} className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${categoryId === sub.id ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5'}`}>
                        <span>{sub.name}</span>{categoryId === sub.id && <Check size={14} className="text-[#FFC500]" />}
                      </button>
                    ))}
                  </div>
                );
              }) : YEMEN_GOVERNORATES.map((g) => (
                <button key={g} type="button" onClick={() => { setCity(g); setPicker(null); }} className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${city === g ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5'}`}>
                  <span>{g}</span>{city === g && <Check size={14} className="text-[#FFC500]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
