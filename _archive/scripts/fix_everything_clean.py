# -*- coding: utf-8 -*-
import subprocess, re

# 1. استرجاع نسخة نظيفة ومستقرة لـ bank.html
subprocess.run(['git', 'checkout', 'origin/main', '--', 'bank.html'])

with open('bank.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 2. تنظيف شبكة الصور الأربع نهائياً (حذف أي نصوص أو أشرطة سوداء فوق الصور)
# سنضمن أن تُرسم الصور الأربع فقط كصور نقية تماماً
posts_render_clean = '''
      // 1. عرض خلاصة المنشورات التفاعلية
      const tabPosts = document.getElementById('tab-posts');
      if (tabPosts) {
        const bankName = currentBank.name || '';
        const bankLogo = currentBank.logo_url || (document.getElementById('bank-logo') ? document.getElementById('bank-logo').src : '');
        const isVerified = currentBank.is_verified === true || currentBank.verified === true;
        const badgeSvg = isVerified ? renderVerificationBadge(currentBank.badge_type || 'gold') : '';

        // نص المنشور الرسمي الخاص بالبنك
        const postText = currentBank.announcement || currentBank.text_post || 'عملاؤنا الكرام: يمكنكم الاستفادة من كافة خدمات التحويل الفوري وتغذية الحسابات وعمليات الدفع الإلكتروني عبر تطبيق الكريمي جوال وأجهزة الصراف الآلي المعتمدة في كافة المحافظات على مدار الساعة.';

        // هيدر تويتر/X المتناسق في سطر واحد مستقيم تماماً
        const makeHeader = () => `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                ${bankLogo ? `<img src="${bankLogo}" class="w-full h-full object-contain" alt="${bankName}" />` : `<i class="fa-solid fa-building-columns text-zinc-500 text-sm"></i>`}
              </div>
              <div class="flex items-center gap-1.5 flex-wrap text-right">
                <span class="text-sm font-black text-white leading-none">${bankName}</span>
                <span class="inline-flex shrink-0">${badgeSvg}</span>
                <span class="text-zinc-400 text-xs font-mono">· 20 ي</span>
              </div>
            </div>
            <button type="button" class="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer">
              <i class="fa-solid fa-ellipsis text-xs"></i>
            </button>
          </div>
        `;

        // شريط التفاعل بالترتيب العربي الصحيح
        const makeActionBar = (comments, retweets, likes) => `
          <div class="flex items-center justify-between pt-2.5 px-1 border-t border-zinc-900 text-zinc-400 text-xs select-none">
            <div class="flex items-center gap-6">
              <button type="button" onclick="openCommentModal()" class="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer transition">
                <i class="fa-regular fa-comment text-xs"></i>
                <span class="text-[11px] font-mono">${comments}</span>
              </button>
              <button type="button" onclick="toggleInteraction(this, 'retweet')" class="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition">
                <i class="fa-solid fa-retweet text-xs"></i>
                <span class="text-[11px] font-mono">${retweets}</span>
              </button>
              <button type="button" onclick="toggleInteraction(this, 'like')" class="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer transition">
                <i class="fa-regular fa-heart text-xs"></i>
                <span class="text-[11px] font-mono">${likes}</span>
              </button>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" onclick="toggleInteraction(this, 'bookmark')" class="hover:text-brand-gold cursor-pointer transition p-1">
                <i class="fa-regular fa-bookmark text-xs"></i>
              </button>
              <button type="button" onclick="shareBankPage()" class="hover:text-zinc-300 cursor-pointer transition p-1">
                <i class="fa-solid fa-arrow-up-from-bracket text-xs"></i>
              </button>
            </div>
          </div>
        `;

        const realCommentsCount = (currentBank.reviews && currentBank.reviews.length) || 2;
        let feedHtml = '';

        // المنشور الأول: المنشور النصي
        feedHtml += `
          <article class="text-right space-y-2.5 pt-1">
            ${makeHeader()}
            <p class="text-xs sm:text-[13px] text-zinc-100 leading-relaxed font-normal select-text pr-1">${postText}</p>
            ${makeActionBar(realCommentsCount, 28, 152)}
          </article>
          <div class="border-b border-zinc-900 my-4"></div>
        `;

        // المنشور الثاني: منشور الصور الأربع نظيفة 100% بدون أي كتابة فوقها نهائياً
        const postsList = currentPosts || [];
        if (postsList.length > 0) {
          const cleanImagesGrid = postsList.map((post, idx) => `
            <div class="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-md flex flex-col group cursor-pointer" onclick="openLightbox(${idx})">
              <div class="relative w-full h-36 sm:h-44 bg-zinc-950 overflow-hidden">
                <img src="${post.image || post.file_url}" alt="صورة المعرض" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
            </div>
          `).join('');

          feedHtml += `
            <article class="text-right space-y-2.5">
              ${makeHeader()}
              <div class="grid grid-cols-2 gap-2.5 pt-1">
                ${cleanImagesGrid}
              </div>
              ${makeActionBar(realCommentsCount, 28, 152)}
            </article>
          `;
        }

        tabPosts.className = 'space-y-5';
        tabPosts.innerHTML = feedHtml;
      }
'''

# استبدال رسم المنشورات القديم بالجديد النظيف داخل renderUI
html = re.sub(r'const postsContainer = document\.getElementById\(\'posts-container\'\);[\s\S]*?postsContainer\.innerHTML = currentPosts\.map[\s\S]*?\}\)\.join\(\'\'\);', posts_render_clean, html)

# 3. التأكد من حفظ بيانات التقييمات وتحديث الهيدر العلوي بنجاح
ratings_safe_patch = '''
      // تحديث التقييمات العلوية الحقيقية من Supabase
      const total = reviewsList ? reviewsList.length : 0;
      let sum = 0;
      if (reviewsList && reviewsList.length > 0) {
        reviewsList.forEach(r => {
          sum += parseInt(r.stars || r.rating || 5);
        });
      }
      const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';
      const headNum = document.getElementById('header-rating-num');
      const headCount = document.getElementById('header-rating-count');
      if (headNum) headNum.innerText = avg;
      if (headCount) headCount.innerText = `${total} تقييم`;
'''

html = re.sub(r'const total = reviewsList\.length;[\s\S]*?document\.getElementById\(\'header-rating-count\'\)\.innerText = `\$\{total\} تقييم`;', ratings_safe_patch, html)

# 4. إضافة بطاقة الفروع وساعات العمل بوضوح في الأسفل قبل قسم تواصل معنا
branches_and_hours_clean = '''
    <!-- فروع البنك وساعات العمل المعتمدة -->
    <div class="mt-8 space-y-4">
      <!-- فروع البنك -->
      <div class="bg-black border border-zinc-800/90 rounded-2xl p-4 shadow-xl text-right space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <h4 class="text-xs font-black text-white flex items-center gap-1.5">
            <i class="fa-solid fa-code-branch text-brand-gold"></i>
            <span>فروع البنك وأجهزة الصراف الآلي</span>
          </h4>
          <span class="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full font-bold">خدمات مستمرة</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
          <div class="bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl flex items-center gap-2.5">
            <i class="fa-solid fa-building-columns text-brand-gold text-sm shrink-0"></i>
            <div class="truncate">
              <span class="text-white font-bold block truncate">الفرع الرئيسي</span>
              <span class="text-zinc-400 text-[11px] truncate">صنعاء — شارع القصر</span>
            </div>
          </div>
          <div class="bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl flex items-center gap-2.5">
            <i class="fa-solid fa-money-bill-transfer text-emerald-400 text-sm shrink-0"></i>
            <div class="truncate">
              <span class="text-white font-bold block truncate">صرافات آلية (ATM)</span>
              <span class="text-zinc-400 text-[11px] truncate">خدمة نقدية 24/7</span>
            </div>
          </div>
          <div class="bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-center">
            <a href="https://maps.google.com" target="_blank" class="text-brand-gold hover:underline font-black text-xs flex items-center gap-1.5">
              <span>مواقع الفروع على الخريطة</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- ساعات الدوام الرسمي -->
      <div class="bg-black border border-zinc-800/90 rounded-2xl p-4 shadow-xl text-right">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800/60">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h4 class="text-xs font-black text-white flex items-center gap-1.5">
              <i class="fa-solid fa-clock text-brand-gold"></i>
              <span>مواعيد وساعات الدوام الرسمي</span>
            </h4>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">أوقات العمل المعتمدة</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
          <div class="flex items-start gap-2.5">
            <i class="fa-regular fa-calendar-check text-brand-gold text-xs mt-0.5"></i>
            <div>
              <span class="text-white font-bold block">الفترة الصباحية (الأحد - الخميس)</span>
              <span class="text-zinc-400 text-[11px]">8:00 صباحاً – 2:00 ظهراً</span>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-moon text-blue-400 text-xs mt-0.5"></i>
            <div>
              <span class="text-white font-bold block">الفترة المسائية (مراكز محددة)</span>
              <span class="text-zinc-400 text-[11px]">4:00 عصراً – 7:30 مساءً</span>
            </div>
          </div>
        </div>
      </div>
    </div>
'''

contact_idx = html.rfind('تواصل معنا')
if contact_idx != -1:
    div_start = html.rfind('<div', 0, contact_idx)
    html = html[:div_start] + branches_and_hours_clean + '\n' + html[div_start:]
else:
    html = html.replace('</main>', branches_and_hours_clean + '\n</main>')

with open('bank.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: تم تطبيق التحديث الشامل بنجاح!")
