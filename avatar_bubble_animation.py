import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_bubble_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إضافة حالة (State) جديدة للتحكم في حركة الشعار
if "const [avatarAnimState, setAvatarAnimState]" not in content:
    content = content.replace(
        "const [isScrolled, setIsScrolled] = useState(false);",
        "const [isScrolled, setIsScrolled] = useState(false);\n  const [avatarAnimState, setAvatarAnimState] = useState<'visible' | 'animating' | 'hidden'>('visible');"
    )
    print("✅ 1. تم إضافة حالة avatarAnimState.")

# 2. البحث عن useEffect القديم الخاص بالتمرير واستبداله
old_effect_pattern = r"useEffect\(\(\) => \{[\s\S]*?window\.scrollTo\(0, 0\)[\s\S]*?window\.removeEventListener\('scroll', handleScroll\);[\s\S]*?\}, \[\]\);"

new_effect = """useEffect(() => {
  if (avatarAnimState === 'hidden') return;
  if (window.scrollY > 0) { setAvatarAnimState('hidden'); return; }

  if (avatarAnimState === 'animating') {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setAvatarAnimState('hidden');
      document.body.style.overflow = '';
    }, 400);
    return () => { clearTimeout(timer); document.body.style.overflow = ''; };
  }

  document.body.style.overflow = 'hidden';
  const trigger = () => { setAvatarAnimState('animating'); };

  let startY = 0;
  const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
  const onTouchMove = (e: TouchEvent) => {
    if (startY - e.touches[0].clientY > 20) trigger();
  };
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY > 0) { e.preventDefault(); trigger(); }
  };

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false });

  return () => {
    document.body.style.overflow = '';
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('wheel', onWheel);
  };
}, [avatarAnimState]);

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 50);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);"""

if re.search(old_effect_pattern, content):
    content = re.sub(old_effect_pattern, new_effect, content, count=1)
    print("✅ 2. تم استبدال useEffect بنظام قفل التمرير وحركة الفقاعة.")
else:
    print("⚠️ لم يتم العثور على useEffect القديم، جاري المحاولة البديلة.")
    # محاولة بديلة
    content = re.sub(r"useEffect\(\(\) => \{\s*const handleScroll = \(\) => setIsScrolled[\s\S]*?\}, \[\]\);", new_effect, content, count=1)

# 3. تطبيق حركة الفقاعة (scale + opacity + blur) على الشعار
old_avatar_wrapper = '<div className="relative group z-50 origin-center" ref={avatarRef} style={{ willChange: \'transform\', transformOrigin: \'center\' }}>'
new_avatar_wrapper = '<div className={`relative group z-50 origin-center transition-all duration-[400ms] ease-out ${avatarAnimState !== \'visible\' ? \'scale-0 opacity-0 blur-md\' : \'scale-100 opacity-100\'}`}>'

if old_avatar_wrapper in content:
    content = content.replace(old_avatar_wrapper, new_avatar_wrapper)
    print("✅ 3. تم تطبيق حركة الفقاعة على الشعار.")

# 4. إزالة التأثير القديم (translateY) إذا وجد
content = re.sub(r"if \(avatarRef\.current\) \{[\s\S]*?avatarRef\.current\.style\.opacity[\s\S]*?\}", "", content)
content = re.sub(r"if \(avatarRowRef\.current\) \{[\s\S]*?avatarRowRef\.current\.style\.transform[\s\S]*?\}", "", content)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
