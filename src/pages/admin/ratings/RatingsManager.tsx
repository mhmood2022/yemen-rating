import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  RotateCcw,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
  Loader2,
  Save,
  Building2,
  MessageSquare,
  Sliders,
  User,
  Calendar,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';

export const RatingsManager: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'unrated' | 'rated'>('all');
  const [activeTab, setActiveTab] = useState<'businesses' | 'reviews'>('businesses');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // حالة النافذة المنبثقة (المودال)
  const [editingBiz, setEditingBiz] = useState<any | null>(null);
  const [customRating, setCustomRating] = useState<number>(5);
  const [customReviewsCount, setCustomReviewsCount] = useState<number>(1);
  const [customAuthor, setCustomAuthor] = useState<string>('مقيم موثق');
  const [customComment, setCustomComment] = useState<string>('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // جلب المنشآت والمراجعات بشكل صحيح
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. جلب المراجعات أولاً
      const { data: rData, error: rError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (rError) throw rError;
      const revsList = rData || [];
      setReviews(revsList);

      // 2. جلب المنشآت
      const { data: bData, error: bError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (bError) throw bError;

      // 3. دمج التقييمات مع احترام تحكم الإدارة الكامل
      const merged = (bData || []).map(biz => {
        const bizRevs = revsList.filter(r => r.entity_id === biz.id);
        const adminRating = Number(biz.rating || 0);
        const adminCount = Number(biz.review_count || 0);

        if (bizRevs.length > 0) {
          const sum = bizRevs.reduce((acc, cur) => acc + (Number(cur.stars ?? cur.rating) || 0), 0);
          const autoRating = parseFloat((sum / bizRevs.length).toFixed(1));
          return {
            ...biz,
            // إذا قام الأدمن بتعيين تقييم نعتمد تقييم الأدمن، وإلا نعتمد الحساب التلقائي
            rating: adminRating > 0 ? adminRating : autoRating,
            review_count: adminCount > 0 ? adminCount : bizRevs.length
          };
        }
        return biz;
      });

      setBusinesses(merged);
    } catch (err: any) {
      console.error('Fetch error:', err);
      showToast('error', 'فشل جلب البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. تصفير تقييم منشأة واحدة
  const handleResetSingle = async (bizId: string, bizName: string) => {
    setActionLoadingId(bizId);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ rating: 0, review_count: 0, updated_at: new Date().toISOString() })
        .eq('id', bizId)
        .select();

      if (error) throw error;
      setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, rating: 0, review_count: 0 } : b));
      showToast('success', `تم تصفير تقييم "${bizName}" في قاعدة البيانات بنجاح.`);
    } catch (err: any) {
      showToast('error', 'فشل التصفير: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. تعديل سريع للنجوم أو عدد المقيمين (+ / -)
  const handleQuickDelta = async (biz: any, ratingDelta: number, reviewsDelta: number) => {
    setActionLoadingId(biz.id);
    const newRating = Math.max(0, Math.min(5, Number(((Number(biz.rating) || 0) + ratingDelta).toFixed(1))));
    const newCount = Math.max(0, (Number(biz.review_count) || 0) + reviewsDelta);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ rating: newRating, review_count: newCount, updated_at: new Date().toISOString() })
        .eq('id', biz.id)
        .select();

      if (error) throw error;
      setBusinesses(prev => prev.map(b => b.id === biz.id ? { ...b, rating: newRating, review_count: newCount } : b));
      showToast('success', `تم تحديث تقييم "${biz.name}" إلى (${newRating} ★ / ${newCount} تقييم).`);
    } catch (err: any) {
      showToast('error', 'فشل التحديث: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. تطبيق نسبة جاهزة بنقرة واحدة
  const applyPreset = async (bizId: string, rating: number, count: number) => {
    setActionLoadingId(bizId);
    const safeRating = Number(rating) || 0;
    const safeCount = Number(count) || 0;
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ rating: safeRating, review_count: safeCount, updated_at: new Date().toISOString() })
        .eq('id', bizId)
        .select();

      if (error) throw error;
      setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, rating: safeRating, review_count: safeCount } : b));
      showToast('success', `تم حفظ التقييم بنجاح: ${safeRating} ★ (${safeCount} تقييم).`);
      setEditingBiz(null);
    } catch (err: any) {
      showToast('error', 'فشل الحفظ: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. حفظ التقييم مع المراجعة والتعليق الحقيقي
  const handleSaveWithReview = async () => {
    if (!editingBiz) return;
    setActionLoadingId(editingBiz.id);
    const safeRating = Number(customRating) || 0;
    const currentCount = Number(editingBiz.review_count) || 0;
    const newCount = customReviewsCount > 0 ? customReviewsCount : (currentCount + 1);

    try {
      let addedRev = null;
      if (customComment.trim() || customAuthor.trim()) {
        const { data: revData, error: revErr } = await supabase
          .from('reviews')
          .insert([
            {
              entity_id: editingBiz.id,
              entity_type: 'business',
              user_name: customAuthor.trim() || 'مقيم موثق',
              stars: Math.max(1, Math.min(5, Math.round(safeRating) || 5)),
              comment: customComment.trim() || 'تقييم رسمي معتمد وموثق للمنشأة.',
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (revErr) throw revErr;
        addedRev = revData?.[0];
      }

      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          rating: safeRating,
          review_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBiz.id)
        .select();

      if (bizErr) throw bizErr;

      setBusinesses(prev =>
        prev.map(b => (b.id === editingBiz.id ? { ...b, rating: safeRating, review_count: newCount } : b))
      );

      if (addedRev) {
        setReviews(prev => [addedRev, ...prev]);
      }

      showToast('success', `تم حفظ التقييم (${safeRating}★) وإضافة المراجعة بنجاح!`);
      setCustomComment('');
      setEditingBiz(null);
    } catch (err: any) {
      showToast('error', 'فشل الحفظ: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. حذف تعليق من قاعدة البيانات
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('هل تريد حذف هذه المراجعة نهائياً من قاعدة البيانات؟')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('success', 'تم حذف المراجعة من قاعدة البيانات.');
    } catch (err: any) {
      showToast('error', 'فشل حذف المراجعة: ' + err.message);
    }
  };

  // المنشآت المفلترة
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesCategory =
        selectedCategory === 'all' ||
        b.category_id === selectedCategory ||
        (b.category_slug && b.category_slug === selectedCategory);
      const matchesSearch =
        !searchQuery.trim() ||
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.city && b.city.includes(searchQuery));
      const hasRating = Number(b.rating) > 0 && Number(b.review_count) > 0;
      const matchesType =
        filterType === 'all' ||
        (filterType === 'unrated' && !hasRating) ||
        (filterType === 'rated' && hasRating);

      return matchesCategory && matchesSearch && matchesType;
    });
  }, [businesses, selectedCategory, searchQuery, filterType]);

  return (
    <div dir="rtl" className="p-3 sm:p-6 space-y-5 font-['Cairo',sans-serif] text-slate-100 max-w-7xl mx-auto bg-[#070B13] min-h-screen">
      {/* إشعار النجاح أو الخطأ */}
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
            : 'bg-rose-950/90 text-rose-200 border-rose-500/40 backdrop-blur-md'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* الرأس الرئيسي للصفحة */}
      <div className="bg-[#0B101D] border border-[#1B253A] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#070B13] border border-[#1E293B] text-[#FFC500] flex items-center justify-center shrink-0 shadow-inner">
            <Star className="w-6 h-6 fill-[#FFC500]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">التحكم بالتقييمات والمراجعات</h1>
            <p className="text-xs text-slate-400 mt-0.5">لوحة إدارة نسب النجوم، عدد المقيمين، والمراجعات المعتمدة</p>
          </div>
        </div>

        {/* أزرار التبديل بين المنشآت والمراجعات (نفس نمط الأزرار المعتمد في الهوية) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`flex-1 md:flex-initial h-11 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'businesses'
                ? 'bg-[#FFC500] text-black shadow-lg shadow-[#FFC500]/10 font-black'
                : 'bg-[#070B13] border border-[#1E293B] text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>المنشآت ({businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 md:flex-initial h-11 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#FFC500] text-black shadow-lg shadow-[#FFC500]/10 font-black'
                : 'bg-[#070B13] border border-[#1E293B] text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>التعليقات المباشرة ({reviews.length})</span>
          </button>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      {activeTab === 'businesses' && (
        <div className="bg-[#0B101D] border border-[#1B253A] rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* حقل البحث */}
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder="ابحث باسم المنشأة، المدينة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] rounded-xl pr-10 pl-3.5 text-xs text-white placeholder:text-slate-500 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* فلتر حالة التقييم */}
            <div className="flex bg-[#050811] border border-[#1E293B] rounded-xl p-1 h-11">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 text-[11px] font-bold rounded-lg transition ${
                  filterType === 'all' ? 'bg-[#FFC500] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('rated')}
                className={`flex-1 text-[11px] font-bold rounded-lg transition ${
                  filterType === 'rated' ? 'bg-[#FFC500] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                المقيمة
              </button>
              <button
                onClick={() => setFilterType('unrated')}
                className={`flex-1 text-[11px] font-bold rounded-lg transition ${
                  filterType === 'unrated' ? 'bg-[#FFC500] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                بدون تقييم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تبويب المنشآت */}
      {activeTab === 'businesses' && (
        <>
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-[#0B101D] rounded-2xl border border-[#1B253A]">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFC500] mb-2.5" />
              <p className="text-xs font-bold text-slate-400">جاري تحميل قائمة المنشآت...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="py-14 text-center bg-[#0B101D] rounded-2xl border border-[#1B253A] p-6 space-y-2">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400">لا توجد منشآت مطابقة لمعايير البحث.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBusinesses.map((biz) => {
                const rating = Number(biz.rating) || 0;
                const count = Number(biz.review_count) || 0;
                const percent = Math.round((rating / 5) * 100);
                const isItemLoading = actionLoadingId === biz.id;

                return (
                  <div
                    key={biz.id}
                    className="bg-[#0B101D] hover:border-slate-700 border border-[#1B253A] rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition shadow-lg"
                  >
                    {/* معلومات المنشأة */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#050811] border border-[#1E293B] overflow-hidden shrink-0 flex items-center justify-center">
                          {biz.logo_url ? (
                            <img src={biz.logo_url} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white line-clamp-1">{biz.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{biz.city || 'الجمهورية اليمنية'}</p>
                        </div>
                      </div>

                      {/* شارة التقييم الإجمالي */}
                      <div className="text-left bg-[#050811] border border-[#1E293B] px-3 py-1.5 rounded-xl shrink-0">
                        <div className="flex items-center gap-1 text-[#FFC500] font-black text-sm">
                          <Star className="w-4 h-4 fill-[#FFC500]" />
                          <span>{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{count} تقييم</span>
                      </div>
                    </div>

                    {/* شريط نسبة التقييم */}
                    <div className="w-full h-1.5 bg-[#050811] rounded-full overflow-hidden border border-[#1E293B]">
                      <div
                        className="h-full bg-gradient-to-l from-[#FFC500] to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* أزرار التحكم السريع والمقاسات القياسية */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1B253A]">
                      {/* زر التصفير */}
                      <button
                        onClick={() => handleResetSingle(biz.id, biz.name)}
                        disabled={isItemLoading}
                        title="تصفير التقييم"
                        className="h-10 px-3 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>تصفير</span>
                      </button>

                      {/* أزرار + و - للنجوم */}
                      <div className="flex items-center bg-[#050811] border border-[#1E293B] rounded-xl h-10 overflow-hidden">
                        <button
                          onClick={() => handleQuickDelta(biz, -0.5, 0)}
                          disabled={isItemLoading || rating <= 0}
                          className="w-9 h-full hover:bg-slate-800 text-slate-300 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                          title="إنقاص نصف نجمة"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="px-2.5 text-xs font-black text-[#FFC500] min-w-[45px] text-center">
                          {rating.toFixed(1)}★
                        </span>

                        <button
                          onClick={() => handleQuickDelta(biz, 0.5, count === 0 ? 1 : 0)}
                          disabled={isItemLoading || rating >= 5}
                          className="w-9 h-full hover:bg-slate-800 text-slate-300 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                          title="زيادة نصف نجمة"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* زر فتح نافذة الضبط المتقدمة */}
                      <button
                        onClick={() => {
                          setEditingBiz(biz);
                          setCustomRating(rating || 5);
                          setCustomReviewsCount(count || 1);
                        }}
                        className="mr-auto h-10 px-4 bg-[#FFC500] hover:bg-[#E6B200] text-black rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-[#FFC500]/10 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>ضبط التقييم</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* تبويب التعليقات والمراجعات */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="py-14 text-center bg-[#0B101D] rounded-2xl border border-[#1B253A] p-6 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400">لا توجد تعليقات مسجلة في قاعدة البيانات بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviews.map((r) => {
                const targetBiz = businesses.find(b => b.id === r.entity_id);
                const starsCount = Math.max(1, Math.min(5, Math.round(Number(r.stars ?? r.rating) || 5)));

                return (
                  <div
                    key={r.id}
                    className="bg-[#0B101D] border border-[#1B253A] rounded-2xl p-4 flex items-start justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1.5 text-right flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{r.user_name || 'زائر موثق'}</span>
                        <div className="flex text-[#FFC500] gap-0.5">
                          {Array.from({ length: starsCount }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#FFC500]" />
                          ))}
                        </div>
                        {targetBiz && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#050811] text-slate-400 border border-[#1E293B]">
                            {targetBiz.name}
                          </span>
                        )}
                      </div>
                      {r.comment && <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>}
                      <span className="text-[10px] text-slate-500 block">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('ar-YE') : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-2 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 rounded-xl transition cursor-pointer"
                      title="حذف المراجعة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* نافذة ضبط التقييم والمراجعة (Modal) - نفس نمط الهوية تماماً */}
      {editingBiz && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setEditingBiz(null)}
        >
          <div
            className="bg-[#0B101D] border border-[#1B253A] rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="flex items-center justify-between border-b border-[#1B253A] pb-3">
              <div>
                <h3 className="font-black text-white text-sm">ضبط تقييم: {editingBiz.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">اختر نسبة معتمدة أو حدد التقييم والمراجعة بدقة</p>
              </div>
              <button
                onClick={() => setEditingBiz(null)}
                className="w-8 h-8 rounded-xl bg-[#050811] border border-[#1E293B] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* نسب جاهزة بنقرة واحدة (بدون إيموجي - أيقونات نقية) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 block">نسب اعتماد جاهزة بنقرة واحدة:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(editingBiz.id, 5.0, 15)}
                  className="h-11 px-3 rounded-xl bg-[#070B13] hover:bg-[#0E1527] border border-[#1E293B] text-xs font-black text-[#FFC500] flex items-center justify-center gap-1.5 transition"
                >
                  <Star className="w-3.5 h-3.5 fill-[#FFC500]" />
                  <span>ممتاز (5.0★ • 15)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset(editingBiz.id, 4.5, 10)}
                  className="h-11 px-3 rounded-xl bg-[#070B13] hover:bg-[#0E1527] border border-[#1E293B] text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>جيد جداً (4.5★ • 10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset(editingBiz.id, 4.0, 6)}
                  className="h-11 px-3 rounded-xl bg-[#070B13] hover:bg-[#0E1527] border border-[#1E293B] text-xs font-bold text-sky-400 flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>جيد (4.0★ • 6)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset(editingBiz.id, 0, 0)}
                  className="h-11 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير كامل (0★)</span>
                </button>
              </div>
            </div>

            {/* إدخال مخصص مع تفاصيل المراجعة */}
            <div className="space-y-3 pt-3 border-t border-[#1B253A]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    التقييم بالنجوم (0 إلى 5):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={customRating}
                    onChange={e => setCustomRating(Number(e.target.value))}
                    className="w-full h-11 bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] text-white px-3 rounded-xl text-xs outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    عدد المقيمين الإجمالي:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customReviewsCount}
                    onChange={e => setCustomReviewsCount(Number(e.target.value))}
                    className="w-full h-11 bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] text-white px-3 rounded-xl text-xs outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  اسم صاحب المراجعة:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: محمد العمري (مقيم موثق)"
                    value={customAuthor}
                    onChange={e => setCustomAuthor(e.target.value)}
                    className="w-full h-11 bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] text-white pr-9 pl-3 rounded-xl text-xs outline-none transition"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  نص المراجعة / التعليق المسجل:
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب نص المراجعة لاعتماده في جدول التقييمات..."
                  value={customComment}
                  onChange={e => setCustomComment(e.target.value)}
                  className="w-full bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] text-white p-3 rounded-xl text-xs outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* زر الحفظ الرسمي */}
              <button
                type="button"
                onClick={handleSaveWithReview}
                disabled={actionLoadingId !== null}
                className="w-full h-11 bg-[#FFC500] hover:bg-[#E6B200] active:scale-[0.98] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FFC500]/10 transition cursor-pointer"
              >
                {actionLoadingId !== null ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>جاري الحفظ والاعتماد...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التقييم واعتماد المراجعة في قاعدة البيانات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
