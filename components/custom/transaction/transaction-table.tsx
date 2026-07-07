'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetMyTransactions } from '@/query/use-transaction';
import { TableSkeleton } from '../loading/table-skeleton';
import { EmptyTable } from '../states/empty-table';
import ErrorState from '../states/error-state';
import { formatDateTime } from '@/utils/format-date';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/utils';

const MyTransactionsTable = ({ slice }: { slice?: number }) => {
  const { data, isPending, isError, error, refetch } = useGetMyTransactions();

  if (isPending) {
    return (
      <Table>
        <TableSkeleton />
      </Table>
    );
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!data || data.data.length === 0) {
    return (
      <Table>
        <EmptyTable />
      </Table>
    );
  }
  const { data: transactions } = data;

  const sliced = slice ? transactions.slice(0, slice) : transactions;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payer&apos;s Name</TableHead>
          <TableHead>Payer&apos;s Bank</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Transaction Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sliced.map(tx => (
          <TableRow key={tx.id}>
            <TableCell>{tx.payerName ?? 'Unknown Sender'}</TableCell>
            <TableCell>{tx.payerBank ?? '-'}</TableCell>
            <TableCell>
              {formatDateTime(new Date(tx.createdAt)).dateShort}
            </TableCell>
            <TableCell
              className={cn(
                'capitalize',
                tx.status === 'misdirected' ? 'text-red-700' : 'text-green-700',
              )}
            >
              {tx.status}
            </TableCell>

            <TableCell>{formatAmount(tx.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MyTransactionsTable;
