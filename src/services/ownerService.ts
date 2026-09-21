import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BusinessItem, ReviewItem, OwnerRequest } from '@/types/owner';

const supabase = createClientComponentClient();

// 1. تسجيل عملية المالك في سجل التدقيق (Audit Log)
export async function logOwnerAction(ownerId: string, action: string, businessId?: string, details = {}) {
  try {
    await supabase.from('owner_audit_logs').insert({
      owner_id: ownerId,
      business_id: businessId || null,
      action,
      details,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// 2. جلب منشآت المالك الحقيقي فقط
export async function getOwnerBusinesses(ownerId: string): Promise<BusinessItem[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch businesses error:', error);
    return [];
  }
  return (data || []) as BusinessItem[];
}

// 3. جلب تقييمات المنشأة الحقيقية
export async function getBusinessReviews(businessId: string): Promise<ReviewItem[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, business_id, user_name, rating, comment, created_at, reply, reply_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch reviews error:', error);
    return [];
  }
  return (data || []) as ReviewItem[];
}

// 4. رد المالك على التقييم (إن وُجد الدعم في قاعدة البيانات)
export async function replyToReview(reviewId: string, replyText: string, ownerId: string, businessId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('reviews')
    .update({ reply: replyText, reply_at: now })
    .eq('id', reviewId);

  if (error) return false;
  await logOwnerAction(ownerId, 'reply_to_review', businessId, { reviewId, replyText });
  return true;
}

// 5. تعديل البيانات الآمنة للمنشأة مباشرة
export async function updateSafeBusinessData(
  businessId: string,
  ownerId: string,
  data: Partial<BusinessItem>
): Promise<boolean> {
  // نسمح فقط بالحقول الآمنة للمالك مباشرة
  const safePayload = {
    description: data.description,
    phone: data.phone,
    whatsapp: data.whatsapp,
    website: data.website,
    address: data.address,
    working_hours: data.working_hours,
  };

  const { error } = await supabase
    .from('businesses')
    .update(safePayload)
    .eq('id', businessId)
    .eq('owner_id', ownerId);

  if (error) return false;
  await logOwnerAction(ownerId, 'update_safe_data', businessId, safePayload);
  return true;
}

// 6. تقديم طلب تعديل حساس أو طلب إضافة أو مطالبة عبر موافقة الإدارة
export async function submitOwnerRequest(
  ownerId: string,
  requestType: OwnerRequest['request_type'],
  payload: Record<string, any>,
  businessId?: string
): Promise<boolean> {
  const { error } = await supabase.from('owner_requests').insert({
    owner_id: ownerId,
    business_id: businessId || null,
    request_type: requestType,
    status: 'pending',
    requested_data: payload,
  });

  if (error) return false;
  await logOwnerAction(ownerId, `submit_request_${requestType}`, businessId, payload);
  return true;
}

// 7. جلب قائمة طلبات المالك لمتابعة حالاتها
export async function getOwnerRequests(ownerId: string): Promise<OwnerRequest[]> {
  const { data, error } = await supabase
    .from('owner_requests')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as OwnerRequest[];
}
