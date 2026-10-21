import React from 'react';

export type BadgeVariant =
  | 'magenta'
  | 'charcoal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'charcoal',
  size = 'md',
  className = '',
  icon,
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }[size];

  const variantClasses = {
    magenta: 'bg-magenta-900/40 text-magenta-300 border border-magenta-700/50',
    charcoal: 'bg-charcoal-800 text-charcoal-200 border border-charcoal-700',
    success: 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-950/50 text-amber-300 border border-amber-700/50',
    danger: 'bg-rose-950/50 text-rose-300 border border-rose-700/50',
    info: 'bg-sky-950/50 text-sky-300 border border-sky-700/50',
    outline: 'bg-transparent text-charcoal-300 border border-charcoal-700',
  }[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
