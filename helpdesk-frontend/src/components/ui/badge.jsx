import React from 'react';

export function Badge({
  children,
  variant = 'default',
  pulse = false,
  className = '',
}) {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all duration-150';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    open: 'bg-blue-50 text-blue-700 border-blue-200/80',
    progress: 'bg-amber-50 text-amber-700 border-amber-200/80',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    urgent: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  };

  const pulseColors = {
    open: 'bg-blue-500',
    progress: 'bg-amber-500',
    resolved: 'bg-emerald-500',
    urgent: 'bg-rose-500',
    purple: 'bg-purple-500',
    default: 'bg-slate-400',
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              pulseColors[variant] || pulseColors.default
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              pulseColors[variant] || pulseColors.default
            }`}
          ></span>
        </span>
      )}
      {children}
    </span>
  );
}
