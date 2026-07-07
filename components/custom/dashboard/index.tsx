'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MyTransactionsTable from '../transaction/transaction-table';
import TransactionStats from '../transaction/transaction-stats';
import AccountCard from './hero';

const DashboardComponent = () => {
  return (
    <section className="wrapper space-y-6">
      <AccountCard />
      <TransactionStats />

      <Card>
        <CardHeader>
          <CardTitle>My Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <MyTransactionsTable slice={5} />
        </CardContent>
      </Card>
    </section>
  );
};

export default DashboardComponent;
