const fs = require('fs');

// 1. إنشاء مجلد صفحة التحكم بالتقييمات
fs.mkdirSync('src/pages/admin/ratings', { recursive: true });

// 2. كتابة مكون صفحة RatingsManager.tsx المربوط حقيقة بقاعدة بيانات Supabase
const ratingsManagerCode = `import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, StarOff, RotateCcw, Percent, Plus, Minus,
  Search, ShieldCheck, CheckCircle2, AlertCircle, Trash2,
  Filter, Loader2, Save, Sparkles, Building2, MessageSquare
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

  // مودال التعديل المخصص
  const [editingBiz, setEditingBiz] = useState<any | null>(null);
  const [customRating, setCustomRating] = useState<number>(0);
  const [customReviewsCount, setCustomReviewsCount] = useState<number>(0);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // جلب المنشآت والتقييمات الحقيقية من Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bData, error: bError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (bError) throw bError;
      setBusinesses(bData || []);

      const { data: rData } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      setReviews(rData || []);
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

  // 1. تصفير تقييم منشأة واحدة في قاعدة البيانات
  const handleResetSingle = async (bizId: string, bizName: string) => {
    setActionLoadingId(bizId);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ rating: 0, review_count: 0, updated_at: new Date().toISOString() })
        .eq('id', bizId);

      if (error) throw error;

      setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, rating: 0, review_count: 0 } : b));
      showToast('success', \`تم تصفير تقييم "\${bizName}" في قاعدة البيانات بنجاح.\`);
    } catch (err: any) {
      showToast('error', 'فشل التصفير: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. تعديل سريع للنجوم أو عدد المقيمين في قاعدة البيانات (+ / -)
  const handleQuickDelta = async (biz: any, ratingDelta: number, reviewsDelta: number) => {
    setActionLoadingId(biz.id);
    const newRating = Math.max(0, Math.min(5, Number(((Number(biz.rating) || 0) + ratingDelta).toFixed(1))));
    const newCount = Math.max(0, (Number(biz.review_count) || 0) + reviewsDelta);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ rating: newRating, review_count: newCount, updated_at: new Date().toISOString() })
        .eq('id', biz.id);

      if (error) throw error;

      setBusinesses(prev => prev.map(b => b.id === biz.id ? { ...b, rating: newRating, review_count: newCount } : b));
      showToast('success', \`تم تحديث تقييم "\${biz.name}" إلى (\${newRating} ★ / \${newCount} تقييم).\`);
    } catch (err: any) {
      showToast('error', 'فشل التحديث: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. تطبيق النسبة الجاهزة وحفظها
  const applyPreset = async (bizId: string, rating: number, count: number) => {
    setActionLoadingId(bizId);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ rating, review_count: count, updated_at: new Date().toISOString() })
        .eq('id', bizId);

      if (error) throw error;

      setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, rating, review_count: count } : b));
      showToast('success', \`تم حفظ التقييم بنجاح: \${rating} ★ (\${count} تقييم).\`);
      setEditingBiz(null);
    } catch (err: any) {
      showToast('error', 'فشل الحفظ: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. تصفير شامل لكافة المنشآت في الموقع دفعة واحدة
  const handleResetAllBusinesses = async () => {
    if (!window.confirm('هل أنت متأكد تماماً من تصفير تقييمات كافة المنشآت في قاعدة البيانات؟ ستصبح جميعها 0.')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ rating: 0, review_count: 0, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      await fetchData();
      showToast('success', 'تم تصفير تقييمات ومراجعات جميع المنشآت في قاعدة البيانات بنجاح.');
    } catch (err: any) {
      showToast('error', 'فشل التصفير الجماعي: ' + err.message);
      setLoading(false);
    }
  };

  // 5. حذف تعليق زائر من قاعدة البيانات
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('هل تريد حذف هذا التقييم نهائياً من قاعدة البيانات؟')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast('success', 'تم حذف التقييم من قاعدة البيانات.');
    } catch (err: any) {
      showToast('error', 'فشل حذف التقييم: ' + err.message);
    }
  };

  // فلترة المنشآت
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesCategory = selectedCategory === 'all' || b.category_id === selectedCategory || (b.category_slug && b.category_slug === selectedCategory);
      const matchesSearch = !searchQuery.trim() || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || (b.city && b.city.includes(searchQuery));
      const hasRating = Number(b.rating) > 0 && Number(b.review_count) > 0;
      const matchesType = filterType === 'all' || (filterType === 'unrated' && !hasRating) || (filterType === 'rated' && hasRating);

      return matchesCategory && matchesSearch && matchesType;
    });
  }, [businesses, selectedCategory, searchQuery, filterType]);

  return (
    <div dir="rtl" className="p-4 sm:p-6 space-y-6 font-['Cairo',sans-serif] text-zinc-100 max-w-7xl mx-auto">
      {notification && (
        <div className={\`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 \${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }\`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* الهيدر الرئيسي مع أزرار التحكم الشامل */}
      <div className="bg-[#0B0F17] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFC500]/20">
              <Star className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">التحكم بالتقييمات والنسب</h1>
              <p className="text-xs text-zinc-400 mt-0.5">لوحة التحكم المركزية لتصفير، زيادة، وضبط تقييمات المنشآت في قاعدة البيانات</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
          <button
            onClick={handleResetAllBusinesses}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <StarOff className="w-4 h-4" />
            <span>تصفير تقييمات كافة المنشآت</span>
          </button>

          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* التبويبات العلوية */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveTab('businesses')}
          className={\`pb-2 text-sm font-black transition relative flex items-center gap-2 \${
            activeTab === 'businesses' ? 'text-[#FFC500]' : 'text-zinc-500 hover:text-zinc-300'
          }\`}
        >
          <Building2 className="w-4 h-4" />
          <span>تقييمات المنشآت ({businesses.length})</span>
          {activeTab === 'businesses' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={\`pb-2 text-sm font-black transition relative flex items-center gap-2 \${
            activeTab === 'reviews' ? 'text-[#FFC500]' : 'text-zinc-500 hover:text-zinc-300'
          }\`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>مراجعات وتعليقات الزوار ({reviews.length})</span>
          {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
        </button>
      </div>

      {activeTab === 'businesses' && (
        <div className="space-y-4">
          {/* البحث والتصفية */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-4 rounded-2xl border border-zinc-800">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن منشأة بالاسم أو المدينة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 pr-10 pl-3 py-2 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-300 px-3 py-2 rounded-xl text-xs outline-none"
              >
                <option value="all">كل التصنيفات</option>
                {OFFICIAL_CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-300 px-3 py-2 rounded-xl text-xs outline-none"
              >
                <option value="all">كافة الحالات</option>
                <option value="unrated">المنشآت المصفّرة (غير المقيمة)</option>
                <option value="rated">المنشآت المقيمة فقط</option>
              </select>
            </div>
          </div>

          {/* شبكة المنشآت وأزرار التحكم */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFC500] mb-2" />
              <p className="text-xs text-zinc-500">جاري تحميل المنشآت...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="py-16 text-center bg-[#0B0F17] rounded-2xl border border-zinc-800 p-6">
              <p className="text-xs text-zinc-500">لا توجد منشآت مطابقة للبحث.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBusinesses.map((biz) => {
                const rating = Number(biz.rating) || 0;
                const count = Number(biz.review_count) || 0;
                const percent = Math.round((rating / 5) * 100);
                const isLoading = actionLoadingId === biz.id;

                return (
                  <div
                    key={biz.id}
                    className="bg-[#0B0F17] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {biz.logo_url ? (
                            <img src={biz.logo_url} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-6 h-6 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{biz.name}</h3>
                          <p className="text-[11px] text-zinc-400">{biz.city || 'الجمهورية اليمنية'}</p>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-1 text-[#FFC500] font-black text-sm">
                          <Star className="w-4 h-4 fill-[#FFC500]" />
                          <span>{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">({count} تقييم • {percent}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-[#FFC500] to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: \`\${percent}%\` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-900">
                      <button
                        onClick={() => handleResetSingle(biz.id, biz.name)}
                        disabled={isLoading}
                        title="تصفير التقييم الآن"
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>تصفير</span>
                      </button>

                      <div className="flex items-center bg-black border border-zinc-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuickDelta(biz, -0.5, 0)}
                          disabled={isLoading || rating <= 0}
                          className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
                          title="إنقاص نصف نجمة"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-[11px] font-bold text-[#FFC500]">{rating.toFixed(1)}★</span>
                        <button
                          onClick={() => handleQuickDelta(biz, 0.5, count === 0 ? 1 : 0)}
                          disabled={isLoading || rating >= 5}
                          className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
                          title="زيادة نصف نجمة"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center bg-black border border-zinc-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuickDelta(biz, 0, -1)}
                          disabled={isLoading || count <= 0}
                          className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
                          title="إنقاص مقيم"
                        >
                          -1
                        </button>
                        <span className="px-2 text-[11px] font-bold text-zinc-200">{count} مقيّم</span>
                        <button
                          onClick={() => handleQuickDelta(biz, rating === 0 ? 5 : 0, 1)}
                          disabled={isLoading}
                          className="px-2 py-1 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
                          title="زيادة مقيم"
                        >
                          +1
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setEditingBiz(biz);
                          setCustomRating(rating);
                          setCustomReviewsCount(count);
                        }}
                        className="mr-auto px-3 py-1.5 bg-[#FFC500] hover:bg-amber-400 text-black rounded-lg text-[11px] font-black transition shadow"
                      >
                        ضبط النسبة ⚙
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-[#0B0F17] p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">التعليقات المسجلة من الزوار</h2>
              <p className="text-xs text-zinc-400">يمكنك مراجعة أو حذف أي تعليق مسيء بنقرة واحدة من قاعدة البيانات</p>
            </div>
            <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-[#FFC500]">
              {reviews.length} تعليق
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="py-16 text-center bg-[#0B0F17] rounded-2xl border border-zinc-800 p-6">
              <p className="text-xs text-zinc-500">لا توجد مراجعات مسجلة في قاعدة البيانات حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reviews.map(r => {
                const biz = businesses.find(b => b.id === r.entity_id);
                return (
                  <div key={r.id} className="bg-[#0B0F17] border border-zinc-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{r.user_name || 'زائر'}</span>
                        <div className="flex text-[#FFC500]">
                          {Array.from({ length: Number(r.rating || r.stars) || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#FFC500]" />
                          ))}
                        </div>
                        {biz && <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">منشأة: {biz.name}</span>}
                      </div>
                      {r.comment && <p className="text-xs text-zinc-300 leading-relaxed pt-1">{r.comment}</p>}
                      <span className="text-[10px] text-zinc-500 block pt-0.5">{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-YE') : ''}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition"
                      title="حذف التعليق نهائياً"
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

      {/* نافذة ضبط النسبة المخصصة */}
      {editingBiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingBiz(null)}>
          <div className="bg-[#0B0F17] border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-black text-white text-sm">ضبط تقييم: {editingBiz.name}</h3>
                <p className="text-xs text-zinc-400">اختر نسبة جاهزة أو حدد القيم بدقة</p>
              </div>
              <button onClick={() => setEditingBiz(null)} className="text-zinc-400 hover:text-white">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 block">نسب جاهزة بنقرة واحدة:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset(editingBiz.id, 5.0, 15)}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-[#FFC500] text-center"
                >
                  🌟 100% ممتاز (5.0★ • 15)
                </button>
                <button
                  onClick={() => applyPreset(editingBiz.id, 4.5, 10)}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-emerald-400 text-center"
                >
                  ⭐ 90% جيد جداً (4.5★ • 10)
                </button>
                <button
                  onClick={() => applyPreset(editingBiz.id, 4.0, 6)}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-blue-400 text-center"
                >
                  👍 80% جيد (4.0★ • 6)
                </button>
                <button
                  onClick={() => applyPreset(editingBiz.id, 0, 0)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 text-center"
                >
                  ❌ تصفير كامل (0★ • 0)
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">معدل التقييم بالنجوم (0 إلى 5):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={customRating}
                  onChange={e => setCustomRating(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-100 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">عدد التقييمات المسجلة:</label>
                <input
                  type="number"
                  min="0"
                  value={customReviewsCount}
                  onChange={e => setCustomReviewsCount(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 focus:border-[#FFC500] text-zinc-100 p-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <button
                onClick={() => applyPreset(editingBiz.id, customRating, customReviewsCount)}
                className="w-full py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>حفظ في قاعدة البيانات الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('src/pages/admin/ratings/RatingsManager.tsx', ratingsManagerCode, 'utf8');
console.log('✅ 1. تم إنشاء صفحة التحكم بالتقييمات RatingsManager.tsx.');

// 3. ربط الصفحة في القائمة الجانبية AdminSidebar.tsx
let sidebarCode = fs.readFileSync('src/components/admin/AdminSidebar.tsx', 'utf8');
if (!sidebarCode.includes("id: 'ratings'")) {
  if (!sidebarCode.includes('Star,')) {
    sidebarCode = sidebarCode.replace(/import\s*\{/, 'import { Star,');
  }
  sidebarCode = sidebarCode.replace(
    /\{\s*id:\s*'all_companies'[^\}]+\},/,
    match => match + "\n  { id: 'ratings', label: 'التحكم بالتقييمات والنسب', icon: Star, path: '/admin/ratings' },"
  );
  fs.writeFileSync('src/components/admin/AdminSidebar.tsx', sidebarCode, 'utf8');
  console.log('✅ 2. تم إضافة خيار التقييمات في القائمة الجانبية AdminSidebar.tsx.');
}

// 4. ربط المسار في App.tsx بدون أي خطأ في علامات التنصيص
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("RatingsManager")) {
  appCode = appCode.replace(
    /import\s*\{\s*CompaniesManager\s*\}\s*from\s*['"][^'"]+['"];/,
    match => match + "\nimport { RatingsManager } from './pages/admin/ratings/RatingsManager';"
  );
  appCode = appCode.replace(
    /<Route\s+path="companies"\s+element=\{<CompaniesManager\s*\/>\}\s*\/>/,
    match => match + '\n          <Route path="ratings" element={<RatingsManager />} />'
  );
  fs.writeFileSync('src/App.tsx', appCode, 'utf8');
  console.log('✅ 3. تم ربط المسار /admin/ratings في App.tsx.');
}
