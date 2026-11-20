import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { YRSelect } from '../common/YRSelect';
import { YEMEN_GOV_FORM_OPTIONS, XMarketItem, toWaLink, toArabicMarketError } from '../common/XMarketUI';
import { getMyBusinessPage } from '../../services/businessPageService';

interface Props { job: any | null; jobItem?: XMarketItem | null; commissionText: string; onClose: () => void; onSuccess: (msg: string) => void; }

export const XJobApplyModal: React.FC<Props> = ({ job, jobItem, commissionText, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('صنعاء');
  const [expYears, setExpYears] = useState(1);
  const [qualifications, setQualifications] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!job) return;
    setErrMsg('');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const uid = session.user.id;
      const meta: any = session.user.user_metadata || {};
      const [{ data: p }, biz] = await Promise.all([
        supabase.from('profiles').select('full_name, phone').eq('id', uid).maybeSingle(),
        getMyBusinessPage(uid),
      ]);
      const autoName = (p?.full_name || biz?.name || meta.full_name || meta.name || '').trim();
      const autoPhone = String(p?.phone || biz?.phone || meta.phone || '').replace(/\D/g, '').slice(-9);
      if (autoName) setName((prev) => prev || autoName);
      if (autoPhone) setPhone((prev) => prev || autoPhone);
      if (biz?.city) setCity(biz.city);
    }).catch(() => {});
  }, [job?.id]);

  if (!job) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrMsg('');
    const cleanPhone = phone.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '');
    if (!name.trim()) { setErrMsg('يرجى إدخال الاسم الكامل'); return; }
    if (!/^(73|71|77|78)\d{7}$/.test(cleanPhone)) { setErrMsg('الرقم خاطئ'); return; }
    if (!agreed) { setErrMsg('يرجى الموافقة على شروط الوساطة للمتابعة'); return; }
    try {
      setSubmitting(true); let cvUrl = '';
      if (cvFile) {
        const fn = `cv_${Date.now()}.${cvFile.name.split('.').pop()}`;
        const { error: ue } = await supabase.storage.from('cvs').upload(fn, cvFile);
        if (!ue) cvUrl = supabase.storage.from('cvs').getPublicUrl(fn).data?.publicUrl || '';
      }
      const { data: { session } } = await supabase.auth.getSession();
      const combinedCoverLetter = `المحافظة: ${city}\nسنوات الخبرة: ${Number(expYears) || 0}\n\nالمؤهلات والخبرات:\n${qualifications.trim()}${cvUrl ? `\n\n[السيرة الذاتية]: ${cvUrl}` : ''}`;
      const { error } = await supabase.from('job_applications').insert([{ job_id: job.id, name: name.trim(), phone: cleanPhone, cv_url: cvUrl || null, cv_file_name: cvFile ? cvFile.name : null, cover_letter: combinedCoverLetter, status: 'PENDING', created_at: new Date().toISOString() }]);
      if (error) throw error;
      const employerPhone = (jobItem?.phone || job?.contact_phone || job?.phone || '').trim();
      if (employerPhone) {
        const waLines: string[] = [
          `مرحباً، أرغب بالتقديم على وظيفة: ${jobItem?.title || job.title}`,
          jobItem?.authorName ? `اسم الناشر: ${jobItem.authorName}` : '',
          `هاتف الناشر: ${employerPhone}`,
          `اسم المتقدم: ${name.trim()}`,
          `هاتف المتقدم: ${cleanPhone}`,
          jobItem?.city || job.city ? `المحافظة: ${jobItem?.city || job.city}` : '',
          jobItem?.priceText ? `الراتب: ${jobItem.priceText}` : '',
          ...(jobItem?.specPairs || [])
            .filter((sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق', '-'].includes(sp.value.trim()))
            .map((sp) => `• ${sp.label}: ${sp.value}`),
          '',
          'بيانات المتقدم:',
          `• الاسم: ${name.trim()}`,
          `• الهاتف: ${cleanPhone}`,
          `• المحافظة: ${city}`,
          `• سنوات الخبرة: ${Number(expYears) || 0}`,
          `• المؤهلات والخبرات: ${qualifications.trim()}`,
          cvUrl ? `• السيرة الذاتية: ${cvUrl}` : '',
        ].filter(Boolean);
        const waUrl = toWaLink(employerPhone, waLines.join('\n'));
        if (waUrl) {
          const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
          if (!opened) window.location.href = waUrl;
        }
      }
      onSuccess('تم إرسال طلب التقديم وسيرتك الذاتية بنجاح!'); onClose();
    } catch (err: any) { setErrMsg(toArabicMarketError(err, 'تعذر إرسال الطلب')); } finally { setSubmitting(false); }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl text-white">
        <div className="w-10 h-1 rounded-full bg-[#2F3336] mx-auto mt-2.5 sm:hidden" />
        <div className="px-4 py-3 border-b border-[#2F3336] flex items-center gap-2">
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"><X size={18} /></button>
          <h3 className="text-[14px] font-black truncate flex items-center gap-1.5"><Briefcase size={15} className="text-[#FFC500] shrink-0" /><span>التقديم: {job.title}</span></h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs max-h-[78vh] overflow-y-auto">
          {errMsg && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">{errMsg}</div>}
          <div><label className="text-[11px] text-[#71767B] font-bold block mb-1">الاسم الكامل *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white outline-none" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2"><label className="text-[11px] text-[#71767B] font-bold block mb-1">رقم الهاتف *</label><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white font-mono outline-none" /></div>
            <div><label className="text-[11px] text-[#71767B] font-bold block mb-1">الخبرة (سنوات)</label><input type="number" min="0" value={expYears} onChange={(e) => setExpYears(Number(e.target.value))} className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white font-mono outline-none" /></div>
          </div>
          <div><label className="text-[11px] text-[#71767B] font-bold block mb-1">المحافظة</label><YRSelect compact value={city} onChange={setCity} options={YEMEN_GOV_FORM_OPTIONS} /></div>
          <div><label className="text-[11px] text-[#71767B] font-bold block mb-1">المؤهلات والخبرات *</label><textarea rows={2} required value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="مثال: بكالوريوس محاسبة، خبرة 3 سنوات..." className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white outline-none resize-none" /></div>
          <label className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-black border border-dashed border-[#2F3336] hover:border-white cursor-pointer transition"><Upload size={15} className="text-[#FFC500]" /><span className="text-xs font-bold text-white/80 truncate">{cvFile ? cvFile.name : 'إرفاق السيرة الذاتية (PDF / Word - اختياري)'}</span><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="hidden" /></label>
          <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-[#2F3336] cursor-pointer"><input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#FFC500]" /><span className="text-[10.5px] text-slate-300 leading-relaxed">أقر بالتزامي بسداد عمولة التوظيف للمنصة (<strong className="text-[#FFC500]">{commissionText}</strong>) عند قبول ترشيحي ومباشرة العمل.</span></label>
          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"><CheckCircle2 size={15} /><span>{submitting ? 'جاري الإرسال...' : 'إرسال طلب التقديم'}</span></button>
        </form>
      </div>
    </div>
  );
};
