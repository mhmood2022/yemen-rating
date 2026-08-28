import React, { useState } from 'react';
import { Bell, ArrowRight, Check, TrendingUp, Gavel, Star } from 'lucide-react';

export const NotificationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'تحديث أسعار الصرف', desc: 'تم تحديث أسعار الصرف في صنعاء وعدن منذ قليل.', time: 'قبل 10 دقائق', isRead: false, icon: TrendingUp },
    { id: '2', title: 'مزايدة جديدة في المزاد', desc: 'تم تقديم عرض جديد على مزاد سيارة لاندكروزر 2022.', time: 'قبل ساعة', isRead: false, icon: Gavel },
    { id: '3', title: 'تم قبول تقييمك بنجاح', desc: 'شكراً لمشاركتك رأيك في مطعم رويال ستار السياحي.', time: 'قبل يوم', isRead: true, icon: Star }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">مركز الإشعارات والتنبيهات</h1>
            <p className="text-xs text-zinc-400">آخر المستجدات وتحديثات الأسعار والمزادات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-amber-400 hover:underline px-2 py-1"
          >
            تحديد الكل كمقروء
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            <span>رجوع</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-colors flex items-start gap-3.5 ${
                n.isRead ? 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400' : 'bg-zinc-900/80 border-amber-400/30 text-zinc-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-zinc-500">{n.time}</span>
                </div>
                <p className="text-xs text-zinc-300">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
