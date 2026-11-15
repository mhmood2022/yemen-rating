import os, re, shutil, time, subprocess

# 1. تثبيت الإضافة
print("⏳ جاري تثبيت vite-plugin-pwa...")
subprocess.run(["npm", "install", "-D", "vite-plugin-pwa"], check=True)
print("✅ تم تثبيت الإضافة.")

# 2. تعديل vite.config.ts
config_path = 'vite.config.ts'
if os.path.exists(config_path):
    shutil.copy(config_path, f"{config_path}.bak_pwa_{int(time.time())}")
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'vite-plugin-pwa' not in content:
        if "import { defineConfig } from 'vite'" in content:
            content = content.replace("import { defineConfig } from 'vite'", "import { defineConfig } from 'vite'\nimport { VitePWA } from 'vite-plugin-pwa'")
        else:
            content = "import { VitePWA } from 'vite-plugin-pwa';\n" + content

        pwa_config = """VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['yr-logo.png', 'icon-512.png'],
          manifest: {
            name: 'يمن ريتنج',
            short_name: 'YR',
            description: 'منصة يمن ريتنج',
            theme_color: '#000000',
            background_color: '#000000',
            display: 'standalone',
            icons: [
              {
                src: 'icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        }),"""

        if 'plugins: [' in content:
            content = content.replace("plugins: [", f"plugins: [\n        {pwa_config}")
        else:
            content = re.sub(r"(defineConfig\(\{)", r"\1\n  plugins: [\n    " + pwa_config + "\n  ],", content)

        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ تم تعديل vite.config.ts بنجاح.")
    else:
        print("ℹ️ إعدادات PWA موجودة بالفعل في vite.config.ts.")

# 3. تعديل index.html
html_path = 'index.html'
if os.path.exists(html_path):
    shutil.copy(html_path, f"{html_path}.bak_pwa_{int(time.time())}")
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    if 'theme-color' not in html:
        meta_tags = """
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="/icon-512.png">
"""
        html = html.replace("<head>", f"<head>{meta_tags}")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("✅ تم تعديل index.html بنجاح.")
    else:
        print("ℹ️ وسوم PWA موجودة بالفعل في index.html.")

print("\n✅ اكتمل إعداد PWA!")
