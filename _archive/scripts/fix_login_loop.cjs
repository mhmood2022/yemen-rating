const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. إضافة authChecked لمنع ظهور شاشة الدخول قبل اكتمال الفحص
if (!code.includes('authChecked')) {
  code = code.replace(
    "const [sessionUser, setSessionUser] = useState<any>(null);",
    "const [sessionUser, setSessionUser] = useState<any>(null);\n  const [authChecked, setAuthChecked] = useState(false);"
  );
}

// 2. تحديث نهاية loadProfile لتفعيل authChecked دائماً
if (!code.includes('setAuthChecked(true)')) {
  code = code.replace(
    "setLoading(false);",
    "setLoading(false);\n      setAuthChecked(true);"
  );
}

// 3. تعديل شرط عرض شاشة القفل بحيث لا يظهر إلا بعد انتهاء الفحص الفعلي
const oldLockCondition = "if (!sessionUser && !targetIdParam) {";
const newLockCondition = "if (authChecked && !sessionUser && !targetIdParam) {";

if (code.includes(oldLockCondition)) {
  code = code.replace(oldLockCondition, newLockCondition);
}

// 4. تعديل شاشة الانتظار الخفيفة أثناء التأكد الأولي من التوكن
const oldWaitCondition = "if (loading && !sessionUser && !name) {";
const newWaitCondition = "if ((!authChecked || loading) && !sessionUser && !name && !targetIdParam) {";

if (code.includes(oldWaitCondition)) {
  code = code.replace(oldWaitCondition, newWaitCondition);
}

fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
console.log('LOGIN_LOOP_COMPLETELY_FIXED');
