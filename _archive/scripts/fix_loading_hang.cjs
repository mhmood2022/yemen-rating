const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. لا نجعل الصفحة تبدأ بـ loading = true إذا كانت هناك جلسة، بل نحدد حالة واضحة
code = code.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(false); // حماية من التعليق'
);

// 2. إلغاء أي إعادة تفعيل لـ setLoading(true) من onAuthStateChange نهائياً
code = code.replace(
  /const \{ data: \{ subscription \} \} = supabase\.auth\.onAuthStateChange[\s\S]*?\}\);/g,
  `const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // عند الرجوع من الاستوديو لا نوقف الصفحة إطلاقاً بل نحدث البيانات بصمت
      if (mounted && event !== 'TOKEN_REFRESHED') {
        loadProfile(session?.user || null, true);
      }
    });`
);

// 3. التأكد من أن loadProfile لا تضع setLoading(true) إذا كان isSilent = true
// وحماية setLoading(false) في جميع الحالات
const searchStart = 'const loadProfile = async (currentUserParam?: any, isSilent = false) => {';
const replaceStart = `const loadProfile = async (currentUserParam?: any, isSilent = true) => {
    // لا نحجب الصفحة أبداً إذا كانت معروضة بالفعل
    if (!isSilent && !sessionUser) setLoading(true);`;

if (code.includes(searchStart)) {
  code = code.replace(searchStart, replaceStart);
}

// 4. إزالة شاشة الـ Fullscreen Loading إذا كان لدينا بيانات، واقتصارها فقط على أول ظهور إن لم تكن هناك بيانات
const oldSpinner = `  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9BF0]" />
      </div>
    );
  }`;

const newSpinner = `  if (loading && !sessionUser && !name) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9BF0]" />
      </div>
    );
  }`;

if (code.includes(oldSpinner)) {
  code = code.replace(oldSpinner, newSpinner);
}

fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
console.log('LOADING_HANG_COMPLETELY_REMOVED');
