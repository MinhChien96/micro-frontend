import type { MouseEvent, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white border-0',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-300',
  danger: 'bg-red-500 text-white border-0',
  ghost: 'bg-transparent text-primary border border-primary',
  success: 'bg-green-500 text-white border-0',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3.5 text-base rounded-[10px]',
};

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium leading-none transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? 'w-full' : 'w-auto'} ${VARIANTS[variant]} ${SIZES[size]}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
