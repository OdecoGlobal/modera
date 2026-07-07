import { HugeiconsIcon } from '@hugeicons/react';
import { PackageIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

type Props = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

const EmptyState = ({
  title = 'Nothing here yet',
  description,
  icon,
  action,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 px-6 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <HugeiconsIcon icon={PackageIcon} size={22} />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
