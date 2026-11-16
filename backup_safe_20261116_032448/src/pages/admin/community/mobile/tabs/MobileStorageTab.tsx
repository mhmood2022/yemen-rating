import React from 'react';
import { HardDrive, Image as ImageIcon, Video, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { EmptyState } from '../../shared/EmptyState';
import { formatBytes } from '../../shared/types';

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl p-4 space-y-2" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <p className="text-xs" style={{ color: '#9CA3AF' }}>{label}</p>
    <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{value}</p>
  </div>
);

export const MobileStorageTab: React.FC = () => {
  const { stats, loading, error, reload } = useStorage();

  if (loading) return <SkeletonCard variant="simple" count={4} />;
  if (error || !stats) return <EmptyState icon={HardDrive} title="تعذر التحميل" description={error || ''} actionLabel="اعادة المحاولة" onAction={reload} />;

  const percent = Math.min(100, (stats.totalBytes / stats.quotaBytes) * 100);
  const isHigh = percent >= 80;
  const barColor = isHigh ? '#EF4444' : percent >= 50 ? '#FFC500' : '#22C55E';

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-5 space-y-3" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" style={{ color: '#FFC500' }} />
            <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>التخزين المستخدم</span>
          </div>
          <span className="text-xs font-bold" style={{ color: barColor }}>{percent.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1F2024' }}>
          <div className="h-full rounded-full" style={{ width: percent + '%', background: barColor, transition: 'all 500ms' }} />
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: '#9CA3AF' }}>
          <span>{formatBytes(stats.totalBytes)} مستخدم</span>
          <span>من {formatBytes(stats.quotaBytes)}</span>
        </div>
        {isHigh && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs" style={{ background: '#EF444415', border: '1px solid #EF444440', color: '#EF4444' }}>
            <AlertTriangle className="w-4 h-4 shrink-0" /><span>تحذير: استهلكت 80% من المساحة</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ImageIcon} label="الصور" value={String(stats.imagesCount)} color="#1D9BF0" />
        <StatCard icon={Video} label="الفيديوهات" value={String(stats.videosCount)} color="#FFC500" />
        <StatCard icon={TrendingUp} label="مرفوعات اليوم" value={String(stats.dailyUploads)} color="#22C55E" />
        <StatCard icon={HardDrive} label="اجمالي الملفات" value={String(stats.imagesCount + stats.videosCount)} color="#FFFFFF" />
      </div>
    </div>
  );
};
