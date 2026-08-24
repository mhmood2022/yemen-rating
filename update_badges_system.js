const fs = require('fs');
const path = require('path');

// إنشاء مجلد الشارات إذا لم يكن موجوداً
const badgesDir = path.join(__dirname, 'public', 'assets', 'badges');
if (!fs.existsSync(badgesDir)) {
  fs.mkdirSync(badgesDir, { recursive: true });
}

// محرك الشارات البرمجي المدمج بـ SVG متجهة فائقة السرعة
const badgesEngine = `
/* Yemen Rating Official Badges System */
const YEMEN_RATING_BADGES = {
  GOLD: {
    id: 'badge_gold',
    label: 'توثيق ذهبي ممتاز',
    color: '#FFC107',
    svg: \`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" class="badge-icon"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#FFC107"/><path d="M9 12l2 2 4-4" stroke="#0D0D0D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\`
  },
  BLUE: {
    id: 'badge_blue',
    label: 'توثيق رسمي قياسي',
    color: '#17A2B8',
    svg: \`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" class="badge-icon"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#17A2B8"/><path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\`
  },
  SILVER: {
    id: 'badge_silver',
    label: 'توثيق أساسي',
    color: '#A0A0A0',
    svg: \`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" class="badge-icon"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#A0A0A0"/><path d="M9 12l2 2 4-4" stroke="#0D0D0D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\`
  }
};

console.log("Yemen Rating Official Badges Architecture Initialized.");
`;

fs.writeFileSync('public/badges-engine.js', badgesEngine);
console.log('✅ Badges Engine & SVG Vector Assets Generated Successfully.');
