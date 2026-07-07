'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyApiKey, useRevokeMyApiKey } from '@/query/use-api-key';
import ErrorState from '../states/error-state';
import EmptyState from '../states/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/utils/format-date';
import ConfirmationDialog from '../confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MyApiKeyComponent = () => {
  const { data, isPending, isError, error, refetch } = useGetMyApiKey();
  const { mutate, isPending: isRevoking } = useRevokeMyApiKey();
  // nva_7b5690c7f80d9a3e8a99871835b77ec8221ac75b04623d5485adb0b06a706dc4
  if (isPending) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data.data)
    return (
      <EmptyState description=" No API key yet. Generate one to start building." />
    );
  const { prefix, createdAt } = data.data;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <p className="text-sm font-mono text-muted-foreground">
              {prefix.padEnd(30, '•')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {formatDateTime(new Date(createdAt)).dateShort}
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
        </div>
        <div className="ml-auto w-fit">
          <ConfirmationDialog
            action={onSuccess => mutate(undefined, { onSuccess })}
            buttonVariant="destructive"
            label="Revoke Key"
            isPending={isRevoking}
            trigger={
              <Button variant="destructive" size="sm" disabled={isRevoking}>
                Revoke Key
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MyApiKeyComponent;
