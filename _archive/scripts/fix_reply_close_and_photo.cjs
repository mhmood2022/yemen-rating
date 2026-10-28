const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. إضافة commentImageInputRef وحالات صورة التعليق إذا لم تكن موجودة
if (!code.includes('commentImageInputRef')) {
  code = code.replace(
    "const imageInputRef = useRef<HTMLInputElement>(null);",
    "const imageInputRef = useRef<HTMLInputElement>(null);\n  const commentImageInputRef = useRef<HTMLInputElement>(null);\n  const [commentImage, setCommentImage] = useState<string>('');\n  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);"
  );
}

// 2. تحديث دالة handleAddComment للإغلاق التلقائي للمودال وحفظ الصورة
const oldCommentSuccess = `    setNewCommentText('');
    showToast('تم نشر ردك بنجاح! 💬');`;

const newCommentSuccess = `    setNewCommentText('');
    setCommentImage('');
    setCommentImageFile(null);
    showToast('تم نشر ردك بنجاح! 💬');

    // إغلاق نافذة الرد تلقائياً والرجوع للخلاصة
    if (activeCommentTweet) {
      setActiveCommentTweet(null);
    }`;

if (code.includes(oldCommentSuccess)) {
  code = code.replace(oldCommentSuccess, newCommentSuccess);
}

// 3. إضافة دالة اختيار صورة التعليق والمعاينة
const commentImageHandler = `
  const handleCommentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، اختر صورة أقل من 4 ميجابايت');
      return;
    }
    setCommentImageFile(file);
    setCommentImage(URL.createObjectURL(file));
  };
`;

if (!code.includes('handleCommentImageSelect')) {
  code = code.replace(
    "const handleAddComment = (e?: React.FormEvent) => {",
    commentImageHandler + "\n  const handleAddComment = (e?: React.FormEvent) => {"
  );
}

// 4. ربط زر الصورة بمودال الرد لفتح الاستوديو وعرض المعاينة
const oldReplyImageBtn = `<div className="flex items-center gap-2 text-[#1D9BF0]">
                <button type="button" className="p-2 hover:bg-[#1D9BF0]/10 rounded-full transition" title="إرفاق صورة">
                  <ImageIcon size={20} />
                </button>
              </div>`;

const newReplyImageBtn = `<div className="flex items-center gap-2 text-[#1D9BF0]">
                <input
                  type="file"
                  ref={commentImageInputRef}
                  onChange={handleCommentImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button" 
                  onClick={() => commentImageInputRef.current?.click()}
                  className="p-2 hover:bg-[#1D9BF0]/10 rounded-full transition" 
                  title="إرفاق صورة من الاستوديو"
                >
                  <ImageIcon size={20} />
                </button>
              </div>`;

if (code.includes(oldReplyImageBtn)) {
  code = code.replace(oldReplyImageBtn, newReplyImageBtn);
}

// 5. إضافة معاينة صورة التعليق قبل الإرسال داخل المودال
const oldTextareaWrapper = `<div className="flex-1 min-w-0">
                <textarea`;

const newTextareaWrapper = `<div className="flex-1 min-w-0">
                <textarea`;

// إضافة عرض المعاينة إن وجدت صورة ملتقطة
const oldTextAreaEnd = `autoFocus
                />
              </div>`;

const newTextAreaEnd = `autoFocus
                />
                {commentImage && (
                  <div className="relative mt-2 mb-2 rounded-xl overflow-hidden border border-[#2F3336] max-h-48 bg-black">
                    <img src={commentImage} alt="معاينة" className="w-full h-auto object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={() => { setCommentImage(''); setCommentImageFile(null); if (commentImageInputRef.current) commentImageInputRef.current.value = ''; }}
                      className="absolute top-2 left-2 p-1 bg-black/70 hover:bg-black rounded-full text-white transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>`;

if (code.includes(oldTextAreaEnd)) {
  code = code.replace(oldTextAreaEnd, newTextAreaEnd);
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('SUCCESS_AUTO_CLOSE_AND_IMAGE_PICKER_APPLIED');
