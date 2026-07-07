'use client';
import { useGetMyTransactionStats } from '@/query/use-transaction';
import CardLoading from '../loading/card-loading';
import ErrorState from '../states/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/utils';

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

  return (
    <>
      {stats && (
        <Card>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                This month
              </p>
              <p className="text-xl font-semibold mt-2">
                {formatAmount(stats.totalThisMonth ?? 0)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Transactions
              </p>
              <p className="text-xl font-semibold mt-2">{stats.total ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Misdirected
              </p>
              <p
                className="text-xl font-semibold mt-2"
                style={{
                  color: stats.misdirectedCount ? '#ef4444' : undefined,
                }}
              >
                {stats.misdirectedCount ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TransactionStats;
