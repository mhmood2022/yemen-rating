import React, { useState } from 'react';
import { User, Settings, Heart, Star, Bell, ArrowRight, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const ProfilePage: React.FC<{ onBack: () => void; onNavigateFavorites: () => void }> = ({ onBack, onNavigateFavorites }) => {
  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          الملف الشخصي والحساب
        </h1>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>الرجوع</span>
        </button>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-amber-400 text-zinc-950 font-black text-2xl flex items-center justify-center shadow-lg">
          م
        </div>
        <div className="space-y-1 text-center sm:text-right flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-white">محمود عبدالكريم الأهدل</h2>
            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">عضو موثق</span>
          </div>
          <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-3">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-400" /> 777123456</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-500" /> صنعاء، اليمن</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onNavigateFavorites}
          className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-400/40 transition-colors text-right space-y-2 group"
        >
          <Heart className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-white">المحفوظات والمفضلة</h3>
          <p className="text-xs text-zinc-400">استعراض الأنشطة والعقارات المحفوظة</p>
        </button>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-right space-y-2">
          <Star className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-sm text-white">مراجعاتي وتقييماتي</h3>
          <p className="text-xs text-zinc-400">إجمالي (8 تقييمات منشورة)</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-right space-y-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-sm text-white">إعدادات الحساب</h3>
          <p className="text-xs text-zinc-400">كلمة المرور وتفضيلات التنبيهات</p>
        </div>
      </div>
    </div>
  );
};
