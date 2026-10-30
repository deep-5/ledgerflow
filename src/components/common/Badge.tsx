import React from 'react';
import { getStatusColorClass } from '../../utils/formatters';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const colors = getStatusColorClass(status);
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] tracking-tight leading-none gap-1.5' 
    : 'px-2.5 py-1 text-[11px] font-medium tracking-tight leading-none gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
};
