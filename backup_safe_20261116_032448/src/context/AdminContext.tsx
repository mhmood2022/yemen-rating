import React, { createContext, useContext, useState } from 'react';
import { BusinessItem, BusinessReview } from '../types/business';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { CurrencyPriceItem, GoldPriceItem, CommodityPriceItem } from '../types/prices';
import { DEMO_CURRENCIES, DEMO_GOLD, DEMO_COMMODITIES } from '../data/demoPrices';
import { JobVacancy } from '../types/jobs';
import { DEMO_JOBS } from '../data/demoJobs';
import { AdItem, AdMediaItem } from '../types/ads';
import { DEMO_ADS, DEMO_AD_MEDIA } from '../data/demoAds';
import { AuditLogItem } from '../types/audit';
import { DEMO_AUDIT_LOGS } from '../data/demoAuditLogs';
import { AdminUserItem } from '../types/admin';
import { yrToast } from '../components/ui/Toast';

interface AdminContextType {
  businesses: BusinessItem[];
  currencies: CurrencyPriceItem[];
  goldPrices: GoldPriceItem[];
  commodities: CommodityPriceItem[];
  jobs: JobVacancy[];
  ads: AdItem[];
  adMedia: AdMediaItem[];
  auditLogs: AuditLogItem[];
  users: AdminUserItem[];
  
  // Business Actions
  updateBusiness: (updated: BusinessItem, reason?: string) => void;
  createBusiness: (newBiz: BusinessItem) => void;
  deleteBusiness: (id: string) => void;
  changeBadge: (id: string, badgeType: 'gold' | 'blue' | 'gray', reason: string) => void;
  
  // Review Actions
  addReviewToBusiness: (businessId: string, review: { authorName: string; rating: number; comment: string }) => void;
  deleteReview: (businessId: string, reviewId: string) => void;
  
  // Prices Actions
  updateCurrencyPrice: (id: string, buy: number, sell: number, change: 'up' | 'down' | 'stable') => void;
  updateGoldPrice: (id: string, buy: number, sell: number) => void;
  
  // Ads Actions
  publishAd: (id: string) => void;
  pauseAd: (id: string) => void;
  deleteAd: (id: string) => void;
  saveAd: (ad: AdItem) => void;
  duplicateAd: (id: string) => void;
  
  // Jobs Actions
  saveJob: (job: JobVacancy) => void;
  deleteJob: (id: string) => void;
  
  // Logs
  addAuditLog: (action: any, targetType: string, targetName: string, details: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>(DEMO_BUSINESSES);
  const [currencies, setCurrencies] = useState<CurrencyPriceItem[]>(DEMO_CURRENCIES);
  const [goldPrices, setGoldPrices] = useState<GoldPriceItem[]>(DEMO_GOLD);
  const [commodities, setCommodities] = useState<CommodityPriceItem[]>(DEMO_COMMODITIES);
  const [jobs, setJobs] = useState<JobVacancy[]>(DEMO_JOBS);
  const [ads, setAds] = useState<AdItem[]>(DEMO_ADS);
  const [adMedia, setAdMedia] = useState<AdMediaItem[]>(DEMO_AD_MEDIA);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(DEMO_AUDIT_LOGS);

  const [users] = useState<AdminUserItem[]>([
    {
      id: 'u_1',
      name: 'م. أحمد المشرف',
      email: 'admin@yemenrating.com',
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-10',
      lastLogin: 'اليوم 16:45'
    },
    {
      id: 'u_2',
      name: 'إدارة بنك الكريمي',
      email: 'contact@kuraimibank.com',
      role: 'business_owner',
      associatedBusinessId: 'b1',
      status: 'active',
      createdAt: '2026-02-15',
      lastLogin: 'اليوم 14:10'
    }
  ]);

  const addAuditLog = (action: any, targetType: string, targetName: string, details: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      adminName: 'م. أحمد المشرف',
      adminEmail: 'admin@yemenrating.com',
      action,
      targetType,
      targetName,
      details,
      timestamp: formatted,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // إضافة تقييم جديد وتحديث مؤشرات التقييم و YR Score تلقائياً
  const addReviewToBusiness = (businessId: string, newRevData: { authorName: string; rating: number; comment: string }) => {
    const newReview: BusinessReview = {
      id: `rev_${Date.now()}`,
      authorName: newRevData.authorName,
      rating: newRevData.rating,
      date: 'اليوم',
      comment: newRevData.comment,
      isVerifiedReviewer: true,
    };

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        const currentReviews = b.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
        const updatedScore = Math.min(100, Math.round(b.yrScore + 1));

        return {
          ...b,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: avgRating,
          yrScore: updatedScore,
        };
      })
    );

    addAuditLog('REVIEW_APPROVE', 'تقييم عميل', `نشاط #${businessId}`, `إضافة تقييم ${newRevData.rating} نجوم بواسطة ${newRevData.authorName}`);
  };

  const deleteReview = (businessId: string, reviewId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        const updatedReviews = (b.reviews || []).filter((r) => r.id !== reviewId);
        return {
          ...b,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
        };
      })
    );
    addAuditLog('REVIEW_DELETE', 'تقييم عميل', `نشاط #${businessId}`, `حذف التقييم #${reviewId}`);
    yrToast.warning('تم حذف التقييم');
  };

  const updateBusiness = (updated: BusinessItem, reason?: string) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    addAuditLog('BUSINESS_UPDATE', 'نشاط تجاري', updated.name, reason || 'تعديل البيانات الأساسية والأقسام');
    yrToast.success(`تم حفظ تعديلات ${updated.name}`);
  };

  const createBusiness = (newBiz: BusinessItem) => {
    setBusinesses((prev) => [newBiz, ...prev]);
    addAuditLog('BUSINESS_CREATE', 'نشاط تجاري', newBiz.name, 'إضافة نشاط جديد');
    yrToast.success(`تمت إضافة النشاط ${newBiz.name}`);
  };

  const deleteBusiness = (id: string) => {
    const biz = businesses.find((b) => b.id === id);
    if (!biz) return;
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    addAuditLog('BUSINESS_DELETE', 'نشاط تجاري', biz.name, 'حذف النشاط نهائياً');
    yrToast.warning(`تم حذف النشاط ${biz.name}`);
  };

  const changeBadge = (id: string, badgeType: 'gold' | 'blue' | 'gray', reason: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isVerified: true, verifiedBadgeType: badgeType } : b))
    );
    const biz = businesses.find((b) => b.id === id);
    if (biz) {
      addAuditLog('BADGE_CHANGE', 'شارة التوثيق', biz.name, `تغيير الشارة إلى (${badgeType}) - السبب: ${reason}`);
      yrToast.success(`تم تعديل شارة توثيق ${biz.name}`);
    }
  };

  const updateCurrencyPrice = (id: string, buy: number, sell: number, change: 'up' | 'down' | 'stable') => {
    setCurrencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, buyPrice: buy, sellPrice: sell, change, lastUpdated: 'اليوم ' + new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) } : c))
    );
    const curr = currencies.find((c) => c.id === id);
    if (curr) {
      addAuditLog('PRICE_UPDATE', 'سعر صرف', `${curr.currencyName} (${curr.market === 'sanaa' ? 'صنعاء' : 'عدن'})`, `شراء: ${buy} - بيع: ${sell}`);
      yrToast.success(`تم تحديث سعر ${curr.currencyName}`);
    }
  };

  const updateGoldPrice = (id: string, buy: number, sell: number) => {
    setGoldPrices((prev) =>
      prev.map((g) => (g.id === id ? { ...g, buyPrice: buy, sellPrice: sell, lastUpdated: 'اليوم ' + new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) } : g))
    );
    const gold = goldPrices.find((g) => g.id === id);
    if (gold) {
      addAuditLog('PRICE_UPDATE', 'سعر الذهب', `${gold.karatName} (${gold.market === 'sanaa' ? 'صنعاء' : 'عدن'})`, `شراء: ${buy} - بيع: ${sell}`);
      yrToast.success(`تم تحديث سعر ${gold.karatName}`);
    }
  };

  const publishAd = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'published' } : a)));
    const ad = ads.find((a) => a.id === id);
    if (ad) {
      addAuditLog('AD_PUBLISH', 'إعلان', ad.title, 'نشر وتفعيل الإعلان');
      yrToast.success(`تم نشر الإعلان "${ad.title}"`);
    }
  };

  const pauseAd = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'paused' } : a)));
    const ad = ads.find((a) => a.id === id);
    if (ad) {
      addAuditLog('AD_PAUSE', 'إعلان', ad.title, 'إيقاف مؤقت للإعلان');
      yrToast.warning(`تم إيقاف الإعلان "${ad.title}"`);
    }
  };

  const deleteAd = (id: string) => {
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;
    setAds((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('AD_DELETE', 'إعلان', ad.title, 'حذف الإعلان نهائياً');
    yrToast.warning(`تم حذف الإعلان "${ad.title}"`);
  };

  const saveAd = (ad: AdItem) => {
    setAds((prev) => {
      const exists = prev.some((a) => a.id === ad.id);
      if (exists) return prev.map((a) => (a.id === ad.id ? ad : a));
      return [ad, ...prev];
    });
    addAuditLog('AD_CREATE', 'إعلان', ad.title, `حفظ الحملة الإعلانية (${ad.type})`);
    yrToast.success(`تم حفظ الإعلان "${ad.title}"`);
  };

  const duplicateAd = (id: string) => {
    const original = ads.find((a) => a.id === id);
    if (!original) return;
    const copy: AdItem = {
      ...original,
      id: `ad_${Date.now()}`,
      title: `${original.title} (نسخة)`,
      status: 'draft',
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAds((prev) => [copy, ...prev]);
    yrToast.info(`تم نسخ الإعلان كمسودة`);
  };

  const saveJob = (job: JobVacancy) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === job.id);
      if (exists) return prev.map((j) => (j.id === job.id ? job : j));
      return [job, ...prev];
    });
    addAuditLog('JOB_CREATE', 'شاغر وظيفي', job.title, `حفظ الشاغر لشركة ${job.companyName}`);
    yrToast.success(`تم حفظ الشاغر "${job.title}"`);
  };

  const deleteJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    addAuditLog('JOB_STATUS_CHANGE', 'شاغر وظيفي', job.title, 'حذف الشاغر نهائياً');
    yrToast.warning(`تم حذف الشاغر "${job.title}"`);
  };

  return (
    <AdminContext.Provider
      value={{
        businesses,
        currencies,
        goldPrices,
        commodities,
        jobs,
        ads,
        adMedia,
        auditLogs,
        users,
        updateBusiness,
        createBusiness,
        deleteBusiness,
        changeBadge,
        addReviewToBusiness,
        deleteReview,
        updateCurrencyPrice,
        updateGoldPrice,
        publishAd,
        pauseAd,
        deleteAd,
        saveAd,
        duplicateAd,
        saveJob,
        deleteJob,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
