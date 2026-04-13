import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-3',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-default">
      <Skeleton className="h-56 rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-full mt-1" />
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-default">
      <Skeleton className="h-40 rounded-none" />
    </div>
  );
}
