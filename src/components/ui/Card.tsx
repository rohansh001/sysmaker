import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  highlighted = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl bg-charcoal-900 border transition-all ${
        highlighted
          ? 'border-magenta-500/60 shadow-magenta-sm'
          : 'border-charcoal-750'
      } ${
        hoverEffect
          ? 'hover:border-charcoal-600 hover:bg-charcoal-850/80 hover:shadow-lg'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
