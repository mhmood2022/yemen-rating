export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:        { label: 'جديد',              color: 'bg-blue-500/15 text-blue-400' },
  reviewing:  { label: 'قيد المراجعة',      color: 'bg-amber-500/15 text-amber-400' },
  pending:    { label: 'بانتظار المستخدم',  color: 'bg-orange-500/15 text-orange-400' },
  in_progress:{ label: 'قيد التنفيذ',       color: 'bg-purple-500/15 text-purple-400' },
  approved:   { label: 'معتمد',             color: 'bg-emerald-500/15 text-emerald-400' },
  resolved:   { label: 'تم الحل',           color: 'bg-emerald-500/15 text-emerald-400' },
  completed:  { label: 'مكتمل',             color: 'bg-emerald-500/15 text-emerald-400' },
  rejected:   { label: 'مرفوض',             color: 'bg-red-500/15 text-red-400' },
  cancelled:  { label: 'ملغي',              color: 'bg-zinc-500/15 text-zinc-400' },
  closed:     { label: 'مغلق',              color: 'bg-zinc-500/15 text-zinc-400' },
};

export const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low:      { label: 'منخفضة', color: 'bg-zinc-500/15 text-zinc-400' },
  normal:   { label: 'عادية',  color: 'bg-blue-500/15 text-blue-400' },
  high:     { label: 'عالية',  color: 'bg-orange-500/15 text-orange-400' },
  urgent:   { label: 'عاجلة',  color: 'bg-red-500/15 text-red-400' },
};

export const TYPE_LABELS_AR: Record<string, string> = {
  report:  'بلاغ',
  support: 'دعم فني',
  job:     'طلب وظيفة',
  verify:  'توثيق',
  claim:   'إثبات ملكية',
  subscription: 'اشتراك',
  ad:      'إعلان',
  payment: 'معاملة مالية',
  appeal:  'اعتراض',
  post:    'تغريدة',
};

export const formatStatus = (s?: string) =>
  STATUS_LABELS[s || ''] || { label: s || 'غير محدد', color: 'bg-zinc-500/15 text-zinc-400' };

export const formatPriority = (p?: string) =>
  PRIORITY_LABELS[p || ''] || { label: p || 'عادية', color: 'bg-zinc-500/15 text-zinc-400' };

export const formatType = (t?: string) => TYPE_LABELS_AR[t || ''] || t || 'طلب';
