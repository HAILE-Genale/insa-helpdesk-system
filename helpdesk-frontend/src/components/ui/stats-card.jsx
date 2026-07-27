import React from 'react';

export function StatsCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon,
  description,
  accentColor = 'brand',
  className = '',
}) {
  const accentGradients = {
    brand: 'from-brand-500 to-brand-600 text-brand-600 bg-brand-50',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50',
    amber: 'from-amber-500 to-orange-600 text-amber-600 bg-amber-50',
    rose: 'from-rose-500 to-pink-600 text-rose-600 bg-rose-50',
    purple: 'from-purple-500 to-indigo-600 text-purple-600 bg-purple-50',
  };

  return (
    <div className={`glass-card p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        {icon && (
          <div className={`p-3 rounded-xl ${accentGradients[accentColor]?.split(' ').slice(2).join(' ')}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
              trendDirection === 'up'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-rose-700 bg-rose-50 border border-rose-200'
            }`}
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
    </div>
  );
}
