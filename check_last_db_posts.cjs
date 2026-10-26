const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// قراءة بيانات الاتصال تلقائياً من المشروع
let envContent = '';
if (fs.existsSync('.env')) envContent += fs.readFileSync('.env', 'utf8') + '\n';
if (fs.existsSync('.env.local')) envContent += fs.readFileSync('.env.local', 'utf8') + '\n';

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`(?:VITE_|NEXT_PUBLIC_)?${key}\\s*=\\s*["']?([^"'\\s\n]+)`));
  return match ? match[1] : null;
};

const url = getEnv('SUPABASE_URL');
const anon = getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_KEY');

if (!url || !anon) {
  console.log("لم نتمكن من قراءة مفاتيح Supabase من ملف .env مباشرة.");
  process.exit(0);
}

const supabase = createClient(url, anon);

async function check() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content, image_url, video_url, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", error.message);
    return;
  }

  console.log("\n====== آخر التغريدات في قاعدة البيانات ======");
  data.forEach((p, i) => {
    console.log(`\nتغريدة #${i + 1}:`);
    console.log(`- النص: "${p.content}"`);
    console.log(`- رابط الصورة (image_url): ${p.image_url ? p.image_url : "❌ فارغ (NULL)"}`);
  });
  console.log("============================================\n");
}

check();
