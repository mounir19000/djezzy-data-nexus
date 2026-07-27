import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, trendUp, icon }) => {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-on-surface-variant font-sans text-sm font-medium">{title}</h3>
        {icon && <div className="text-on-surface-variant">{icon}</div>}
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-on-surface">{value}</div>
        {trend && (
          <div className={`text-sm mt-2 font-mono flex items-center gap-1 ${trendUp ? 'text-status-healthy' : 'text-status-critical'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
