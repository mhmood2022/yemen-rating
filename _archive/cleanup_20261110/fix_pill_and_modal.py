with open('src/pages/CommunityFeedPage.tsx', 'r') as f:
    lines = f.readlines()

# سنبحث عن مكان الكبسولة والإشعار لاستبدالهما بالتصميمين العالميين
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* 💬 إشعار صاحب المنشور' in line or '{showMySentToast && (' in line:
        start_idx = i - 1
        break
    if '{newPostsQueue.length > 0 && (' in line and i > 1050 and start_idx == -1:
        start_idx = i - 1
        break

for i in range(start_idx + 1, len(lines)):
    if '</button>' in lines[i] and ('newPostsQueue' in lines[i-5] or 'newPostsQueue' in lines[i-15]):
        end_idx = i + 2
        break

perfect_components = '''      {/* 💬 إشعار صاحب المنشور: تم إرسال منشورك (مطابق لصورة منصة X بالملي) */}
      {showMySentToast && (
        <div
          className=\"fixed top-[16px] left-1/2 -translate-x-1/2 z-[100] w-[290px] bg-[#242D34] text-white rounded-[20px] p-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.7)] border border-white/10 flex flex-col items-center gap-[10px] animate-in fade-in slide-in-from-top-4 duration-200 select-none\"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* السطر العلوي: تم إرسال منشورك + دائرة الصح البيضاء */}
          <div className=\"flex items-center justify-center gap-2.5 w-full\">
            <span className=\"text-[15px] font-bold tracking-tight text-white font-['Tahoma',sans-serif]\">تم إرسال منشورك</span>
            <div className=\"w-[21px] h-[21px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm\">
              <svg viewBox=\"0 0 24 24\" className=\"w-[13px] h-[13px] fill-[#242D34] stroke-[#242D34] stroke-[2.5]\">
                <path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\"></path>
              </svg>
            </div>
          </div>

          {/* زر عرض المنشور الفخم بنفس لون وحجم X */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setShowMySentToast(false);
            }}
            className=\"w-full py-[8px] bg-[#3A444C] hover:bg-[#434e57] active:scale-[0.98] transition-all text-white font-bold text-[13px] rounded-[12px] cursor-pointer border-none outline-none text-center shadow-inner\"
          >
            عرض المنشور
          </button>
        </div>
      )}

      {/* 🟡 كبسولة X الدقيقة هندسياً: هوامش متساوية تمنع التشوه البصري - يمن ريتنج */}
      {newPostsQueue.length > 0 && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTweets(prev => [...newPostsQueue, ...prev]);
            setNewPostsQueue([]);
          }}
          className=\"fixed top-[52px] left-1/2 -translate-x-1/2 z-50 bg-[#FFC500] hover:bg-[#fab700] active:scale-95 transition-all duration-150 h-[36px] w-auto max-w-[95vw] pl-[10px] pr-[11px] rounded-full inline-flex items-center gap-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.35)] cursor-pointer border-none outline-none select-none box-border\"
          style={{ direction: 'ltr' }}
        >
          {/* حاوية الأفاتارات: مسافة متوازنة بالملي تمنع التصاق الأفاتار الأخير بالحافة المنحنية */}
          <div className=\"inline-flex items-center flex-shrink-0\">
            {[...newPostsQueue.slice(0, 8)].reverse().map((item, idx) => (
              <img
                key={idx}
                src={item.authorAvatar || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                alt=\"avatar\"
                className=\"w-[28px] h-[28px] rounded-full object-cover shrink-0 block border-[1.5px] border-[#FFC500] box-border shadow-sm\"
                style={{
                  marginLeft: idx === 0 ? '0px' : '-9px',
                  zIndex: idx + 1,
                  position: 'relative',
                }}
              />
            ))}
          </div>

          {/* سهم منصة X الأصلي النظيف */}
          <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" className=\"w-[13px] h-[13px] fill-white shrink-0 block font-bold\">
            <path d=\"M12 4.5l6.5 6.5-1.4 1.4L13 8.3V20h-2V8.3L7.9 12.4 6.5 11l6.5-6.5z\"></path>
          </svg>
        </button>
      )}
'''

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [perfect_components] + lines[end_idx:]
    with open('src/pages/CommunityFeedPage.tsx', 'w') as f:
        f.writelines(new_lines)
    print("🎯 تم تطبيق التصميمين بنجاح 100%: الكبسولة بهوامش متطابقة تمنع التشوه + نافذة 'تم إرسال منشورك' بنفس ألوان X!")
else:
    print("⚠️ لم يتم تحديد الأسطر بدقة.")
