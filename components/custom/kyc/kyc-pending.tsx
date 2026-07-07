import { Card, CardContent } from '@/components/ui/card';
import { KycSubmissionType } from '@/types/kyc';
import { formatDateTime } from '@/utils/format-date';
import { Clock } from 'lucide-react';

const KycPending = ({ submission }: { submission: KycSubmissionType }) => (
  <Card className="max-w-md mx-auto">
    <CardContent className="py-10 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
        <Clock className="text-yellow-500" />
      </div>
      <h2 className="text-lg font-semibold">Under Review</h2>
      <p className="text-sm text-muted-foreground">
        Your KYC submission is being reviewed. This usually takes less than 24
        hours.
      </p>
      <p className="text-xs text-muted-foreground">
        Submitted {formatDateTime(new Date(submission.createdAt)).dateShort}
      </p>
    </CardContent>
  </Card>
);

export default KycPending;
