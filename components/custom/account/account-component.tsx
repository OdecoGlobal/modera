'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useCloseMyAccount, useGetMyAccount } from '@/query/use-account';

import RenameAccountForm from './rename-account';
import CardLoading from '../loading/card-loading';
import ConfirmationDialog from '../confirmation-dialog';
import BackButton from '../back-btn';

const AccountSettingComponent = () => {
  const { data, isPending } = useGetMyAccount();

  const { mutate: close, isPending: isClosing } = useCloseMyAccount();

  if (isPending) {
    return <CardLoading />;
  }
  const account = data?.data.virtualAccount;
  if (!account) return null;
  const isClosed = account.status === 'closed';

  return (
    <div className="space-y-6">
      <BackButton />
      <header>
        <h1 className="h2-bold">Account Settings</h1>
        <p>Manage your virtual account</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your virtual account</CardDescription>
        </CardHeader>
        <CardContent>
          <RenameAccountForm account={account} isClosed={isClosed} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isClosed ? (
            <p className="text-sm text-muted-foreground text-center">
              This account is closed. No further payments can be received.
            </p>
          ) : (
            <>
              <h1 className="h3-bold text-destructive">Danger zone</h1>
              <p className="text-muted-foreground">
                Closing your account is permanent. Any payments sent to your
                account number after closure will be recorded as misdirected.
              </p>
              <div className="ml-auto w-fit">
                <ConfirmationDialog
                  buttonVariant="destructive"
                  label="Close account"
                  isPending={isClosing}
                  action={onSuccess =>
                    close(
                      {
                        ref: account.accountRef,
                        data: { reason: 'User requested account closure' },
                      },
                      { onSuccess },
                    )
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettingComponent;
