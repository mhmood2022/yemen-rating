import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wkdqeghotlipciqiytuj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'
);

const tables = ['profiles', 'users', 'owner_requests', 'business_claims', 'businesses', 'media', 'business_services'];

for (const t of tables) {
  const { data, error } = await supabase.from(t).select('*').limit(1);
  if (error) {
    console.log(`❌ ${t}: ${error.message}`);
  } else {
    console.log(`✅ ${t}: موجود — الأعمدة: ${data && data[0] ? Object.keys(data[0]).join(', ') : '(الجدول فاضي)'}`);
  }
}
