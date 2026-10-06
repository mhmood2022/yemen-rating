import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ArrowRight, ShieldCheck, CheckCircle2, FileText, Upload, Trash2, AlertCircle, X, Award, Building2, Sparkles, Send, Loader2, Image } from "lucide-react";
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../../components/common/AdBanner';

export const JobDetailsPage: React.FC = () => {

  const [isApplySuccess, setIsApplySuccess] = useState(false);

  // دالة تحويل المؤهلات إلى أزرار/شارات أنيقة
  const parseRequirementsList = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (_) {}
      return raw.split(/\r?\n|,/).map((s: string) => s.replace(/^[•\-\*\"\[\]]\s*/, '').replace(/["\[\]]/g, '').trim()).filter(Boolean);
    }
    return [];
  };

  const formatJobSalary = (raw: string = '') => {
    if (!raw) return 'عند المقابلة';
    let s = raw.trim();
    if (s.includes('عند المقابلة') || s.includes('بحسب المقابلة')) {
      return 'عند المقابلة';
    }
    s = s.replace(/\s*\(قابل للتفاوض\)/g, '').trim();
    return s;
  };


  // دالة حجب معلومات جهة النشر والتواصل الخاصة بالإدارة
  const getPublicJobDescription = (rawDesc: string = '') => {
    if (!rawDesc) return '';
    let cleaned = rawDesc.split('--- [بيانات جهة النشر والوساطة] ---')[0];
    cleaned = cleaned.split('[معلومات جهة العمل والتواصل]')[0];
    cleaned = cleaned.split('[ملف الوصف الوظيفي PDF]')[0];
    cleaned = cleaned.split('[وثائق وشهادات المتقدم]')[0];
    cleaned = cleaned.split('[مرفقات الصور]')[0];
    return cleaned.trim();
  };

  const getJobPdfAttachment = (rawDesc: string = '') => {
    if (!rawDesc) return null;
    const match = rawDesc.match(/\[ملف الوصف الوظيفي PDF\]:\s*([^\n\r\s]+)/);
    return match ? match[1] : null;
  };

  // قراءة عمولة المتقدم المحددة من الإدارة
  const getApplicantCommissionConfig = () => {
    try {
      const saved = localStorage.getItem('yr_job_commission_config');
      if (saved) return JSON.parse(saved).applicant;
    } catch (_) {}
    return { amount: 20000, currency: 'ريال يمني', is_free: false };
  };

  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCity, setApplicantCity] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [agreedToApplicantPolicy, setAgreedToApplicantPolicy] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<{ file: File; name: string; size: string } | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // دالة ضغط الصور لتقليل الحجم بنسبة 80% مع الحفاظ على وضوح الوثائق
  const compressImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob || file),
            'image/jpeg',
            0.75
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', slug)
          .maybeSingle();

        if (error) throw error;
        setJob(data);
      } catch (err: any) {
        setError(err.message || 'تعذر تحميل بيانات الوظيفة');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [slug]);

  
    // دالة ضغط الصور التلقائي
  const compressImageBlob = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.75);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const [pdfUploadStatus, setPdfUploadStatus] = useState<string | null>(null);
  const [imagesUploadStatus, setImagesUploadStatus] = useState<string | null>(null);
  const [directCvUrl, setDirectCvUrl] = useState<string | null>(null);
  const [directImageUrls, setDirectImageUrls] = useState<string[]>([]);

  // الرفع الفوري التلقائي لملف الـ PDF فور اختياره
  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setModalError('يرجى اختيار ملف بصيغة PDF فقط للسيرة الذاتية');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalError('حجم ملف الـ PDF يجب ألا يتجاوز 10 ميجابايت');
      return;
    }

    setModalError(null);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedPdf({ file, name: file.name, size: sizeMb + ' ميجابايت' });
    setUploadingFiles(true);
    setPdfUploadStatus('جارٍ رفع ملف السيرة الذاتية...');

    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '') || 'cv.pdf';
      const filePath = `jobs/cvs/${Date.now()}_${cleanName}`;

      const { error: upErr } = await supabase.storage.from("media").upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: true
      });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        setDirectCvUrl(urlData.publicUrl);
        setPdfUploadStatus('✅ تم رفع ملف السيرة الذاتية بنجاح!');
      }
    } catch (err: any) {
      console.error('Upload CV error:', err);
      setModalError('تعذر رفع ملف السيرة الذاتية: ' + (err.message || 'خطأ في التخزين'));
      setPdfUploadStatus('❌ فشل الرفع');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  // الضغط والرفع الفوري التلقائي لصور الشهادات
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - selectedImages.length;
    if (remainingSlots <= 0) {
      setModalError('الحد الأقصى للمرفقات هو 4 صور فقط');
      return;
    }

    setModalError(null);
    const newFiles = Array.from(files).slice(0, remainingSlots);
    const addedPreviews = newFiles.map(f => ({
      file: f,
      name: f.name,
      preview: URL.createObjectURL(f)
    }));
    setSelectedImages(prev => [...prev, ...addedPreviews]);
    setUploadingFiles(true);
    setImagesUploadStatus('جارٍ ضغط ورفع الصور...');

    try {
      const uploaded: string[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        const f = newFiles[i];
        const compressed = await compressImageBlob(f);
        const cleanName = f.name.replace(/[^a-zA-Z0-9.]/g, '') || 'cert.jpg';
        const filePath = `jobs/applicants/${Date.now()}_${i}_${cleanName}`;

        const { error: upErr } = await supabase.storage.from("media").upload(filePath, compressed, {
          contentType: 'image/jpeg',
          upsert: true
        });

        if (!upErr) {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
          if (urlData?.publicUrl) uploaded.push(urlData.publicUrl);
        }
      }

      setDirectImageUrls(prev => [...prev, ...uploaded]);
      setImagesUploadStatus(`✅ تم رفع ${uploaded.length} صور مضغوطة بنجاح!`);
    } catch (err: any) {
      console.error('Upload cert error:', err);
      setModalError('تعذر رفع بعض الصور المرفقة');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => {
      const target = prev[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  

  const handleRemovePdf = () => {
    setSelectedPdf(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setApplicantPhone(numeric);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (uploadingFiles) {
      setModalError('يرجى الانتظار حتى يكتمل رفع وضغط المرفقات.');
      return;
    }
    if (applicantPhone.length !== 9) {
      setModalError('يرجى إدخال رقم هاتف مكون من 9 أرقام (مثال: 77XXXXXXX)');
      return;
    }
    if (!agreedToApplicantPolicy) {
      setModalError('يرجى الموافقة على شروط الوساطة وسداد العمولة للمتابعة');
      return;
    }

    try {
      setSubmitting(true);

      // دمج بيانات المتقدم والمرفقات داخل cover_letter
      let combinedCoverLetter = `المدينة والسكن: ${applicantCity.trim() || 'غير محدد'}\n\nالمؤهلات والخبرات:\n${qualifications.trim() || 'لا توجد تفاصيل إضافية'}`;
      if (directCvUrl) {
        combinedCoverLetter += `\n\n[ملف السيرة الذاتية (CV)]: ${directCvUrl}`;
      }
      if (directImageUrls.length > 0) {
        combinedCoverLetter += `\n\n[وثائق وشهادات المتقدم]:\n${directImageUrls.join('\n')}`;
      }

      const payload = {
        job_id: job.id,
        name: applicantName.trim(),
        phone: applicantPhone.trim(),
        cv_url: directCvUrl || null,
        cv_file_name: selectedPdf ? selectedPdf.name : null,
        cover_letter: combinedCoverLetter,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      const { data: insertedAppData, error: appError } = await supabase
        .from('job_applications')
        .insert([payload])
        .select();

      if (appError) throw appError;

      // إرسال إشعار فوري لحظي لمركز تنبيهات الإدارة
      try {
        await supabase.from('admin_notifications').insert([{
          title: `💼 طلب توظيف جديد: ${job.title || "وظيفة جديدة"}`,
          message: `المتقدم: ${applicantName.trim()} | الهاتف: ${applicantPhone.trim()}${applicantCity.trim() ? " | " + applicantCity.trim() : ""}`,
          type: "job_application",
          entity_type: "job_application",
          entity_id: insertedAppData?.[0]?.id || String(job.id),
          link: "/admin/jobs?tab=applications",
          is_read: false
        }]);
      } catch (e) {
        console.warn("Could not insert admin notification:", e);
      }

      setIsApplyModalOpen(false);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantCity('');
      setQualifications('');
      setAgreedToApplicantPolicy(false);
      setSelectedImages([]);
      setSelectedPdf(null);

      setIsApplySuccess(true);
      setToastMessage('🎉 تم إرسال طلبك بنجاح!');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error('Application submission error:', err);
      let arabicMsg = 'حدث خطأ أثناء إرسال طلب التقديم.';
      const raw = err?.message || '';

      if (raw.includes('violates row-level security')) {
        arabicMsg = 'تم منع الإرسال بواسطة نظام الأمان (RLS). يرجى التأكد من تشغيل كود SQL في Supabase.';
      } else if (raw.includes('Could not find the') && raw.includes('column')) {
        const match = raw.match(/'([^']+)' column/);
        arabicMsg = `الحقل (${match ? match[1] : ''}) غير موجود في جدول طلبات التوظيف.`;
      } else if (raw.includes('violates not-null constraint')) {
        const match = raw.match(/column "([^"]+)"/);
        arabicMsg = `يرجى إكمال الحقل الإلزامي (${match ? match[1] : ''}).`;
      } else if (raw) {
        arabicMsg = 'تعذر الإرسال: ' + raw;
      }

      setModalError(arabicMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 text-[#FFC500] animate-spin" />
        <span className="text-xs font-bold">جارٍ تحميل بيانات الشاغر والوساطة...</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-16 text-center font-['Cairo',sans-serif] text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FFC500] flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-base font-bold">لم يتم العثور على الوظيفة المطلوبة</h2>
        <p className="text-xs text-slate-400">قد يكون الإعلان انتهى أو تم سحبه بواسطة جهة العمل.</p>
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="mt-2 px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black rounded-xl text-xs transition-colors cursor-pointer"
        >
          العودة لدليل الوظائف
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo',sans-serif] text-white">
      <AdBanner placementId="4" className="mb-2" />

      {/* التنبيه المنبثق الأخضر عند النجاح */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-[#FFC500] text-black px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* شريط الرجوع والحالة */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => navigate('/jobs')}
          className="px-3.5 py-1.5 rounded-xl bg-[#111625] border border-slate-800 text-xs font-bold text-slate-300 hover:text-[#FFC500] hover:border-[#FFC500]/40 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight size={14} />
          <span>الرجوع للوظائف</span>
        </button>
        <span className="text-xs px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>متاحة للتقديم الآن</span>
        </span>
      </div>

      {/* بطاقة تفاصيل الوظيفة الرئيسية */}
      <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-5 sm:p-7 space-y-6 shadow-2xl">
        
        {/* عنوان الوظيفة وحفظ سرية المنشأة */}
        <div className="border-b border-slate-800/80 pb-5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#FFC500]">
            <Briefcase size={15} />
            <span>تفاصيل الوظيفة</span>
          </div>
          

          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {job.title}
          </h1>

          {/* حجب اسم المنشأة وأرقامها لحفظ عمولة المنصة */}
          

          {/* البادجات */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {job.city && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <MapPin size={13} className="text-[#FFC500]" />
                <span>{job.city}</span>
              </span>
            )}
            {job.type && (
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                {job.type}
              </span>
            )}
            {job.experience && (
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                خبرة: {job.experience}
              </span>
            )} 
              {job.gender && (
                <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                  الجنس: {job.gender}
                </span>
              )}
          </div>
        </div>

        {/* تفاصيل الوظيفة والشروط */}
        <div className="space-y-4 text-xs sm:text-sm">
          {job.description && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                <Briefcase size={15} />
                <span>الوصف العام للوظيفة والمهام:</span>
              </h2>
              <p className="text-slate-300 leading-relaxed bg-[#070A12] p-4 rounded-xl border border-slate-800/80 whitespace-pre-line text-xs sm:text-sm">
                {getPublicJobDescription(job.description)}
              </p>

              {/* زر الاطلاع على ملف الوصف PDF إن وُجد */}
              {(() => {
                const pdf = getJobPdfAttachment(job.description);
                if (!pdf) return null;
                return (
                  <div className="pt-2">
                    <a
                      href={pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition"
                    >
                      <FileText size={15} /> الاطلاع على ملف بطاقة الوصف الوظيفي (PDF)
                    </a>
                  </div>
                );
              })()}
            </div>
          )}

          {job.requirements && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                <Award size={15} />
                <span>المؤهلات والشروط المطلوبة:</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {parseRequirementsList(job.requirements).map((req: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 size={13} className="text-blue-400" />
                    <span>{req}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-[#FFC500]">المهارات والمسؤوليات الأساسية:</h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#111625] border border-slate-800 text-slate-300 text-xs">
                    • {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* صندوق الراتب */}
          <div className="bg-[#111625] p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-bold text-xs sm:text-sm">الراتب:</span>
            <span className="text-xs sm:text-sm font-black text-[#FFC500]">
              {formatJobSalary(job.salary)}
            </span>
          </div>
        </div>

        {/* الشريط السفلي وزر التقديم */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>يتم التقديم وحفظ البيانات والوساطة وفق سياسة يمن ريتنغ المعتمدة.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setIsApplyModalOpen(true);
            }}
            className="w-full sm:w-auto px-7 py-3 bg-[#FFC500] hover:bg-amber-400 text-black font-black rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={15} />
            <span>التقديم على الوظيفة</span>
          </button>
        </div>

      </div>

      {/* نافذة التقديم بتصميم لوحة التحكم الفاخر ودعم المرفقات */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            dir="rtl"
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo',sans-serif] text-slate-200 my-auto text-right"
          >
            {/* رأس النموذج الفاخر */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070A12] shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#FFC500]/10 text-[#FFC500]">
                    <Briefcase size={20} />
                  </span>
                  التقديم على الوظيفة
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  للشاغر الوظيفي: <span className="text-[#FFC500] font-bold">{job.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* جسم النموذج */}
            <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4 text-xs divide-y divide-slate-800/80">
              {isApplySuccess && (
                <div className="mx-6 my-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-center space-y-2 animate-bounce">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-sm font-black text-white">🎉 تم إرسال طلب التوظيف بنجاح!</h3>
                  <p className="text-xs text-emerald-200">
                    تم استلام طلبك وتوثيق بياناتك بأمان، وسيقوم فريق المنصة بالتنسيق معك فوراً.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsApplySuccess(false);
                      setIsApplyModalOpen(false);
                    }}
                    className="px-5 py-2 bg-[#FFC500] text-black font-black text-xs rounded-xl shadow-md cursor-pointer mt-1"
                  >
                    تم، حسناً
                  </button>
                </div>
              )}
              
              {/* ① بيانات المتقدم الأساسية */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-white font-bold mb-1">الاسم الكامل *</label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: محمد أحمد علي الحكيمي"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white font-bold mb-1">
                      رقم الواتساب للتواصل * <span className="text-[#FFC500] text-[10px]">(9 أرقام بالضبط)</span>
                    </label>
                    <input
                      required
                      type="tel"
                      maxLength={9}
                      value={applicantPhone}
                      onChange={handlePhoneChange}
                      placeholder="77XXXXXXX"
                      className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white font-mono text-left outline-none transition"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      تم إدخال: {applicantPhone.length} من 9 أرقام
                    </span>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-1">المدينة والسكن الحالي *</label>
                    <input
                      required
                      type="text"
                      placeholder="مثال: صنعاء - حدة"
                      value={applicantCity}
                      onChange={(e) => setApplicantCity(e.target.value)}
                      className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-1">المؤهلات والخبرات العملية *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="اكتب نبذة مختصرة عن مؤهلك العلمي، وعدد سنوات خبرتك في هذا المجال..."
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2.5 text-white outline-none transition"
                  />
                </div>
              </div>

              {/* ② قسم المرفقات: السيرة الذاتية PDF + وثائق وشهادات من 1 إلى 4 صور */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                  <Upload size={14} /> السيرة الذاتية والمرفقات الثبوتية (اختياري)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* رفع ملف السيرة الذاتية PDF */}
                  <div className="p-3 bg-[#111625] border border-slate-700/80 rounded-xl space-y-2">
                    <span className="text-white font-bold block text-[11px] flex items-center gap-1">
                      <FileText size={13} className="text-red-400" /> ملف السيرة الذاتية (CV - PDF)
                    </span>
                    {!selectedPdf ? (
                      <label className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-600 rounded-lg hover:border-[#FFC500] hover:bg-[#161D2B] transition cursor-pointer text-center">
                        <Upload size={18} className="text-slate-400 mb-1" />
                        <span className="text-[11px] text-slate-300 font-bold">اضغط لاختيار ملف السيرة الذاتية</span>
                        <span className="text-[9px] text-slate-500">صيغة PDF فقط - حتى 10 ميجابايت</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handlePdfSelect}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-[#070A12] border border-red-500/30 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-red-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-white text-[11px] truncate">{selectedPdf.name}</p>
                            <p className="text-[9px] text-slate-400">{selectedPdf.size}</p>
                      {pdfUploadStatus && <span className="text-[10px] text-amber-400 font-bold block mt-0.5">{pdfUploadStatus}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* رفع وثائق وشهادات المتقدم من 1 إلى 4 صور */}
                  <div className="p-3 bg-[#111625] border border-slate-700/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white font-bold flex items-center gap-1">
                        <Image size={13} className="text-blue-400" /> شهادات الخبرة والوثائق
                      </span>
                      <span className="text-slate-400 font-mono">({selectedImages.length} من 4)</span>
                    </div>

                    {selectedImages.length < 4 && (
                      <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-600 rounded-lg hover:border-[#FFC500] hover:bg-[#161D2B] transition cursor-pointer text-center">
                        <Upload size={14} className="text-slate-400" />
                        <span className="text-[11px] text-slate-300 font-bold">إضافة صور (1 إلى 4)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}

                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {selectedImages.map((img, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-square bg-[#070A12]">
                            <img src={img.preview} alt="معاينة" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition cursor-pointer"
                              title="حذف الصورة"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ③ إقرار عمولة الوساطة الإلزامية للمتقدم بمبالغ الإدارة */}
              {(() => {
                const appComm = getApplicantCommissionConfig();
                const commText = appComm.is_free ? "مجانية" : `${Number(appComm.amount || 20000).toLocaleString()} ${appComm.currency || "ريال يمني"}`;

                return (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-right pt-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <ShieldCheck size={16} />
                      <span>تنبيه وإقرار الوساطة المعتمدة:</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {appComm.is_free ? (
                        "توفر منصة يمن ريتنغ خدمة الوساطة والتقديم على هذا الشاغر مجاناً بالكامل للباحثين عن عمل دون أي عمولة."
                      ) : (
                        `توفر لك منصة يمن ريتنغ خدمة الوساطة والتنسيق الرسمي مع المنشأة. وبتقديم الطلب، يقرّ المتقدم ويلتزم بسداد عمولة الوساطة المعتمدة للمنصة والبالغة (${commText}) من راتب الشهر الأول فقط، وذلك عند اجتياز المقابلة واستلام العمل ومباشرته.`
                      )}
                    </p>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToApplicantPolicy}
                        onChange={(e) => setAgreedToApplicantPolicy(e.target.checked)}
                        className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-white">
                        {appComm.is_free
                          ? "أوافق على شروط الوساطة والتقديم على الوظيفة (خدمة مجانية)"
                          : `أوافق على شروط الوساطة والالتزام بسداد عمولة المنصة (${commText}) من راتب أول شهر عند التوظيف`}
                      </span>
                    </label>
                  </div>
                );
              })()}

              {/* شريط الأخطاء العربي إن وجد */}
              {modalError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* ④ أزرار الإجراءات */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111625] hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToApplicantPolicy || applicantPhone.length !== 9 || submitting || uploadingFiles}
                  className="px-6 py-2.5 rounded-xl bg-[#FFC500] hover:bg-amber-400 disabled:opacity-40 text-black font-black text-xs transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>جارٍ الرفع والإرسال...</span>
                    </>
                  ) : (
                    <span>إرسال طلب التوظيف 🚀</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
