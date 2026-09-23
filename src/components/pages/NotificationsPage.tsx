import React, { useState, useEffect } from 'react';
import { 
  notificationService, 
  NotificationItem, 
  NotificationType 
} from '../services/notificationService';
import { 
  Building2, 
  ShieldAlert, 
  Megaphone, 
  Crown, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Trash2, 
  Clock, 
  MessageSquare,
  FileText
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);

  const loadData = async () => {
    const data = await notificationService.getNotifications(activeTab);
    setNotifications(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleOpenItem = async (item: NotificationItem) => {
    setSelectedItem(item);
    if (!item.is_read) {
      await notificationService.markAsRead(item.id);
      loadData();
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    let reason = '';
    if (status === 'rejected') {
      const input = prompt('أدخل سبب الرفض لتوضيحه لصاحب الطلب:');
      if (!input) return;
      reason = input;
    }
    await notificationService.updateStatus(selectedItem.id, status, reason);
    alert(status === 'approved' ? '✅ تم قبول الطلب واعتماده بنجاح!' : '❌ تم رفض الطلب.');
    setSelectedItem(null);
    loadData();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      await notificationService.deleteNotification(id);
      loadData();
    }
  };

  const getTypeDetails = (type: NotificationType) => {
    switch (type) {
      case 'verification':
        return { label: 'طلب توثيق ملكية', icon: Building2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'report':
        return { label: 'بلاغ وشكوى', icon: ShieldAlert, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'subscription':
        return { label: 'طلب اشتراك / باقة', icon: Crown, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'ad_request':
        return { label: 'طلب إعلان YR Ads', icon: Megaphone, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'inquiry':
        return { label: 'استفسار عام', icon: HelpCircle, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      default:
        return { label: 'إشعار عام', icon: FileText, color: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">مركز الإشعارات والعمليات</h1>
        <p className="text-sm text-gray-500 mt-1">متابعة كافة طلبات التوثيق، البلاغات، الاشتراكات، والإعلانات الواردة للمنصة.</p>
      </div>

      {/* تبويبات الفرز المباشرة */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'كل الإشعارات' },
          { key: 'verification', label: 'طلبات التوثيق' },
          { key: 'report', label: 'البلاغات والشكاوى' },
          { key: 'subscription', label: 'طلبات الاشتراكات' },
          { key: 'ad_request', label: 'طلبات الإعلانات' },
          { key: 'inquiry', label: 'الاستفسارات' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">لا توجد إشعارات أو طلبات جديدة في هذا القسم</p>
            <p className="text-xs text-gray-400 mt-1">الطلبات الحقيقية المرسلة من الموقع العام ستظهر هنا مباشرة دون بيانات وهمية.</p>
          </div>
        ) : (
          notifications.map(item => {
            const typeInfo = getTypeDetails(item.type);
            const Icon = typeInfo.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md hover:border-blue-400 flex items-start gap-4 ${
                  !item.is_read ? 'border-r-4 border-r-blue-600 bg-blue-50/20 shadow-sm' : 'border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${typeInfo.color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {item.sector && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {item.sector}
                        </span>
                      )}
                      {item.status && item.status !== 'pending' && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'approved' ? 'معتمد' : 'مرفوض'}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    </div>

                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString('ar-YE')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-1">{item.message}</p>

                  {(item.sender_name || item.facility_name) && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 flex-wrap">
                      {item.facility_name && <span>المنشأة: <strong className="text-gray-800">{item.facility_name}</strong></span>}
                      {item.sender_name && <span>المرسل: <strong className="text-gray-800">{item.sender_name}</strong></span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-center shrink-0">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-blue-600 hover:underline">
                    فحص الطلب ←
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* النافذة البرمجية الكاملة لفحص الإشعار واتخاذ الإجراء (Modal) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            
            {/* الترويسة */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-md border ${getTypeDetails(selectedItem.type).color}`}>
                    {getTypeDetails(selectedItem.type).label}
                  </span>
                  {selectedItem.sector && (
                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-gray-100 text-gray-800">
                      قطاع: {selectedItem.sector}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-gray-900">{selectedItem.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* تفاصيل الرسالة ومقدم الطلب */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100 text-sm">
              <p className="text-gray-800 leading-relaxed font-medium">{selectedItem.message}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200/60 text-xs">
                {selectedItem.facility_name && (
                  <div><span className="text-gray-500">اسم المنشأة:</span> <strong className="text-gray-900">{selectedItem.facility_name}</strong></div>
                )}
                {selectedItem.sender_name && (
                  <div><span className="text-gray-500">مقدم الطلب:</span> <strong className="text-gray-900">{selectedItem.sender_name}</strong></div>
                )}
                {selectedItem.sender_phone && (
                  <div><span className="text-gray-500">رقم الهاتف:</span> <strong className="text-gray-900 font-mono" dir="ltr">{selectedItem.sender_phone}</strong></div>
                )}
                {selectedItem.admin_module && (
                  <div><span className="text-gray-500">القسم الإداري:</span> <strong className="text-gray-900">{selectedItem.admin_module}</strong></div>
                )}
              </div>

              {/* زر واتساب السريع للتواصل مع مقدم الطلب فوراً */}
              {selectedItem.sender_phone && (
                <div className="pt-2">
                  <a 
                    href={`https://wa.me/${selectedItem.sender_phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    مراسلة فورية عبر واتساب
                  </a>
                </div>
              )}
            </div>

            {/* المستندات والمرفقات (سجل تجاري، هوية، صورة إعلان، سند تحويل) */}
            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500">المرفقات والوثائق وصور الإثبات:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedItem.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group border rounded-xl overflow-hidden hover:border-blue-500 transition-all bg-gray-50 flex items-center p-3 gap-3"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{att.name || `مستند #${idx + 1}`}</div>
                        <span className="text-[10px] text-gray-400">انقر لمعاينة الملف بالكامل</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* أزرار القرار المباشر للإدارة */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleAction('approved')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                الموافقة واعتماد الطلب
              </button>

              <button
                onClick={() => handleAction('rejected')}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <XCircle className="w-5 h-5" />
                رفض الطلب
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
