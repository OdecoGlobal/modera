'use client';

import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatError } from '@/utils/format-error';

type Props = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
};

const ErrorState = ({ error, onRetry, className }: Props) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 py-16 px-6 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <HugeiconsIcon icon={AlertCircleIcon} size={22} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {formatError(error)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
          Go back
        </Button>
        {onRetry && (
          <Button size="sm" onClick={onRetry} className="gap-1.5">
            <HugeiconsIcon icon={RefreshIcon} size={13} />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
