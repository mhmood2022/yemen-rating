import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_portal_{int(time.time())}")

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إضافة استيراد createPortal
if "import { createPortal }" not in content:
    content = content.replace(
        "import React, { useState, useEffect, useRef } from 'react';",
        "import React, { useState, useEffect, useRef } from 'react';\nimport { createPortal } from 'react-dom';"
    )
    print("✅ 1. تم إضافة استيراد createPortal.")

# 2. تحويل القائمة إلى Portal - الجزء الأول (الفتح)
old_open = """            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute left-0 top-12 w-44 bg-black/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-[110] text-xs animate-fade-in divide-y divide-[#2F3336]/60">"""

new_open = """            {isMenuOpen && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setIsMenuOpen(false)} />
                <div className="fixed top-[70px] right-4 w-44 bg-black/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-[9999] text-xs animate-fade-in divide-y divide-[#2F3336]/60">"""

if old_open in content:
    content = content.replace(old_open, new_open)
    print("✅ 2. تم تحويل فتح القائمة إلى Portal.")
else:
    print("⚠️ لم يتم العثور على بداية القائمة الدقيقة.")

# 3. تحويل القائمة إلى Portal - الجزء الثاني (الإغلاق)
old_close = """                    </div>
                  )}
                </div>
              </>
            )}"""

new_close = """                    </div>
                  )}
                </div>
              </>,
              document.body
            )}"""

if old_close in content:
    content = content.replace(old_close, new_close)
    print("✅ 3. تم تحويل إغلاق القائمة إلى Portal (document.body).")
else:
    print("⚠️ لم يتم العثور على نهاية القائمة الدقيقة.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
