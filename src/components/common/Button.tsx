import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none tracking-tight focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#087EDB] text-white hover:bg-[#0668B6] active:bg-[#075491] focus:ring-[#087EDB] shadow-subtle border border-[#0668B6]',
    secondary:
      'bg-[#F3F7FA] text-[#202938] hover:bg-white hover:text-[#087EDB] border border-[#E5EBF0] focus:ring-slate-300 shadow-subtle',
    outline:
      'bg-white text-[#202938] hover:bg-[#F3F7FA] hover:text-[#087EDB] border border-[#E5EBF0] hover:border-[#BCE3F7] focus:ring-[#087EDB]/20 shadow-subtle',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm border border-rose-700/40',
    ghost:
      'bg-transparent text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA] focus:ring-slate-300',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
