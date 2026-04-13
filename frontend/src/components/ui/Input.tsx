import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, type, ...props }, ref) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              'w-full bg-surface border border-default text-primary placeholder:text-tertiary rounded-xl px-4 py-2.5 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/20',
              'hover:border-strong',
              leftIcon && 'ps-10',
              (rightIcon || isPassword) && 'pe-10',
              error && 'border-accent focus:border-accent focus:ring-accent/20',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              aria-label={showPassword ? t('a11y.hidePassword') : t('a11y.showPassword')}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors cursor-pointer"
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-secondary">
                {rightIcon}
              </span>
            )
          )}
        </div>
        {error && <p className="text-xs text-accent">{error}</p>}
        {hint && !error && <p className="text-xs text-secondary">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
