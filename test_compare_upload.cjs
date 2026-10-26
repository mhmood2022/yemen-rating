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

async function check() {
  console.log("=== 1. فحص التغريدات التي نجح فيها الفيديو ===");
  const { data: videoPosts } = await supabase
    .from('posts')
    .select('id, content, video_url, image_url')
    .not('video_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2);

  if (videoPosts && videoPosts.length > 0) {
    videoPosts.forEach(p => {
      console.log(`✔️ نص: "${p.content}"`);
      console.log(`📹 رابط الفيديو: ${p.video_url}`);
    });
  } else {
    console.log("لم يتم العثور على فيديوهات مسجلة في قاعدة البيانات.");
  }

  console.log("\n=== 2. اختبار رفع صورة تجريبية إلى Supabase Storage ===");
  const dummyBuffer = Buffer.from("test image content");
  const testPath = `posts/test_image_${Date.now()}.jpg`;

  const { data: upData, error: upError } = await supabase.storage
    .from('social-media')
    .upload(testPath, dummyBuffer, {
      upsert: true,
      contentType: 'image/jpeg'
    });

  if (upError) {
    console.log("❌ سبب فشل رفع الصورة:", upError.message);
    console.log("التفاصيل:", upError);
  } else {
    console.log("✔️ نجح رفع الصورة التجريبية إلى المسار:", testPath);
    const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(testPath);
    console.log("🔗 الرابط العام المتولد:", pubData.publicUrl);
    // تنظيف ملف الاختبار
    await supabase.storage.from('social-media').remove([testPath]);
  }
}

check();
