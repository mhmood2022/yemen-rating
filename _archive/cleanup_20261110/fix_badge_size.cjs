const fs = require('fs');
const filePath = 'src/pages/CommunityFeedPage.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // البحث عن كود الشارة القديم
    const oldBadgeRegex = /\{tweet\.badgeType && \([\s\S]*?\)\}/;
    
    // الكود الجديد بحجم دقيق (18px) ومحاذاة مطابقة لـ X
    const newBadgeCode = `{tweet.badgeType && (
      <img 
        src={
          tweet.badgeType === 'blue' ? '/badges/blue.png' :
          tweet.badgeType === 'yellow' ? '/badges/yellow.png' :
          tweet.badgeType === 'gray' ? '/badges/gray.png' : '/badges/blue.png'
        } 
        alt="موثق" 
        className="w-[18px] h-[18px] object-contain inline-block shrink-0 mt-[1px]" 
        style={{ marginRight: '2px' }}
      />
    )}`;

    if (!content.match(oldBadgeRegex)) {
        console.error("❌ لم يتم العثور على كود الشارة. يرجى التأكد من أن الشارة قد أضيفت مسبقاً.");
        process.exit(1);
    }

    content = content.replace(oldBadgeRegex, newBadgeCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("✅ تم تعديل حجم الشارة بنجاح (18px مع محاذاة دقيقة).");

} catch (error) {
    console.error("❌ حدث خطأ:", error.message);
    process.exit(1);
}
