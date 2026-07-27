import React from 'react';

export function Card({ children, className = '', hover = true, glass = true, ...props }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        glass
          ? 'glass-card'
          : 'bg-white border-slate-200 shadow-sm'
      } ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-5 md:p-6 border-b border-slate-100/80 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-bold text-slate-900 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`mt-1 text-sm text-slate-500 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 md:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-5 md:p-6 border-t border-slate-100/80 bg-slate-50/50 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
}
