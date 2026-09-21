'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OwnerTemplate } from '@/components/owner/OwnerTemplate';
import { OwnerProfile, BusinessItem } from '@/types/owner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';

export default function OwnerPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);

  const loadOwnerData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // جلب بيانات المالك الحقيقية
      setOwner({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'المالك',
        email: user.email,
        phone: user.phone || user.user_metadata?.phone,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'owner',
      });

      // جلب المنشآت الحقيقية التابعة للمالك
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (bizData) {
        setBusinesses(bizData as BusinessItem[]);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  const handleSaveBusiness = async (businessId: string, updatedData: Partial<BusinessItem>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(updatedData)
        .eq('id', businessId);

      if (error) {
        console.error('Error updating business:', error);
        return false;
      }

      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, ...updatedData } : b))
      );
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <p className="text-sm font-semibold text-zinc-600">جارٍ تحميل لوحة المالك...</p>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">يرجى تسجيل الدخول للوصول إلى لوحة المالك</h2>
        <a
          href="/auth/login?redirect=/owner"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <OwnerTemplate
      owner={owner}
      businesses={businesses}
      onSaveBusiness={handleSaveBusiness}
      onRefresh={loadOwnerData}
      addBusinessHref="/businesses/new"
      subscriptionHref="/subscriptions"
    />
  );
}
