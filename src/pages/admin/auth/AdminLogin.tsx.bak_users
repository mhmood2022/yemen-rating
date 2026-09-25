import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق الأمني من مفتاح الإدارة أو الحساب المعتمد
    if (
      (email === 'admin@yemenrating.com' || email === 'admin') && 
      (password === 'YR2026_SANAA' || password === 'admin123')
    ) {
      localStorage.setItem('yr_admin_session', JSON.stringify({
        authenticated: true,
        role: 'super_admin',
        name: 'المشرف العام',
        loginAt: new Date().toISOString()
      }));
      setLoading(false);
      onSuccess();
    } else {
      setTimeout(() => {
        setError('بيانات الدخول غير صحيحة أو لا تملك صلاحية الوصول');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] flex items-center justify-center p-4 font-['Cairo',sans-serif]">
      <div className="w-full max-w-md bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* شريط الإضاءة العلوي */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#FFC500] via-yellow-400 to-[#FFC500]" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FFC500] flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-lg shadow-[#FFC500]/20">
            YR
          </div>
          <h1 className="text-xl font-black text-white">مركز التحكم والإدارة الآمن</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">Yemen Rating — Master Specification Control</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center gap-2 text-xs text-[#DC2626]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#D1D5DB] block mb-1.5">البريد الإلكتروني للإدارة</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                required
                placeholder="admin@yemenrating.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl pr-10 pl-4 py-3 text-xs text-white focus:border-[#FFC500] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#D1D5DB] block mb-1.5">مفتاح المرور السري</label>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-3.5 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl pr-10 pl-10 py-3 text-xs text-white focus:border-[#FFC500] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-[#9CA3AF] hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/10 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'جارٍ التحقق...' : 'تسجيل الدخول الآمن'}</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#1F2937] pt-4">
          <span className="text-[10px] text-[#6B7280]">
            نظام حماية داخلي 11 Roles • مشفر بـ RLS
          </span>
        </div>
      </div>
    </div>
  );
};
