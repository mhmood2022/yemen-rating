import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!url || !key) {
  console.error('❌ لم أجد VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY في .env.local');
  process.exit(1);
}

const sb = createClient(url, key);

console.log('=== permissions ===');
const { data: perms, count: pc, error: pe } = await sb
  .from('permissions').select('*', { count: 'exact' });
if (pe) console.error('ERROR:', pe.message);
console.log('Count:', pc);
console.log(JSON.stringify(perms, null, 2));

console.log('\n=== roles ===');
const { data: roles, count: rc, error: re } = await sb
  .from('roles').select('*', { count: 'exact' });
if (re) console.error('ERROR:', re.message);
console.log('Count:', rc);
console.log(JSON.stringify(roles, null, 2));

console.log('\n=== role_permissions ===');
const { data: rp, count: rpc, error: rpe } = await sb
  .from('role_permissions').select('*', { count: 'exact' });
if (rpe) console.error('ERROR:', rpe.message);
console.log('Count:', rpc);
console.log(JSON.stringify(rp, null, 2));
