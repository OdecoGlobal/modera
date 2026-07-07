'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyKycSubmission } from '@/query/use-kyc';
import ErrorState from '../states/error-state';
import EmptyState from '../states/empty-state';
import KycComplete from './kyc-complete';
import KycPending from './kyc-pending';
import KycBasicForm, { BasicKycComponent } from './forms/basic';
import KycVerifiedForm, { VerifiedKycComponent } from './forms/verified';
import KycRejected from './forms/rejected';

const KycComponent = () => {
  const { data, isPending, isError, error, refetch } = useGetMyKycSubmission();
  if (isPending) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (!data) {
    return <EmptyState description="No pending kyc" />;
  }
  const { currentTier, submission } = data.data;

  if (currentTier === 'verified') {
    return <KycComplete />;
  }
  if (submission?.status === 'pending') {
    return <KycPending submission={submission} />;
  }
  if (submission?.status === 'rejected') {
    return (
      <>
        <KycRejected reason={submission.rejectionReason!} />
        {currentTier !== 'basic' && <KycBasicForm />}
        {currentTier === 'basic' && <KycVerifiedForm />}
      </>
    );
  }
  if (currentTier === 'unverified') return <BasicKycComponent />;
  if (currentTier === 'basic') return <VerifiedKycComponent />;
  return null;
};

export default KycComponent;
