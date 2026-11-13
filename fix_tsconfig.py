import json

file_path = 'tsconfig.node.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# تغيير noEmit إلى false
if 'compilerOptions' in data:
    data['compilerOptions']['noEmit'] = False

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("✅ تم إصلاح ملف tsconfig.node.json بنجاح.")
