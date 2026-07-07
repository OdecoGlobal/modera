import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AccountStatusType } from '@/types/account';

const AccountStatusBadge = ({ status }: { status: AccountStatusType }) => {
  return (
    <Badge
      className={cn(
        'capitalize',
        status === 'active'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'suspended'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700',
      )}
    >
      {status.toLowerCase()}
    </Badge>
  );
};

export default AccountStatusBadge;
