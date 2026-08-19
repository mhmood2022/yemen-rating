import urllib.request, json, urllib.error

URL = 'https://wkdqeghotlipciqiytuj.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'

headers = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
}

# الجداول المتوقعة بناءً على طلبك (30 جدول)
EXPECTED_TABLES = [
    # Core
    'profiles', 'roles', 'permissions', 'role_permissions',
    # Entities
    'companies', 'banks', 'institutions', 'wallets', 'shops', 'hotels', 'restaurants', 'exchanges', 'transport',
    # Classification
    'categories', 'cities', 'branches',
    # Jobs
    'jobs', 'applications',
    # Reviews
    'reviews', 'review_reports',
    # Verification
    'verifications', 'verification_requests', 'documents',
    # Ads
    'advertisements', 'ad_campaigns', 'ad_slots', 'ad_creatives', 'advertisers', 'ad_clicks', 'ad_impressions',
    # Finance
    'subscriptions', 'plans', 'payments', 'invoices',
    # Communication
    'messages', 'conversations', 'notifications',
    # System
    'audit_logs', 'settings', 'content', 'rates', 'contact_messages'
]

print('=' * 65)
print('🔍 PHASE 1: SMART SCHEMA AUDIT (Read-Only, Per-Table Check)')
print('=' * 65)

results = {'found': [], 'rls_blocked': [], 'missing': [], 'error': []}

for table in EXPECTED_TABLES:
    try:
        req = urllib.request.Request(
            f'{URL}/rest/v1/{table}?select=*&limit=1',
            headers=headers
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
            results['found'].append((table, len(data)))
    except urllib.error.HTTPError as e:
        code = e.code
        body = ''
        try: body = e.read().decode()
        except: pass
        if code == 404 or 'PGRST116' in body or 'relation' in body.lower():
            results['missing'].append(table)
        elif code in (401, 403):
            results['rls_blocked'].append(table)
        else:
            results['error'].append((table, code, body[:80]))
    except Exception as e:
        results['error'].append((table, 'EXC', str(e)[:80]))

# عرض النتائج
print(f'\n✅ تم فحص {len(EXPECTED_TABLES)} جدول متوقع\n')

print(f'✅ جداول موجودة ويمكن الوصول إليها: {len(results["found"])}')
for t, n in results['found']:
    print(f'   • {t} ({n} rows)')

print(f'\n🔒 جداول موجودة لكن RLS يمنع القراءة: {len(results["rls_blocked"])}')
for t in results['rls_blocked']:
    print(f'   • {t}')

print(f'\n❌ جداول غير موجودة: {len(results["missing"])}')
for t in results['missing']:
    print(f'   • {t}')

if results['error']:
    print(f'\n⚠️  أخطاء أخرى: {len(results["error"])}')
    for t, c, b in results['error']:
        print(f'   • {t}: {c} — {b}')

# Auth check
print('\n' + '-' * 65)
print('🔐 فحص Supabase Auth:')
try:
    req = urllib.request.Request(f'{URL}/auth/v1/settings', headers={'apikey': KEY})
    with urllib.request.urlopen(req, timeout=10) as r:
        auth = json.loads(r.read().decode())
    print('   ✅ Auth Service يعمل')
    print(f'   • Email signup: {auth.get("external", {}).get("email", {}).get("enabled", "?")}')
except Exception as e:
    print(f'   ⚠️  Auth: {e}')

# Storage check
print('\n📦 فحص Supabase Storage:')
try:
    req = urllib.request.Request(f'{URL}/storage/v1/bucket', headers=headers)
    with urllib.request.urlopen(req, timeout=10) as r:
        buckets = json.loads(r.read().decode())
    if buckets:
        print(f'   ✅ Buckets الموجودة ({len(buckets)}):')
        for b in buckets:
            print(f'   • {b.get("name")} — public: {b.get("public")}')
    else:
        print('   ⚠️  لا توجد buckets (سنعرف لاحقاً إن كنا نحتاجها)')
except urllib.error.HTTPError as e:
    print(f'   ⚠️  Storage: {e.code}')

print('\n' + '=' * 65)
print('📋 الخلاصة:')
print(f'   جداول حقيقية موجودة: {len(results["found"])}')
print(f'   جداول محمية بـ RLS: {len(results["rls_blocked"])}')
print(f'   جداول ناقصة: {len(results["missing"])}')
print('=' * 65)
