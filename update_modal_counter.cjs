const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. استبدال شريط أدوات المودال بزر النشر والعداد
const oldToolbar = `<div className="flex items-center justify-between pt-3 border-t border-[#2F3336]">
                    <button
                      type="button"
                      onClick={() => postImageInputRef.current?.click()}
                      className="p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition"
                    >
                      <ImageIcon size={20} />
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white font-extrabold text-sm transition"
                    >
                      نشر
                    </button>
                  </div>`;

const newToolbar = `<div className="flex items-center justify-between pt-3 border-t border-[#2F3336]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => postImageInputRef.current?.click()}
                        className="p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition"
                        title="إرفاق صورة"
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* عداد الحروف المباشر بنظام منصة X */}
                      <div className="flex items-center gap-1 text-xs font-mono select-none" dir="ltr">
                        <span className={newPostText.length > 280 ? 'text-rose-500 font-bold' : newPostText.length >= 260 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                          {newPostText.length}
                        </span>
                        <span className="text-zinc-600">/ 280</span>
                        {newPostText.length >= 260 && (
                          <span className="text-[10px] text-amber-400 mr-1">
                            (متبقي {280 - newPostText.length})
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={(!newPostText.trim() && !newPostImage) || newPostText.length > 280}
                        className="px-5 py-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1D9BF0] active:scale-95 text-white font-extrabold text-sm transition shadow-sm"
                      >
                        نشر
                      </button>
                    </div>
                  </div>`;

if (code.includes(oldToolbar)) {
  code = code.replace(oldToolbar, newToolbar);
  fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
  console.log('SUCCESS_POST_MODAL_COUNTER_APPLIED');
} else {
  console.log('OLD_TOOLBAR_NOT_FOUND');
}
