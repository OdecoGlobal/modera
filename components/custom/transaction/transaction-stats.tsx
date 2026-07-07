'use client';
import { useGetMyTransactionStats } from '@/query/use-transaction';
import CardLoading from '../loading/card-loading';
import ErrorState from '../states/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount, formatNumber } from '@/utils';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowLeftRight, History, Users } from 'lucide-react';

const TransactionStats = () => {
  const { data, isPending, isError, error, refetch } =
    useGetMyTransactionStats();

  if (isPending) {
    return <CardLoading />;
  }
  if (isError) {
    <ErrorState error={error} onRetry={refetch} />;
  }
  if (!data) {
    return null;
  }
  const { data: stats } = data;
  console.log('stats', stats);

  const STATS_ARRAY = [
    {
      label: 'Total Transactions',
      value: formatNumber(stats.total ?? 0),
      color: 'text-[#22c55e] bg-[#22c55e1a]',
      icon: History,
    },
    {
      label: 'Total Volume (30d)',
      value: formatAmount(stats.totalThisMonth ?? 0),
      color: 'text-[#ffc005] bg-[#ffc0051a]',
      icon: ArrowLeftRight,
    },
    {
      label: 'Active Accounts',
      value: formatNumber(stats.totalCustomers ?? 0),
      color: 'text-[#3c82f6] bg-[#3c82f61a]',
      icon: Users,
    },
    {
      label: 'Misdirected Payments',
      value: formatNumber(stats.misdirectedCount ?? 0),
      color: 'text-[#ef4444] bg-[#ef44441a]',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STATS_ARRAY.map(stat => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shadow-md',
                  stat.color,
                )}
              >
                <stat.icon />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className=" flex flex-col gap-0.5 text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionStats;
