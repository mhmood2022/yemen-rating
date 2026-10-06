import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase, Plus, DollarSign, Settings, MapPin, CheckCircle2, AlertCircle, Loader2, Users, Phone, MessageCircle, Mail, FileText, Trash2, Clock, Edit3, Pause, Play, ExternalLink, X, Check, ShieldCheck, Download, Eye, Image, Share2 } from "lucide-react";
import { AddJobModal, JobFormData } from "./AddJobModal";
import { supabase } from "../../../lib/supabase";

export const JobsManager: React.FC = () => {

  const handleShareApplicant = (app: any, targetCv: string | null, certs: string[]) => {
    const jobTitle = app.jobs?.title || "شاغر وظيفي";
    let text = `📄 *طلب توظيف جديد - منصة يمن ريتنغ*\n\n👤 *المتقدم:* ${app.name}\n💼 *الوظيفة:* ${jobTitle}\n📞 *رقم الهاتف:* ${app.phone}\n📅 *تاريخ التقديم:* ${new Date(app.created_at).toLocaleDateString('ar-YE')}\n\n${app.cover_letter || ""}`;
    
    if (targetCv) {
      text += `\n\n📎 *رابط السيرة الذاتية (CV):*\n${targetCv}`;
    }

    if (navigator.share) {
      navigator.share({
        title: `طلب توظيف: ${app.name}`,
        text: text,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };


  // دالة ذكية لاستخراج مرفقات المتقدم من نص cover_letter
  const extractApplicantAttachments = (rawText: string = '') => {
    if (!rawText) return { cleanText: '', cvUrl: null, imageUrls: [] };

    let cleanText = rawText;
    let cvUrl: string | null = null;
    let imageUrls: string[] = [];

    // استخراج رابط الـ PDF
    const cvMatch = rawText.match(/\[ملف السيرة الذاتية \(CV\)\]:\s*([^\n\r\s]+)/);
    if (cvMatch) {
      cvUrl = cvMatch[1].trim();
      cleanText = cleanText.replace(/\[ملف السيرة الذاتية \(CV\)\]:[^\n\r]*/g, '');
    }

    // استخراج روابط صور الشهادات
    const certsMatch = rawText.match(/\[وثائق وشهادات المتقدم\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (certsMatch) {
      const urlsBlock = certsMatch[1];
      const matches = urlsBlock.match(/https?:\/\/[^\s\n\r]+/g);
      if (matches) {
        imageUrls = matches.map(u => u.trim());
      }
      cleanText = cleanText.replace(/\[وثائق وشهادات المتقدم\]:[\s\S]*?(?=\n\n\[|$)/g, '');
    }

    return {
      cleanText: cleanText.trim(),
      cvUrl,
      imageUrls
    };
  };


  // دالة ذكية لقراءة واستخراج بيانات الناشر والمرفقات من الوصف
  const extractPublisherInfo = (desc: string = "") => {
    const phoneMatch = desc.match(/(?:هاتف|الهاتف)(?:[^\d]*)(7[0-9]{8})/);
    const emailMatch = desc.match(/(?:البريد الإلكتروني|إيميل|email)[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const companyMatch = desc.match(/(?:اسم المنشأة|الجهة)[:\s]*([^\n\r]+)/);
    const personMatch = desc.match(/(?:مسؤول التوظيف|المسؤول)[:\s]*([^\n\r]+)/);
    const pdfMatch = desc.match(/\[ملف الوصف الوظيفي PDF\]:\s*([^\n\r\s]+)/);

    return {
      phone: phoneMatch ? phoneMatch[1] : null,
      email: emailMatch ? emailMatch[1] : null,
      company: companyMatch ? companyMatch[1].replace("غير محدد", "").trim() : null,
      person: personMatch ? personMatch[1].replace("غير محدد", "").trim() : null,
      pdfUrl: pdfMatch ? pdfMatch[1] : null
    };
  };


  // مترجم الأخطاء الذكي إلى اللغة العربية الفصحى
  const translateErrorToArabic = (err: any): string => {
    const raw = (err?.message || err?.error_description || String(err || "")).toLowerCase();
    
    if (raw.includes("could not find the") && raw.includes("column")) {
      const colMatch = raw.match(/'([^']+)' column/);
      return `تعذر الحفظ: الحقل (${colMatch ? colMatch[1] : ""}) غير موجود في قاعدة البيانات.`;
    }
    if (raw.includes("violates not-null constraint")) {
      const colMatch = raw.match(/column "([^"]+)"/);
      return `يرجى ملء الحقل الإلزامي المطلوب (${colMatch ? colMatch[1] : ""}).`;
    }
    if (raw.includes("violates row-level security") || raw.includes("rls")) {
      return "تم رفض الإجراء بواسطة نظام الصلاحيات والأمان (RLS). يرجى التأكد من تسجيل دخول المشرف.";
    }
    if (raw.includes("duplicate key") || raw.includes("unique")) {
      return "توجد وظيفة مسجلة مسبقاً بنفس البيانات أو المعرّف.";
    }
    if (raw.includes("jwt") || raw.includes("auth") || raw.includes("unauthorized")) {
      return "انتهت صلاحية جلسة الإدارة، يرجى إعادة تسجيل الدخول للمتابعة.";
    }
    if (raw.includes("fetch") || raw.includes("network")) {
      return "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.";
    }
    return err?.message ? `حدث خطأ أثناء معالجة الطلب: ${err.message}` : "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.";
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "applications" ? "applications" : "jobs";
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">(initialTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  
  // إعدادات عمولة التوظيف للطرفين
  const [commSettings, setCommSettings] = useState<{
    employer: { amount: number; currency: string; is_free: boolean };
    applicant: { amount: number; currency: string; is_free: boolean };
  }>(() => {
    try {
      const saved = localStorage.getItem('yr_job_commission_config');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      employer: { amount: 20000, currency: 'ريال يمني', is_free: false },
      applicant: { amount: 20000, currency: 'ريال يمني', is_free: false }
    };
  });
  const [editingJob, setEditingJob] = useState<JobFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "applications") {
      setActiveTab("applications");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "jobs" | "applications") => {
    setActiveTab(tab);
    setSearchParams(tab === "applications" ? { tab: "applications" } : {});
  };

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    setIsLoadingApps(true);
    try {
      const { data: appsData, error: appsError } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, city");

      const jobsMap = new Map((jobsData || []).map(j => [String(j.id), j]));

      const enriched = (appsData || []).map(app => ({
        ...app,
        jobs: jobsMap.get(String(app.job_id)) || { title: "وظيفة عامة" }
      }));

      setApplications(enriched);
    } catch (err: any) {
      console.error("Error fetching job applications:", err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  // فتح نافذة التعديل مع تعبئة البيانات السابقة
  const handleOpenEdit = (job: any) => {
    let sMin = "";
    let sMax = "";
    let curr = "ريال يمني";
    let isNeg = false;
    if (job.salary) {
      if (job.salary.includes("قابل للتفاوض")) isNeg = true;
      if (job.salary.includes("دولار")) curr = "دولار أمريكي";
      else if (job.salary.includes("سعودي")) curr = "ريال سعودي";
      const nums = job.salary.match(/\d+/g);
      if (nums && nums.length > 0) sMin = nums[0];
      if (nums && nums.length > 1) sMax = nums[1];
    }

    const formData: JobFormData = {
      id: job.id,
      title: job.title || "",
      sector: "المحاسبة والمالية",
      workType: job.type || "دوام كامل",
      experienceLevel: job.experience_level || "متوسط (2-4 سنوات)",
      vacanciesCount: 1,
      companyId: job.company_id || undefined,
      companyName: job.company || "",
      governorate: job.city || "صنعاء",
      district: "",
      area: "",
      isRemote: (job.type || "").includes("عن بعد"),
      description: job.description || "",
      responsibilities: [],
      requirements: Array.isArray(job.requirements) ? job.requirements : (typeof job.requirements === "string" ? job.requirements.split("\n") : []),
      salaryMin: sMin,
      salaryMax: sMax,
      currency: curr,
      isSalaryNegotiable: isNeg,
      applicationMethod: "التقديم داخل يمن ريتنج",
      publishDate: job.created_at ? new Date(job.created_at).toISOString().split("T")[0] : "",
      expiryDate: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
      isFeatured: !!job.is_featured,
      showOnHome: false,
      isPinned: false,
      status: job.status === "PUBLISHED" ? "published" : "draft"
    };

    setEditingJob(formData);
    setIsModalOpen(true);
  };

  // فتح نافذة إضافة وظيفة جديدة فارغة
  
  const handleSaveCommissionSettings = async () => {
    try {
      localStorage.setItem('yr_job_commission_config', JSON.stringify(commSettings));
      
      // حفظ في قاعدة البيانات إن وُجد جدول platform_commission_settings
      if (supabase) {
        try {
          await supabase.from('platform_commission_settings').upsert([{
            id: 1,
            default_fixed_commission_amount: commSettings.employer.amount,
            default_fixed_commission_currency: commSettings.employer.currency === 'دولار أمريكي' ? 'USD' : commSettings.employer.currency === 'ريال سعودي' ? 'SAR' : 'YER',
            job_commission_config: commSettings,
            updated_at: new Date().toISOString()
          }]);
        } catch (_) {}
      }

      window.dispatchEvent(new Event('yr_commissions_updated'));
      setIsCommModalOpen(false);
      showToast("🎉 تم حفظ وتحديث سياسة عمولات الوساطة للطرفين بنجاح!", "success");
    } catch (e: any) {
      showToast("تعذر حفظ إعدادات العمولة: " + e.message, "error");
    }
  };

  const handleOpenAdd = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  // حفظ الوظيفة (إضافة جديدة أو تعديل قائمة)
  const handleSaveJob = async (newJob: JobFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      let salaryText = "";
      if (newJob.salaryMin || newJob.salaryMax) {
        salaryText = `${newJob.salaryMin || "0"} - ${newJob.salaryMax || ""} ${newJob.currency}`;
        if (newJob.isSalaryNegotiable) salaryText += " (قابل للتفاوض)";
      }

      // مطابقة 100% مع أعمدة جدول jobs الفعلي فقط
      const payload: any = {
        title: (newJob.title || "").trim(),
        company_id: newJob.companyId || null,
        city: (newJob.governorate || newJob.companyCity || "صنعاء").trim(),
        salary: salaryText || null,
        type: newJob.workType || "دوام كامل",
        experience: newJob.experienceLevel || "متوسط (2-4 سنوات)",
        description: (newJob.description || "").trim(),
        requirements: Array.isArray(newJob.requirements) ? newJob.requirements : [],
        skills: Array.isArray(newJob.responsibilities) ? newJob.responsibilities : [],
        status: newJob.status === "published" ? "PUBLISHED" : "DRAFT",
        updated_at: new Date().toISOString()
      };

      if (editingJob && editingJob.id) {
        // تحديث الوظيفة الموجودة
        const { data, error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", editingJob.id)
          .select();

        if (error) throw error;
        setJobs(prev => prev.map(j => j.id === editingJob.id ? (data?.[0] || { ...j, ...payload }) : j));
        showToast("🎉 تم حفظ وتحديث بيانات الوظيفة بنجاح!", "success");
      } else {
        // إضافة وظيفة جديدة
        payload.created_at = new Date().toISOString();
        const { data, error } = await supabase
          .from("jobs")
          .insert([payload])
          .select();

        if (error) throw error;
        if (data && data[0]) setJobs(prev => [data[0], ...prev]);
        showToast("🎉 تم نشر الوظيفة بنجاح على المنصة!", "success");
      }

      setEditingJob(null);
      return { success: true };
    } catch (err: any) {
      console.error("Save job error:", err);
      let arabicError = "حدث خطأ أثناء حفظ الوظيفة، يرجى المحاولة مرة أخرى.";
      const raw = (err?.message || "").toLowerCase();
      if (raw.includes("column") && raw.includes("not find")) {
        const match = raw.match(/'([^']+)' column/);
        arabicError = `الحقل (${match ? match[1] : ""}) غير مدعوم في قاعدة البيانات.`;
      } else if (raw.includes("violates not-null")) {
        arabicError = "يرجى تعبئة كافة الحقول الإلزامية المطلوبة.";
      } else if (raw.includes("row-level security")) {
        arabicError = "تم منع العملية بواسطة نظام حماية الصلاحيات (RLS).";
      }
      return { success: false, error: arabicError };
    }
  };

  const handleTogglePause = async (job: any) => {
    const isPaused = job.status === "PAUSED" || job.status === "DRAFT";
    const nextStatus = isPaused ? "PUBLISHED" : "PAUSED";

    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: nextStatus })
        .eq("id", job.id);

      if (error) throw error;

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: nextStatus } : j));
      showToast(
        nextStatus === "PUBLISHED" ? "🟢 تم تفعيل ونشر الوظيفة بنجاح!" : "⏸️ تم إيقاف الوظيفة مؤقتاً.",
        "success"
      );
    } catch (err: any) {
      showToast("تعذر تغيير حالة الوظيفة: " + err.message, "error");
    }
  };

  // حذف الوظيفة نهائياً
  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف وظيفة "${title}" نهائياً من المنصة؟`)) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(j => j.id !== jobId));
      showToast("تم حذف الوظيفة بنجاح! 🗑️", "success");
    } catch (err: any) {
      showToast("تعذر حذف الوظيفة: " + err.message, "error");
    }
  };

  // التحكم بطلبات التوظيف
  const handleUpdateAppStatus = async (appId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", appId);

      if (error) throw error;
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      showToast("تم تحديث حالة طلب التوظيف بنجاح", "success");
    } catch (e: any) {
      showToast("تعذر تحديث الحالة: " + e.message, "error");
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المتقدم نهائياً؟")) return;
    try {
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", appId);

      if (error) throw error;
      setApplications(prev => prev.filter(a => a.id !== appId));
      showToast("تم حذف الطلب بنجاح", "success");
    } catch (e: any) {
      showToast("تعذر الحذف: " + e.message, "error");
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif] relative" dir="rtl">
      {/* إشعار التوست */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold animate-bounce transition-all ${
          toast.type === "success"
            ? "bg-[#0E2018] border-emerald-500/50 text-emerald-400"
            : "bg-[#220E12] border-red-500/50 text-red-400"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الوظائف وفرص العمل</h1>
            <p className="text-xs text-gray-400 mt-1">تعديل ونشر وإيقاف إعلانات التوظيف ومتابعة المتقدمين لحظياً.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCommModalOpen(true)}
            className="px-4 py-2.5 bg-[#161D2B] hover:bg-[#1F2937] text-[#FFC500] border border-[#FFC500]/30 hover:border-[#FFC500]/60 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow"
          >
            <DollarSign size={15} /> إعدادات عمولة الوساطة
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors"
          >
            <Plus size={16} /> إضافة وظيفة شاغرة
          </button>
        </div>
      </div>

      {/* شريط التبويبات الفخم */}
      <div className="flex items-center gap-3 p-1.5 bg-[#0e1320] border border-[#1F2937] rounded-2xl">
        <button
          type="button"
          onClick={() => handleTabChange("jobs")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "jobs"
              ? "bg-[#1F2937] text-white shadow-lg border border-slate-700"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Briefcase size={16} className="text-blue-400" />
          <span>الوظائف الشاغرة المعروضة</span>
          <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 font-mono rounded-full">
            {jobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("applications")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "applications"
              ? "bg-[#1F2937] text-white shadow-lg border border-slate-700"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users size={16} className="text-[#FFC500]" />
          <span>طلبات التقديم (المتقدمين)</span>
          <span className="px-2 py-0.5 text-[10px] bg-[#FFC500]/20 text-[#FFC500] font-black rounded-full animate-pulse">
            {applications.length}
          </span>
        </button>
      </div>

      {/* محتوى تبويب: الوظائف الشاغرة */}
      {activeTab === "jobs" && (
        <>
          {isLoading && jobs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFC500]" />
              <span className="text-xs">جارٍ تحميل الوظائف...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-[#0b101d] border border-slate-800 rounded-3xl">
              لا توجد وظائف مضافة حالياً. اضغط على زر "إضافة وظيفة شاغرة" لنشر أول وظيفة!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const jobAppsCount = applications.filter(a => String(a.job_id) === String(job.id)).length;
                const isPaused = job.status === "PAUSED";
                const isPublished = job.status === "PUBLISHED";

                return (
                  <div key={job.id} className="p-5 rounded-3xl bg-[#0e1320] border border-[#222b42] flex flex-col justify-between gap-4 shadow-xl hover:border-slate-700 transition">
                    <div>
                      {/* الحالة والنوع وعدد المتقدمين */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                            {job.type || "دوام كامل"}
                          </span>
                          {jobAppsCount > 0 && (
                            <span 
                              onClick={() => handleTabChange("applications")}
                              className="text-[11px] text-[#FFC500] font-black bg-[#FFC500]/10 hover:bg-[#FFC500]/20 px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1 transition"
                              title="عرض المتقدمين لهذه الوظيفة"
                            >
                              <Users size={11} /> {jobAppsCount} متقدم
                            </span>
                          )}
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                          isPublished
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : isPaused
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-slate-400 bg-slate-500/10 border border-slate-500/20"
                        }`}>
                          {isPublished ? "🟢 منشور في الموقع" : isPaused ? "⏸️ متوقف مؤقتاً" : "⚪ مسودة"}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white">{job.title}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <MapPin size={13} className="text-[#FFC500]" /> {job.city || "صنعاء"}
                        {job.salary && <span>• {job.salary}</span>}
                      </p>

                      {/* صندوق بيانات جهة النشر والتواصل المباشر مع صاحب العمل */}
                      {(() => {
                        const pub = extractPublisherInfo(job.description);
                        const waMsg = encodeURIComponent("السلام عليكم أخي الكريم، نتواصل معكم من إدارة وساطة يمن ريتنغ بخصوص إعلان الوظيفة: (" + job.title + "). لدينا متقدمين مناسبين للشاغر.");
                        const mailSub = encodeURIComponent("وساطة يمن ريتنغ: بخصوص شاغر " + job.title);

                        return (
                          <div className="mt-3 p-3 bg-[#080C14] border border-[#1E293B] rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-[#FFC500] flex items-center gap-1.5">
                                🏢 جهة النشر (صاحب العمل):
                              </span>
                              {pub.company && (
                                <span className="text-white font-bold">{pub.company}</span>
                              )}
                            </div>

                            {pub.person && (
                              <p className="text-slate-300 text-[11px]">
                                المسؤول: <span className="text-white font-bold">{pub.person}</span>
                              </p>
                            )}

                            {/* أزرار الاتصال والواتساب والإيميل الخاصة بالناشر */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {pub.phone ? (
                                <>
                                  <a
                                    href={"tel:" + pub.phone}
                                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                    title="اتصال بصاحب العمل"
                                  >
                                    <Phone size={12} /> {pub.phone}
                                  </a>
                                  <a
                                    href={"https://wa.me/967" + pub.phone.replace(/^0+/, "") + "?text=" + waMsg}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                    title="مراسلة واتساب"
                                  >
                                    <MessageCircle size={12} /> واتساب صاحب العمل
                                  </a>
                                </>
                              ) : (
                                <span className="text-gray-500 text-[10px]">رقم هاتف الناشر غير متوفر</span>
                              )}

                              {pub.email && (
                                <a
                                  href={"mailto:" + pub.email + "?subject=" + mailSub}
                                  className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                  title="إرسال بريد إلكتروني"
                                >
                                  <Mail size={12} /> {pub.email}
                                </a>
                              )}

                              {pub.pdfUrl && (
                                <a
                                  href={pub.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                  title="فتح ملف PDF المرفق للوظيفة"
                                >
                                  <FileText size={12} /> ملف الوصف (PDF)
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* أزرار الإجراءات السريعة (تعديل - إيقاف مؤقت - حذف) */}
                    <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* زر التعديل */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(job)}
                          className="px-3 py-1.5 bg-[#161D2B] hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 border border-slate-700 hover:border-blue-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 size={13} /> تعديل
                        </button>

                        {/* زر الإيقاف المؤقت أو التفعيل */}
                        <button
                          type="button"
                          onClick={() => handleTogglePause(job)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                            isPublished
                              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {isPublished ? (
                            <>
                              <Pause size={13} /> إيقاف مؤقت
                            </>
                          ) : (
                            <>
                              <Play size={13} /> إعادة نشر
                            </>
                          )}
                        </button>
                      </div>

                      {/* زر الحذف */}
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition cursor-pointer"
                        title="حذف الوظيفة نهائياً"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* محتوى تبويب: المتقدمين للوظائف */}
      {activeTab === "applications" && (
        <>
          {isLoadingApps && applications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFC500]" />
              <span className="text-xs">جارٍ جلب المتقدمين...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-[#0b101d] border border-slate-800 rounded-3xl p-6">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              لا توجد طلبات تقديم حتى الآن. فور تقديم أي شخص ستظهر بياناته هنا مع إشعار فوري.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-5 rounded-3xl bg-[#0e1320] border border-[#222b42] shadow-xl hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#1F2937]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base">{app.name}</span>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          app.status === "ACCEPTED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : app.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {app.status === "ACCEPTED" ? "مقبول للمقابلة" : app.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}
                        </span>
                      </div>
                      <p className="text-xs text-[#38BDF8] mt-1 flex items-center gap-1.5 font-bold">
                        <Briefcase size={13} /> التقديم على وظيفة: {app.jobs?.title || "وظيفة شاغرة"}
                      </p>
                    </div>

                    {/* أزرار الاتصال والواتساب الفورية */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${app.phone}`}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Phone size={13} /> اتصال: {app.phone}
                      </a>
                      <a
                        href={`https://wa.me/${(app.phone || "").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageCircle size={13} /> واتساب
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* تفاصيل السكن والمؤهلات والخبرات + المرفقات الذكية */}
                  {(() => {
                    const { cleanText, cvUrl, imageUrls } = extractApplicantAttachments(app.cover_letter);
                    const effectiveCv = app.cv_url || cvUrl;
                    const hasAttachments = effectiveCv || imageUrls.length > 0;
                    const previewUrl = effectiveCv ? `https://docs.google.com/viewer?url=${encodeURIComponent(effectiveCv)}&embedded=true` : null;

                    return (
                      <div className="mt-3 space-y-3">
                        {/* النص المنظف للسكن والخبرات */}
                        <div className="bg-[#080C14] p-3.5 rounded-2xl border border-[#161D2B] text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                          {cleanText || "لا توجد تفاصيل إضافية مسجلة"}
                        </div>

                        {/* قسم المرفقات (ملف CV + شهادات ووثائق) */}
                        {hasAttachments && (
                          <div className="p-3.5 bg-[#0A0F1D] border border-amber-500/25 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <span className="text-[11px] font-bold text-[#FFC500] flex items-center gap-1.5">
                                <FileText size={14} /> مرفقات ووثائق المتقدم:
                              </span>

                              {/* زر مشاركة المرفقات والبيانات */}
                              <button
                                type="button"
                                onClick={() => handleShareApplicant(app, effectiveCv, imageUrls)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC500] border border-amber-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
                                title="مشاركة بيانات ومرفقات المتقدم"
                              >
                                <Share2 size={13} />
                                <span>مشاركة المرفقات</span>
                              </button>
                            </div>

                            {/* أزرار ملف الـ CV (معاينة بالمتصفح + تحميل مباشر) */}
                            {effectiveCv && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <a
                                  href={previewUrl!}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                  <Eye size={14} />
                                  <span>معاينة السيرة الذاتية في المتصفح (PDF)</span>
                                </a>

                                <a
                                  href={effectiveCv}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                                >
                                  <Download size={13} />
                                  <span>تحميل الملف الأصلي</span>
                                </a>
                              </div>
                            )}

                            {/* معرض صور الشهادات والوثائق */}
                            {imageUrls.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-slate-400 font-bold block">
                                  صور الشهادات والوثائق ({imageUrls.length} مرفقات):
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                  {imageUrls.map((imgUrl, imgIdx) => (
                                    <a
                                      key={imgIdx}
                                      href={imgUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group relative block aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 hover:border-[#FFC500] transition"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`مرفق ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                                        <Eye size={12} /> تكبير
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* شريط التحكم في حالة الطلب وتاريخ التقديم */}
                  <div className="mt-3 flex flex-wrap justify-between items-center text-[11px] text-gray-400 gap-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-[#FFC500]" />
                      تاريخ التقديم: {new Date(app.created_at).toLocaleDateString("ar-YE", { day: "numeric", month: "long", year: "numeric" })}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">تغيير الحالة:</span>
                      <select
                        value={app.status || "PENDING"}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                        className="bg-[#161D2B] border border-[#1F2937] text-white text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer focus:border-[#FFC500]"
                      >
                        <option value="PENDING">🟡 قيد المراجعة</option>
                        <option value="ACCEPTED">🟢 قبول للمقابلة</option>
                        <option value="REJECTED">🔴 رفض الطلب</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* المودال الشامل (إضافة جديدة / تعديل) */}
      {/* مودال إعدادات عمولات التوظيف والوساطة للطرفين */}
      {isCommModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            dir="rtl"
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 font-['Cairo',sans-serif] text-white shadow-2xl my-auto text-right"
          >
            {/* رأس المودال */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#FFC500]/10 text-[#FFC500]">
                    <DollarSign size={18} />
                  </span>
                  إعدادات عمولة وساطة التوظيف
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تحديد مبالغ وعملات العمولة المستحقة على المنشأة أو المتقدم أو جعلهما مجاناً
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCommModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* ① عمولة صاحب العمل (منشئ الوظيفة) */}
              <div className="p-4 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    🏢 عمولة المنشأة / صاحب العمل (عند النشر والوساطة):
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commSettings.employer.is_free}
                      onChange={(e) => setCommSettings({
                        ...commSettings,
                        employer: { ...commSettings.employer, is_free: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-emerald-400">خدمة مجانية</span>
                  </label>
                </div>

                {!commSettings.employer.is_free && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">مبلغ العمولة المستحقة:</label>
                      <input
                        type="number"
                        min="0"
                        value={commSettings.employer.amount}
                        onChange={(e) => setCommSettings({
                          ...commSettings,
                          employer: { ...commSettings.employer, amount: Number(e.target.value) || 0 }
                        })}
                        className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2 text-white font-mono text-left outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">العملة المعتمدة:</label>
                      <select
                        value={commSettings.employer.currency}
                        onChange={(e) => setCommSettings({
                          ...commSettings,
                          employer: { ...commSettings.employer, currency: e.target.value }
                        })}
                        className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="ريال يمني">ريال يمني (YER)</option>
                        <option value="دولار أمريكي">دولار أمريكي (USD)</option>
                        <option value="ريال سعودي">ريال سعودي (SAR)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* ② عمولة الباحث عن عمل (المتقدم) */}
              <div className="p-4 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    👤 عمولة الباحث عن عمل (تُخصم من راتب أول شهر):
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commSettings.applicant.is_free}
                      onChange={(e) => setCommSettings({
                        ...commSettings,
                        applicant: { ...commSettings.applicant, is_free: e.target.checked }
                      })}
                      className="w-4 h-4 accent-[#FFC500] rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-emerald-400">خدمة مجانية</span>
                  </label>
                </div>

                {!commSettings.applicant.is_free && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">مبلغ العمولة من راتب أول شهر:</label>
                      <input
                        type="number"
                        min="0"
                        value={commSettings.applicant.amount}
                        onChange={(e) => setCommSettings({
                          ...commSettings,
                          applicant: { ...commSettings.applicant, amount: Number(e.target.value) || 0 }
                        })}
                        className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2 text-white font-mono text-left outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">العملة المعتمدة:</label>
                      <select
                        value={commSettings.applicant.currency}
                        onChange={(e) => setCommSettings({
                          ...commSettings,
                          applicant: { ...commSettings.applicant, currency: e.target.value }
                        })}
                        className="w-full bg-[#111625] border border-slate-700/80 focus:border-[#FFC500] rounded-xl p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="ريال يمني">ريال يمني (YER)</option>
                        <option value="دولار أمريكي">دولار أمريكي (USD)</option>
                        <option value="ريال سعودي">ريال سعودي (SAR)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الحفظ والإغلاق */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCommModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#111625] hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCommissionSettings}
                className="px-6 py-2 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-lg cursor-pointer"
              >
                حفظ إعدادات العمولات ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSaveJob}
        initialData={editingJob}
      />
    </div>
  );
};

export default JobsManager;
