import {
  JOB_TYPE_OPTIONS, JOB_SECTOR_OPTIONS, JOB_EXPERIENCE_OPTIONS, JOB_GENDER_OPTIONS
} from '../../constants/marketOptions';
import { PublicAddJobModal, JobFormData } from "../jobs/PublicAddJobModal";
import { XSpinner } from '../ui/LoadingSpinner';
import { XJobApplyModal } from "../jobs/XJobApplyModal";
import {
  NOT_AVAILABLE, buildPropertyFeatures, parsePropertyFeatures
} from "../../constants/realEstateOptions";
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, RefreshCw, AlertCircle, Plus, CheckCircle2, ShieldCheck, X, Building2, MapPin, Coins, PhoneCall, FileText, Lock, Sparkles, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminAuctionsService } from '../../services/adminService';
import { AdBanner } from '../common/AdBanner';
import { MarketSponsorSlot } from '../ads/MarketSponsorSlot';
import { JobCard } from '../jobs/JobCard';
import { YRSelect } from '../common/YRSelect';
import { BadgeType } from '../common/VerifiedBadge';
import { mapBusinessToPage, getMyBusinessPage, BusinessPageRecord } from '../../services/businessPageService';
import {
  XMarketItem, XSearchFilterBar, XFilterModal, XMarketTweetCard,
  XMarketDetailView, XImageLightbox, YEMEN_GOV_FILTER_OPTIONS, toArabicMarketError
} from '../common/XMarketUI';

const YEMEN_GOVERNORATES = [
  { value: 'all', label: 'جميع المحافظات' },
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
  { value: 'سقطرى', label: 'سقطرى' },
  { value: 'الجوف', label: 'الجوف' }
];

const WORK_TYPES = [
  { value: 'all', label: 'كافة أنواع الدوام' },
  { value: 'دوام كامل', label: 'دوام كامل' },
  { value: 'دوام جزئي', label: 'دوام جزئي' },
  { value: 'عن بعد', label: 'عن بعد' },
  { value: 'عقد', label: 'عقد' }
];

const SECTORS = [
  { value: 'إدارية ومحاسبة', label: 'إدارية ومحاسبة' },
  { value: 'تقنية معلومات وبرمجة', label: 'تقنية معلومات وبرمجة' },
  { value: 'تسويق ومبيعات', label: 'تسويق ومبيعات' },
  { value: 'هندسة وتصميم', label: 'هندسة وتصميم' },
  { value: 'طب وصيدلة', label: 'طب وصيدلة' },
  { value: 'خدمات عامة', label: 'خدمات عامة' }
];

export const JobsPage: React.FC<{ onBack?: () => void; embedded?: boolean }> = ({ onBack, embedded = false }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [businessesList, setBusinessesList] = useState<BusinessPageRecord[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (!embedded) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [embedded]);
  const [selectedItem, setSelectedItem] = useState<XMarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const [commissionSettings, setCommissionSettings] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});

  // نافذة أضف وظيفة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('إدارية ومحاسبة');
  const [newWorkType, setNewWorkType] = useState('دوام كامل');
  const [newCity, setNewCity] = useState('صنعاء');
  const [newSalaryRange, setNewSalaryRange] = useState('');
  const [newExperienceLevel, setNewExperienceLevel] = useState('1-3 سنوات');
  const [newDescription, setNewDescription] = useState('');
  const [employerPhone, setEmployerPhone] = useState('');
  const [agreedToEmployerPolicy, setAgreedToEmployerPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: bizData }, { data: profData }] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').limit(200),
        supabase.from('profiles').select('*').limit(200),
      ]);

      if (error) throw error;
      if (bizData) setBusinessesList(bizData.map(mapBusinessToPage));
      if (profData) {
        const pm: Record<string, any> = {};
        profData.forEach((pr: any) => {
          if (pr.id) pm[pr.id] = pr;
          if (pr.full_name) pm[String(pr.full_name).trim()] = pr;
          if (pr.username) pm[String(pr.username).trim()] = pr;
        });
        setProfilesMap(pm);
      }
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    adminAuctionsService.getPlatformCommissionSettings?.().then((res: any) => {
      if (res?.data) setCommissionSettings(res.data);
    }).catch(() => {});
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id;
      if (!uid) return;
      const meta: any = session.user.user_metadata || {};
      const [{ data: prof }, biz] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        getMyBusinessPage(uid),
      ]);
      const emailH = session.user.email ? session.user.email.split('@')[0] : '';
      const resolvedProf = {
        id: uid,
        full_name: prof?.full_name || meta.full_name || meta.name || '',
        username: prof?.username || meta.username || meta.user_name || emailH || '',
        avatar_url: prof?.avatar_url || meta.avatar_url || '',
        phone: prof?.phone || meta.phone || '',
      };
      setMyProfile(resolvedProf);
      if (biz) setMyBusinessPage(biz);
      const autoPh = String(biz?.phone || resolvedProf.phone || '').replace(/\D/g, '').slice(-9);
      if (autoPh) setEmployerPhone((prev) => prev || autoPh);
    }).catch(() => {});
  }, []);

  const handleOpenAddModal = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول إلى حسابك أولاً لتتمكن من إضافة شاغر وظيفي');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setEmployerPhone(numeric);
  };

  
  const handleSaveJobFromModal = async (
    newJob: JobFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const sMin = (newJob.salaryMin || "").trim();
      const sMax = (newJob.salaryMax || "").trim();
      let salaryText = "";
      if (sMin || sMax) {
        const curr = newJob.currency || "YER";
        salaryText = sMin && sMax
          ? `${sMin} - ${sMax} ${curr}`
          : `${sMin || sMax} ${curr}`;
        if (newJob.isSalaryNegotiable) salaryText += " (قابل للتفاوض)";
      }

      const isRemote =
        newJob.workType === "عمل عن بُعد" ||
        newJob.workplaceType === "عن بُعد";
      const isNoExp =
        newJob.workType === "تدريب" ||
        newJob.workType === "تدريب مع إمكانية التوظيف" ||
        newJob.canWorkNoExp === "نعم";
      const currLbl =
        newJob.currency === "USD" ? "دولار ($)"
        : newJob.currency === "SAR" ? "ريال سعودي (ر.س)"
        : "ريال يمني (ر.ي)";
      const benTxt = Array.isArray(newJob.benefits)
        ? newJob.benefits.join("، ") : "";
      const docTxt = Array.isArray(newJob.requiredDocs)
        ? newJob.requiredDocs.join("، ") : "";

      const entries: Array<[string, string | undefined | null]> = [
        ["المجال الوظيفي", newJob.sector],
        ["القسم", newJob.department],
        ["نوع الوظيفة", newJob.workType],
        ["طبيعة مكان العمل", newJob.workplaceType],
        ["عدد الشواغر", newJob.vacancies],
        ...(!isRemote ? [
          ["المحافظة", newJob.governorate],
          ["المدينة", newJob.subCity],
          ["المديرية", newJob.district],
        ] as Array<[string, string | undefined | null]> : []),
        ["المستوى التعليمي", newJob.education],
        ["التخصص الدراسي", newJob.major],
        ["العمل دون خبرة", newJob.canWorkNoExp],
        ["سنوات الخبرة", isNoExp ? "" : newJob.experienceLevel],
        ["مستوى اللغة", newJob.languageLevel],
        ["الجنس", newJob.gender],
        ["الفئة العمرية", newJob.ageRange],
        ["المهارة المطلوبة", newJob.skillPick],
        ["العملة", salaryText ? currLbl : ""],
        ["قابل للتفاوض", newJob.isSalaryNegotiable ? "نعم" : "لا"],
        ["ساعات العمل", newJob.workHours],
        ["أيام العمل", newJob.workDays],
        ["الإجازة الأسبوعية", newJob.offDay],
        ["المزايا", benTxt],
        ["طريقة التقديم", newJob.applyMethod],
        ["حالة الوظيفة", newJob.jobStatus],
        ["آخر موعد للتقديم", newJob.deadline],
        ["المستندات المطلوبة", docTxt],
      ];

      const reqArr = buildPropertyFeatures([
        ...entries,
        ...(Array.isArray(newJob.requirements)
          ? newJob.requirements.map((r): [string, string] => ["شرط إضافي", r])
          : []),
      ]);

      const skillsArr = Array.from(new Set([
        ...(newJob.skillPick && newJob.skillPick !== NOT_AVAILABLE
          && newJob.skillPick !== "غير محدد" ? [newJob.skillPick] : []),
        ...(Array.isArray(newJob.responsibilities)
          ? newJob.responsibilities : []),
      ]));

      const descParts: string[] = [];
      if ((newJob.description || "").trim()) {
        descParts.push(newJob.description.trim());
      }
      const { data: { session: pubSession } } = await supabase.auth.getSession();
      const pubMeta: any = pubSession?.user?.user_metadata || {};
      const autoPubName = (newJob.companyName || "").trim() || myBusinessPage?.name || myProfile?.full_name || pubMeta.full_name || "";
      const autoPubPhone = String((newJob as any).phone || (newJob as any).publisherPhone || myBusinessPage?.phone || myProfile?.phone || pubMeta.phone || "").replace(/\D/g, "").slice(-9);
      const contactLines: string[] = [];
      const autoPubUser = (myBusinessPage?.username || myProfile?.username || pubMeta.username || '').trim();
      const autoPubAv = (myBusinessPage?.avatarUrl || myProfile?.avatar_url || pubMeta.avatar_url || '').trim();
      if (autoPubName && !newJob.companyId) contactLines.push(`اسم الناشر: ${autoPubName}`);
      if (autoPubUser) contactLines.push(`معرف الناشر: ${autoPubUser}`);
      if (autoPubAv) contactLines.push(`أفاتار الناشر: ${autoPubAv}`);
      if (autoPubPhone) contactLines.push(`هاتف مسؤول التوظيف: ${autoPubPhone}`);
      if (contactLines.length > 0) {
        descParts.push(`[معلومات جهة العمل والتواصل]\n${contactLines.join("\n")}`);
      }
      if ((newJob.docUrl || "").trim()) {
        descParts.push(`[ملف الوصف الوظيفي PDF]: ${newJob.docUrl.trim()}`);
      }
      if ((newJob.imageData || "").trim()) {
        descParts.push(`[مرفقات الصور]:\n${newJob.imageData.trim()}`);
      }

      const cityVal = isRemote
        ? "عن بُعد"
        : (newJob.governorate || newJob.companyCity || "صنعاء").trim();
      const expVal = isNoExp
        ? "لا يشترط خبرة"
        : (newJob.experienceLevel || "غير محدد");

      const payload: any = {
        title: (newJob.title || "").trim(),
        company_id: newJob.companyId || null,
        city: cityVal,
        salary: salaryText || null,
        type: newJob.workType || "دوام كامل",
        experience: expVal,
        description: descParts.join("\n\n"),
        requirements: reqArr,
        skills: skillsArr,
        status: "PUBLISHED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("jobs").insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) setJobs(prev => [data[0], ...prev]);
      setIsAddModalOpen(false);
      return { success: true };
    } catch (err: any) {
      console.error("Save job error:", err);
      return {
        success: false,
        error: toArabicMarketError(err, "حدث خطأ أثناء حفظ الشاغر الوظيفي"),
      };
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !agreedToEmployerPolicy) return;

    if (employerPhone.length !== 9) {
      setToastMessage('يرجى إدخال رقم هاتف مسؤول التوظيف (9 أرقام بالضبط)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setToastMessage('يجب تسجيل الدخول أولاً لإرسال الوظيفة');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        title: newTitle.trim(),
        sector: newSector,
        work_type: newWorkType,
        city: newCity,
        salary_range: newSalaryRange.trim() || 'بحسب المقابلة والخبرة',
        experience_level: newExperienceLevel,
        description: newDescription.trim(),
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('jobs').insert([payload]);
      if (error) throw error;

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSalaryRange('');
      setNewDescription('');
      setEmployerPhone('');
      setAgreedToEmployerPolicy(false);
      setToastMessage('تم نشر الوظيفة بنجاح وتوثيق عمولة ووساطة يمن ريتغ');
      setTimeout(() => setToastMessage(null), 4000);
      fetchJobs();
    } catch (err: any) {
      setToastMessage(toArabicMarketError(err, 'حدث خطأ أثناء إرسال الوظيفة'));
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const workType = job.type || job.work_type || job.workType || '';
    const parsed = parsePropertyFeatures(job.requirements);
    const secVal = parsed.pairs.find((x) => x.label === 'المجال الوظيفي')?.value || job.sector || '';
    const expVal = parsed.pairs.find((x) => x.label === 'سنوات الخبرة')?.value || job.experience || job.experience_level || '';
    const genVal = parsed.pairs.find((x) => x.label === 'الجنس')?.value || job.gender || '';
    const matchCity = cityFilter === 'all' || (job.city && job.city.includes(cityFilter));
    const matchType = workTypeFilter === 'all' || workType === workTypeFilter;
    const matchSec = sectorFilter === 'all' || secVal === sectorFilter;
    const matchExp = expFilter === 'all' || expVal === expFilter;
    const matchGen = genderFilter === 'all' || genVal === genderFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q
      || (job.title || '').toLowerCase().includes(q)
      || (job.description || '').toLowerCase().includes(q)
      || (job.city || '').toLowerCase().includes(q)
      || parsed.pairs.some((x) => x.value.toLowerCase().includes(q));
    return matchCity && matchType && matchSec && matchExp && matchGen && matchSearch;
  });

  const jobCommissionAmount = commissionSettings?.default_fixed_commission_amount || 20000;
  const jobCommissionCurr = commissionSettings?.default_fixed_commission_currency || 'ريال يمني';
  const jobCommText = `${jobCommissionAmount.toLocaleString()} ${jobCommissionCurr}`;

  const toJobXItem = (job: any): XMarketItem => {
    const rawDesc = job.description || '';
    const cleanDesc = rawDesc
      .split('--- [بيانات جهة النشر والوساطة] ---')[0]
      .split('[معلومات جهة العمل والتواصل]')[0]
      .split('[ملف الوصف الوظيفي PDF]')[0]
      .split('[وثائق وشهادات المتقدم]')[0]
      .split('[مرفقات الصور]')[0]
      .trim();
    const companyMatch = rawDesc.match(/(?:اسم المنشأة|اسم الناشر):\s*(.+)/);
    const phoneMatch = rawDesc.match(/هاتف مسؤول التوظيف:\s*(\d+)/);
    const imgMatch = rawDesc.match(/\[مرفقات الصور\]:\s*([^\s]+)/);
    const docMatch = rawDesc.match(/\[ملف الوصف الوظيفي PDF\]:\s*([^\n\r\s]+)/);
    const userMatch = rawDesc.match(/معرف الناشر:\s*([^\s\n]+)/);
    const avMatch = rawDesc.match(/أفاتار الناشر:\s*([^\s\n]+)/);
    const extractedName = companyMatch ? companyMatch[1].trim() : '';
    const extractedUser = userMatch ? userMatch[1].trim() : '';
    const extractedAv = avMatch ? avMatch[1].trim() : '';

    const biz =
      businessesList.find((b) =>
        (job.company_id || job.business_id)
        && b.id === (job.company_id || job.business_id)
      )
      || (extractedName
        ? businessesList.find((b) => b.name.trim() === extractedName)
        : undefined)
      || null;

    const pm = profilesMap[job.owner_user_id || job.user_id || '']
      || profilesMap[extractedUser]
      || profilesMap[extractedName]
      || null;

    const jobType = job.type || job.work_type || 'دوام كامل';
    const salary = job.salary || job.salary_range || 'عند المقابلة';
    const phone = biz?.phone || (phoneMatch ? phoneMatch[1] : '') || '';

    const jobImages: string[] = [];
    if (job.image_url) jobImages.push(job.image_url);
    if (Array.isArray(job.image_urls)) {
      jobImages.push(...job.image_urls.filter(Boolean));
    }
    if (imgMatch?.[1]) jobImages.push(imgMatch[1].trim());

    const parsedReqs = parsePropertyFeatures(job.requirements);
    const fallbackPairs: { label: string; value: string }[] = [
      ...(jobType ? [{ label: 'نوع الوظيفة', value: jobType }] : []),
      ...((job.experience || job.experience_level)
        ? [{ label: 'الخبرة', value: job.experience || job.experience_level }]
        : []),
      ...(job.city ? [{ label: 'المحافظة', value: job.city }] : []),
      ...(job.gender ? [{ label: 'الجنس', value: job.gender }] : []),
      ...(job.sector ? [{ label: 'المجال الوظيفي', value: job.sector }] : []),
    ];
    const specPairs = [
      ...(parsedReqs.pairs.length > 0 ? parsedReqs.pairs : fallbackPairs),
      ...(docMatch?.[1]
        ? [{ label: 'ملف الوصف', value: 'مرفق (عرض في صفحة الوظيفة)' }]
        : []),
    ].filter((sp) => sp.value && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(sp.value.trim()));

    return {
      id: job.id,
      detailPath: `/jobs/${job.id}`,
      actionLabel: 'التقديم',
      onAction: () => setApplyingJob(job),
      actionIcon: <Briefcase size={14} />,
      authorName: biz?.name || extractedName || pm?.full_name || 'جهة توظيف معتمدة',
      authorUsername: biz?.username || extractedUser || pm?.username || job.city || 'jobs',
      authorAvatar: biz?.avatarUrl || extractedAv || pm?.avatar_url || '',
      badgeType: biz
        ? ((biz.verificationType as BadgeType)
          || (biz.isVerified ? 'gold' : 'none'))
        : 'none',
      businessPath: biz ? `/businesses/${biz.username || biz.id}` : undefined,
      createdAt: job.created_at,
      title: job.title,
      priceText: salary,
      description: cleanDesc,
      metaParts: [
        jobType,
        job.experience || job.experience_level,
        job.city,
      ].filter(Boolean),
      specPairs,
      tagLabel: jobType,
      images: jobImages,
      city: job.city,
      phone,
      whatsappText: [
        `مرحباً، أرغب بالتقديم على وظيفة: ${job.title}`,
        `اسم الناشر: ${biz?.name || extractedName || 'جهة توظيف معتمدة'}`,
        phone ? `هاتف الناشر: ${phone}` : '',
        (myBusinessPage?.name || myProfile?.full_name) ? `اسم المتقدم: ${myBusinessPage?.name || myProfile?.full_name}` : '',
        (myBusinessPage?.phone || myProfile?.phone) ? `هاتف المتقدم: ${String(myBusinessPage?.phone || myProfile?.phone).replace(/\D/g, '').slice(-9)}` : '',
        job.city ? `المحافظة: ${job.city}` : '',
        salary ? `الراتب: ${salary}` : '',
        ...specPairs.map((sp) => `• ${sp.label}: ${sp.value}`),
        cleanDesc ? `الوصف: ${cleanDesc.slice(0, 200)}` : '',
      ].filter(Boolean).join('\n'),
    };
  };

  const activeFiltersCount = (cityFilter !== 'all' ? 1 : 0) + (workTypeFilter !== 'all' ? 1 : 0) + (sectorFilter !== 'all' ? 1 : 0) + (expFilter !== 'all' ? 1 : 0) + (genderFilter !== 'all' ? 1 : 0);
  const resetFilters = () => { setCityFilter('all'); setWorkTypeFilter('all'); setSectorFilter('all'); setExpFilter('all'); setGenderFilter('all'); };
  const handleShare = (it: XMarketItem) => {
    navigator.clipboard?.writeText(`${it.title}${it.priceText ? ` - ${it.priceText}` : ''}`);
    setToastMessage('تم نسخ تفاصيل الوظيفة');
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < filteredJobs.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 360);
        }
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, filteredJobs.length, isLoadingMore]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "bg-black min-h-screen max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3 font-['Tahoma'] text-white"}>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{toastMessage}</span>
        </div>
      )}
      {!embedded && !selectedItem && (
        <div className="space-y-2.5 border-b border-[#2F3336] pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { window.location.href = '/'; }} title="رجوع للرئيسية" className="p-2 rounded-xl bg-black border border-[#2F3336] text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all cursor-pointer">
                <ArrowRight size={16} />
              </button>
              <div className="flex items-center gap-1.5"><Briefcase className="w-5 h-5 text-[#F5C400]" /><h1 className="text-sm sm:text-base font-black text-white">فرص العمل والوظائف</h1></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleOpenAddModal} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs"><Plus size={15} /><span>أضف وظيفة</span></button>
              <button onClick={fetchJobs} disabled={loading} className="p-2 bg-[#111111] border border-[#2F3336] text-slate-300 hover:text-white rounded-xl"><RefreshCw size={15} className={loading ? 'animate-spin text-[#F5C400]' : ''} /></button>
            </div>
          </div>
          <MarketSponsorSlot section="jobs" />
        </div>
      )}

      {selectedItem ? (
        <XMarketDetailView
          item={selectedItem}
          activeImageIndex={activeImageIndex}
          onChangeImageIndex={setActiveImageIndex}
          onBack={() => setSelectedItem(null)}
          onOpenLightbox={() => setIsLightboxOpen(true)}
          onShare={() => handleShare(selectedItem)}
        />
      ) : (
        <>
          {embedded && <MarketSponsorSlot section="jobs" />}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "bg-[#111111] p-3 rounded-2xl border border-[#2F3336] space-y-2.5"}>
            <XSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="ابحث عن وظيفة أو مدينة..."
              activeFiltersCount={activeFiltersCount}
              onOpenFilter={() => setIsFilterModalOpen(true)}
              sectionIcon={<Briefcase size={18} className="text-[#FFC500]" />}
            />
            </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#71767B] gap-3">
              <XSpinner size={28} />
              <span className="text-xs font-bold text-white">جاري تحميل الوظائف...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-[#71767B] p-6 space-y-2">
              <AlertCircle className="w-9 h-9 text-[#FFC500] mx-auto opacity-75" />
              <h3 className="text-sm font-bold text-white">لا توجد وظائف شاغرة حالياً</h3>
              <p className="text-xs">اضغط على زر + لإضافة فرصة عمل جديدة.</p>
            </div>
          ) : embedded ? (
            <div className="divide-y divide-[#2F3336]/60">
              {filteredJobs.slice(0, visibleCount).map((job, idx) => {
                const item = toJobXItem(job);
                return (
                  <React.Fragment key={job.id}>
                    <XMarketTweetCard
                      item={item}
                      onOpenDetail={() => { setSelectedItem(item); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                      onOpenImage={(idx) => { setSelectedItem(item); setActiveImageIndex(idx); setIsLightboxOpen(true); }}
                      onShare={() => handleShare(item)}
                    />
                    {idx === (filteredJobs.length >= 8 ? 2 : filteredJobs.length >= 4 ? 1 : 0) && (
                      <div className="bg-black">
                        <AdBanner section="jobs" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                      </div>
                    )}
                    {idx === (filteredJobs.length >= 8 ? 7 : filteredJobs.length >= 2 ? filteredJobs.length - 1 : -1) && (
                      <div className="bg-black">
                        <AdBanner section="jobs" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.slice(0, visibleCount).map((job, idx) => (
                <React.Fragment key={job.id}>
                  <JobCard job={job} />
                  {idx === (filteredJobs.length >= 6 ? 2 : 0) && (
                    <div className="col-span-full">
                      <AdBanner section="jobs" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                    </div>
                  )}
                  {idx === (filteredJobs.length >= 6 ? 5 : filteredJobs.length >= 2 ? filteredJobs.length - 1 : -1) && (
                    <div className="col-span-full">
                      <AdBanner section="jobs" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                    </div>
                  )}
                </React.Fragment>
              ))}

            </div>
          )}


          {filteredJobs.length > 0 && (
            <div ref={bottomSentinelRef} className="py-3 flex items-center justify-center">
              {isLoadingMore || visibleCount < filteredJobs.length ? (
                <XSpinner ariaLabel="جاري تحميل المزيد" />
              ) : (
                <span className="text-[11px] text-[#71767B]">تم عرض كل النتائج</span>
              )}
            </div>
          )}
          {embedded && !isAddModalOpen && (
            <button onClick={handleOpenAddModal} className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition" title="أضف وظيفة">
              <Plus size={24} className="stroke-[2.2]" />
            </button>
          )}
        </>
      )}

      <XFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="تصفية الوظائف"
        activeFiltersCount={activeFiltersCount}
        onReset={resetFilters}
        resultsCount={filteredJobs.length}
        fields={[
          { label: 'المجال الوظيفي', value: sectorFilter, onChange: setSectorFilter, options: [{ value: 'all', label: 'كل المجالات' }, ...JOB_SECTOR_OPTIONS] },
          { label: 'نوع الوظيفة', value: workTypeFilter, onChange: setWorkTypeFilter, options: [{ value: 'all', label: 'كل الأنواع' }, ...JOB_TYPE_OPTIONS] },
          { label: 'سنوات الخبرة', value: expFilter, onChange: setExpFilter, options: [{ value: 'all', label: 'الكل' }, ...JOB_EXPERIENCE_OPTIONS.filter((o) => !['غير موجود', 'غير محدد'].includes(o.value))] },
          { label: 'الجنس', value: genderFilter, onChange: setGenderFilter, options: [{ value: 'all', label: 'الكل' }, ...JOB_GENDER_OPTIONS.filter((o) => !['غير موجود', 'غير محدد'].includes(o.value))] },
          { label: 'المحافظة', value: cityFilter, onChange: setCityFilter, options: YEMEN_GOV_FILTER_OPTIONS },
        ]}
      />

      <XJobApplyModal job={applyingJob} jobItem={applyingJob ? toJobXItem(applyingJob) : null} commissionText={jobCommText} onClose={() => setApplyingJob(null)} onSuccess={(msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); }} />
      <XImageLightbox isOpen={isLightboxOpen} item={selectedItem} activeIndex={activeImageIndex} onChangeIndex={setActiveImageIndex} onClose={() => setIsLightboxOpen(false)} />
      <PublicAddJobModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleSaveJobFromModal} />
    </div>
  );
};
