import { supabase } from '../lib/supabaseClient';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'verification' | 'review' | 'job' | 'system';
  target_group?: string;
  is_read: boolean;
  time_ago: string;
  action_url?: string;
  action_label?: string;
}

export const notificationService = {
  // جلب الإشعارات مع دعم الفلترة
  async getNotifications(filterType?: string): Promise<NotificationItem[]> {
    if (supabase) {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (filterType && filterType !== 'all') {
          query = query.eq('type', filterType);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as any;
      } catch (err) {
        console.warn('Notifications fallback:', err);
      }
    }

    return [
      {
        id: 'notif-1',
        title: 'تعميم رسمي لجميع البنوك والمصارف',
        message: 'يرجى من جميع البنوك والمؤسسات المالية تحديث أسعار الصرف الصباحية والمسائية وتأكيد أرقام خدمة العملاء.',
        type: 'broadcast',
        target_group: 'banks',
        is_read: false,
        time_ago: 'منذ 10 دقائق',
        action_url: '/financials.html',
        action_label: 'تحديث الأسعار'
      },
      {
        id: 'notif-2',
        title: 'تم اعتماد وتوثيق منشأتك بالشارة الذهبية',
        message: 'تهانينا! تمت مراجعة مستندات (بنك الكريمي) ومنحه الشارة الذهبية الرسمية YR 97 في دليل المنصة.',
        type: 'verification',
        is_read: false,
        time_ago: 'منذ نصف ساعة',
        action_url: '/owner.html',
        action_label: 'عرض لوحة النشاط'
      },
      {
        id: 'notif-3',
        title: 'تقييم جديد 5 نجوم لمطعم حضرموت الدولي',
        message: 'قام العميل (أبو محمد) بنشر مراجعة جديدة وتقييم 5 نجوم لفرع صنعاء حدة.',
        type: 'review',
        is_read: true,
        time_ago: 'منذ ساعتين',
        action_url: '/owner.html',
        action_label: 'الرد على التقييم'
      },
      {
        id: 'notif-4',
        title: 'طلب توظيف ومطابقة ذكية بنسبة 87%',
        message: 'تم استلام طلب متقدم جديد لوظيفة (محاسب مالي أول) متوافق مع شروط الوظيفة عبر وساطة يمن ريتغ.',
        type: 'job',
        is_read: true,
        time_ago: 'منذ 4 ساعات',
        action_url: '/jobs.html',
        action_label: 'فحص الطلب'
      }
    ];
  },

  // إرسال رسالة جماعية من الإدارة إلى قطاع محدد
  async sendBroadcastMessage(broadcast: {
    title: string;
    message: string;
    target_group: string;
  }): Promise<{ success: boolean }> {
    if (supabase) {
      try {
        await supabase.from('broadcast_messages').insert([{
          ...broadcast,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn(e);
      }
    }
    return { success: true };
  }
};
