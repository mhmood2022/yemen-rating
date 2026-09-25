import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wkdqeghotlipciqiytuj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'
);

async function checkColumns(table, cols) {
  const { error } = await supabase.from(table).select(cols.join(',')).limit(1);
  console.log(`\n--- ${table} ---`);
  if (error) console.log(`❌ ${error.message}`);
  else console.log(`✅ كل الأعمدة موجودة: ${cols.join(', ')}`);
}

await checkColumns('profiles', ['id','full_name','email','phone','role','avatar_url','status','created_at']);
await checkColumns('business_claims', ['id','business_id','user_id','status','commercial_register_no','document_url','applicant_name','applicant_email','phone','created_at']);

// عدّ الصفوف الحقيقي (بدون RLS احتمالاً بيرجع 0 لو محمي)
const { count: pc } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
console.log(`\nعدد صفوف profiles المرئية بمفتاح anon: ${pc}`);
const { count: bc } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
console.log(`عدد صفوف businesses المرئية بمفتاح anon: ${bc}`);
