import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnmuncxkfyoknmqejghl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('--- اختبار محاولة إدخال منشور في جدول posts ---');
  
  // فحص جدول profiles أولاً
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, full_name').limit(1);
  console.log('فحص جدول profiles:', { profiles, profErr: profErr?.message });

  if (profiles && profiles.length > 0) {
    const testUserId = profiles[0].id;
    console.log('محاولة إدخال منشور للمستخدم:', testUserId);
    const { data, error } = await supabase.from('posts').insert({
      user_id: testUserId,
      content: 'تغريدة اختبارية للتحقق من الاتصال السحابي'
    }).select();
    
    console.log('نتيجة الإدخال:', { data, error: error?.message, code: error?.code });
  } else {
    console.log('جدول profiles فارغ تماماً في قاعدة البيانات!');
  }
}
testInsert();
