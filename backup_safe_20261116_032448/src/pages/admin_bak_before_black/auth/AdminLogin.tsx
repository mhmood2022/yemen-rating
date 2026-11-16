import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, LogOut, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { AccessInfo } from '../../../lib/access';

interface AdminLoginProps {
  access?: AccessInfo | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ access }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    // فحص الحسابين المصرح لهما بإدارة المنظومة بكلمة مرور الإدارة
    const isYemenRating = cleanEmail === "info.yemenrating@gmail.com" && password === "Yemen123456";
    const isMahmoud = cleanEmail === "mhmood7015@gmail.com" && password === "Yemen123456";

    if (isYemenRating || isMahmoud) {
      // حفظ جلسة الإدارة المعزولة فقط دون لمس جلسة الموقع العام نهائياً
      localStorage.setItem("yr_admin_session", JSON.stringify({
        authenticated: true,
        role: isYemenRating ? "super_admin" : "admin",
        name: isYemenRating ? "يمن ريتنج - الإدارة العليا" : "محمود - إدارة المنصة",
        email: cleanEmail,
        loginAt: new Date().toISOString()
      }));

      setLoading(false);
      window.location.reload();
      return;
    }

    setError("بيانات الدخول غير صحيحة أو الحساب غير مصرح له بالإدارة");
    setLoading(false);
  };

  const isMasterSession = () => {
    try {
      const s = localStorage.getItem('yr_admin_session');
      if (s) {
        const parsed = JSON.parse(s);
        return parsed.authenticated && (parsed.email === "info.yemenrating@gmail.com" || parsed.email === "mhmood7015@gmail.com");
      }
    } catch {}
    return false;
  };

  const isCurrentMahmoud = access?.email?.toLowerCase() === "info.yemenrating@gmail.com" || access?.email?.toLowerCase() === "mhmood7015@gmail.com";
  const signedInNoAccess = !isMasterSession() && !isCurrentMahmoud && !!access?.userId && !access.isStaff;

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('yr_admin_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-['Cairo',sans-serif]">
      <div className="w-full max-w-md bg-[#0B0F17] border border-[#2F3336] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#FFC500] via-yellow-400 to-[#FFC500]" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FFC500] flex items-center justify-center font-black text-black text-2xl mx-auto mb-4">YR</div>
          <h1 className="text-xl font-black text-white">مركز التحكم والإدارة</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">تسجيل دخول المشرف العام والمدير المعتمد</p>
        </div>

        {(error || signedInNoAccess) && (
          <div className="mb-5 p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-start gap-2 text-xs text-[#DC2626]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              {error || `الحساب (${access?.email}) لا يملك صلاحية دخول الإدارة، أو أنه معلّق/معطّل.`}
            </span>
          </div>
        )}

        {signedInNoAccess ? (
          <button onClick={handleSignOut}
            className="w-full py-3.5 rounded-xl bg-[#161D2B] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer">
            <LogOut size={16} /><span>تسجيل الخروج والدخول بحساب آخر</span>
          </button>
        ) : (
          <>
            <form onSubmit={handlePassword} className="space-y-3 mb-4">
              <input
                type="email"
                required
                placeholder="البريد الإلكتروني (mhmood7015@gmail.com)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                dir="ltr"
                className="w-full bg-[#161D2B] border border-[#2F3336] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FFC500]"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#161D2B] border border-[#2F3336] rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-[#FFC500]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-3 text-[#9CA3AF] hover:text-white"
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#FFC500] text-black font-black text-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'جارٍ التحقق...' : 'دخول المشرف العام'}
              </button>
            </form>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#161D2B] border border-[#2F3336] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={16} className="text-[#FFC500]" />
              <span>{loading ? 'جارٍ التحويل...' : 'الدخول بحساب Google'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
