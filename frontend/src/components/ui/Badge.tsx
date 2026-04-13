import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'accent' | 'green' | 'muted' | 'outline';
  className?: string;
}

const variants = {
  gold: 'bg-gold/15 text-gold border border-gold/30',
  accent: 'bg-accent/15 text-accent border border-accent/30',
  green: 'bg-green-500/15 text-green-400 border border-green-500/30',
  muted: 'bg-surface-2 text-secondary border border-default',
  outline: 'border border-strong text-secondary',
};

export default function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
