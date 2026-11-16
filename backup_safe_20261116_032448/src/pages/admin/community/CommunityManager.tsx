import React from 'react';
import { MobileCommunityView } from './mobile/MobileCommunityView';

/**
 * Community Manager — الواجهة الموحدة
 * تعمل على الموبايل والديسكتوب بنفس التصميم.
 * الكود القديم محفوظ في CommunityManager.legacy.tsx للمرجعية.
 */
export const CommunityManager: React.FC = () => {
  return <MobileCommunityView reportsCount={0} />;
};
