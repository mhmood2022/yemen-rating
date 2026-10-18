const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// استبدال شاشة الدوران بالكامل بحيث تعرض محتوى الصفحة فوراً ولا تعلق أبداً
const spinnerPattern = /\/\/\s*4\.\s*تعديل شاشة الانتظار[\s\S]*?<Loader2 className="w-8 h-8 animate-spin text-\[#1D9BF0\]" \/>[\s\S]*?<\/div>[\s\S]*?\);\s*\}/;

const directSpinner = `if ((!authChecked || loading) && !sessionUser && !name && !targetIdParam) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9BF0]" />
      </div>
    );
  }`;

if (code.includes(directSpinner)) {
  // إلغاء كود حجب الشاشة بالدوران نهائياً
  code = code.replace(directSpinner, "// تم إلغاء حجب الشاشة بالدوران نهائياً");
}

// التأكد من أن authChecked مفعلة فوراً كقيمة أولية
code = code.replace(
  "const [authChecked, setAuthChecked] = useState(false);",
  "const [authChecked, setAuthChecked] = useState(true);"
);

fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
console.log('SPINNER_REMOVED_PAGE_OPENS_INSTANTLY');
