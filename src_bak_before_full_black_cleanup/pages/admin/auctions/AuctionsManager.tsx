import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gavel, AlertCircle, CheckCircle2, Search, RefreshCw, Calendar,
  MapPin, Activity, Trash2, Edit, Plus, X, ImagePlus, ShieldCheck,
  Percent, Phone, MessageCircle, Mail, Clock, User, DollarSign,
  AlertTriangle, Check, Filter, Award, ChevronDown, ChevronUp,
  FileText, Send, PauseCircle, PlayCircle, History, ExternalLink,
  ShieldAlert, Sparkles, Wallet, Tag, BarChart3, SlidersHorizontal
} from 'lucide-react';
import { adminAuctionsService } from '../../../services/adminService';
import { supabase } from '../../../lib/supabase';
import { notificationService } from '../../../services/notificationService';
import { YRSelect, YRSelectOption } from '../../../components/common/YRSelect';

// القوائم المعتمدة الموحدة لمنصة Yemen Rating
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
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' }
];

const YEMEN_GOVERNORATES: YRSelectOption[] = [
  { value: 'all', label: 'كل المدن والمحافظات' },
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  { value: 'تعز', label: 'تعز' },
  { value: 'حضرموت', label: 'حضرموت' },
  { value: 'الحديدة', label: 'الحديدة' },
  { value: 'مأرب', label: 'مأرب' },
  { value: 'إب', label: 'إب' },
  { value: 'ذمار', label: 'ذمار' }
];

// خيارات الفلاتر الملكية المخصصة (بدون وسوم أندرويد)
const STATUS_FILTER_OPTIONS: YRSelectOption[] = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'active', label: 'نشط الآن' },
  { value: 'under_review', label: 'قيد المراجعة' },
  { value: 'ended', label: 'انتهى' },
  { value: 'sold', label: 'تم البيع' },
  { value: 'unsold', label: 'لم يُبع' },
  { value: 'cancelled', label: 'ملغي/مرفوض' }
];

const SALE_TYPE_FILTER_OPTIONS: YRSelectOption[] = [
  { value: 'all', label: 'كل أنواع البيع' },
  { value: 'auction', label: 'مزاد علني' },
  { value: 'fixed_price', label: 'بيع مباشر' }
];

const PAYMENT_FILTER_OPTIONS: YRSelectOption[] = [
  { value: 'all', label: 'حالة الدفع (الكل)' },
  { value: 'paid', label: 'تم الدفع' },
  { value: 'pending', label: 'بانتظار الدفع' }
];

const COMMISSION_FILTER_OPTIONS: YRSelectOption[] = [
  { value: 'all', label: 'حالة العمولة (الكل)' },
  { value: 'collected', label: 'محصلة' },
  { value: 'pending', label: 'مستحقة (معلقة)' }
];

export const AuctionsManager: React.FC = () => {
  const navigate = useNavigate();

  // حالات طي وفتح اللوحات لتوفير مساحة شاشة الهاتف
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(false);
  const [showCommissionPanel, setShowCommissionPanel] = useState<boolean>(false);

  // التبويبات الرئيسية
  const [activeTab, setActiveTab] = useState<'listings' | 'bids_log' | 'action_required'>('listings');

  // البيانات الأساسية
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [bidsLog, setBidsLog] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  // إعدادات العمولات
  const [sellerRate, setSellerRate] = useState<number>(10);
  const [buyerRate, setBuyerRate] = useState<number>(5);
  const [defaultMinInc, setDefaultMinInc] = useState<number>(1000);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccessToast, setSettingsSuccessToast] = useState(false);

  // الفلاتر والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'auction' | 'fixed_price'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterCommission, setFilterCommission] = useState<string>('all');

  // النوافذ المنبثقة
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // إجراءات حساسة مع التأكيد
  const [actionConfirmModal, setActionConfirmModal] = useState<{
    auction: any;
    actionType: 'approve' | 'reject' | 'pause' | 'resume' | 'end_now' | 'cancel' | 'extend';
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [extendHours, setExtendHours] = useState('24');
  const [processingAction, setProcessingAction] = useState(false);

  // حقول نموذج إنشاء/تعديل المزاد
  const [saleType, setSaleType] = useState<'auction' | 'fixed_price'>('auction');
  const [formCategory, setFormCategory] = useState(GENERAL_CATEGORY_OPTIONS[0].value);
  const [formTitle, setFormTitle] = useState('');
  const [formSellerName, setFormSellerName] = useState('');
  const [formCity, setFormCity] = useState('صنعاء');
  const [formCurrency, setFormCurrency] = useState('SAR');
  const [formPrice, setFormPrice] = useState('');
  const [formStartTime, setFormStartTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [formEndDate, setFormEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 16);
  });
  const [formMinIncrement, setFormMinIncrement] = useState('1000');
  const [formMaxIncrement, setFormMaxIncrement] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      let enriched = data || [];
      try {
        const { data: profs } = await supabase
          .from("profiles")
          .select("phone, full_name, email");

        if (profs && profs.length > 0) {
          const emailByPhone = new Map();
          const emailByName = new Map();

          profs.forEach((p) => {
            if (p.email) {
              if (p.phone) {
                const clean = String(p.phone).replace(/\D/g, "").slice(-9);
                if (clean) emailByPhone.set(clean, p.email);
              }
              if (p.full_name) {
                emailByName.set(String(p.full_name).trim().toLowerCase(), p.email);
              }
            }
          });

          enriched = enriched.map((item) => {
            let email = item.seller_email;
            if (!email && item.seller_phone) {
              const cleanP = String(item.seller_phone).replace(/\D/g, "").slice(-9);
              email = emailByPhone.get(cleanP);
            }
            if (!email && item.seller_name) {
              email = emailByName.get(String(item.seller_name).trim().toLowerCase());
            }
            return {
              ...item,
              seller_email: email || item.seller_email
            };
          });
        }
      } catch (profileErr) {
        console.warn("Could not enrich seller emails:", profileErr);
      }

      setListings(enriched);
    } catch (err: any) {
      console.error('Error fetching auctions:', err);
      showToast('تعذر جلب المزادات: ' + (err.message || ''), 'error');
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchBidsLog = async () => {
    try {
      setLoadingBids(true);
      const { data, error } = await supabase
        .from('auction_bids')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) throw error;
      if (data) setBidsLog(data);
    } catch (err: any) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('platform_commission_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setSellerRate(Number(data.seller_commission_rate) || 10);
        setBuyerRate(Number(data.buyer_commission_rate) || 5);
        setDefaultMinInc(Number(data.default_min_increment) || 1000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBidsLog();
    fetchSettings();
  }, []);

  const handleSaveCommissionRates = async () => {
    try {
      setSavingSettings(true);
      const payload = {
        seller_commission_rate: Number(sellerRate),
        buyer_commission_rate: Number(buyerRate),
        default_min_increment: Number(defaultMinInc),
        };

      const { data: existing } = await supabase
        .from('platform_commission_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from('platform_commission_settings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('platform_commission_settings').insert([payload]);
      }

      setSettingsSuccessToast(true);
      setTimeout(() => setSettingsSuccessToast(false), 3500);
      showToast('تم حفظ إعدادات العمولة بنجاح');
    } catch (err: any) {
      showToast('خطأ في حفظ النسبة: ' + err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const getAuctionBidStats = (auctionId: string | number, startingPrice: number = 0) => {
    const auctionBids = bidsLog.filter((b) => String(b.auction_id) === String(auctionId));
    const count = auctionBids.length;
    const uniqueBidders = new Set(auctionBids.map((b) => b.bidder_phone || b.bidder_code || b.id)).size;

    let highestBidAmount = Number(startingPrice) || 0;
    let leadingBid: any = null;

    if (auctionBids.length > 0) {
      const sorted = [...auctionBids].sort((a, b) => Number(b.bid_amount) - Number(a.bid_amount));
      highestBidAmount = Number(sorted[0].bid_amount);
      leadingBid = sorted[0];
    }

    return {
      bids: auctionBids,
      bidsCount: count,
      uniqueBiddersCount: uniqueBidders,
      currentPrice: highestBidAmount,
      leadingBid
    };
  };

  const getComputedAuctionStatus = (item: any) => {
    const rawStatus = (item.status || 'active').toLowerCase();
    const now = new Date();
    const startTime = item.start_time ? new Date(item.start_time) : null;
    const endTime = item.end_date ? new Date(item.end_date) : (item.end_time ? new Date(item.end_time) : null);

    if (rawStatus === 'pending' || rawStatus === 'under_review') return 'under_review';
    if (rawStatus === 'rejected') return 'rejected';
    if (rawStatus === 'cancelled') return 'cancelled';
    if (rawStatus === 'paused') return 'paused';
    if (rawStatus === 'sold' || rawStatus === 'completed') return 'sold';

    if (endTime && endTime < now) {
      const { bidsCount } = getAuctionBidStats(item.id, Number(item.starting_price));
      if (bidsCount > 0 || item.winner_name || item.winner_id) {
        return rawStatus === 'sold' ? 'sold' : 'ended';
      }
      return 'unsold';
    }

    if (startTime && startTime > now) {
      return 'upcoming';
    }

    return 'active';
  };

  const kpiStats = useMemo(() => {
    let underReviewCount = 0;
    let publishedCount = 0;
    let activeNowCount = 0;
    let endedCount = 0;
    let soldCount = 0;
    let unsoldCount = 0;
    let cancelledCount = 0;

    let totalSalesVolume = 0;
    let totalPlatformCommission = 0;
    let pendingCommissionAmount = 0;
    let collectedCommissionAmount = 0;
    let totalSellerPayouts = 0;

    const rate = sellerRate > 0 ? sellerRate / 100 : 0.10;

    listings.forEach((item) => {
      const computed = getComputedAuctionStatus(item);
      const { currentPrice, bidsCount } = getAuctionBidStats(item.id, Number(item.starting_price));

      if (computed === 'under_review') underReviewCount++;
      if (computed === 'active') activeNowCount++;
      if (computed === 'ended') endedCount++;
      if (computed === 'sold') soldCount++;
      if (computed === 'unsold') unsoldCount++;
      if (computed === 'cancelled' || computed === 'rejected') cancelledCount++;

      if (['active', 'ended', 'sold', 'unsold'].includes(computed)) {
        publishedCount++;
      }

      if (computed === 'sold' || (computed === 'ended' && bidsCount > 0)) {
        const salePrice = Number(item.final_price) || currentPrice || Number(item.starting_price) || 0;
        const commissionVal = Number(item.platform_commission) || Math.round(salePrice * rate);
        const payoutVal = Number(item.seller_payout) || Math.max(0, salePrice - commissionVal);

        totalSalesVolume += salePrice;
        totalPlatformCommission += commissionVal;
        totalSellerPayouts += payoutVal;

        const commStatus = item.commission_status || 'pending';
        if (commStatus === 'collected' || commStatus === 'paid') {
          collectedCommissionAmount += commissionVal;
        } else {
          pendingCommissionAmount += commissionVal;
        }
      }
    });

    return {
      total: listings.length,
      underReview: underReviewCount,
      published: publishedCount,
      activeNow: activeNowCount,
      ended: endedCount,
      sold: soldCount,
      unsold: unsoldCount,
      cancelled: cancelledCount,
      totalSalesVolume,
      totalPlatformCommission,
      pendingCommissionAmount,
      collectedCommissionAmount,
      totalSellerPayouts
    };
  }, [listings, bidsLog, sellerRate]);

  const urgentAuctions = useMemo(() => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return listings.filter((item) => {
      const status = getComputedAuctionStatus(item);
      const endTime = item.end_date ? new Date(item.end_date) : (item.end_time ? new Date(item.end_time) : null);
      const { bidsCount } = getAuctionBidStats(item.id, Number(item.starting_price));

      if (status === 'under_review') return true;
      if (status === 'ended' && bidsCount > 0 && !item.winner_name && item.status !== 'sold') return true;
      if (item.status === 'sold' && (!item.payment_status || item.payment_status === 'pending')) return true;
      if (status === 'active' && endTime && endTime > now && endTime <= in24Hours) return true;

      return false;
    });
  }, [listings, bidsLog]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filterType !== 'all' && item.sale_type !== filterType) return false;
      if (cityFilter !== 'all' && (!item.city || !item.city.includes(cityFilter))) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;

      const computed = getComputedAuctionStatus(item);
      if (filterStatus !== 'all') {
        if (filterStatus === 'under_review' && computed !== 'under_review') return false;
        if (filterStatus === 'active' && computed !== 'active') return false;
        if (filterStatus === 'ended' && computed !== 'ended') return false;
        if (filterStatus === 'sold' && computed !== 'sold') return false;
        if (filterStatus === 'unsold' && computed !== 'unsold') return false;
        if (filterStatus === 'cancelled' && !['cancelled', 'rejected'].includes(computed)) return false;
      }

      if (filterPayment !== 'all') {
        const payStatus = item.payment_status || 'pending';
        if (payStatus !== filterPayment) return false;
      }

      if (filterCommission !== 'all') {
        const commStatus = item.commission_status || 'pending';
        if (commStatus !== filterCommission) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const idMatch = String(item.id).toLowerCase().includes(term);
        const titleMatch = (item.title || '').toLowerCase().includes(term);
        const sellerMatch = (item.seller_name || '').toLowerCase().includes(term);
        const phoneMatch = (item.seller_phone || item.phone || '').toLowerCase().includes(term);
        const emailMatch = (item.seller_email || '').toLowerCase().includes(term);
        const winnerMatch = (item.winner_name || '').toLowerCase().includes(term);

        if (!idMatch && !titleMatch && !sellerMatch && !phoneMatch && !emailMatch && !winnerMatch) {
          return false;
        }
      }

      return true;
    });
  }, [listings, filterType, cityFilter, filterCategory, filterStatus, filterPayment, filterCommission, searchTerm, bidsLog]);

  const executeAdminAction = async () => {
    if (!actionConfirmModal) return;
    const { auction, actionType } = actionConfirmModal;

    try {
      setProcessingAction(true);
      // الحقول الحقيقية فقط المعتمدة في جدول auctions
      const updates: any = {};
      const isValidUUID = (id: any) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let localWinnerName = "";
      let localWinnerPhone = "";

      if (actionType === "approve") {
        updates.status = "active";
        updates.approval_status = "approved";
        await notificationService.createNotification({
          type: "verification",
          title: `✅ الموافقة على نشر المزاد: ${auction.title}`,
          message: "تمت مراجعة المعروض والموافقة على تفعيله في المنصة بنجاح.",
          sender_name: auction.seller_name || "البائع",
          sender_phone: auction.seller_phone || "",
          facility_name: auction.title,
          sector: "المزادات والصفقات",
          admin_module: "auctions"
        });
      } else if (actionType === "reject") {
        updates.status = "rejected";
        updates.approval_status = "rejected";
        await notificationService.createNotification({
          type: "report",
          title: `❌ رفض نشر المزاد: ${auction.title}`,
          message: `تم رفض المعروض. سبب الرفض: ${actionReason.trim() || "لم يستوفِ الشروط المعتمدة"}`,
          sender_name: auction.seller_name || "البائع",
          sender_phone: auction.seller_phone || "",
          facility_name: auction.title,
          sector: "المزادات والصفقات",
          admin_module: "auctions"
        });
      } else if (actionType === "pause") {
        updates.status = "paused";
      } else if (actionType === "resume") {
        updates.status = "active";
      } else if (actionType === "cancel") {
        updates.status = "cancelled";
        await notificationService.createNotification({
          type: "report",
          title: `⚠️ إلغاء المزاد: ${auction.title}`,
          message: `تم إلغاء المزاد بقرار الإدارة. سبب الإلغاء: ${actionReason.trim() || "إلغاء بقرار إدارة المنصة"}`,
          sender_name: auction.seller_name || "البائع",
          sender_phone: auction.seller_phone || "",
          facility_name: auction.title,
          sector: "المزادات والصفقات",
          admin_module: "auctions"
        });
      } else if (actionType === "end_now") {
        const { currentPrice, leadingBid } = getAuctionBidStats(auction.id, Number(auction.starting_price));
        updates.status = leadingBid ? "sold" : "unsold";
        updates.end_date = new Date().toISOString();

        if (leadingBid) {
          updates.final_price = currentPrice;
          if (isValidUUID(leadingBid.bidder_id)) {
            updates.winner_id = leadingBid.bidder_id;
          }
          const comm = Math.round(currentPrice * (sellerRate / 100));
          updates.commission_amount_snapshot = comm;
          updates.seller_commission_amount_snapshot = comm;

          localWinnerName = leadingBid.bidder_name || leadingBid.bidder_code || "مشتري معتمد";
          localWinnerPhone = leadingBid.bidder_phone || "";

          // إرسال إشعار رسو المزاد للفائز والإدارة
          await notificationService.createNotification({
            type: "inquiry",
            title: `🏆 إرساء مزاد ورسو البيع: ${auction.title}`,
            message: `تم إنهاء المزاد ورسوّه رسمياً على المشتري (${localWinnerName}) بقيمة ${currentPrice.toLocaleString()} ${auction.currency || "SAR"}. هاتف الفائز: ${localWinnerPhone || "غير مسجل"}. إجمالي العمولة المستحقة: ${comm.toLocaleString()} ${auction.currency || "SAR"}.`,
            sender_name: localWinnerName,
            sender_phone: localWinnerPhone,
            sender_email: leadingBid.bidder_email || "",
            facility_name: auction.title,
            sector: "المزادات والصفقات",
            admin_module: "auctions"
          });
        } else {
          // إشعار انتهاء المزاد دون مشترٍ
          await notificationService.createNotification({
            type: "inquiry",
            title: `⏹️ انتهاء المزاد دون مشترٍ: ${auction.title}`,
            message: "انتهت فترة المزاد دون تقديم أي مزايدات، وتم تحويل حالته إلى (غير مباع / unsold).",
            sender_name: auction.seller_name || "البائع",
            sender_phone: auction.seller_phone || "",
            facility_name: auction.title,
            sector: "المزادات والصفقات",
            admin_module: "auctions"
          });
        }
      } else if (actionType === "extend") {
        const hours = Number(extendHours) || 24;
        const currentEnd = auction.end_date ? new Date(auction.end_date) : (auction.end_time ? new Date(auction.end_time) : new Date());
        const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + hours * 60 * 60 * 1000);
        updates.end_date = newEnd.toISOString();
        if (auction.status === "ended" || auction.status === "unsold") {
          updates.status = "active";
        }
        await notificationService.createNotification({
          type: "inquiry",
          title: `⏳ تمديد وقت المزاد: ${auction.title}`,
          message: `تم تمديد وقت المزاد لمدة ${hours} ساعة إضافية من قبل الإدارة.`,
          sender_name: auction.seller_name || "البائع",
          sender_phone: auction.seller_phone || "",
          facility_name: auction.title,
          sector: "المزادات والصفقات",
          admin_module: "auctions"
        });
      }

      const { error } = await supabase.from("auctions").update(updates).eq("id", auction.id);
      if (error) throw error;

      setListings((prev) =>
        prev.map((item) =>
          item.id === auction.id
            ? {
                ...item,
                ...updates,
                winner_name: localWinnerName || item.winner_name,
                winner_phone: localWinnerPhone || item.winner_phone
              }
            : item
        )
      );

      showToast("تم تنفيذ الإجراء وتحديث المزاد بنجاح");
      setActionConfirmModal(null);
      setActionReason("");
    } catch (err: any) {
      showToast("تعذر تنفيذ الإجراء: " + err.message, "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteBid = async (bidId: string | number) => {
    if (!bidId) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه المزايدة من السجل نهائياً؟')) return;
    try {
      const { error } = await supabase.from('auction_bids').delete().eq('id', bidId);
      if (error) throw error;
      setBidsLog((prev) => prev.filter((item) => item.id !== bidId));
      showToast('تم حذف المزايدة من السجل بنجاح');
    } catch (err: any) {
      showToast('تعذر حذف المزايدة: ' + (err.message || 'خطأ غير معروف'), 'error');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    try {
      const { error } = await supabase.from('auctions').delete().eq('id', deleteConfirmItem.id);
      if (error) throw error;
      setListings((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
      showToast('تم حذف المزاد بالكامل من قاعدة البيانات');
    } catch (err: any) {
      showToast('تعذر الحذف: ' + err.message, 'error');
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 6 - uploadedImages.length;
    if (remaining <= 0) {
      showToast('الحد الأقصى المسموح به هو 6 صور فقط', 'info');
      return;
    }
    try {
      setCompressing(true);
      const toProcess = Array.from(files).slice(0, remaining);
      const list: string[] = [];
      for (const file of toProcess) {
        const c = await compressImage(file);
        list.push(c);
      }
      setUploadedImages((prev) => [...prev, ...list]);
    } catch (err) {
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setSaleType('auction');
    setFormCategory(GENERAL_CATEGORY_OPTIONS[0].value);
    setFormTitle('');
    setFormSellerName('');
    setFormCity('صنعاء');
    setFormCurrency('SAR');
    setFormPrice('');
    setFormStartTime(new Date().toISOString().slice(0, 16));
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setFormEndDate(d.toISOString().slice(0, 16));
    setFormMinIncrement(String(defaultMinInc || 1000));
    setFormMaxIncrement('');
    setFormPhone('');
    setFormDescription('');
    setUploadedImages([]);
    setConsent(false);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setEditingId(item.id);
    setSaleType(item.sale_type || 'auction');
    setFormCategory(item.category || GENERAL_CATEGORY_OPTIONS[0].value);
    setFormTitle(item.title || '');
    setFormSellerName(item.seller_name || '');
    setFormCity(item.city || 'صنعاء');
    setFormCurrency(item.currency || 'SAR');
    setFormPrice(String(item.starting_price || item.current_bid || ''));
    setFormStartTime(item.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    setFormEndDate(item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : (item.end_time ? new Date(item.end_time).toISOString().slice(0, 16) : ''));
    setFormMinIncrement(String(item.min_increment || defaultMinInc || 1000));
    setFormMaxIncrement(item.max_increment ? String(item.max_increment) : '');
    setFormPhone(item.seller_phone || item.phone || '');
    setFormDescription(item.description || '');
    setUploadedImages(item.images || []);
    setConsent(true);
  };

  const handleCreateOrUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('يرجى كتابة عنوان المعروض', 'error');
      return;
    }

    try {
      setSubmittingModal(true);
      const priceNum = parseFloat(formPrice) || 0;
      const minInc = parseFloat(formMinIncrement) || Number(defaultMinInc) || 1000;
      const maxInc = formMaxIncrement ? parseFloat(formMaxIncrement) : null;
      const cleanPhone = formPhone.trim().replace(/\D/g, '') || formPhone.trim() || '770000000';

      // الحقول الحقيقية المعتمدة 100% في جدول auctions
      const payload: any = {
        title: formTitle.trim(),
        seller_name: formSellerName.trim() || 'إدارة المنصة',
        seller_phone: cleanPhone,
        sale_type: saleType,
        category: formCategory,
        city: formCity,
        currency: formCurrency,
        starting_price: priceNum,
        min_increment: minInc,
        max_increment: maxInc,
        start_time: formStartTime ? new Date(formStartTime).toISOString() : new Date().toISOString(),
        end_date: formEndDate ? new Date(formEndDate).toISOString() : new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        description: formDescription.trim(),
        images: uploadedImages,
        };

      if (modalMode === 'create') {
        payload.current_bid = priceNum;
        payload.status = 'active';
        payload.created_at = new Date().toISOString();
        const { data, error } = await supabase.from('auctions').insert([payload]).select().single();
        if (error) throw error;
        if (data) setListings((prev) => [data, ...prev]);
        showToast('تم نشر المعروض بنجاح وإدراجه في المنصة', 'success');
      } else if (modalMode === 'edit' && editingId) {
        const { data, error } = await supabase.from('auctions').update(payload).eq('id', editingId).select().single();
        if (error) throw error;
        if (data) setListings((prev) => prev.map((item) => (item.id === editingId ? data : item)));
        showToast('تم حفظ وتحديث بيانات المعروض بنجاح', 'success');
      }

      setModalMode(null);
      fetchListings();
    } catch (err: any) {
      console.error('Error saving listing:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ المعروض', 'error');
    } finally {
      setSubmittingModal(false);
    }
  };

  const renderStatusBadge = (item: any) => {
    const status = getComputedAuctionStatus(item);
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40">نشط الآن</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-950 text-amber-400 border border-amber-500/40">قيد المراجعة</span>;
      case 'ended':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-cyan-950 text-cyan-400 border border-cyan-500/40">انتهى المزاد</span>;
      case 'sold':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500/40">تم البيع</span>;
      case 'unsold':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-400 border border-slate-700">لم يُبع</span>;
      case 'paused':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-orange-950 text-orange-400 border border-orange-500/40">متوقف مؤقتاً</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-950 text-red-400 border border-red-500/40">ملغي / مرفوض</span>;
      case 'upcoming':
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-950 text-blue-400 border border-blue-500/40">قادم قريباً</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-slate-400">مكتمل</span>;
    }
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      {/* التنبيهات المنبثقة */}
      {toastMsg && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[99999] px-5 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2 border animate-bounce ${
          toastMsg.type === 'error'
            ? 'bg-red-600 text-white border-red-400'
            : 'bg-[#F5C400] text-black border-black/10'
        }`}>
          <CheckCircle2 size={16} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* الترويسة الرئيسية */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0F1D] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#060A13] border border-[#F5C400]/40 flex items-center justify-center text-[#F5C400]">
            <Gavel size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">إدارة المزادات</h1>
            <p className="text-xs text-slate-400 mt-0.5">لوحة التحكم التنفيذية بدورة حياة المزادات والعمولات والمشتركين</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>+ إضافة معروض جديد</span>
          </button>
          <button
            onClick={() => { fetchListings(); fetchBidsLog(); }}
            className="p-2.5 bg-[#060A13] border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw size={15} className={loadingListings || loadingBids ? 'animate-spin text-[#F5C400]' : ''} />
          </button>
        </div>
      </div>

      {/* شريط الأزرار العلوي المستطيل المتجاوب والسحب الأفقي باللمس */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 touch-pan-x">
        <button
          type="button"
          onClick={() => setShowStatsPanel(!showStatsPanel)}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
            showStatsPanel
              ? 'bg-[#F5C400] text-black border-[#F5C400] shadow-md shadow-[#F5C400]/10 font-black'
              : 'bg-[#0A0F1D] text-slate-200 border-slate-800 hover:border-slate-700'
          }`}
        >
          <BarChart3 size={15} className={showStatsPanel ? 'text-black' : 'text-[#F5C400]'} />
          <span>الإحصائيات والمؤشرات (13)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${showStatsPanel ? 'bg-black/15 text-black' : 'bg-slate-800 text-slate-300 font-mono'}`}>
            {kpiStats.total}
          </span>
          {showStatsPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          type="button"
          onClick={() => setShowCommissionPanel(!showCommissionPanel)}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
            showCommissionPanel
              ? 'bg-[#F5C400] text-black border-[#F5C400] shadow-md shadow-[#F5C400]/10 font-black'
              : 'bg-[#0A0F1D] text-slate-200 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Percent size={15} className={showCommissionPanel ? 'text-black' : 'text-[#F5C400]'} />
          <span>إعدادات العمولة</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${showCommissionPanel ? 'bg-black/15 text-black' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
            {sellerRate}%
          </span>
          {showCommissionPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* لوحة الإحصائيات الشاملة (تفتح بسلاسة وتغلق لمنع التكدس) */}
      {showStatsPanel && (
        <div className="space-y-3 bg-[#0A0F1D]/80 border border-slate-800 p-3.5 rounded-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[#F5C400]" />
              <span>مؤشرات الأداء والحسابات المالية الحقيقية</span>
            </span>
            <button
              onClick={() => setShowStatsPanel(false)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              إخفاء اللوحة ▲
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <div className="p-3 rounded-xl bg-[#060A13] border border-slate-800 text-center">
              <span className="text-slate-400 text-[11px] font-bold block">إجمالي المزادات</span>
              <div className="text-xl font-black text-white font-mono mt-0.5">{kpiStats.total}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-emerald-500/30 text-center">
              <span className="text-emerald-400 text-[11px] font-bold block">نشطة الآن</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{kpiStats.activeNow}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-amber-500/30 text-center">
              <span className="text-amber-400 text-[11px] font-bold block">قيد المراجعة</span>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{kpiStats.underReview}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-slate-800 text-center">
              <span className="text-cyan-400 text-[11px] font-bold block">منشورة</span>
              <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">{kpiStats.published}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-purple-500/30 text-center">
              <span className="text-purple-300 text-[11px] font-bold block">بيعت</span>
              <div className="text-xl font-black text-purple-300 font-mono mt-0.5">{kpiStats.sold}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-slate-800 text-center">
              <span className="text-slate-400 text-[11px] font-bold block">انتهت</span>
              <div className="text-xl font-black text-slate-300 font-mono mt-0.5">{kpiStats.ended}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-slate-800 text-center">
              <span className="text-slate-500 text-[11px] font-bold block">لم تُبع</span>
              <div className="text-xl font-black text-slate-400 font-mono mt-0.5">{kpiStats.unsold}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#060A13] border border-red-500/30 text-center">
              <span className="text-red-400 text-[11px] font-bold block">ملغاة/مرفوضة</span>
              <div className="text-xl font-black text-red-400 font-mono mt-0.5">{kpiStats.cancelled}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="p-3.5 rounded-xl bg-[#060A13] border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                <DollarSign size={14} className="text-amber-400" />
                <span>إجمالي المبيعات</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white font-mono">
                {kpiStats.totalSalesVolume.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060A13] border border-amber-500/30">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                <Percent size={14} />
                <span>عمولة المنصة</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#F5C400] font-mono">
                {kpiStats.totalPlatformCommission.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060A13] border border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <CheckCircle2 size={14} />
                <span>العمولات المحصلة</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                {kpiStats.collectedCommissionAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060A13] border border-orange-500/30">
              <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-1">
                <Clock size={14} />
                <span>العمولات المستحقة</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-orange-300 font-mono">
                {kpiStats.pendingCommissionAmount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060A13] border border-cyan-500/30 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                <Wallet size={14} />
                <span>مستحقات البائعين</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
                {kpiStats.totalSellerPayouts.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">SAR</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* إعدادات العمولة المدمجة */}
      {showCommissionPanel && (
        <div className="bg-[#0A0F1D] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Percent size={18} className="text-[#F5C400]" />
              <h3 className="text-sm font-black text-white">إعدادات العمولة</h3>
            </div>
            <button
              type="button"
              onClick={handleSaveCommissionRates}
              disabled={savingSettings}
              className="shrink-0 px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>{savingSettings ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>

          {settingsSuccessToast && (
            <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>تم حفظ إعدادات العمولة بنجاح</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">نسبة عمولة البائع (%):</label>
              <input
                type="number"
                value={sellerRate}
                onChange={(e) => setSellerRate(Number(e.target.value))}
                className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-bold">نسبة عمولة المشتري (%):</label>
              <input
                type="number"
                value={buyerRate}
                onChange={(e) => setBuyerRate(Number(e.target.value))}
                className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-bold">أدنى قفزة للمزايدة (الافتراضية):</label>
              <input
                type="number"
                value={defaultMinInc}
                onChange={(e) => setDefaultMinInc(Number(e.target.value))}
                className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* شريط التبويبات الرئيسي */}
      <div className="flex items-center gap-2 bg-[#0A0F1D] p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'listings' ? 'bg-[#F5C400] text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>المعروضات والمزادات</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black text-[11px]">({listings.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('bids_log'); fetchBidsLog(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bids_log' ? 'bg-[#F5C400] text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>عمليات المزايدة والشراء</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black text-[11px]">({bidsLog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('action_required')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'action_required'
              ? 'bg-amber-500 text-black shadow-md'
              : urgentAuctions.length > 0
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle size={14} />
          <span>تنبيهات وتدخل عاجل</span>
          {urgentAuctions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] animate-pulse">
              {urgentAuctions.length}
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* تبويب: المعروضات والمزادات (جميع الفلاتر أصبحت YRSelect بالكامل!) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'listings' && (
        <div className="space-y-3">
          <div className="bg-[#0A0F1D] border border-slate-800 p-3 rounded-2xl space-y-2.5 shadow-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالرقم (#ID)، الاسم، صاحب المزاد، الفائز، أو رقم الهاتف..."
                className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* الفلاتر الستة بمكون YRSelect الملكي المخصص بالكامل (صفر افتراضيات لأندرويد!) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <YRSelect
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                options={STATUS_FILTER_OPTIONS}
                placeholder="كل الحالات"
              />

              <YRSelect
                value={filterType}
                onChange={(val) => setFilterType(val as any)}
                options={SALE_TYPE_FILTER_OPTIONS}
                placeholder="كل أنواع البيع"
              />

              <YRSelect
                value={filterCategory}
                onChange={(val) => setFilterCategory(val)}
                options={[{ value: 'all', label: 'كل التصنيفات' }, ...GENERAL_CATEGORY_OPTIONS]}
                placeholder="كل التصنيفات"
              />

              <YRSelect
                value={cityFilter}
                options={YEMEN_GOVERNORATES}
                onChange={(v) => setCityFilter(v)}
                placeholder="كل المحافظات"
              />

              <YRSelect
                value={filterPayment}
                onChange={(val) => setFilterPayment(val)}
                options={PAYMENT_FILTER_OPTIONS}
                placeholder="حالة الدفع"
              />

              <YRSelect
                value={filterCommission}
                onChange={(val) => setFilterCommission(val)}
                options={COMMISSION_FILTER_OPTIONS}
                placeholder="حالة العمولة"
              />
            </div>
          </div>

          {/* جدول المزادات المتكامل */}
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loadingListings ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RefreshCw size={24} className="animate-spin text-[#F5C400] mx-auto" />
                <p className="text-xs">جاري تحميل المزادات من قاعدة البيانات...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Gavel size={32} className="mx-auto text-slate-600" />
                <p className="text-sm font-bold">لا توجد مزادات مطابقة لمعايير البحث</p>
                <p className="text-xs text-slate-500">جرب تغيير الفلاتر أو مسح مربع البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
                <table className="w-full text-right text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#060A13] text-slate-400 border-b border-slate-800 font-bold text-[11px]">
                      <th className="p-3">المعروض</th>
                      <th className="p-3">صاحب المعروض (البائع)</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">المدينة</th>
                      <th className="p-3">نوع البيع</th>
                      <th className="p-3">السعر الحالي / الأعلى</th>
                      <th className="p-3">أدنى قفزة</th>
                      <th className="p-3">تاريخ الانتهاء</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الفائز / المالية</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredListings.map((item) => {
                      const isAuction = item.sale_type === 'auction';
                      const { currentPrice, bidsCount, leadingBid } = getAuctionBidStats(
                        item.id,
                        Number(item.starting_price)
                      );
                      const curPrice = Number(item.current_bid || currentPrice || item.starting_price || 0);
                      const minInc = Number(item.min_increment || defaultMinInc || 1000);
                      const sPhone = item.seller_phone || item.phone || '';
                      const finalVal = Number(item.final_price) || (item.status === 'sold' || item.status === 'completed' ? curPrice : null);
                      const commVal = Number(item.platform_commission) || (finalVal ? Math.round(finalVal * (sellerRate / 100)) : 0);

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                  <Gavel size={16} />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block max-w-[180px] truncate">{item.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">#{String(item.id).slice(0, 6)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-white text-xs">{item.seller_name || 'معتمد'}</div>
                            {sPhone ? (
                              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px]">
                                <span className="text-[#F5C400]">{sPhone}</span>
                                <a
                                  href={`https://wa.me/967${sPhone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="واتساب البائع"
                                >
                                  <MessageCircle size={12} />
                                </a>
                                <a
                                  href={`tel:${sPhone}`}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="اتصال بالبائع"
                                >
                                  <Phone size={12} />
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px]">بدون هاتف</span>
                            )}
                            <div className="flex items-center gap-1 mt-1 font-mono text-[11px]">
                              {item.seller_email ? (
                                <a
                                  href={`mailto:${item.seller_email}`}
                                  className="flex items-center gap-1 text-slate-400 hover:text-[#F5C400] transition-colors"
                                  title={`إرسال بريد: ${item.seller_email}`}
                                >
                                  <Mail size={11} className="text-slate-500 shrink-0" />
                                  <span className="truncate max-w-[150px] dir-ltr text-left">{item.seller_email}</span>
                                </a>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                                  <Mail size={10} className="text-slate-600 shrink-0" />
                                  <span>غير مسجل</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 text-slate-300">{item.category || 'عام'}</td>
                          <td className="p-3 text-slate-400">{item.city || 'صنعاء'}</td>

                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAuction ? 'bg-[#F5C400]/15 text-[#F5C400] border border-[#F5C400]/30' : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                            }`}>
                              {isAuction ? 'مزاد علني' : 'بيع مباشر'}
                            </span>
                          </td>

                          <td className="p-3 font-mono font-black text-emerald-400">
                            {curPrice.toLocaleString()} {item.currency || 'SAR'}
                          </td>

                          <td className="p-3 font-mono text-slate-400">+{minInc.toLocaleString()}</td>

                          <td className="p-3 font-mono text-slate-400 text-[11px]">
                            {item.end_date ? new Date(item.end_date).toLocaleDateString('ar-YE') : (item.end_time ? new Date(item.end_time).toLocaleDateString('ar-YE') : 'غير محدد')}
                          </td>

                          <td className="p-3">
                            {renderStatusBadge(item)}
                          </td>

                          <td className="p-3">
                            {finalVal || item.status === "sold" || item.status === "ended" ? (
                              <div className="text-[11px] space-y-0.5">
                                <span className="font-bold text-amber-400 block font-mono">
                                  {(finalVal || curPrice).toLocaleString()} {item.currency || "SAR"}
                                </span>
                                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                                  <span>🏆</span>
                                  <span className="truncate max-w-[130px]">{item.winner_name || leadingBid?.bidder_name || "بانتظار التأكيد"}</span>
                                </div>
                                {(item.winner_phone || leadingBid?.bidder_phone) && (
                                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                    <span className="text-emerald-400">{item.winner_phone || leadingBid?.bidder_phone}</span>
                                    <a
                                      href={`https://wa.me/967${String(item.winner_phone || leadingBid?.bidder_phone).replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300"
                                      title="واتساب الفائز"
                                    >
                                      <MessageCircle size={11} />
                                    </a>
                                    <a
                                      href={`tel:${item.winner_phone || leadingBid?.bidder_phone}`}
                                      className="text-blue-400 hover:text-blue-300"
                                      title="اتصال بالفائز"
                                    >
                                      <Phone size={11} />
                                    </a>
                                  </div>
                                )}
                                {commVal > 0 && (
                                  <span className="text-[10px] text-emerald-400/90 font-mono block">
                                    العمولة: {commVal.toLocaleString()} {item.currency || "SAR"}
                                  </span>
                                )}
                              </div>
                            ) : leadingBid ? (
                              <div className="text-[11px] space-y-0.5">
                                <div className="flex items-center gap-1 text-slate-300">
                                  <span className="text-[10px] text-amber-400 font-bold">المتصدر:</span>
                                  <span className="font-bold text-white truncate max-w-[110px]">
                                    {leadingBid.bidder_name || leadingBid.bidder_code || "مزايد معتمد"}
                                  </span>
                                </div>
                                <div className="font-mono text-emerald-400 font-bold text-[11px]">
                                  {Number(leadingBid.bid_amount).toLocaleString()} {item.currency || "SAR"}
                                </div>
                                {leadingBid.bidder_phone && (
                                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                    <span className="text-slate-400">{leadingBid.bidder_phone}</span>
                                    <a
                                      href={`https://wa.me/967${String(leadingBid.bidder_phone).replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300"
                                      title="واتساب المتصدر"
                                    >
                                      <MessageCircle size={11} />
                                    </a>
                                  </div>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono block">({bidsCount} سومة)</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px] block">بدون مزايدات حتى الآن</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                                title="تعديل المزاد"
                              >
                                <Edit size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmItem(item)}
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                title="حذف المزاد نهائياً"
                              >
                                <Trash2 size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => navigate(`/admin/auctions/${item.id}`)}
                                className="p-1.5 rounded-lg bg-[#060A13] hover:bg-[#F5C400] text-slate-300 hover:text-black border border-slate-800 transition-colors cursor-pointer"
                                title="المراقبة اللحظية وتفاصيل المزاد الكاملة"
                              >
                                <Activity size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* تبويب: عمليات المزايدة والشراء */}
      {activeTab === 'bids_log' && (
        <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <User size={18} className="text-[#F5C400]" />
                <span>عمليات المزايدة والشراء</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">سجل المزايدات الحقيقية الموثقة مع بيانات التواصل والتحكم المباشر</p>
            </div>
            <button
              onClick={fetchBidsLog}
              className="p-2 bg-[#060A13] border border-slate-800 rounded-xl text-slate-300 hover:text-white"
            >
              <RefreshCw size={14} className={loadingBids ? 'animate-spin text-[#F5C400]' : ''} />
            </button>
          </div>

          {loadingBids ? (
            <div className="p-12 text-center text-slate-400">جاري تحميل السجلات...</div>
          ) : bidsLog.length === 0 ? (
            <div className="p-12 text-center text-slate-400">لا توجد مزايدات مسجلة حتى الآن</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
              <table className="w-full text-right text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#060A13] text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="p-3">#</th>
                    <th className="p-3">رقم المزاد</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">اسم المزايد</th>
                    <th className="p-3">البريد</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">التوقيت</th>
                    <th className="p-3 text-center">التواصل والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bidsLog.map((b, idx) => {
                    const isDirect = b.bid_type === 'direct_buy';
                    const phone = b.bidder_phone || '';
                    return (
                      <tr key={b.id || idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-white">
                          <button
                            onClick={() => navigate(`/admin/auctions/${b.auction_id}`)}
                            className="hover:text-[#F5C400] transition-colors cursor-pointer"
                            title="الانتقال لصفحة المزاد"
                          >
                            #{String(b.auction_id).slice(0, 8)}
                          </button>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDirect ? 'bg-blue-950 text-blue-300 border border-blue-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isDirect ? 'شراء مباشر' : 'مزايدة علنية'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">
                          {b.bidder_name || b.bidder_code || 'مشتري معتمد'}
                        </td>
                        <td className="p-3 font-mono text-slate-300 text-[11px] dir-ltr text-right">
                          {b.bidder_email && b.bidder_email !== 'غير مسجل' ? b.bidder_email : 'غير مسجل'}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#F5C400]">
                          {phone || 'غير مسجل'}
                        </td>
                        <td className="p-3 font-mono font-black text-emerald-400 text-sm">
                          {Number(b.bid_amount).toLocaleString()} SAR
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          {b.created_at ? new Date(b.created_at).toLocaleString('ar-YE') : 'الآن'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {phone && (
                              <>
                                <a
                                  href={`https://wa.me/967${phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                                >
                                  <MessageCircle size={12} />
                                  <span>واتساب</span>
                                </a>
                                <a
                                  href={`tel:${phone}`}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                                >
                                  <Phone size={12} />
                                </a>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBid(b.id)}
                              className="p-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 transition-colors cursor-pointer"
                              title="حذف المزايدة من السجل"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* تبويب: تنبيهات وتدخل عاجل */}
      {activeTab === 'action_required' && (
        <div className="space-y-3">
          <div className="bg-[#0A0F1D] border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-amber-400 w-5 h-5 shrink-0" />
              <div>
                <h3 className="text-sm font-black text-white">مزادات تتطلب تدخلاً عاجلاً من الإدارة</h3>
                <p className="text-xs text-slate-400 mt-0.5">تتضمن المزادات المنتهية بانتظار الاعتماد، المعلقة بانتظار الدفع، أو التي تحتاج موافقة</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500 text-black font-black text-xs rounded-xl">
              {urgentAuctions.length} مزاد
            </span>
          </div>

          {urgentAuctions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-[#0A0F1D] border border-slate-800 rounded-2xl">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-white">كل شيء تحت السيطرة!</p>
              <p className="text-xs text-slate-500">لا توجد مزادات بحاجة لتدخل إداري حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentAuctions.map((item) => {
                const status = getComputedAuctionStatus(item);
                const { currentPrice, leadingBid } = getAuctionBidStats(item.id, Number(item.starting_price));

                return (
                  <div key={item.id} className="bg-[#0A0F1D] border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">#{String(item.id).slice(0, 8)}</span>
                        <h4 className="font-black text-white text-sm">{item.title}</h4>
                        <span className="text-xs text-slate-400 block">{item.seller_name} • {item.city}</span>
                        {item.seller_email && (
                          <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] text-slate-400">
                            <Mail size={11} className="text-slate-500 shrink-0" />
                            <a href={`mailto:${item.seller_email}`} className="hover:text-[#F5C400] truncate max-w-[200px] dir-ltr text-left">
                              {item.seller_email}
                            </a>
                          </div>
                        )}
                      </div>
                      {renderStatusBadge(item)}
                    </div>

                    <div className="bg-[#060A13] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">السعر الحالي/النهائي</span>
                        <span className="text-emerald-400 font-bold">{currentPrice.toLocaleString()} SAR</span>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-500 block text-[10px]">المتصدر / الفائز</span>
                        <span className="text-white font-bold">{item.winner_name || leadingBid?.bidder_name || 'لا يوجد'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {status === 'under_review' && (
                        <>
                          <button
                            onClick={() => setActionConfirmModal({ auction: item, actionType: 'approve' })}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check size={14} />
                            <span>موافقة ونشر</span>
                          </button>
                          <button
                            onClick={() => setActionConfirmModal({ auction: item, actionType: 'reject' })}
                            className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-300 font-bold rounded-xl text-xs cursor-pointer"
                          >
                            رفض
                          </button>
                        </>
                      )}

                      {status === 'ended' && !item.winner_name && (
                        <button
                          onClick={() => setActionConfirmModal({ auction: item, actionType: 'end_now' })}
                          className="flex-1 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Award size={14} />
                          <span>تأكيد الفائز وإغلاق المزاد</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/admin/auctions/${item.id}`)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Activity size={14} />
                        <span>فتح المراقبة الحية</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* نافذة تأكيد الإجراءات الحساسة */}
      {actionConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={20} />
              <h3 className="font-black text-white text-base">تأكيد الإجراء الإداري</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              أنت على وشك تنفيذ إجراء: <strong className="text-[#F5C400]">{actionConfirmModal.actionType}</strong> على المزاد:
              <br />
              <span className="font-bold text-white">"{actionConfirmModal.auction.title}"</span>
            </p>

            {(actionConfirmModal.actionType === 'reject' || actionConfirmModal.actionType === 'cancel') && (
              <div>
                <label className="text-slate-400 block text-xs mb-1">سبب الرفض أو الإلغاء (إلزامي):</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="اكتب السبب بوضوح..."
                  rows={3}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
            )}

            {actionConfirmModal.actionType === 'extend' && (
              <div>
                <label className="text-slate-400 block text-xs mb-1">عدد ساعات التمديد الإضافية:</label>
                <input
                  type="number"
                  value={extendHours}
                  onChange={(e) => setExtendHours(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActionConfirmModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={executeAdminAction}
                disabled={processingAction}
                className="px-5 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs cursor-pointer"
              >
                {processingAction ? 'جاري التنفيذ...' : 'تأكيد التنفيذ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إنشاء / تعديل معروض */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black  flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Gavel size={16} className="text-[#F5C400]" />
                <span>{modalMode === 'create' ? 'إضافة معروض جديد في المنصة' : 'تعديل بيانات المعروض'}</span>
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl bg-[#060A13] border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateListing} className="space-y-3.5 text-xs">
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
                        : 'bg-[#060A13] text-slate-300 border-slate-800'
                    }`}
                  >
                    <Gavel size={14} />
                    <span>مزاد علني (مزايدة)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaleType('fixed_price')}
                    className={`py-2.5 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      saleType === 'fixed_price'
                        ? 'bg-[#F5C400] text-black border-[#F5C400] font-black'
                        : 'bg-[#060A13] text-slate-300 border-slate-800'
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
                  value={formCategory}
                  onChange={(val) => setFormCategory(val)}
                  options={GENERAL_CATEGORY_OPTIONS}
                />
              </div>

              {/* عنوان المعروض */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">عنوان المعروض *</label>
                <input
                  required
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: هاتف سامسونج الترا 26 أو سيارة هيونداي..."
                  className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              {/* المحافظة والعملة */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">موقع المعاينة والمدينة *</label>
                  <YRSelect
                    value={formCity}
                    options={YEMEN_GOVERNORATES.filter((g) => g.value !== 'all')}
                    onChange={(val) => setFormCity(val)}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">العملة المعتمدة *</label>
                  <YRSelect
                    value={formCurrency}
                    onChange={(val) => setFormCurrency(val)}
                    options={PUBLIC_CURRENCY_OPTIONS}
                  />
                </div>
              </div>

              {/* السعر */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">
                  {saleType === 'fixed_price' ? 'سعر البيع المباشر المطلوب *' : 'السعر الابتدائي لافتتاح المزاد *'}
                </label>
                <input
                  required
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="مثال: 5000"
                  className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              {/* اسم صاحب المعروض ورقم الهاتف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">اسم صاحب المعروض (البائع) *</label>
                  <input
                    type="text"
                    value={formSellerName}
                    onChange={(e) => setFormSellerName(e.target.value)}
                    placeholder="اسم البائع أو المنشأة..."
                    className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">رقم هاتف التواصل (9 أرقام) *</label>
                  <input
                    required
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="770000000"
                    className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none text-left dir-ltr"
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
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">تاريخ ووقت انتهاء المزاد *</label>
                  <input
                    required
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono text-xs outline-none"
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
                      value={formMinIncrement}
                      onChange={(e) => setFormMinIncrement(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">أعلى قفزة للزيادة (اختياري)</label>
                    <input
                      type="number"
                      value={formMaxIncrement}
                      onChange={(e) => setFormMaxIncrement(e.target.value)}
                      placeholder="بدون سقف أعلى"
                      className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              {/* تفاصيل ووصف السلعة */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">وصف السلعة وحالتها وملحقاتها:</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب مواصفات السلعة وحالتها بدقة..."
                  className="w-full bg-[#060A13] border border-slate-800 focus:border-[#F5C400] rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              {/* رفع الصور */}
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">صور المعروض الحقيقية (حتى 6 صور):</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-800">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 rounded-full text-white cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 6 && (
                    <button
                      type="button"
                      disabled={compressing}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#F5C400] flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ImagePlus size={18} />
                      <span className="text-[9px] mt-0.5">{compressing ? '...' : '+ صورة'}</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesUpload}
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
                  بتقديم هذا المعروض، يقر صاحب العرض بصحة كافة البيانات والمواصفات وحالة السلعة، ويوافق على شروط الوساطة، ويلتزم بسداد عمولة منصة يمن ريتنج المعتمدة على البائع بنسبة (<span className="text-[#F5C400] font-black font-mono text-xs">{sellerRate}%</span>) {saleType === 'fixed_price' ? 'من سعر البيع المباشر عند إتمام الصفقة.' : 'من أعلى مزايدة نهائية يرسو عليها المزاد.'}
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-white font-bold">
                    أوافق وألتزم بالإقرار والشروط وعمولة المنصة المحددة ({sellerRate}%)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-[#060A13] border border-slate-800 rounded-xl text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingModal || compressing}
                  className="px-6 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingModal ? 'جاري النشر...' : modalMode === 'create' ? 'نشر المعروض الآن' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد حذف المزاد */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <Trash2 size={36} className="text-red-500 mx-auto" />
            <h3 className="font-black text-white text-base">هل أنت متأكد من حذف هذا المعروض؟</h3>
            <p className="text-xs text-slate-400">
              سيتم حذف "{deleteConfirmItem.title}" نهائياً من قاعدة البيانات مع كافة بياناته وسجلاته.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionsManager;
