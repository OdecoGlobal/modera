import { Card, CardContent } from '@/components/ui/card';

const KycRejected = ({ reason }: { reason: string }) => (
  <Card className="max-w-md mx-auto border-red-200 mb-4">
    <CardContent className="py-6 space-y-2">
      <div className="flex items-center gap-2 text-red-600">
        <i className="ti ti-alert-circle text-lg" />
        <h2 className="font-semibold">Submission Rejected</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Your previous submission was rejected. Please resubmit with the correct
        details.
      </p>
      <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
        <span className="font-medium">Reason: </span>
        {reason}
      </div>
    </CardContent>
  </Card>
);

export default KycRejected;
