const fs = require('fs');

let lines = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8').split('\n');

// 1. إضافة الحد الأقصى في الـ textarea
for (let i = 1060; i < Math.min(1100, lines.length); i++) {
  if (lines[i].includes('placeholder="ماذا يحدث؟ اكتب منشورك..."')) {
    // إضافة maxLength وتحديد القيود
    lines[i] = lines[i] + '\n                  maxLength={280}';
    console.log('APPLIED_MAX_LENGTH_TO_TEXTAREA_AT_LINE_' + (i + 1));
    break;
  }
}

// 2. استبدال زر النشر القديم بزر يحتوي على عداد الحروف X
let toolbarStart = -1;
let toolbarEnd = -1;

for (let i = 1090; i < Math.min(1130, lines.length); i++) {
  if (lines[i].includes('border-t border-[#2F3336]') && lines[i].includes('flex items-center justify-between')) {
    toolbarStart = i;
  }
  if (toolbarStart !== -1 && lines[i].includes('</button>') && lines[i - 1]?.includes('نشر')) {
    toolbarEnd = i;
    break;
  }
}

if (toolbarStart !== -1 && toolbarEnd !== -1) {
  const replacementLines = [
    '                <div className="flex items-center justify-between pt-3 border-t border-[#2F3336]">',
    '                  <button',
    '                    type="button"',
    '                    onClick={() => postImageInputRef.current?.click()}',
    '                    className="p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition"',
    '                    title="إرفاق صورة"',
    '                  >',
    '                    <ImageIcon size={20} />',
    '                  </button>',
    '                  <div className="flex items-center gap-3">',
    '                    <div className="flex items-center gap-1 text-xs font-mono select-none" dir="ltr">',
    '                      <span className={newPostText.length > 280 ? "text-rose-500 font-bold" : newPostText.length >= 260 ? "text-amber-400 font-bold" : "text-zinc-500"}>',
    '                        {newPostText.length}',
    '                      </span>',
    '                      <span className="text-zinc-600">/ 280</span>',
    '                      {newPostText.length >= 260 && (',
    '                        <span className="text-[10px] text-amber-400 mr-1">',
    '                          (متبقي {280 - newPostText.length})',
    '                        </span>',
    '                      )}',
    '                    </div>',
    '                    <button',
    '                      type="submit"',
    '                      disabled={(!newPostText.trim() && !newPostImage) || newPostText.length > 280}',
    '                      className="px-5 py-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-sm transition"',
    '                    >',
    '                      نشر',
    '                    </button>',
    '                  </div>',
    '                </div>'
  ];

  lines.splice(toolbarStart, (toolbarEnd - toolbarStart + 2), ...replacementLines);
  fs.writeFileSync('src/pages/AccountPage.tsx', lines.join('\n'), 'utf8');
  console.log('SUCCESS_TOOLBAR_AND_COUNTER_APPLIED');
} else {
  console.log('TOOLBAR_INDEXES_NOT_FOUND', { toolbarStart, toolbarEnd });
}
