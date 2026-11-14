import subprocess

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    # جلب الملف من آخر Commit ناجح في Git
    result = subprocess.run(['git', 'show', f'HEAD:{file}'], capture_output=True, text=True)
    if result.returncode == 0:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(result.stdout)
        print(f"✅ تم استعادة {file} من Git (النسخة التي كانت 0 أخطاء).")
    else:
        print(f"⚠️ فشل استعادة {file}: {result.stderr}")
