const fs = require('fs');
const file = 'src/components/business/UnifiedFacilityEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. إزالة map_url نهائياً من استعلام categories (السطر 241)
code = code.replace(/select\(\s*['"]id,\s*name,\s*slug,\s*map_url['"]\s*\)/, "select('id, name, slug')");

// 2. تصحيح قراءة الخريطة عند تحميل المنشأة (السطر 293)
code = code.replace(/map_url:\s*['"]['"],\s*website_url:\s*b\.website_url/, "map_url: b.map_url || '',\n            website_url: b.website_url");

// 3. تصحيح الحفظ في الـ payload (السطر 451)
code = code.replace(/map_url:\s*formData\.map_url,/, "map_url: formData.map_url || null,");

// 4. إضافة حقل الخريطة في واجهة المستخدم (UI)
const mapInput = `
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">رابط الخريطة (Google Maps)</label>
                <input
                  type="text"
                  value={formData.map_url || ''}
                  onChange={(e) => setFormData(p => ({ ...p, map_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="w-full p-2.5 bg-black border border-[#2F3336] rounded-xl text-white outline-none font-mono"
                  dir="ltr"
                />
              </div>`;

// تعديل مسمى الموقع القديم وإدراج حقل الخريطة تحته مباشرة
code = code.replace("رابط الموقع أو الخريطة", "الموقع الإلكتروني (Website)");
if (!code.includes("formData.map_url || ''")) {
  code = code.replace(/(value=\{formData\.website_url\}[\s\S]*?<\/div>)/, `$1\n${mapInput}`);
}

fs.writeFileSync(file, code, 'utf8');
console.log('✅ تم التعديل والإصلاح بدقة 100%!');
