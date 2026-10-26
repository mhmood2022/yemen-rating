const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let envContent = '';
if (fs.existsSync('.env')) envContent += fs.readFileSync('.env', 'utf8') + '\n';
if (fs.existsSync('.env.local')) envContent += fs.readFileSync('.env.local', 'utf8') + '\n';

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`(?:VITE_|NEXT_PUBLIC_)?${key}\\s*=\\s*["']?([^"'\\s\n]+)`));
  return match ? match[1] : null;
};

const url = getEnv('SUPABASE_URL');
const anon = getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_KEY');

const supabase = createClient(url, anon);

async function testStorage() {
  console.log("=== 1. فحص سلة التخزين social-media ===");
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.log("❌ تعذر جلب السلات:", bErr.message);
  } else {
    const bucket = buckets.find(b => b.name === 'social-media');
    if (bucket) {
      console.log(`✔️ سلة social-media موجودة. وهل هي عامة (Public)؟ ${bucket.public ? 'نعم (Public)' : '❌ لا! خاصة (Private)'}`);
    } else {
      console.log("❌ تنبيه: سلة 'social-media' غير موجودة في مشروعك!");
      console.log("السلات الموجودة هي:", buckets.map(b => b.name));
    }
  }

  console.log("\n=== 2. فحص بنية دالة getPublicUrl ===");
  const res = supabase.storage.from('social-media').getPublicUrl('posts/test.jpg');
  console.log("النتيجة التي تعيدها Supabase عند طلب الرابط:");
  console.log(JSON.stringify(res, null, 2));
}

testStorage();
