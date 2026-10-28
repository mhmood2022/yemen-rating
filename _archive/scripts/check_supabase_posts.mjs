import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnmuncxkfyoknmqejghl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('--- فحص الاتصال وقراءة المنشورات من Supabase ---');
  const { data, error } = await supabase.from('posts').select('*');
  if (error) {
    console.error('خطأ Supabase في القراءة:', error.message);
  } else {
    console.log('عدد التغريدات الموجودة في السيرفر حالياً:', data.length);
    console.log('بيانات التغريدات بالسيرفر:', JSON.stringify(data, null, 2));
  }
}
check();
