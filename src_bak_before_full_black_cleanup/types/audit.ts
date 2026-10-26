export type AuditActionType =
  | 'BADGE_CHANGE'
  | 'PRICE_UPDATE'
  | 'BUSINESS_UPDATE'
  | 'BUSINESS_CREATE'
  | 'BUSINESS_DELETE'
  | 'AD_PUBLISH'
  | 'AD_PAUSE'
  | 'AD_DELETE'
  | 'AD_CREATE'
  | 'JOB_CREATE'
  | 'JOB_STATUS_CHANGE'
  | 'REVIEW_APPROVE'
  | 'REVIEW_DELETE';

export interface AuditLogItem {
  id: string;
  adminName: string;
  adminEmail: string;
  action: AuditActionType;
  targetType: string;
  targetName: string;
  details: string;
  timestamp: string;
}
