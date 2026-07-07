import TransactionStats from '@/components/custom/transaction/transaction-stats';
import MyTransactionsTable from '@/components/custom/transaction/transaction-table';
import { requireUser } from '@/lib/auth-guard';

const TransactionHistoryPage = async () => {
  await requireUser();
  return (
    <section className="space-y-6">
      <TransactionStats />
      <MyTransactionsTable />
    </section>
  );
};

export default TransactionHistoryPage;
