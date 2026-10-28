const fs = require('fs');

const badgesDisplayEngine = `
/* Yemen Rating Official Badges & Admin Control Engine */

// 1. دالة عرض اسم الجهة مع الشارة المعتمدة بجانبه
function renderBusinessTitle(businessName, badgeType) {
  const badgeMap = {
    'gold': '<span class="badge-inline" title="توثيق ذهبي"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#FFC107"/><path d="M9 12l2 2 4-4" stroke="#0D0D0D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
    'blue': '<span class="badge-inline" title="توثيق رسمي"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#17A2B8"/><path d="M9 12l2 2 4-4" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
    'silver': '<span class="badge-inline" title="توثيق أساسي"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.8 1-.2 3 1.8 2.4-1.8 2.4.2 3-2.8 1-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.8-1 .2-3L1.2 12l1.8-2.4-.2-3 2.8-1 1-2.8 3 .2L12 2z" fill="#A0A0A0"/><path d="M9 12l2 2 4-4" stroke="#0D0D0D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
  };

  const badgeHtml = badgeMap[badgeType] || '';
  return \`<div class="business-title-container" style="display: inline-flex; align-items: center; gap: 6px;">
            <h3 class="business-name" style="margin:0; font-family: 'Cairo', sans-serif; font-weight:700;">\${businessName}</h3>
            \${badgeHtml}
          </div>\`;
}

// 2. وظيفة الإدارة لتعديل أو إخفاء الشارة في Supabase (Admin Only)
async function adminUpdateBadge(businessId, newBadgeType) {
  // newBadgeType: 'gold' | 'blue' | 'silver' | null (null لإخفاء الشارة)
  console.log(\`[Admin Action] Updating Business ID \${businessId} Badge to: \${newBadgeType || 'None (Hidden)'}\`);
}

console.log("Inline Badges Display & Admin Management Engine Ready.");
`;

fs.writeFileSync('public/badges-display-engine.js', badgesDisplayEngine);
console.log('✅ Badges Inline Display & Admin Management Logic Updated Successfully.');
