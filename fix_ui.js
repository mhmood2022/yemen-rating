const fs = require('fs');
const filePath = 'src/pages/CommunityFeedPage.tsx';

// 1. استعادة النسخة السليمة أولاً
const backupPath = 'src/pages/CommunityFeedPage.tsx.bak_final_attempt';
if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    console.log('✅ تم استعادة النسخة السليمة (bak_final_attempt)');
} else {
    console.log('⚠️ لم يتم العثور على النسخة الاحتياطية، سنعمل على الملف الحالي');
}

// 2. قراءة الملف
let content = fs.readFileSync(filePath, 'utf8');

// 3. البحث عن زر الثلاث نقاط واستبداله
const oldStr = `<MoreHorizontal size={16} />`;
const newStr = `<div className="flex items-center gap-1">
  <button onClick={(e) => { e.stopPropagation(); setReportingItem({ type: "post", targetId: tweet.id, targetName: tweet.authorName || "مستخدم", targetAuthorId: tweet.authorId || "" }); }} className="p-1.5 text-[#71767B] hover:text-rose-500 rounded-full transition">
    <Flag size={16} />
  </button>
  ${oldStr}
</div>`;

if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ تم إضافة زر الإبلاغ بجانب الثلاث نقاط بنجاح');
} else {
    console.log('❌ لم يتم العثور على <MoreHorizontal size={16} /> في الملف. قد يكون الكود مختلفاً.');
}

// 4. التحقق من وجود دوال الإبلاغ الأساسية (States, Function, Modal)
// إذا لم تكن موجودة، سنضيفها بطريقة آمنة
if (!content.includes('const [reportingItem, setReportingItem]')) {
    console.log('➕ إضافة States...');
    content = content.replace(
        "const [newCommentText, setNewCommentText] = useState('');",
        `const [newCommentText, setNewCommentText] = useState('');
  const [reportingItem, setReportingItem] = useState<any>(null);
  const [reportReason, setReportReason] = useState("محتوى غير لائق أو مسيء");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);`
    );
    fs.writeFileSync(filePath, content, 'utf8');
}

if (!content.includes('handleSubmitReport')) {
    console.log('➕ إضافة دالة الإرسال...');
    content = content.replace(
        "const handleAddComment = ",
        `const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;
    setSubmittingReport(true);
    try {
      const reportData = {
        id: crypto.randomUUID(),
        type: reportingItem.type,
        targetId: reportingItem.targetId,
        targetName: reportingItem.targetName,
        targetAuthorId: reportingItem.targetAuthorId,
        reason: reportReason,
        details: reportDetails.trim(),
        created_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('yr_community_reports') || '[]');
      localStorage.setItem('yr_community_reports', JSON.stringify([reportData, ...existing]));
      alert('تم استلام بلاغك بنجاح 🛡️');
      setReportingItem(null);
      setReportDetails('');
      setReportReason('محتوى غير لائق أو مسيء');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAddComment = `
    );
    fs.writeFileSync(filePath, content, 'utf8');
}

if (!content.includes('نافذة الإبلاغ المنبثقة')) {
    console.log('➕ إضافة النافذة المنبثقة...');
    const modalCode = `
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setReportingItem(null)}>
          <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl w-full max-w-md p-5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert size={20} />
                <h2 className="text-base font-black text-white">إبلاغ عن محتوى</h2>
              </div>
              <button onClick={() => setReportingItem(null)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold">السبب</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full bg-black border border-[#2F3336] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500">
                  <option value="محتوى غير لائق أو مسيء">محتوى غير لائق أو مسيء</option>
                  <option value="معلومات مضللة">معلومات مضللة</option>
                  <option value="انتحال شخصية">انتحال شخصية</option>
                  <option value="سبام أو إعلانات">سبام أو إعلانات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold">تفاصيل إضافية</label>
                <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="اكتب أي تفاصيل..." className="w-full bg-black border border-[#2F3336] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 resize-none h-24" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setReportingItem(null)} className="flex-1 py-2.5 rounded-xl border border-[#2F3336] text-white font-bold hover:bg-white/5 transition">إلغاء</button>
                <button type="submit" disabled={submittingReport} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition disabled:opacity-50">{submittingReport ? 'جاري الإرسال...' : 'إرسال البلاغ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}`;
    const lastDiv = content.lastIndexOf('</div>');
    if (lastDiv !== -1) {
        content = content.slice(0, lastDiv) + modalCode + content.slice(lastDiv);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

console.log('🎉 انتهت العملية! جاري بناء المشروع...');
