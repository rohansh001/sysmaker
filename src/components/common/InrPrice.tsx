import React from 'react';
import { formatINR } from '@/engine/pricing';

interface InrPriceProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
}

export const InrPrice: React.FC<InrPriceProps> = ({
  amount,
  className = '',
  size = 'md',
  showSign = false,
}) => {
  const formatted = formatINR(Math.abs(amount));
  const sign = showSign && amount > 0 ? '+' : showSign && amount < 0 ? '-' : '';

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-lg font-extrabold',
    xl: 'text-2xl font-black tracking-tight',
  }[size];

  return (
    <span className={`inline-flex items-baseline tracking-tight font-sans ${sizeClasses} ${className}`}>
      {sign}
      {formatted}
    </span>
  );
};
