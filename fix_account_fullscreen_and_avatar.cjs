const fs = require("fs");
let acc = fs.readFileSync("src/pages/AccountPage.tsx", "utf8");

// 1. إضافة myAvatar إلى State إن لم تكن موجودة
if (!acc.includes("const [myAvatar, setMyAvatar]")) {
  acc = acc.replace(
    `const [myName, setMyName] = useState<string>('');`,
    `const [myName, setMyName] = useState<string>('');\n  const [myAvatar, setMyAvatar] = useState<string>('');`
  );
}

// 2. جلب صورة المستخدم المسجل الحالي (صورتك أنت)
acc = acc.replace(
  `.select('full_name, username')`,
  `.select('full_name, username, avatar_url')`
);

acc = acc.replace(
  `setMyName(myProfile.full_name || myProfile.username || 'مستخدم');`,
  `setMyName(myProfile.full_name || myProfile.username || 'مستخدم');\n          setMyAvatar(myProfile.avatar_url || '');`
);

// 3. تحويل نافذة viewingDetailPost لتكون z-[200] بملء الشاشة وتخفي الشريط السفلي بالكامل
const oldDetailViewRegex = /\{viewingDetailPost && \([\s\S]*?<div\s+className="fixed inset-0 z-50 bg-black[\s\S]*?\{/\* Header \*/\}[\s\S]*?<h2 className="text-white font-bold text-lg">التغريدة<\/h2>\s*<\/div>/;

const newDetailHeader = `{viewingDetailPost && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col h-[100dvh] w-full text-white overflow-hidden"
          dir="rtl"
        >
          {/* Header نظيف مطابق لـ X بسهم الرجوع */}
          <div className="h-14 border-b border-[#2F3336]/40 px-4 flex items-center justify-between shrink-0 bg-black">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingDetailPost(null)}
                className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                aria-label="رجوع"
              >
                <ArrowRight size={20} />
              </button>
              <h2 className="font-bold text-base">منشور</h2>
            </div>
          </div>

          {/* محتوى التغريدة والتعليقات قابل للتمرير */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">`;

acc = acc.replace(oldDetailViewRegex, newDetailHeader);

// 4. ضبط صورة المستخدم في ReplyBar لتكون صورتك أنت دائماً
acc = acc.replace(
  `myAvatar={avatarUrl}`,
  `myAvatar={myAvatar || sessionUser?.user_metadata?.avatar_url || avatarUrl}`
);

fs.writeFileSync("src/pages/AccountPage.tsx", acc, "utf8");
console.log("🚀 تم تطبيق ملء الشاشة z-[200] وصورتك الشخصية بنجاح 100%!");
