import re

for filepath in ["src/components/layout/AppShell.tsx", "src/MainPublicApp.tsx"]:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # استبدال أي لون هيدر باللون الأسود الملكي الأصلي #070A10
        content = re.sub(
            r'<header\s+className="fixed top-0 left-0 right-0 z-50[^"]*"',
            '<header className="fixed top-0 left-0 right-0 z-50 bg-[#070A10] border-b border-[#1F2937]"',
            content
        )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ تم ضبط اللون الأصلي بنجاح في: {filepath}")
    except Exception as e:
        print(f"خطأ في {filepath}:", e)
