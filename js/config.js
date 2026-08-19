// ⚠️ ملف سري — لا ترفعه لـ GitHub public
const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

// تصدير للـ modules
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
