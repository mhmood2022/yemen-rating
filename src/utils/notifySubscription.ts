import { supabase } from '../lib/supabase';

export async function sendSubscriptionNotification(params: {
  userId?: string | null;
  scope: 'account' | 'business';
  businessId?: string | null;
  entityName?: string | null;
  serviceName: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string | null;
}) {
  if (!params.userId) return;
  try {
    const targetLabel =
      params.scope === 'business'
        ? `لصفحة المنشأة "${params.entityName || 'منشأتك'}"`
        : 'لحسابك الشخصي';

    let title = 'تحديث حالة الاشتراك';
    let message = '';
    if (params.status === 'pending') {
      title = 'طلب اشتراك قيد المراجعة';
      message = `تم استلام طلب "${params.serviceName}" ${targetLabel} وهو الآن قيد المراجعة الإدارية.`;
    } else if (params.status === 'approved') {
      title = 'تم قبول وتفعيل الاشتراك';
      message = `تهانينا! تمت الموافقة على طلب "${params.serviceName}" ${targetLabel} وتفعيله بنجاح.`;
    } else {
      title = 'تعذر قبول طلب الاشتراك';
      message = `تم رفض طلب "${params.serviceName}" ${targetLabel}${params.reason ? ` — السبب: ${params.reason}` : '.'}`;
    }

    const prefix = params.scope === 'business' ? (params.businessId ? `[BIZ:${params.businessId}] ` : '[BIZ] ') : '';
    const { data: auth } = await supabase.auth.getUser();
    const actorId = auth?.user?.id || params.userId;

    await supabase.from('notifications').insert({
      user_id: params.userId,
      actor_id: actorId,
      actor_name: params.scope === 'business' && params.entityName ? params.entityName : 'إدارة يمن ريتنج',
      actor_avatar: null,
      post_id: null,
      title: `${prefix}${title}`.slice(0, 100),
      message,
      type: 'system',
      read: false,
    });
  } catch (err) {
    console.warn('Notification send failed:', err);
  }
}
