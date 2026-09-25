const url = 'https://wkdqeghotlipciqiytuj.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
});
const spec = await res.json();
const defs = spec.definitions || spec.components?.schemas || {};

const tables = ['business_claims', 'owner_requests', 'businesses', 'profiles', 'notifications', 'admin_notifications'];
for (const t of tables) {
  console.log(`\n=== ${t} ===`);
  const def = defs[t];
  if (!def) { console.log('غير موجود بالسكيمة'); continue; }
  console.log(Object.keys(def.properties || {}).join(', '));
}
