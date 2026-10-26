import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'yr_admin_notifications';

export type NotificationType = 
  | 'verification'   // 1. طلب توثيق وإثبات ملكية منشأة
  | 'report'         // 2. بلاغ أو شكوى
  | 'subscription'   // 3. طلب اشتراك / ترقية باقة
  | 'ad_request'     // 4. طلب إعلان YR Ads
  | 'edit_request'   // 5. تعديل بيانات
  | 'inquiry';       // 6. استفسار أو رسالة عامة

export interface NotificationAttachment {
  type: 'image' | 'pdf' | 'document';
  url: string;
  name?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_phone?: string;
  sender_email?: string;
  facility_name?: string;
  sector?: string;
  admin_module?: string;
  attachments?: NotificationAttachment[];
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export const notificationService = {
  async getNotifications(filterType?: string): Promise<NotificationItem[]> {
    if (supabase) {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (filterType && filterType !== 'all') {
          query = query.eq('type', filterType);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as NotificationItem[];
      } catch (err) {
        console.warn('Fallback to local storage:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    let items: NotificationItem[] = local ? JSON.parse(local) : [];

    if (filterType && filterType !== 'all') {
      items = items.filter(n => n.type === filterType);
    }

    return items;
  },

  async createNotification(item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read' | 'status'>): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'pending'
    };

    if (supabase) {
      try {
        await supabase.from('notifications').insert([newItem]);
      } catch (e) {
        console.warn('Saved to localStorage fallback:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    const items: NotificationItem[] = local ? JSON.parse(local) : [];
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  async updateStatus(id: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const items: NotificationItem[] = JSON.parse(local);
      const updated = items.map(n => n.id === id ? {
        ...n,
        is_read: true,
        status,
        rejection_reason: reason
      } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  },

  async markAsRead(id: string): Promise<void> {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const items: NotificationItem[] = JSON.parse(local);
      const updated = items.map(n => n.id === id ? { ...n, is_read: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const items: NotificationItem[] = JSON.parse(local);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter(n => n.id !== id)));
    }
  }
};
