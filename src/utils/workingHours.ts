export type DayKey = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export interface DaySchedule { open: boolean; from: string; to: string; }
export interface WorkingSchedule { mode: '24h' | 'none' | 'custom'; days: Record<DayKey, DaySchedule>; }

export const DAYS_AR: { key: DayKey; label: string; jsDay: number }[] = [
  { key: 'sat', label: 'السبت', jsDay: 6 },
  { key: 'sun', label: 'الأحد', jsDay: 0 },
  { key: 'mon', label: 'الاثنين', jsDay: 1 },
  { key: 'tue', label: 'الثلاثاء', jsDay: 2 },
  { key: 'wed', label: 'الأربعاء', jsDay: 3 },
  { key: 'thu', label: 'الخميس', jsDay: 4 },
  { key: 'fri', label: 'الجمعة', jsDay: 5 },
];

export function createDefaultSchedule(): WorkingSchedule {
  return {
    mode: 'custom',
    days: {
      sat: { open: true, from: '08:00', to: '22:30' }, sun: { open: true, from: '08:00', to: '22:30' },
      mon: { open: true, from: '08:00', to: '22:30' }, tue: { open: true, from: '08:00', to: '22:30' },
      wed: { open: true, from: '08:00', to: '22:30' }, thu: { open: true, from: '08:00', to: '22:30' },
      fri: { open: false, from: '16:30', to: '22:30' },
    },
  };
}

export function formatTimeAr(hhmm: string): string {
  const [hStr, mStr = '00'] = (hhmm || '').split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return hhmm;
  return `${h % 12 === 0 ? 12 : h % 12}:${mStr.padStart(2, '0')} ${h >= 12 ? 'م' : 'ص'}`;
}

export function summarizeSchedule(sched: WorkingSchedule): string {
  if (sched.mode === '24h') return 'مفتوح 24 ساعة';
  if (sched.mode === 'none') return 'بدون ساعات عمل';
  const openDays = DAYS_AR.filter((d) => sched.days[d.key]?.open);
  if (openDays.length === 0) return 'مغلق';
  return openDays.map((d) => `${d.label}: ${formatTimeAr(sched.days[d.key].from)} - ${formatTimeAr(sched.days[d.key].to)}`).join(' | ');
}

export function getLiveOpenStatus(sched?: WorkingSchedule | null, fallbackText?: string): { hasHours: boolean; isOpen: boolean; text: string } {
  if (!sched) {
    if (!fallbackText || fallbackText === 'بدون ساعات عمل') return { hasHours: false, isOpen: false, text: 'ساعات العمل' };
    if (fallbackText.includes('24')) return { hasHours: true, isOpen: true, text: 'مفتوح الآن' };
    return { hasHours: true, isOpen: true, text: 'ساعات العمل' };
  }
  if (sched.mode === 'none') return { hasHours: false, isOpen: false, text: 'بدون ساعات عمل' };
  if (sched.mode === '24h') return { hasHours: true, isOpen: true, text: 'مفتوح الآن' };
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Aden' }));
  const dayMeta = DAYS_AR.find((d) => d.jsDay === now.getDay());
  const today = dayMeta ? sched.days[dayMeta.key] : undefined;
  if (!today || !today.open) return { hasHours: true, isOpen: false, text: 'مغلق الآن' };
  const cur = now.getHours() * 60 + now.getMinutes();
  const [fh, fm] = today.from.split(':').map(Number);
  const [th, tm] = today.to.split(':').map(Number);
  const f = fh * 60 + fm, t = th * 60 + tm;
  const open = t >= f ? (cur >= f && cur <= t) : (cur >= f || cur <= t);
  return { hasHours: true, isOpen: open, text: open ? 'مفتوح الآن' : 'مغلق الآن' };
}
