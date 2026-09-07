const fs = require('fs');

// تعديل شرط التقييم في BusinessesPage.tsx ليعتمد فقط على وجود مراجعات حقيقية
let fileContent = fs.readFileSync('src/pages/public/businesses/BusinessesPage.tsx', 'utf8');

// استبدال شرط التقييم الصارم: يجب أن يكون review_count > 0 حقيقة
fileContent = fileContent.replace(
  /const hasRealRating = [^;]+;/,
  "const hasRealRating = Number(item.review_count) > 0 && Number(item.rating) > 0;"
);

fs.writeFileSync('src/pages/public/businesses/BusinessesPage.tsx', fileContent, 'utf8');
console.log('✅ تم قفل التقييمات الزائفة: لن يظهر أي تقييم لأي منشأة إلا إذا كانت مقيمة بمراجعات حقيقية.');
