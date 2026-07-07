import { Card, CardContent } from '@/components/ui/card';
import { KYC_TIERS } from '@/lib/kyc';
import { formatAmount } from '@/utils';
import { Check } from 'lucide-react';

const KycComplete = () => {
  const { verified: limits } = KYC_TIERS;
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-10 text-center space-y-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'var(--color-brand-secondary)' }}
        >
          <Check className="text-white" />
        </div>
        <h2 className="text-lg font-semibold">Fully Verified</h2>
        <p className="text-sm text-muted-foreground">
          You have the highest KYC tier. Your current limits:
        </p>
        <div className="grid grid-cols-2 gap-3 text-left mt-4">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Per transaction</p>
            <p className="font-semibold text-sm mt-1">
              {formatAmount(limits.transactionLimit)}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Daily limit</p>
            <p className="font-semibold text-sm mt-1">
              {formatAmount(limits.dailyLimit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycComplete;
