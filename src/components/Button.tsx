import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px]',
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-xs',
  lg: 'h-10 px-4 text-sm',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  soft: 'btn-soft',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  pill = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      className={`btn-base ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
        pill ? '!rounded-full' : ''
      } ${className}`}
      {...rest}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
