import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: 'btn-shimmer relative overflow-hidden bg-gradient-gold text-dark-900 font-semibold hover:opacity-90 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(201,168,76,0.25)] hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]',
  secondary: 'bg-surface-2 text-primary hover:bg-surface-3 border border-default',
  ghost: 'text-secondary hover:text-primary hover:bg-surface',
  danger: 'bg-accent text-white hover:bg-accent-hover',
  outline: 'border border-gold text-gold hover:bg-gold/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const interactive = !disabled && !loading && !prefersReducedMotion;
    const motionProps: HTMLMotionProps<'button'> = {
      ref,
      disabled: disabled || loading,
      whileHover: interactive ? { scale: 1.04, y: -3 } : undefined,
      whileTap: interactive ? { scale: 0.96 } : undefined,
      transition: { type: 'spring', stiffness: 400, damping: 17 },
      className: cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      ),
      // Safe to cast: ButtonHTMLAttributes and HTMLMotionProps share the same base HTML events
      ...(props as Omit<HTMLMotionProps<'button'>, 'ref'>),
    };

    return (
      <motion.button {...motionProps}>
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
