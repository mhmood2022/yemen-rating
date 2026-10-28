for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # حذف القوس الزائد
    content = content.replace("    }\n    }\n\n    function handleSearch", "    }\n\n    function handleSearch")
    content = content.replace("    }\r\n    }\r\n\r\n    function handleSearch", "    }\r\n\r\n    function handleSearch")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم حذف القوس الزائد في: {path}")

print("✅ تم تنظيف الكود البرمجي بالكامل!")
