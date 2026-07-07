'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyAccount } from '@/query/use-account';
import ErrorState from '../states/error-state';
import EmptyState from '../states/empty-state';
import { formatDateTime } from '@/utils/format-date';
import { formatAmount, getGreeting } from '@/utils';
import AccountStatusBadge from './status-bagde';
import CopyText from '../copy-text';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AccountCard = () => {
  const { data, isPending, isError, error, refetch } = useGetMyAccount();

  if (isPending) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    );
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (!data) {
    return (
      <EmptyState description="No account found. Please contact support" />
    );
  }
  const {
    data: { virtualAccount: account, balance },
  } = data;
  return (
    <>
      <header className="flex-between">
        <div>
          <h1 className="h3-bold capitalize">
            Hello {account.bankAccountName.toLowerCase().split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getGreeting()}, are you ready to transact?
          </p>
        </div>

        {account.user.kycTier !== 'verified' && (
          <Button
            asChild
            className="text-white bg-brand-primary hover:bg-brand-primary/75"
          >
            <Link href="/settings/kyc">
              Upgrade to tier {account.user.kycTier === 'unverified' ? 2 : 3}
            </Link>
          </Button>
        )}
        {/* <AccountStatusBadge status={account.status} /> */}
      </header>

      <div
        className="rounded-2xl p-6 flex flex-col justify-between min-h-50 relative overflow-hidden space-y-3"
        style={{
          background:
            'linear-gradient(135deg, var(--brand-primary) 0%, #0044cc 100%)',
          color: '#fff',
        }}
      >
        <div className="ml-auto">
          <AccountStatusBadge status={account.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="capitalize">
            <p className="text-sm font-medium opacity-70">Account Name</p>

            <p className="text-2xl font-bold">{account.bankAccountName}</p>
          </div>

          <div>
            <p className="text-sm font-medium opacity-70">Account Number</p>
            <CopyText
              text={account.bankAccountNumber.replace(
                /(\d{4})(\d{3})(\d{3})/,
                '$1 $2 $3',
              )}
              className="text-2xl font-mono font-bold"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p className="flex flex-col items-start gap-0.5 capitalize">
            <span className="text-sm font-medium opacity-70">Bank Name</span>

            <span className="text-white text-base font-bold">
              {account.bankName}
            </span>
          </p>
          <div className="text-left">
            <p className="text-xs opacity-70 uppercase  mb-1">
              Available Balance
            </p>
            <p className="text-2xl font-bold">{formatAmount(balance)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="capitalize">
            <p className="text-sm font-medium opacity-70">Kyc Tier </p>

            <p className="font-bold">
              Tier{' '}
              {account.user.kycTier === 'unverified'
                ? 1
                : account.user.kycTier === 'basic'
                  ? 2
                  : 3}
            </p>
          </div>
          <div className="capitalize">
            <p className="text-sm font-medium opacity-70">Account Since </p>

            <p className="font-bold">
              {formatDateTime(new Date(account.createdAt)).dateShort}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountCard;
