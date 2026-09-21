'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  User, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { OwnerProfile, BusinessItem, ReviewItem, OwnerRequest } from '@/types/owner';
import { getOwnerBusinesses, getBusinessReviews, getOwnerRequests } from '@/services/ownerService';
import { OwnerBusinessCard } from '@/components/owner/OwnerBusinessCard';
import { OwnerMiniManagement } from '@/components/owner/OwnerMiniManagement';
import { AddBusinessModal } from '@/components/owner/AddBusinessModal';
import { ClaimBusinessModal } from '@/components/owner/ClaimBusinessModal';

export default function OwnerPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  
  // إدارة المنشأة المحددة
  const [managingBusiness, setManagingBusiness] = useState<BusinessItem | null>(null);
  const [managingReviews, setManagingReviews] = useState<ReviewItem[]>([]);

  // النوافذ
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setOwner({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'المالك',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'owner',
      });

      const [bizList, reqList] = await Promise.all([
        getOwnerBusinesses(user.id),
        getOwnerRequests(user.id),
      ]);

      setBusinesses(bizList);
      setRequests(reqList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // فتح الإدارة المصغرة
  const handleOpenManage = async (biz: BusinessItem) => {
    setManagingBusiness(biz);
    const revs = await getBusinessReviews(biz.id);
    setManagingReviews(revs);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <p className="text-xs font-bold text-zinc-600">جارٍ تحميل نظام المالك...</p>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <Building2 className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="text-base font-black text-zinc-900 mb-2">يرجى تسجيل الدخول للوصول إلى لوحة المالك</h2>
        <a
          href="/auth/login?redirect=/owner"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  // إذا اختار إدارة منشأة، تفتح واجهة الإدارة المصغرة
  if (managingBusiness) {
    return (
      <OwnerMiniManagement
        business={managingBusiness}
        reviews={managingReviews}
        onBack={() => setManagingBusiness(null)}
      />
    );
  }

  return (
    <div className="font-['Cairo'] min-h-screen bg-zinc-50 pb-20 text-zinc-900" dir="rtl">
      
      {/* 1. رأس المالك */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {owner.avatar_url ? (
              <img src={owner.avatar_url} alt={owner.name} className="w-12 h-12 rounded-2xl object-cover border" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-zinc-900">{owner.name}</h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                  حساب مالك
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{owner.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsClaimOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition"
            >
              طلب مطالبة بمنشأة
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              <Plus className="w-4 h-4" />
              إضافة منشأة
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        {/* 2. قسم منشآتي */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900">منشآتي</h2>
              <p className="text-xs text-zinc-500">المنشآت المعتمدة والمربوطة بحسابك</p>
            </div>
            <span className="text-xs font-bold text-zinc-600 bg-white px-3 py-1 rounded-xl border border-zinc-200">
              {businesses.length} منشأة
            </span>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 text-center max-w-md mx-auto">
              <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-zinc-900 mb-1">لا توجد منشآت مرتبطة بحسابك حالياً</h3>
              <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
                يمكنك طلب إضافة منشأتك الجديدة أو المطالبة بمنشأة مسجلة مسبقاً في دليل يمن ريتنغ.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800"
                >
                  إضافة منشأة
                </button>
                <button
                  onClick={() => setIsClaimOpen(true)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"
                >
                  المطالبة بمنشأة
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz) => (
                <OwnerBusinessCard
                  key={biz.id}
                  business={biz}
                  onManage={handleOpenManage}
                />
              ))}
            </div>
          )}
        </div>

        {/* 3. قسم متابعة الطلبات لدى الإدارة العامة */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h3 className="text-sm font-bold text-zinc-900 mb-3">حالة طلباتي لدى الإدارة العامة</h3>
            <div className="divide-y divide-zinc-100">
              {requests.map((req) => (
                <div key={req.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-800">
                      {req.request_type === 'new_business' && 'طلب إضافة منشأة'}
                      {req.request_type === 'claim_business' && 'طلب مطالبة بمنشأة'}
                      {req.request_type === 'promotion_request' && 'طلب ترويج'}
                      {req.request_type === 'edit_business' && 'طلب تعديل حساس'}
                    </span>
                    <span className="text-zinc-400 block text-[11px] mt-0.5">
                      {new Date(req.created_at).toLocaleDateString('ar-YE')}
                    </span>
                    {req.admin_notes && (
                      <p className="text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1 text-[11px]">
                        ملاحظة الإدارة: {req.admin_notes}
                      </p>
                    )}
                  </div>

                  <div>
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        قيد المراجعة
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        تمت الموافقة
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        مرفوض
                      </span>
                    )}
                    {req.status === 'changes_requested' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <AlertTriangle className="w-3 h-3" />
                        يحتاج تعديل
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* نوافذ الطلبات */}
      <AddBusinessModal
        ownerId={owner.id}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadData}
      />

      <ClaimBusinessModal
        ownerId={owner.id}
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        onSuccess={loadData}
      />

    </div>
  );
}
