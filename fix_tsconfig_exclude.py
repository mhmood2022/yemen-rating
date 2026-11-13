import json

# إصلاح tsconfig.json الرئيسي
with open('tsconfig.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'exclude' not in data:
    data['exclude'] = []
for folder in ["src/components_bak_before_remove_blur", "src/pages/admin_bak_before_black", "node_modules", "dist"]:
    if folder not in data['exclude']:
        data['exclude'].append(folder)

with open('tsconfig.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("✅ تم إصلاح tsconfig.json لتجاهل مجلدات الباك أب.")
